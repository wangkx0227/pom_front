<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="用户管理" name="user">
          <component :is="userComponent" v-if="activeName === 'user'" />
        </el-tab-pane>
        <el-tab-pane label="关系管理" name="relationship">
          <component :is="relationshipComponent" v-if="activeName === 'relationship'" />
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
      activeName: "user",
      // 使用懒加载形式加载组件
      userComponent: () => import("@/components/BasicFunctionComponent/users/UserModule"),
      relationshipComponent: () => import("@/components/BasicFunctionComponent/users/RelationshipModule"),
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
