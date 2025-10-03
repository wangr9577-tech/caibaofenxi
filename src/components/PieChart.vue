<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => []
  }
});

const chartContainer = ref(null);
let myChart = null;

const renderChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#ccc'
      }
    },
    series: [
      {
        name: '成本构成',
        type: 'pie',
        radius: ['50%', '70%'], // 创建环形图
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#121212',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: { // 鼠标悬停时的高亮样式
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
            color: '#fff'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData, // 饼图数据格式：[{ value: 1048, name: 'Search Engine' }, ...]
        // 关键：实现从中心绽放的动画
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function () {
          return Math.random() * 200;
        }
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