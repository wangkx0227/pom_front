import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: '跟路径',
    meta: { title: "跟路径" },
    redirect: { name: "login" },
  },
  {
    path: "/login",
    name: "login",
    meta: { title: "登录" },
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/404",
    name: "404",
    meta: { title: "错误页面：资源错误" },
    component: () => import("@/views/ErroeViews/404.vue")
  },
  {
    path: "/500",
    name: "500",
    meta: { title: "错误页面：接口错误" },
    component: () => import("@/views/ErroeViews/500.vue")
  },
  {
    path: "/index",
    name: "index",
    redirect: { name: "dashboard_info" },
    meta: { title: "首页" },
    component: () => import("@/views/IndexView.vue"),
    children: [
      {
        path: "dashboard_info", // 仪表盘页面
        name: "dashboard_info",
        component: () => import("@/views/CorporateAffairsWork/DashboardView.vue"),
        meta: { title: "仪表盘", 'icon': 'el-icon-pie-chart' },
      },
      {
        path: "work_info", // 事务页面
        name: "work_info",
        component: () => import("@/views/CorporateAffairsWork/WorkInfoView.vue"),
        meta: { title: "事务信息", 'icon': 'el-icon-date' },
      },
      {
        path: "supervise_info", // 监督页面
        name: "supervise_info",
        component: () => import("@/views/CorporateAffairsWork/WorkInfoView.vue"),
        meta: { title: "监督信息", 'icon': 'el-icon-tickets' },
      },
      {
        path: "departmental_info", // 部门事务页面
        name: "Departmental_info",
        component: () => import("@/views/CorporateAffairsWork/WorkInfoView.vue"),
        meta: { title: "部门事务", 'icon': 'el-icon-office-building' },
      },
      {
        path: "delayed_info", // 延期审核页面
        name: "delayed_info",
        component: () => import("@/views/CorporateAffairsWork/WorkInfoView.vue"),
        meta: { title: "延期审核事务", 'icon': 'el-icon-copy-document' },
      },
      {
        path: "user_info", // 用户登录后下拉菜单中的用户信息页面
        name: "user_info",
        component: () => import("@/views/UserDropdown/UserInfoView"),
        meta: { title: "个人页面" },
      },
    ],
  },

  {
    path: "/basic_function",
    name: "basic_function",
    meta: { title: "基础设置", 'icon': 'el-icon-user' },
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
        path: "front_menu", // 菜单权限管理页面
        name: "front_menu",
        component: () => import("@/views/BasicFunctionMenu/MenuInfoView.vue"),
        meta: { title: "菜单管理" },
      },
      {
        path: "user_roles", // 公司部门管理页面
        name: "user_roles",
        component: () => import("@/views/BasicFunctionMenu/RoleUsersView.vue"),
        meta: { title: "角色管理" },
      },
      {
        path: "users_access", // 公司部门管理页面
        name: "users_access",
        component: () => import("@/views/BasicFunctionMenu/UserAccessView.vue"),
        meta: { title: "用户访问查询" },
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
