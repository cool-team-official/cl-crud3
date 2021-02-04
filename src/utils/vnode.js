import { isFunction, isString, isObject } from "./index";
import { h, resolveComponent } from "vue";

/**
 * Parse JSX, filter params
 * @param {*} vnode
 * @param {{scope,prop,children}} options
 */
const parse_jsx = (vnode, options) => {
	const { scope, prop, slots, } = options || [];

	// Use slot
	if (vnode.name.indexOf("slot-") == 0) {
		let rn = slots[vnode.name];

		if (rn) {
			return rn({ scope });
		} else {
			return <cl-error-message title={`组件渲染失败，未找到插槽：${vnode.name}`} />;
		}
	}

	// Avoid loop update
	let data = vnode;

	// Use component
	if (vnode.render) {
		const { component } = inject('op')

		if (!ctx.$root.$options.components[vnode.name]) {
			component(vnode.name, data);
		}
	}

	if (scope) {
		// Add input event
		data.modelValue = scope[prop];
		data["onUpdate:modelValue"] = function (val) {
			scope[prop] = val;
		};
	}

	return h(resolveComponent(vnode.name), data, {
		default: () => {
			return vnode._children;
		}
	});
};

/**
 * Render vNode
 * @param {*} vnode
 * @param {*} options
 */
export function renderNode(vnode, { prop, scope, slots }) {
	if (!vnode) {
		return null;
	}

	// When slot or tagName
	if (isString(vnode)) {
		return parse_jsx({ name: vnode }, { scope, slots });
	}

	// When customeize render function
	if (isFunction(vnode)) {
		return vnode({ scope, h });
	}

	// When jsx
	if (isObject(vnode)) {
		if (vnode.context) {
			return vnode;
		}

		if (vnode.name) {
			// Handle general component
			const keys = ["el-select", "el-radio-group", "el-checkbox-group"];

			if (keys.includes(vnode.name)) {
				// Append component children
				vnode._children = <div>
					{
						(vnode.options || []).map((e, i) => {
							if (vnode.name == "el-select") {
								let label, value;

								if (isString(e)) {
									label = value = e;
								} else if (isObject(e)) {
									label = e.label;
									value = e.value;
								} else {
									return <cl-error-message title={`组件渲染失败，options 参数错误`} />;
								}

								return (
									<el-option
										{...{
											key: i,
											label,
											value,
											...e.props
										}}
									/>
								);
							} else if (vnode.name == "el-radio-group") {
								return h(<el-radio key={i} label={e.value}></el-radio>, e.props, {
									default() {
										return <span>{e.label}</span>
									}
								})
							} else if (vnode.name == "el-checkbox-group") {
								return (
									<el-checkbox
										{...{
											key: i,
											label: e.value,
											...e.props
										}}>
										{e.label}
									</el-checkbox>
								);
							} else {
								return null;
							}
						})
					}
				</div>

				return parse_jsx(vnode, { prop, scope, });
			} else {
				return parse_jsx(vnode, { prop, scope, slots });
			}
		} else {
			return <cl-error-message title={`组件渲染失败，组件 name 不能为空`} />;
		}
	}
}
