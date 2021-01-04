import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import Crud from "./plugin";

createApp(App)
	.use(ElementPlus)
	.use(Crud)
	.mount("#app");
