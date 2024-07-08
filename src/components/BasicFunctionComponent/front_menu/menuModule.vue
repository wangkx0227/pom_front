<template>
    <div class="menu">
        <div class="head_search_add">
            <el-popover placement="top" width="160" v-model="loadVisibleMenuRouter">
                <p>你确定重新加载当前菜单信息吗？</p>
                <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="loadVisibleMenuRouter = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="addMenuRouter">确定</el-button>
                </div>
                <el-button slot="reference">重新加载菜单</el-button>
            </el-popover>
            <el-input placeholder="请输入搜索菜单名称" v-model="search" clearable class="input_search">
            </el-input>
            <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
            </el-button>
            <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
            </el-button>
        </div>
        <div class="table_content">
            <el-table :data="MenueData" style="width: 100%" max-height="580">
                <el-table-column prop="index" label="#" align="center"></el-table-column>
                <el-table-column prop="menu_url" label="路径" align="center"></el-table-column>
                <el-table-column prop="menu_url_alias" label="路径别名" align="center"></el-table-column>
                <el-table-column prop="menu_url_name" label="路径名称" align="center"></el-table-column>
                <el-table-column prop="menu_url_icon" label="路径图标" align="center"></el-table-column>
                <el-table-column prop="access_control" label="是否需要权限控制" align="center"></el-table-column>
                <el-table-column prop="menu_id" label="父菜单" align="center"></el-table-column>
                <el-table-column label="描述信息" align="center">
                    <template v-slot="{ row }">
                        <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom"
                            v-if="!row.editable">
                            <div class="cell ellipsis">{{ row.description }}</div>
                        </el-tooltip>
                        <el-input type="textarea" v-model="row.description" v-else></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="加载日期" align="center">
                    <template v-slot="{ row }">
                        <el-tooltip class="item" effect="dark" :content="row.create_date" placement="bottom"
                            v-if="!row.editable">
                            <div class="cell ellipsis">{{ row.create_date }}</div>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="菜单类型" align="center">
                    <template v-slot="{ row }">
                        <span v-if="!row.editable">{{ row.menu_type_id }}</span>
                        <el-input v-model="row.menu_type_id" v-else></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template v-slot="scope">
                        <el-button v-if="!scope.row.editable" @click="editRow(scope.row)" size="mini" type="text">编辑
                        </el-button>
                        <el-button v-else @click="saveRow(scope.row)" size="mini" type="text">保存
                        </el-button>
                        |
                        <el-popover v-if="!scope.row.editable" placement="top" width="160" v-model="scope.row.visible"
                            trigger="manual">
                            <p>删除后无恢复，请问确定删除吗？</p>
                            <div style="text-align: right; margin: 0">
                                <el-button size="mini" type="text" @click="scope.row.visible = false">取消
                                </el-button>
                                <el-button type="primary" size="mini"
                                    @click="deleteRow(scope.$index, MenueData, scope.row)">确定
                                </el-button>
                            </div>
                            <template v-slot:reference>
                                <el-button size="mini" type="text" @click="deleteDisplay(scope.row)">删除
                                </el-button>
                            </template>
                        </el-popover>
                        <el-button style="margin-left: 0" v-else @click="scope.row.editable = false" size="mini"
                            type="text">取消
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pagination">
            <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage"
                @next-click="nextPage" background layout="total,prev, pager, next" :page-size="10" :total="data_total"
                v-model:current-page="page">
            </el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    name: "menuModule",
    data() {
        return {
            search: "",
            loading: false, // 数据加载样式
            MenueData: [],
            // 分页
            data_total: 0, // 数据总数
            page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
            page: 1,
            // 加载按钮使用变量
            loadVisibleMenuRouter:false,
        };
    },
    created() {
        this.loading = true;
        this.getMenueDate();
        this.loading = false;
    },
    methods: {
        // 将Vue项目中的路由保存到后端进行存储
        addMenuRouter(){
            this.loadVisibleMenuRouter = false;

        },
        //删除按钮显示小弹框
        deleteDisplay(row) {
            row.visible = true;
        },
        // 删除按钮确认删除
        deleteRow(index, rows, row) {
            let pk = row.id;
            this.loading = true;
            this.$http
                .delete("users/menu_routes/", {
                    data: { pk: pk },
                })
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.$message.success(data.message);
                        this.getMenueDate();
                        rows.splice(index, 1);
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
        // 编辑按钮，修改row.editable值 让这条可以进行修改
        editRow(row) {
            row.editable = true;
        },
        // 修改保存按钮
        saveRow(row) {
            // 保存的数据 row
            this.loading = true;
            this.$http
                .put("users/menu_routes/", {
                    data: row,
                })
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        row.editable = false;
                        this.$message.success(data.message);
                        this.getMenueDate();
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
        // 获取数据
        getMenueDate() {
            let get_url;
            if (this.search) {
                get_url = `users/menu_routes/?page=${this.page}&search=${this.search}`;
            } else {
                get_url = `users/menu_routes/?page=${this.page}`;
            }
            this.$http
                .get(get_url)
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.MenueData = data.data.data;
                        this.data_total = data.data.data_total;
                    } else {
                        this.firmData = [];
                    }
                })
                .catch((error) => {
                    this.$message.error(error.message);
                })
                .finally(() => {
                    this.page_status = 0;
                });
        },
        // 页码功能
        nextPage(page) {
            this.loading = true;
            this.page_status = page;
            this.page = page;
            // 下一页按钮
            this.getMenueDate();
            this.loading = false;
        },
        prevPage(page) {
            this.loading = true;
            this.page_status = page;
            this.page = page;
            // 上一页按钮
            this.getMenueDate();
            this.loading = false;
        },
        currentPage(page) {
            this.loading = true;
            this.page = page;
            // 点击按钮触发
            if (this.page_status === 0) {
                this.getMenueDate();
            }
            this.loading = false;
        },
        // 搜索功能
        searchDate() {
            this.loading = true;
            if (this.search) {
                this.page = 1;
                this.getMenueDate();
            } else {
                this.getMenueDate();
            }
            this.loading = false;
        },
        // 重置
        reloadDate() {
            this.search = "";
            this.getMenueDate();
        },
    },
}
</script>

<style>
@media screen and (max-width: 700px) {
    .menu .el-tag {
        font-size: 9px;
        padding: 1px 4px;
        height: 16px;
        line-height: 13px;
        border-radius: 1px;
        margin: 2px 0 2px 2px;
    }

    .el-select-dropdown__wrap ul {
        flex-direction: column !important;
    }

    .el-select-dropdown__wrap .el-select-dropdown__item {
        height: 20px !important;
        line-height: 20px !important;
        font-size: 9px !important;
        margin: 0 auto !important;
        padding: 0 13px !important;
        width: 90%;
    }

    .el-select-dropdown__wrap .el-select-dropdown__item span {
        font-size: 9px !important;
    }

    .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
        right: 11px !important;
        font-size: 9px !important;
    }

    .el-select-dropdown__empty {
        font-size: 7px !important;
    }

    .el-select-dropdown__wrap ul {
        flex-direction: column !important;
    }

    .el-form-item__content .el-select .el-select__tags .el-select__input {
        font-size: 9px;
        margin-left: 5px;
    }
}
</style>
