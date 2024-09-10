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
            <el-button type="text" @click="getPositionRelationshipData(row,'leader')">{{ row.user_name }}</el-button>
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
          ref="multipleTableLeader"
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
            <el-button type="text" @click="getPositionRelationshipData(row,'member')">{{ row.user_name }}</el-button>
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
          ref="multipleTableMember"
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
            <el-button type="text">{{ row.user_name }}</el-button>
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
      loading: false,
      user_data_manage_list: [],
      user_data_group_leader_list: [],
      user_data_member_list: [],
    };
  },
  created() {
    this.loading = true;
    this.getRelationshipData();
  },
  methods: {
    // 获取当前经理组长和组件的全部用户信息
    getRelationshipData() {
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
    // 默认选中函数 - 经理-组长 组长-组员
    RelationshipSelection(rows, type) {
      // rows，默认选中的用户的列表
      if (rows.length > 0) {
        if (type === 'leader') {
          rows.forEach(row => {
            // 设置关系
            this.$refs.multipleTableLeader.toggleRowSelection(row);
          });
        } else {
          rows.forEach(row => {
            this.$refs.multipleTableMember.toggleRowSelection(row);
          });
        }
      } else {
        // 清除关系
        if (type === 'leader') {
          this.$refs.multipleTableLeader.clearSelection();
        } else {
          this.$refs.multipleTableMember.clearSelection();
        }
      }
    },
    // 获取经理职务，管理的组长信息
    getPositionRelationshipData(row, type) {
      this.loading = true;
      this.$http
          .post("users/user_relationship/", {
            data: row,
            relationship_type: type,
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              const relationship_user_list = data.data;
              let relationship_list = []; // 存储的绑定关系信息
              if (type === 'leader') {
                // 经理下的组长关系
                for (let i = 0; this.user_data_group_leader_list.length > i; i++) {
                  // 判断关系
                  if (relationship_user_list.includes(this.user_data_group_leader_list[i].user_id)) {
                    relationship_list.push(this.user_data_group_leader_list[i])
                  }
                }

              } else {
                // 查询组长下的组员关系
                for (let i = 0; this.user_data_member_list.length > i; i++) {
                  // 判断关系
                  if (relationship_user_list.includes(this.user_data_member_list[i].user_id)) {
                    relationship_list.push(this.user_data_member_list[i])
                  }
                }
              }
              this.RelationshipSelection(relationship_list, type);
              console.log(relationship_list)
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
  }

};
</script>

