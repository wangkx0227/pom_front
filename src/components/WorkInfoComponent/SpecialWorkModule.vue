<template>
  <div class="special_work" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="radio_criteria" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="finish">完成</el-radio-button>
        <el-radio-button label="not_finish">未完成</el-radio-button>
      </el-radio-group>
    </div>
    <div class="head_search" style="display: flex">
      <div class="select_filter_po">
        <el-select v-model="order_id" filterable placeholder="根据PO筛选">
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
        <el-select v-model="factory_id" filterable placeholder="根据工厂筛选">
          <el-option v-for="item in factory_info_list"
                     :key="item.factory_id"
                     :label="item.factory_name"
                     :value="item.factory_id">
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
      <el-table
          lazy
          border
          ref="table"
          height="590"
          row-key="index"
          style="width: 100%"
          :load="LoadChildren"
          :data="special_matter_list"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" width="500" prop="matter_name">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.matter_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工厂名称" align="center" width="300" prop="factory_name">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.factory_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="PO" align="center" prop="po" width="180">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.po }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ITEM列表" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="row.child_node">{{ row.item }}</span>
            <el-button v-else size="mini" type="text" @click="getOrderRecordItem(row)"> 查看详情
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="跟进人用户" align="center" width="180" prop="user_name">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.user_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="描述信息" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="row.child_node"></span>
            <div v-else>
              <div v-if="row.is_link_description">
                <el-link :underline="false" icon="el-icon-video-play"
                         :href="row.description"
                         target="_blank" type="primary">视频地址
                </el-link>
              </div>
              <div v-else>
                <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom"
                            v-if="!row.editable">
                  <div class="cell ellipsis">{{ row.description }}</div>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
            <div v-if="row.child_node">
              <el-tag v-if="row.complete_time" effect="plain">已完成</el-tag>
              <el-tag type="info" effect="plain" v-else>未完成</el-tag>
            </div>
            <div v-else>
              <el-tag v-if="row.complete_status === 1" effect="plain">已完成</el-tag>
              <el-tag type="info" effect="plain" v-else>未完成</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180" prop="complete_time">
          <template v-slot="{ row }">
            <div v-if="row.child_node">
              <span>{{ row.complete_time }}</span>
            </div>
            <div v-else>
              <span v-if="row.complete_status === 1">{{ row.complete_time }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="90">
          <template v-slot="scope">
            <!-- 完成后，隐藏申请延期按钮 -->
            <div v-if="scope.row.child_node">
              <el-button v-if="!scope.row.complete_time" size="mini" type="text"
                         @click="ItemOpenCompleteMessageBox(scope.row)">点选完成
              </el-button>
            </div>
            <div v-else>
              <el-button
                  v-if="method_list.includes('PUT') && scope.row.complete_status === 0"
                  size="mini" type="text" @click="openCompleteMessageBox(scope.row)">点选完成
              </el-button>
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
          <el-table-column property="item" label="ITEM" width="300" align="center"></el-table-column>
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
      radio_criteria: 'all',
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
      search_start_time: null,
      search_end_time: null,
      // item列表
      item_list: [],
      dialogTableVisible: false,
      dialogTableLoading: false,
      // 查询的基本信息
      order_record_info_list: [],
      factory_info_list: [],
      order_id: null, // 查询的订单id
      factory_id: null, // 查询的工厂id
      // 存储子节点的数据对象
      mapData: new Map(),
    };
  },
  created() {
    this.loading = true;
    this.getSpecialMatterListData();
  },
  methods: {
    // 获取数据
    getSpecialMatterListData() {
      let url = `work/special_matter_list/?page=${this.page}`
      // 条件1: radio_criteria
      if (this.radio_criteria && this.radio_criteria !== 'all') {
        url += `&status=${this.radio_criteria}`;
      }
      // 条件2: order_id
      if (this.order_id) {
        url += `&order_id=${this.order_id}`;
      }
      // 条件3: factory_id
      if (this.factory_id) {
        url += `&factory_id=${this.factory_id}`;
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
              this.special_matter_list = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              this.delay_method_list = data.data.delay_method_list;
              this.annex_method_list = data.data.annex_method_list;
              this.order_record_info_list = data.data.order_record_info_list;
              this.factory_info_list = data.data.factory_info_list;
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
      this.search_start_time = null;
      this.search_end_time = null;
      this.order_id = null;
      this.factory_id = null;
      this.radio_criteria = 'all';
      this.$set(this.$refs["table"].store.states, "lazyTreeNodeMap", {});
      this.$set(this.$refs["table"].store.states, "treeData", {});
      this.getSpecialMatterListData();
    },
    // 完成事项按钮 - 不需要上传附件弹窗
    openCompleteMessageBox(row) {
      this.$confirm('完成事项后，按照当前的时间记录，请问是要完成？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.completeSpecialMatter(row);
      }).catch(() => {
      });
    },
    // 完成事项函数
    completeSpecialMatter(row) {
      this.loading = true;
      this.$http
          .put("work/special_matter_list/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.ReloadChildNodes(row);
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
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
    dialogItemTableClose(done) {
      done(); // 关闭窗口
    },
    // 懒加载显示item完成情况
    LoadChildren(tree, treeNode, resolve) {
      // tree 当前行的数据信息
      // treeNode 节点层级信息
      // 加载对象 resolve
      const data = {
        index: tree.index,
        matter_id: tree.id,
        order_record_info_id: tree.order_record_info_id,
        expected_completion_time: tree.expected_completion_time,
      };
      const url = `work/item_info_complete_time/?matter_id=${data.matter_id}&order_record_info_id=${data.order_record_info_id}&index=${data.index}&expected_completion_time=${data.expected_completion_time}`
      this.$http
          .get(url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              resolve(data.item_info_list);
              // 存储值到map对象中
              this.mapData.set(tree.id, {tree, treeNode, resolve});
            } else {
              resolve([]);
            }
          })
          .catch((error) => {
            resolve([]);
            this.$message.error(error.message);
          })
    },
    // 懒加载单条item点选完成
    ItemOpenCompleteMessageBox(row) {
      this.$confirm('确定只对当前ITEM选择完成？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.ItemCompleteSpecialMatter(row);
      }).catch(() => {
      });
    },
    ItemCompleteSpecialMatter(row) {
      this.loading = true;
      // 根据条件，父级id查找到保存在map对象中的节点信息
      this.$http
          .post("work/item_info_complete_time/?type=special", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              // 刷新父节点数据/子节点状态
              this.ReloadChildNodes(row)
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
          })
    },
    // 刷新子节点状态/父节点状态 LoadChildren 从而达到更新子节点信息的效果
    ReloadChildNodes(row) {
      // 通过row拿id值，根据这个id刷新子节点的完成状态
      let matter_id;
      if (row.matter_id) {
        matter_id = row.matter_id;
      } else {
        matter_id = row.id;
      }
      const {tree, treeNode, resolve} = this.mapData.get(parseInt(matter_id))
      this.$set(this.$refs.table.store.states.lazyTreeNodeMap, parseInt(matter_id), [])
      this.LoadChildren(tree, treeNode, resolve);
      this.getSpecialMatterListData();
    }
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

@media screen and (max-width: 700px) {


  /*下拉框*/
  .special_work .head_search .el-input__inner {
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    font-size: 10px;
    width: 158px;
  }

  .special_work .head_search .el-input__icon {
    line-height: 30px;
    font-size: 10px;
  }

  .special_work .head_search {
    flex-wrap: wrap;
  }

  .special_work .data_filter {
    margin-left: 0 !important;
  }

  /*日期选择框样式*/
  .special_work .head_search .data_filter, .filter_button {
    margin-top: 3px;
  }

  .special_work .data_filter .el-range-editor {
    width: 180px;
  }


  /*样式按钮*/
  .special_work .head_search .filter_button .el-button {
    padding: 9px 12px;
    font-size: 10px;
  }

  .special_work .head_filter_criteria, .head_search {
    margin-bottom: 4px;
  }


}
</style>
