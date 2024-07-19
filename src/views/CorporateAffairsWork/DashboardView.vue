<template>
  <div class="dashboard_info" v-loading="loading">
    <div style="display: flex; width: 100%; flex-wrap: wrap">
      <el-card shadow="hover" style="width: 31%; margin-right: 5px">
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="work_total" title="累计完成"></el-statistic>
        </div>
      </el-card>
      <el-card shadow="hover" style="width: 31%; margin-right: 5px;">
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="expire_work" title="已过期"></el-statistic>
        </div>
      </el-card>
      <el-card shadow="hover" style="width: 31%; margin-right: 5px">
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="completed_work" title="已完成"></el-statistic>
        </div>
      </el-card>
      <el-card
        shadow="hover"
        style="width: 31%; margin-right: 5px; margin-top: 5px"
      >
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="completed_work" title="待完成"></el-statistic>
        </div>
      </el-card>
      <el-card
        shadow="hover"
        style="width: 31%; margin-right: 5px; margin-top: 5px"
      >
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="completed_work" title="延期待审">
          </el-statistic>
        </div>
      </el-card>
      <el-card shadow="hover" style="width: 31%; margin-top: 5px">
        <div style="width: 100%; display: inline-block">
          <el-statistic :value="completed_work" title="监督待审">
          </el-statistic>
        </div>
      </el-card>
      <el-card
        class="box-card pie-chart-card"
        shadow="hover"
        style="width: 35%; margin-right: 5px; margin-top: 5px"
      >
        <div style="width: 100%; display: inline-block">
          <div
            ref="pieChart"
            class="pieChart"
            style="width: 500px; height: 500px"
          ></div>
        </div>
      </el-card>
      <el-card
        class="box-card columnar-card"
        shadow="hover"
        style="width: 58.4%; margin-top: 5px"
      >
        <div style="width: 100%; display: inline-block">
          <div
            ref="columnar"
            class="columnar"
            style="width: 800px; height: 500px"
          ></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { init } from "echarts";

export default {
  name: "DashboardView",
  data() {
    return {
      loading: false, // 访问加载
      work_total: 100, // 当前用户的完成事项总数
      expire_work: 100, // 当前用户事项过期事项总数
      completed_work: 100, // 已完成事项总数
      recent_work: 100, // 近期需要完成
      pieChartData: [
        // 饼状图数据
        { name: "事项总数", value: 30 },
        { name: "已过期", value: 40 },
        { name: "已完成", value: 20 },
        { name: "待完成", value: 10 },
        { name: "延期待审核", value: 10 },
        { name: "监督待审核", value: 10 },
      ], // 饼状图需要展示的数据
      xAxisDate: [
        "事项总数",
        "已完成",
        "待完成",
        "已过期",
        "延期待审核",
        "监督待审核",
      ], // 柱状图标题
      columnarDate: [100, 100, 100, 100, 20, 10], // 柱状图展示数据
    };
  },
  methods: {
    initPieChart() {
      let pie_Chart = init(this.$refs.pieChart);
      pie_Chart.setOption({
        title: {
          text: "饼状图展示",
          left: "center",
        },
        series: [
          {
            name: "事项展示",
            type: "pie",
            radius: "50%",
            data: this.pieChartData,
          },
        ],
      });
    },
    initColumnar() {
      let pie_Columnar = init(this.$refs.columnar);
      pie_Columnar.setOption({
        title: {
          text: "柱形图展示",
          left: "center",
        },
        axisLabel: {
          show: true, // 是否显示刻度标签，默认显示
          interval: 1, // 坐标轴刻度标签的显示间隔，在类目轴中有效；默认会采用标签不重叠的策略间隔显示标签；可以设置成0强制显示所有标签；如果设置为1，表示『隔一个标签显示一个标签』，如果值为2，表示隔两个标签显示一个标签，以此类推。
          rotate: 90, // 刻度标签旋转的角度，在类目轴的类目标签显示不下的时候可以通过旋转防止标签之间重叠；旋转的角度从-90度到90度
          inside: false, // 刻度标签是否朝内，默认朝外
          margin: 6, // 刻度标签与轴线之间的距离
        },
        xAxis: {
          data: this.xAxisDate,
        },
        yAxis: {},
        series: [
          {
            type: "bar",
            name: "事项展示",
            data: this.columnarDate,
          },
        ],
      });
    },
    getUserDate() {
      this.loading = false;
      console.log("加载数据");
    },
  },
  mounted() {
    this.initPieChart();
    this.initColumnar();
  },
  created() {
    // 每次切换到当前页面时，需要调用。
    this.loading = true;
    // 数据第一次加载
    setTimeout(() => {
      this.getUserDate();
    }, 1500);
  },
};
</script>

<style scoped>
@media screen and (max-width: 700px) {
  .pie-chart-card {
    width: 94.5% !important;
  }

  .columnar-card {
    width: 94.5% !important;
    margin-bottom: 60px;
  }

  .pieChart {
    width: 100% !important;
    height: 300px !important;
  }

  .columnar {
    width: 100% !important;
    height: 300px !important;
  }

  .dashboard_info {
    max-height: 83vh;
    overflow-y: scroll;
  }
}
</style>
