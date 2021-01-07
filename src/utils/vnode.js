import { isFunction, isString, cloneDeep, isObject } from "./index";
import { __inst, __plugins, __vue } from "../options";
import { getCurrentInstance, h, resolveComponent } from "vue";

/**
 * Parse JSX, filter params
 * @param {*} vnode
 * @param {{scope,prop,children}} options
 */
const parse_jsx = (vnode, options = {}) => {
	const { scope, prop, slots, children } = options;

	// Use slot
	if (vnode.name.indexOf("slot-") == 0) {
		let rn = slots[vnode.name];

		if (rn) {
			return rn({ scope });
		} else {
			return <cl-error-message title={`组件渲染失败，未找到插槽：${vnode.name}`} />;
		}
	}

	// Use component
	if (vnode.render) {
		const { ctx } = getCurrentInstance();

		if (!ctx.$root.$options.components[vnode.name]) {
			ctx.$component(vnode.name, cloneDeep(vnode));
		}
	}

	// Avoid loop update
	let data = cloneDeep(vnode);

	if (scope) {
		// Add input event
		data.modelValue = scope[prop];
		data['onUpdate:modelValue'] = function (val) {
			scope[prop] = val;
		};
	}

	return h(resolveComponent(vnode.name), data, {
		default: () => {
			return children
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

		if (vnode.type) {
			vnode.name = vnode.type;
		}

		if (vnode.name) {
			// Handle general component
			if (["el-select", "el-radio-group", "el-checkbox-group"].includes(vnode.name)) {
				// Append component children
				const children = (vnode.options || []).map((e, i) => {
					switch (vnode.name) {
						// el-select
						case "el-select":
							let label, value;

							if (isString(e)) {
								label = value = e;
							} else if (isObject(e)) {
								label = e.label;
								value = e.value;
							} else {
								return (
									<cl-error-message title={`组件渲染失败，options 参数错误`} />
								);
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

						// el-radio
						case "el-radio-group":
							return (
								<el-radio
									{...{
										key: i,
										label: e.value,
										...e.props
									}}>
									{e.label}
								</el-radio>
							);

						// el-checkbox
						case "el-checkbox-group":
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

						default:
							return null;
					}
				});

				return parse_jsx(vnode, { prop, scope, children });
			} else {
				return parse_jsx(vnode, { prop, scope, slots });
			}
		} else {
			return <cl-error-message title={`组件渲染失败，组件 name 不能为空`} />;
		}
	}
}
