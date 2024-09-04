<template>
  <div class="access">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="用户访问记录" name="users_access">
          <component :is="frontComponent" v-if="activeName === 'users_access'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
// 角色对应权限菜单的的展示弹窗
export default {
  name: "UsersAccessView",
  data() {
    return {
      activeName: "users_access",
      // 使用懒加载形式加载组件
      frontComponent: () => import("@/components/BasicFunctionComponent/users_access/UsersAccessView"),
    };
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
  },
}
</script>

<style>
@import url("@/static/convention.css");
</style>