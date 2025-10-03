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
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: props.chartData.series.map(s => s.name),
      textStyle: {
        color: '#ccc'
      },
      top: '5%', // 距离顶部 5%
      right: '4%', // 距离右侧 4%
      orient: 'vertical', // 垂直排列
      align: 'left' // 文字左对齐
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
      axisLabel: { color: '#ccc' }
    },
    series: props.chartData.series.map(s => ({
      ...s,
      type: 'line',
      smooth: true, // 平滑曲线
      showSymbol: false,
      // 关键：实现标记区域，即“剪刀差”
      markArea: s.markArea ? { 
        itemStyle: { color: 'rgba(255, 173, 177, 0.4)' },
        data: s.markArea,
      } : null
    })),
    // 关键：实现从左到右绘制的动画
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