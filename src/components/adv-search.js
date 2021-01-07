import { renderNode } from "@/utils/vnode";
import { cloneDeep } from "@/utils";
import Screen from "@/mixins/screen";
import Form from "@/utils/form";
import Parse from "@/utils/parse";

export default {
	name: "cl-adv-search",
	inject: ["crud"],
	props: {
		// Bind value
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// Form items
		items: {
			type: Array,
			default: () => []
		},
		// el-drawer props
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// Op button ['search', 'reset', 'clear', 'close']
		opList: {
			type: Array,
			default: () => ["search", "reset", "clear", "close"]
		},
		// Hooks by open { data, { next } }
		onOpen: Function,
		// Hooks by close { done }
		onClose: Function,
		// Hooks by search { data, { next, close } }
		onSearch: Function
	},
	mixins: [Screen],
	emits: ["open", "close", "reset", "clear"],
	data() {
		return {
			form: {},
			visible: false,
			saving: false,
			loading: false
		};
	},
	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
			}
		}
	},
	created() {
		this.$mitt.on("crud.open", this.open);
		this.$mitt.on("crud.close", this.close);

		Form.inject.call(this, {
			form: this.form
		});
	},
	methods: {
		// Open drawer
		open() {
			this.items.map(e => {
				if (this.form[e.prop] === undefined) {
					this.form[e.prop] = e.value;
				}
			});

			// Open event
			const next = data => {
				this.visible = true;

				if (data) {
					// Merge data
					Object.assign(this.form, data);
				}

				this.$emit("open", this.form);
			};

			if (this.onOpen) {
				this.onOpen(this.form, { next });
			} else {
				next(null);
			}
		},

		// Close drawer
		close() {
			// Close event
			const done = () => {
				this.visible = false;
				this.$emit("close");
			};

			if (this.onClose) {
				this.onClose(done);
			} else {
				done();
			}
		},

		// Reset data
		reset() {
			this.$refs["form"].resetFields();
			this.$emit("reset");
		},

		// Clear data
		clear() {
			this.clearForm();
			this.$emit("clear");
		},

		// Search data
		search() {
			const params = cloneDeep(this.form);

			// Search event
			const next = params => {
				this.crud.refresh({
					...params,
					page: 1
				});

				this.close();
			};

			if (this.onSearch) {
				this.onSearch(params, { next, close: this.close });
			} else {
				next(params);
			}
		},

		// Render form
		renderForm() {
			return (
				<el-form
					ref="form"
					class="cl-form"
					size="small"
					label-width="100px"
					label-position={this.isFullscreen ? "top" : ""}
					disabled={this.saving}
					model={this.form}
					{...this.props}>
					<el-row v-loading={this.loading}>
						{this.items.map((e, i) => {
							return (
								!Parse("hidden", {
									value: e.hidden,
									scope: this.form
								}) && (
									<el-col key={i} span={24} {...e}>
										<el-form-item {...e}>
											{renderNode(e.component, {
												prop: e.prop,
												scope: this.form,
												slots: this.$slots
											})}
										</el-form-item>
									</el-col>
								)
							);
						})}
					</el-row>
				</el-form>
			);
		}
	},

	render() {
		const ButtonText = {
			search: "搜索",
			reset: "重置",
			clear: "清空",
			close: "取消"
		};

		return (
			<div class="cl-adv-search">
				<el-drawer
					v-model={this.visible}
					title="高级搜索"
					direction="rtl"
					size={this.isFullscreen ? "100%" : "500px"}
					{...{
						...this.props,
						"onUpdate:visible": () => {
							this.close();
						}
					}}>
					<div class="cl-adv-search__container">{this.renderForm()}</div>

					<div class="cl-adv-search__footer">
						{this.opList.map(e => {
							if (ButtonText[e]) {
								return (
									<el-button
										{...{
											size: this.props.size || "small",
											type: e === "search" ? "primary" : null,
											onClick: this[e]
										}}>
										{ButtonText[e]}
									</el-button>
								);
							} else {
								return renderNode(e, {
									scope: this.form,
									slots: this.$slots
								});
							}
						})}
					</div>
				</el-drawer>
			</div>
		);
	}
};
