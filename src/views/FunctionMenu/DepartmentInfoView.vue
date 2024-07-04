<template>
  <div class="department_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="公司管理" name="first">
          <component :is="firstComponent" v-if="activeName === 'first'" />
        </el-tab-pane>
        <el-tab-pane label="部门管理" name="second">
          <component :is="secondComponent" v-if="activeName === 'second'" />
        </el-tab-pane>
        <el-tab-pane label="账户前缀管理" name="third">
          <component :is="thirdComponent" v-if="activeName === 'third'" />
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
      activeName: "first",
      // 使用懒加载形式加载组件
      firstComponent: () => import("@/components/department/FirmModule"),
      secondComponent: () => import("@/components/department/DepartmentModule"),
      thirdComponent: () => import("@/components/department/PrefixModule"),
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
.el-card {
  height: 810px;
}

@media screen and (max-width: 700px) {
  .el-card {
    height: 680px;
  }

  .el-tabs__item.is_top {
    font-size: 12px !important;
  }
}
</style>
