<template>
  <div class="email_config" v-loading="loading">
    <el-alert
        title="设置完毕后，请进行发送测试邮件进行测试。"
        type="warning">
    </el-alert>
    <el-descriptions title="邮箱配置" direction="vertical" :column="4" border
                     style="margin:5px 10px;">
      <template slot="extra">
        <div v-if="!emailEditVisible">
          <el-button type="primary" size="small" plain @click="emailEditVisible=true" :disabled="!email_data_status">
            编辑配置
          </el-button>
          <el-button type="info" size="small" plain :disabled="!email_data_status" @click="showDialog">
            测试配置
          </el-button>
        </div>
        <div v-else>
          <el-button type="success" size="small" plain @click="saveEmail">
            保存
          </el-button>
          <el-button type="info" size="small" plain @click="emailEditVisible=false">
            取消
          </el-button>
        </div>
      </template>
      <el-descriptions-item label="邮箱账户">
        <template slot="label">
          <i class="el-icon-user"></i>
          邮箱账户
        </template>
        <span v-if="!emailEditVisible"> {{ email_data.email_name }}  </span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_name"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-view"></i>
          邮箱密码
        </template>
        <span v-if="!emailEditVisible">*********</span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_pwd" show-password></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-location-information"></i>
          邮箱服务器地址
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_host }} </span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_host"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="邮箱服务器端口">
        <template slot="label">
          <i class="el-icon-link"></i>
          邮箱服务器端口
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_port }} </span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_port"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-copy-document"></i>
          邮箱主题
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_theme }} </span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_theme"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-s-custom"></i>
          邮箱发送名称
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_send_name }}</span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_send_name"></el-input>
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template slot="label">
          <i class="el-icon-chat-line-square"></i>
          邮箱消息
        </template>
        <span v-if="!emailEditVisible"> {{
            email_data.email_send_content
          }} </span>
        <el-input
            v-else
            type="textarea"
            :rows="1"
            placeholder="请输入内容"
            v-model="email_data.email_send_content"
        >
        </el-input>
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template slot="label">
          <i class="el-icon-message"></i>
          收件人列表（如果是多个请使用反斜杠隔开 /）
        </template>
        <span v-if="!emailEditVisible">  {{
            email_data.email_receiving_list
          }} </span>
        <el-input
            v-else
            type="textarea"
            :rows="1"
            placeholder="请输入内容"
            v-model="email_data.email_receiving_list"

        >
        </el-input>
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template slot="label">
          <i class="el-icon-message"></i>
          抄送人列表 （如果是请使用反斜杠隔开 / ）
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_cc_list }} </span>
        <el-input
            v-else
            type="textarea"
            :rows="1"
            placeholder="请输入内容"
            v-model="email_data.email_cc_list"
        >
        </el-input>
      </el-descriptions-item>
    </el-descriptions>
    <div class="dialog">
      <el-dialog title="输入测试邮箱" :visible.sync="dialogVisible" width="25%">
        <el-form v-loading="sendLoading">
          <el-form-item label="接受测试邮箱地址">
            <el-input v-model="test_email"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="sendEmail" style="float: right" size="small">发送
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>

  </div>
</template>

<script>
export default {
  name: "EmailConfigureModule",
  data() {
    // 验证密码事件
    return {
      test_email: "",
      dialogVisible: false,
      sendLoading: false,
      loading: false,
      email_data: {
        email_name: "",
        email_host: "",
        email_pwd: "",
        email_port: "",
        email_theme: "",
        email_send_name: "",
        email_send_content: "",
        email_receiving_list: "",
        email_cc_list: ""
      },
      email_data_status: true,
      emailEditVisible: false, // 修改保存按钮控制变了
    };
  },
  created() {

    this.getEmail();
  },
  methods: {
    // 邮箱验证
    validateEmail(email) {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return regex.test(email);
    },
    // 整数验证
    validateInteger(value) {
      const regex = /^\-?\d+$/;
      return regex.test(value);
    },
    // 服务器地址验证
    validateHost(value) {
      const regex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]{3}$/;
      return regex.test(value);
    },
    // 收件人列表与抄送人邮箱列表验证
    validateEmailList(value) {
      let status = false;
      const email_list = value.split("/")
      // 验证收件列表
      for (let i = 0; i < email_list.length; i++) {
        let receiving_return = this.validateEmail(email_list[i])
        if (!receiving_return) {
          status = true;
          break
        }
      }
      return status;
    },
    // 获取email信息
    getEmail() {
      this.$http
          .get("business_function/email_config/")
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.email_data = data.data;
            } else {
              this.$message.error(data.message);
              this.email_data_status = false;
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    // 邮箱编辑按钮事件
    saveEmail() {
      this.loading = true;
      const verify_email = this.validateEmail(this.email_data.email_name)
      const verify_port = this.validateInteger(this.email_data.email_port)
      const verify_host = this.validateHost(this.email_data.email_host)
      const verify_receiving = this.validateEmailList(this.email_data.email_receiving_list)
      const verify_cc = this.validateEmailList(this.email_data.email_cc_list)
      // 验证
      if (!verify_email) {
        this.$message.error("邮箱格式不正确！")
        this.loading = false;
      } else if (!verify_port) {
        this.$message.error("端口格式不正确，应为整数！")
        this.loading = false;
      } else if (!verify_host) {
        this.$message.error("邮箱号服务地址格式不正确！")
        this.loading = false;
      } else if (verify_receiving) {
        this.$message.error("收件人列表格式不正确，请检查后提交！")
        this.loading = false;
      } else if (verify_cc) {
        this.$message.error(" 抄送人列表格式不正确，请检查后提交！")
        this.loading = false;
      } else {
        this.$http
            .put("business_function/email_config/", {
              data: this.email_data,
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.emailEditVisible = false;
                this.$message.success(data.message);
                this.getEmail();
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
      }
    },
    // 测试发送邮箱
    sendEmail() {
      this.sendLoading = true;
      const verify_email = this.validateEmail(this.test_email);
      if (!this.test_email) {
        this.$message.error("请输入接受测试邮件的邮箱！");
        this.sendLoading = false;
      } else if (!verify_email) {
        this.$message.error("邮箱格式不正确！");
        this.sendLoading = false;
      } else {
        this.$http
            .post("business_function/email_config/", {
              data: this.test_email,
            })
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
              this.sendLoading = false;
            });
      }
    },
    // 打开弹窗
    showDialog() {
      this.dialogVisible = !this.dialogVisible;
    },
  }
  ,
}
;
</script>
<style>
.email_config {
  width: 70%;
  margin: 0 auto;
}
</style>
