import * as comps from "./components";
import Crud from "./components/crud";
import mitt from "mitt";

import "./common";

export const CRUD = {
	install(app, options) {
		const { crud } = options || {};

		app.component("cl-crud", Crud({ __crud: crud }));

		app.provide('mitt', mitt())
		app.provide('op', {
			component: app.component
		})

		for (let i in comps) {
			app.component(comps[i].name, comps[i]);
		}
	}
};

export default CRUD;
