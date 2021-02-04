import { deepMerge, isFunction, cloneDeep, throttle } from "@/utils";
import { renderNode } from "@/utils/vnode";
import Form from "@/utils/form";
import Parse from "@/utils/parse";
import Screen from "@/mixins/screen";
import { h, nextTick } from "vue";

export default {
	name: "cl-form",
	componentName: "ClForm",
	mixins: [Screen],
	props: {
		// Bind value
		modeValue: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	emits: ["update:modelValue"],
	data() {
		return {
			visible: false,
			saving: false,
			loading: false,
			form: {},
			conf: {
				on: {
					open: null,
					submit: null,
					close: null
				},
				props: {
					fullscreen: false,
					"close-on-click-modal": false,
					"destroy-on-close": true
				},
				op: {
					hidden: false,
					saveButtonText: "保存",
					closeButtonText: "取消",
					layout: ["close", "save"]
				},
				hdr: {
					hidden: false,
					opList: ["fullscreen", "close"]
				},
				items: [],
				_data: {}
			}
		};
	},
	watch: {
		modeValue: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
			}
		},
		form: {
			immediate: true,
			handler(val) {
				this.$emit("update:modelValue", val);
			}
		}
	},
	created() {
		Form.inject.call(this, {
			form: this.form,
			scope: "conf."
		});
	},
	methods: {
		open(options = {}) {
			// Merge conf
			for (let i in this.conf) {
				if (i == "items") {
					this.conf.items = cloneDeep(options.items || []);
				} else {
					deepMerge(this.conf[i], options[i]);
				}
			}

			// Show dialog
			this.visible = true;

			// Preset form
			if (options.form) {
				for (let i in options.form) {
					this.form[i] = options.form[i];
				}
			}

			// Set form data by items
			this.conf.items.map(e => {
				if (e.prop) {
					// Priority use form data
					this.form[e.prop] = this.form[e.prop] || cloneDeep(e.value);
				}
			});

			// Open callback
			const { open } = this.conf.on;

			if (open) {
				this.closed = false;

				nextTick(() => {
					open(this.form, {
						close: this.close,
						submit: this.submit,
						done: this.done
					});
				});
			}
		},

		beforeClose() {
			if (this.conf.on.close) {
				this.conf.on.close(this.close);
			} else {
				this.close()
			}
		},

		close() {
			this.visible = false;
			this.clear();
			this.done();
		},

		done() {
			this.saving = false;
		},

		clear() {
			this.$refs["form"].resetFields();
			this.clearForm();
		},

		submit() {
			// Validate form
			this.$refs["form"].validate(async valid => {
				if (valid) {
					this.saving = true;

					// Hooks event
					const { submit } = this.conf.on;

					// Hooks by onSubmit
					if (isFunction(submit)) {
						let d = cloneDeep(this.form);

						// Filter hidden data
						this.conf.items.forEach(e => {
							if (e._hidden) {
								delete d[e.prop];
							}
						});

						submit(d, {
							done: this.done,
							close: () => {
								this.close(true)
							}
						});
					} else {
						console.error("on[submit] is not found");
					}
				}
			});
		},

		showLoading() {
			this.loading = true;
		},

		hiddenLoading() {
			this.loading = false;
		},

		collapseItem(item) {
			if (item.collapse !== undefined) {
				item.collapse = !item.collapse;
			}
		},

		formRender() {
			const { props, items } = this.conf;

			// el-form-item list
			const List = items.map((e, i) => {
				// Is hidden
				e._hidden = Parse("hidden", {
					value: e.hidden,
					scope: this.form,
					data: this.conf._data
				});

				if (e._hidden) {
					return null;
				}

				// Is flex
				if (e.flex === undefined) {
					e.flex = true;
				}

				return (
					<el-col span={24} {...e}>
						{e.component &&
							h(
								<el-form-item></el-form-item>,
								{
									label: e.label,
									prop: e.prop,
									rules: e.rules,
									...e.props
								},
								{
									/* Redefine label */
									label: () => {
										return (
											<span
												onClick={() => {
													this.collapseItem(e);
												}}>
												{e.label}
											</span>
										);
									},
									/* Component */
									default: () => {
										return (
											<div class="cl-form-item">
												{["prepend", "component", "append"].map(name => {
													return (
														e[name] && (
															<div
																v-show={!e.collapse}
																class={[
																	`cl-form-item__${name}`,
																	{
																		"is-flex": e.flex
																	}
																]}>
																{renderNode(e[name], {
																	prop: e.prop,
																	scope: this.form,
																	slots: this.$slots
																})}
															</div>
														)
													);
												})}

												{/* Collapse button */}
												<div
													class="cl-form-item__collapse"
													v-show={e.collapse}
													onClick={() => {
														this.collapseItem(e);
													}}>
													<el-divider content-position="center">
														点击展开，查看更多
														<i class="el-icon-arrow-down"></i>
													</el-divider>
												</div>
											</div>
										);
									}
								}
							)}
					</el-col>
				);
			});

			// el-row
			const ElRow = (
				<el-row gutter={10} v-loading={this.loading}>
					{List}
				</el-row>
			);

			// el-form
			const ElForm = (
				<el-form
					ref="form"
					class="cl-form"
					size="small"
					label-width="100px"
					label-position={this.isFullscreen ? "top" : ""}
					disabled={this.saving}
					model={this.form}>
					{ElRow}
				</el-form>
			);

			return h(ElForm, props);
		},

		footerRender() {
			const { hidden, layout, saveButtonText, closeButtonText } = this.conf.op;
			const { size = "small" } = this.conf.props;

			return (
				!hidden &&
				layout.map(vnode => {
					if (vnode == "save") {
						return (
							<el-button
								size={size}
								type="success"
								disabled={this.loading}
								loading={this.saving}
								onClick={this.submit}>
								{saveButtonText}
							</el-button>
						);
					} else if (vnode == "close") {
						return (
							<el-button
								size={size}
								onClick={this.beforeClose}>
								{closeButtonText}
							</el-button>
						);
					} else {
						return renderNode(vnode, {
							scope: this.form,
							slots: this.$slots
						});
					}
				})
			);
		}
	},

	render() {
		const { props, hdr } = this.conf;
		const ClDialog = <cl-dialog v-model={this.visible}></cl-dialog>;

		return (
			<div class="cl-form">
				{h(
					ClDialog,
					{
						opList: hdr.opList,
						title: props.title,
						props: {
							...props,
							'before-close': this.conf.on.close
						},
					},
					{
						default: () => {
							return <div class="cl-form__container">{this.formRender()}</div>;
						},
						footer: () => {
							return <div class="cl-form__footer">{this.footerRender()}</div>;
						}
					}
				)}
			</div>
		);
	}
};
