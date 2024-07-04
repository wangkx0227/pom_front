<template>
  <div class="users" v-loading="loading">
    <div class="head_search_add">
      <el-button
        type="info"
        icon="el-icon-circle-plus-outline"
        plain
        @click="dialogDisplay"
        >添加
      </el-button>
      <el-input
        placeholder="请输入搜索公司名称"
        v-model="search"
        clearable
        class="input_search"
      >
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate"
        >搜索
      </el-button>
      <el-button
        type="warning"
        icon="el-icon-refresh-right"
        plain
        @click="reloadDate"
        >重置
      </el-button>
    </div>
    <div class="dialog">
      <el-dialog
        title="用户前缀添加"
        :visible.sync="dialogDisplayVar"
        width="35%"
        :before-close="handleClose"
      >
        <el-form
          :model="addusersForm"
          label-position="top"
          :rules="usersRules"
          ref="addusersRef"
        >
          <el-form-item label="前缀名称" prop="users">
            <el-input v-model="addusersForm.users"></el-input>
          </el-form-item>
          <el-form-item label="选择归属部门" prop="department_id">
            <el-select
              v-model="addusersForm.department_id"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteDepartmentSelect"
              :loading="selectDepartmentLoading"
            >
              <el-option
                v-for="item in departmentSearch"
                :key="item.id"
                :label="item.department"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input
              type="textarea"
              v-model="addusersForm.description"
            ></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
<div  class="dialog-footer">
          <el-button @click="dialogClose('addusersRef')">取 消</el-button>
          <el-button
            type="primary"
            @click="addusersData('addusersRef')"
            :loading="addLoading"
            >立即创建
          </el-button>
        </div>
</template>
      </el-dialog>
    </div>
    <div class="table_content">
      <el-table :data="usersData" style="width: 100%" max-height="580">
        <el-table-column
          prop="index"
          label="#"
          align="center"
          width="60"
        ></el-table-column>
        <el-table-column label="名称" align="center"
        width="120"
        >
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.user_name }}</span>
            <el-input v-model="row.user_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="登录名称" align="center"   prop="login_name"
        width="80"
        >
        </el-table-column>
        <el-table-column label="密码" align="center" prop="passwd"
        width="80"
        >
        </el-table-column>
        <el-table-column label="邮箱" align="center"
        width="200"
        >
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.email }}</span>
            <el-input v-model="row.email" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="账户状态" align="center"
        width="150"
        >
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag v-if="row.is_show" >正常</el-tag>
              <el-tag type="danger" v-else>禁用</el-tag>
            </div>
            <div v-else>
              <el-select v-model="is_value" clearable placeholder="请选择">
              <el-option
                v-for="item in is_show_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户唯一ID" align="center"
        width="150"
        >
          <template v-slot="{ row }">
            <el-tag>{{ row.prefix }}-{{ row.user_id }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center"
        width="180"
        >
          <template v-slot="{ row }">
            <el-tooltip
              class="item"
              effect="dark"
              :content="row.create_date"
              placement="bottom"
              v-if="!row.editable"
            >
              <div class="cell ellipsis">{{ row.create_date }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="修改日期" align="center"
        width="180"
        >
          <template v-slot="{ row }">
            <el-tooltip
              class="item"
              effect="dark"
              :content="row.update_date"
              placement="bottom"
              v-if="!row.editable"
            >
              <div class="cell ellipsis">{{ row.update_date }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="归属部门" align="center"
        width="180"
        >
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag style="margin-right: 2px" type="success" effect="plain">
                {{ row.department }}
              </el-tag>
            </div>
            <el-select
              v-else
              v-model="departmentId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteDepartmentSelect"
              :loading="selectDepartmentLoading"
            >
              <el-option
                v-for="item in departmentSearch"
                :key="item.id"
                :label="item.department"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="职位/岗位" align="center"
        width="180"
        >
          <template v-slot="{ row }">
            <div class="tag-group" v-if="!row.editable">
              <el-tag type="position" effect="plain">
                {{ row.position }}
              </el-tag>
            </div>
            <el-select
              v-else
              v-model="positionId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remotePositionSelect"
              :loading="selectPositionLoading"
            >
              <el-option
                v-for="item in positionSearch"
                :key="item.id"
                :label="item.position"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center"
        width="100"
        >
          <template v-slot="scope">
            <el-button
              v-if="!scope.row.editable"
              @click="editRow(scope.row)"
              size="mini"
              type="text"
              >编辑
            </el-button>
            <el-button
              v-else
              @click="saveRow(scope.row)"
              size="mini"
              type="text"
              >保存
            </el-button>
            |
            <el-popover
              v-if="!scope.row.editable"
              placement="top"
              width="160"
              v-model="scope.row.visible"
              trigger="manual"
            >
              <p>删除后无恢复，请问确定删除吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button
                  size="mini"
                  type="text"
                  @click="scope.row.visible = false"
                  >取消
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  @click="deleteRow(scope.$index, usersData, scope.row)"
                  >确定
                </el-button>
              </div>
              <template v-slot:reference>
<el-button
                
                size="mini"
                type="text"
                @click="deleteDisplay(scope.row)"
                >删除
              </el-button>
</template>
            </el-popover>
            <el-button
              style="margin-left: 0"
              v-else
              @click="scope.row.editable = false"
              size="mini"
              type="text"
              >取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination
        hide-on-single-page
        @current-change="currentPage"
        @prev-click="prevPage"
        @next-click="nextPage"
        background
        layout="total,prev, pager, next"
        :page-size="10"
        :total="data_total"
        v-model:current-page="page"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "usersModule",
  data() {
    let descriptionLen = (rule, value, callback) => {
      if (this.addusersForm.description.length >= 200) {
        callback(new Error("长度在不能超出 200 个字符"));
      }
    };
    return {
      // 用来控制当前账户是否可以被使用的变量列表与变量值
      is_show_list:[
        {
          value: 0,
          label: '禁用'
        },
        {
          value: 1,
          label: '正常'
        }
      ],
      is_value: "未选择",
      search: "",
      loading: false, // 数据加载样式
      usersData: [],
      // 弹出框控制变量
      dialogDisplayVar: false,
      //  添加弹出框数据
      addusersForm: {
        users: "",
        description: "",
        department_id: "",
      },
      // 弹出框内输入框大小
      formLabelWidth: "120px",
      // 控制弹窗创建按钮
      addLoading: false,
      // 弹窗内的表单验证
      usersRules: {
        users: [
          { required: true, message: "请输入前缀", trigger: "blur" },
          {
            min: 1,
            max: 15,
            message: "长度在 1 到 5 个字符之间",
            trigger: "blur",
          },
        ],
        description: [{ validator: descriptionLen, trigger: "blur" }],
      },
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 下拉框-部门
      departmentId: "", // 公司id列表
      selectDepartmentLoading: false, // 下来加载变量
      departmentSearch: [], // 搜索后的列表
      // 下拉框
      positionId: "", // 职位id列表
      selectPositionLoading: false, // 下来加载变量
      positionSearch: [], // 搜索后的列表
    };
  },
  created() {
    this.loading = true;
    this.getusersDate();
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
        .delete("users/info/", {
          data: { pk: pk },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.$message.success(data.message);
            this.getusersDate();
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
      if (this.departmentId) {
        row.department_id = this.departmentId;
      }else{
        row.department_id = 0
      }

      if(this.positionId){
        row.position_id = this.positionId
      }else{
        row.position_id = 0
      }

      if (this.is_value !== "未选择" ){
        row.is_show = this.is_value
      }else{
        row.is_show = 1
      }
      row.editable = false;
      this.$http
        .put("users/info/", {
          data: row,
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.$message.success(data.message);
            this.getusersDate();
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
      console.log(1231321);
      this.dialogDisplayVar = true;
    },
    // 关闭弹窗,并清空表单的内容
    dialogClose(formName) {
      this.dialogDisplayVar = false;
      this.$refs[formName].resetFields();
      this.getusersDate(); // 进行回调，重新载入一下数据
    },
    // ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getusersDate(); // 进行回调，重新载入一下数据
    },
    // 弹窗内创建按钮
    addusersData(formName) {
      this.addLoading = true;
      if (!this.addusersForm.users) {
        this.$message.error("部门名称属于必填项！");
        this.addLoading = false;
      } else {
        this.$http
          .post("users/info/", {
            data: this.addusersForm,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              data.data.index = 1;
              data.data.department = "新增"; // 给个默认值，进行显示
              this.usersData.unshift(data.data);
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
    getusersDate() {
      let get_url;
      if (this.search) {
        get_url = `users/info/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `users/info/?page=${this.page}`;
      }
      this.$http
        .get(get_url)
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.usersData = data.data.data;
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
      this.getusersDate();
      this.loading = false;
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getusersDate();
      this.loading = false;
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getusersDate();
      }
      this.loading = false;
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getusersDate();
      } else {
        this.getusersDate();
      }
      this.loading = false;
    },
    // 重置
    reloadDate() {
      this.search = "";
      this.getusersDate();
    },
    // 下拉框调用api方法-部门
    getDepartmentData(query) {
      this.selectDepartmentLoading = true;
      this.$http
        .get(`foundation/department/?status=all&querySelect=${query}`)
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.departmentSearch = data.data;
          } else {
            this.departmentSearch = [];
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.selectDepartmentLoading = false;
        });
    },
    // 下拉框调用方法-部门
    remoteDepartmentSelect(query) {
      if (query !== "") {
        this.getDepartmentData(query);
      }
    },
    // 下拉框api调用方法-职位
    getPositionData(query){
      this.selectPositionLoading = true;
      this.$http
        .get(`foundation/position/?status=all&querySelect=${query}`)
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.positionSearch = data.data;
          } else {
            this.positionSearch = [];
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.selectPositionLoading = false;
        });
    },
    // 下来框调用方法-职位
    remotePositionSelect(query){
      if (query !== "") {
        this.getPositionData(query);
      }
    },
  },
};
</script>

<style>
@media screen and (max-width: 700px) {
  .users .el-tag {
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
