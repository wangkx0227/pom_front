<template>
  <div class="factory_bind_user" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="addNotice">添加公告</el-button>
      <el-input placeholder="请输入公告标题"  clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="factoryData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="标题" align="center" prop="factory_name">
        </el-table-column>
        <el-table-column label="公告类型" align="center" prop="factory_code">
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_date">
        </el-table-column>
        <el-table-column label="更新时间	" align="center" prop="update_date">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button v-if="!scope.row.editable"  size="mini"
                       type="text">编辑
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button v-if="!scope.row.editable"  size="mini"
                       type="text">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage"
                     @next-click="nextPage" background layout="total,prev, pager, next" :page-size="10"
                     :total="data_total" v-model:current-page="page">
      </el-pagination>
    </div>

    <div class="notice_drawer">
      <el-drawer
          size="50%"
          title="我是标题"
          :visible.sync="drawer"
          direction="rtl"
          :before-close="NoticeHandleClose">

      </el-drawer>
    </div>
  </div>
</template>

<script>
export default {
  name: "FactoryBindUser",
  data() {
    return {
      // 抽屉的变量
      drawer: false,
      loading: false, // 数据加载样式
      factoryData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
    };
  },
  created() {
    this.loading = true;
    this.getFactoryDate();

  },
  methods: {
    // 获取数据
    getFactoryDate() {
      this.loading = false;
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getFactoryDate();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getFactoryDate();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getFactoryDate();
      }
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      this.page = 1;
      this.getFactoryDate();
    },
    // 重置
    reloadDate() {
      this.page = 1;
      this.getFactoryDate();
    },
    // 添加公告
    addNotice(){
      this.drawer = true;
    },
    // 抽屉的函数
    NoticeHandleClose(done) {
      done();
    }
  },
}
</script>

<style>
</style>