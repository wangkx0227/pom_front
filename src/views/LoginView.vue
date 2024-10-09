<template>
  <div class="login">
    <h3 class="login_title">POM系统登录</h3>
    <el-tabs v-model="activeName" v-loading="loading" element-loading-text="正在登录" @tab-click="loginTabsClick">
      <el-tab-pane label="中文名登录" name="first">
        <el-form :model="login" status-icon class="demo-ruleForm">
          <el-form-item prop="pass">
            <el-input type="text" v-model="login.username" placeholder="账户名" suffix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="checkPass">
            <el-input type="password" v-model="login.password" placeholder="密码" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="login.checked">七天免登录</el-checkbox>
            <el-button type="primary" style="width: 100%" plain @click="loginClick()">登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="账户登录" name="second">
        <el-form :model="login" status-icon class="demo-ruleForm">
          <el-form-item prop="pass">
            <el-input type="text" v-model="login.username" placeholder="用户名" suffix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="checkPass">
            <el-input type="password" v-model="login.password" placeholder="密码" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="login.checked">七天免登录</el-checkbox>
            <el-button :loading="loading" type="primary" style="width: 100%" plain @click="loginClick()">登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      activeName: "first", // 默认选中选项卡
      salt: "", // 盐值
      login: {
        username: "",
        password: "",
        checked: false,
      },
    };
  },
  created() {
  },
  methods: {
    // 密码加盐
    encodePasswordWithSalt() {
      // 随机生成 10位盐值
      this.salt = Math.random().toString(36).substr(2, 10);
      const combined = this.login.password + this.salt; // 密码和盐值拼接
      return btoa(combined); // 使用 Base64 编码
    },
    loginClick() {
      const ecnode_password = this.encodePasswordWithSalt();
      this.loading = true;
      if (!this.login.username) {
        this.$message.error("请输入用户名称！");
        this.loading = false;
      } else if (!this.login.password) {
        this.$message.error("请输入密码！");
        this.loading = false;
      } else {
        let data = {
          user_name: this.login.username,
          password: ecnode_password,
          checked: this.login.checked,
          active_name: this.activeName,
          salt: this.salt
        };
        this.$http
            .post("users/login/", data)
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                localStorage.setItem("front_list", JSON.stringify(data.front_list)); // 前端菜单权限
                localStorage.setItem("authorization", "Bearer " + data.access_token); // 写入到浏览器缓存中
                localStorage.setItem("user_name", data.data.user_name); // 用户名字写入缓存中
                localStorage.setItem("user_id", data.data.user_id); // 用户名字写入缓存中
                let url_name = this.$route.query.url_name;
                if (url_name) {
                  this.$router.push({name: url_name.toString()}); // 跳转到原来的网页
                } else {
                  this.$router.push({name: "index"}); // 跳转首页
                }
              } else {
                this.$message.error(data.message);
              }
            })
            .catch((error) => {
              this.$message.error(error.message);
            })
            .finally(() => {
              this.loading = false;
              this.login.password = '';
            });
      }

    },
    // tab 切换 清除输入内容
    loginTabsClick() {
      this.login.checked = false;
      this.login.password = '';
      this.login.username = '';
    }
  },
};
</script>
<style>
body {
  height: 100%;
  width: 100%;
  position: relative;
  background-image: #ffffffe6;
}

.login_title {
  line-height: 50px;
  text-align: center;
}

.login {
  width: 330px;
  margin: 0 auto;
  position: relative;
  top: 20%;
}
</style>
