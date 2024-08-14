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
            <el-button v-if="row.annex_status" size="mini" type="text" @click="OpenAnnexFileDialog(row)">附件列表查看
            </el-button>
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
      <el-dialog :visible.sync="AnnexFileVisible" :before-close="AnnexFileDialogClose">
        <template slot="title">
          <h4>附件列表</h4>
          <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :limit="1"
              :before-upload="beforeUploadFile"
              :on-exceed="uploadAnnexExceedFile"
              :file-list="annexFileList"
              :show-file-list="false"
              :data="no_order_work_annex_file_row"
              :on-success="UploadAnnexFileSuccess"
              :on-error="UploadAnnexFileError"
              :headers="authHeaders"
          >
            <el-button type="success" size="mini">补充上传</el-button>
            <div slot="tip" class="el-upload__tip">支持png,pdf,doc,docx,xlsx,xls,jpg,gif格式文件，且不能超过5M，且一次只能上传一个文件。</div>
          </el-upload>
        </template>
        <el-table :data="annex_file_data" height="300" border v-loading="AnnexFileTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="file_name" label="文件名称" width="350" align="center"></el-table-column>
          <el-table-column property="create_date" label="上传时间" width="180" align="center"></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template v-slot="scope">
              <el-button size="mini"
                         type="text"
                         @click="DownloadAnnexFile(scope.row)"
              >下载
              </el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button size="mini"
                         type="text"
                         @click="delAnnexFileData(scope.$index, annex_file_data, scope.row)"
              >删除
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
      addLoading: false, // 控制弹窗创建按钮
      dialogDisplayVar: false,// 弹出框控制变量
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
      row_data: null, // 事项需要上传附件，弹窗保存当前非订单事项列的基础数据
      // 弹窗内上传变量，文件对象列表
      fileList: [],
      // 附件窗口使用的变量
      AnnexFileVisible: false,
      annex_file_data: [],
      AnnexFileTableLoading: false,
      no_order_work_annex_file_row: null, // 当前附件列表归属到哪个非订单事务的id
      annexFileList: [], // 上传附件列表
      uploadUrl: `${this.$http.defaults.baseURL}work/no_order_matter_file_list/`, // 需要部署到实际环境下接口需要修改
      authHeaders: { // 附件补充上传 携带的请求头
        'Authorization': localStorage.getItem("authorization"),
        'X-User-Id': localStorage.getItem("user_id"),
      },
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
      this.row_data = row;
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
    // 文件上传到后端接口,自定义上传 完成事务按钮 - 需要上传附件
    completeNoOrderWorkFile() {
      if (this.fileList.length === 0) {
        this.$message.error("请上传文件后再进行提交！")

      }else {
        let formData = new FormData();
        this.fileList.forEach((fileItem, index) => {
          formData.append(`file-${index}`, fileItem.raw);
        });
        let jsonData = JSON.stringify(this.row_data);
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
              this.row_data = null;
              this.getNoOrderWorkListData();
            });
      }

    },
    // 打开附件弹窗
    OpenAnnexFileDialog(row) {
      this.AnnexFileVisible = true;
      this.getAnnexFileData(row); // 获取数据
    },
    // 获取当前事项 附件列表
    getAnnexFileData(row) {
      this.AnnexFileTableLoading = true;
      this.no_order_work_annex_file_row = row;
      const get_url = `work/no_order_matter_file_list/?pk=${row.id}`;
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.annex_file_data = data.data.data;
            } else {
              this.annex_file_data = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.AnnexFileTableLoading = false;
          });
    },
    // 附件弹窗关闭窗口
    AnnexFileDialogClose(done) {
      done(); // 关闭窗口
      this.no_order_work_annex_file_row = null;
      this.getNoOrderWorkListData(); // 重新加载一下数据
    },
    // 附件删除
    delAnnexFileData(index, rows, row) {
      const pk = row.id
      this.$http
          .delete("work/no_order_matter_file_list/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              rows.splice(index, 1);
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
    // 附件补充上传-文件数量验证
    uploadAnnexExceedFile(files, fileList) {
      this.$message.warning('当前限制只能上传一个文件');
    },
    // 附件补充上传成功后回调函数
    UploadAnnexFileSuccess(response, file, fileList) {
      this.$message.success(response.message);
      this.annexFileList = [];
      this.getAnnexFileData(this.no_order_work_annex_file_row); // 刷新附件列表
    },
    // 附件补充上传失败回调函数
    UploadAnnexFileError(err, file, fileList) {
      // 尝试解析服务器返回的错误信息
      let errorMessage = '文件上传失败，请稍后重试或联系管理员。';
      if (err && err.response) {
        try {
          const errorData = JSON.parse(err.response.responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // 如果解析出错，使用默认错误信息
          console.error('解析错误信息失败', e);
        }
      }
      this.$message.error(errorMessage);
    },
    // 附件文件下载
    DownloadAnnexFile(row) {
      this.AnnexFileTableLoading = true;
      this.$http.get(`work/download_file/?pk=${row.id}&download_type=no_order`, {responseType: 'blob'})
          .then((res) => {
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'file.pdf'; // 默认文件名
            if (contentDisposition) {
              const match = contentDisposition.split("=");
              if (match && match.length > 1) {
                if (/^".*"$/.test(match[1])) {
                  filename = decodeURIComponent(match[1].slice(1, -1));
                } else {
                  filename = decodeURIComponent(match[1]);
                }
              }
            }
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // 替换为你的文件名
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => { // 无论是对还是错都会执行
            this.AnnexFileTableLoading = false;
          });
    }
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
