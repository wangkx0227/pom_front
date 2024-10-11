<template>
  <div class="order_info_list">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="订单事务" name="order_work" v-if="ShowPermissions(q_w_url)">
          <component :is="OrderWorkComponent" v-if="activeName === 'order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="非订单事务" name="no_order_work"  v-if="ShowPermissions(n_q_w_url)">
          <component :is="NoOrderWorkComponent" v-if="activeName === 'no_order_work'"/>
        </el-tab-pane>
        <el-tab-pane label="特殊事务" name="qc_work" v-if="ShowPermissions(s_w_url)">
          <component :is="SpecialWorkComponent" v-if="activeName === 'qc_work'"/>
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
      activeName: null,
      // 使用懒加载形式加载组件
      permissions: [], // 存储列表
      OrderWorkComponent: () => import("@/components/WorkInfoComponent/OrderWorkModule"),
      NoOrderWorkComponent: () => import("@/components/WorkInfoComponent/NoOrderWorkModule"),
      SpecialWorkComponent: () => import("@/components/WorkInfoComponent/SpecialWorkModule"),
      q_w_url: 'work/order_matter_list/', // 订单事务url
      n_q_w_url: 'work/no_order_matter_list/', //  非订单事务url
      s_w_url: 'work/special_matter_list/', // 特殊事件url
    };
  },
  created() {
    this.permissions = JSON.parse(localStorage.getItem("api_permission_list"));
    this.activeName = this.initializeActiveName();
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
    // 权限判断
    ShowPermissions(url) {
      let status = false;
      let urlRegex = url.replace(/\//g, '\\/');
      let regex = new RegExp('^' + urlRegex + '$');
      this.permissions.some(item => {
        let api_url = item.api_url
        let apiUrlRegex = regex.test(api_url)
        if (apiUrlRegex) {
          status = true
        }
      })
      return status
    },
    initializeActiveName() {
      if (this.ShowPermissions(this.q_w_url)) return 'order_work';
      if (this.ShowPermissions(this.n_q_w_url)) return 'no_order_work';
      if (this.ShowPermissions(this.s_w_url)) return 'qc_work';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/date.css");
@import url("@/static/convention.css");

@media screen and (max-width: 700px) {
  .order_info_list .box-card {
    height: 158vw;
  }
}
</style>
