<template>
  <div class="order_record_info" v-loading="loading">
    <div class="head_search_add">
      <el-button type="info" icon="el-icon-circle-plus-outline" plain @click="dialogDisplay">
        手动添加
      </el-button>
      <el-input placeholder="请输入PO进行查询" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="order_record_info_list" style="width: 100%">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="客户ID" align="center" prop="client_id">
        </el-table-column>
        <el-table-column label="PO" align="center" prop="po" width="180">
        </el-table-column>
        <el-table-column label="ITEM" align="center" prop="item" width="180">
        </el-table-column>
        <el-table-column label="工厂代码" align="center" prop="factory_code" width="180">
        </el-table-column>
        <el-table-column label="工厂名称" align="center" width="300" prop="factory_name">
        </el-table-column>
        <el-table-column label="跟进人姓名" align="center" prop="follow_user_name" width="180">
        </el-table-column>
        <el-table-column label="订单周期（天）" align="center" prop="end_time_day" width="180">
        </el-table-column>
        <el-table-column label="订单导入时间" align="center" width="180" prop="create_date">
        </el-table-column>
        <el-table-column label="是否异常（生成对应事项）" align="center" width="230" prop="is_exceptional">
          <template v-slot="{ row }">
            <el-tag v-if="row.is_exceptional" type="danger">是</el-tag>
            <el-tag v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button v-if="scope.row.is_exceptional" size="mini" type="text"
                       @click="OrderStopOrRepair(scope.row,'repair')">事项修复
            </el-button>
            <el-divider v-if="scope.row.is_exceptional" direction="vertical"></el-divider>
            <el-button size="mini" type="text" @click="OrderStopOrRepair(scope.row,'stop')">事项终止</el-button>
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
    <div class="dialog">
      <el-dialog title="订单录入添加" :visible.sync="dialogDisplayVar" width="35%" :before-close="handleClose">
        <el-alert title="注意：" type="warning">
          <template slot='title'>
            <div>需要注意的事项:</div>
            <div>1、如果订单系统录入，并没产生记录，没有记录就不会存在事项，那么可以通过手动录入的方式实现生成事项！</div>
            <div>2、这些信息需要按照OMR录入的订单信息进行录入。</div>
            <div>3、所有的项都需要填写，不能为空！</div>
          </template>
        </el-alert>
        <el-form :model="addOrderRecordForm" label-position="top" :rules="rules" ref="addOrderRecordRef">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="客户ID" prop="client_id">
                <el-input v-model="addOrderRecordForm.client_id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="PO" prop="po_num">
                <el-input v-model="addOrderRecordForm.po_num"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="ITEM" prop="po_item">
                <el-input v-model="addOrderRecordForm.po_item"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="工厂代码" prop="factory_code">
                <el-input v-model="addOrderRecordForm.factory_code"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="工厂名称" prop="factory_name">
                <el-input v-model="addOrderRecordForm.factory_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="跟进人名称" prop="follow_user_name">
                <el-input v-model="addOrderRecordForm.follow_user_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="订单周期（天）">
                <el-input-number :min="0"
                                 :max="100"
                                 controls-position="right"
                                 v-model="addOrderRecordForm.end_time_day"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="dialogClose('addOrderRecordRef')">取 消</el-button>
            <el-button type="primary" :loading="addLoading" @click="addOrderRecord">创建添加
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderRecordInfoModule",
  data() {
    return {
      search: "", // 搜索
      order_record_info_list: [], // 查询
      loading: false, // 数据加载样式
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 控制手动添加的变量
      addOrderRecordForm: {
        po_num: "",
        po_item: "",
        client_id: '',
        factory_code: '',
        factory_name: '',
        end_time_day: 0,
        follow_user_name: '',
      },
      dialogDisplayVar: false,
      addLoading: false,
      rules: {
        po_num: [
          {required: true, message: "PO不能为空", trigger: "blur"},
        ],
        po_item: [
          {required: true, message: "ITEM不能为空", trigger: "blur"},
        ],
        client_id: [
          {required: true, message: "客户ID不能为空", trigger: "blur"},
        ],
        factory_code: [
          {required: true, message: "工厂代码不能为空", trigger: "blur"},
        ],
        factory_name: [
          {required: true, message: "工厂名称不能为空", trigger: "blur"},
        ],
        follow_user_name: [
          {required: true, message: "跟进人不能为空", trigger: "blur"},
        ],
      },
    };
  },
  created() {
    this.loading = true;
    this.getOrderRecordData();
  },
  methods: {
    // 显示弹框
    dialogDisplay() {
      this.dialogDisplayVar = true;
    },
    // 添加 ×关闭
    handleClose() {
      this.dialogDisplayVar = false;
      this.getOrderRecordData(); // 进行回调，重新载入一下数据
    },
    // 关闭弹窗,并清空表单的内容
    dialogClose(formName) {
      this.dialogDisplayVar = false;
      this.$refs[formName].resetFields();
      this.getOrderRecordData(); // 进行回调，重新载入一下数据
    },
    // 获取数据
    getOrderRecordData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/order_record_info/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/order_record_info/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.order_record_info_list = data.data.data;
              this.data_total = data.data.data_total;
            } else {
              this.order_record_info_list = [];
            }
          })
          .catch((error) => {
            this.$message.error(error.message);
          })
          .finally(() => {
            this.page_status = 0;
            this.loading = false;
          });
    },
    // 页码功能
    nextPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 下一页按钮
      this.getOrderRecordData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getOrderRecordData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getOrderRecordData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getOrderRecordData();
      } else {
        this.getOrderRecordData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getOrderRecordData();
    },
    // 异常修复/事项终止
    OrderStopOrRepair(row, status) {
      this.loading = true;
      row.status = status;
      this.$http
          .put("business_function/order_record_info/", {data: row})
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.$message.success(data.message);
              this.getOrderRecordData();
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
    // 添加
    addOrderRecord() {
      if (!this.addOrderRecordForm.client_id) {
        this.$message.error("客户ID不能为空！")
      } else if (!this.addOrderRecordForm.po_num) {
        this.$message.error("PO不能为空！")
      } else if (!this.addOrderRecordForm.po_item) {
        this.$message.error("ITEM不能为空！")
      } else if (!this.addOrderRecordForm.factory_code) {
        this.$message.error("工厂代码不能为空！")
      } else if (!this.addOrderRecordForm.factory_name) {
        this.$message.error("工厂名称不能为空！")
      } else if (!this.addOrderRecordForm.follow_user_name) {
        this.$message.error("跟进人名称不能为空！")
      } else if (this.addOrderRecordForm.end_time_day === 0) {
        this.$message.error("订单周期时间，请正确设置！")
      } else {
        this.addLoading = true;
        this.$http
            .post("business_function/order_record_info/", this.addOrderRecordForm)
            .then((res) => {
              let data = res.data;
              if (data.code === 200) {
                this.$message.success(data.message);
                this.getOrderRecordData();
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
  },
};
</script>


