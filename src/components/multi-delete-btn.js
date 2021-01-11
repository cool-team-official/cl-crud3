import { inject } from "vue";

export default {
	name: "cl-multi-delete-btn",
	setup(props, { slots }) {
		const { deleteMulti, getPermission, selection } = inject("crud");

		return () => {
			return (
				getPermission("delete") && (
					<el-button
						size="mini"
						type="danger"
						disabled={selection.length === 0}
						onClick={deleteMulti}>
						{slots.default ? slots.default() : "删除"}
					</el-button>
				)
			);
		};
	}
};
