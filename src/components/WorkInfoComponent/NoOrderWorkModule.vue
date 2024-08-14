<template>
  <div class="work" v-loading="loading">
    <!--  上传附件窗口  -->
    <div class="dialog">
      <el-dialog title="事务附件上传"
                 width="25%"
                 :visible.sync="NoOrderWorkDialogVisible"
                 :before-close="NoOrderWorkDialogClose"
      >
        <el-upload
            class="upload-demo"
            action=""
            multiple
            :limit="10"
            :on-change="handleChangeFile"
            :before-upload="beforeUploadFile"
            :on-exceed="handleExceedFile"
            :auto-upload="false"
            :file-list="fileList">
          <el-button type="success" size="mini">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">支持png,pdf,doc,docx,xlsx,xls,jpg,gif格式文件，且不能超过5M</div>
        </el-upload>
        <span slot="footer" class="dialog-footer">
          <el-button @click="NoOrderWorkDialogButtonClose" size="mini">取消上传</el-button>
          <el-button type="primary" size="mini" @click="completeNoOrderWorkFile">确定上传</el-button>
        </span>
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
        <el-table-column label="附件列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-button v-if="row.annex_status" size="mini" type="text" @click="getAnnexFileData(row)">附件列表查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="row.complete_status === 1">{{ row.complete_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template v-slot="scope">
            <!-- 完成后，隐藏申请延期按钮 -->
            <div v-if="method_list.includes('PUT') && !scope.row.complete_status" style="display: inline-block;">
              <el-button v-if="scope.row.is_file" size="mini" type="text" @click="completeNoOrderWorkDialog(scope.row)">
                完成事务
              </el-button>
              <el-popover v-else placement="top" width="160" v-model="scope.row.visible">
                <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">否</el-button>
                  <el-button type="primary" size="mini" @click="completeNoOrderWork(scope.row)">是</el-button>
                </div>
                <template v-slot:reference>
                  <el-button size="mini" type="text">完成事务</el-button>
                </template>
              </el-popover>
            </div>
            <div v-if="method_list.includes('PUT') && method_list.includes('POST') && !scope.row.complete_status "
                 style="display: inline;">
              <el-divider direction="vertical"></el-divider>
            </div>
            <div v-if="method_list.includes('POST') && !scope.row.complete_status" style="display: inline-block;">
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
    <!--  附件列表  -->
    <div class="dialog">
      <el-dialog title="附件列表" :visible.sync="AnnexFileVisible" :before-close="AnnexFileClose">
        <el-table :data="annex_file_data" height="300" border v-loading="AnnexFileTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="file_name" label="文件名称" width="350" align="center"></el-table-column>
          <el-table-column property="create_date" label="上传时间" width="180" align="center"></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template v-slot="scope">
              <el-button size="mini"
                         type="text"
              >下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
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
      // 弹窗传入的row变量
      row_list: null,
      // 弹窗内上传变量，文件对象列表
      fileList: [],
      // 附件窗口使用的变量
      AnnexFileVisible: false,
      annex_file_data: [],
      AnnexFileTableLoading: false,
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
        get_url = `work/no_order_matter_list/?page=${this.page}`;
      } else {
        get_url = `work/no_order_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
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
    // 完成事务按钮 - 不需要上传附件
    completeNoOrderWork(row) {
      this.loading = true;
      this.$http
          .put("work/no_order_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getNoOrderWorkListData();
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
    // 打开上传附件弹窗
    completeNoOrderWorkDialog(row) {
      this.NoOrderWorkDialogVisible = true;
      this.row_list = row;
    },
    // 完成事务关闭弹窗时，进行回调 自带函数
    NoOrderWorkDialogClose(done) {
      done(); // 关闭窗口
      this.getNoOrderWorkListData(); // 重新加载一下数据
    },
    // 完成事项关闭弹出，进行回调，按钮
    NoOrderWorkDialogButtonClose() {
      this.NoOrderWorkDialogVisible = false;
      this.getNoOrderWorkListData();
    },
    // 文件上传功能
    // 文件上传,显示一共可以上传几个文件
    handleExceedFile(files, fileList) {
      this.$message.warning(`当前限制选择 10 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    handleChangeFile(file, fileList) {
      // 移除不通过校验的文件
      this.fileList = fileList.filter((item) => {
        return this.beforeUploadFile(item);
      });
    },
    // 更新文件列表，并且检测文件格式
    beforeUploadFile(file, fileList) {
      const isLt5M = file.size / 1024 / 1024 < 5; //这里做文件大小限制
      const FileExt = file.name.replace(/.+\./, "");
      const file_format = ['png', 'pdf', 'doc', 'docx', 'xls', 'jpg', 'gif', 'xlsx']
      if (!isLt5M) {
        this.$message.error('上传文件大小不能超过 5MB!');
        return false;
      } else if (!file_format.includes(FileExt)) {
        this.$message.error("上传文件格式不正确!");
        return false;
      } else {
        return true;
      }

    },
    // 文件上传到后端接口,自定义上传
    // 完成事务按钮 - 需要上传附件
    completeNoOrderWorkFile() {
      let formData = new FormData();
      this.fileList.forEach((fileItem, index) => {
        formData.append(`file-${index}`, fileItem.raw);
      });
      let jsonData = JSON.stringify(this.row_list);
      formData.append('data', jsonData);
      this.$http
          .put("work/no_order_matter_list/", formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // 必须设置请求头
            }
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.fileList = [];
            this.NoOrderWorkDialogVisible = false
            this.row_list = null;
            this.getNoOrderWorkListData();
          });
    },
    // 附件列表函数
    getAnnexFileData(row) {
      this.AnnexFileVisible = true;
      // this.AnnexFileTableLoading = true;
      //   const get_url = `business_function/no_order_matter_exceptional_restore/?data_time=${row.create_date}`;
      //   this.$http
      //       .get(get_url)
      //       .then((res) => {
      //         let data = res.data;
      //         if (data.code === 200) {
      //           this.matter_exceptional_data = data.data.data;
      //         } else {
      //           this.matter_exceptional_data = [];
      //         }
      //       })
      //       .catch((error) => {
      //         this.$message.error(error.message);
      //       })
      //       .finally(() => {
      //         this.dialogTableLoading = false;
      //       });
    },
    AnnexFileClose() {
    },
  },
};
</script>

<style>
.head_search_add .el-date-editor .el-range-separator {
  padding: 0 !important;
}

.el-upload-list {
  flex-direction: column;
  max-height: 80px;
  min-height: 80px;
  overflow: scroll;
}
</style>
