<template>
  <div class="order_record_info" v-loading="loading">
    <div class="head_search_add">
      <el-input placeholder="请输入PO进行查询" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="order_record_info_list" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="客户ID" align="center" prop="client_id">
        </el-table-column>
        <el-table-column label="PO" align="center" prop="po">
        </el-table-column>
        <el-table-column label="ITEM" align="center" prop="item">
        </el-table-column>
        <el-table-column label="工厂代码" align="center" prop="factory_code">
        </el-table-column>
        <el-table-column label="工厂名称" align="center" width="300" prop="factory_name">
        </el-table-column>
        <el-table-column label="跟进人姓名" align="center" prop="follow_user_name">
        </el-table-column>
        <el-table-column label="订单周期（天）" align="center" prop="end_time_day">
        </el-table-column>
        <el-table-column label="订单导入时间" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="是否异常（生成对应事项）" align="center" width="230" prop="is_exceptional">
          <template v-slot="{ row }">
            <el-tag v-if="row.is_exceptional" type="danger">是</el-tag>
            <el-tag v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button v-if="scope.row.is_exceptional" size="mini" type="text" @click="OrderStopOrRepair(scope.row,'repair')">事项修复</el-button>
            <el-divider v-if="scope.row.is_exceptional" direction="vertical"></el-divider>
            <el-button size="mini" type="text" @click="OrderStopOrRepair(scope.row,'stop')">事项终止</el-button>
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
  name: "OrderRecordInfoModule",
  data() {
    return {
      search: "", // 搜索
      order_record_info_list: [], // 查询
      loading: false, // 数据加载样式
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
    };
  },
  created() {
    this.loading = true;
    this.getOrderRecordData();
  },
  methods: {
    // 获取数据
    getOrderRecordData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/order_record_info/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/order_record_info/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.order_record_info_list = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.order_record_info_list = [];
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
      this.getOrderRecordData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getOrderRecordData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getOrderRecordData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getOrderRecordData();
      } else {
        this.getOrderRecordData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getOrderRecordData();
    },
    // 异常修复/事项终止
    OrderStopOrRepair(row,status){
      this.loading = true;
      row.status = status;
      this.$http
          .put("business_function/order_record_info/",{data:row})
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getOrderRecordData();
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
};
</script>


