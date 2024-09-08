<template>
  <div class="order_info_list">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="部门事务" name="department">
          <component :is="DepartmentComponent" v-if="activeName === 'department'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "DepartmentView",
  data() {
    return {
      activeName: "department",
      // 使用懒加载形式加载组件
      DepartmentComponent: () => import("@/components/DepartmentComponent/DepartmentWorkModule"),
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
