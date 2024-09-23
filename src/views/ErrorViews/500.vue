<template>
    <div class="404">
        <el-result title="500" subTitle="服务器端出错，请联系管理人员！">
            <template slot="extra">
                <el-button type="primary" size="medium" plain @click="returnIndex">返回</el-button>
            </template>
        </el-result>
    </div>
</template>
<script>
export default {

    methods: {
        returnIndex() {
            this.$router.push('/index');
        },
    },

}

</script>