<template>
  <div class="rule" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="dialogDisplay"
                 v-if="method_list.includes('POST')">添加
      </el-button>
      <el-input placeholder="请输入规则名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog title="添加规则" :visible.sync="dialogDisplayVar" width="35%" :before-close="handleClose">
        <el-alert
            title="注意："
            type="warning"
            description="默认状态是开启的，默认模式长期，默认提前生成天数1天，添加时根据需求进行修改。">
        </el-alert>
        <el-form :model="addRuleForm" label-position="top" :rules="RuleRules" ref="addRuleRef">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="规则名称" prop="rule_name">
                <el-input v-model="addRuleForm.rule_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规则模式">
                <el-select v-model="addRuleForm.rule_mode" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in rule_mode_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="提前生成天数(1-100)">
                <el-input-number v-model="addRuleForm.rule_advance_days" :min="1" :max="100"
                                 controls-position="right"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="状态">
                <el-switch
                    v-model="addRuleForm.switch_value"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="激活"
                    inactive-text="未激活"
                >
                </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addRuleRef')">取 消</el-button>
            <el-button type="primary" @click="addRuleData('addRuleRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="RuleData" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="规则名称" align="center" width="200">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-input v-model="row.rule_name" v-else></el-input>

          </template>
        </el-table-column>
        <el-table-column label="规则模式" align="center" width="150">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_mode ? "长期" : "一次性" }}</span>
            <el-select v-else v-model="row.rule_mode" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in rule_mode_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="生成提前时间（天）" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_advance_days }}</span>
            <el-input-number v-model="row.rule_advance_days" :min="1" :max="100" v-else
                             controls-position="right"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" align="center" width="200">
          <template v-slot="{ row }">
            <el-switch
                v-if="!row.editable"
                v-model="row.switch_value"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
                active-text="激活"
                inactive-text="未激活"
            >
            </el-switch>
            <el-switch
                v-else
                v-model="row.switch_value"
                @change="changeSwitch($event,row)"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="激活"
                inactive-text="未激活"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" prop="create_date" width="180"></el-table-column>
        <el-table-column label="修改日期" align="center" prop="update_date" width="180"></el-table-column>
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
                  <el-button type="primary" size="mini" @click="deleteRow(scope.$index, RuleData, scope.row)">确定
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
    return {
      // 规则列表
      event_list: [
        {label: "分", value: 0, event_value: 'second'},
        {label: "时", value: 1, event_value: 'minute'},
        {label: "日", value: 2, event_value: 'day'},
        {label: "月", value: 3, event_value: 'month'},
        {label: "周", value: 4, event_value: 'week'},
      ],
      // 模式
      rule_mode_list: [
        {label: "一次性", value: 0},
        {label: "长期", value: 1},
      ],
      search: "",
      loading: false, // 数据加载样式
      RuleData: [], // 存储数据的列表
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addRuleForm: {
        rule_name: "",
        rule_mode: 1,
        rule_advance_days: 1,
        switch_value: true,
      },
      // 弹窗内的表单验证
      RuleRules: {
        rule_name: [
          {required: true, message: "请输入规则名称", trigger: "blur"},
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 30 个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 控制弹窗创建按钮
      addLoading: false,
      // 分页
      page: 1,
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
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
          .delete("business_function/no_order_matter_rule/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getRuleData();
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
      this.$http
          .put("business_function/no_order_matter_rule/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getRuleData();
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
      this.getRuleData(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getRuleData(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addRuleData(formName) {
      this.addLoading = true;
      if (!this.addRuleForm.rule_name) {
        this.$message.error("部门名称属于必填项！");
        this.addLoading = false;
      } else {
        this.addRuleForm.is_show = this.addRuleForm.switch_value ? 1 : 0;
        this.$http
            .post("business_function/no_order_matter_rule/", {
              data: this.addRuleForm,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                data.data.index = 1;
                this.RuleData.unshift(data.data);
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
      this.getRuleData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getRuleData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getRuleData();
      }
    },
    // 搜索功能
    searchData() {
      this.page = 1;
      this.loading = true;
      this.getRuleData();
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getRuleData();
    },
    // 开关方法变动回调函数。
    changeSwitch(newValue, row) {
      row.is_show = newValue ? 1 : 0;
    }
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
