<template>
  <div class="factory_bind_user" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="addNotice">添加公告</el-button>
      <el-input placeholder="请输入公告标题" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="factoryData" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="标题" align="center" prop="factory_name">
        </el-table-column>
        <el-table-column label="公告类型" align="center" prop="factory_code">
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_date">
        </el-table-column>
        <el-table-column label="更新时间	" align="center" prop="update_date">
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button v-if="!scope.row.editable" size="mini"
                       type="text">编辑
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button v-if="!scope.row.editable" size="mini"
                       type="text">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage"
                     @next-click="nextPage" background layout="total,prev, pager, next" :page-size="10"
                     :total="data_total" v-model:current-page="page">
      </el-pagination>
    </div>
    <div class="notice_drawer">
      <el-drawer
          size="60%"
          :title="drawer_title"
          :visible.sync="drawer"
          direction="rtl"
          :before-close="NoticeHandleClose">
        <div style="margin: 0 auto;width: 80%;height: 100%">
          <div class="notice_title" style="margin-bottom: 10px">
            标题：
            <el-input v-model="notice_title" placeholder="请输入标题"></el-input>
          </div>
          <div class="notice_content" style="margin-bottom: 10px;height: 430px">
            内容：
            <quill-editor
                style="height: 350px"
                v-model="notice_content"
                ref="myQuillEditor"
                :options="editorOption"
                @blur="onEditorBlur($event)"
                @focus="onEditorFocus($event)"
                @change="onEditorChange($event)">
            </quill-editor>
          </div>
          <div>
            公告类型（不选择默认是全部）：
            <el-select v-model="value" placeholder="请选择公告类型">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </div>
          <el-divider></el-divider>
          <el-button type="info" plain @click="addNotice" style='float: right'>提交</el-button>
        </div>

      </el-drawer>
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import {quillEditor} from 'vue-quill-editor'

export default {
  components: {
    quillEditor
  },
  name: "FactoryBindUser",
  data() {
    return {
      // 抽屉的变量
      drawer: false,
      loading: false, // 数据加载样式
      drawer_title: '公告发布',
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      notice_title: '', // 公告标题
      // 富文本
      notice_content: '', // 双向数据绑定数据，富文本数据本身
      editorOption: {  //编辑器配置项
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], //加粗，斜体，下划线，删除线
            [{'list': 'ordered'}], //列表
            [{'script': 'sub'}, {'script': 'super'}], // 上下标
            [{'indent': '-1'}, {'indent': '+1'}], // 缩进
            [{'header': [1, 2, 3, 4, 5, 6]}], //几级标题
            ['clean'], //清除字体样式
            ['image', 'video'] //上传图片、上传视频
          ]
        },
        placeholder: "输入内容..."
      },
      // 类型
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value: ''
    };
  },
  created() {
    this.loading = true;
    this.getFactoryDate();

  },
  methods: {
    // 获取数据
    getFactoryDate() {
      this.loading = false;
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getFactoryDate();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getFactoryDate();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getFactoryDate();
      }
    },
    // 搜索功能
    searchDate() {
      this.loading = true;
      this.page = 1;
      this.getFactoryDate();
    },
    // 重置
    reloadDate() {
      this.page = 1;
      this.getFactoryDate();
    },
    // 添加公告
    addNotice() {
      this.drawer_title = '公告编辑'
      this.drawer = true;
    },
    // 抽屉的函数
    NoticeHandleClose(done) {
      this.$confirm('确认关闭？关闭后编辑的内容就消失!')
          .then(_ => {
            done();
            this.content = '';
          })
          .catch(_ => {
          });
    },
    // 富文本
    onEditorBlur() {
    }, // 失去焦点触发事件
    onEditorFocus() {
    }, // 获得焦点触发事件
    onEditorChange() {
    }, // 内容改变触发事件
  },
}
</script>

<style>
</style>