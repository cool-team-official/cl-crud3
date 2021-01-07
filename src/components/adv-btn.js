export default {
	name: "cl-adv-btn",
	inject: ["crud"],
	props: {
		// el-button props
		props: Object
	},
	render() {
		return (
			<div class="cl-adv-btn">
				<el-button
					size="mini"
					onClick={this.crud.openAdvSearch}
					{...this.props}>
					<i class="el-icon-search" />
					{this.$slots.default ? this.$slots.default() : "高级搜索"}
				</el-button>
			</div>
		);
	}
};
