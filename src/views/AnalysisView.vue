<template>
  <!-- 全局加载状态 -->
  <div v-if="isLoading" class="fullscreen-loader">
    <div class="loading-spinner"></div>
    <p>正在生成AI分析报告，请稍候...</p>
  </div>

  <!-- 错误状态 -->
  <div v-else-if="errorMessage" class="fullscreen-error">
    <h2>分析失败</h2>
    <p>{{ errorMessage }}</p>
    <button @click="$router.push('/')">返回上传</button>
  </div>
  
  <!-- 成功状态：只有在数据加载成功后才渲染主内容 -->
  <main v-if="analysisData" class="analysis-container" ref="mainContainer">

    <!-- 场景一：开场白 - 海报与预告 -->
    <section class="scene">
      <div class="narration-pane animate">
        <!-- 绑定标题和摘要 -->
        <h1>{{ analysisData.openingScene.title }}</h1>
        <p class="summary">“{{ analysisData.openingScene.summary }}”</p>
      </div>
      <div class="visual-pane animate">
        <!-- 绑定雷达图数据 -->
        <RadarChart :chart-data="analysisData.openingScene.radarData" />
      </div>
    </section>

      <!-- 场景二：第一章 - 收入的史诗 -->
    <section class="scene">
      <div class="narration-pane animate">
        <h2>第一章：收入的史诗</h2>
        <!-- 绑定旁白 -->
        <p>{{ analysisData.revenueScene.narration }}</p>
      </div>
      <div class="visual-pane animate">
        <!-- 绑定柱状图数据 -->
        <BarChart :chart-data="analysisData.revenueScene.chartData" />
      </div>
    </section>

    <!-- 场景三：第二章 - 成本的博弈 -->
    <section class="scene reverse-layout">
      <div class="visual-pane animate">
        <!-- 绑定饼图数据 -->
        <PieChart :chart-data="analysisData.costScene.chartData" />
      </div>
      <div class="narration-pane animate">
        <h2>第二章：成本的博弈</h2>
        <!-- 绑定旁白 -->
        <p>{{ analysisData.costScene.narration }}</p>
      </div>
    </section>

    <!-- 场景四：关键转折 - 利润的真相 -->
    <section class="scene">
      <div class="narration-pane animate">
        <h2>关键转折：利润的真相</h2>
        <!-- 绑定旁白 -->
        <p>{{ analysisData.profitScene.narration }}</p>
      </div>
      <div class="visual-pane animate">
        <!-- 绑定折线图数据 -->
        <LineChart :chart-data="analysisData.profitScene.chartData" />
      </div>
    </section>

    <!-- 场景五：高潮与危机 - 现金流风暴 -->
    <section class="scene">
      <div class="narration-pane animate">
        <h2>高潮与危机：现金流风暴</h2>
        <!-- 绑定旁白 -->
        <p>{{ analysisData.cashflowScene.narration }}</p>
      </div>
      <div class="visual-pane animate">
        <!-- 绑定现金流图数据 -->
        <CashflowChart :chart-data="analysisData.cashflowScene.chartData" />
      </div>
    </section>

    <!-- 场景六：互动式问答 - 导演剪辑版 -->
    <section class="scene chat-scene">
      <div class="chat-wrapper animate">
        <!-- 传递 sessionId -->
        <ChatInterface :session-id="analysisData.session_id" />
      </div>
    </section>

    <!-- 场景七：剧终 - 片尾字幕 -->
    <section class="scene">
      <div class="narration-pane animate">
        <h2>剧终：总结与展望</h2>
        <!-- 绑定旁白 -->
        <p>{{ analysisData.keyMetricsScene.narration }}</p>

        <!-- --- 添加这个调试块 --- -->
        <!-- <pre style="background: #333; color: white; padding: 10px; font-size: 12px; max-height: 200px; overflow: auto;">
          {{ analysisData.keyMetricsScene }}
        </pre> -->
        <!-- --- 调试块结束 --- -->

      </div>
      <div class="visual-pane animate">
        <!-- 绑定关键指标数据 -->
        <KeyMetrics :metrics-data="analysisData.keyMetricsScene.metricsData" />
      </div>
    </section>

  </main>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 1. 导入我们封装好的 queryAnalysisApi 函数
import { queryAnalysisApi } from '@/services/api';

// 导入所有需要的图表和组件
import RadarChart from '@/components/RadarChart.vue';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';
import LineChart from '@/components/LineChart.vue';
import CashflowChart from '@/components/CashflowChart.vue';
import KeyMetrics from '@/components/KeyMetrics.vue';
import ChatInterface from '@/components/ChatInterface.vue';

const router = useRouter();

// 2. 创建响应式变量来存储状态和数据
const isLoading = ref(true); // 页面初始加载状态
const errorMessage = ref(''); // 存储错误信息
const analysisData = ref(null); // 存储从后端获取的完整分析数据

// 我们自己的动画逻辑 (Intersection Observer)
let observer = null;
const mainContainer = ref(null);

const initAnimationObserver = () => {
  // 确保在DOM更新后再执行，避免找不到 .scene
  requestAnimationFrame(() => {
    const options = {
      root: mainContainer.value,
      threshold: 0.5,
    };
    
    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animatedElements = entry.target.querySelectorAll('.animate');
          animatedElements.forEach(el => el.classList.add('is-visible'));
          observer.unobserve(entry.target);
        }
      });
    };

    observer = new IntersectionObserver(callback, options);
    document.querySelectorAll('.scene').forEach(scene => observer.observe(scene));
  });
};

// 3. 在 onMounted钩子中执行核心逻辑
onMounted(async () => {
  // a. 从 sessionStorage 中获取会话ID
  const sessionId = sessionStorage.getItem('reportSessionId');

  if (!sessionId) {
    errorMessage.value = '未找到有效的分析会话，请重新上传文件。';
    isLoading.value = false;
    // 可以在几秒后自动跳转回上传页
    setTimeout(() => router.push('/'), 3000);
    return;
  }

  try {
    console.log(`找到 Session ID: ${sessionId}，开始请求初始分析...`);
    
    // b. 调用API，请求 "initial_analysis" 任务
    const response = await queryAnalysisApi(sessionId, 'initial_analysis');
    
    // c. 将返回的 data 部分存入我们的响应式变量
    analysisData.value = response.data.data;
    analysisData.value.session_id = response.data.session_id; 
    console.log('成功获取并存储分析数据:', analysisData.value);

    // d. 数据加载成功后，初始化我们的滚动动画
    initAnimationObserver();

  } catch (error) {
    console.error('请求分析数据失败:', error);
    errorMessage.value = error.response?.data?.detail || '获取分析报告失败，请稍后重试。';
  } finally {
    // e. 无论成功失败，都结束加载状态
    isLoading.value = false;
  }
});
</script>

<style scoped>
.analysis-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;

  /* --- 更新背景图片代码 --- */
  /* 
   * 蒙版颜色微调：使用更中性的深灰色，透明度可以稍高，让图片质感透出更多
   * 图片 URL 更新为新的 finance-background.jpg
   */
  background-image: 
    linear-gradient(rgba(18, 18, 18, 0.75), rgba(18, 18, 18, 0.75)), 
    url('@/assets/finance-background.jpg');
  
  background-size: cover;
  background-position: center center;
  background-attachment: fixed; 
}

.scene {
  /* 尺寸与定位 */
  height: 100vh;
  width: 100%;
  
  /* 滚动捕捉 */
  scroll-snap-align: start;
  
  /* 内部布局 (Flexbox) */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem; /* 定义 flex 项目之间的间距 */

  /* 样式 */
  padding: 5vw;
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  box-sizing: border-box; /* 关键补充：确保 padding 不会撑大 100vh 的高度 */
}

.narration-pane, .visual-pane {
  flex: 1; /* 两边各占一半空间 */
  padding: 2rem;
}

.narration-pane {
  text-align: left;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #00bcd4;
}

h2 {
  font-size: 2.2rem;
  font-weight: 400;
  border-bottom: 2px solid #00bcd4;
  padding-bottom: 0.5rem;
  display: inline-block;
}

p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #ccc;
}

.summary {
  font-size: 1.5rem;
  font-style: italic;
  color: #a0a0a0;
}

.chart-placeholder {
  width: 100%;
  height: 300px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #666;
  border: 2px dashed #444;
}

/* 反向布局 */
.scene.reverse-layout {
    flex-direction: row-reverse;
}

/* 互动按钮样式 */
.interaction-pane {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.interaction-btn {
  background: transparent;
  border: 2px solid #00bcd4;
  color: #00bcd4;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-family: 'Noto Sans SC', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.interaction-btn:hover {
  background-color: #00bcd4;
  color: #121212;
  transform: translateX(10px);
}

/*
 * 自定义动画的准备状态
 * 默认情况下，所有带 .animate 的元素都是透明且有轻微位移的
*/
.animate {
  opacity: 0;
  transform: translateY(30px); /* 可以是任何你喜欢的初始状态 */
  transition: all 0.8s ease-out; /* 定义动画过程 */
}

/*
 * 动画的触发状态
 * 当元素获得 .is-visible 类时，它会恢复正常状态，从而产生动画
*/
.animate.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.chat-scene {
  /* 覆盖 .scene 的默认 flex 布局 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-wrapper {
  width: 80%;
  max-width: 900px;
  height: 80vh; /* 占据80%的视口高度 */
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.fullscreen-loader,
.fullscreen-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #ccc;
  font-family: 'Noto Sans SC', sans-serif;
}

.fullscreen-loader p {
  margin-top: 20px;
  font-size: 1.2rem;
}

.fullscreen-error h2 {
  color: #ef5350;
  font-size: 2rem;
}
.fullscreen-error p {
  color: #aaa;
  margin: 1rem 0 2rem;
}
.fullscreen-error button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 25px;
  font-size: 1rem;
  cursor: pointer;
}

/* 复用 UploadView 的加载动画 */
.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #00bcd4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>