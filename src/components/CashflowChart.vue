<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, MarkAreaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, MarkAreaComponent, LineChart, CanvasRenderer]);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      categories: [],
      series: [] // 支持多条线
    })
  }
});

const chartContainer = ref(null);
let myChart = null;

const renderChart = () => {
  // 确保我们至少有一个 series 数据
  if (!props.chartData.series || props.chartData.series.length === 0) {
    return;
  }

  // 获取第一个 series，因为这个图表只关心现金流这一条线
  const cashflowSeries = props.chartData.series[0];

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.chartData.categories,
      axisLabel: { color: '#ccc' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#ccc' },
      splitLine: { // 弱化 y 轴的分割线
        lineStyle: {
          color: '#333'
        }
      }
    },
    series: [
      {
        name: cashflowSeries.name,
        type: 'line',
        data: cashflowSeries.data,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#c23531' },
        // --- 硬编码的“心电图”样式 ---
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(194, 53, 49, 0.7)' },
            { offset: 1, color: 'rgba(194, 53, 49, 0)' }
          ])
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 0 }],
          lineStyle: { type: 'dashed', color: '#ffcc00' },
          label: {
            formatter: '警戒线',
            color: '#ffcc00'
          }
        }
        // --- 样式结束 ---
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicOut'
  };
  myChart = echarts.init(chartContainer.value);
  myChart.setOption(option);
};

onMounted(() => {
  renderChart();
  window.addEventListener('resize', () => myChart?.resize());
});

onUnmounted(() => {
  myChart?.dispose();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>