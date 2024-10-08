<template>
    <div class="delay_order_info_list">
        <el-card class="box-card">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="延期事务" name="delay">
              <component :is="DelayComponent" v-if="activeName === 'delay'"/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
</template>

<script>
export default {
name: "DelayWorkView",
data() {
    return {
      activeName: "delay",
      // 使用懒加载形式加载组件
      DelayComponent: () => import("@/components/DelayComponent/DelayWorkModule"),
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
@import url("@/static/convention.css");
@media screen and (max-width: 700px) {
  .delay_order_info_list .box-card{
    height: 73vh;
  }
}
</style>
