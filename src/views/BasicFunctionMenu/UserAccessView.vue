<template>
    <div class="users_access" v-loading="loading">
        <el-card class="box-card">
            <div class="head_search_add">
                <el-input placeholder="请输入角色名称" v-model="search" clearable class="input_search">
                </el-input>
                <el-button type="primary" icon="el-icon-search" plain @click="searchDate">搜索
                </el-button>
                <el-button type="warning" icon="el-icon-refresh-right" plain @click="reloadDate">重置
                </el-button>
            </div>
            <div class="table_content">
                <el-table :data="roleData" style="width: 100%" max-height="580">
                    <el-table-column prop="index" label="#" align="center"></el-table-column>
                    <el-table-column label="用户名称" align="center">
                        <template v-slot="{ row }">
                            <span v-if="!row.editable">{{ row.role }}</span>
                            <el-input v-model="row.role" v-else></el-input>
                        </template>
                    </el-table-column>

                    <el-table-column label="用户访问路径" align="center">
                        <template v-slot="{ row }">
                            <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom"
                                v-if="!row.editable">
                                <div class="cell ellipsis">{{ row.description }}</div>
                            </el-tooltip>
                            <el-input type="textarea" v-model="row.description" v-else></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="用户访问的类型" align="center">
                        <template v-slot="{ row }">
                            <el-tooltip class="item" effect="dark" :content="row.description" placement="bottom"
                                v-if="!row.editable">
                                <div class="cell ellipsis">{{ row.description }}</div>
                            </el-tooltip>
                            <el-input type="textarea" v-model="row.description" v-else></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="访问时间日期" align="center">
                        <template v-slot="{ row }">
                            <el-tooltip class="item" effect="dark" :content="row.create_date" placement="bottom">
                                <div class="cell ellipsis">{{ row.create_date }}</div>
                            </el-tooltip>
                        </template>
                    </el-table-column>

                </el-table>
            </div>
            <div class="pagination">
                <el-pagination hide-on-single-page @current-change="currentPage" @prev-click="prevPage"
                    @next-click="nextPage" background layout="total,prev, pager, next" :page-size="10"
                    :total="data_total" v-model:current-page="page">
                </el-pagination>
            </div>
        </el-card>
    </div>
</template>

<script>
// 角色对应权限菜单的的展示弹窗
export default {
    name: "UsersAccessView",
    data() {
        return {
            search: "",
            loading: false, // 数据加载样式
            roleData: [],
            // 分页
            data_total: 0, // 数据总数
            page_status: 0, // 分页状态变量，当上下一页时进行改变，只有是0时点击数字页码会改变
            page: 1,
        };
    },
    created() {
        this.loading = true;
        this.getroleDate();
        this.loading = false;
    },
    methods: {




       
      

        // 获取数据
        getroleDate() {
            let get_url;
            if (this.search) {
                get_url = `users/roles/?page=${this.page}&search=${this.search}`;
            } else {
                get_url = `users/roles/?page=${this.page}`;
            }
            this.$http
                .get(get_url)
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.roleData = data.data.data;
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
            this.getroleDate();
            this.loading = false;
        },
        prevPage(page) {
            this.loading = true;
            this.page_status = page;
            this.page = page;
            // 上一页按钮
            this.getroleDate();
            this.loading = false;
        },
        currentPage(page) {
            this.loading = true;
            this.page = page;
            // 点击按钮触发
            if (this.page_status === 0) {
                this.getroleDate();
            }
            this.loading = false;
        },
        // 搜索功能
        searchDate() {
            this.loading = true;
            if (this.search) {
                this.page = 1;
                this.getroleDate();
            } else {
                this.getroleDate();
            }
            this.loading = false;
        },
        // 重置
        reloadDate() {
            this.search = "";
            this.getroleDate();
        },

    },
}
</script>

<style>
@import url("@/static/currency.css");
@media screen and (max-width: 700px) {
    .users_access .el-tag {
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