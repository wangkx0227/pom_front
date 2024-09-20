<template>
  <div class="dashboard_info" v-loading="loading">
    <el-card class="box-card">
      <div class="container">
        <div class=" work_container">
          <div class="work_block">
            <el-result title="订单事务" :subTitle="`${dashboard_number_data.order_matter_num}`">
              <template slot="icon">
                <i class="el-icon-folder"></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="非订单事务" :subTitle="`${dashboard_number_data.no_order_matter_num}`">
              <template slot="icon">
                <i class="el-icon-folder-opened"></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="特殊事务" :subTitle="`${dashboard_number_data.special_matter_num}`">
              <template slot="icon">
                <i class="el-icon-document-copy"></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="监督事务" :subTitle="`${dashboard_number_data.supervise_matter_num}`">
              <template slot="icon">
                <i class="el-icon-tickets"></i>
              </template>
            </el-result>
          </div>
        </div>
        <div class=" work_block">
          <el-tabs v-model="activeName">
            <el-tab-pane label="综合" name="comprehensive">
              <div style="width: 100%; display: inline-block">
                <div
                    ref="lineChart"
                    class="lineChart"
                    style="width: 780px; height: 345px"
                ></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="饼状图" name="pancake">
              <div style="width: 100%; display: inline-block">
                <div
                    ref="pieChart"
                    class="pieChart"
                    style="width: 780px; height: 345px"
                ></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="柱状图" name="column">
              <div style="width: 100%; display: inline-block">
                <div
                    ref="columnar"
                    class="columnar"
                    style="width: 780px; height: 345px"
                ></div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class=" work_block">
          <el-table
              :data="tableData"
              height="330"
              border
              @row-click="getNotice"
              style="width: 100%;margin-top: 5px">
            <el-table-column label="公告未读" align="center">
              <el-table-column
                  prop="date"
                  label="日期"
                  width="100" align="center">
              </el-table-column>
              <el-table-column
                  prop="title"
                  label="标题"
                  align="center">
              </el-table-column>
              <el-table-column
                  prop="user_name"
                  label="发送者" width="180" align="center">
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
        <div class=" work_block">
          <el-table
              :data="tableData"
              height="330"
              border
              @row-click="getNotice"
              style="width: 100%;margin-top: 5px">
            <el-table-column label="待处理" align="center">
              <el-table-column
                  prop="date"
                  label="事务类型"
                  align="center">
              </el-table-column>
              <el-table-column
                  prop="date"
                  label="应完成日期"
                  align="center">
              </el-table-column>
              <el-table-column
                  prop="title"
                  label="事务名称"
                  align="center" width="350">
              </el-table-column>
              <el-table-column
                  prop="user_name"
                  label="状态" align="center">
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {init} from "echarts";

export default {
  name: "DashboardView",
  data() {
    return {
      activeName: "comprehensive", // 卡片变量
      loading: false, // 访问加载
      dashboard_number_data: {
        order_matter_num: 0,
        no_order_matter_num: 0,
        special_matter_num: 0,
        supervise_matter_num: 0
      }, // 仪表盘第一块的数据展示信息

      pieChartData: [
        // 饼状图数据
        {name: "事项总数", value: 30},
        {name: "已过期", value: 40},
        {name: "已完成", value: 20},
        {name: "待完成", value: 10},
        {name: "延期待审核", value: 10},
        {name: "监督待审核", value: 10},
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
      linkChartData: [
        {
          name: '订单事务',
          type: 'line',
          stack: 'Total',
          data: [120, 132, 101, 134, 90, 230, 210] // 数据
        },
        {
          name: '非订单事务',
          type: 'line',
          stack: 'Total',
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: '特殊事务',
          type: 'line',
          stack: 'Total',
          data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
          name: '监督事务',
          type: 'line',
          stack: 'Total',
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '审核事务',
          type: 'line',
          stack: 'Total',
          data: [820, 932, 901, 934, 1290, 1330, 1320]
        }
      ],
      // 公告数据
      tableData: [{
        date: '2016-05-03',
        title: '上海市普陀区金沙江路 1518 弄',
        user_name: '王凯鑫'
      }]
    }
  },
  methods: {
    // 饼状图展示
    initPieChart() {
      const pie_Chart = init(this.$refs.pieChart);
      pie_Chart.setOption({
        title: {
          text: "饼状图展示",
          left: "center",
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: "事项展示",
            type: "pie",
            radius: "55%",
            data: this.pieChartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
        ],
      });
    },
    // 柱状图展示
    initColumnar() {
      const pie_Columnar = init(this.$refs.columnar);
      pie_Columnar.setOption({
        title: {
          text: "柱形图展示",
          left: "center",
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
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
    // 线性图
    initChart() {
      const line_Chart = init(this.$refs.lineChart);
      line_Chart.setOption({
        title: {
          text: '综合线性图展示'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['订单事务', '非订单事务', '特殊事务', '监督事务', '审核事务']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['19号', '20号', '21号', '22号', '23号'] // 显示日期，从当前向后推5天
        },
        yAxis: {
          type: 'value'
        },
        series: this.linkChartData,
      })
    },
    getUserDashboardDate() {
      this.$http
          .get('work/dashboard_matter_info/')
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.dashboard_number_data = data.data.dashboard_number_data;
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

      console.log("加载数据");
    },
    // 查看公告信息弹窗
    getNotice(row, column, event) {

    },
  },
  mounted() {
    this.initPieChart();
    this.initColumnar();
    this.initChart();
  },
  created() {
    this.loading = true;
    this.getUserDashboardDate();
  },
};
</script>

<style scoped>
@import url("@/static/convention.css");
/* 将内容分为4份*/
.container {
  display: grid;
  grid-template-rows: 1fr 1fr; /* 将页面分为上下两等分 */
  grid-template-columns: 1fr 1fr; /* 将页面分为左右两等分 */
  height: 84vh; /* 容器高度占满整个视口高度 */
}

/*将第一个块，分为4分进行处理*/
.work_container {
  display: grid;
  grid-template-rows: 1fr 1fr; /* 将页面分为上下两等分 */
  grid-template-columns: 1fr 1fr; /* 将页面分为左右两等分 */
  height: 45vh; /* 容器高度占满整个视口高度 */
}

/*设置边框*/
/*图形的样式*/
.work_block {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 0 10px 10px 10px;
  padding: 0 10px;
}


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
