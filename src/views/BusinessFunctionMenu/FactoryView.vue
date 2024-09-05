<template>
  <div class="factory">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="工厂信息" name="factory">
          <component :is="factoryComponent" v-if="activeName === 'factory'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "FactoryView",
  data() {
    return {
      activeName: "factory",
      // 使用懒加载形式加载组件
      factoryComponent: () => import("@/components/BusinessFunctionComponent/factory/FactoryBindUserModule"),
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
