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
        <el-table-column label="事项名称" align="center" width="500">
          <template v-slot="{ row }">
          </template>
        </el-table-column>
        <el-table-column label="PO" align="center" width="180">
          <template v-slot="{ row }">
          </template>
        </el-table-column>
        <el-table-column label="ITEM列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-button  size="mini" type="text">
              ITEM列表
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="跟进人用户" align="center" width="180" prop="user_name">
        </el-table-column>
        <el-table-column label="应完成时间" align="center" width="180" prop="expected_completion_time">
        </el-table-column>
        <el-table-column label="完成状态" align="center" width="180">
          <template v-slot="{ row }">
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" width="180">
          <template v-slot="{ row }">
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template v-slot="scope">
            <!-- 完成后，隐藏申请延期按钮 -->
              <el-popover placement="top" width="160">
                <p>完成事项后，按照当前的时间记录，请问是要完成码？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" >否</el-button>
                  <el-button type="primary" size="mini">是</el-button>
                </div>
                <template v-slot:reference>
                  <el-button size="mini" type="text">完成事务</el-button>
                </template>
              </el-popover>
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
  name: "QcOrderWorkModule",
  data() {
    return {
      loading: false, // 数据加载样式
      special_matter_list:[],
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
    };
  },
  created() {

  },
  methods: {
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
