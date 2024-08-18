<template>
  <div class="factory_bind_user" v-loading="loading">
    <el-card class="box-card">
      <div class="head_search_add">
        <el-popover placement="top" width="160" style="margin-right: 5px;" v-model="loadVisibleApiFactory">
          <p>你确定重新加载当后端接口吗？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="loadVisibleApiFactory = false">取消</el-button>
            <el-button type="primary" size="mini" @click="addFactory">确定</el-button>
          </div>
          <el-button slot="reference" icon="el-icon-refresh"
                     v-if="method_list.includes('POST')">加载菜单
          </el-button>
        </el-popover>
        <el-autocomplete class="inline-input" :fetch-suggestions="querySearch" v-model="search_factory_name"
                         placeholder="请输入内容" :trigger-on-focus="false" @select="factoryIdSelect"
                         style="margin-right: 5px;"></el-autocomplete>
        <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
        </el-button>
        <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
        </el-button>
      </div>
      <div class="table_content">
        <el-table :data="factoryData" style="width: 100%">
          <el-table-column prop="index" label="#" align="center"></el-table-column>
          <el-table-column label="工厂名称" align="center" prop="factory_name">
          </el-table-column>
          <el-table-column label="工厂代码" align="center" prop="factory_code">
          </el-table-column>
          <el-table-column label="载入时间" align="center" prop="create_date">
          </el-table-column>
          <el-table-column label="修改时间" align="center" prop="update_date">
          </el-table-column>
          <el-table-column label="绑定用户" align="center" width="180">
            <template v-slot="{ row }">
              <div class="tag-group" v-if="!row.editable">
                <el-tag v-if="row.user_id">{{ row.user_name }}</el-tag>
              </div>
              <el-cascader v-else :options="user_data_list" v-model="user_id_list"
                           :show-all-levels="false">
                <template slot-scope="{ node, data }">
                  <span>{{ data.label }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template v-slot="scope">
              <div v-if="method_list.includes('PUT')" style="display: inline-block;">
                <el-button v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini"
                           type="text">编辑
                </el-button>
                <el-button v-else @click="saveRow(scope.row)" size="mini" type="text">保存
                </el-button>
              </div>
              <div v-if="method_list.includes('PUT') && scope.row.editable" style="display: inline;">
                <el-divider direction="vertical"></el-divider>
              </div>
              <div v-if="method_list.includes('PUT')" style="display: inline-block;">
                <el-button style="margin-left: 0" v-if="scope.row.editable"
                           @click="scope.row.editable = false" size="mini" type="text">取消
                </el-button>
              </div>
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
    </el-card>
  </div>
</template>

<script>
export default {
  name: "FactoryBindUser",
  data() {
    return {
      loadVisibleApiFactory: false,
      search_factory_name: '',
      search_factory_id: "",
      restaurants: [], // 建议搜索数据列表
      loading: false, // 数据加载样式
      factoryData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 获取访问权限
      method_list: ["GET", 'POST', 'PUT', 'DELETE'],
      // 用户列表id
      user_id_list: [],
      // 用户数据列表
      user_data_list: [],

    };
  },
  created() {
    this.loading = true;
    this.getFactoryDate();
    this.getUsers();
  },
  methods: {
    // 编辑按钮
    editRow(row) {
      row.editable = true;
    },
    // 修改保存数据
    saveRow(row) {
      // 保存的数据 row
      this.loading = true;
      if (Array.isArray(this.user_id_list)) { // 如果是列表类型取最后一位id
        if (this.user_id_list.length == 2) {
          row.user_id = this.user_id_list.pop(); // 由于联机选择器是一个列表的值进行获取的，只需要获取最后一个元素即可(数据库也是根据前端菜单的id进行绑定的)
        }
      }
      this.$http
          .put("business_function/factory_bing_user/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getFactoryDate();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
            this.user_id_list = [];
          });
    },
    // 获取用户的信息
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
            this.loading = false;
          });
    },
    // 获取数据
    getFactoryDate() {
      let get_url;
      if (this.search_factory_id) {
        get_url = `business_function/factory_bing_user/?page=${this.page}&search=${this.search_factory_id}`;
      } else {
        get_url = `business_function/factory_bing_user/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.factoryData = data.data.data;
              this.data_total = data.data.data_total;
              // this.method_list = data.data.method_list;
              this.restaurants = data.data.factory_name_list;
            } else {
              this.factoryData = [];
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
      this.search_factory_name = '';
      this.search_factory_id = '';
      this.page = 1;
      this.getFactoryDate();
    },
    // 建议搜索，获取结果函数
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    // 筛选函数
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    // id赋值函数
    factoryIdSelect(item) {
      this.search_factory_id = item.id
    },
    // 加载工厂
    addFactory() {
      this.loading = true;
      this.loadVisibleApiFactory = false;

      this.$http
          .post("business_function/factory_bing_user/")
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getFactoryDate();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
            this.loadVisibleApiFactory = false;

          });

    }
  },
}
</script>

<style>
@import url("@/static/currency.css");
</style>