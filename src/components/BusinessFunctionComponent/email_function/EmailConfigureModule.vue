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
            编辑
          </el-button>
          <el-button type="info" size="small" plain :disabled="!email_data_status">
            测试发送
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
        <span v-if="!emailEditVisible"> {{ email_data.email_name  }}  </span>
        <el-input placeholder="请输入内容" v-else v-model="email_data.email_name"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-view"></i>
          邮箱密码
        </template>
        <span v-if="!emailEditVisible">*********</span>
        <el-input placeholder="请输入内容" v-else  v-model="email_data.email_pwd" show-password></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-location-information"></i>
          邮箱服务器地址
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_host }} </span>
        <el-input placeholder="请输入内容" v-else  v-model="email_data.email_host"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="邮箱服务器端口">
        <template slot="label">
          <i class="el-icon-link"></i>
          邮箱服务器端口
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_port }} </span>
        <el-input placeholder="请输入内容" v-else  v-model="email_data.email_port"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-copy-document"></i>
          邮箱主题
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_theme }} </span>
        <el-input placeholder="请输入内容" v-else  v-model="email_data.email_theme"></el-input>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-s-custom"></i>
          邮箱发送名称
        </template>
        <span v-if="!emailEditVisible">  {{ email_data.email_send_name }}</span>
        <el-input placeholder="请输入内容" v-else  v-model="email_data.email_send_name"></el-input>
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
        <span v-if="!emailEditVisible">  {{ email_data.email_cc_list}} </span>
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
  </div>
</template>

<script>
export default {
  name: "EmailConfigureModule",
  data() {
    // 验证密码事件
    return {
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
    // 获取email信息
    getEmail() {
      this.loading = true;
      // 验证

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
    },
  },
};
</script>
<style>
.email_config {
  width: 70%;
  margin: 0 auto;
}
</style>