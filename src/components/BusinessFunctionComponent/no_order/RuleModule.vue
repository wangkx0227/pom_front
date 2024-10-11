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
        <el-alert title="注意：" type="warning">
          <template slot='title'>
            <div>需要注意的事项:</div>
            <div>1、默认状态是开启的，默认模式长期，默认提前生成天数1天。</div>
            <div>2、提前生成天数如果大于整个事项的周期天数，就会造成异常，添加时根据需求进行修改。</div>
          </template>

        </el-alert>
        <el-form :model="addRuleForm" label-position="top" :rules="RuleRules" ref="addRuleRef">
          <el-row :gutter="24">
            <el-col :span="16">
              <el-form-item label="规则名称" prop="rule_name">
                <el-input v-model="addRuleForm.rule_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
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
            <el-col :span="8">
              <el-form-item label="规则模式">
                <el-select v-model="addRuleForm.rule_mode" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in rule_mode_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="提前生成天数(1-100)">
                <el-input-number v-model="addRuleForm.rule_advance_days" :min="1" :max="100"
                                 controls-position="right"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="规则类型">
                <el-select v-model="addRuleForm.rule_event_type" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in rule_event_type_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="星期(1-7)：" v-show="addRuleForm.rule_event_type === 'week'">
                <el-select v-model="addRuleForm.rule_event_week" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in rule_event_week_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="月份(1-12)："
                            v-show="addRuleForm.rule_event_type === 'month' || addRuleForm.rule_event_type === 'year' ">
                <el-select v-model="addRuleForm.rule_event_month" collapse-tags clearable placeholder="请输选择" multiple
                           collapse-tags>
                  <el-option v-for="item in rule_event_month_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="日期(1-31)："
                            v-show="addRuleForm.rule_event_type === 'month' || addRuleForm.rule_event_type === 'year'">
                <el-select v-model="addRuleForm.rule_event_day" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in rule_event_day_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
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
      <el-table :data="RuleData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="规则名称" align="center" width="300">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-input v-model="row.rule_name" v-else></el-input>

          </template>
        </el-table-column>
        <el-table-column label="规则模式" align="center" width="150">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
              <el-tag>{{ row.rule_mode ? "长期" : "一次性" }}</el-tag>
            </span>
            <el-select v-else v-model="row.rule_mode" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in rule_mode_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="生成提前时间（天）" align="center" width="200">
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
        <el-table-column label="规则类型" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
              <el-tag v-for="item in rule_event_type_list" :key="item.value"
                      v-if="row.rule_event_type===item.value">{{ item.label }}</el-tag>
            </span>
            <el-select v-else v-model="row.rule_event_type" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in rule_event_type_list" :key="item.value" :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="规则类型(星期)" align="center" width="180">
          <template v-slot="{ row }">
            <div v-show="!row.editable">
              <el-tag v-for="item in rule_event_week_list" :key="item.value"
                      v-if="row.rule_event_week.toString() === item.value ">{{ item.label }}
              </el-tag>
            </div>
            <div v-show="row.editable">
              <el-select v-show="row.rule_event_type === 'week'" v-model="row.rule_event_week" collapse-tags clearable
                         placeholder="请输选择">
                <el-option v-for="item in rule_event_week_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="规则类型(月)" align="center" width="180">
          <template v-slot="{ row }">
            <div v-show="!row.editable">
                <el-tag v-show="row.rule_event_month">{{ row.rule_event_month}}</el-tag>
            </div>
            <div v-show="row.editable">
              <el-select v-show="row.rule_event_type === 'month' || row.rule_event_type === 'year' " multiple collapse-tags
                         v-model="row.rule_event_month_list" collapse-tags clearable placeholder="请输选择">
                <el-option v-for="item in rule_event_month_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="规则类型(日)" align="center" width="180">
          <template v-slot="{ row }">
            <div v-show="!row.editable">
              <el-tag v-for="item in rule_event_day_list" :key="item.value"
                      v-if="row.rule_event_day === item.value.toString() ">{{ item.label }}
              </el-tag>
            </div>
            <div v-show="row.editable">
              <el-select v-show="row.rule_event_type === 'month' || row.rule_event_type === 'year' "
                         v-model="row.rule_event_day" collapse-tags clearable placeholder="请输选择">
                <el-option v-for="item in rule_event_day_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>

          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" prop="create_date" width="180"></el-table-column>
        <el-table-column label="修改日期" align="center" prop="update_date" width="180"></el-table-column>
        <el-table-column label="操作" align="center"   width="100" fixed="right">
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
  name: "RuleModule",
  data() {
    return {
      // 规则列表
      rule_event_type_list: [
        {label: "每周", value: 'week'},
        {label: "每月", value: 'month'},
        {label: "每年", value: 'year'},
      ],
      // 星期列表列表
      rule_event_week_list: [
        {label: "周一", value: '1'},
        {label: "周二", value: '2'},
        {label: "周三", value: '3'},
        {label: "周四", value: '4'},
        {label: "周五", value: '5'},
        {label: "周六", value: '6'},
        {label: "周日", value: '7'},
      ],
      // 月分列表
      rule_event_month_list: [
        {label: "一月", value: '1'},
        {label: "二月", value: '2'},
        {label: "三月", value: '3'},
        {label: "四月", value: '4'},
        {label: "五月", value: '5'},
        {label: "六月", value: '6'},
        {label: "七月", value: '7'},
        {label: "八月", value: '8'},
        {label: "九月", value: '9'},
        {label: "十月", value: '10'},
        {label: "十一月", value: '11'},
        {label: "十二月", value: '12'},
      ],
      // 日期列表
      rule_event_day_list: [
        {"label": "一号", "value": "1"},
        {"label": "二号", "value": '2'},
        {"label": "三号", "value": '3'},
        {"label": "四号", "value": '4'},
        {"label": "五号", "value": '5'},
        {"label": "六号", "value": '6'},
        {"label": "七号", "value": '7'},
        {"label": "八号", "value": '8'},
        {"label": "九号", "value": '9'},
        {"label": "十号", "value": '10'},
        {"label": "十一号", "value": '11'},
        {"label": "十二号", "value": '12'},
        {"label": "十三号", "value": '13'},
        {"label": "十四号", "value": '14'},
        {"label": "十五号", "value": '15'},
        {"label": "十六号", "value": '16'},
        {"label": "十七号", "value": '17'},
        {"label": "十八号", "value": '18'},
        {"label": "十九号", "value": '19'},
        {"label": "二十号", "value": '20'},
        {"label": "二十一号", "value": '21'},
        {"label": "二十二号", "value": '22'},
        {"label": "二十三号", "value": '23'},
        {"label": "二十四号", "value": '24'},
        {"label": "二十五号", "value": '25'},
        {"label": "二十六号", "value": '26'},
        {"label": "二十七号", "value": '27'},
        {"label": "二十八号", "value": '28'},
        {"label": "二十九号", "value": '29'},
        {"label": "三十号", "value": '30'},
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
        rule_event_type: '',
        rule_event_week: '',
        rule_event_month: '',
        rule_event_day: '',

      },
      // 弹窗内的表单验证
      RuleRules: {
        rule_name: [
          {required: true, message: "请输入规则名称", trigger: "blur"},
          {
            min: 1,
            max: 128,
            message: "长度在 1 到 128 个字符之间",
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
              rows.splice(index, 1);
              if (rows.length === 0) {
                if (this.page !== 1) {
                  this.page -= 1;
                }
              }
              this.getRuleData();
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
      if (row.rule_event_type === 'week' && row.rule_event_week) {
        row.rule_event_month = [];
        row.rule_event_day = '';
      }
      if (row.rule_event_type === 'month' || row.rule_event_type === 'year') {
        if (row.rule_event_month_list.length > 0 && row.rule_event_day) {
          row.rule_event_week = '';
        }
      }
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
        this.$message.error("事项规则属于必填项！");
        this.addLoading = false;
      } else if (!this.addRuleForm.rule_event_type) {
        this.$message.error("事项规则类型属于必填项！");
        this.addLoading = false;
      } else {
        let save_rule_status = true;
        if (this.addRuleForm.rule_event_type === 'week') {
          if (!this.addRuleForm.rule_event_week) {
            this.$message.error("星期属于必填项！");
            save_rule_status = false;
            this.addLoading = false;
          }
        } else if (this.addRuleForm.rule_event_type === 'month' || this.addRuleForm.rule_event_type === 'year') {
          if (this.addRuleForm.rule_event_month.length === 0 || !this.addRuleForm.rule_event_day) {
            this.$message.error("月份与日期属于必填项！");
            save_rule_status = false;
            this.addLoading = false;
          }
        }
        if (save_rule_status) {
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


