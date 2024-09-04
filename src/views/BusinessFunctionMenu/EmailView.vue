<template>
  <div class="email_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="报表展示" name="report_mailing_list">
          <component :is="reportMailingListComponent" v-if="activeName === 'report_mailing_list'"/>
        </el-tab-pane>
        <el-tab-pane label="邮箱配置" name="email_configure">
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
      activeName: "report_mailing_list",
      // 使用懒加载形式加载组件
      emailConfigureComponent: () => import("@/components/BusinessFunctionComponent/email_function/EmailConfigureModule"),
      reportMailingListComponent: () => import("@/components/BusinessFunctionComponent/email_function/ReportMailingListModule"),
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
