<template>
  <div class="user_list_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="菜单管理" name="front" v-if="ShowPermissions(font_url)">
          <component :is="frontComponent" v-if="activeName === 'front'" />
        </el-tab-pane>
        <el-tab-pane label="接口权限管理" name="api" v-if="ShowPermissions(api_url)">
          <component :is="apiComponent" v-if="activeName === 'api'" />
        </el-tab-pane>
        <el-tab-pane label="接口访问方法" name="method" v-if="ShowPermissions(method_url)">
          <component :is="requestMethodComponent" v-if="activeName === 'method'" />
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
      activeName: null,
      // 使用懒加载形式加载组件
      frontComponent: () => import("@/components/BasicFunctionComponent/menu_routes/frontMenuRoutesModule"),
      apiComponent: () => import("@/components/BasicFunctionComponent/menu_routes/apiMenuRoutesModule"),
      requestMethodComponent: () => import("@/components/BasicFunctionComponent/menu_routes/apiRequestMethodModule"),
      font_url:'routes/front_menu/',
      api_url:'routes/front_menu/',
      method_url:'routes/api_method/',
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
      if (this.ShowPermissions(this.font_url)) return 'front';
      if (this.ShowPermissions(this.api_url)) return 'api';
      if (this.ShowPermissions(this.method_url)) return 'method';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
