<template>
  <div class="matter_changes">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事务查询" name="MatterQuery">
          <component :is="MatterQuery" v-if="activeName === 'MatterQuery'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "MatterQuery",
  data() {
    return {
      activeName: "MatterQuery",
      // 使用懒加载形式加载组件
      MatterQuery: () => import("@/components/BusinessFunctionComponent/matter_query/MatterQueryModule"),
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
</style>
