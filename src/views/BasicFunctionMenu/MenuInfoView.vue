<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="菜单管理" name="front">
          <component :is="frontComponent" v-if="activeName === 'front'" />
        </el-tab-pane>
        <el-tab-pane label="接口权限管理" name="api">
          <component :is="apiComponent" v-if="activeName === 'api'" />
        </el-tab-pane>
        <el-tab-pane label="接口访问方法" name="method">
          <component :is="requestMethodComponent" v-if="activeName === 'method'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "FrontMenuInfoView",
  data() {
    return {
      activeName: "front",
      // 使用懒加载形式加载组件
      frontComponent: () => import("@/components/BasicFunctionComponent/menu_routes/frontMenuRoutesModule"),
      apiComponent: () => import("@/components/BasicFunctionComponent/menu_routes/apiMenuRoutesModule"),
      requestMethodComponent: () => import("@/components/BasicFunctionComponent/menu_routes/apiRequestMethodModule"),
    };
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
