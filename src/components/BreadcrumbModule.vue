<template>
  <div
    class="breadcrumb"
    style="margin-top: 5px; margin-left: 5px; z-index: 999"
  >
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="(val, key) in breadList" :key="key">{{
        val.meta.title
      }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
// 面包屑组件
export default {
  name: "BreadcrumbModule",
  data() {
    return {
      breadList: [], // 路由集合
    };
  },
  watch: {
    $route() {
      this.getBreadcrumb();
    },
  },
  methods: {
    isHome(route) {
      return route.name === "index";
    },
    getBreadcrumb() {
      let matched = this.$route.matched;
      //如果不是首页
      if (!this.isHome(matched[0])) {
        matched = [{ meta: { title: "首页" } }].concat(matched);
      }
      this.breadList = matched;
    },
  },
  created() {
    this.getBreadcrumb();
  },
};
</script>

<style scoped></style>
