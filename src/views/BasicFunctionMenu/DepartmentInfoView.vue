<template>
  <div class="department_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="部门管理" name="second" v-if="ShowPermissions(second_url)">
          <component :is="secondComponent" v-if="activeName === 'second'"/>
        </el-tab-pane>
        <el-tab-pane label="职务管理" name="duties" v-if="ShowPermissions(duties_url)">
          <component :is="dutiesComponent" v-if="activeName === 'duties'"/>
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
      activeName: null,
      // 使用懒加载形式加载组件
      permissions: [], // 存储列表
      // 使用懒加载形式加载组件
      secondComponent: () => import("@/components/BasicFunctionComponent/department/DepartmentModule"),
      dutiesComponent: () => import("@/components/BasicFunctionComponent/department/PositionModule"),
      second_url:'foundation/department/',
      duties_url:'foundation/position/',
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
      if (this.ShowPermissions(this.second_url)) return 'second';
      if (this.ShowPermissions(this.duties_url)) return 'duties';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
