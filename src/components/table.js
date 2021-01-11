import { renderNode } from "@/utils/vnode";
import { isNull, cloneDeep } from "@/utils";
import { h, inject, nextTick } from "vue";

export default {
	name: "cl-table",

	props: {
		columns: {
			type: Array,
			required: true,
			default: () => []
		},
		props: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},

	inject: ["crud"],

	data() {
		return {
			maxHeight: null,
			data: []
		};
	},

	created() {
		// Window resize
		this.$mitt.on("crud.resize", () => {
			this.calcMaxHeight();
		});

		// Crud refresh
		this.$mitt.on("crud.refresh", ({ list }) => {
			this.data = list;
		});
	},

	mounted() {
		this.setDefaultSort();
		this.calcMaxHeight();
		this.bindMethods();
	},

	methods: {
		// Set sort and append to request params
		setDefaultSort() {
			// Get default sort
			const { order, prop } = this.$attrs["default-sort"] || this.props["default-sort"] || {};

			// Set request params
			this.crud.params.order = !order ? "" : order === "descending" ? "desc" : "asc";
			this.crud.params.prop = prop;
		},

		// Render el-table-column
		renderColumn() {
			const { getPermission, rowEdit, rowDelete } = inject("crud");

			return this.columns
				.filter(e => !e.hidden)
				.map((item, index) => {
					// el-table-column
					const ElTableColumn = (
						<el-table-column key={`crud-table-column-${index}`}></el-table-column>
					);

					// Op
					if (item.type === "op") {
						return h(
							ElTableColumn,
							{
								label: "操作",
								width: "160px",
								...item
							},
							{
								default: scope => {
									const render = () => {
										return (item.layout || ["edit", "delete"]).map(vnode => {
											if (["edit", "update", "delete"].includes(vnode)) {
												// Get permission
												const perm = getPermission(vnode);

												if (perm) {
													let clickEvent = () => {};
													let buttonText = null;

													switch (vnode) {
														case "edit":
														case "update":
															clickEvent = rowEdit;
															buttonText = "编辑";
															break;
														case "delete":
															clickEvent = rowDelete;
															buttonText = "删除";
															break;
													}

													return (
														<el-button
															size="mini"
															type="text"
															onClick={() => {
																clickEvent(scope.row);
															}}>
															{buttonText}
														</el-button>
													);
												}
											} else {
												// Use custom render
												return renderNode(vnode, {
													scope,
													slots: this.$slots
												});
											}
										});
									};

									return <div class="cl-table__op">{render()}</div>;
								}
							}
						);
					}
					// Index, Expand, Selection
					else if (["selection", "index", "expand"].includes(item.type)) {
						return h(ElTableColumn, item);
					}
					// Default
					else {
						const deep = item => {
							let props = cloneDeep(item);

							// Cannot set property children of #<Element>
							delete props.children;

							return h(ElTableColumn, props, {
								default: scope => {
									// If children
									if (item.children) {
										return <div>{item.children.map(deep)}</div>;
									}

									// Scope data
									let newScope = {
										...scope,
										...item
									};

									// Value
									let value = scope.row[item.prop];

									// Column-slot
									let slot = this.$slots[`column-${item.prop}`];

									if (slot) {
										// Use slot
										return slot({
											scope: newScope
										});
									} else {
										// If component
										if (item.component) {
											return renderNode(item.component, {
												prop: item.prop,
												scope: newScope.row
											});
										}
										// Formatter
										else if (item.formatter) {
											return item.formatter(
												newScope.row,
												newScope.column,
												newScope.row[item.prop],
												newScope.$index
											);
										}
										// Dict el-tag
										else if (item.dict) {
											const data = item.dict.find(d => d.value == value);

											if (data) {
												const ElTag = (
													<el-tag
														disable-transitions
														size="small"
														effect="dark"></el-tag>
												);

												// Use el-tag
												return h(ElTag, data, {
													default() {
														return data.label;
													}
												});
											} else {
												return value;
											}
										}
										// Empty text
										else if (isNull(value)) {
											return scope.emptyText;
										}
										// Value
										else {
											return value;
										}
									}
								},
								header: scope => {
									let slot = this.$slots[`header-${item.prop}`];

									if (slot) {
										return slot({
											scope
										});
									} else {
										return scope.column.label;
									}
								}
							});
						};

						return deep(item);
					}
				});
		},

		// Set sort
		changeSort(prop, order) {
			if (order === "desc") {
				order = "descending";
			}

			if (order === "asc") {
				order = "ascending";
			}

			this.$refs["table"].sort(prop, order);
		},

		// Watch sort change and request refresh
		sortChange({ prop, order }) {
			if (order === "descending") {
				order = "desc";
			}

			if (order === "ascending") {
				order = "asc";
			}

			if (!order) {
				prop = null;
			}

			if (this.crud.test.sortLock) {
				this.crud.refresh({
					prop,
					order,
					page: 1
				});
			}
		},

		// Watch selection change
		selectionChange(selection) {
			this.$mitt.emit("table.selection-change", selection);
		},

		// Calc el-table max-height
		calcMaxHeight() {
			if (!this.crud.$el) {
				return false;
			}

			const box = this.crud.$el.parentNode;

			return nextTick(() => {
				if (box) {
					let rows = box.querySelectorAll(".cl-crud .el-row");

					if (!rows[0] || !rows[0].isConnected) {
						return false;
					}

					let h = 20;

					for (let i = 0; i < rows.length; i++) {
						let f = true;

						for (let j = 0; j < rows[i].childNodes.length; j++) {
							if ((rows[i].childNodes[j].className || "").includes("cl-table")) {
								f = false;
							}
						}

						if (f) {
							h += rows[i].clientHeight + 10;
						}
					}

					let h1 = Number(String(this.$attrs.height || 0).replace("px", ""));
					let h2 = box.clientHeight - h;

					this.maxHeight = h1 > h2 ? h1 : h2;
				}
			});
		},

		// Bind el-table methods
		bindMethods() {
			[
				"clearSelection",
				"toggleRowSelection",
				"toggleAllSelection",
				"toggleRowExpansion",
				"setCurrentRow",
				"clearSort",
				"clearFilter",
				"doLayout",
				"sort"
			].forEach(e => {
				this[e] = this.$refs["table"][e];
			});
		}
	},

	render() {
		const { empty, append } = this.$slots;
		const { loading } = inject("crud");

		const ElTable = (
			<el-table
				class="cl-table"
				ref="table"
				border
				size="mini"
				v-loading={loading}
				data={this.data}></el-table>
		);

		return h(
			ElTable,
			{
				onSelectionChange: this.selectionChange,
				onSortChange: this.sortChange,
				maxHeight: this.maxHeight,
				...this.props
			},
			{
				default: () => {
					return this.renderColumn();
				},
				empty: () => {
					return empty ? empty(this) : null;
				},
				append: () => {
					return append ? append(this) : null;
				}
			}
		);
	}
};
