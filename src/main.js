import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "@/static/pombase.css"; //自适应静态文件
Vue.config.productionTip = false;

// 全局默认值，url设置
axios.defaults.baseURL = "http://127.0.0.1:8000/api/v2/";
axios.defaults.timeout = 10000; // 超时时间

// axios请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 每次发起请求获取token，并且携带，没有就不携带后端报错
    const authorization = localStorage.getItem("authorization");
    const user_id = localStorage.getItem("user_id");
    if (authorization && user_id) {
      config.headers["Authorization"] = authorization;
      config.headers["X-User_Id"] = user_id;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// axios响应拦截器,错误处理拦截
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = "错误请求";
          break;
        case 401:
          if (!error.response.data.error) {
            error.message = "未授权，请重新登录";
          } else {
            error.message = error.response.data.error
          }
          window.localStorage.clear();
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          break;
        case 403:
          if (!error.response.data.error) {
            error.message = "拒绝访问";
          } else {
            error.message = error.response.data.error
          }
          break;
        case 404:
          error.message = "请求错误,未找到该资源";
          window.location.href = "/404";
          break;
        case 405:
          error.message = "请求方法未允许";
          break;
        case 408:
          error.message = "请求超时";
          break;
        case 500:
          error.message = "服务器端出错";
          // window.location.href = "/500";
          break;
        case 501:
          error.message = "网络未实现";
          break;
        case 502:
          error.message = "网络错误";
          break;
        case 503:
          error.message = "服务不可用";
          break;
        case 504:
          error.message = "网络超时";
          break;
        case 505:
          error.message = "http版本不支持该请求";
          break;
        default:
          error.message = `连接错误${error.response.status}`;
      }
    } else {
      // 超时处理
      if (JSON.stringify(error).includes("timeout")) {
        error.message = "服务器响应超时，请刷新当前页";
      } else {
        error.message = "连接服务器失败";
      }
    }
    return Promise.reject(error);
  },
);

Vue.prototype.$http = axios;
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
