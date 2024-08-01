<template>
  <div class="department" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="dialogDisplay"
                 v-if="method_list.includes('POST')">添加
      </el-button>
      <el-input placeholder="请输入搜索部门名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog title="部门添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="handleClose">
        <el-form :model="addDepartmentForm" label-position="top" :rules="DepartmentRules" ref="addDepartmentRef">
          <el-form-item label="部门名称" prop="department">
            <el-input v-model="addDepartmentForm.department"></el-input>
          </el-form-item>
          <el-form-item label="关联公司">
            <el-select popper-class="select_class" v-model="addDepartmentForm.RuleIdList" multiple collapse-tags
                       clearable
                       placeholder="请选择">
              <el-option v-for="item in RuleDataList" :key="item.id" :label="item.Rule" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input type="textarea" v-model="addDepartmentForm.description"></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addDepartmentRef')">取 消</el-button>
            <el-button type="primary" @click="addDepartmentData('addDepartmentRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="RuleData" style="width: 100%" max-height="580">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="规则名称" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-input v-model="row.rule_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="规则模式" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_mode }}</span>
            <el-input v-model="row.rule_mode" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="间隔时间" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.interval_time }}</span>
            <el-input v-model="row.interval_time" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="是否禁用" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.is_show }}</span>
            <el-input v-model="row.is_show" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" prop="create_date">
        </el-table-column>
        <el-table-column label="修改日期" align="center" prop="update_date">
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <div v-if="method_list.includes('PUT')" style="display: inline-block;">
              <el-button v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini" type="text">编辑
              </el-button>
              <el-button v-else @click="saveRow(scope.row)" size="mini" type="text">保存
              </el-button>
            </div>
            <div v-if="method_list.includes('PUT') || method_list.includes('DELETE')" style="display: inline;">
              |
            </div>
            <div v-if="method_list.includes('DELETE')" style="display: inline-block;">
              <el-popover v-if="!scope.row.editable" placement="top" width="160" v-model="scope.row.visible"
                          trigger="manual">
                <p>删除后无恢复，请问确定删除吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                  </el-button>
                  <el-button type="primary" size="mini" @click="deleteRow(scope.$index, DepartmentData, scope.row)">确定
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
                         size="mini"
                         type="text">取消
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
  name: "RoleModule",
  data() {
    let descriptionLen = (rule, value, callback) => {
      if (this.addDepartmentForm.description.length >= 200) {
        callback(new Error("长度在不能超出 200 个字符"));
      }
    };
    return {
      // 规则列表
      event_list: [
        {label: "分", value: 0, event_value: 'second'},
        {label: "时", value: 1, event_value: 'minute'},
        {label: "日", value: 2, event_value: 'day'},
        {label: "月", value: 3, event_value: 'month'},
        {label: "周", value: 4, event_value: 'week'},
      ],
      search: "",
      loading: false, // 数据加载样式
      RuleData: [],
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addDepartmentForm: {
        department: "",
        RuleIdList: [],
        description: "",
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      DepartmentRules: {
        department: [
          {required: true, message: "请输入部门名称", trigger: "blur"},
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 15 个字符之间",
            trigger: "blur",
          },
        ],
        description: [{validator: descriptionLen, trigger: "blur"}],
      },
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 权限
      method_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getRuleData();
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
          .delete("foundation/department/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getDepartmentData();
              rows.splice(index, 1);
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
    },
    // 编辑按钮，修改row.editable值 让这条可以进行修改
    editRow(row) {
      row.editable = true;
    },
    // 修改保存按钮
    saveRow(row) {
      // 保存的数据 row
      this.loading = true;
      row.Rule_id_list = this.RuleIdList; // 部门绑定公司的id列表

      this.$http
          .put("foundation/department/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getDepartmentData();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
    },
    // 显示弹框
    dialogDisplay() {
      this.dialogDisplayVar = true;
    },
    // 关闭弹窗,并清空表单的内容
    dialogClose(formName) {
      this.dialogDisplayVar = false;
      this.$refs[formName].resetFields();
      this.getDepartmentData(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getDepartmentData(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addDepartmentData(formName) {
      this.addLoading = true;
      if (!this.addDepartmentForm.department) {
        this.$message.error("部门名称属于必填项！");
        this.addLoading = false;
      } else {
        this.$http
            .post("foundation/department/", {
              data: this.addDepartmentForm,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                data.data.index = 1;
                this.DepartmentData.unshift(data.data);
                this.$refs[formName].resetFields();
                this.RuleDataSearch = [];
              } else {
                this.$message.error(data.message);
              }
            })
            .catch((error) => {
              console.log(error);
              this.$message.error(error.message);
            })
            .finally(() => {
              this.addLoading = false;
            });
      }
    },
    // 获取数据
    getRuleData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/no_order_matter_rule/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/no_order_matter_rule/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.RuleData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
              // 如果项目刚刚安装好后，需要有这些权限支撑
              if (this.method_list.length === 0) {
                this.method_list = ["GET", "PUT", "DELETE", "POST"]
              }
            } else {
              this.RuleData = [];
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
      this.getDepartmentData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getDepartmentData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getDepartmentData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getDepartmentData();
      } else {
        this.getDepartmentData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getDepartmentData();
    },
  },
};
</script>

<style>
@media screen and (max-width: 700px) {
  .department .el-tag {
    font-size: 9px;
    padding: 1px 4px;
    height: 16px;
    line-height: 13px;
    border-radius: 1px;
    margin: 2px 0 2px 2px;
  }

  .department .cell .el-select {
    margin-left: -10px !important;
  }

  .department .cell .el-select .el-input__inner {
    font-size: 9px !important;
  }

  .department .el-form-item__content .el-select {
    position: static;
    line-height: 35px !important;
  }

  .department .cell .el-select .el-select__tags {
    max-width: 70px !important;
  }

  .department .cell .el-select .el-select__input {
    font-size: 9px !important;
    margin-left: 2px !important;
    max-width: 70px !important;
  }

  .department .el-select .el-tag {
    padding: 0;
  }

  .department .el-tag .el-icon-close {
    height: 9px !important;
    width: 9px !important;
    font-size: 6px !important;
    line-height: 9px !important;
    right: 0.5px !important;
  }

  .department .el-tag .el-select__tags-text {
    padding: 1px;
  }

  .department .el-select .el-select__tags {
    flex-wrap: nowrap;
    align-items: center;
  }

  .el-select-dropdown {
    /*top: 252px !important;*/
  }

  .el-select-dropdown__wrap ul {
    flex-direction: column !important;
  }

  .el-select-dropdown__wrap .el-select-dropdown__item {
    height: 20px !important;
    line-height: 20px !important;
  }

  .el-select-dropdown__wrap .el-select-dropdown__item span {
    font-size: 9px !important;
  }

  .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
    right: 11px !important;
    font-size: 9px !important;
  }

  .el-select-dropdown__empty {
    font-size: 9px !important;
  }

  .el-form-item__content .el-select .el-select__tags {
    top: 54%;
  }

  .el-form-item__content .el-select .el-select__tags .el-select__input {
    font-size: 9px;
    margin-left: 5px;
  }
}
</style>
