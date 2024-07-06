import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: { name: "login" },
  },
  {
    path: "/index",
    name: "index",
    redirect: { name: "dashboard_info" },
    meta: { title: "首页" },
    component: () => import("@/views/IndexView.vue"),
    children: [
      {
        path: "user_info", // 仪表盘页面
        name: "user_info",
        component: () => import("@/views/UserInfoView"),
        meta: { title: "个人页面" },
      },
      {
        path: "dashboard_info", // 仪表盘页面
        name: "dashboard_info",
        component: () => import("@/views/DashboardView.vue"),
        meta: { title: "仪表盘" },
      },
      {
        path: "work_info", // 事务页面
        name: "work_info",
        component: () => import("@/views/WorkInfoView.vue"),
        meta: { title: "事务信息" },
      },
      {
        path: "supervise_info", // 监督页面
        name: "supervise_info",
        component: () => import("@/views/WorkInfoView.vue"),
        meta: { title: "监督信息" },
      },
      {
        path: "departmental_info", // 部门事务页面
        name: "Departmental_info",
        component: () => import("@/views/WorkInfoView.vue"),
        meta: { title: "部门事务" },
      },
      {
        path: "delayed_info", // 延期审核页面
        name: "delayed_info",
        component: () => import("@/views/WorkInfoView.vue"),
        meta: { title: "延期审核事务" },
      },

    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/basic_function",
    name: "basic_function",
    meta: { title: "基础设置" },
    component: () => import("@/views/IndexView.vue"),
    children: [
      // 功能菜单类别
      {
        path: "department_info", // 公司部门管理页面
        name: "department_info",
        component: () => import("@/views/BasicFunctionMenu/DepartmentInfoView.vue"),
        meta: { title: "部门管理" },
      },
      {
        path: "user_list_info", // 公司部门管理页面
        name: "user_list_info",
        component: () => import("@/views/BasicFunctionMenu/UserListInfoView.vue"),
        meta: { title: "用户管理" },
      },
      {
        path: "front_menu", // 公司部门管理页面
        name: "front_menu",
        component: () => import("@/views/BasicFunctionMenu/FrontMenuInfoView.vue"),
        meta: { title: "菜单管理" },
      },
      {
        path: "user_roles", // 公司部门管理页面
        name: "user_roles",
        component: () => import("@/views/BasicFunctionMenu/RoleUsersView.vue"),
        meta: { title: "角色管理" },
      },
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  /* eslint-disable */
  base: process.env.BASE_URL,
  routes,
});
// 路由元信息设置网站title 路由守卫（检查当前是否处于登录状态，登录状态放行，非登录状态跳转登录）
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "POM"; // 设置页面标题
  const token = localStorage.getItem("token");
  if (to.name === "login") {
    if (token) {
      next({ name: "index" });
    } else {
      next();
    }
  } else {
    if (!token) {
      next({ name: "login" }); // 没有token就去登录
    } else {
      next();
    }
  }
});

export default router;
