<template>
  <div class="supervision_matters" v-loading="loading">
    <div class="head_filter_criteria">
      <el-radio-group v-model="radio_criteria" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="finish">完成</el-radio-button>
        <el-radio-button label="perform">进行中</el-radio-button>
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
      <div class="select_filter_matter_name" style="margin-left:5px">
        <el-select v-model="matter_name_id" filterable placeholder="根据事项名筛选">
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
      <el-table
          lazy
          ref="table"
          height="590"
          row-key="index"
          style="width: 100%"
          :load="LoadChildren"
          :data="SuperviseMattersData"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column prop="index" label="#" align="center" width="100"></el-table-column>
        <el-table-column prop="po" label="PO" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.po }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="matter_name" label="事项名称" width="500" align="center">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.matter_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监督事项详情" align="center" prop="" width="180">
          <template v-slot="{ row }">
            <span v-if="row.child_node">{{ row.item }}</span>
            <el-button v-else size="mini" type="text" @click="getMatterInfo(row)"> 查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="催跟进记录" align="center" width="180" prop="complete_time">
          <template v-slot="{ row }">
            <div v-if="row.child_node">
              <span>--</span>
            </div>
            <div v-else>
              <el-button size="mini" type="text" @click="getUrgeFollow(row)">查看记录</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="监督人" align="center" prop="user_name">
          <template v-slot="{ row }">
            <span v-if="row.child_node">--</span>
            <span v-else>{{ row.user_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
            <div v-if="row.child_node">
              <el-tag v-if="row.complete_time" effect="plain">已完成</el-tag>
              <el-tag type="info" effect="plain" v-else>未完成</el-tag>
            </div>
            <div v-else>
              <el-tag v-if="row.complete_status === 1" effect="plain">已完成</el-tag>
              <el-tag v-else-if="row.complete_status === 2" effect="plain" type="warning">进行中</el-tag>
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
        <el-table-column label="操作" align="center" width="140" class-name="operation">
          <template v-slot="scope">
            <!-- 完成后，隐藏申请延期按钮 -->
            <div v-if="scope.row.child_node">
              <el-button v-if="!scope.row.complete_time" size="mini" type="text"
                         @click="ItemOpenCompleteMessageBox(scope.row)"
                         >点选完成
              </el-button>
            </div>
            <div v-else>
              <div v-if="method_list.includes('PUT') && scope.row.complete_status !== 1" style="display: inline-block;">
                <el-button size="mini" type="text" @click="openCompleteMessageBox(scope.row)">点选完成</el-button>
              </div>
              <div style="display: inline;" v-if="method_list.includes('PUT') && scope.row.order_matter_status !== 1 && scope.row.complete_status !== 1">
                <el-divider direction="vertical"></el-divider>
              </div>
              <div style="display: inline-block;" v-if="scope.row.order_matter_status !== 1">
                <!--  如果跟进事务跟进人完成了就需要隐藏-->
                <el-button size="mini" type="text" @click="UrgeFollow(scope.row)">催跟进</el-button>
              </div>
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
              <el-tag v-if="follow_matter_info_data.is_file">是</el-tag>
              <el-tag v-else type="warning">否</el-tag>
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
                  >下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </div>
    <!--   催促信息列表 -->
    <div class="work_dialog">
      <el-dialog title="催促记录详情列表" :visible.sync="UrgeFollowDialogVisible" :before-close="urgeTableClose"
                 width="30%">
        <el-table :data="urge_follow_data" height="200" border v-loading="UrgeFollowLoading">
          <el-table-column property="index" label="#" align="center"></el-table-column>
          <el-table-column property="create_date" label="催促时间" width="450" align="center"></el-table-column>
        </el-table>
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
      // 催促记录弹窗
      UrgeFollowDialogVisible: false,
      UrgeFollowLoading: false,
      urge_follow_data: [],
      mapData: new Map(),
    };
  },
  created() {
    this.loading = true;
    this.getSuperviseMatters();
  },
  methods: {
    // 获取数据
    getSuperviseMatters() {
      // 添加如果展开了子节点，就进行闭合
      if (this.$refs.table){
        this.$set(this.$refs["table"].store.states, "lazyTreeNodeMap", {});
        this.$set(this.$refs["table"].store.states, "treeData", {});
      }
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
      this.$set(this.$refs["table"].store.states, "lazyTreeNodeMap", {});
      this.$set(this.$refs["table"].store.states, "treeData", {});
      this.getSuperviseMatters();
    },
    openCompleteMessageBox(row) {
      this.$confirm('请检查跟进人完成情况！完成事项后，按照当前的时间记录，请问是要完成？', '提示', {
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
              // 刷新节点
              if (this.mapData.size !== 0) {
                this.ReloadChildNodes(row);
              } else {
                this.getSpecialMatterListData();
              }
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
    // 催跟进
    UrgeFollow(row) {
      this.$http
          .post("work/supervise_matter_list/", {
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
          })
    },
    // 存储记录
    getUrgeFollow(row) {
      this.UrgeFollowDialogVisible = true;
      this.UrgeFollowLoading = true;
      this.$http
          .get(`work/supervise_matter_list/?details=urge&pk=${row.id}`)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.urge_follow_data = data.data.urge_follow_data;
            } else {
              this.urge_follow_data = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.UrgeFollowLoading = false;
          });
    },
    urgeTableClose(done) {
      done();
      this.urge_follow_data = [];
    },
    // 懒加载显示item完成情况
    LoadChildren(tree, treeNode, resolve) {
      // tree 当前行的数据信息
      // treeNode 节点层级信息
      // 加载对象 resolve
      this.loading = true;
      const data = {
        index: tree.index,
        matter_id: tree.id,
        order_record_info_id: tree.order_record_info_id || null,
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
      this.getSuperviseMatters();
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
          .post("work/item_info_complete_time/?type=supervise", {
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
    },
  },
}
</script>

<style>
/*还没有调整完成*/
@media screen and (max-width: 700px) {
  .supervision_matters .head_search .el-input__inner {
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    font-size: 10px;
    width: 158px;
  }

  .supervision_matters .head_search .el-input__icon {
    line-height: 30px;
    font-size: 10px;
  }

  .supervision_matters .head_search {
    flex-wrap: wrap;
  }

  .supervision_matters .data_filter {
    margin-left: 0 !important;
  }

  /*日期选择框样式*/
  .supervision_matters .head_search .data_filter, .filter_button {
    margin-top: 3px;
  }

  .supervision_matters .data_filter .el-range-editor {
    width: 180px;
  }

  /*样式按钮*/
  .supervision_matters .head_search .filter_button .el-button {
    padding: 9px 12px;
    font-size: 10px;
  }

  .supervision_matters .head_filter_criteria, .head_search {
    margin-bottom: 4px;
  }

  .supervision_matters .el-button--text {
    padding: 1px !important;
  }

  .supervision_matters .operation .cell {
    display: flex;
  }
}
</style>
