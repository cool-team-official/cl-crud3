import { inject } from "vue";

export default {
	name: "cl-add-btn",
	setup(props, { slots }) {
		const { rowAdd, getPermission } = inject("crud");

		return () => {
			return (
				getPermission("add") && (
					<el-button
						{...{
							size: "mini",
							type: "primary",
							...props,
							onClick: rowAdd
						}}>
						{slots.default ? slots.default() : "新增"}
					</el-button>
				)
			);
		};
	}
};
