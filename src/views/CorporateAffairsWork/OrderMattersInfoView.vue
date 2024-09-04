<template>
  <div class="order_info_list">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="订单事务" name="order_work">
          <component :is="OrderWorkComponent" v-if="activeName === 'order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="非订单事务" name="no_order_work">
          <component :is="NoOrderWorkComponent" v-if="activeName === 'no_order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="特殊事务" name="qc_work">
          <component :is="QcWorkComponent" v-if="activeName === 'qc_work'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "WorkInfoView",
  data() {
    return {
      activeName: "order_work",
      // 使用懒加载形式加载组件
      OrderWorkComponent: () => import("@/components/WorkInfoComponent/OrderWorkModule"),
      NoOrderWorkComponent: () => import("@/components/WorkInfoComponent/NoOrderWorkModule"),
      QcWorkComponent: () => import("@/components/WorkInfoComponent/QcWorkModule"),
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
