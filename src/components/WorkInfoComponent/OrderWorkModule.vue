<template>
  <div class="work" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="radio_criteria">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="finish">完成</el-radio-button>
        <el-radio-button label="not_finish">未完成</el-radio-button>
      </el-radio-group>
    </div>
    <div class="head_search">
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
      <el-table :data="order_matter_list" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" prop="matter_name" width="500">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工厂名称" align="center" width="180" prop="factory_name">
        </el-table-column>
        <el-table-column label="PO" align="center" width="180" prop="po">
        </el-table-column>
        <el-table-column label="ITEM列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" @click="getOrderRecordItem(row)"> 查看详情
            </el-button>
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
            <el-button v-if="row.delay_status && delay_method_list.includes('GET')" size="mini" type="text"
                       @click="OpenDelayDialog(row)">延期列表查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="附件列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-button v-if="row.annex_status && annex_method_list.includes('GET')" size="mini" type="text"
                       @click="OpenAnnexFileDialog(row)">附件列表查看
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
              <el-button v-if="scope.row.is_file" size="mini" type="text" @click="OpenOrderWorkDialog(scope.row)">
                事务完成
              </el-button>
              <el-popover v-else placement="top" width="160" v-model="scope.row.visible">
                <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">否</el-button>
                  <el-button type="primary" size="mini" @click="completeOrderWork(scope.row)">是</el-button>
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
              <el-button size="mini" type="text" @click="OpenDelayApplyForDialog(scope.row)">申请延期</el-button>
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
              v-if="annex_method_list.includes('POST')"
              class="upload-demo"
              :action="uploadUrl"
              :limit="1"
              :before-upload="beforeUploadFile"
              :on-exceed="uploadAnnexExceedFile"
              :file-list="annexFileList"
              :show-file-list="false"
              :data="order_work_annex_file_row"
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
              <el-button
                  size="mini"
                  type="text"
                  v-if="download_method_list.includes('GET')"
                  @click="DownloadAnnexFile(scope.row)"
              >下载
              </el-button>
              <div
                  style="display: inline;"
                  v-if="download_method_list.includes('GET') && annex_method_list.includes('DELETE')">
                <el-divider direction="vertical"></el-divider>
              </div>
              <el-button
                  size="mini"
                  type="text"
                  v-if="annex_method_list.includes('DELETE')"
                  @click="delAnnexFileData(scope.$index, annex_file_data, scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
    <!--  延期列表，会在主管的延期审核中展示，让主管进行审核即可 -->
    <div class="dialog">
      <el-dialog :visible.sync="DelayVisible" :before-close="DelayDialogClose">
        <template slot="title">
          <h4>延期列表</h4>
        </template>
        <el-table :data="delay_data" height="300" border v-loading="DelayTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="old_time" label="原事项完成时间" width="350" align="center"></el-table-column>
          <el-table-column property="delay_day" label="延期天数" width="180" align="center"></el-table-column>
          <el-table-column property="new_time" label="新事项完成时间" width="180" align="center"></el-table-column>
          <el-table-column property="delay_number" label="申请延期次数" width="180" align="center"></el-table-column>
          <el-table-column label="审核状态" width="180" align="center">
            <template v-slot="{ row }">
              <el-tag v-if="row.delay_examine_status === 1">已审核</el-tag>
              <el-tag type="info" v-else>未审核</el-tag>
            </template>
          </el-table-column>
          <el-table-column property="delay_examine_time" label="审核完成时间" width="180" align="center"></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template v-slot="scope">
              <el-button size="mini"
                         type="text"
                         v-if="delay_method_list.includes('DELETE1')"
                         @click="delDelayData(scope.$index, delay_data, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
    <!--  item列表的弹窗  -->
    <div class="dialog">
      <el-dialog title="ITEM详情列表" :visible.sync="dialogTableVisible" :before-close="dialogItemTableClose" width="30%">
        <el-table :data="item_list" height="200" border v-loading="dialogTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="item" label="ITEM" width="450" align="center"></el-table-column>
        </el-table>
      </el-dialog>
    </div>
    <!--  事项完成上传附件窗口  -->
    <div class="dialog">
      <el-dialog title="事务附件上传"
                 width="25%"
                 :visible.sync="OrderWorkDialogVisible"
                 :before-close="DialogClose"
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
          <el-button @click="OrderWorkDialogButtonClose">取消上传</el-button>
          <el-button type="primary" @click="completeOrderWorkFile">确定上传</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 延期申请提交窗口   -->
    <div class="dialog">
      <el-dialog title="事务延期申请"
                 width="35%"
                 :visible.sync="DelayApplyForDialogVisible"
                 v-loading="DelayApplyForTableLoading"
                 :before-close="DialogClose">
        <el-alert
            title="注意："
            type="warning"
            description="请根据实际情况申请延期时间！">
        </el-alert>
        <el-form :model="addDelayApplyForData" label-position="top">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="原完成事务时间">
                <el-date-picker
                    :disabled="true"
                    v-model="addDelayApplyForData.old_time"
                    type="date"
                    placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新完成事务时间">
                <el-date-picker
                    :disabled="true"
                    v-model="addDelayApplyForData.new_time"
                    type="date"
                    placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请延期天数(1-100)">
                <el-input-number v-model="addDelayApplyForData.delay_day"
                                 @change="DelayDayNumberChange"
                                 :min="0"
                                 :max="100"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="DelayApplyDialogClose">取消</el-button>
          <el-button type="primary" @click="DelayApplySaveData">提交</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// 按钮权限还没有进行设置
export default {
  name: "OrderWorkModule",
  data() {
    return {
      radio_criteria: 'all',
      order_matter_list: [], // 查询数据列表
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
      OrderWorkDialogVisible: false, // 控制弹窗
      // 弹窗传入的row变量
      open_work_annex_row_data: null, // 事项需要上传附件，弹窗保存当前非订单事项列的基础数据
      // 弹窗内上传变量，文件对象列表
      fileList: [],
      // 附件窗口使用的变量
      AnnexFileVisible: false,
      annex_file_data: [],
      AnnexFileTableLoading: false,
      order_work_annex_file_row: null, // 当前附件列表归属到哪个非订单事务的id
      annexFileList: [], // 上传附件列表
      uploadUrl: `${this.$http.defaults.baseURL}work/order_matter_file_list/`, // 需要部署到实际环境下接口需要修改
      authHeaders: { // 附件补充上传 携带的请求头
        'Authorization': localStorage.getItem("authorization"),
        'X-User-Id': localStorage.getItem("user_id"),
      },
      annex_method_list: [], // 附件可使用功能权限
      download_method_list: [], // 附件可下载权限
      // 延期列表
      DelayVisible: false,
      DelayTableLoading: false,
      order_work_delay_row: false,
      delay_data: [], // 存储数据
      delay_method_list: [], // 延期可使用功能权限
      // 延期审核提交
      DelayApplyForDialogVisible: false,
      addDelayApplyForData: {
        old_time: "",
        delay_day: 0,
        new_time: "",
      },
      open_delay_row_data: null,
      DelayApplyForTableLoading: false,
      // item列表
      item_list: [],
      dialogTableVisible: false,
      dialogTableLoading: false,
    };
  },
  created() {
    this.getOrderWorkListData()
  },
  methods: {
    // 获取数据
    getOrderWorkListData() {
      this.loading = true;
      let get_url;
      if (!this.search_start_time) {
        get_url = `work/order_matter_list/?page=${this.page}`;
      } else {
        get_url = `work/order_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.order_matter_list = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.delay_method_list = data.data.delay_method_list;
              this.annex_method_list = data.data.annex_method_list;
              this.download_method_list = data.data.download_method_list;
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
      this.getOrderWorkListData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getOrderWorkListData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getOrderWorkListData();
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
      this.getOrderWorkListData();
    },
    // 重置
    reloadData() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getOrderWorkListData();
    },
    // 需要进行修改
    // 完成事务按钮 - 不需要上传附件
    completeOrderWork(row) {
      this.loading = true;
      this.$http
          .put("work/order_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getOrderWorkListData();
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
    // 事项完成 - 打开上传附件弹窗
    OpenOrderWorkDialog(row) {
      this.OrderWorkDialogVisible = true;
      this.open_work_annex_row_data = row;
    },
    // 完成事项 - 关闭弹出进行回调，按钮
    OrderWorkDialogButtonClose() {
      this.OrderWorkDialogVisible = false;
      this.getOrderWorkListData();
    },
    // 事务完成- 文件上传功能
    // 事务完成- 文件上传,显示一共可以上传几个文件
    handleExceedFile(files, fileList) {
      this.$message.warning(`当前限制选择 10 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    handleChangeFile(file, fileList) {
      // 移除不通过校验的文件
      this.fileList = fileList.filter((item) => {
        return this.beforeUploadFile(item);
      });
    },
    // 事务完成 - 更新文件列表，并且检测文件格式
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
    // 事务完成- 文件上传到后端接口,自定义上传 完成事务按钮 - 需要上传附件
    completeOrderWorkFile() {
      if (this.fileList.length === 0) {
        this.$message.error("请上传文件后再进行提交！")

      } else {
        let formData = new FormData();
        this.fileList.forEach((fileItem, index) => {
          formData.append(`file-${index}`, fileItem.raw);
        });
        let jsonData = JSON.stringify(this.open_work_annex_row_data);
        formData.append('data', jsonData);
        this.$http
            .put("work/order_matter_list/", formData, {
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
              this.OrderWorkDialogVisible = false
              this.open_work_annex_row_data = null;
              this.getOrderWorkListData();
            });
      }

    },
    // 延期申请 - 打开弹窗
    OpenDelayApplyForDialog(row) {
      this.DelayApplyForDialogVisible = true;
      this.open_delay_row_data = row;
      // 当点开一个新窗口时，需要对addDelayApplyForData其他变量进行清除
      this.addDelayApplyForData.old_time = row.expected_completion_time;
      this.addDelayApplyForData.new_time = '';
      this.addDelayApplyForData.delay_day = 0;
    },
    // 延期申请 - 提交数据
    DelayApplySaveData() {
      this.DelayApplyForTableLoading = true;
      if (this.addDelayApplyForData.delay_day === 0) {
        this.$message.error("申请天数不能为0！")
        this.DelayApplyForTableLoading = false;
      } else {
        this.addDelayApplyForData.id = this.open_delay_row_data.id
        this.$http
            .post("work/order_matter_list/", {
              data: this.addDelayApplyForData,
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
              this.addDelayApplyForData.new_time = '';
              this.addDelayApplyForData.delay_day = 0;
              this.DelayApplyForTableLoading = false;
            });
      }
    },
    // 延期申请 - 新时间计算
    DelayDayNumberChange(value) {
      const old_time = this.addDelayApplyForData.old_time;
      const newDate = new Date(old_time);
      newDate.setDate(newDate.getDate() + value); // 给当前日期加一天
      let year = newDate.getFullYear();
      let month = newDate.getMonth() + 1; // 月份从 1 开始
      let day = newDate.getDate();
      this.addDelayApplyForData.new_time = `${year}-${month}-${day}`;
    },
    // 延期申请 - 点击取消按钮回调
    DelayApplyDialogClose() {
      this.DelayApplyForDialogVisible = false;
      this.getOrderWorkListData(); // 重新加载一下数据
    },
    // 事务完成/延期提交关闭弹窗 - 进行回调
    DialogClose(done) {
      done(); // 关闭窗口
      this.getOrderWorkListData(); // 重新加载一下数据
    },
    // 附件列表 - 打开附件弹窗
    OpenAnnexFileDialog(row) {
      this.AnnexFileVisible = true;
      this.getAnnexFileData(row); // 获取数据
    },
    // 附件列表 - 获取当前事项接口
    getAnnexFileData(row) {
      this.AnnexFileTableLoading = true;
      this.order_work_annex_file_row = row;
      const get_url = `work/order_matter_file_list/?pk=${row.id}`;
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
    // 附件列表 - 附件弹窗关闭窗口回调
    AnnexFileDialogClose(done) {
      done(); // 关闭窗口
      this.order_work_annex_file_row = null;
      this.getOrderWorkListData(); // 重新加载一下数据
    },
    // 附件列表 - 附件删除
    delAnnexFileData(index, rows, row) {
      this.AnnexFileTableLoading = true;
      const pk = row.id
      this.$http
          .delete("work/order_matter_file_list/", {
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
            this.AnnexFileTableLoading = false;
          });
    },
    // 附件列表 - 附件补充上传，文件数量验证
    uploadAnnexExceedFile(files, fileList) {
      this.$message.warning('当前限制只能上传一个文件');
    },
    // 附件列表 - 附件补充上传成功后回调函数
    UploadAnnexFileSuccess(response, file, fileList) {
      this.$message.success(response.message);
      this.annexFileList = [];
      this.getAnnexFileData(this.order_work_annex_file_row); // 刷新附件列表
    },
    // 附件列表 - 附件补充上传失败回调函数
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
    // 附件列表- 附件文件下载
    DownloadAnnexFile(row) {
      this.AnnexFileTableLoading = true;
      this.$http.get(`work/download_file/?pk=${row.id}&download_type=order`, {responseType: 'blob'})
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
    },
    // 延期列表 -  打开延期列表弹窗
    OpenDelayDialog(row) {
      this.DelayVisible = true;
      this.getDelayData(row); // 获取数据
    },
    // 延期列表 -  延期列表数据获取
    getDelayData(row) {
      this.DelayTableLoading = true;
      this.order_work_delay_row = row;
      const get_url = `work/order_matter_delay_list/?pk=${row.id}`;
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.delay_data = data.data.data;
            } else {
              this.delay_data = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.DelayTableLoading = false;
          });
    },
    // 延期列表 - 延期弹窗关闭窗口回调
    DelayDialogClose(done) {
      done(); // 关闭窗口
      this.order_work_delay_row = null;
      this.getOrderWorkListData(); // 重新加载一下数据
    },
    // 延期列表 - 删除延期申请
    delDelayData(index, rows, row) {
      this.DelayTableLoading = true;
      const pk = row.id
      this.$http
          .delete("work/order_matter_delay_list/", {
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
            this.DelayTableLoading = false;
          });
    },
    // 查看item列表
    getOrderRecordItem(row) {
      this.dialogTableVisible = true;
      this.dialogTableLoading = true;
      const order_record_id = row.order_record_info_id;
      this.$http
          .get(`business_function/order_record_info/?query=item&order_record_id=${order_record_id}`)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.item_list = data.data;
            } else {
              this.item_list = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.dialogTableLoading = false;
          });
    },
    // 作为item 弹窗的关闭窗口调用函数
    dialogItemTableClose(done) {
      done(); // 关闭窗口
    },
  },
};
</script>

<style scoped>
.el-input.is-disabled .el-input__inner {
  color: black !important;
}

.head_search_add .el-date-editor .el-range-separator {
  padding: 0 !important;
}

.el-upload-list {
  flex-direction: column;
  max-height: 80px;
  min-height: 80px;
  overflow: scroll;
}
.head_filter_criteria,
.head_search {
  margin-bottom: 10px;
}
</style>
