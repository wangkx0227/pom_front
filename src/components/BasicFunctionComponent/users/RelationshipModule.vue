<template>
  <div class="relationship" v-loading="loading" style="display: flex;flex-wrap: nowrap;justify-content: space-between;">
    <div style="width: 32%;text-align: center">
      <h3>经理</h3>
      <el-divider>经理</el-divider>
      <el-table
          :data="user_data_manage_list"
          style="width: 100%" height="600">
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            label="姓名" align="center">
          <template v-slot="{ row }">
            <el-button type="text">{{row.user_name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
            prop="department"
            label="部门" align="center">
        </el-table-column>
      </el-table>
    </div>
    <div style="width: 32%;text-align: center;">
      <h3>组长</h3>
      <el-divider>组长</el-divider>
      <el-table
          :data="user_data_group_leader_list"
          tooltip-effect="dark"
          style="width: 100%">
        <el-table-column
            type="selection">
        </el-table-column>
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            label="姓名" align="center">
          <template v-slot="{ row }">
            <el-button type="text">{{row.user_name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
            prop="department"
            label="部门" align="center">
        </el-table-column>
      </el-table>
    </div>
    <div style="width: 32%;text-align: center">
      <h3>组员</h3>
      <el-divider>组员</el-divider>
      <el-table
          :data="user_data_member_list"
          tooltip-effect="dark"
          style="width: 100%">
        <el-table-column
            type="selection"
        >
        </el-table-column>
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            label="姓名" align="center">
          <template v-slot="{ row }">
            <el-button type="text">{{row.user_name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
            prop="department"
            label="部门" align="center">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: "RelationshipModule",
  data() {
    return {
      loading:false,
      user_data_manage_list:[],
      user_data_group_leader_list:[],
      user_data_member_list:[],
    };
  },
  created() {
    this.loading = true;
    this.getRelationshipData();
  },
  methods: {
    // 获取当前经理组长和组件的全部用户信息
    getRelationshipData(){
      this.$http
          .get("users/user_relationship/")
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              console.log(data)
              this.user_data_manage_list = data.data.user_data_manage_list;
              this.user_data_group_leader_list = data.data.user_data_group_leader_list;
              this.user_data_member_list = data.data.user_data_member_list;
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
    //
  }

};
</script>

