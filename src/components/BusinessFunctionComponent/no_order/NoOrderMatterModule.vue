<template>
  <div class="no_matter" v-loading="loading">
    <div class="head_search_add">
      <el-button v-if="method_list.includes('POST')" type="info" icon="el-icon-circle-plus-outline" plain
                 @click="dialogDisplay">添加
      </el-button>
      <el-input placeholder="请输入非订单事项名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog title="非订单事项添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="handleClose">
        <el-alert title="注意：" type="warning">
          <template slot='title'>
            <div>需要注意的事项:</div>
            <div>1、默认状态是开启的，附件是默认需要上传的，添加时根据需求进行修改。</div>
            <div>2、请添加事项时绑定用户与规则，才会正常执行，不然不会执行。</div>
          </template>
        </el-alert>
        <el-form :model="addWorkForm" label-position="top" :rules="rules" ref="addWorkRef">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="事项名称" prop="matter_name">
                <el-input v-model="addWorkForm.matter_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="is_show">
                <el-switch
                    v-model="addWorkForm.is_show"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="开"
                    inactive-text="关"
                >
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否上传附件" prop="is_file">
                <el-select v-model="addWorkForm.is_file" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in is_file_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绑定用户">
                <el-cascader
                    clearable
                    collapse-tags
                    :props="{ multiple: true }"
                    :options="user_data_list"
                    v-model="addWorkForm.user_id_list"
                    :show-all-levels="false">
                  <template slot-scope="{ node, data }">
                    <span>{{ data.label }}</span>
                    <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                  </template>
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绑定规则">
                <el-select v-model="addWorkForm.no_order_matter_rule_id" collapse-tags clearable
                           placeholder="请输选择">
                  <el-option v-for="item in rule_data_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addWorkRef')">取 消</el-button>
            <el-button type="primary" @click="addWorkData('addWorkRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="WorkData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" width="500">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
            <el-input v-model="row.matter_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="180">
          <template v-slot="{ row }">
            <el-switch
                v-if="!row.editable"
                v-model="row.switch_value"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
                active-text="开"
                inactive-text="关"
            >
            </el-switch>
            <el-switch
                v-else
                v-model="row.switch_value"
                @change="changeSwitch($event,row)"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="开"
                inactive-text="关"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="是否上传附件" align="center" width="180">
          <template v-slot="{ row }">
            <span  v-if="!row.editable">
              <el-tag v-if="row.is_file === 0">否</el-tag>
              <el-tag v-else type="info">是</el-tag>
            </span>
            <el-select v-else v-model="row.is_file" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_file_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="绑定用户" align="center" width="180">
          <template v-slot="{ row }">
            <el-tooltip v-if="!row.editable" class="item" effect="dark" :content="row.user_name" placement="bottom">
              <span v-if="row.user_name">{{ row.user_name.substring(0, 10) }}
              <span v-if="row.user_name && row.user_name.length >= 10">...</span></span>
            </el-tooltip>
            <el-cascader
                clearable v-else
                collapse-tags
                :props="{ multiple: true }"
                :options="user_data_list"
                v-model="row.user_id_list"
                :show-all-levels="false">
              <template slot-scope="{ node, data }">
                <span>{{ data.label }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </template>
        </el-table-column>
        <el-table-column label="绑定规则" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-select v-else v-model="row.no_order_matter_rule_id" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in rule_data_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="修改日期" align="center" width="180" prop="update_date">
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
                  <el-button type="primary" size="mini" @click="deleteRow(scope.$index, WorkData, scope.row)">确定
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
  name: "NoOrderMatterModule",
  data() {
    return {
      search: "", // 搜索
      WorkData: [], // 查询
      loading: false, // 数据加载样式
      //  添加弹出框数据 添加使用变量
      addWorkForm: {
        matter_name: "",
        is_show: true,
        is_file: 1,
        user_id_list: [],
        no_order_matter_rule_id: "",
      },
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      rules: {
        matter_name: [
          {required: true, message: "请输事务的名称", trigger: "blur"},
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 99 个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 弹出框控制变量
      dialogDisplayVar: false,

      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 可访问权限列表
      method_list: [],
      // 绑定规则列表
      rule_data_list: [],
      // 用户信息列表
      user_data_list: [], // 循环的全部用户列表
      // 是否上传附件
      is_file_list: [
        {label: '否', value: 0},
        {label: '是', value: 1},
      ],
    };
  },
  created() {
    this.loading = true;
    this.getUsers();
    this.getRules();
    this.getWorkData();

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
            // this.loading = false;
          });
    },
    // 获取规则
    getRules() {
      this.$http
          .get("business_function/no_order_matter_rule/?status=all")
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.rule_data_list = data.data;
            } else {
              this.rule_data_list = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            // this.loading = false;
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
          .delete("business_function/no_order_matter/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getWorkData();
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
      this.loading = true;
      let user_id_list = [];
      for (let i = 0; i < row.user_id_list.length; i++) {
        let user_id = row.user_id_list[i].pop();
        user_id_list.push(user_id);
      }
      // 重新设置用户id列表
      row.user_id_list = user_id_list;
      this.$http
          .put("business_function/no_order_matter/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getWorkData();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.user_id_list = [];
            this.loading = false;
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
      this.getWorkData(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getWorkData(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addWorkData(formName) {
      this.addLoading = true;
      let user_id_list = [];
      for (let i = 0; i < this.addWorkForm.user_id_list.length; i++) {
        let user_id = this.addWorkForm.user_id_list[i].pop();
        user_id_list.push(user_id);
      }
      this.addWorkForm.user_id_list = user_id_list;
      if (!this.addWorkForm.matter_name) {
        this.$message.error("事务名称是必填项！");
        this.addLoading = false;
      } else {
        this.addWorkForm.is_show = this.addWorkForm.is_show ? 1 : 0;
        this.$http
            .post("business_function/no_order_matter/", {
              data: this.addWorkForm,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                data.data.index = 1;
                console.log(data.data)
                this.WorkData.unshift(data.data);
                this.$refs[formName].resetFields();
              } else {
                this.$message.error(data.message);
              }
            })
            .catch((error) => {
              this.$message.error(error.message);
            })
            .finally(() => {
              this.user_id_list = [];
              this.addWorkForm.is_show = true;
              this.addLoading = false;
            });
      }
    },
    // 获取数据
    getWorkData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/no_order_matter/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/no_order_matter/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.WorkData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.WorkData = [];
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
      this.getWorkData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getWorkData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getWorkData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getWorkData();
      } else {
        this.getWorkData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getWorkData();
    },
    // 开关方法变动回调函数。
    changeSwitch(newValue, row) {
      row.is_show = newValue ? 1 : 0;
    }
  },
};
</script>
