<template>
  <div class="matter_changes">
    <el-card class="box-card">
      <el-tabs v-model="activeName" @tab-click="handleClick" >
        <el-tab-pane label="事项信息" name="MatterInfo" v-if="ShowPermissions(matter_info_url)">
          <component :is="MatterInfo" v-if="activeName === 'MatterInfo'"/>
        </el-tab-pane>
        <el-tab-pane label="变更记录" name="MatterRecord" v-if="ShowPermissions(matter_change_record_log_url)">
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
      activeName: null,
      // 使用懒加载形式加载组件
      MatterInfo: () => import("@/components/BusinessFunctionComponent/matter_changes/MatterInfoModule"),
      MatterChangeRecordLog: () => import("@/components/BusinessFunctionComponent/matter_changes/MatterChangeRecordLogModule"),
      matter_info_url:'business_function/matter_changes/',
      matter_change_record_log_url:'business_function/matter_changes_record_log/',
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
      if (this.ShowPermissions(this.matter_info_url)) return 'MatterInfo';
      if (this.ShowPermissions(this.matter_change_record_log_url)) return 'MatterRecord';
      return ''; // 如果没有权限，返回空字符串或其他默认值
    }
  },
}
</script>

<style scoped>
@import url("@/static/convention.css");
</style>
