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

const userList = [
	{
		id: 1,
		name: "刘一",
		process: 42.2,
		createTime: "2019年09月02日",
		price: 75.99,
		salesRate: 52.2,
		status: 1,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/1.jpg"]
	},
	{
		id: 2,
		name: "陈二",
		process: 35.2,
		createTime: "2019年09月05日",
		price: 242.1,
		salesRate: 72.1,
		status: 1,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/2.jpg"]
	},
	{
		id: 3,
		name: "张三",
		process: 10.2,
		createTime: "2019年09月12日",
		price: 74.11,
		salesRate: 23.9,
		status: 0,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/3.jpg"]
	},
	{
		id: 4,
		name: "李四",
		process: 75.5,
		createTime: "2019年09月13日",
		price: 276.64,
		salesRate: 47.2,
		status: 0,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/4.jpg"]
	},
	{
		id: 5,
		name: "王五",
		process: 25.4,
		createTime: "2019年09月18日",
		price: 160.23,
		salesRate: 28.3,
		status: 1,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/5.jpg"]
	}
];

const testService = {
	page: p => {
		console.log("GET[page]", p);
		return Promise.resolve({
			list: userList,
			pagination: {
				page: p.page,
				size: p.size,
				total: 5
			}
		});
	},
	info: d => {
		console.log("GET[info]", d);
		return new Promise(resolve => {
			resolve({
				id: 1,
				name: "icssoa",
				price: 100,
				ids: "0,3,2"
			});
		});
	},
	add: d => {
		console.log("POST[add]", d);
		return Promise.resolve();
	},
	delete: d => {
		console.log("POST[delete]", d);
		return Promise.resolve();
	},
	update: d => {
		console.log("POST[update]", d);
		return Promise.resolve();
	}
};

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
		onLoad({ ctx, app }) {
			ctx.service(testService).done();
			app.refresh();
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
