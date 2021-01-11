import { inject } from "vue";

export default {
	name: "cl-refresh-btn",
	setup(props, { slots }) {
		const { refresh } = inject("crud");

		return () => {
			return (
				<el-button
					{...{
						size: "mini",
						...props,
						onClick: refresh
					}}>
					{slots.default ? slots.default() : "刷新"}
				</el-button>
			);
		};
	}
};
