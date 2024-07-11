<template>
  <div class="Api" v-loading="loading">
    <div class="head_search_add">
      <el-popover placement="top" width="160" v-model="loadVisibleApiRouter">
        <p>你确定重新加载当后端接口吗？</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="loadVisibleApiRouter = false">取消</el-button>
          <el-button type="primary" size="mini" @click="addApiRouter">确定</el-button>
        </div>
        <el-button slot="reference" icon="el-icon-refresh">加载菜单</el-button>
      </el-popover>
      <el-input placeholder="请输入搜索Api名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="ApiData" style="width: 100%" max-height="580">
        <el-table-column prop="index" label="#" align="center" width="60"></el-table-column>
        <el-table-column label="接口URL" align="center" prop="api_url" width="300"></el-table-column>
        <el-table-column label="映射Class" align="center" prop="api_url_class" width="300"></el-table-column>
        <el-table-column label="名称" align="center" prop="api_url_name" width="150">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.api_url_name }}</span>
            <el-input v-model="row.api_url_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="作用" align="center" width="180">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom" v-if="!row.editable">
              <div class="cell ellipsis">{{ row.description }}</div>
            </el-tooltip>
            <el-input type="textarea" v-model="row.description" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="是否需要权限控制" align="center" width="150">
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag v-if="row.access_control">需要</el-tag>
              <el-tag type="info" v-else>不需要</el-tag>
            </div>
            <div v-else>
              <el-select v-model="row.access_control" clearable placeholder="请选择">
                <el-option v-for="item in access_control_list" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="绑定的菜单" align="center" width="150">
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag v-if="row.access_control">{{ row.menu_url_name }}</el-tag>
            </div>
            <div v-else>
              <el-select v-model="row.pom_front_menu_routes_id" clearable placeholder="请选择">
                <el-option v-for="item in menu_data_list" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="载入日期" align="center" width="180">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.create_date" placement="bottom">
              <div class="cell ellipsis">{{ row.create_date }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template v-slot="scope">
            <el-button v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini" type="text">编辑
            </el-button>
            <el-button v-else @click="saveRow(scope.row)" size="mini" type="text">保存
            </el-button>
            |
            <el-popover v-if="!scope.row.editable" placement="top" width="160" v-model="scope.row.visible"
              trigger="manual">
              <p>删除后无恢复，请问确定删除吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                </el-button>
                <el-button type="primary" size="mini" @click="deleteRow(scope.$index, ApiData, scope.row)">确定
                </el-button>
              </div>
              <template v-slot:reference>
                <el-button size="mini" type="text" @click="deleteDisplay(scope.row)">删除
                </el-button>
              </template>
            </el-popover>
            <el-button style="margin-left: 0" v-else @click="scope.row.editable = false" size="mini" type="text">取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage" @next-click="nextPage"
        background layout="total,prev, pager, next" :page-size="10" :total="data_total" v-model:current-page="page">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApiModule",
  data() {
    let descriptionLen = (rule, value, callback) => {
      if (this.addApiForm.description.length >= 200) {
        callback(new Error("长度在不能超出 200 个字符"));
      }
    };
    return {
      search: "",
      ApiData: [],
      loading: false, // 数据加载样式
      // 分页
      page: 1,
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      // 加载按钮使用变量
      loadVisibleApiRouter: false,
      // 用来展示与存储当前路径是否需要权限控制
      access_control_list: [
        { label: "需要", value: 1 },
        { label: "不需要", value: 0 }
      ],
      // 菜单数据列表
      menu_data_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getApiData();
    this.getMenu();
    this.loading = false;
  },
  methods: {
    // 获取前端菜单信息用来绑定关系使用
    getMenu() {
      this.$http
        .get('routes/front_menu/?status=all')
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.menu_data_list = data.data;
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.page_status = 0;
        });
    },
    // 将后端路由加载到数据库中
    addApiRouter() {
      this.loadVisibleApiRouter = false;
      this.loading = true;
      this.$http
        .post("routes/api_routes/")
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.$message.success(data.message);
            this.getApiData();
          } else {
            this.$message.error(data.message);
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.loading = false;
          this.loadVisibleApiRouter = false;
        });

    },
    //删除按钮显示小弹框
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除按钮确认删除
    deleteRow(index, rows, row) {
      let pk = row.id;
      this.loading = true;
      this.$http
        .delete("routes/api_routes/", {
          data: { pk: pk },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.$message.success(data.message);
            this.getApiData();
            rows.splice(index, 1);
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
    // 编辑按钮，修改row.editable值 让这条可以进行修改
    editRow(row) {
      row.editable = true;
    },
    // 修改保存按钮
    saveRow(row) {
      // 保存的数据 row
      this.loading = true;
      this.$http
        .put("routes/api_routes/", {
          data: row,
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            row.editable = false;
            this.$message.success(data.message);
            this.getApiData();
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
    // 获取数据
    getApiData() {
      let get_url;
      if (this.search) {
        get_url = `routes/api_routes/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `routes/api_routes/?page=${this.page}`;
      }
      this.$http
        .get(get_url)
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.ApiData = data.data.data;
            this.data_total = data.data.data_total;
          } else {
            this.firmData = [];
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.page_status = 0;
        });
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getApiData();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getApiData();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getApiData();
      }
      this.loading = false;
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getApiData();
      } else {
        this.getApiData();
      }
      this.loading = false;
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getApiData();
    },
  },
}
</script>

<style>
@media screen and (max-width: 700px) {
  .Api .el-tag {
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
