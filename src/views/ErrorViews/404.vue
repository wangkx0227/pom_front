<template>
    <div class="404">
        <el-result title="404" subTitle="抱歉，资源已移动或删除！">
            <template slot="extra">
                <el-button type="primary" size="medium" plain @click="returnIndex">返回</el-button>
            </template>
        </el-result>
    </div>
</template>
<script>
export default {

    methods: {
        returnIndex(){
            this.$router.push('/index');
        },
    },

}

</script>