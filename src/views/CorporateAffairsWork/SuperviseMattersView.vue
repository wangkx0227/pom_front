<template>
  <div class="supervision_matters" v-loading="loading">
    <el-card class="box-card">
      <div class="head_filter_criteria">
        <el-radio-group v-model="radio_criteria">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="finish">完成</el-radio-button>
          <el-radio-button label="not_finish">未完成</el-radio-button>
        </el-radio-group>
      </div>
      <div class="head_search">
        <el-date-picker v-model="time_frame_list"
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
        <el-table :data="SuperviseMattersData" style="width: 100%" max-height="580">
          <el-table-column prop="index" label="#" align="center"></el-table-column>
          <el-table-column label="监督事项信息" align="center" prop="">
            <template v-slot="{ row }">
              <el-button size="mini" type="text" @click="getMatterInfo(row)"> 查看详情
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="监督人" align="center" prop="user_name">
          </el-table-column>
          <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
          </el-table-column>
          <el-table-column label="完成状态" align="center" width="180">
            <template v-slot="{ row }">
              <el-tag type="success" v-if="row.complete_status === 1">已完成</el-tag>
              <el-tag type="danger" v-else>未完成</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="实际完成时间" align="center" width="180" prop="complete_time">
          </el-table-column>
          <el-table-column label="操作" align="center" prop="">
            <template v-slot="scope">
              <div v-if="scope.row.complete_status === 0 && method_list.includes('PUT')">
                <el-popover placement="top" width="160" v-model="scope.row.visible">
                  <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="scope.row.visible = false">否</el-button>
                    <el-button type="primary" size="mini" @click="completeSuperviseMatter(scope.row)">是</el-button>
                  </div>
                  <template v-slot:reference>
                    <el-button size="mini" type="text">完成事务</el-button>
                  </template>
                </el-popover>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination">
        <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage" @next-click="nextPage"
                       background layout="total,prev, pager, next" :page-size="10" :total="data_total"
                       v-model:current-page="page">
        </el-pagination>
      </div>
      <!--  item列表的弹窗  -->

      <div :v-loading="drawerLoading">
        <el-drawer
            title="事项完成详情记录"
            :visible.sync="drawer"
            direction="rtl"
            :with-header="false"
        >
          <span>我来啦!</span>
        </el-drawer>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SuperviseMattersView",
  data() {
    return {
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      loading: false, // 数据加载样式
      SuperviseMattersData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 单选查询
      radio_criteria: "all",
      // 权限
      method_list: [],
      drawer: false,
      drawerLoading: false,
    };
  },
  created() {
    this.loading = true;
    this.getSuperviseMatters();
  },
  methods: {
    // 获取数据
    getSuperviseMatters() {
      let get_url;
      if (this.search_start_time) {
        get_url = `work/supervise_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      } else {
        get_url = `work/supervise_matter_list/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.SuperviseMattersData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.SuperviseMattersData = [];
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
      this.getSuperviseMatters();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getSuperviseMatters();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getSuperviseMatters();
      }
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.time_frame_list.length > 0) {
        this.page = 1;
        this.search_start_time = new Date(this.time_frame_list[0]).toISOString();
        this.search_end_time = new Date(this.time_frame_list[1]).toISOString();
        this.getSuperviseMatters();
      } else {
        this.getSuperviseMatters();
      }
    },
    // 重置
    reloadDate() {
      this.search_user_name = "";
      this.search_user_id = '';
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getSuperviseMatters();
    },
    // 完成事项
    completeSuperviseMatter(row) {
      row.visible = false;
      this.$http
          .put("work/supervise_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getSuperviseMatters();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
            row.visible = false;
          })
    },
    // 查看事务的详细信息
    getMatterInfo(row) {
      this.drawer = true;
      this.drawerLoading = true;
    },
    dialogItemTableClose(done) {
      done(); // 关闭窗口
    },
  },
}
</script>

<style scoped>
@import url("@/static/currency.css");

.head_filter_criteria,
.head_search {
  margin-bottom: 10px;
}
</style>
