<template>
  <div class="dashboard_info" v-loading="loading">
    <el-card class="box-card">
      <div class="container">
        <div class=" work_container">
          <div class="work_block">
            <el-result title="订单事务" :subTitle="`${dashboard_number_data.order_matter_num}`">
              <template slot="icon">
                <i class="el-icon-folder icon_size" style="font-size: 25px "></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="非订单事务" :subTitle="`${dashboard_number_data.no_order_matter_num}`">
              <template slot="icon">
                <i class="el-icon-folder-opened" style="font-size: 25px "></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="特殊事务" :subTitle="`${dashboard_number_data.special_matter_num}`">
              <template slot="icon">
                <i class="el-icon-document-copy" style="font-size: 25px "></i>
              </template>
            </el-result>
          </div>
          <div class="work_block">
            <el-result title="监督事务" :subTitle="`${dashboard_number_data.supervise_matter_num}`">
              <template slot="icon">
                <i class="el-icon-tickets" style="font-size: 25px "></i>
              </template>
            </el-result>
          </div>
        </div>
        <div class=" work_block">
          <el-tabs v-model="activeName">
            <el-tab-pane label="个人待完成" name="comprehensive">
              <div style="width: 100%; display: inline-block">
                <div
                    ref="lineChart"
                    class="lineChart"
                    style="width: 780px; height: 345px"
                ></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="事务信息展示-饼状图" name="pancake">
              <div style="width: 100%; display: inline-block">
                <div
                    ref="pieChart"
                    class="pieChart"
                    style="width: 780px; height: 345px"
                ></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="事务信息展示-柱状图" name="column">
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
            <el-table-column label="公告信息" align="center">
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
              :data="matter_all_data"
              height="330"
              border
              style="width: 100%;margin-top: 5px">
            <el-table-column label="待处理（显示前10条）" align="center">
              <el-table-column
                  prop="index"
                  label="#"
                  width="40"
                  align="center">
              </el-table-column>
              <el-table-column
                  label="事务类型"
                  align="center" width="150">
                <template v-slot="{ row }">
                  <el-tag v-if="row.type === 'order_matter'" type="success">订单：跟进类型</el-tag>
                  <el-tag v-else-if="row.type === 'no_order_matter'" type="info">非订单：常规类型</el-tag>
                  <el-tag v-else-if="row.type === 'special'">非订单：特殊类型</el-tag>
                  <el-tag v-else-if="row.type === 'supervise'">订单：监督类型</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                  prop="expected_completion_time"
                  label="应完成日期"
                  align="center">
              </el-table-column>
              <el-table-column
                  prop="matter_name"
                  label="事务名称"
                  align="center" width="350">
              </el-table-column>
              <el-table-column
                  label="状态" align="center" width="100">
                <template v-slot="{ row }">
                  <el-tag v-if="row.complete_status === 1" effect="plain">完成</el-tag>
                  <el-tag v-else type="danger" effect="plain">未完成</el-tag>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div>
      </div>
    </el-card>
    <div class="notice_drawer">
      <el-drawer
          title="我嵌套了表格!"
          :before-close="CloseNotice"
          :visible.sync="NoticeDrawer"
          direction="rtl"
          size="50%">
      </el-drawer>
    </div>
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
      matter_all_data: [], // 仪表盘的待处理展示数据
      // 饼状图
      pieChartData: [
        // 饼状图数据
        {name: "事项总数", value: 0},
        {name: "订单事务", value: 0},
        {name: "非订单事务", value: 0},
        {name: "特殊事务", value: 0},
        {name: "监督事项", value: 0},
      ],
      // 柱状图标题
      columnarDate: [0, 0, 0, 0, 0, 0], // 柱状图展示数据
      // 线型图
      linkChartData: [], // 数据
      linkChartDate: [], // 时间展示
      // 公告数据
      NoticeDrawer: false, // 公告的变量
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
          text: "展示全部的事务分类（包含已完成）",
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
          text: "展示全部的事务分类（包含已完成）",
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
          data: [
            "事项总数",
            "订单事务",
            "非订单事务",
            "特殊事务",
            "监督事项",
          ],
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
          text: '待完成'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['订单事务', '非订单事务', '特殊事务', '监督事务']
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
          data: this.linkChartDate, // 显示日期，从当前向后推5天
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
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
              this.matter_all_data = data.data.matter_all_data;
              this.pieChartData = data.data.chart_data_list;
              this.columnarDate = data.data.columnar_data_list;
              // 线型图的时间展示
              this.linkChartDate = data.data.link_chart_data.link_chart_date_list;
              this.linkChartData = data.data.link_chart_data.link_chart_data_list;
              // 加载图形
              this.initPieChart();
              this.initColumnar();
              this.initChart();
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
    // 查看公告信息弹窗
    getNotice(row, column, event) {
      this.NoticeDrawer = true;
      console.log(row, column, event)
    },
    // 公告关闭调用函数
    CloseNotice(done) {
      done();
    }
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
