import { inject, reactive, watch, computed, watchEffect } from 'vue'

export default {
	name: "cl-search-key",

	props: {
		// Bind value
		value: [String, Number],
		// Selected field
		field: {
			type: String,
			default: "keyWord"
		},
		// Field list
		fieldList: {
			type: Array,
			default: () => []
		},
		// Hook by search { params, { mext } }
		onSearch: Function,
		// Placeholder
		placeholder: {
			type: String,
			default: "请输入关键字"
		}
	},

	emits: ['input', 'change', 'search'],

	setup(props, { emit }) {
		const { refresh } = inject('crud')

		const state = reactive({
			field: null,
			value: ''
		})

		watchEffect(() => {
			state.field = props.field
			state.value = props.value
		})

		// Options List
		const elOptions = computed(() => {
			return props.fieldList.map((e, i) => {
				return <el-option key={i} label={e.label} value={e.value} />;
			});
		})

		// Enter search
		const onKeyup = ({ keyCode }) => {
			if (keyCode === 13) {
				toSearch();
			}
		}

		// To search
		const toSearch = () => {
			let params = {};

			props.fieldList.forEach((e) => {
				params[e.value] = null;
			});

			const next = (params2) => {
				refresh({
					page: 1,
					...params,
					[state.field]: state.value,
					...params2
				});

				emit('search', state)
			};

			if (props.onSearch) {
				props.onSearch(params, { next });
			} else {
				next();
			}
		}

		// Input
		const onInput = (val) => {
			emit("input", val);
			emit("change", val);
		}

		// Watch field change
		const onFieldChange = () => {
			emit("field-change", state.field);
			onInput("");
			state.value = "";
		}

		return () => {
			return (
				<div class="cl-search-key">
					<el-select
						class="cl-search-key__select"
						filterable
						size="mini"
						v-model={state.field}
						v-show={elOptions.value.length > 0}
						on-change={onFieldChange}>
						{elOptions.value}
					</el-select>

					<el-input
						class="cl-search-key__input"
						v-model={state.value}
						placeholder={props.placeholder}
						nativeOnKeyup={onKeyup}
						onInput={onInput}
						clearable
						size="mini"
					/>

					<el-button
						class="cl-search-key__button"
						type="primary"
						size="mini"
						onClick={toSearch}>
						搜索
					</el-button>
				</div>
			);
		}
	}
};
