<template>
  <div class="personal_access" v-loading="loading">
    <el-card class="box-card">
      <div class="head_search_add">
        <el-date-picker v-model="time_frame_list" type="datetimerange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" style="margin-right: 5px;">
        </el-date-picker>
        <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
        </el-button>
        <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
        </el-button>
      </div>
      <div class="table_content">
        <div style="margin: 5px 0">
          <el-alert title="注意：" type="info"
                    description="根据用查看，当个人在什么时间段内点击了什么按钮，访问了哪些菜单！读取：访问 修改与添加：提交数据 删除：清除数据。"
          ></el-alert>
        </div>
        <el-table :data="personalAccessData" style="width: 100%" height="595">
          <el-table-column prop="index" label="#" align="center"></el-table-column>
          <el-table-column label="用户名称" align="center" prop="user_name">
          </el-table-column>
          <el-table-column label="用户访问路径" align="center" prop="api_url_name">
            <template v-slot="{ row }">
              <span>{{ row.menu1 }} / {{ row.menu2 }} / {{ row.api_url_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户访问的类型" align="center" prop="method_name">
          </el-table-column>
          <el-table-column label="访问时间日期" align="center" prop="create_date">
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination">
        <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage" @next-click="nextPage"
          background layout="total,prev, pager, next" :page-size="10" :total="data_total" v-model:current-page="page">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
// 角色对应权限菜单的的展示弹窗
export default {
  name: "UsersAccessView",
  data() {
    return {
      time_frame_list: [],
      search_start_time: "",
      search_end_time: "",
      loading: false, // 数据加载样式
      personalAccessData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
    };
  },
  created() {
    this.loading = true;
    this.getroleDate();
  },
  methods: {
    // 获取数据
    getroleDate() {
      let get_url;
      if (this.search_start_time) {
        get_url = `users/personal_access_log/?page=${this.page}&end_time=${this.search_end_time}&start_time=${this.search_start_time}`;
      } else {
        get_url = `users/personal_access_log/?page=${this.page}`;
      }
      this.$http
        .get(get_url)
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.personalAccessData = data.data.data;
            this.data_total = data.data.data_total;
          } else {
            this.personalAccessData = [];
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
      this.getroleDate();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getroleDate();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getroleDate();
      }
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.time_frame_list.length > 0) {
        this.page = 1;
        this.search_start_time = new Date(this.time_frame_list[0]).toISOString();
        this.search_end_time = new Date(this.time_frame_list[1]).toISOString();
        this.getroleDate();
      } else {
        this.getroleDate();
      }
    },
    // 重置
    reloadDate() {
      this.search_user_name = "";
      this.search_user_id = '';
      this.time_frame_list = [];
      this.search_start_time = '';
      this.search_end_time = '';
      this.getroleDate();
    },
  },
}
</script>

<style>
@import url("@/static/convention.css");
@media screen and (max-width: 700px) {
  .personal_access .el-tag {
    font-size: 9px;
    padding: 1px 4px;
    height: 16px;
    line-height: 13px;
    border-radius: 1px;
    margin: 2px 0 2px 2px;
  }

  .el-select-dropdown__wrap ul {
    flex-direction: column !important;
  }

  .el-select-dropdown__wrap .el-select-dropdown__item {
    height: 20px !important;
    line-height: 20px !important;
    font-size: 9px !important;
    margin: 0 auto !important;
    padding: 0 13px !important;
    width: 90%;
  }

  .el-select-dropdown__wrap .el-select-dropdown__item span {
    font-size: 9px !important;
  }

  .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
    right: 11px !important;
    font-size: 9px !important;
  }

  .el-select-dropdown__empty {
    font-size: 7px !important;
  }

  .el-select-dropdown__wrap ul {
    flex-direction: column !important;
  }

  .el-form-item__content .el-select .el-select__tags .el-select__input {
    font-size: 9px;
    margin-left: 5px;
  }
}
</style>