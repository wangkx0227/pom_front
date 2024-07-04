<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="职位管理" name="role">
          <component :is="roleComponent" v-if="activeName === 'role'" />
        </el-tab-pane>
        <el-tab-pane label="用户管理" name="user">
          <component :is="userComponent" v-if="activeName === 'user'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "UserListInfoView",
  data() {
    return {
      activeName: "role",
      // 使用懒加载形式加载组件
      roleComponent: () => import("@/components/user/PositionModule"),
      userComponent: () => import("@/components/user/UserModule"),
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
