import { renderNode } from "@/utils/vnode";
import { isBoolean, throttle } from "@/utils";
import Screen from "@/mixins/screen";
import { h, nextTick } from "vue";

export default {
	name: "cl-dialog",

	props: {
		modelValue: {
			type: Boolean,
			default: false
		},
		title: {
			type: String,
			default: "对话框"
		},
		drag: {
			type: Boolean,
			default: true
		},
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		opList: {
			type: Array,
			default: () => ["fullscreen", "close"]
		},
		hiddenOp: Boolean
	},

	mixins: [Screen],

	emits: ["fullscreen-change"],

	data() {
		return {
			visible: false,
			isFullscreen: false
		};
	},

	watch: {
		fullscreen: {
			immediate: true,
			handler(val) {
				this.isFullscreen = val;
			}
		},

		isFullscreen: {
			immediate: true,
			handler(val) {
				this.setDialog();

				// Fullscreen change event
				this.$emit("fullscreen-change", val);

				if (this.crud) {
					this.crud.$emit("fullscreen-change");
				}
			}
		},

		modelValue: {
			immediate: true,
			handler(val) {
				this.visible = val;

				if (val) {
					this.dragEvent();
				} else {
					setTimeout(() => {
						this.changeFullscreen(false);
					}, 300);
				}
			}
		}
	},

	methods: {
		// Avoid double close event
		close() {
			this.visible = false;
			this.$emit("update:modelValue", false);
		},

		// Change dialog fullscreen status
		changeFullscreen(val) {
			this.isFullscreen = isBoolean(val) ? val : !this.isFullscreen;
		},

		setDialog() {
			nextTick(() => {
				const el = this.$el.querySelector(".el-dialog");

				if (el) {
					el.style.marginTop = 0;

					if (this.isFullscreen) {
						el.style = {
							top: 0,
							left: 0
						};
					} else {
						el.style.marginBottom = "50px";
						el.style.top = this.$attrs.top || "15vh";
					}

					// Set header cursor state
					el.querySelector(".el-dialog__header").style.cursor = this.isFullscreen
						? "text"
						: "move";
				}
			});
		},

		dragEvent() {
			nextTick(() => {
				const dlg = this.$el.querySelector(".el-dialog");
				const hdr = this.$el.querySelector(".el-dialog__header");

				if (!hdr) {
					return false;
				}

				hdr.onmousedown = e => {
					// Props
					const { fullscreen, top = "15vh" } = this.$attrs;

					// Body size
					const { clientWidth, clientHeight } = document.body;

					// Try drag
					const isDrag = (() => {
						if (fullscreen) {
							return false;
						}

						if (!this.drag) {
							return false;
						}

						// Determine height of the box is too large
						let marginTop = 0;

						if (["vh", "%"].some(e => top.includes(e))) {
							marginTop = clientHeight * (parseInt(top) / 100);
						}

						if (top.includes("px")) {
							marginTop = top;
						}

						if (dlg.clientHeight > clientHeight - 50 - marginTop) {
							return false;
						}

						return true;
					})();

					// Set header cursor state
					if (!isDrag) {
						return (hdr.style.cursor = "text");
					} else {
						hdr.style.cursor = "move";
					}

					// Distance
					const dis = {
						left: e.clientX - hdr.offsetLeft,
						top: e.clientY - hdr.offsetTop
					};

					// Calc left and top of the box
					const box = (() => {
						const { left, top } =
							dlg.currentStyle || window.getComputedStyle(dlg, null);

						if (left.includes("%")) {
							return {
								top: +clientHeight * (+top.replace(/\%/g, "") / 100),
								left: +clientWidth * (+left.replace(/\%/g, "") / 100)
							};
						} else {
							return {
								top: +top.replace(/\px/g, ""),
								left: +left.replace(/\px/g, "")
							};
						}
					})();

					// Screen limit
					const pad = 5;
					const minLeft = -(clientWidth - dlg.clientWidth) / 2 + pad;
					const maxLeft =
						(dlg.clientWidth >= clientWidth / 2
							? dlg.clientWidth / 2 - (dlg.clientWidth - clientWidth / 2)
							: dlg.clientWidth / 2 + clientWidth / 2 - dlg.clientWidth) - pad;

					const minTop = pad;
					const maxTop = clientHeight - dlg.clientHeight - pad;

					// Start move
					document.onmousemove = function(e) {
						let left = e.clientX - dis.left + box.left;
						let top = e.clientY - dis.top + box.top;

						if (left < minLeft) {
							left = minLeft;
						} else if (left >= maxLeft) {
							left = maxLeft;
						}

						if (top < minTop) {
							top = minTop;
						} else if (top >= maxTop) {
							top = maxTop;
						}

						// Set dialog top and left
						dlg.style.top = top + "px";
						dlg.style.left = left + "px";
					};

					// Clear event
					document.onmouseup = function() {
						document.onmousemove = null;
						document.onmouseup = null;
					};
				};
			});
		},

		renderHeader() {
			return this.hiddenOp ? null : (
				<div class="cl-dialog__header" onDblclick={this.changeFullscreen}>
					{/* title */}
					<span class="cl-dialog__title">{this.title}</span>
					{/* op button */}
					<div class="cl-dialog__headerbtn">
						{this.opList.map(vnode => {
							// Fullscreen
							if (vnode === "fullscreen") {
								// Hidden fullscreen btn
								if (this.screen === "xs") {
									return null;
								}

								// Show diff icon
								if (this.isFullscreen) {
									return (
										<button class="minimize" onClick={this.changeFullscreen}>
											<i class="el-icon-minus" />
										</button>
									);
								} else {
									return (
										<button class="maximize" onClick={this.changeFullscreen}>
											<i class="el-icon-full-screen" />
										</button>
									);
								}
							}
							// Close
							else if (vnode === "close") {
								return (
									<button class="close" onClick={this.close}>
										<i class="el-icon-close" />
									</button>
								);
							}
							// Custom node render
							else {
								return renderNode(vnode, {
									$scopedSlots: this.$slots
								});
							}
						})}
					</div>
				</div>
			);
		}
	},

	render() {
		const ElDialog = (
			<el-dialog
				custom-class={`${this.hiddenOp ? "hidden-header" : ""}`}
				show-close={false}
				v-model={this.visible}></el-dialog>
		);

		return (
			this.visible && (
				<div class="cl-dialog">
					{h(
						ElDialog,
						{
							...this.props,
							fullscreen: this.isFullscreen
						},
						{
							default: () => {
								return this.$slots.default ? this.$slots.default() : null;
							},
							title: () => {
								return this.renderHeader();
							},
							footer: () => {
								return this.$slots.footer ? this.$slots.footer() : null;
							}
						}
					)}
				</div>
			)
		);
	}
};
