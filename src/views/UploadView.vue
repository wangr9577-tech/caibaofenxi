<template>
  <div class="upload-container">
    <div 
      class="drop-zone"
      :class="{ 'drag-over': isDragging, 'is-loading': isLoading }"
      @click="isLoading ? null : triggerFileInput"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <!-- 胶片盘的中心 -->
      <div class="reel-center"></div>
      <!-- 胶片盘的孔洞 -->
      <div class="reel-hole" v-for="i in 6" :key="i" :style="getHoleStyle(i)"></div>

      <!-- 根据加载状态显示不同内容 -->
      <div v-if="!isLoading" class="upload-content">
        <svg
          class="upload-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <p class="main-text">将财报文件拖拽至此</p>
        <p class="sub-text">或点击上传</p>
      </div>
      
      <!-- 加载动画 -->
      <div v-else class="loading-spinner"></div> <!-- 确保这个div是正确闭合的 -->

    </div>

    <!-- 错误信息显示区域 -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- 标题和副标题 -->
    <h1 class="title">AI财报影院</h1>
    <h2 class="subtitle">上传一份财报，即刻上映它的年度故事片</h2>
    
    <!-- 隐藏的文件上传输入框 -->
    <input 
      type="file" 
      ref="fileInput" 
      @change="onFileSelected" 
      accept=".pdf" 
      style="display: none;" 
      :disabled="isLoading"
    >
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 1. 导入我们封装好的API函数
import { uploadReportApi } from '@/services/api'; 

const fileInput = ref(null);
const isDragging = ref(false);
const router = useRouter(); // 获取路由实例

// 2. 新增状态变量
const isLoading = ref(false); // 控制是否显示加载动画
const errorMessage = ref(''); // 存储错误信息以显示给用户

// --- 交互逻辑 ---
const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
};

const onFileSelected = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
};

// --- 这是全新的、异步的 handleFile 函数 ---
const handleFile = async (file) => {
  // 如果正在加载，则阻止重复提交
  if (isLoading.value) return;

  // 重置错误信息
  errorMessage.value = '';

  // --- 文件前端验证 (可选但推荐) ---
  if (!file.type.includes('pdf')) {
    errorMessage.value = '文件格式错误，请上传PDF文件。';
    return;
  }
  if (file.size > 10 * 1024 * 1024) { // 限制文件大小为 10MB
    errorMessage.value = '文件过大，请上传小于10MB的PDF。';
    return;
  }

  try {
    // 1. 进入加载状态
    isLoading.value = true;
    console.log('开始上传并创建会话...');

    // 2. 调用API，并等待响应
    const response = await uploadReportApi(file);

    // 3. 从响应中获取 session_id
    const sessionId = response.data.session_id;
    console.log('会话创建成功，Session ID:', sessionId);

    if (!sessionId) {
      throw new Error('后端未返回有效的 session_id');
    }
    
    // --- 新增代码 ---
    // 1. 从文件名中提取公司名 (一个简单的实现)
    let companyNameGuess = file.name
      .replace('.pdf', '')
      .replace('.PDF', '')
      // .replace(/(\d{4}年度报告|\d{4}年报)/, '') // 移除年份报告字样
      .trim();
    
    // 2. 将 session_id 和猜测的公司名都存入 sessionStorage
    sessionStorage.setItem('reportSessionId', sessionId);
    sessionStorage.setItem('companyNameGuess', companyNameGuess);
    // --- 新增代码结束 ---

    // 4. 将 session_id 存储到 sessionStorage
    // sessionStorage 的数据在浏览器标签页关闭后会清除
    sessionStorage.setItem('reportSessionId', sessionId);

    // 5. 成功后，跳转到我们的加载动画页面
    // 我们仍然保留加载页，因为它提供了很好的用户体验过渡
    router.push('/loading');

  } catch (error) {
    // 6. 处理错误
    console.error('上传或创建会话失败:', error);
    // 从axios的错误对象中提取后端返回的错误信息，如果没有则显示通用信息
    errorMessage.value = error.response?.data?.detail || '上传失败，请稍后再试。';
  } finally {
    // 7. 无论成功或失败，最后都结束加载状态
    isLoading.value = false;
    // 清空文件输入框的值，允许用户重新上传同一个文件
    if (fileInput.value) {
        fileInput.value.value = '';
    }
  }
};


// --- 胶片盘孔洞的动态样式 ---
const getHoleStyle = (index) => {
  const angle = (index - 1) * 60; // 6个孔，每个间隔60度
  return {
    transform: `rotate(${angle}deg) translate(110px) rotate(90deg)`
  };
};
</script>

<style scoped>
/* 引入外部字体，增加设计感 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700&display=swap');

.upload-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* background-color: rgba(0, 0, 0, 0.2); */
  color: #e0e0e0;
  font-family: 'Noto Sans SC', sans-serif;
  overflow: hidden;
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  color: #a0a0a0;
  margin-top: 0;
}

.drop-zone {
  position: relative;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.2); /* 边框也改为半透明 */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  /* --- 关键修改 --- */
  background-color: rgba(0, 0, 0, 0.2); /* 从 #222 改为半透明黑色 */
  box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.6);
}

.drop-zone:hover, .drop-zone.drag-over {
  border-color: #00bcd4;
  background-color: rgba(0, 0, 0, 0.2);
  transform: scale(1.05) rotate(15deg);
  box-shadow: 0 0 30px rgba(0, 188, 212, 0.7), inset 0 0 40px rgba(0,0,0,0.6);
}

.upload-content {
  text-align: center;
  z-index: 2;
  pointer-events: none; /* 让鼠标事件穿透到父级drop-zone */
  transition: opacity 0.3s ease;
}

.drop-zone:hover .upload-content {
  opacity: 0.8;
}

.upload-icon {
  width: 64px;
  height: 64px;
  color: #666; /* 默认颜色 */
  transition: all 0.3s ease;
}

.drop-zone:hover .upload-icon {
  color: #00bcd4; /* Hover 时的颜色 */
  transform: translateY(-10px) scale(1.1);
}

.main-text {
  font-size: 1.1rem;
  font-weight: 400;
  margin: 1rem 0 0.25rem;
  color: #ccc;
}
.sub-text {
  font-size: 0.9rem;
  color: #777;
  margin: 0;
}

/* 胶片盘样式 */
.reel-center {
  position: absolute;
  width: 80px;
  height: 80px;
  background-color: rgba(0, 0, 0, 0.2); /* 从 #1a1a1a 改为半透明 */
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.1); /* 边框也半透明 */
  z-index: 1;
}

/* --- 关键修改 --- */
.reel-hole {
  position: absolute;
  width: 40px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.2); /* 从 #1a1a1a 改为半透明 */
  border-radius: 20px;
  z-index: 0;
}

.drop-zone.is-loading {
  cursor: not-allowed;
  border-color: #00bcd4;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { box-shadow: 0 0 20px rgba(0, 188, 212, 0.4); }
  50% { box-shadow: 0 0 40px rgba(0, 188, 212, 0.8); }
  100% { box-shadow: 0 0 20px rgba(0, 188, 212, 0.4); }
}

/* CSS 加载动画 (Spinner) */
.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #00bcd4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 3;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误信息样式 */
.error-message {
  color: #ef5350; /* 红色 */
  background-color: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.5);
  border-radius: 5px;
  padding: 10px 15px;
  margin-top: 1.5rem;
  margin-bottom: -0.5rem; /* 调整与标题的间距 */
  max-width: 500px;
  text-align: center;
}
</style>