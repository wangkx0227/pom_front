<template>
  <div class="no_matter_log" v-loading="loading">
    <div class="head_search_add">
      <el-input placeholder="请输入PO信息" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="MatterInfoData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="客户ID" align="center" prop="client_id"></el-table-column>
        <el-table-column label="PO" align="center" prop="po"></el-table-column>
        <el-table-column label="工厂" align="center" prop="factory_name"></el-table-column>
        <el-table-column label="ITEM列表" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" > 查看详情
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="订单周期" align="center"  prop="end_time_day"></el-table-column>
        <el-table-column label="订单导入时间" align="center"  prop="create_date"></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="text">修改
            </el-button>
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
      loading: false, // 数据加载样式
      MatterInfoData: [], // 数据
      search: null, // 搜索内容
      method_list: [], // 权限
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,

    };
  },
  created() {
    this.loading = true;
    this.getMatterInfoData();
  },
  methods: {
    // 获取数据
    getMatterInfoData() {
      let get_url;
      if (!this.search) {
        get_url = `business_function/matter_changes/?page=${this.page}`;
      } else {
        get_url = `business_function/matter_changes/?page=${this.page}&search=${this.search}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.MatterInfoData = data.data.matter_info_data_list;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.MatterInfoData = [];
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
      this.getMatterInfoData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getMatterInfoData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getMatterInfoData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      this.page = 1;
      this.getMatterInfoData();
    },
    // 重置
    reloadData() {
      this.loading = true;
      this.page = 1;
      this.search = null;
      this.getMatterInfoData();
    },
  },
}
</script>
<style>
</style>
