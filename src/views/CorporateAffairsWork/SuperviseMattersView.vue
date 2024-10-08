<template>
  <div class="supervise_info_list">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="订单事务" name="supervise">
          <component :is="SuperviseInfoComponent" v-if="activeName === 'supervise'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SuperviseMattersView",
  data() {
    return {
      activeName: "supervise",
      // 使用懒加载形式加载组件
      SuperviseInfoComponent: () => import("@/components/SuperviseInfoComponent/SuperviseWorkModule"),
    };
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
  },
}
</script>

<style scoped>
@import url("@/static/date.css");
@import url("@/static/convention.css");
@media screen and (max-width: 700px) {
  .delay_order_info_list .box-card{
    height: 73vh;
  }
}
</style>
