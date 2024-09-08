<template>
  <div class="relationship" v-loading="loading" style="display: flex;flex-wrap: nowrap;justify-content: space-between;">
    <div style="width: 32%;text-align: center">
      <h3>经理</h3>
      <el-divider>经理</el-divider>
      <el-table
          :data="tableData"
          style="width: 100%" height="600">
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            prop="name"
            label="姓名" align="center">
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
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
            >
        </el-table-column>
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            prop="name"
            label="姓名" align="center">
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
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
        >
        </el-table-column>
        <el-table-column
            prop="index"
            label="#" align="center">
        </el-table-column>
        <el-table-column
            prop="name"
            label="姓名" align="center">
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
      tableData: [{
        index: '1',
        name: '王小虎1',
        department: '财务部门'
      }, {
        index: '2',
        name: '王小虎2',
        department: 'FMR'
      }]
    };
  },
  created() {

  },
  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }

};
</script>

