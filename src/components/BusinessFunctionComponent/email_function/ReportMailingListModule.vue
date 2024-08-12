<template>
  <div class="report_email_log" v-loading="loading">
    <div class="head_search_add">
      <el-date-picker
          v-model="time_frame_list"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-right: 5px;">
      </el-date-picker>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="ReportEmailLogData" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="生成时间" align="center" prop="create_date">
        </el-table-column>
        <el-table-column label="报表类型" align="center">
          <template v-slot="{ row }">
            <el-tag v-if="row.is_type === 0">日报</el-tag>
            <el-tag v-else type="success">月报</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生成状态" align="center">
          <template v-slot="{ row }">
            <el-tag v-if="row.is_exceptional === 0" type="info">正常</el-tag>
            <el-tag v-else type="danger">异常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下载操作" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="text">下载</el-button>
          </template>
        </el-table-column>
        <el-table-column label="异常操作" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="text" v-if="ButtonDisplay(scope.row)" @click="saveRow(scope.row)">修复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage"
                     @next-click="nextPage" background layout="total,prev, pager, next" :page-size="10"
                     :total="data_total"
                     v-model:current-page="page">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReportMailingListModule",
  data() {
    return {
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      loading: false, // 数据加载样式
      ReportEmailLogData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,

    };
  },
  created() {
    this.loading = true;
    this.getReportEmailLogData();
  },
  methods: {
    // 获取数据
    getReportEmailLogData() {
      let get_url;
      if (!this.search_start_time) {
        get_url = `business_function/report_email_log/?page=${this.page}`;
      } else {
        get_url = `business_function/report_email_log/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.ReportEmailLogData = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.ReportEmailLogData = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.page_status = 0;
            this.loading = false;
          });
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getReportEmailLogData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getReportEmailLogData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getReportEmailLogData();
      }
    },
    // 搜索功能
    searchDate() {
      this.page = 1;
      this.loading = true;
      if (this.time_frame_list.length !== 0) {
        this.search_start_time = new Date(this.time_frame_list[0]).toISOString();
        this.search_end_time = new Date(this.time_frame_list[1]).toISOString();
      }
      this.getReportEmailLogData();
    },
    // 重置
    reloadDate() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getReportEmailLogData();
    },
    // 按钮根据特定值显示
    ButtonDisplay(row) {
      return !!row.is_exceptional;
    },
    // 修复功能,修改功能，重新将附件进行发送，并且修改当前记录的属性
    saveRow(row) {
      this.loading = true;
      this.$http
          .put("business_function/report_email_log/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getReportEmailLogData();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
          })
    },
  },
}
</script>
<style>
/*由于搜索框中的字样式不正确，强制修改*/
.head_search_add .el-date-editor .el-range-separator {
  padding: 0 !important;
}


</style>
