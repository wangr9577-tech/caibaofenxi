<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// ECharts 按需引入，减小打包体积
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);

// 定义组件接收的属性（props）
const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      categories: [],
      values: []
    })
  }
});

const chartContainer = ref(null);
let myChart = null;

// 绘制图表的函数
const renderChart = () => {
  // 1. 定义图表的配置项 (Option)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.chartData.categories, // 使用传入的数据
      axisLabel: { color: '#ccc' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#ccc' }
    },
    series: [
      {
        name: '总收入',
        type: 'bar',
        data: props.chartData.values, // 使用传入的数据
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00bcd4' },
            { offset: 1, color: '#2b5876' }
          ])
        },
        // 关键：实现柱子从下到上生长的动画
        animationDelay: function (idx) {
          return idx * 200;
        }
      }
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: function (idx) {
      return idx * 5;
    }
  };
  
  // 2. 初始化 ECharts 实例
  myChart = echarts.init(chartContainer.value);
  // 3. 设置配置项，渲染图表
  myChart.setOption(option);
};

onMounted(() => {
  renderChart();
  // 监听窗口大小变化，实现图表自适应
  window.addEventListener('resize', () => myChart?.resize());
});

onUnmounted(() => {
  // 组件销毁时，销毁图表实例，释放资源
  myChart?.dispose();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 给一个明确的高度 */
}
</style>