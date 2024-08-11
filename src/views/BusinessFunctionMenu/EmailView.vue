<template>
  <div class="email">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="邮箱配置" name="email_configure">
          <component :is="emailConfigureComponent" v-if="activeName === 'email_configure'"/>
        </el-tab-pane>
        <el-tab-pane label="日报" name="day_mailing_list">
          <component :is="dayMailingListComponent" v-if="activeName === 'day_mailing_list'"/>
        </el-tab-pane>
        <el-tab-pane label="月报" name="month_mailing_list">
          <component :is="MonthMailingListComponent" v-if="activeName === 'month_mailing_list'"/>
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
      activeName: "email_configure",
      // 使用懒加载形式加载组件
      emailConfigureComponent: () => import("@/components/BusinessFunctionComponent/email_function/EmailConfigureModule"),
      dayMailingListComponent: () => import("@/components/BusinessFunctionComponent/email_function/DayMailingListModule"),
      MonthMailingListComponent: () => import("@/components/BusinessFunctionComponent/email_function/MonthMailingListModule"),
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
</style>
