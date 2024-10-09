<template>
  <el-menu
      router
      class="el-menu-vertical-demo"
      :default-active="activeIndex"
      unique-opened
  >
    <el-menu-item
        v-for="front in front_list"
        :key="front.id"
        :index="front.menu_url"
        v-if="front.binding.length === 0"
    >
      <template v-slot:title>
        <i :class="front.menu_url_icon"></i>
        <span>{{ front.menu_url_name }}</span>
      </template>
    </el-menu-item>
    <el-submenu
        v-for="front in front_list"
        :key="front.id"
        :index="front.menu_url"
        v-if="front.binding.length > 0"
    >
      <template v-slot:title>
        <i :class="front.menu_url_icon"></i>
        <span>{{ front.menu_url_name }}</span>
      </template>
      <el-menu-item
          v-for="key in front.binding"
          :key="key.id"
          :index="key.menu_url"
      >{{ key.menu_url_name }}
      </el-menu-item>
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
      front_list: [],
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
    this.front_list = JSON.parse(localStorage.getItem('front_list'))
  },
  methods: {
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
