import { isArray } from "@/utils";
import { inject, reactive, watchEffect } from "vue";

export default {
	name: "cl-query",

	props: {
		value: null,
		list: {
			type: Array,
			required: true
		},
		field: {
			type: String,
			default: "query"
		},
		multiple: Boolean,
		callback: Function
	},

	emits: ["change"],

	setup(props, { emit }) {
		const { refresh } = inject("crud");

		const state = reactive({
			list: []
		});

		// Set query data
		const setList = () => {
			let arr = [];

			if (isArray(props.value)) {
				arr = props.value;
			} else {
				arr = [props.value];
			}

			if (!props.multiple) {
				arr.splice(1);
			}

			// Default active
			state.list = (props.list || []).map(e => {
				e.active = arr.some(v => v === e.value);
				return e;
			});
		};

		// select item
		const selectItem = (event, item) => {
			if (item.active) {
				item.active = false;
			} else {
				if (props.multiple) {
					item.active = true;
				} else {
					state.list.map(e => {
						e.active = e.value == item.value;
					});
				}
			}

			// Filter active
			const selection = state.list.filter(e => e.active).map(e => e.value);
			// Handle multiple
			const value = props.multiple ? selection : selection[0];

			// Callback or request refresh
			if (props.callback) {
				props.callback(value);
			} else {
				refresh({
					[props.field]: value
				});

				emit("change", value);
			}

			// Stop
			event.preventDefault();
		};

		// watch props.value and props.list
		watchEffect(() => {
			setList();
		});

		return () => {
			return (
				<div class="cl-query">
					{state.list.map((item, index) => {
						return (
							<button
								class={{ "is-active": item.active }}
								key={index}
								onClick={event => {
									selectItem(event, item);
								}}>
								<span>{item.label}</span>
							</button>
						);
					})}
				</div>
			);
		};
	}
};
