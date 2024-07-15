<template>
    <el-dialog title="当前角色权限菜单展示" :visible.sync="P_dialogShow" width="30%" :before-close="P_dialogClose">

        <el-tree :data="p_tree_data" show-checkbox node-key="id" accordion :default-checked-keys="default_node"
            :props="KeyDefaultProps" @check-change="handleCheckChange" ref="treeRef">
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
            menu_id_list: [], // 存放菜单的id
            api_id_list: [], // 存放 api接口的id
            method_id_list: [], // 存放 api接口可以被使用方法的id
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
        // 节点进行触发存储
        handleCheckChange(data, checkedData) {
            const tree = this.$refs.treeRef;
            // 使用 getCheckedKeys 方法获取当前所有选中节点的key值
            const checkedKeys = tree.getCheckedKeys();

            // 使用 getCheckedNodes 方法获取当前所有选中的节点
            const checkedNodes = tree.getCheckedNodes();
            // 收集所有选中节点的父节点ID
            let parentIDs = new Set();
            for (let node of checkedNodes) {
                let currentNode = node;
                while (currentNode.parent) {
                    parentIDs.add(currentNode.parent.id);
                    currentNode = currentNode.parent;
                }
            }
            let parentIDArray = Array.from(parentIDs);
            console.log('Selected parent node IDs:', parentIDArray);
            console.log('Checked keys:', checkedKeys);
        }
    },


}
</script>
<style></style>