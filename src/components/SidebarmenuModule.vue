<template>
  <el-menu
      router
      class="el-menu-vertical-demo"
      :default-active="activeIndex"
      @open="handleOpen"
      @close="handleClose"
  >
    <el-menu-item index="/index/dashboard_info/">
      <i class="el-icon-pie-chart"></i>
      <template v-slot:title>
        <span>仪表盘</span>
      </template>
    </el-menu-item>
    <el-menu-item index="/index/work_info/">
      <i class="el-icon-date"></i>
      <template v-slot:title>
        <span>事务信息</span>
      </template>
    </el-menu-item>
    <el-menu-item index="/index/supervise_info/">
      <i class="el-icon-tickets"></i>
      <template v-slot:title>
        <span>监督信息</span>
      </template>
    </el-menu-item>
    <el-menu-item index="/index/departmental_info/">
      <i class="el-icon-office-building"></i>
      <template v-slot:title>
        <span>部门事务</span>
      </template>
    </el-menu-item>
    <el-menu-item index="/index/delayed_info/">
      <i class="el-icon-copy-document"></i>
      <template v-slot:title>
        <span>延期审核</span>
      </template>
    </el-menu-item>
    <el-submenu index="6">
      <template v-slot:title>
        <i class="el-icon-user"></i>
        <span>基础设置</span>
      </template>
      <el-menu-item index="/basic_function/department_info/">部门管理</el-menu-item>
      <el-menu-item index="/basic_function/user_list_info/">用户管理</el-menu-item>
      <el-menu-item index="/basic_function/user_roles/">角色管理</el-menu-item>
      <el-menu-item index="/basic_function/front_menu/">菜单管理</el-menu-item>
    </el-submenu>
    <el-submenu index="7">
      <template v-slot:title>
        <i class="el-icon-setting"></i>
        <span>功能设置</span>
      </template>
      <el-menu-item index="7-1">工厂绑定FMR</el-menu-item>
      <el-menu-item index="7-2">清单类型</el-menu-item>
      <el-menu-item index="7-3">清单详情</el-menu-item>
      <el-menu-item index="7-4">人员变更记录</el-menu-item>
      <el-menu-item index="7-5">登录统计</el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
export default {
  name: "SidebarMenuModule", // 侧边栏菜单
  data() {
    return {
      activeIndex: null,
      isCollapse: true,
      label: true,
    };
  },
  created() {
    // 处理菜单默认选中
    const menuUrl = localStorage.getItem("menuUrl");
    if (!menuUrl) {
      this.activeIndex = "/index/dashboard_info";
    } else {
      this.activeIndex = menuUrl;
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    changeUrl() {
      localStorage.setItem("menuUrl", this.$route.path);
    },
  },
  watch: {
    $route() {
      this.changeUrl();
    },
  },
};
</script>

<style scoped></style>
