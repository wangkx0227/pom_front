<template>
  <div class="index">
    <div class="header">
      <h5 class="title-h5">POM管理系统</h5>
      <div style="margin-right: 15px">
        <span class="tag-group__title gradient-text">登录用户：</span>
        <el-dropdown @command="changeDropdown" trigger="click">
          <el-button type="info" class="userTag" size="mini">
            <i class="el-icon-user"></i>
            {{ name }}
          </el-button>
          <template v-slot:dropdown>
<el-dropdown-menu >
            <el-dropdown-item command="access">访问记录</el-dropdown-item>
            <el-dropdown-item command="userinfo" divided>
              用户信息</el-dropdown-item
            >
            <el-dropdown-item command="logout" divided>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
</template>
        </el-dropdown>
      </div>
    </div>
    <div class="sidebar">
      <SidebarMenu></SidebarMenu>
    </div>
    <div class="content">
      <Breadcrumb></Breadcrumb>
      <div
        class="main"
        style="margin-top: 5px; margin-left: 5px; margin-right: 5px"
      >
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script>
import Breadcrumb from "@/components/BreadcrumbModule";
import SidebarMenu from "@/components/SidebarmenuModule";

export default {
  components: {
    Breadcrumb, // 面包屑
    SidebarMenu, // 侧边栏菜单
  },
  data() {
    return {
      name: null,
    };
  },
  created() {
    setTimeout(() => {
      this.decisionPCPhone();
    }, 3000);
    let user_info = JSON.parse(localStorage.getItem("user_info"));
    if (user_info) {
      this.name = user_info.user_name;
    } else {
      this.name = "test";
    }
  },
  methods: {
    // 下拉选择，根据属性进行选择展示信息
    changeDropdown(command) {
      if (command === "logout") {
        // 退出
        this.userLogOut();
      }
      if (command === "userinfo") {
        // 跳转
        this.userInfo();
      }
      if (command === "access") {
        this.userAccess();
      }
    },
    // 跳转用户信息
    userInfo() {
      // 访问的是当前组件的网址，什么都不做
      if (window.location.pathname === "/index/user_info") {
        null;
      } else {
        this.$router.push({ name: "user_info" });
      }
    },
    // 退出登录按钮
    userLogOut() {
      this.$http
        .delete("users/login/")
        .then((res) => {
          const data = res.data;
          if (data.code === 200) {
            localStorage.clear();
            this.$message.success(data.message);
          }
          setTimeout(() => {
            this.$router.push({ name: "login" });
          }, 2000);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            setTimeout(() => {
              this.$router.push({ name: "login" });
            }, 2000);
          }
          this.$message.error(error.message);
        })
        .finally(() => {});
    },
    // 用户访问记录
    userAccess() {
      console.log("访问记录");
    },
    // 判断当前是pc端还是手机端，手机端进行提示信息
    decisionPCPhone() {
      const val =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      let tip = localStorage.getItem("tip");
      if (!tip && val) {
        this.$message("正在使用手机端，部分功能无法显示，建议使用pc访问");
        localStorage.setItem("tip", "1");
      }
    },
  },
};
</script>

<style>
.gradient-text {
  background-image: linear-gradient(to right, #a393bb, #6d6672);
  -webkit-background-clip: text;
  background-clip: text;
  font-weight: bold;
  color: transparent; /* 将文字颜色设置为透明 */
}

.title-h5 {
  margin-left: 10px;
  margin-bottom: 0;
}

.header {
  background-color: #303133;
  height: 60px;
  display: flex;
  color: #fff;
  align-items: center;
  justify-content: space-between;
}

.sidebar {
  width: 20%;
  margin: 0;
  padding: 0;
  width: 200px;
  background-color: #f1f1f1;
  position: fixed;
  height: 100%;
  overflow: auto;
  z-index: 999;
}

.index .content {
  margin-left: 200px;
  overflow-y: scroll;
  max-height: 92vh;
}

@media screen and (max-width: 700px) {
  .userTag {
    font-size: 10px;
  }
  .el-dropdown .el-button--mini,
  .el-button--mini.is-round {
    padding: 4px 10px;
  }
  .gradient-text {
    font-size: 12px;
  }

  .title-h5 {
    font-size: 14px;
  }

  .sidebar {
    width: 100%;
    height: auto;
    bottom: 0;
  }

  .index .content {
    margin-left: 0;
  }

  ul {
    display: flex;

    border-top: solid 1px #e6e6e6;
    border-left: none;
  }
  /*sdasa有问题*/
  .sidebar {
    overflow: initial;
  }
  .el-menu {
    border-right: none;
    justify-content: center;
  }
  .el-menu .el-menu-item {
    padding-left: 6px !important;
  }
  ul li span {
    /*display: none;*/
    font-size: 10px;
  }
  ul li i {
    width: 15px !important;
    font-size: 10px !important;
    margin-right: 0px !important;
  }
  .el-submenu {
    display: none;
  }

  .header {
    height: 50px;
  }

  .el-dropdown-menu {
    flex-direction: column;
  }

  .el-dropdown-menu__item {
    line-height: 24px;
    font-size: 10px;
  }
}

</style>
