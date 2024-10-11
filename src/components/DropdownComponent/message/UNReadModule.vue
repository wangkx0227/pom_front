<template>
  <div class="unread" v-loading="loading">
    <div class="table_content">
      <div class="table_content_button">
        <el-button plain icon="el-icon-message" size="small" :disabled="readButtonStatus" @click="SaveReadData">标记已读</el-button>
      </div>
      <el-table :data="UNReadData" style="width: 100%" height="650" @selection-change="TableSelectionChange">
        <el-table-column
            type="selection"
            width="80">
        </el-table-column>
        <el-table-column prop="index" label="#" align="center" width="80"></el-table-column>
        <el-table-column label="标题" align="center" prop="title">
        </el-table-column>
        <el-table-column label="创建日期" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="text" @click="DialogOpen(scope.row)">详情</el-button>
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
    <div class="info_dialog">
      <el-dialog
          title="信息"
          :visible.sync="DialogVisible"
          width="30%"
          :close-on-click-modal="false"
          :before-close="DialogHandleClose">
        <div class="dialog_content" v-html="content"></div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: "UNReadModule",
  data() {
    return {
      DialogVisible: false,
      loading: false, // 数据加载样式
      UNReadData: [], // 数据
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 信息的内容
      content: null,
      // 勾选框
      multipleSelection: [],
      // 标记已读的状态
      readButtonStatus: true,
    };
  },
  created() {
    this.loading = true;
    this.getUNReadData();

  },
  methods: {
    // 获取数据
    getUNReadData() {
      this.$http
          .get(`users/user_message/?status=unread&page=${this.page}`)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.UNReadData = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.UNReadData = [];
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
      this.getUNReadData();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getUNReadData();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getUNReadData();
      }
      this.loading = false;
    },
    // 对话框-关闭
    DialogHandleClose(done) {
      done();
    },
    // 对话框 - 打开
    DialogOpen(row) {
      this.DialogVisible = true;
      this.content = row.content;
    },
    TableSelectionChange(val) {
      let read_id_list = [];
      for (let i = 0; i < val.length; i++) {
        read_id_list.push(val[i].id)
      }
      this.multipleSelection = read_id_list;
    },
    // 发送已读请求
    SaveReadData(){
      this.loading = true;
      this.$http
          .put("users/user_message/", {
            data: this.multipleSelection,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getUNReadData();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
          });
    },
  },
  watch: {
    multipleSelection: function (newV, oldV) {
      this.readButtonStatus = newV.length === 0;
    }
  }
};
</script>
<style scoped>
.dialog_content {
  height: 235px;
  overflow-y: scroll;
}
</style>

