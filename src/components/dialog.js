import { renderNode } from "@/utils/vnode";
import { isBoolean } from "@/utils";
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
			isFullscreen: false,
			visible: false
		};
	},

	watch: {
		"props.fullscreen": {
			immediate: true,
			handler(val) {
				this.isFullscreen = val;
			}
		},

		isFullscreen: {
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

	methods: {
		// Avoid double close event
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
			this.isFullscreen = this.props.fullscreen || false;
		},

		onClosed() {
			this.$emit("closed");
		},

		// Change dialog fullscreen status
		changeFullscreen(val) {
			this.isFullscreen = isBoolean(val) ? val : !this.isFullscreen;
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

					if (this.isFullscreen) {
						dlg.style.top = 0;
						dlg.style.marginBottom = 0;
					} else {
						dlg.style.marginBottom = "50px";
						dlg.style.top = this.props.top || "15vh";
					}

					// Set header cursor state
					hdr.style.cursor = this.isFullscreen ? "text" : "move";
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

		// Render dialog header
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

		return h(
			ElDialog,
			{
				...this.props,
				customClass,
				fullscreen: this.isFullscreen
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
		);
	}
};
