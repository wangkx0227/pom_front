<template>
    <el-dialog title="当前角色权限菜单展示" :visible.sync="P_dialogShow" width="30%" :before-close="P_dialogClose">
        <el-tree :data="p_tree_data" show-checkbox node-key="type" accordion :default-checked-keys="default_node"
            :props="KeyDefaultProps" @check-change="handleCheckChange" ref="treeRef">
        </el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="loadPermission" :loading="P_loading" icon="el-icon-refresh-right"
                type="success">权限加载</el-button>
            <el-button @click="P_dialogShow = false">取 消</el-button>
            <el-button type="primary" @click="saveData" :loading="S_loading"  v-if="method_list.includes('POST')">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: "PermissionsDdialogModule",
    data() {
        return {
            P_loading: false,
            S_loading: false,
            role_pk: "", // 角色的id
            P_dialogShow: false, // 控制弹窗的展开或者关闭
            default_node: [], // 设置默认选中的树形属性
            p_tree_data: [], // 设置属性属性的值
            KeyDefaultProps: { // 属性节点展开后对应数据的key值
                children: 'children',
                label: 'label'
            },
            menu_id_list: [], // 存放菜单的id
            api_method_id_list: [], // 存放 api接口可以被使用方法的id，结构即可
            // 权限列表
            method_list: [],
        }

    },
    methods: {
        // 获取节点信息，当前设置的菜单权限列表
        getMenuPermission() {
            this.$http
                .get(`users/role_menu_permission/?pk=${this.role_pk}`)
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.p_tree_data = data.data.menu_permission_list;
                        this.default_node = data.data.default_node;
                        this.menu_id_list = data.data.menu_id_list;
                        this.api_method_id_list = data.data.api_method_id_list;
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
        openDialog(role_pk,menu_permission_method_list) {
            this.role_pk = role_pk
            this.P_dialogShow = true;
            this.P_loading = true;
            this.method_list = menu_permission_method_list;
            this.loadPermission();
        },
        // 关闭当前窗口
        P_dialogClose(done) {
            done();
        },
        // 重现加载权限
        loadPermission() {
            this.P_loading = true;
            this.getMenuPermission();
        },

        // 节点进行触发存储
        handleCheckChange(node_data, checkedStatus) {
            const tree = this.$refs.treeRef;
            // checkedStatus 判断当前节点是否被选中
            // node_data 当前节点的数据
            // 使用 getCheckedNodes 方法获取当前所有选中的节点
            const checkedNodes = tree.getCheckedNodes(); // 获取全部被选中的节点
            // const checkedKeys = tree.getCheckedKeys(); // 获取全部被选中节点key值
            this.menu_id_list = [];
            this.api_method_id_list = [];
            for (let i = 0; i < checkedNodes.length; i++) {
                let add_pk = checkedNodes[i].id
                let add_type = checkedNodes[i].type
                if (!add_type) {
                    add_type = ''
                }
                let menu = add_type.match(/menu.*/); // 正则匹配是不是菜单类型的节点
                let api = add_type.match(/api.*/); // 正则匹配是不是菜单类型的节点
                if (menu) {
                    this.menu_id_list.push({ type: add_type, id: add_pk })
                }
                if (api) {
                    this.api_method_id_list.push({ type: add_type, id: add_pk })
                }
            }
        },
        // 确定最后的数据
        saveData() {
            this.S_loading = true;
            this.S_loading = false;
            this.$http
                .post("users/role_menu_permission/", {
                    data: {
                        pk: this.role_pk,
                        menu_id_list: this.menu_id_list,
                        api_method_id_list: this.api_method_id_list
                    },
                })
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.$message.success(data.message);
                    } else {
                        this.$message.error(data.message);
                    }
                })
                .catch((error) => {
                    this.$message.error(error.message);
                })
                .finally(() => {
                    this.S_loading = false;
                });
        }

    },
}
</script>
<style></style>
