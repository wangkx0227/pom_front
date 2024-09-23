<template>
  <div class="notice">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="公告管理" name="notice">
          <component :is="NoticeComponent" v-if="activeName === 'notice'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "NoticeView",
  data() {
    return {
      activeName: "notice",
      // 使用懒加载形式加载组件
      NoticeComponent: () => import("@/components/BasicFunctionComponent/notice/NoticeModule"),
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