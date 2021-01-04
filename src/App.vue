<template>
	<div class="demo">
		<cl-crud @load="onLoad">
			<el-row>
				<cl-refresh-btn></cl-refresh-btn>
				<cl-add-btn></cl-add-btn>
				<cl-multi-delete-btn></cl-multi-delete-btn>
				<cl-query :list="query" @change="onQueryChange"></cl-query>
				<cl-flex1 />
				<cl-search-key
					field="name"
					v-model="keyword"
					@change="onKeywordChange"
					:field-list="fieldList"
				></cl-search-key>
			</el-row>

			<el-row>
				<cl-table :columns="columns"></cl-table>
			</el-row>
		</cl-crud>
	</div>
</template>

<script>
import { reactive } from "vue";

export default {
	setup() {
		const state = reactive({
			keyword: "",
			query: [
				{
					label: "男",
					value: 1
				},
				{
					label: "女",
					value: 2
				}
			],
			fieldList: [
				{
					label: "姓名",
					value: "name"
				},
				{
					label: "性别",
					value: "sex"
				}
			],
			columns: [
				{
					label: "#",
					type: "index"
				},
				{
					label: "姓名",
					prop: "name",
					align: "center"
				},
				{
					label: "收入",
					prop: "price",
					align: "center"
				},
				{
					label: "op",
					align: "center"
				}
			]
		});

		return state;
	},

	methods: {
		onLoad({ ctx }) {
			ctx.service({}).done();
		},

		onQueryChange(value) {
			console.log("query change", value);
		},

		onKeywordChange(value) {
			console.log("keyword change", value);
		}
	}
};
</script>
