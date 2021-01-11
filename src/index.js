import * as comps from "./components";
import Crud from "./components/crud";
import mitt from "mitt";

import "./common";

export const CRUD = {
	install(app, options) {
		const { crud } = options || {};

		app.config.globalProperties.$mitt = mitt();
		app.config.globalProperties.$component = app.component;

		app.component("cl-crud", Crud({ __crud: crud }));

		for (let i in comps) {
			app.component(comps[i].name, comps[i]);
		}
	}
};

export default CRUD;
