import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/static/pombase.css"; //自适应静态文件
import axios from "@/api/request"; // 加工过的axios对象

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.use(ElementUI);
new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
