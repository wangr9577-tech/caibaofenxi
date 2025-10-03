<template>
  <div class="aurora-background">
    <!-- 循环渲染 span，并将计算好的内联样式绑定到 :style 上 -->
    <span 
      v-for="(style, index) in particleStyles" 
      :key="index"
      :style="style"
    ></span>
  </div>
  
  <div class="content-overlay">
    <RouterView />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterView } from 'vue-router';

// 定义光斑的数量
const particleCount = 20;

// 一个函数，用来为单个粒子生成随机样式
const generateParticleStyle = () => {
  const size = Math.floor(Math.random() * 100) + 100; // 100-200px
  const colors = ['#00d4ff', '#8a2be2', '#4a00e0', '#3c1361', '#00ff7f', '#ff4081'];
  const animationNames = ['move-light-1', 'move-light-2', 'move-light-3'];

  return {
    top: `${Math.random() * 100}vh`,
    left: `${Math.random() * 100}vw`,
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent 80%)`,
    '--animation-name': animationNames[Math.floor(Math.random() * animationNames.length)],
    '--animation-duration': `${Math.floor(Math.random() * 20) + 20}s`,
    '--animation-delay': `-${Math.floor(Math.random() * 20)}s`
  };
};

// 使用 computed 属性来一次性生成所有粒子的样式数组
const particleStyles = computed(() => {
  return Array.from({ length: particleCount }, generateParticleStyle);
});

</script>

<style> /* 不再需要 lang="scss" */

/* --- 基础设置 (保持不变) --- */
html, body, #app, .content-overlay {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  position: relative;
}

html, body {
  overflow: hidden;
  background-color: #0c0c1e;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden; 
}

/* --- 星云背景核心代码 (简化版) --- */
.aurora-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.aurora-background span {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  mix-blend-mode: screen;
  
  /* 将动画名称设置为一个 CSS 变量 */
  animation-name: var(--animation-name);
  animation-duration: var(--animation-duration);
  animation-delay: var(--animation-delay);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* 定义几种不同的动画轨迹 */
@keyframes move-light-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(100px, -50px) scale(1.2); }
}
@keyframes move-light-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-80px, 60px) scale(0.8); }
}
@keyframes move-light-3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(50px, 120px) scale(1.1); }
}
</style>