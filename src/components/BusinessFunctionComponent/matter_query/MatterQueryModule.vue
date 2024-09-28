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
            <el-button size="mini" type="text" @click="getOrderRecordItem(row)"> 查看详情
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="订单周期" align="center" prop="end_time_day"></el-table-column>
        <el-table-column label="订单导入时间" align="center" prop="create_date"></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="text" @click="openUpdateDrawer(scope.row)">变更修改
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
    <div class="dialog">
      <el-dialog title="ITEM详情列表" :visible.sync="dialogTableVisible" :before-close="dialogItemTableClose" width="30%">
        <el-table :data="item_list" height="200" border v-loading="dialogTableLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="item" label="ITEM" width="450" align="center"></el-table-column>
        </el-table>
      </el-dialog>
    </div>
    <div class="drawer">
      <el-drawer
          :title="drawer_title"
          size="60%"
          :wrapperClosable="false"
          :show-close="true"
          :visible.sync="DrawerVisible">
        <div class="content" :v-loading="drawerLoading">
          <div class="follow">
            <el-table
                :data="follow_data_list"
                border
                height="400"
                style="width: 100%">
              <el-table-column
                  prop="date"
                  label="跟进事务信息"
                  align="center"
              >
                <el-table-column
                    prop="matter_name"
                    label="事务名称"
                    width="450"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    label="跟进人"
                    width="230"
                    align="center"
                >
                  <template v-slot="{ row }">
                    <span v-if="!row.editable">{{ row.user_name }}</span>
                    <el-cascader
                        v-else
                        clearable
                        collapse-tags
                        :options="user_data_list"
                        v-model="row.user_info_id_list"
                        :show-all-levels="false">
                      <template slot-scope="{ node, data }">
                        <span>{{ data.label }}</span>
                        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                      </template>
                    </el-cascader>
                  </template>
                </el-table-column>
                <el-table-column
                    label="事务状态"
                    align="center"
                    width="120"
                >
                  <template v-slot="{ row }">
                    <el-tag v-if="row.is_show === 1" effect="plain">正常</el-tag>
                    <el-tag type="info" effect="plain" v-else>停止</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                    label="应完成时间"
                    align="center"
                    width="250"
                >
                  <template v-slot="{ row }">
                    <span v-if="!row.editable">{{ row.expected_completion_time }}</span>
                    <el-date-picker
                        v-model="row.expected_completion_time"
                        type="date"
                        v-else
                        placeholder="选择日期">
                    </el-date-picker>
                  </template>
                </el-table-column>
                <el-table-column
                    label="完成状态"
                    align="center"
                    width="120"
                >
                  <template v-slot="{ row }">
                    <el-tag v-if="row.complete_status === 1" effect="plain">已完成</el-tag>
                    <el-tag type="info" effect="plain" v-else>未完成</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="complete_time"
                    label="实际完成时间"
                    align="center"
                    width="250"
                >
                </el-table-column>
                <el-table-column label="操作" align="center" width="120">
                  <template v-slot="scope">
                    <el-button v-if="!scope.row.editable" size="mini" type="text" width="180"
                               :disabled="ButtonStatusChanges(scope.row)"
                               @click="editRow(scope.row)">修改
                    </el-button>
                    <el-button v-else size="mini" type="text" width="180" :disabled="ButtonStatusChanges(scope.row)"
                               @click="updateMatter(scope.row)">保存
                    </el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button v-if="scope.row.editable" size="mini" type="text" width="180"
                               @click="scope.row.editable = false">取消
                    </el-button>
                    <el-button v-else size="mini" type="text" width="180" :disabled="ButtonStatusChanges(scope.row)"
                               @click="stopMatter(scope.row)">终止
                    </el-button>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </div>
          <div class="supervise">
            <el-table
                :data="supervise_data_list"
                border
                height="400"
                style="width: 100%">
              <el-table-column
                  prop="date"
                  label="监督事务信息"
                  align="center"
              >
                <el-table-column
                    prop="matter_name"
                    label="监督事务名称"
                    width="450"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    label="监督人"
                    width="230"
                    align="center"
                >
                  <template v-slot="{ row }">
                    <span v-if="!row.editable">{{ row.user_name }}</span>
                    <el-cascader
                        v-else
                        clearable
                        collapse-tags
                        :options="user_data_list"
                        v-model="row.user_info_id_list"
                        :show-all-levels="false">
                      <template slot-scope="{ node, data }">
                        <span>{{ data.label }}</span>
                        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                      </template>
                    </el-cascader>
                  </template>
                </el-table-column>
                <el-table-column
                    label="事务状态"
                    align="center"
                    width="120"
                >
                  <template v-slot="{ row }">
                    <el-tag v-if="row.is_show === 1" effect="plain">正常</el-tag>
                    <el-tag type="info" effect="plain" v-else>停止</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                    label="应完成时间"
                    align="center"
                    width="250"
                >
                  <template v-slot="{ row }">
                    <span v-if="!row.editable">{{ row.expected_completion_time }}</span>
                    <el-date-picker
                        v-model="row.expected_completion_time"
                        type="date"
                        v-else
                        placeholder="选择日期">
                    </el-date-picker>
                  </template>
                </el-table-column>
                <el-table-column
                    label="完成状态"
                    align="center"
                    width="120"
                >
                  <template v-slot="{ row }">
                    <el-tag v-if="row.complete_status === 1" effect="plain">已完成</el-tag>
                    <el-tag type="info" effect="plain" v-else>未完成</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="complete_time"
                    label="实际完成时间"
                    align="center"
                    width="250"
                >
                </el-table-column>
                <el-table-column label="操作" align="center" width="120">
                  <template v-slot="scope">
                    <el-button v-if="!scope.row.editable" size="mini" type="text" width="180"
                               :disabled="ButtonStatusChanges(scope.row)"
                               @click="editRow(scope.row)">修改
                    </el-button>
                    <el-button v-else size="mini" type="text" width="180" :disabled="ButtonStatusChanges(scope.row)"
                               @click="updateMatter(scope.row)">保存
                    </el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button v-if="scope.row.editable" size="mini" type="text" width="180"
                               @click="scope.row.editable = false">取消
                    </el-button>
                    <el-button v-else size="mini" type="text" width="180" :disabled="ButtonStatusChanges(scope.row)"
                               @click="stopMatter(scope.row)">终止
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
      // item列表
      item_list: [],
      dialogTableVisible: false,
      dialogTableLoading: false,
      // 抽屉变量
      DrawerVisible: false,
      drawer_title: null,
      drawerLoading: false,
      // 修改-抽屉样式内的数据
      follow_data_list: [],
      supervise_data_list: [],
      // 用户信息列表
      user_data_list: [], // 循环的全部用户列表
    };
  },
  created() {
    this.loading = true;
    this.getUsers();
    this.getOrderInfoData();
  },
  methods: {
    // 获取数据
    getOrderInfoData() {
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
    getUsers() {
      this.$http
          .get("users/info/?status=classification")
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.user_data_list = data.data;
            } else {
              this.user_data_list = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            // this.loading = false;
          });
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getOrderInfoData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getOrderInfoData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getOrderInfoData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      this.page = 1;
      this.getOrderInfoData();
    },
    // 重置
    reloadData() {
      this.loading = true;
      this.page = 1;
      this.search = null;
      this.getOrderInfoData();
    },
    // 作为item 弹窗的关闭窗口调用函数
    dialogItemTableClose(done) {
      done(); // 关闭窗口
    },
    // item列表查看，调用post方法查看
    getOrderRecordItem(row) {
      this.dialogTableVisible = true;
      this.dialogTableLoading = true;
      const order_record_id = row.id;
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
    // 页面的修改按钮函数-展示当前订单内的产生的事务
    openUpdateDrawer(row) {
      this.DrawerVisible = true;
      this.drawerLoading = true;
      this.drawer_title = `${row.po}订单事务信息`
      this.getMatterInfoData(row.id);
    },
    // 获取订单下的事务信息
    getMatterInfoData(pk) {
      this.$http
          .post('business_function/matter_changes/', {
            pk: pk
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.follow_data_list = data.data.follow_data_list;
              this.supervise_data_list = data.data.supervise_data_list;
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.drawerLoading = false;
          });
    },
    // 计算按钮是否停止和修改可以点击
    ButtonStatusChanges(row) {
      return row.complete_status === 1 || row.is_show === 0;
    },
    // 修改按钮，修改row.editable值 让这条可以进行修改
    editRow(row) {
      row.editable = true;
    },
    // 事务的停止操作 - 调用put接口
    stopMatter(row) {
      const attribute = 'stop'
      this.drawerLoading = true;
      this.$http
          .put(`business_function/matter_changes/?attribute=${attribute}`, {
            data: row
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$notify({
                title: '成功',
                message: data.message,
                type: 'success',
                offset: 30,
                duration: 2000,
              });
              // 调用函数刷新数据
              this.getMatterInfoData(data.order_id);
            } else {
              this.$notify({
                title: '错误',
                message: data.message,
                type: 'error',
                offset: 30,
                duration: 2000,
              });
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.drawerLoading = false;
          });
    },
    // 事务的修改操作 - 调用put接口
    updateMatter(row) {
      this.drawerLoading = true;
      const attribute = 'update'
      const user_id = row.user_info_id_list.slice().pop()
      let date = new Date(row.expected_completion_time);
      row.user_id = user_id
      row.expected_completion_time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      this.$http
          .put(`business_function/matter_changes/?attribute=${attribute}`, {
            data: row
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$notify({
                title: '成功',
                message: data.message,
                type: 'success',
                offset: 30,
                duration: 2000,
              });
              this.getMatterInfoData(data.order_id);
            } else {
              this.$notify({
                title: '错误',
                message: data.message,
                type: 'error',
                offset: 30,
                duration: 2000,
              });
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            row.editable = false;
            this.drawerLoading = false;
          });
    }
  },

}
</script>
<style scoped>
.content {
  width: 95%;
  margin: 0 auto;
}

.supervise {
  margin-top: 10px;
}
</style>
