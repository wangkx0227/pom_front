<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="一级菜单管理" name="role">
          <component :is="Level1Component" v-if="activeName === 'one'"/>
        </el-tab-pane>
        <el-tab-pane label="二级菜单管理" name="user">
          <component :is="Level2Component" v-if="activeName === 'two'"/>
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
      activeName: "role",
      // 使用懒加载形式加载组件
      Level1Component: () => import("@/components/BasicFunctionComponent/front_menu/Level_1_MenuModule"),
      Level2Component: () => import("@/components/BasicFunctionComponent/front_menu/Level_2_MenuModule"),
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
@import url("@/static/currency.css");
</style>
