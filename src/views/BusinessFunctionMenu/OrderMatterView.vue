<template>
  <div class="order_matter">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事项匹配规则" name="order_rule"  v-if="ShowPermissions(order_rule_url)">
          <component :is="OrderRuleComponent" v-if="activeName === 'order_rule'"/>
        </el-tab-pane>
        <el-tab-pane label="事务列表管理" name="order_work"  v-if="ShowPermissions(order_work_url)">
          <component :is="OrderWorkComponent" v-if="activeName === 'order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="订单录入记录" name="order_record"  v-if="ShowPermissions(order_record_url)">
          <component :is="OrderRecordComponent" v-if="activeName === 'order_record'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "OrderMatterView",
  data() {
    return {
      activeName: null,
      // 使用懒加载形式加载组件
      OrderRuleComponent: () => import("@/components/BusinessFunctionComponent/order/OrderRuleModule"),
      OrderWorkComponent: () => import("@/components/BusinessFunctionComponent/order/OrderMatterModule"),
      OrderRecordComponent: () => import("@/components/BusinessFunctionComponent/order/OrderRecordInfoModule"),
      order_rule_url:'business_function/order_matter_rule/',
      order_work_url:'business_function/order_matter/',
      order_record_url:'business_function/order_record_info/',
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
      if (this.ShowPermissions(this.order_rule_url)) return 'order_rule';
      if (this.ShowPermissions(this.order_work_url)) return 'order_work';
      if (this.ShowPermissions(this.order_record_url)) return 'order_record';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
