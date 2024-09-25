<template>
  <div class="menu">
    <div class="head_search_add">
      <el-popover placement="top" width="160" v-model="loadVisibleMenuRouter" v-if="method_list.includes('POST')">
        <p>你确定重新加载当前菜单信息吗？</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="loadVisibleMenuRouter = false">取消</el-button>
          <el-button type="primary" size="mini" @click="addMenuRouter">确定</el-button>
        </div>
        <el-button slot="reference" icon="el-icon-refresh" plain type="info">加载菜单</el-button>
      </el-popover>
      <el-input placeholder="请输入路径名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="MenueData" style="width: 100%"  height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column prop="menu_url" label="路径" align="center" width="350"></el-table-column>
        <el-table-column prop="menu_url_alias" label="路径别名" align="center" width="180"></el-table-column>
        <el-table-column prop="menu_url_name" label="路径名称" align="center" width="180"></el-table-column>
        <el-table-column prop="menu_url_icon" label="路径图标" align="center" width="180"></el-table-column>
        <el-table-column label="菜单类型" align="center" width="180">
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag v-for="item in menu_type_list" :key="item.value" v-if="row.menu_type === item.value" type="info">
                {{ item.label }}
              </el-tag>
            </div>
            <div v-else>
              <el-select v-model="row.menu_type" clearable placeholder="请选择">
                <el-option v-for="item in menu_type_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="是否需要权限控制" align="center" width="180">
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
        <el-table-column label="父菜单" align="center" width="180">
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag v-if="row.father_menu_url_name">{{ row.father_menu_url_name }}</el-tag>
            </div>
            <div v-else>
              <el-select v-if="row.menu_type === 2 && row.access_control === 1" v-model="row.menu_id" clearable
                         placeholder="请选择">
                <el-option v-for="item in father_menu_data_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="作用" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.description }}</span>
            <el-input type="textarea" v-model="row.description" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="加载日期" align="center" width="180" prop="create_date">
        </el-table-column>

        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <div v-if="method_list.includes('PUT')" style="display: inline-block;">
              <el-button v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini" type="text">编辑
              </el-button>
              <el-button v-else @click="saveRow(scope.row)" size="mini" type="text">保存
              </el-button>
            </div>
            <div v-if="method_list.includes('PUT') || method_list.includes('DELETE')" style="display: inline;">
              <el-divider direction="vertical"></el-divider>
            </div>
            <div v-if="method_list.includes('DELETE')" style="display: inline-block;">
              <el-popover v-if="!scope.row.editable" placement="top" width="160" v-model="scope.row.visible"
                          trigger="manual">
                <p>删除后无恢复，请问确定删除吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                  </el-button>
                  <el-button type="primary" size="mini"
                             @click="deleteRow(scope.$index, MenueData, scope.row)">确定
                  </el-button>
                </div>
                <template v-slot:reference>
                  <el-button size="mini" type="text" @click="deleteDisplay(scope.row)">删除
                  </el-button>
                </template>
              </el-popover>
            </div>
            <div v-if="method_list.includes('PUT')" style="display: inline-block;">
              <el-button style="margin-left: 0" v-if="scope.row.editable" @click="scope.row.editable = false"
                         size="mini" type="text">取消
              </el-button>
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
  </div>
</template>

<script>
export default {
  name: "menuModule",
  data() {
    return {
      visible: false,
      // 加载按钮使用变量
      loadVisibleMenuRouter: false,
      // 展示当前菜单类型
      menu_type_list: [
        {label: "不做菜单", value: 0},
        {label: "一级菜单", value: 1},
        {label: "二级菜单", value: 2}
      ],
      // 用来展示与存储当前路径是否需要权限控制
      access_control_list: [
        {label: "需要", value: 1},
        {label: "不需要", value: 0}
      ],

      // 展示一级菜单
      father_menu_data_list: [],
      // 搜索数据变量
      search: "",
      loading: false, // 数据加载样式
      MenueData: [],
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,

      // 权限控制
      method_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getMenueData();
    this.loading = false;
  },
  methods: {
    // 将Vue项目中的路由保存到后端进行存储
    addMenuRouter() {
      this.loadVisibleMenuRouter = false;
      const allRoutes = this.$router.options.routes
      this.loading = true;
      this.$http
          .post("routes/front_menu/", {
            data: allRoutes,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getMenueData();
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
    //删除按钮显示小弹框
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除按钮确认删除
    deleteRow(index, rows, row) {
      let pk = row.id;
      this.loading = true;
      this.$http
          .delete("routes/front_menu/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              rows.splice(index, 1);
              if (rows.length === 0) {
                if (this.page !== 1) {
                  this.page -= 1;
                }
              }
              this.getMenueData();
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
      this.$http
          .put("routes/front_menu/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getMenueData();
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
    // 获取数据Vue菜单数据
    getMenueData() {
      let get_url;
      if (this.search) {
        get_url = `routes/front_menu/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `routes/front_menu/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.MenueData = data.data.data;
              this.father_menu_data_list = data.data.father_menu_data
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              // 如果项目刚刚安装好后，需要有这些权限支撑
              if (this.method_list.length === 0) {
                this.method_list = ["GET", "PUT", "DELETE", "POST"]
              }
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
      this.getMenueData();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getMenueData();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getMenueData();
      }
      this.loading = false;
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getMenueData();
      } else {
        this.getMenueData();
      }
      this.loading = false;
    },
    // 重置
    reloadDate() {
      this.search = "";
      this.getMenueData();
    },
  },
}
</script>

