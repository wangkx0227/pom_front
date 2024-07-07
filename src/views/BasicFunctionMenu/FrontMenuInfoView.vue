<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="menuHandleClick">
        <el-tab-pane label="菜单类型" name="type">
          <component :is="menuTypeComponent" v-if="activeName === 'type'"/>
        </el-tab-pane>
        <el-tab-pane label="菜单管理" name="menu">
          <component :is="menuComponent" v-if="activeName === 'menu'"/>
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
      activeName: "type",
      // 使用懒加载形式加载组件
      menuTypeComponent: () => import("@/components/BasicFunctionComponent/front_menu/menuTypeModule"),
      menuComponent: () => import("@/components/BasicFunctionComponent/front_menu/menuModule"),
    };
  },
  methods: {
    menuHandleClick(tab) {
      this.activeName = tab.name;
    },
  },
};
</script>

<style scoped>
@import url("@/static/currency.css");
</style>
