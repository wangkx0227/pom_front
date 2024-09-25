<template>
  <div class="factory_bind_user" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" plain @click="addNotice">添加信息</el-button>
      <el-input placeholder="请输入信息标题" clearable class="input_search" v-model="search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data='NoticeListData' style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="标题" align="center" prop="title" width="400">
        </el-table-column>
        <el-table-column label="接受角色" align="center">
          <template v-slot="{ row }">
            <el-tag>{{ row.type_role_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布用户" align="center">
          <template v-slot="{ row }"  >
            <el-tag effect="plain">{{ row.user_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_date" width="180">
        </el-table-column>
        <el-table-column label="更新时间	" align="center" prop="update_date" width="180">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="text" @click="updateNotice(scope.row)">编辑
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-popover placement="top" width="160" v-model="scope.row.visible" trigger="manual">
              <p>删除后无恢复，请问确定删除吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                </el-button>
                <el-button type="primary" size="mini" @click="deleteRow(scope.$index, NoticeListData, scope.row)">确定
                </el-button>
              </div>
              <template v-slot:reference>
                <el-button size="mini" type="text" @click="deleteDisplay(scope.row)">删除
                </el-button>
              </template>
            </el-popover>
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
    <div class="notice_drawer">
      <el-drawer size="60%" :title="drawer_title" :visible.sync="drawer" direction="rtl" :wrapperClosable="false"
                 :append-to-body="true"
                 :modal-append-to-body="false"
                 :before-close="NoticeHandleClose">
        <div style="margin: 0 auto;width: 80%;height: 100%">
          <div class="notice_title" style="margin-bottom: 10px">
            标题：
            <el-input v-model="notice_title" placeholder="请输入标题"></el-input>
          </div>
          <div class="notice_content" style="margin-bottom: 10px;height: 430px">
            内容：
            <quill-editor style="height: 350px" v-model="notice_content" ref="myQuillEditor" :options="editorOption">
            </quill-editor>
          </div>
          <div>
            接受角色：
            <el-select v-model="notice_type" placeholder="请选择公告类型">
              <el-option v-for="item in RolesListData" :key="item.id" :label="item.role" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <el-divider></el-divider>
          <el-button type="primary" plain @click="drawer=false" style='float: right;'>关闭</el-button>
          <el-button  type="success" plain @click="saveNotice" style='float: right;margin-right: 10px' :loading="SaveLoading">提交</el-button>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'
export default {
  components: {
    quillEditor
  },
  name: "FactoryBindUser",
  data() {
    // 编辑器的工具栏模块
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'], //加粗，斜体，下划线，删除线
      [{'list': 'ordered'}], //列表
      [{'script': 'sub'}, {'script': 'super'}], // 上下标
      [{'indent': '-1'}, {'indent': '+1'}], // 缩进
      [{'header': [1, 2, 3, 4, 5, 6]}], //几级标题
      ['clean'], //清除字体样式
      [] //上传图片、上传视频，不进行使用
    ];
    return {
      NoticeListData: [],
      // 抽屉的变量
      drawer: false,
      loading: false, // 数据加载样式
      drawer_title: '公告发布',
      SaveLoading: false, // 抽屉的添加按钮加载变量
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      notice_title: '', // 公告标题
      notice_content: '', // 双向数据绑定数据，富文本数据本身
      editorOption: {  //编辑器配置项
        modules: {
          toolbar:toolbarOptions,
        },
        placeholder: "输入内容..."
      },
      notice_type: 0, // 公告类型，按照角色进行区分
      RolesListData: [], // 角色列表
      // 搜索
      search: null,
      // 修改使用的id
      pk: null,
    };
  },
  created() {
    this.loading = true;
    this.getRoleData();
    this.getNoticeDate();

  },
  methods: {
    // 获取数据
    getNoticeDate() {
      let get_url;
      if (this.search) {
        get_url = `foundation/notice/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `foundation/notice/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.NoticeListData = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.NoticeListData = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    // 获取角色，根据角色进去发送公告
    getRoleData() {
      this.$http
          .get("users/roles/?status=all",)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.RolesListData = data.data;
            } else {
              this.RolesListData = [];
            }
            this.RolesListData.unshift({id: 0, role: '全部'})
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
          });
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getNoticeDate();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getNoticeDate();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getNoticeDate();
      }
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      this.page = 1;
      this.getNoticeDate();
    },
    // 重置
    reloadDate() {
      this.page = 1;
      this.search = null;
      this.getNoticeDate();
    },
    // 添加按钮
    addNotice() {
      this.drawer_title = '公告添加';
      this.drawer = true;
    },
    // 抽屉的关闭函数
    NoticeHandleClose(done) {
      done();
      this.pk = null;
      this.notice_title = '';
      this.notice_content = '';
      this.notice_type = 0;
      this.getNoticeDate();
    },
    // 抽屉内提交按钮
    saveNotice() {
      if (!this.notice_title) {
        this.$notify({
          title: '提示',
          message: '标题不能为空！',
          type: 'warning',
          offset: 30,
          duration: 2000,
        });
      } else {
        this.SaveLoading = true;
        let get_url;
        if (this.pk) {
          get_url = `foundation/notice/?pk=${this.pk}`;
        } else {
          get_url = `foundation/notice/`;
        }
        this.$http
            .post(get_url, {
              data: {
                title: this.notice_title,
                content: this.notice_content,
                type: this.notice_type,
              }
            })
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                if (!this.pk) {
                  data.data.index = 1;
                  this.NoticeListData.unshift(data.data);
                  this.notice_title = '';
                  this.notice_content = '';
                  this.notice_type = 0;
                }
              } else {
                this.$message.error(data.message);
              }
            })
            .catch((error) => {
              this.$message.error(error.message);
            })
            .finally(() => {
              this.SaveLoading = false;
            });
      }

    },
    // 删除
    //删除按钮显示小弹框
    deleteDisplay(row) {
      row.visible = true;
    },
    // 删除按钮确认删除
    deleteRow(index, rows, row) {
      let pk = row.id;
      this.loading = true;
      this.$http
          .delete("foundation/notice/", {
            data: {pk: pk},
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              rows.splice(index, 1);
              // 如果删除的时候，页面内的数据已经删除完毕了，通过这层判断进行操作重定向前面的页面（需要在每一个需要进行删除的操作中添加当前判断）
              if (rows.length === 0) {
                if (this.page !== 1) {
                  this.page -= 1;
                }
              }
              this.getNoticeDate();
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
    // 编辑
    updateNotice(row) {
      this.drawer_title = '公告编辑';
      this.drawer = true;
      this.notice_title = row.title;
      this.notice_type = row.type;
      this.notice_content = row.content;
      this.pk = row.id;
    },
  },
}
</script>

<style></style>
