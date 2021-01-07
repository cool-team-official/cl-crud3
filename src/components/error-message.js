export default {
	name: "cl-error-message",

	props: {
		title: String
	},

	setup(props) {
		return () => {
			return <el-alert title={props.title} type="error"></el-alert>;
		};
	}
};
