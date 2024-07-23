<template>
  <div class="userinfo" v-loading="loading">
    <el-descriptions title="用户基本信息" direction="vertical" :column="4" border
      style="margin-right: 10px; margin-left: 10px">
      <el-descriptions-item label="中文名称">
        {{ user_info_form.user_name }}
        <el-tag size="small">{{ user_info_form.position }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="账户名称">{{ user_info_form.login_name }}
      </el-descriptions-item>
      <el-descriptions-item label="账户创建时间">{{ user_info_form.create_date }}
      </el-descriptions-item>
      <el-descriptions-item label="账户所属公司">{{ user_info_form.firm }}
      </el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ user_info_form.department }}
      </el-descriptions-item>
      <el-descriptions-item label="账户唯一ID">{{ user_info_form.prefix }}-{{ user_info_form.user_id }}
      </el-descriptions-item>
      <el-descriptions-item label="账户最后变动时间">{{ user_info_form.update_date }}
      </el-descriptions-item>
      <el-descriptions-item label="邮箱">
        <el-tag v-if="user_info_form.email">{{ user_info_form.email }}</el-tag>
        <el-tag v-else>请联系管理员添加</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="密码">
        ******
        <el-button size="mini" type="primary" @click="showDialog">修改密码
        </el-button>
      </el-descriptions-item>
      <el-descriptions-item label="延期审核主管"> 罗立</el-descriptions-item>
      <el-descriptions-item label="权限">
        登录/退出/仪表盘
      </el-descriptions-item>
    </el-descriptions>
    <div class="dialog">
      <el-dialog title="修改密码" :visible.sync="dialogVisible" width="25%">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="新密码" prop="password">
            <el-input v-model="form.password" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="repassword">
            <el-input v-model="form.repassword" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('form')" style="float: right">提交修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserInfoView",
  data() {
    // 验证密码事件
    let passwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (6 > value.length || value.length > 18) {
        callback(new Error("长度在 6 到 18 个字符"));
      } else {
        callback();
      }
    };
    // 验证确认密码事件
    let repasswd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      user_id: null,
      loading: false, // 访问加载
      user_info_form: {}, // 获取的基础信息
      dialogVisible: false,
      // 密码与确认密码
      form: {
        password: "",
        repassword: "",
      },
      // 邮箱
      email: null,
      // 邮箱/密码验证器
      rules: {
        password: [{ validator: passwd, trigger: "blur" }],
        repassword: [{ validator: repasswd, trigger: "blur" }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      },
    };
  },
  created() {
    this.loading = true;
    this.getUserInfo();

  },
  methods: {
    // 打开弹窗
    showDialog() {
      this.dialogVisible = !this.dialogVisible;
    },
    // 修改密码按钮
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.updatePassword();
        }
      });
    },
    // 发送请求,修改密码
    updatePassword() {
      this.$http
        .put("users/update_passwd/", { pwd: this.form.password })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            localStorage.clear();
            this.$message.success(data.message);
          } else {
            this.$message.error(data.message);
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        })
        .finally(() => {
          this.dialogVisible = false;
          setTimeout(() => {
              this.$router.push({
                name: "login",
                query: { url_name: "user_info" },
              });
            }, 1000);
        });
    },
    // 获取用户基本数据，无法获取延期审核人信息，与权限信息
    getUserInfo() {
      this.$http
        .get("users/personal_details/")
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.user_info_form = data.data;
            this.user_id = data.data.id
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
  },
};
</script>

<style>
@media screen and (max-width: 700px) {
  .userinfo .el-button--mini {
    font-size: 9px;
    padding: 5px 8px;
  }

  .userinfo .el-descriptions-row .el-descriptions-item__cell {
    font-size: 9px !important;
  }

  .userinfo .el-tag,
  .el-tag--small {
    height: 20px;
    padding: 0px 5px;
    line-height: 20px;
    font-size: 9px;
  }

  .userinfo .el-input {
    font-size: 9px !important;

  }

  .userinfo .el-input__inner {
    height: 30px;
    line-height: 30px;
    outline: 0;
    padding: 0 4px;
  }

  .userinfo .el-form-item__error {
    font-size: 9px !important;
  }
}
</style>
