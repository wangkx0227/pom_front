<template>
  <div class="menuType" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="dialogDisplay">添加
      </el-button>
      <el-input placeholder="请输入搜索菜单类型名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog title="菜单类型添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="menuHandleClose">
        <el-form :model="addmenuTypeForm" label-menuType="top" :rules="menuTypeRules" ref="addmenuTypeRef">
          <el-form-item label="菜单类型" prop="menu">
            <el-input v-model="addmenuTypeForm.menu"></el-input>
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input type="textarea" v-model="addmenuTypeForm.description"></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addmenuTypeRef')">取 消</el-button>
            <el-button type="primary" @click="addmenuTypeData('addmenuTypeRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="menuTypeData" style="width: 100%" max-height="580">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="菜单类型" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.menu }}</span>
            <el-input v-model="row.menu" v-else></el-input>
          </template>
        </el-table-column>

        <el-table-column label="描述信息" align="center">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom" v-if="!row.editable">
              <div class="cell ellipsis">{{ row.description }}</div>
            </el-tooltip>
            <el-input type="textarea" v-model="row.description" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.create_date" placement="bottom" v-if="!row.editable">
              <div class="cell ellipsis">{{ row.create_date }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="修改日期" align="center">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.update_date" placement="bottom" v-if="!row.editable">
              <div class="cell ellipsis">{{ row.update_date }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
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
                <el-button type="primary" size="mini" @click="deleteRow(scope.$index, menuTypeData, scope.row)">确定
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
  name: "menuTypeModule",
  data() {
    let descriptionLen = (rule, value, callback) => {
      if (this.addmenuTypeForm.description.length >= 200) {
        callback(new Error("长度在不能超出 200 个字符"));
      }
    };
    return {
      search: "",
      loading: false, // 数据加载样式
      menuTypeData: [],
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addmenuTypeForm: {
        menu: "",
        description: "",
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      menuTypeRules: {
        menu: [
          { required: true, message: "请输入菜单类型名称", trigger: "blur" },
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 15 个字符之间",
            trigger: "blur",
          },
        ],
        description: [{ validator: descriptionLen, trigger: "blur" }],
      },
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
    };
  },
  created() {
    this.loading = true;
    this.getmenuTypeDate();
    this.loading = false;
  },
  methods: {
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
            this.getmenuTypeDate();
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
            this.getmenuTypeDate();
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
    // 显示弹框
    dialogDisplay() {
      this.dialogDisplayVar = true;
    },
    // 关闭弹窗,并清空表单的内容
    dialogClose(formName) {
      this.dialogDisplayVar = false;
      this.$refs[formName].resetFields();
      this.getmenuTypeDate(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    menuHandleClose() {
      this.dialogDisplayVar = false;
      this.getmenuTypeDate(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addmenuTypeData(formName) {
      this.addLoading = true;
      if (!this.addmenuTypeForm.menu) {
        this.$message.error("菜单名称属于必填项！");
        this.addLoading = false;
      } else {
        this.$http
          .post("routes/api_routes/", {
            data: this.addmenuTypeForm,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              data.data.index = 1;
              data.data.department = "新增"; // 给个默认值，进行显示
              this.menuTypeData.unshift(data.data);
              this.$refs[formName].resetFields();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.addLoading = false;
          });
      }
    },
    // 获取数据
    getmenuTypeDate() {
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
            this.menuTypeData = data.data.data;
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
      this.getmenuTypeDate();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getmenuTypeDate();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getmenuTypeDate();
      }
      this.loading = false;
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getmenuTypeDate();
      } else {
        this.getmenuTypeDate();
      }
      this.loading = false;
    },
    // 重置
    reloadDate() {
      this.search = "";
      this.getmenuTypeDate();
    },
  },
}
</script>

<style>
@media screen and (max-width: 700px) {
  .menuType .el-tag {
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
