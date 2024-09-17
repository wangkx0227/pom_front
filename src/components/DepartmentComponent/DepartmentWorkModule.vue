<template>
  <div class="work" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="status_radio" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="finish">完成</el-radio-button>
        <el-radio-button label="not_finish">未完成</el-radio-button>
      </el-radio-group>
    </div>
    <div class="head_filter_criteria">
      <el-radio-group v-model="type_radio" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="order_matter">订单事项</el-radio-button>
        <el-radio-button label="supervise">监督事项</el-radio-button>
        <el-radio-button label="no_order_matter">非订单事项</el-radio-button>
        <el-radio-button label="special">特殊事项</el-radio-button>
      </el-radio-group>
    </div>
    <div class="head_search" style="display: flex;">
      <div class="select_filter">
        <el-select v-model="user_id" placeholder="请根据用户筛选">
          <el-option v-for="item in user_info_list" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="data_filter" style="margin-left:5px">
        <el-date-picker v-model="time_frame_list" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" style="margin-right: 5px;">
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
      <el-table :data="department_matter_list" style="width: 100%" height="550">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" prop="matter_name" width="500">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="事务负责人" align="center" prop="user_name">
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="事务类型" align="center">
          <template v-slot="{ row }">
            <el-tag v-if="row.type === 'order_matter'" type="success">订单类型</el-tag>
            <el-tag v-if="row.type === 'no_order_matter'" type="info">非订单类型</el-tag>
            <el-tag v-if="row.type === 'special'">特殊类型</el-tag>
            <el-tag v-if="row.type === 'supervise'">监督类型</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成状态" align="center">
          <template v-slot="{ row }">
            <el-tag v-if="row.complete_status === 1" effect="plain">完成</el-tag>
            <el-tag v-else type="danger" effect="plain">未完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" prop="complete_time" width="180">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="text" @click="getModuleInfo(scope.row)">
              查看事务详情
            </el-button>
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
    <div class="matter_drawer">
      <el-drawer :visible.sync="ModuleDrawer" direction="rtl" :before-close="DrawerClose" size="45%">
        <div class="DrawerLoading">
          <el-skeleton :rows="6" animated :loading="DrawerLoading"/>
        </div>
        <template slot="title">
          <h3>事务信息详情</h3>
        </template>
        <div class="DrawerContent" v-if="!DrawerLoading" style="margin-left: 5px;">
          <div class="matter_info">
            <el-descriptions direction="vertical" :column="4" border>
              <el-descriptions-item label="事务负责人">{{ this.matter_info.user_name }}</el-descriptions-item>
              <el-descriptions-item label="PO">{{ this.matter_info.po }}</el-descriptions-item>
              <el-descriptions-item label="ITEM信息" :span="2">
                  <span v-if="!this.matter_info.order_record_id">无</span>
                  <el-button v-else size="mini" type="text">
                    查看ITEM列表
                  </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="工厂名称">{{ this.matter_info.factory_name }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <el-divider></el-divider>
          <div class="delay_table">
            <el-table :data="DelayData" style="width: 100%" height="275" border>
              <el-table-column label="延期列表" align="center">
                <el-table-column prop="index" label="#"  align="center">
                </el-table-column>
                <el-table-column prop="old_time" label="原项目完成时间" width="180" align="center">
                </el-table-column>
                <el-table-column prop="delay_day" label="延期时间" width="180" align="center">
                </el-table-column>
                <el-table-column prop="new_time" label="新事项完成时间" width="180" align="center">
                </el-table-column>
                <el-table-column prop="delay_number" label="申请次数" width="180" align="center">
                </el-table-column>
                <el-table-column prop="delay_examine_status" label="审核状态" width="180" align="center">
                  <template v-slot="{ row }">
                    <el-tag v-if="row.delay_examine_status" effect="plain">已审核</el-tag>
                    <el-tag v-else effect="plain" type="danger">未审核</el-tag>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </div>
          <el-divider></el-divider>
          <div class="file_table">
            <el-table :data="fileData" style="width: 100%" border height="275">
              <el-table-column label="附件列表" align="center">
                <el-table-column prop="index" label="#"  align="center">
                </el-table-column>
                <el-table-column prop="file_name" label="文件名称" width="350" align="center">
                </el-table-column>
                <el-table-column prop="create_date" label="上传时间" width="180" align="center">
                </el-table-column>
                <el-table-column  label="操作" width="180" align="center">
                  <template v-slot="{ row }">
                    <el-button size="mini" type="text">
                      下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
// 按钮权限还没有进行设置
export default {
  name: "DepartmentWorkModule",
  data() {
    return {
      user_id: null, // 用户的id
      status_radio: 'all', // 查询状态条件
      type_radio: 'all', // 查询类型条件
      user_info_list: [], // 当前管理的部门下的用户id列表
      time_frame_list: [], // 按照时间搜索变量
      search_start_time: "",
      search_end_time: "",
      // 查询数据列表
      department_matter_list: [],
      loading: false, // 数据加载样式
      addLoading: false, // 控制弹窗创建按钮
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 可访问权限列表
      method_list: [],
      // 弹窗变量
      ModuleDrawer: false,
      DrawerLoading: false,
      // 附件信息
      fileData: [],
      // 延期信息
      DelayData: [],
      // 基础信息
      matter_info: {},
    };
  },
  created() {
    this.loading = true;
    this.getDepartmentWorkListData();
  },
  methods: {
    // 获取数据
    getDepartmentWorkListData() {
      let get_url;
      if (!this.search_start_time) {
        get_url = `work/departmental_matter_list/?page=${this.page}`;
      } else {
        get_url = `work/departmental_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.department_matter_list = data.data.get_departmental_data_list;
              this.user_info_list = data.data.select_user_list;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.data_total = data.data.data_total;
            } else {
              this.department_matter_list = [];
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
      this.getDepartmentWorkListData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getDepartmentWorkListData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getDepartmentWorkListData();
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
      this.getDepartmentWorkListData();
    },
    // 重置
    reloadData() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.status_radio = 'all';
      this.type_radio = 'all';
      this.getDepartmentWorkListData();
    },
    // 查看事务
    getModuleInfo(row) {
      this.ModuleDrawer = true;
      this.DrawerLoading = true;
      this.$http
          .post("work/departmental_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.matter_info = data.data.matter_info;
              this.DelayData = data.data.matter_delay_list;
              this.fileData = data.data.matter_file_list;
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.DrawerLoading = false;
          });
    },
    // 抽屉函数
    DrawerClose(done) {
      done();
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
</style>
