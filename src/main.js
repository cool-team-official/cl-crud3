import { createApp, h } from "vue";
import App from "./App.vue";

// element-plus
import ElementPlus from "element-plus";
import locale from "element-plus/lib/locale/lang/zh-cn";
import "element-plus/lib/theme-chalk/index.css";

// cl-crud-next
import ClCrudNext from "./index";
import "./assets/css/index.scss";

createApp(App)
	.use(ElementPlus, { locale })
	.use(ClCrudNext)
	.mount("#app");
