<template>
  <div class="userinfo" v-loading="loading">
    <el-card class="box-card">
      <el-descriptions title="用户基本信息" direction="vertical" size="medium" :column="4" border>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-user"></i>
            中文名称
          </template>
          {{ user_info_form.user_name }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-suitcase"></i>
            职位
          </template>
          {{ user_info_form.position }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-user"></i>
            账户名称
          </template>
          {{ user_info_form.login_name }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-office-building"></i>
            账户所属公司
          </template>
          {{ user_info_form.firm }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-shopping-bag-2"></i>
            所属部门
          </template>
          {{ user_info_form.department }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            账户创建时间
          </template>
          {{ user_info_form.create_date }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-bank-card"></i>
            账户唯一ID
          </template>
          {{ user_info_form.prefix }}-{{ user_info_form.user_id }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-chat-line-round"></i>
            邮箱
          </template>
          <span v-if="user_info_form.email">
          {{ user_info_form.email }}
        </span>
          <span v-else>
          无邮箱
        </span>
          <el-button size="mini" type="text" @click="emailShowDialog" style="float: right">修改邮箱</el-button>
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            账户修改时间
          </template>
          {{ user_info_form.update_date }}
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-view"></i>
            密码
          </template>
          ******
          <el-button size="mini" type="text" @click="pwdShowDialog" style="float: right">修改密码
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-edit"></i>
            延期审核主管
          </template>
          罗力
        </el-descriptions-item>
        <el-descriptions-item :span="1">
          <template slot="label">
            <i class="el-icon-set-up"></i>
            是否开启中文账户名称登录
          </template>
          <el-switch
              v-model="user_info_form.is_user_name_login"
              @change="changeSwitch($event,user_info_form)"
              active-text="开启"
              inactive-text="关闭">
          </el-switch>
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template slot="label">
            <i class="el-icon-reading"></i>
            基础功能
          </template>
          {{ user_info_form.foundation_api_string }}
        </el-descriptions-item>
        <el-descriptions-item :span="4">
          <template slot="label">
            <i class="el-icon-reading"></i>
            高级功能
          </template>
          {{ user_info_form.function_api_string }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="dialog">
        <el-dialog title="修改密码" :visible.sync="pwdDialogVisible" width="25%">
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
      <div class="dialog">
        <el-dialog title="修改邮箱" :visible.sync="emailDialogVisible" width="25%">
          <el-form :model="emailForm" ref="emailForm">
            <el-form-item label="新邮箱" prop="email" :rules="[
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
          ]">
              <el-input v-model="emailForm.email"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitEmailForm('emailForm')" style="float: right">提交修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </el-card>
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
      pwdDialogVisible: false,
      salt: "", // 盐值
      // 密码与确认密码
      form: {
        password: "",
        repassword: "",
      },
      // 邮箱
      emailForm: {
        email: null,
      },
      emailDialogVisible: false,
      // 邮箱/密码验证器
      rules: {
        password: [{validator: passwd, trigger: "blur"}],
        repassword: [{validator: repasswd, trigger: "blur"}],
      },
    };
  },
  created() {
    this.loading = true;
    this.getUserInfo();
  },
  methods: {
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
    // 打开弹窗
    pwdShowDialog() {
      this.pwdDialogVisible = !this.pwdDialogVisible;
    },
    emailShowDialog() {
      this.emailDialogVisible = !this.emailDialogVisible;
    },
    // 修改密码按钮
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.updatePassword();
        }
      });
    },
    // 密码加盐
    encodePasswordWithSalt() {
      // 随机生成 10位盐值
      this.salt = Math.random().toString(36).substr(2, 10);
      const combined = this.form.password + this.salt; // 密码和盐值拼接
      return btoa(combined); // 使用 Base64 编码
    },
    // 发送请求,修改密码
    updatePassword() {
      const ecnode_password = this.encodePasswordWithSalt();
      this.$http
          .put("users/update_passwd/", {pwd: ecnode_password, salt: this.salt})
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
            this.pwdDialogVisible = false;
            setTimeout(() => {
              this.$router.push({
                name: "login",
                query: {url_name: "user_info"},
              });
            }, 1000);
          });
    },
    // 发送请求,修改密码
    updateEmail() {
      this.$http
          .put("users/update_email/", {email: this.emailForm.email})
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getUserInfo();
            } else {
              this.$message.error(data.message);
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.emailDialogVisible = false;
          });
    },
    // 修改邮箱按钮
    submitEmailForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.updateEmail();
        }
      });
    },
    // 开关方法变动回调函数,修改是否开启中文名称登录功能
    changeSwitch(newValue, row) {
      this.loading = true;
      const pk = row.id;
      let is_user_name_login = newValue ? 1 : 0;
      this.$http
          .put("users/update_user_name_login/", {pk: pk, is_user_name_login: is_user_name_login})
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
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
    }
  },
};
</script>

<style>
@import url("@/static/convention.css");

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
