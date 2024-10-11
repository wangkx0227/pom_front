<template>
  <div class="email_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="报表展示" name="report_mailing_list" v-if="ShowPermissions(report_mailing_url)">
          <component :is="reportMailingListComponent" v-if="activeName === 'report_mailing_list'"/>
        </el-tab-pane>
        <el-tab-pane label="邮箱配置" name="email_configure" v-if="ShowPermissions(email_configure_url)">
          <component :is="emailConfigureComponent" v-if="activeName === 'email_configure'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "NoOrderMatterView",
  data() {
    return {
      activeName: null,
      // 使用懒加载形式加载组件
      emailConfigureComponent: () => import("@/components/BusinessFunctionComponent/email_function/EmailConfigureModule"),
      reportMailingListComponent: () => import("@/components/BusinessFunctionComponent/email_function/ReportMailingListModule"),
      report_mailing_url:'business_function/report_email_config/',
      email_configure_url:'business_function/report_email_log/',
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
      if (this.ShowPermissions(this.report_mailing_url)) return 'report_mailing_list';
      if (this.ShowPermissions(this.email_configure_url)) return 'email_configure';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
