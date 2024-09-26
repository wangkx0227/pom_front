<template>
  <div class="no_matter_log" v-loading="loading">
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
      <div class="dialog">
        <el-dialog title="事务生成记录" :visible.sync="dialogTableVisible" :before-close="dialogTableClose">
          <el-table :data="matter_exceptional_data" height="300" border v-loading="dialogTableLoading">
            <el-table-column property="index" label="#" align="center"></el-table-column>
            <el-table-column property="matter_name" label="事务名称" width="450" align="center"></el-table-column>
            <el-table-column property="user_name" label="跟进人" width="180" align="center"></el-table-column>
            <el-table-column property="create_date" label="创建时间" width="180" align="center"></el-table-column>
            <el-table-column property="is_exceptional" label="状态" width="180" align="center">
              <template v-slot="{ row }">
                <el-tag v-if="row.is_exceptional === 0">正常</el-tag>
                <el-tag v-else type="danger">异常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template v-slot="scope">
                <el-button size="mini"
                           type="text"
                           v-if="scope.row.is_exceptional === 1 && exceptional_restore_method_list.includes('PUT')"
                           @click="MatterAbnormalRecovery(scope.row)">恢复异常
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </div>
      <div class="table_content">
        <el-table :data="NoOrderWorkLogData" style="width: 100%" height="610">
          <el-table-column prop="index" label="#" align="center"></el-table-column>
          <el-table-column label="生成时间" align="center" prop="create_date">
          </el-table-column>
          <el-table-column label="生成状态" align="center">
            <template v-slot="{ row }">
              <el-tag v-if="row.is_exceptional === 0">正常</el-tag>
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
              <el-tag>{{ row.correct_number }}条</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="异常数量" align="center">
            <template v-slot="{ row }">
              <el-tag v-if="row.error_number === 0">{{ row.error_number }}条</el-tag>
              <el-tag v-else type="danger">{{ row.error_number }}条</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template v-slot="scope">
              <el-button @click="getMatterExceptionalData(scope.row)" size="mini" type="text" v-if="exceptional_restore_method_list.includes('GET')">查看详情</el-button>
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
  name: "MatterInfoModule",
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
      // 获取访问权限,需要详情的弹窗需要查看对应的异常事务，并且进行恢复操作
      exceptional_restore_method_list: [],
      // 查看详情的弹窗控制变量
      dialogTableLoading: false,
      dialogTableVisible: false,
      matter_exceptional_data: [], // 数据变量

    };
  },
  created() {
    this.loading = true;
    this.getNoOrderWorkLogData();
  },
  methods: {
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
              this.exceptional_restore_method_list = data.data.exceptional_restore_method_list;
            } else {
              this.NoOrderWorkLogData = [];
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
    // 查看非订单的当天生成记录详情
    getMatterExceptionalData(row) {
      this.dialogTableVisible = true;
      this.dialogTableLoading = true;
      const get_url = `business_function/no_order_matter_exceptional_restore/?data_time=${row.create_date}`;
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.matter_exceptional_data = data.data.data;
            } else {
              this.matter_exceptional_data = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.dialogTableLoading = false;
          });
    },
    // 事务异常恢复
    MatterAbnormalRecovery(row) {
      this.dialogTableLoading = true;
      this.$http
          .put("business_function/no_order_matter_exceptional_restore/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getMatterExceptionalData(row) // 重新调用，进行刷新表格数据
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.dialogTableLoading = false;
          });
    },
    // 关闭弹窗时，进行回调
    dialogTableClose(done) {
      done(); // 关闭窗口
      this.getNoOrderWorkLogData(); // 重新加载一下数据
    }
  },
}
</script>
<style>
/*由于搜索框中的字样式不正确，强制修改*/
.head_search_add .el-date-editor .el-range-separator {
  padding: 0 !important;
}
</style>
