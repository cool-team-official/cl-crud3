import { getCurrentInstance, h, inject, onMounted, reactive } from "vue";

export default {
	name: "cl-pagination",

	setup() {
		const { refresh } = inject("crud");
		const mitt = inject("mitt");

		const state = reactive({
			total: 0,
			currentPage: 1,
			pageSize: 20
		});

		const onCurrentChange = index => {
			refresh({
				page: index
			});
		};

		const onSizeChange = size => {
			refresh({
				page: 1,
				size
			});
		};

		const setPagination = res => {
			if (res) {
				state.currentPage = res.currentPage || res.page || 1;
				state.pageSize = res.pageSize || res.size || 20;
				state.total = res.total | 0;
			}
		};

		mitt.on("crud.refresh", ({ pagination }) => {
			setPagination(pagination);
		});

		return () => {
			const ElPagination = (
				<el-pagination
					background
					page-sizes={[10, 20, 30, 40, 50, 100]}
					layout={"total, sizes, prev, pager, next, jumper"}></el-pagination>
			);

			return h(ElPagination, {
				total: state.total,
				"current-page": state.currentPage,
				"page-size": state.pageSize,
				onSizeChange,
				onCurrentChange
			});
		};
	}
};
