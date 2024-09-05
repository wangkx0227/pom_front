<template>
  <div class="department_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="部门管理" name="second">
          <component :is="secondComponent" v-if="activeName === 'second'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "DepartmentInfoView",
  data() {
    return {
      activeName: "second",
      // 使用懒加载形式加载组件
      secondComponent: () => import("@/components/BasicFunctionComponent/department/DepartmentModule"),
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
