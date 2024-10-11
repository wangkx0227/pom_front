<template>
  <div class="read" v-loading="loading">
    <div class="table_content">
      <div class="table_content_button">
        <el-button plain icon="el-icon-delete" size="small" :disabled="readButtonStatus" @click="DeleteReadData">批量删除
        </el-button>
      </div>
      <el-table :data="ReadData" style="width: 100%" height="650" @selection-change="TableSelectionChange">
        <el-table-column
            type="selection"
            width="80">
        </el-table-column>
        <el-table-column prop="index" label="#" align="center" width="80"></el-table-column>
        <el-table-column label="标题" align="center"  prop="title">
        </el-table-column>
        <el-table-column label="创建日期" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-popover v-if="!scope.row.editable" placement="top" width="160" v-model="scope.row.visible"
                        trigger="manual">
              <p>删除后无恢复，请问确定删除吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                </el-button>
                <el-button type="primary" size="mini" @click="deleteRow(scope.$index, ReadData, scope.row)">确定
                </el-button>
              </div>
              <template v-slot:reference>
                <el-button size="mini" type="text" @click="deleteDisplay(scope.row)">删除
                </el-button>
              </template>
            </el-popover>
            <el-divider direction="vertical"></el-divider>
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
  name: "ReadModule",
  data() {
    return {
      DialogVisible: false,
      loading: false, // 数据加载样式
      ReadData: [], // 数据
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
    this.getReadData();

  },
  methods: {
    // 获取数据
    getReadData() {
      this.$http
          .get(`users/user_message/?status=read&page=${this.page}`)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.ReadData = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.ReadData = [];
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
      this.getReadData();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getReadData();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getReadData();
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
    // 批量删除请求
    DeleteReadData() {
      this.loading = true;
      this.$http
          .delete("users/user_message/", {
            data: {
              type: 'multiple',
              pk: this.multipleSelection,
            },
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getReadData();
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
    // 删除调用弹窗
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除调用函数
    deleteRow(index, rows, row) {
      let pk = row.id;
      this.loading = true;
      this.$http
          .delete("users/user_message/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              rows.splice(index, 1);
              if (rows.length === 0) {
                if (this.page !== 1) {
                  this.page -= 1;
                }
              }
              this.getReadData();
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
    }
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

