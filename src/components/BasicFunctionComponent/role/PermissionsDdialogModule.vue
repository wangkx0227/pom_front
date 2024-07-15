<template>
    <el-dialog title="当前角色权限菜单展示" :visible.sync="P_dialogShow" width="30%" :before-close="P_dialogClose">

        <el-tree :data="p_tree_data" show-checkbox node-key="id" accordion :default-checked-keys="default_node"
            :props="KeyDefaultProps">
        </el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="loadPermission" :loading="P_loading" icon="el-icon-refresh-right"
                type="success">权限加载</el-button>
            <el-button @click="P_dialogShow = false">取 消</el-button>
            <el-button type="primary" @click="P_dialogShow = false">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: "PermissionsDdialogModule",
    data() {
        return {
            P_loading: false,
            role_pk: "", // 角色的id
            P_dialogShow: false, // 控制弹窗的展开或者关闭
            default_node: [5], // 设置默认选中的树形属性
            p_tree_data: [], // 设置属性属性的值
            KeyDefaultProps: { // 属性节点展开后对应数据的key值
                children: 'children',
                label: 'label'
            },
        }

    },
    created() {
        this.loadPermission();
    },
    methods: {
        // 获取节点信息，当前设置的菜单权限列表
        getMenuPermission() {
            this.P_loading = true;
            this.$http
                .get('users/role_menu_permission/')
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.p_tree_data = data.data.menu_permission_list;
                        this.default_node = [6];
                    }
                })
                .catch((error) => {
                    this.$message.error(error.message);
                })
                .finally(() => {
                    this.P_loading = false;
                });
        },
        // 打开当前窗口
        openDialog(role_pk) {
            this.role_pk = role_pk
            this.P_dialogShow = true;
        },
        // 关闭当前窗口
        P_dialogClose(done) {
            done();
        },
        // 重现加载权限
        loadPermission() {
            this.getMenuPermission();
        },
    
    },
}
</script>
<style>
.option-wrapper { padding: 0 !important; } 
</style>