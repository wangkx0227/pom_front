<template>
  <div class="supervision_matters" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="radio_criteria" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="finish">完成</el-radio-button>
        <el-radio-button label="not_finish">未完成</el-radio-button>
      </el-radio-group>
    </div>
    <div class="head_search" style="display: flex">
      <div class="select_filter_po">
        <el-select v-model="order_id" filterable placeholder="根据PO晒选">
          <el-option
              v-for="item in order_record_info_list"
              :key="item.order_id"
              :label="item.po"
              :value="item.order_id">
            <span style="float: left">{{ item.po }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.create_date }}</span>
          </el-option>
        </el-select>
      </div>
      <div class="select_filter_factory" style="margin-left:5px">
        <el-select v-model="matter_name_id" filterable placeholder="根据事项名晒选">
          <el-option v-for="item in matter_name_list"
                     :key="item.order_matter_id"
                     :label="item.matter_name"
                     :value="item.order_matter_id">
          </el-option>
        </el-select>
      </div>
      <div class="data_filter" style="margin-left:5px">
        <el-date-picker
            v-model="time_frame_list"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 5px;">
        </el-date-picker>
      </div>
      <div class="filter_button">
        <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
        </el-button>
        <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
        </el-button>
      </div>
    </div>
    <div class="table_content">
      <el-table :data="SuperviseMattersData" style="width: 100%" height="590">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column prop="po" label="PO" align="center" width="180"></el-table-column>
        <el-table-column prop="matter_name" label="事项名称" width="500" align="center"></el-table-column>
        <el-table-column label="监督事项详情" align="center" prop="">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" @click="getMatterInfo(row)"> 查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="监督人" align="center" prop="user_name">
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
            <el-tag effect="plain" v-if="row.complete_status === 1">已完成</el-tag>
            <el-tag type="info" effect="plain" v-else>未完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180" prop="complete_time">
        </el-table-column>
        <el-table-column label="操作" align="center" prop="">
          <template v-slot="scope">
            <div v-if="scope.row.complete_status === 0 && method_list.includes('PUT')">
              <el-button size="mini" type="text" @click="openCompleteMessageBox(scope.row)">完成事务</el-button>
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
    <!--  跟进人事务列表的弹窗  -->
    <div class="work_dialog">
      <el-dialog
          title="跟进事务的详细信息"
          :visible.sync="dialogVisible"
          width="40%"
          :before-close="dialogTableClose">
        <div>
          <el-descriptions direction="vertical" :column="4" border>
            <el-descriptions-item label="跟进人" :span="1">{{ follow_matter_info_data.user_name }}</el-descriptions-item>
            <el-descriptions-item label="工厂名称" :span="3">{{
                follow_matter_info_data.factory_name
              }}
            </el-descriptions-item>
            <el-descriptions-item label="PO" :span="1">{{ follow_matter_info_data.po }}</el-descriptions-item>
            <el-descriptions-item label="完成状态" :span="1">
              <el-tag v-if="follow_matter_info_data.complete_status">完成</el-tag>
              <el-tag v-else type="warning">未完成</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否上传附件" :span="1">
              <el-tag v-if="follow_matter_info_data.is_file">有</el-tag>
              <el-tag v-else type="warning">无</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="完成时间" :span="3">{{
                follow_matter_info_data.complete_time
              }}
            </el-descriptions-item>
            <el-descriptions-item label="事务名称">{{ follow_matter_info_data.matter_name }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div style="margin-top: 5px" v-show="follow_matter_info_data.is_file">
          <el-table :data="annex_data_list" height="300" border v-loading="AnnexFileLoading">
            <el-table-column label="附件列表" align="center">
              <el-table-column property="index" label="#" align="center"></el-table-column>
              <el-table-column property="file_name" label="文件名称" width="350" align="center"></el-table-column>
              <el-table-column property="create_date" label="上传时间" width="180" align="center"></el-table-column>
              <el-table-column label="操作" width="180" align="center">
                <template v-slot="scope">
                  <el-button
                      size="mini"
                      type="text"
                      @click="DownloadAnnexFile(scope.row)"
                      v-if="download_file_method_list.includes('GET')"
                  >下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuperviseMattersView",
  data() {
    return {
      time_frame_list: [],
      search_start_time: null,
      search_end_time: null,
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
      dialogVisible: false,
      AnnexFileLoading: false,
      // 跟进人事务详情数据,附件信息
      follow_matter_info_data: {},
      annex_data_list: [],
      download_file_method_list: [],
      // 查询条件
      order_record_info_list: [],
      matter_name_list: [],
      order_id: null, // 查询的订单id
      matter_name_id: null, // 时间名称id
    };
  },
  created() {
    this.loading = true;
    this.getSuperviseMatters();
  },
  methods: {
    // 获取数据
    getSuperviseMatters() {
      let url = `work/supervise_matter_list/?page=${this.page}`
      // 条件1: radio_criteria
      if (this.radio_criteria && this.radio_criteria !== 'all') {
        url += `&status=${this.radio_criteria}`;
      }
      // 条件2: order_id
      if (this.order_id) {
        url += `&order_id=${this.order_id}`;
      }
      // 条件3: factory_id
      if (this.matter_name_id) {
        url += `&matter_name_id=${this.matter_name_id}`;
      }
      // 条件4：时间范围
      if (this.search_start_time) {
        url += `&start_time=${this.search_start_time}&end_time=${this.search_end_time}`;
      }
      this.$http
          .get(url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.SuperviseMattersData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.order_record_info_list = data.data.order_record_info_list;
              this.matter_name_list = data.data.matter_name_list;
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
    searchData() {
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
    reloadData() {
      this.order_id = null; // 查询的订单id
      this.matter_name_id = null; // 查询的工厂id
      this.time_frame_list = [];
      this.search_start_time = null;
      this.search_end_time = null;
      this.radio_criteria = 'all';
      this.getSuperviseMatters();
    },
    openCompleteMessageBox(row) {
      this.$confirm('请检查跟进人完成情况！完成事项后，按照当前的时间记录，请问是要完成码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.completeSuperviseMatter(row);
      }).catch(() => {
      });
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
      this.dialogVisible = true;
      this.AnnexFileLoading = true;
      this.$http
          .get(`work/supervise_matter_list/?details=follow&pk=${row.id}`)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.follow_matter_info_data = data.data.follow_matter_info_data;
              this.annex_data_list = data.data.annex_data_list;
              this.download_file_method_list = data.data.download_file_method_list;
            } else {
              this.follow_matter_info_data = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.AnnexFileLoading = false;
          });
    },
    dialogTableClose(done) {
      done(); // 关闭窗口
      this.follow_matter_info_data = [];
      this.follow_matter_info_data = {};
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

  },
}
</script>

<style scoped>
/*还没有调整完成*/
@media screen and (max-width: 700px) {
  .el-radio-button--small .el-radio-button__inner {
    padding: 7px 12px;
    font-size: 10px;
    border-radius: 0;
  }
  .supervision_matters .head_search .el-input__inner {
    height: 30px;
    line-height: 30px;
    padding: 0 15px;
    font-size: 10px;
    width: 120px;
  }
  .supervision_matters .head_search .el-input__icon {
    line-height: 30px;
  }
  .supervision_matters .head_search{
    flex-wrap: wrap;
  }
  .supervision_matters .head_search div {
    margin-right: 2px;
  }
  .supervision_matters .data_filter{
    margin-left: 0 !important;
  }
  .supervision_matters .data_filter .el-range-editor{
    width: 170px;
  }
  .supervision_matters .data_filter .el-date-editor .el-range-separator {
    line-height: 25px;
    font-size: 10px;
  }
  .supervision_matters .data_filter .el-date-editor .el-range__icon {
    font-size: 10px;
    line-height: 25px;
  }
  .supervision_matters .el-date-editor .el-range-input {
    font-size: 8px;
  }
  .supervision_matters .el-date-editor .el-range__close-icon {
    font-size: 10px;
    width: 10px;
    line-height: 25px;
  }
  .supervision_matters .head_search .filter_button{
    margin-top: 2px;
  }
  .supervision_matters .head_search .filter_button .el-button {
    padding: 9px 12px;
    font-size: 10px;
  }
  .supervision_matters .head_filter_criteria, .head_search {
    margin-bottom: 4px;
  }
  .el-drawer {
    width: 100% !important;
  }
}
</style>
