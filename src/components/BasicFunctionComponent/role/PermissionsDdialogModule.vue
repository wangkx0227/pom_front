<template>

    <el-dialog title="当前角色权限菜单展示" :visible.sync="P_dialogShow" width="30%" :before-close="P_dialogClose">
        <el-skeleton animated :throttle="500" :loading="skeletonLoading" style="width: 90% ;">
        </el-skeleton>
        <el-tree :data="p_tree_data" show-checkbox node-key="type" accordion :default-checked-keys="default_node"
            :props="KeyDefaultProps" @check-change="handleCheckChange" ref="treeRef">
        </el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="loadPermission" :loading="P_loading" icon="el-icon-refresh-right"
                type="success">权限加载</el-button>
            <el-button @click="P_dialogShow = false">取 消</el-button>
            <el-button type="primary" @click="saveData" :loading="S_loading">确 定</el-button>
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
            skeletonLoading: false,
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
                    this.skeletonLoading = false;
                });
        },
        // 打开当前窗口
        openDialog(role_pk) {
            this.role_pk = role_pk
            this.P_dialogShow = true;
            this.skeletonLoading = true;
            this.P_loading = true;
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
        // 处理节点数据函数-删除-判断节点是不是类似的节点进行删除
        handleNodeDeletion(nodes, deletedNode) {
            let type_split = deletedNode.type.split('-')
            const regex = new RegExp(`${type_split[0]}-${type_split[1]}.*`); // 匹配正则表达式
            // 找到所有匹配符合条件的节点
            const matchedNodes = nodes.filter(node =>
                node.type.match(regex)
            );
            if (matchedNodes.length === 1) {
                let indexToDelete = nodes.findIndex((item) => (
                    item.id === matchedNodes[0].id && item.type === matchedNodes[0].type
                ))
                if (indexToDelete !== -1) {
                    nodes.splice(indexToDelete, 1);
                }
            }

        },
        // 处理节点数据函数-删除
        handleNodeDataDel(node_data) {
            let del_pk = node_data.id;
            let del_type = node_data.type;
            let menu = del_type.match(/menu.*/); // 正则匹配是不是菜单类型的节点
            let api = del_type.match(/api.*/); // 正则匹配是不是菜单类型的节点
            if (menu) {
                // 获取删除到列表的节点下标索引
                let indexToDelete = this.menu_id_list.findIndex((item) => (
                    item.id === del_pk && item.type === del_type
                ))
                // 删除这个元素
                if (indexToDelete !== -1) {
                    let type_split = del_type.split('-')
                    if (type_split.length === 2) { // 1级菜单
                        const regex = new RegExp(`${del_type}.*`); // 匹配正则表达式
                        const matchedNodes = this.menu_id_list.filter(node =>
                            node.type.match(regex)
                        );
                        if (matchedNodes.length === 1) {
                            this.menu_id_list.splice(indexToDelete, 1);
                        }
                    } else {
                        this.menu_id_list.splice(indexToDelete, 1);
                    }
                }
                // 删除的时候也是需要进行判断，当前是不是最后一个节点,数据列表中又没多余节点数据，勾选了子节点，那么父节点也同时勾选，那么删除子节点，那么父节点也需要删除   
                this.handleNodeDeletion(this.menu_id_list, { type: del_type, id: del_pk })
            } else if (api) {
                // 获取删除到列表的节点下标索引
                let indexToDelete = this.api_method_id_list.findIndex((item) => (
                    item.id === del_pk && item.type === del_type
                ))
                // 删除这个元素
                if (indexToDelete !== -1) {
                    let type_split = del_type.split('-')
                    if (type_split.length === 2) { // 1级菜单
                        const regex = new RegExp(`${del_type}.*`); // 匹配正则表达式
                        const matchedNodes = this.api_method_id_list.filter(node =>
                            node.type.match(regex)
                        );
                        if (matchedNodes.length === 1) {
                            this.api_method_id_list.splice(indexToDelete, 1);
                        }
                    } else {
                        this.api_method_id_list.splice(indexToDelete, 1);
                    }
                }
                // 删除的时候也是需要进行判断，当前是不是最后一个节点,数据列表中又没多余节点数据，勾选了子节点，那么父节点也同时勾选，那么删除子节点，那么父节点也需要删除   
                this.handleNodeDeletion(this.api_method_id_list, { type: del_type, id: del_pk })
            }
        },
        // 处理函数数据-添加
        handleNodeDataAdd(checkedNodes) {
            for (let i = 0; i < checkedNodes.length; i++) {
                let add_pk = checkedNodes[i].id
                let add_type = checkedNodes[i].type
                if (!add_type) {
                    add_type = ''
                }
                let menu = add_type.match(/menu.*/); // 正则匹配是不是菜单类型的节点
                let api = add_type.match(/api.*/); // 正则匹配是不是菜单类型的节点
                // 筛选获取菜单，进行添加
                if (menu) {
                    let indexToShow = this.menu_id_list.findIndex((item) => (
                        item.id === add_pk && item.type === add_type
                    ))
                    // 防止重复添加到列表中,-1说明额米有添加
                    if (indexToShow === -1) {
                        // 拆分：如果选中的时二级菜单，那么需要将1及菜单也添加进去
                        /*
                        let type_split_add = add_type.split("-")
                        if (type_split_add.length === 3) { // 选中的就是二级菜单,就分割为3个值，将1与2值进行拼接获取1级菜单
                            // 添加一层判断，判断当前的1级菜单是否已经添加
                            let one_pk = parseInt(type_split_add[1])
                            let one_type = `${type_split_add[0]}-${type_split_add[1]}`
                            let indexToShow_one = this.menu_id_list.findIndex((item) => (
                                item.id === one_pk && item.type === one_type
                            ))
                            if (indexToShow_one === -1) {
                                this.menu_id_list.push({ type: one_type, id: one_pk })
                            }
                        }
                            */
                        this.menu_id_list.push({ type: add_type, id: add_pk })
                    }
                } else if (api) {
                    let indexToShow = this.api_method_id_list.findIndex((item) => (
                        item.id === add_pk && item.type === add_type
                    ))
                    // 防止重复添加到列表中,-1说明额米有添加
                    if (indexToShow === -1) {
                        // 拆分：如果选中的时二级菜单，那么需要将1及菜单也添加进去
                        /*
                        let type_split_add = add_type.split("-")
                        if (type_split_add.length === 3) { // 选中的就是二级菜单,就分割为3个值，将1与2值进行拼接获取1级菜单
                            // 添加一层判断，判断当前的1级菜单是否已经添加
                            let one_pk = parseInt(type_split_add[1])
                            let one_type = `${type_split_add[0]}-${type_split_add[1]}`
                            let indexToShow_one = this.api_method_id_list.findIndex((item) => (
                                item.id === one_pk && item.type === one_type
                            ))
                            if (indexToShow_one === -1) {
                                this.api_method_id_list.push({ type: one_type, id: one_pk })
                            }
                        }
                            */
                        this.api_method_id_list.push({ type: add_type, id: add_pk })
                    }
                }
            }
        },
        // 节点进行触发存储
        handleCheckChange(node_data, checkedStatus) {
            const tree = this.$refs.treeRef;
            // checkedStatus 判断当前节点是否被选中
            // node_data 当前节点的数据
            // 使用 getCheckedNodes 方法获取当前所有选中的节点
            const checkedNodes = tree.getCheckedNodes(); // 获取全部被选中的节点
            const checkedKeys = tree.getCheckedKeys(); // 获取全部被选中节点key值
            // if (!checkedStatus) { // 当属性为flase时，那么就需要将列表的选中的剔除
            //     this.handleNodeDataDel(node_data)
            // } else {
            //     // 将选中的节点添加到列表中
            //     this.handleNodeDataAdd(checkedNodes)
            // }
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
                if(api){
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