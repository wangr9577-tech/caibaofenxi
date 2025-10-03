<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, RadarChart, CanvasRenderer]);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      indicator: [], // 雷达图的指示器，即维度
      values: []    // 数据值
    })
  }
});

const chartContainer = ref(null);
let myChart = null;

const renderChart = () => {
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['企业表现'],
      bottom: '5%',
      textStyle: {
        color: '#ccc'
      }
    },
    radar: {
      // shape: 'circle',
      indicator: props.chartData.indicator,
      axisName: {
        color: '#fff',
        fontSize: 14,
        padding: [3, 5]
      },
      splitArea: { // 分割区域的样式
        areaStyle: {
          color: ['rgba(0, 188, 212, 0.1)', 'rgba(0, 188, 212, 0.2)'],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        }
      },
      axisLine: { // 坐标轴线
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: { // 分割线
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: '企业表现',
        type: 'radar',
        data: [
          {
            value: props.chartData.values,
            name: '企业表现',
            areaStyle: { // 雷达图区域的填充样式
              color: 'rgba(0, 188, 212, 0.6)'
            },
            lineStyle: { // 雷达图的边线样式
              color: '#00bcd4',
              width: 2
            }
          }
        ],
        // 关键：实现雷达图的动态展开动画
        animationDuration: 1500,
        animationEasing: 'quinticInOut'
      }
    ]
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