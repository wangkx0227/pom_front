<template>
  <div class="no_order_work_log" v-loading="loading">
    <el-card class="box-card">
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
        <el-table :data="NoOrderWorkLogData" style="width: 100%">
          <el-table-column prop="index" label="#" align="center"></el-table-column>
          <el-table-column label="生成时间" align="center" prop="create_date">
          </el-table-column>
          <el-table-column label="生成状态" align="center">
            <template v-slot="{ row }">
              <el-tag v-if="row.exceptional === 0">正常</el-tag>
              <el-tag v-else type="danger">异常</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="生成事务总数" align="center">
            <template v-slot="{ row }">
              <el-tag>{{ row.matter_number }}条</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="正常数量" align="center">
            <template v-slot="{ row }">
              <el-tag>{{ row.right_number }}条</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="异常数量" align="center">
            <template v-slot="{ row }">
              <el-tag v-if="row.abnormal_number === 0">{{ row.abnormal_number }}条</el-tag>
              <el-tag v-else type="danger">{{ row.abnormal_number }}条</el-tag>
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
    </el-card>
  </div>
</template>

<script>
export default {
  name: "WorkLogModule",
  data() {
    return {
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      loading: false, // 数据加载样式
      NoOrderWorkLogData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 获取访问权限,不需要获取，当前接口只具有查询方法，其他没有
    };
  },
  created() {
    this.loading = true;
    this.getNoOrderWorkLogData();
  },
  methods: {
    // 获取用户的信息
    // 获取数据
    getNoOrderWorkLogData() {
      let get_url;
      if (!this.search_start_time) {
        get_url = `business_function/no_order_matter_logs/?page=${this.page}`;
      } else {
        get_url = `business_function/no_order_matter_logs/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.NoOrderWorkLogData = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.firmData = [];
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
      this.getNoOrderWorkLogData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getNoOrderWorkLogData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getNoOrderWorkLogData();
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
      this.getNoOrderWorkLogData();
    },
    // 重置
    reloadDate() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getNoOrderWorkLogData();
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
