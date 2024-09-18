<template>
  <div class="delay_work" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="type_radio" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="order_matter">未审核</el-radio-button>
        <el-radio-button label="supervise">已审核</el-radio-button>
        <el-radio-button label="no_order_matter">拒绝</el-radio-button>
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
      <el-table :data="department_matter_list" style="width: 100%" height="590">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" prop="matter_name" width="500">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="事务负责人" align="center" prop="user_name" width="180">
        </el-table-column>
        <el-table-column label="PO" align="center" width="180">
        </el-table-column>
        <el-table-column label="ITEM" align="center" width="180">
        </el-table-column>
        <el-table-column label="事务类型" align="center"  width="180">
          <template v-slot="{ row }">
            <el-tag v-if="row.type === 'order_matter'" type="success">订单</el-tag>
            <el-tag  v-else-if="row.type === 'no_order_matter'" type="info">非订单</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="事务完成状态" align="center"  width="180">
        </el-table-column>
        <el-table-column label="旧完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="延期天数" align="center" width="180">
        </el-table-column>
        <el-table-column label="申请次数" align="center" width="180">
        </el-table-column>
        <el-table-column label="新完成时间" align="center" width="180">
        </el-table-column>
        <el-table-column label="延期审核状态" align="center" width="180">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="text">
              审批
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
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
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
              this.user_info_list = data.data.select_user_list;
              this.department_matter_list = data.data.get_departmental_data_list;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.order_record_info_method_list = data.data.order_record_info_method_list;
              this.download_file_method_list = data.data.download_file_method_list;
              
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
