<template>
  <div class="roles_users">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="menuHandleClick">
        <el-tab-pane label="角色设置" name="roles">
          <component :is="frontComponent" v-if="activeName === 'roles'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "RoleUsersView",
  data() {
    return {
      activeName: "roles",
      // 使用懒加载形式加载组件
      frontComponent: () => import("@/components/BasicFunctionComponent/roles/RolesUserModule"),
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
@import url("@/static/convention.css");
</style>