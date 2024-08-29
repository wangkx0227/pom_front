<template>
  <div class="work" v-loading="loading">
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
      <el-table :data="special_matter_list" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" width="500" prop="matter_name">
        </el-table-column>
        <el-table-column label="事项名称" align="center" width="180" prop="factory_name">
        </el-table-column>
        <el-table-column label="PO" align="center" prop="po" width="180">
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
        <el-table-column label="描述信息" align="center" width="180">
          <template v-slot="{ row }">
            <div v-if="row.is_link_description">
            <el-link :underline="false" icon="el-icon-video-play"
                     :href="row.description"
                     target="_blank" type="primary">视频地址</el-link>
            </div>
            <div v-else>
              <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom" v-if="!row.editable">
                <div class="cell ellipsis">{{ row.description }}</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
            <el-tag type="success" v-if="row.complete_status === 1">已完成</el-tag>
            <el-tag type="danger" v-else>未完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180" prop="complete_time">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <!-- 完成后，隐藏申请延期按钮 -->
            <div v-if="method_list.includes('PUT') && scope.row.complete_status === 0">
              <el-popover placement="top" width="160" v-model="scope.row.visible">
                <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">否</el-button>
                  <el-button type="primary" size="mini" @click="completeSpecialMatter(scope.row)">是</el-button>
                </div>
                <template v-slot:reference>
                  <el-button size="mini" type="text">完成事务</el-button>
                </template>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
  name: "QcOrderWorkModule",
  data() {
    return {
      loading: false, // 数据加载样式
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 数据列表
      special_matter_list: [],
      // 权限列表
      method_list: [],
      // 搜索变量
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      // item列表
      item_list: [],
      dialogTableVisible: false,
      dialogTableLoading: false,
    };
  },
  created() {
    this.getSpecialMatterListData();
  },
  methods: {
    // 获取数据
    getSpecialMatterListData() {
      this.loading = true;
      let get_url;
      if (!this.search_start_time) {
        get_url = `work/special_matter_list/?page=${this.page}`;
      } else {
        get_url = `work/special_matter_list/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.special_matter_list = data.data.data;
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
      this.getSpecialMatterListData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getSpecialMatterListData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getSpecialMatterListData();
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
      this.getSpecialMatterListData();
    },
    // 重置
    reloadData() {
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getSpecialMatterListData();
    },
    // 完成事项函数
    completeSpecialMatter(row) {
      row.visible = false;
      this.$http
          .put("work/special_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getSpecialMatterListData();
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
    // 获取ITEM列表
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
    // ITEM弹窗回调
    dialogItemTableClose(done){
      done(); // 关闭窗口
    },
  },
};
</script>

<style>
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
