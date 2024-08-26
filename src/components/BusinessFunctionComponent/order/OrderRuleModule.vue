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
            <div>1、匹配规则需要根据订单的简写来，比如TGD240，可以写为TD240或者D240。</div>
            <div>2、如果是多个匹配规则请使用 / 进行区分。</div>
            <div>3、如果固定规定用户，那么匹配的全部订单生成的事项都归属的当前固定用户。</div>
          </template>
        </el-alert>
        <el-form :model="addRuleForm" label-position="top" :rules="RuleRules" ref="addRuleRef">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="规则名称" prop="rule_name">
                <el-input v-model="addRuleForm.rule_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规则匹配项(请使用 / 进行区分多个)" prop="rule_mate">
                <el-input v-model="addRuleForm.rule_mate"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否固定归属用户" prop="is_file">
                <el-select v-model="addRuleForm.is_bind_user" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in is_bind_user_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绑定用户">
                <el-cascader
                    :disabled="!addRuleForm.is_bind_user"
                    clearable
                    collapse-tags
                    :options="user_data_list"
                    v-model="addRuleForm.user_id_list"
                    :show-all-levels="false">
                  <template slot-scope="{ node, data }">
                    <span>{{ data.label }}</span>
                    <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                  </template>
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="描述信息">
                <el-input
                    type="textarea"
                    placeholder="请输入内容"
                    v-model="addRuleForm.rule_description"
                    maxlength="200"
                    show-word-limit
                >
                </el-input>
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
        <el-table-column label="规则名称" width="180" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-input v-model="row.rule_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="规则匹配项"  width="300" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_mate }}</span>
            <el-input v-model="row.rule_mate" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="描述信息" align="center" width="300">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.rule_description" placement="bottom"
                        v-if="!row.editable">
              <div class="cell ellipsis">{{ row.rule_description }}</div>
            </el-tooltip>
            <el-input type="textarea" v-model="row.rule_description" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="是否固定归属用户"  width="180" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
              <el-tag v-if="row.is_bind_user" type="success">是</el-tag>
              <el-tag v-else>否</el-tag>
            </span>
            <el-select v-else v-model="row.is_bind_user" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_bind_user_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="绑定用户" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.user_name }}</span>
            <div v-else>
              <el-cascader
                  v-if='row.is_bind_user'
                  clearable
                  collapse-tags
                  :options="user_data_list"
                  v-model="row.user_id"
                  :show-all-levels="false">
                <template slot-scope="{ node, data }">
                  <span>{{ data.label }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
            </div>
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
      search: "",
      loading: false, // 数据加载样式
      RuleData: [], // 存储数据的列表
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addRuleForm: {
        rule_name: "",
        rule_mate: "",
        rule_description: "",
        is_bind_user: 0,
        user_id_list: [],
        user_id: "",
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
        rule_mate: [
          {required: true, message: "请输入规则匹配项", trigger: "blur"},
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
      // 用户列表
      user_data_list: [],
      // 是否将当前的匹配规则固定到这个用户身上
      is_bind_user_list: [
        {label: '否', value: 0},
        {label: '是', value: 1},
      ],
    };
  },
  created() {
    this.loading = true;
    this.getUsers();
    this.getRuleData();
  },
  methods: {
    // 获取用户信息
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
    //删除按钮显示小弹框
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除按钮确认删除
    deleteRow(index, rows, row) {
      let pk = row.id;
      this.loading = true;
      this.$http
          .delete("business_function/order_matter_rule/", {
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
      if (Array.isArray(row.user_id)) { // 如果是列表类型取最后一位id
        row.user_id = row.user_id.pop(); // 由于联机选择器是一个列表的值进行获取的，只需要获取最后一个元素即可(数据库也是根据前端菜单的id进行绑定的)
      }
      if (!row.is_bind_user) {
        row.user_id = '';
      }
      this.$http
          .put("business_function/order_matter_rule/", {
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
        this.$message.error("事项规则名称属于必填项！");
        this.addLoading = false;
      } else if (!this.addRuleForm.rule_mate) {
        this.$message.error("事项匹配规则属于必填项！");
        this.addLoading = false;
      } else {
        for (let i = 0; i < this.addRuleForm.user_id_list.length; i++) {
          this.addRuleForm.user_id = this.addRuleForm.user_id_list[i].pop();
        }
        if (!this.addRuleForm.is_bind_user) {
          this.addRuleForm.user_id = '';
        }
        this.$http
            .post("business_function/order_matter_rule/", {
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
        get_url = `business_function/order_matter_rule/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/order_matter_rule/?page=${this.page}`;
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
  },
};
</script>
