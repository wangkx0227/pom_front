<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="用户管理" name="user" v-if="ShowPermissions(user_url)">
          <component :is="userComponent" v-if="activeName === 'user'" />
        </el-tab-pane>
        <el-tab-pane label="关系管理" name="relationship"  v-if="ShowPermissions(relationship_url)">
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
      activeName: null,
      // 使用懒加载形式加载组件
      userComponent: () => import("@/components/BasicFunctionComponent/users/UserModule"),
      relationshipComponent: () => import("@/components/BasicFunctionComponent/users/RelationshipModule"),
      user_url:'users/info/',
      relationship_url:'users/user_relationship/',
    };
  },
  created() {
    this.permissions = JSON.parse(localStorage.getItem("api_permission_list"));
    this.activeName = this.initializeActiveName();
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
    // 权限判断
    ShowPermissions(url) {
      let status = false;
      let urlRegex = url.replace(/\//g, '\\/');
      let regex = new RegExp('^' + urlRegex + '$');
      this.permissions.some(item => {
        let api_url = item.api_url
        let apiUrlRegex = regex.test(api_url)
        if (apiUrlRegex) {
          status = true
        }
      })
      return status
    },
    initializeActiveName() {
      if (this.ShowPermissions(this.user_url)) return 'user';
      if (this.ShowPermissions(this.relationship_url)) return 'relationship';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
