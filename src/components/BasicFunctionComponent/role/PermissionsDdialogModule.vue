<template>
    <el-dialog title="当前角色权限菜单展示" :visible.sync="dialogShow" width="30%" :before-close="dialogClose">
        <el-tree :data="data" show-checkbox node-key="id" :default-expanded-keys="[2, 3]" :default-checked-keys="[5]"
            :props="defaultProps">
        </el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogShow = false">取 消</el-button>
            <el-button type="primary" @click="dialogShow = false">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: "PermissionsDdialogModule",
    data() {
        return {
            dialogShow: false,
            role_pk: "",
            data: [{
                id: 1,
                label: '一级 1',
                children: [{
                    id: 4,
                    label: '二级 1-1',
                    children: [{
                        id: 9,
                        label: '三级 1-1-1'
                    }, {
                        id: 10,
                        label: '三级 1-1-2'
                    }]
                }]
            }, {
                id: 2,
                label: '一级 2',
                children: [{
                    id: 5,
                    label: '二级 2-1'
                }, {
                    id: 6,
                    label: '二级 2-2'
                }]
            }, {
                id: 3,
                label: '一级 3',
                children: [{
                    id: 7,
                    label: '二级 3-1'
                }, {
                    id: 8,
                    label: '二级 3-2'
                }]
            }],
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        }

    },
    created() {
        // console.log(this.role_pk);
    },
    methods: {
        // 打开当前窗口
        openDialog(role_pk) {
            this.role_pk = role_pk
            this.dialogShow = true;
        },
        // 关闭当前窗口
        dialogClose(done) {
            done();
        }

    },
}
</script>
