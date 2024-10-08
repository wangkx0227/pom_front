<template>
  <div class="message">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="未读消息" name="unread">
          <component :is="unreadComponent" v-if="activeName === 'unread'"/>
        </el-tab-pane>
        <el-tab-pane label="已读消息" name="read">
          <component :is="readComponent" v-if="activeName === 'read'"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "MessageView",
  data() {
    return {
      activeName: "unread",
      // 使用懒加载形式加载组件
      unreadComponent: () => import("@/components/DropdownComponent/message/UNReadModule"),
      readComponent: () => import("@/components/DropdownComponent/message/ReadModule"),
    };
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
  },
}
</script>

<style>
@import url("@/static/convention.css");
.table_content_button{
  float: right;
  margin-right: 45px;
}
@media screen and (max-width: 700px) {
  .table_content_button{
    float: right;
    margin-right: 0;
  }
  .message .box-card{
    height: 73vh;
  }
}
</style>
