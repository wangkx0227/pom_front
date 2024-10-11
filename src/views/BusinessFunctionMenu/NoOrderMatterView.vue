<template>
  <div class="no_order_matter">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="事项规则" name="rule" v-if="ShowPermissions(rule_url)">
          <component :is="ruleComponent" v-if="activeName === 'rule'"/>
        </el-tab-pane>
        <el-tab-pane label="事项管理" name="work" v-if="ShowPermissions(no_order_matter_url)">
          <component :is="workComponent" v-if="activeName === 'work'"/>
        </el-tab-pane>
        <el-tab-pane label="事项生成记录" name="work_log"  v-if="ShowPermissions(no_order_matter_log_url)">
          <component :is="workLogComponent" v-if="activeName === 'work_log'"/>
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
      activeName: null,
      // 使用懒加载形式加载组件
      ruleComponent: () => import("@/components/BusinessFunctionComponent/no_order/RuleModule"),
      workComponent: () => import("@/components/BusinessFunctionComponent/no_order/NoOrderMatterModule"),
      workLogComponent: () => import("@/components/BusinessFunctionComponent/no_order/NoOrderMatterLogModule"),
      rule_url:'business_function/no_order_matter_rule/',
      no_order_matter_url:'business_function/no_order_matter/',
      no_order_matter_log_url:'business_function/no_order_matter_logs/',
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
      if (this.ShowPermissions(this.rule_url)) return 'rule';
      if (this.ShowPermissions(this.no_order_matter_url)) return 'work';
      if (this.ShowPermissions(this.no_order_matter_log_url)) return 'work_log';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
