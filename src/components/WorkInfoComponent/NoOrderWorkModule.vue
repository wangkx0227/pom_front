<template>
  <div class="work" v-loading="loading">
    <div class="dialog">
      <el-dialog title="事项完成窗口" :visible.sync="NoOrderWorkDialogVisible" :before-close="NoOrderWorkDialogClose">
        <el-table height="300" border v-loading="NoOrderWorkDialogLoading">

        </el-table>
      </el-dialog>
    </div>
    <div class="head_search_add">
      <el-date-picker
          v-model="time_frame_list"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-right: 5px;">
      </el-date-picker>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="no_order_matter_list" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" width="500">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
            <el-input v-model="row.matter_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="跟进人用户" align="center" width="180" prop="user_name">
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
            <el-tag type="success" v-if="row.complete_status === 1">已完成</el-tag>
            <el-tag type="danger" v-else>未完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否需要上传附件" align="center" width="180">
          <template v-slot="{ row }">
            <el-tag v-if="row.is_file === 1">是</el-tag>
            <el-tag type="info" v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="延期列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-button v-if="row.extension_status" size="mini" type="text">延期列表查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="附件" align="center" width="180">
          <template v-slot="{ row }">
            <el-button v-if="row.annex_status" size="mini" type="text">附件下载</el-button>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="row.complete_status === 1">{{ row.complete_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template v-slot="scope">
            <div v-if="method_list.includes('PUT')" style="display: inline-block;">
              <el-button v-if="scope.row.is_file" size="mini" type="text" @click="completeNoOrderWork(scope.row)">完成事务</el-button>
              <el-popover v-else placement="top" width="160"   v-model="scope.row.visible">
                <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">否</el-button>
                  <el-button type="primary" size="mini" @click="scope.row.visible = false">是</el-button>
                </div>
                <template v-slot:reference>
                  <el-button size="mini" type="text">完成事务</el-button>
                </template>
              </el-popover>
            </div>
            <div v-if="method_list.includes('PUT') && method_list.includes('POST') " style="display: inline;">
              <el-divider direction="vertical"></el-divider>
            </div>
            <div v-if="method_list.includes('POST')" style="display: inline-block;">
              <el-button size="mini" type="text">申请延期</el-button>
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
  </div>
</template>

<script>
export default {
  name: "NoOrderWorkModule",
  data() {
    return {
      no_order_matter_list: [], // 查询数据列表
      loading: false, // 数据加载样式
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 弹出框控制变量
      dialogDisplayVar: false,
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 可访问权限列表
      method_list: [],
      // 按照时间搜索变量
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      // 完成事项的弹窗控制变量
      NoOrderWorkDialogVisible: false, // 控制弹窗
      NoOrderWorkDialogLoading: false, // 控制提交按钮
    };
  },
  created() {
    this.getNoOrderWorkListData()
  },
  methods: {
    // 获取数据
    getNoOrderWorkListData() {
      this.loading = true;
      let get_url;
      if (!this.search_start_time) {
        get_url = `business_function/no_order_matter_list/?page=${this.page}`;
      } else {
        get_url = `business_function/no_order_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.no_order_matter_list = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.no_order_matter_list = [];
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
      this.getNoOrderWorkListData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getNoOrderWorkListData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getNoOrderWorkListData();
      }
    },
    // 搜索功能
    searchData() {
      this.page = 1;
      this.loading = true;
      if (this.time_frame_list.length !== 0) {
        this.search_start_time = new Date(this.time_frame_list[0]).toISOString();
        this.search_end_time = new Date(this.time_frame_list[1]).toISOString();
      }
      this.getNoOrderWorkListData();
    },
    // 重置
    reloadData() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getNoOrderWorkListData();
    },
    // 完成事务按钮
    completeNoOrderWork(row) {
      this.NoOrderWorkDialogVisible = true;
    },
    // 完成事务关闭弹窗时，进行回调
    NoOrderWorkDialogClose(done) {
      done(); // 关闭窗口
      this.getNoOrderWorkListData(); // 重新加载一下数据
    }
  },
};
</script>

<style>
.head_search_add .el-date-editor .el-range-separator {
  padding: 0 !important;
}
</style>
