export default {
	name: "cl-flex1",
	setup(props, { slots }) {
		return () => {
			return <div class="cl-flex1">{slots.default ? slots.default() : null}</div>;
		};
	}
};
