<template>
  <div class="matter_changes">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事项信息" name="MatterInfo">
          <component :is="MatterInfo" v-if="activeName === 'MatterInfo'"/>
        </el-tab-pane>
        <el-tab-pane label="变更记录" name="MatterRecord">
          <component :is="MatterChangeRecordLog" v-if="activeName === 'MatterRecord'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
name: "MatterChanges",
  data() {
    return {
      activeName: "MatterInfo",
      // 使用懒加载形式加载组件
      MatterInfo: () => import("@/components/BusinessFunctionComponent/matter_changes/MatterInfoModule"),
      MatterChangeRecordLog: () => import("@/components/BusinessFunctionComponent/matter_changes/MatterChangeRecordLogModule"),
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
