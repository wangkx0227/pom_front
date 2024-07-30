<template>
  <div class="department_info">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事项规则" name="rule">
          <component :is="ruleComponent" v-if="activeName === 'rule'"/>
        </el-tab-pane>
        <el-tab-pane label="事务管理" name="work">
          <component :is="workComponent" v-if="activeName === 'work'"/>
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
      activeName: "rule",
      // 使用懒加载形式加载组件
      ruleComponent: () => import("@/components/BusinessFunctionComponent/no_order/RuleModule"),
      workComponent: () => import("@/components/BusinessFunctionComponent/no_order/WorkModule"),
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
