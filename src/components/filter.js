export default {
	name: "cl-filter",
	props: {
		label: String
	},
	render() {
		return (
			<div class="cl-filter">
				<span class="cl-filter__label" v-show={this.label}>
					{this.label}
				</span>

				{this.$slots.default ? this.$slots.default() : null}
			</div>
		);
	}
};
