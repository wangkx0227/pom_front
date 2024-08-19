<template>
  <div class="order_matter">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事项匹配规则" name="order_rule">
          <component :is="OrderRuleComponent" v-if="activeName === 'order_rule'"/>
        </el-tab-pane>
        <el-tab-pane label="事务列表管理" name="order_work">
          <component :is="OrderWorkComponent" v-if="activeName === 'order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="订单录入记录" name="order_record">
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
      activeName: "order_rule",
      // 使用懒加载形式加载组件
      OrderRuleComponent: () => import("@/components/BusinessFunctionComponent/order/OrderRuleModule"),
      OrderWorkComponent: () => import("@/components/BusinessFunctionComponent/order/OrderWorkModule"),
      OrderRecordComponent: () => import("@/components/BusinessFunctionComponent/order/OrderRecordInfoModule"),
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
