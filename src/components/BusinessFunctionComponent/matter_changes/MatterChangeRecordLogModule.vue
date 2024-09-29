<template>
  <div class="no_matter" v-loading="loading">
    <div class="head_search_add">
      <el-input placeholder="请输入PO号" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="MatterChangeRecord" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="PO" align="center" width="120" prop="po">
        </el-table-column>
        <el-table-column label="ITEM列表" align="center" width="120">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" @click="getOrderRecordItem(row)" v-if="order_record_info_method.includes('GET')"> 查看详情
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" width="120">
          <template v-slot="{ row }">
            <el-tag v-if="row.type === 'matter'" effect="plain">跟进</el-tag>
            <el-tag type="info" effect="plain" v-else>监督</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变更时间" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="事务名称" align="center" width="500" prop="matter_name">
        </el-table-column>
        <el-table-column label="变更内容" align="center" width="500" prop="description">
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage" @next-click="nextPage"
                     background layout="total,prev, pager, next" :page-size="10" :total="data_total"
                     v-model:current-page="page">
      </el-pagination>
    </div>
    <div class="dialog">
      <el-dialog title="ITEM详情列表" :visible.sync="dialogTableVisible" :before-close="dialogItemTableClose" width="30%">
        <el-table :data="item_list" height="200" border v-loading="dialogTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="item" label="ITEM" width="450" align="center"></el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: "MatterRecordModule",
  data() {
    return {
      search: "", // 搜索
      MatterChangeRecord: [], // 查询
      loading: false, // 数据加载样式
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 可访问权限列表
      method_list: [],
      order_record_info_method: [],
      // item列表
      item_list: [],
      dialogTableVisible: false,
      dialogTableLoading: false,
    };
  },
  created() {
    this.loading = true;
    this.getMatterChangeRecordData();
  },
  methods: {
    // 获取数据
    getMatterChangeRecordData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/matter_changes_record_log/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/matter_changes_record_log/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.MatterChangeRecord = data.data.matter_info_data_list;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.order_record_info_method = data.data.order_record_info_method;
            } else {
              this.MatterChangeRecord = [];
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
      this.getMatterChangeRecordData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getMatterChangeRecordData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getMatterChangeRecordData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getMatterChangeRecordData();
      } else {
        this.getMatterChangeRecordData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getMatterChangeRecordData();
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
