<template>
  <div class="method">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="dialogDisplay">添加
      </el-button>
      <el-input placeholder="请输入角色名称" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog title="角色添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="requestMethodHandleClose">
        <el-form :model="addRequestMethodForm" label-requestMethod="top" :rules="requestMethodRules"
                 ref="addRequestMethodRef">
          <el-form-item label="请求方法名称" prop="method_name">
            <el-input v-model="addRequestMethodForm.method_name"></el-input>
          </el-form-item>
          <el-form-item label="请求方式(需要根据接口方式如：GET、POST、PUT、DELETE)" prop="method_way">
            <el-input v-model="addRequestMethodForm.method_way"></el-input>
          </el-form-item>
          <el-form-item label="请求描述信息" prop="description">
            <el-input type="textarea" v-model="addRequestMethodForm.description"></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addRequestMethodRef')">取 消</el-button>
            <el-button type="primary" @click="addRequestMethodData('addRequestMethodRef')" :loading="addLoading">立即创建
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="requestMethodData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="请求名称" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.method_name }}</span>
            <el-input v-model="row.method_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="请求方式" align="center">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.method_way }}</span>
            <el-input v-model="row.method_way" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="请求描述信息" align="center">
          <template v-slot="{ row }">
            <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom" v-if="!row.editable">
              <div class="cell ellipsis">{{ row.description }}</div>
            </el-tooltip>
            <el-input type="textarea" v-model="row.description" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" prop="create_date" width="180">
        </el-table-column>
        <el-table-column label="修改日期" align="center" prop="update_date" width="180">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <div v-if="method_list.includes('PUT')" style="display: inline-block;">
              <el-button style="margin-left: 0;" v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini"
                         type="text">编辑
              </el-button>
              <el-button style="margin-left: 0;" v-else @click="saveRow(scope.row)" size="mini" type="text">保存
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
                  <el-button type="primary" size="mini" @click="deleteRow(scope.$index, requestMethodData, scope.row)">
                    确定
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
  name: "apiRequestMethodModule",
  data() {
    let descriptionLen = (rule, value, callback) => {
      if (this.addRequestMethodForm.description.length >= 200) {
        callback(new Error("长度在不能超出 200 个字符"));
      }
    };
    return {
      search: "",
      loading: false, // 数据加载样式
      requestMethodData: [],
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addRequestMethodForm: {
        method_name: "",
        description: "",
        method_way: "",
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      requestMethodRules: {
        method_name: [
          {required: true, message: "请输入请求方式名称", trigger: "blur"},
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 15 个字符之间",
            trigger: "blur",
          },
        ],
        method_way: [
          {required: true, message: "请输入请求方式", trigger: "blur"},
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
      // 展示菜单弹窗
      requestMethod_pk: "",
      showChild: false,
      // 权限控制
      method_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getRequestMethodDate();
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
          .delete("routes/api_method/", {
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
              this.getRequestMethodDate();
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
          .put("routes/api_method/", {
            data: row,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              row.editable = false;
              this.$message.success(data.message);
              this.getRequestMethodDate();
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
      this.getRequestMethodDate(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    requestMethodHandleClose() {
      this.dialogDisplayVar = false;
      this.getRequestMethodDate(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addRequestMethodData(formName) {
      this.addLoading = true;
      if (!this.addRequestMethodForm.method_name) {
        this.$message.error("请求方法名称属于必填项！");
        this.addLoading = false;
      } else if (!this.addRequestMethodForm.method_way) {
        this.$message.error("请求方法属于必填项！");
        this.addLoading = false;
      } else {
        this.$http
            .post("routes/api_method/", {
              data: this.addRequestMethodForm,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                data.data.index = 1;
                data.data.department = "新增"; // 给个默认值，进行显示
                this.requestMethodData.unshift(data.data);
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
    getRequestMethodDate() {
      let get_url;
      if (this.search) {
        get_url = `routes/api_method/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `routes/api_method/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.requestMethodData = data.data.data;
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
      this.getRequestMethodDate();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getRequestMethodDate();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getRequestMethodDate();
      }
      this.loading = false;
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getRequestMethodDate();
      } else {
        this.getRequestMethodDate();
      }
      this.loading = false;
    },
    // 重置
    reloadDate() {
      this.search = "";
      this.getRequestMethodDate();
    },

  },
}
</script>
