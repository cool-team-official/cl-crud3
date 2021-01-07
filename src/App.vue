<template>
	<div class="demo">
		<cl-crud @load="onLoad">
			<el-row>
				<cl-refresh-btn></cl-refresh-btn>
				<cl-add-btn></cl-add-btn>
				<cl-multi-delete-btn></cl-multi-delete-btn>
				<cl-query :list="query" @change="onQueryChange"></cl-query>
				<cl-filter label="是否过滤">
					<el-switch v-model="selects.filter"></el-switch>
				</cl-filter>
				<el-button size="mini" @click="openForm">自定义表单</el-button>
				<el-button size="mini" @click="openDialog">自定义对话框</el-button>
				<cl-flex1 />
				<cl-search-key
					field="name"
					v-model="keyword"
					@change="onKeywordChange"
					:field-list="fieldList"
				></cl-search-key>
				<cl-adv-btn />
			</el-row>

			<el-row>
				<cl-table
					ref="table"
					:border="false"
					:columns="columns"
					:default-sort="{ prop: 'price', order: 'descending' }"
					row-key="id"
					@selection-change="onSelectionChange"
				>
					<template #column-name="{scope}"> ` {{ scope.row.name }} ` </template>

					<template #slot-btn>
						<el-button type="text" size="mini" @click="onClickTest">测试按钮</el-button>
					</template>

					<template #append>
						<p style="text-align: center;margin: 10px">Append</p>
					</template>

					<template #empty>
						自定义空态
					</template>
				</cl-table>
			</el-row>

			<el-row>
				<cl-pagination></cl-pagination>
			</el-row>

			<cl-upsert ref="upsert" :items="upsert.items"></cl-upsert>
			<cl-adv-search ref="advSearch" :items="adv.items"></cl-adv-search>
		</cl-crud>

		<!-- 自定义表单 -->
		<cl-form ref="form">
			<template #slot-input="{ scope }">
				<el-input v-model="scope.t2" placeholder="slot-*"></el-input>
			</template>
		</cl-form>

		<!-- 自定义对话框 -->
		<cl-dialog
			v-model="dialog.visible"
			:props="{
				'append-to-body': true,
				fullscreen: false
			}"
			@open="onOpen"
			@opened="onOpened"
			@close="onClose"
			@closed="onClosed"
		>
			<test />
		</cl-dialog>
	</div>
</template>

<script>
import { reactive, h, resolveComponent } from "vue";

const userList = [
	{
		id: 1,
		name: "刘一",
		process: 42.2,
		createTime: "2019年09月02日",
		price: 75.99,
		salesRate: 52.2,
		status: 1,
		images: ["https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/1.jpg"],
		children: [
			{
				id: 6,
				name: "刘二",
				process: 42.2,
				createTime: "2019年09月02日",
				price: 232.49,
				salesRate: 52.2,
				status: 1,
				images: [
					"https://cool-comm.oss-cn-shenzhen.aliyuncs.com/show/imgs/chat/avatar/1.jpg"
				]
			}
		]
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
			list: userList.slice((p.page - 1) * p.size, p.page * p.size),
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

const TestInput = {
	name: "test-input",

	render() {
		return 111;
	}
};

export default {
	components: {
		test: {
			render() {
				return Math.random();
			}
		}
	},

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
				{ type: "selection", align: "center", width: 60 },
				{
					label: "#",
					type: "index",
					align: "center"
				},
				{
					label: "多级表头",
					children: [
						{
							label: "姓名",
							prop: "name"
						}
					]
				},
				{
					label: "收入",
					prop: "price",
					align: "center",
					sortable: "custom"
				},
				{
					type: "op",
					align: "center",
					layout: ["edit", "delete", "slot-btn"]
				}
			],
			selects: {
				filter: true
			},
			dialog: {
				visible: false
			},
			upsert: {
				items: [
					{
						label: "姓名",
						prop: "name",
						component: {
							name: "el-input"
						},
						rules: {
							required: true,
							message: "姓名不能为空"
						}
					},
					{
						label: "是否显示存款",
						prop: "isPrice",
						flex: false,
						component: {
							name: "el-switch"
						}
					},
					{
						label: "存款",
						prop: "price",
						hidden: "@isPrice",
						component: {
							name: "el-input-number"
						},
						rules: {
							required: true,
							message: "存款不能为空"
						}
					}
				]
			},
			adv: {
				items: [
					{
						label: "输入框",
						prop: "v1",
						component: {
							name: "el-input"
						}
					},
					{
						label: "下拉框",
						prop: "v2",
						component: {
							name: "el-select",
							options: [
								{
									label: "选项1",
									value: 1
								},
								{
									label: "选项2",
									value: 2
								}
							]
						}
					}
				]
			}
		});

		return state;
	},

	methods: {
		onLoad({ ctx, app }) {
			ctx.service(testService).done();
			app.refresh({});
		},

		onQueryChange(value) {
			console.log("query change", value);
		},

		onKeywordChange(value) {
			console.log("keyword change", value);
		},

		onSelectionChange(selection) {
			console.log(selection);
		},

		onTest(d) {
			console.log(d);
		},

		onClickTest() {
			this.$refs["table"].clearSort();
		},

		openForm() {
			this.$refs["form"].open({
				props: {
					title: "自定义表单"
				},
				items: [
					{
						label: "标签名渲染",
						prop: "t1",
						component: {
							name: "el-input",
							placeholder: "el-input、el-date-picker、el-select..."
						},
						rules: {
							required: true,
							message: "姓名不能为空"
						}
					},
					{
						label: "插槽渲染",
						prop: "t2",
						component: {
							name: "slot-input"
						}
					}
				],
				on: {
					open() {
						console.log("cl-form open");
					},

					close(action, done) {
						console.log("cl-form close", action);
						done();
					},

					submit(data, { close, done }) {
						console.log(data);
						close();
					}
				}
			});
		},

		openDialog() {
			this.dialog.visible = !this.dialog.visible;
		},

		onOpen() {
			console.log("open");
		},

		onOpened() {
			console.log("opened");
		},

		onClose() {
			console.log("close");
		},

		onClosed() {
			console.log("closed");
		},

		onBeforeClose(done) {
			console.log("close before");
			done();
		}
	}
};
</script>

<style>
html,
body,
#app {
	height: 100%;
	width: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
}

p {
	padding: 0;
	margin: 0;
}
</style>

<style lang="scss" scoped>
.demo {
	height: 100vh;
}
</style>
