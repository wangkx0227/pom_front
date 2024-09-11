<template>
  <div class="order_matter" v-loading="loading">
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
      <el-dialog title="订单事项添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="handleClose">
        <el-alert title="注意：" type="warning">
          <template slot='title'>
            <div>需要注意的事项:</div>
            <div>1、事务类型是默认是承办员，默认需要上传文件，状态开启。</div>
            <div>2、需要根据添加的事务，选择是时间类型：订单完成前还是订单生成后，并且填写天数。</div>
            <div>3、如果存在监督人，需要填写监督人的事项时间，默认为0(事务的结束时间与跟进人相同)，根据实际情况向后延长。</div>
          </template>
        </el-alert>
        <el-form :model="addOrderMatterForm" label-position="top" :rules="rules" ref="addOrderMatterRef">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="事项名称" prop="matter_name">
                <el-input v-model="addOrderMatterForm.matter_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="事务类型" prop="is_show">
                <el-select v-model="addOrderMatterForm.matter_type" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in is_matter_type_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否上传附件" prop="is_file">
                <el-select v-model="addOrderMatterForm.is_file" collapse-tags clearable placeholder="请输选择">
                  <el-option v-for="item in is_file_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态" prop="is_show">
                <el-switch
                    v-model="addOrderMatterForm.is_show"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="开"
                    inactive-text="关"
                >
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="事务的时间类型" prop="is_show">
                <el-select v-model="addOrderMatterForm.matter_cycle_time_type" collapse-tags clearable
                           placeholder="请输选择">
                  <el-option v-for="item in is_matter_cycle_time_type_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="事务的时间" prop="is_show">
                <el-input-number :min="0"
                                 :max="100"
                                 controls-position="right"
                                 v-model="addOrderMatterForm.matter_cycle_time"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否有监督人" prop="is_show">
                <el-select v-model="addOrderMatterForm.is_supervisor" collapse-tags clearable
                           placeholder="请输选择" @change="supervisorChange">
                  <el-option v-for="item in is_is_supervisor_list" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="监督人缓冲时间(天)" prop="is_show">
                <el-input-number :min="0"
                                 :max="100"
                                 controls-position="right"
                                 v-model="addOrderMatterForm.is_supervisor_cycle_time"
                                 :disabled="addOrderMatterForm.is_supervisor === 0"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="绑定事务规则" prop="is_show">
                <el-select v-model="addOrderMatterForm.order_matter_rule_list" collapse-tags clearable
                           placeholder="请输选择" multiple
                           collapse-tags>
                  <el-option v-for="item in OrderMatterRuleData" :key="item.value" :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addOrderMatterRef')">取 消</el-button>
            <el-button type="primary" @click="addOrderMatterData('addOrderMatterRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="OrderMatterData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="事项名称" align="center" width="350">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
            <el-input v-model="row.matter_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="事务归属类型" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
                <el-tag>{{ row.matter_type ? "工厂负责人" : "承办员事务" }} </el-tag>
            </span>
            <el-select v-else v-model="row.matter_type" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_matter_type_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="是否开启" align="center" width="180">
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
            <span v-if="!row.editable">
              <el-tag v-if="row.is_file === 0">否</el-tag>
              <el-tag v-else type="info">是</el-tag>
            </span>
            <el-select v-else v-model="row.is_file" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_file_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="事务时间(天)" align="center" width="200">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_cycle_time }}</span>
            <el-input-number v-model="row.matter_cycle_time" :min="1" :max="100" v-else
                             controls-position="right"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="事务时间类型" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
              <el-tag v-if="row.matter_cycle_time_type === 0">订单完成前</el-tag>
              <el-tag v-else type="info">订单生成后</el-tag>
            </span>
            <el-select v-else v-model="row.matter_cycle_time_type" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_matter_cycle_time_type_list" :key="item.value" :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="是否有监督人" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">
              <el-tag v-if="row.is_supervisor === 0">无</el-tag>
              <el-tag v-else type="info">有</el-tag>
            </span>
            <div v-else>
              <el-select v-model="row.is_supervisor" collapse-tags clearable placeholder="请输选择">
                <el-option v-for="item in is_is_supervisor_list" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="监督人缓冲时间(天)" align="center" width="200">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.is_supervisor_cycle_time }}</span>
            <div v-else>
              <el-input-number v-show="row.is_supervisor === 1"
                               controls-position="right"
                               v-model="row.is_supervisor_cycle_time" :min="0"
                               :max="100"></el-input-number>
            </div>

          </template>
        </el-table-column>
        <el-table-column label="绑定事务规则" align="center" width="300">
          <template v-slot="{ row }">
            <el-tooltip v-if="!row.editable" class="item" effect="dark" :content="row.rule_name_value" placement="bottom">
              <span v-if="row.rule_name_value">{{ row.rule_name_value.substring(0, 25) }}
              <span v-if="row.rule_name_value && row.rule_name_value.length >= 25">...</span></span>
            </el-tooltip>
            <div v-else>
              <el-select v-model="row.order_matter_rule_list" collapse-tags clearable
                         placeholder="请输选择" multiple
                         collapse-tags>
                <el-option v-for="item in OrderMatterRuleData" :key="item.value" :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
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
                  <el-button type="primary" size="mini" @click="deleteRow(scope.$index, OrderMatterData, scope.row)">确定
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
  name: "OrderMatterModule",
  data() {
    return {
      search: "", // 搜索
      loading: false, // 数据加载样式
      OrderMatterData: [], // 查询
      //  添加弹出框数据 添加使用变量
      addOrderMatterForm: {
        is_file: 1,
        is_show: true,
        matter_type: 0,
        matter_name: "",
        is_supervisor: 0,
        matter_cycle_time: 0,
        matter_cycle_time_type: 0,
        is_supervisor_cycle_time: 0,
        order_matter_rule_list: [],
      },
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      rules: {
        matter_name: [
          {required: true, message: "请输事务的名称", trigger: "blur"},
          {
            min: 1,
            max: 99,
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
      // 用户信息列表
      user_data_list: [], // 循环的全部用户列表
      // 是否上传附件
      is_file_list: [
        {label: '否', value: 0},
        {label: '是', value: 1},
      ],
      // 事务归属类型
      is_matter_type_list: [
        {label: '承办员事务', value: 0},
        {label: '工厂负责人事务', value: 1},
      ],
      // 事务生成的时间类型
      is_matter_cycle_time_type_list: [
        {label: '订单完成前', value: 0},
        {label: '订单生成后', value: 1},
      ],
      // 事务是否监督人
      is_is_supervisor_list: [
        {label: '无', value: 0},
        {label: '有', value: 1},
      ],
      // 规则匹配表
      OrderMatterRuleData: [],
    };
  },
  created() {
    this.loading = true;
    this.getOrderMatterRuleData();
    this.getOrderMatterData();
  },
  methods: {
    // 获取规则
    getOrderMatterRuleData() {
      this.$http
          .get('business_function/order_matter_rule/?status=all')
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.OrderMatterRuleData = data.data;
            } else {
              this.OrderMatterRuleData = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
          });
    },
    // 获取数据
    getOrderMatterData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/order_matter/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/order_matter/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.OrderMatterData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.OrderMatterData = [];
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
    //删除按钮显示小弹框
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除按钮确认删除
    deleteRow(index, rows, row) {
      this.loading = true;
      let pk = row.id;
      this.$http
          .delete("business_function/order_matter/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getOrderMatterData();
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
      this.$http
          .put("business_function/order_matter/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getOrderMatterData();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
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
      this.getOrderMatterData(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getOrderMatterData(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addOrderMatterData(formName) {
      this.addLoading = true;
      if (!this.addOrderMatterForm.matter_name) {
        this.$message.error("事务名称是必填项！");
        this.addLoading = false;
      } else {
        this.addOrderMatterForm.is_show = this.addOrderMatterForm.is_show ? 1 : 0;
        this.$http
            .post("business_function/order_matter/", {
              data: this.addOrderMatterForm,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                data.data.index = 1;
                this.OrderMatterData.unshift(data.data);
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
              this.addOrderMatterForm.is_show = true;
              this.addLoading = false;
            });
      }
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getOrderMatterData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getOrderMatterData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getOrderMatterData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getOrderMatterData();
      } else {
        this.getOrderMatterData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getOrderMatterData();
    },
    // 开关方法变动回调函数。
    changeSwitch(newValue, row) {
      row.is_show = newValue ? 1 : 0;
    },
    // 是否有监督人的方法
    supervisorChange(val) {
      if (val === 0) {
        this.addOrderMatterForm.is_supervisor_cycle_time = 0;
      }
    },
  },
};
</script>


