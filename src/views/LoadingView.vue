<template>
  <div class="loading-container">
    <div class="animation-wrapper">
      <div class="dragon-seal">
        <span>AI分析引擎</span>
      </div>
      
      <div class="credits-list">
        <!-- --- 更新以下文案 --- -->
        <p class="credit-item director">技术总监 (Director) ...... 检索增强生成 (RAG)</p>
        <p class="credit-item writer">核心编剧 (Writer) ...... 大语言模型微调 (LLM Fine-tuning)</p>
        <p class="credit-item editor">智能助理 (Agent) ...... 多任务规划与执行 (Agent Workflow)</p>
        <!-- "主演"部分我们将通过 JS 动态填充 -->
        <p class="credit-item starring">领衔主演 (Starring) ...... {{ companyName }}</p>
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'; // 确保导入了 ref
import { useRouter } from 'vue-router';

const router = useRouter();

// 创建一个响应式变量来存储公司名称，并提供一个初始值
const companyName = ref('[正在识别主演...]');

// onMounted 是一个生命周期钩子，它会在组件被渲染到页面上之后立即执行。
onMounted(() => {
  // 从 sessionStorage 中读取由 UploadView 存入的公司名
  const nameGuess = sessionStorage.getItem('companyNameGuess');
  
  // 如果成功读取到，就更新我们的响应式变量
  if (nameGuess) {
    companyName.value = nameGuess;
  }
  
  // 我们的CSS动画总时长大约是 5.5 秒
  // 设置一个定时器，在 5500 毫秒后执行跳转 (这部分逻辑保持不变)
  setTimeout(() => {
    router.push('/analysis');
  }, 5500); 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* background-color: #000; */
  color: #e0e0e0;
  font-family: 'Noto Serif SC', serif;
  overflow: hidden;
}

.animation-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 龙标动画 */
.dragon-seal {
  width: 200px;
  height: 80px;
  border: 3px solid #c4a157;
  color: #c4a157;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  opacity: 0;
  animation: fadeInOut 2s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: scale(0.8); }
  25% { opacity: 1; transform: scale(1); }
  75% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.8); }
}

/* 演职员表动画 */
.credits-list {
  margin-top: 4rem;
  text-align: center;
}

.credit-item {
  font-size: 1.1rem;
  color: #aaa;
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
}

.director { animation-delay: 2s; }
.writer   { animation-delay: 2.5s; }
.editor   { animation-delay: 3s; }
.starring {
  animation-delay: 3.5s;
  margin-top: 1rem;
  color: #fff;
  font-size: 1.3rem;
  font-weight: bold;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 进度条 */
.progress-bar-container {
  width: 80%;
  max-width: 600px;
  height: 10px;
  background-color: #333;
  border-radius: 5px;
  margin-bottom: 5vh;
  overflow: hidden;
  /* 模拟胶片边孔 */
  background-image:
    radial-gradient(circle at 2.5px 5px, #000 2px, transparent 0),
    radial-gradient(circle at 97.5px 5px, #000 2px, transparent 0);
  background-size: 100px 10px;
}

.progress-bar {
  width: 0%;
  height: 100%;
  background-color: #c4a157;
  border-radius: 5px;
  animation: fillProgress 5s linear forwards;
  animation-delay: 0.5s; /* 稍等一下再开始 */
}

@keyframes fillProgress {
  from { width: 0%; }
  to   { width: 100%; }
}
</style>