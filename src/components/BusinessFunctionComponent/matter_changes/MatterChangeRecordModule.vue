<template>
  <div class="no_matter" v-loading="loading">
    <div class="head_search_add">
      <el-input placeholder="请输入PO号" v-model="search" clearable class="input_search">
      </el-input>
      <el-button type="primary" icon="el-icon-search" plain @click="searchData">搜索
      </el-button>
      <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadData">重置
      </el-button>
    </div>
    <div class="table_content">
      <el-table :data="MatterChangeRecord" style="width: 100%" height="610">
        <el-table-column prop="index" label="#" align="center"></el-table-column>
        <el-table-column label="PO" align="center" width="180">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.matter_name }}</span>
            <el-input v-model="row.matter_name" v-else></el-input>
          </template>
        </el-table-column>
        <el-table-column label="ITEM列表" align="center" width="180">
          <template v-slot="{ row }">
            <el-switch
                v-if="!row.editable"
                v-model="row.switch_value"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
                active-text="开"
                inactive-text="关"
            >
            </el-switch>
            <el-switch
                v-else
                v-model="row.switch_value"
                @change="changeSwitch($event,row)"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="开"
                inactive-text="关"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="工厂" align="center" width="300">
          <template v-slot="{ row }">
            <span  v-if="!row.editable">
              <el-tag v-if="row.is_file === 0">否</el-tag>
              <el-tag v-else type="info">是</el-tag>
            </span>
            <el-select v-else v-model="row.is_file" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in is_file_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" width="180">
          <template v-slot="{ row }">
            <el-tooltip v-if="!row.editable" class="item" effect="dark" :content="row.user_name" placement="bottom">
              <span v-if="row.user_name">{{ row.user_name.substring(0, 10) }}
              <span v-if="row.user_name && row.user_name.length >= 10">...</span></span>
            </el-tooltip>
            <el-cascader
                clearable v-else
                collapse-tags
                :props="{ multiple: true }"
                :options="user_data_list"
                v-model="row.user_id_list"
                :show-all-levels="false">
              <template slot-scope="{ node, data }">
                <span>{{ data.label }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </template>
        </el-table-column>
        <el-table-column label="生成时间" align="center" width="180">
          <template v-slot="{ row }">
            <el-tooltip v-if="!row.editable" class="item" effect="dark" :content="row.user_name" placement="bottom">
              <span v-if="row.user_name">{{ row.user_name.substring(0, 10) }}
              <span v-if="row.user_name && row.user_name.length >= 10">...</span></span>
            </el-tooltip>
            <el-cascader
                clearable v-else
                collapse-tags
                :props="{ multiple: true }"
                :options="user_data_list"
                v-model="row.user_id_list"
                :show-all-levels="false">
              <template slot-scope="{ node, data }">
                <span>{{ data.label }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </template>
        </el-table-column>
        <el-table-column label="事务名称" align="center" width="400">
          <template v-slot="{ row }">
            <span v-if="!row.editable">{{ row.rule_name }}</span>
            <el-select v-else v-model="row.no_order_matter_rule_id" collapse-tags clearable placeholder="请输选择">
              <el-option v-for="item in rule_data_list" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="变更内容" align="center" width="180" prop="create_date">
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage" @next-click="nextPage"
                     background layout="total,prev, pager, next" :page-size="10" :total="data_total"
                     v-model:current-page="page">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "MatterRecordModule",
  data() {
    return {
      search: "", // 搜索
      MatterChangeRecord: [], // 查询
      loading: false, // 数据加载样式
      // 分页
      data_total: 0, // 数据总数
      page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
      page: 1,
      // 可访问权限列表
      method_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getMatterChangeRecordData();
  },
  methods: {
    // 获取数据
    getMatterChangeRecordData() {
      let get_url;
      if (this.search) {
        get_url = `business_function/no_order_matter/?page=${this.page}&search=${this.search}`;
      } else {
        get_url = `business_function/no_order_matter/?page=${this.page}`;
      }
      this.$http
          .get(get_url)
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.MatterChangeRecord = data.data.data;
              this.data_total = data.data.data_total;
              this.method_list = data.data.method_list;
            } else {
              this.MatterChangeRecord = [];
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
      this.getMatterChangeRecordData();
    },
    prevPage(page) {
      this.loading = true;
      this.page_status = page;
      this.page = page;
      // 上一页按钮
      this.getMatterChangeRecordData();
    },
    currentPage(page) {
      this.loading = true;
      this.page = page;
      // 点击按钮触发
      if (this.page_status === 0) {
        this.getMatterChangeRecordData();
      }
    },
    // 搜索功能
    searchData() {
      this.loading = true;
      if (this.search) {
        this.page = 1;
        this.getMatterChangeRecordData();
      } else {
        this.getMatterChangeRecordData();
      }
    },
    // 重置
    reloadData() {
      this.search = "";
      this.getMatterChangeRecordData();
    },
  },
};
</script>
