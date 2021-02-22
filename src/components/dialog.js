import { renderNode } from "@/utils/vnode";
import { isBoolean, isArray } from "@/utils";
import Screen from "@/mixins/screen";
import { h, nextTick } from "vue";

export default {
	name: "cl-dialog",

	props: {
		// Bind value
		modelValue: {
			type: Boolean,
			default: false
		},
		// title
		title: {
			type: String,
			default: "对话框"
		},
		// el-dialog props
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// Dialog is drag
		drag: {
			type: Boolean,
			default: true
		},
		// rt op btns
		opList: {
			type: Array,
			default: () => ["fullscreen", "close"]
		},
		// Hidden op
		hiddenOp: {
			type: Boolean,
			default: false
		}
	},

	mixins: [Screen],

	emits: ["fullscreen-change", "open", "opened", "close", "closed", "update:modelValue"],

	data() {
		return {
			fullscreen: false,
			visible: false
		};
	},

	watch: {
		"props.fullscreen": {
			immediate: true,
			handler(val) {
				this.fullscreen = val;
			}
		},

		fullscreen: {
			handler(val) {
				this.setDialog();
				this.$emit("fullscreen-change", val);
			}
		},

		modelValue: {
			immediate: true,
			handler(val) {
				this.visible = val;
			}
		}
	},

	computed: {
		fullscreen2() {
			return this.isFullscreen ? true : this.fullscreen;
		}
	},

	methods: {
		beforeClose() {
			if (this.props['before-close']) {
				this.props['before-close'](this.close)
			} else {
				this.close()
			}
		},

		close() {
			this.$emit("update:modelValue", false);
		},

		onOpen() {
			this.setDialog();
			this.setDrag();
			this.$emit("open");
		},

		onOpened() {
			this.$emit("opened");
		},

		onClose() {
			this.$emit("close");
			this.close();
			this.fullscreen = this.props.fullscreen || false;
		},

		onClosed() {
			this.$emit("closed");
		},

		// Change dialog fullscreen status
		changeFullscreen(val) {
			this.fullscreen = isBoolean(val) ? val : !this.fullscreen;
		},

		// Double click set fullscreen
		dblClickFullscreen() {
			if (isArray(this.opList) && this.opList.includes('fullscreen')) {
				this.changeFullscreen()
			}
		},

		// Get el-dialog element
		getEl() {
			const dlg = document.querySelector(`.cl-dialog--${this.$.uid}`);
			const hdr = dlg.querySelector(".el-dialog__header");

			return {
				dlg,
				hdr
			};
		},

		// Set dialog position
		setDialog() {
			nextTick(() => {
				const { dlg, hdr } = this.getEl();

				if (dlg) {
					dlg.style.left = 0;

					if (this.fullscreen2) {
						dlg.style.top = 0;
						dlg.style.marginBottom = 0;
					} else {
						dlg.style.marginBottom = "50px";
						dlg.style.top = this.props.top || "15vh";
					}

					// Set header cursor state
					hdr.style.cursor = this.fullscreen2 ? "text" : "move";
				}
			});
		},

		// Set dialog drag
		setDrag() {
			nextTick(() => {
				const { dlg, hdr } = this.getEl();

				if (!hdr) {
					return false;
				}

				hdr.onmousedown = e => {
					// Props
					const { top = "15vh" } = this.$attrs;

					// Body size
					const { clientWidth, clientHeight } = document.body;

					// Try drag
					const isDrag = (() => {
						if (this.fullscreen2) {
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
								top: +clientHeight * (+top.replace(/%/g, "") / 100),
								left: +clientWidth * (+left.replace(/%/g, "") / 100)
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
					document.onmousemove = function (e) {
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
					document.onmouseup = function () {
						document.onmousemove = null;
						document.onmouseup = null;
					};
				};
			});
		},

		// Render dialog header
		renderHeader() {
			return this.hiddenOp ? null : (
				<div class="cl-dialog__header" onDblclick={this.dblClickFullscreen}>
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
								if (this.fullscreen2) {
									return (
										<button type='button' class="minimize" onClick={this.changeFullscreen}>
											<i class="el-icon-minus" />
										</button>
									);
								} else {
									return (
										<button type='button' class="maximize" onClick={this.changeFullscreen}>
											<i class="el-icon-full-screen" />
										</button>
									);
								}
							}
							// Close
							else if (vnode === "close") {
								return (
									<button type='button' class="close" onClick={this.beforeClose}>
										<i class="el-icon-close" />
									</button>
								);
							}
							// Custom node render
							else {
								return renderNode(vnode, {
									$slots: this.$slots
								});
							}
						})}
					</div>
				</div>
			);
		}
	},

	render() {
		const { default: body, footer } = this.$slots;

		const ElDialog = (
			<el-dialog
				ref="dialog"
				title={this.title}
				onOpen={this.onOpen}
				onOpened={this.onOpened}
				onClose={this.onClose}
				onClosed={this.onClosed}
				show-close={false}
				v-model={this.visible}></el-dialog>
		);

		const customClass = [
			"cl-dialog",
			`cl-dialog--${this.$.uid}`,
			this.hiddenOp ? "hidden-header" : "",
			this.props.customClass || this.props["custom-class"]
		].join(" ");

		return <div>
			{
				h(
					ElDialog,
					{
						...this.props,
						customClass,
						fullscreen: this.fullscreen2,
					},
					{
						default: () => {
							return body ? body() : null;
						},
						title: () => {
							return this.renderHeader();
						},
						footer: () => {
							return footer ? footer() : null;
						}
					}
				)
			}
		</div>
	}
};
