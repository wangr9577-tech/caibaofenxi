// src/services/api.js

import axios from 'axios';

// --- 关键修改 ---
// 在生产环境中，Vite会把 import.meta.env.PROD 设为 true
// 我们稍后会在 Vercel 上设置 VITE_API_BASE_URL 这个环境变量
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: baseURL,
  // ... 其他配置
});

// 2. (可选) 添加请求拦截器
// 可以在这里统一处理如添加token、显示加载动画等逻辑
apiClient.interceptors.request.use(
  config => {
    console.log('Starting API Request', config);
    return config;
  },
  error => {
    console.error('API Request Error', error);
    return Promise.reject(error);
  }
);

// 3. (可选) 添加响应拦截器
// 可以在这里统一处理错误响应、数据转换等
apiClient.interceptors.response.use(
  response => {
    console.log('Received API Response', response);
    return response;
  },
  error => {
    console.error('API Response Error', error.response || error.message);
    // 在这里可以做全局的错误提示，比如弹出一个提示框
    // alert('网络错误，请稍后再试！');
    return Promise.reject(error);
  }
);

/**
 * 上传财报PDF文件，创建一个新的分析会话。
 * @param {File} file - 用户选择的文件对象。
 * @returns {Promise<Object>} 包含 session_id 的响应数据。
 */
export const uploadReportApi = (file) => {
  // 1. 创建一个 FormData 对象来包装文件
  const formData = new FormData();
  // 'file' 这个键名必须和 FastAPI 后端接口参数名 `def upload_report(file: UploadFile ...)` 一致
  formData.append('file', file); 

  // 2. 发送 POST 请求
  return apiClient.post('/api/upload', formData, {
    // 3. 关键：为这个特定的请求覆盖 headers
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 根据会话ID和任务指令，请求AI进行分析。
 * @param {string} sessionId - 从上传接口获取的会话ID。
 * @param {string} task - 任务指令, e.g., "initial_analysis", "chat_question"。
 * @param {string} [question] - (可选) 在聊天任务中用户提出的问题。
 * @returns {Promise<Object>} 包含分析结果的响应数据。
 */
export const queryAnalysisApi = (sessionId, task, question = null) => {
  // 1. 构建要发送的JSON数据体 (payload)
  const payload = {
    session_id: sessionId,
    task: task,
  };

  // 如果有 question 参数，也添加到 payload 中
  if (question) {
    payload.question = question;
  }

  // 2. 发送 POST 请求，第二个参数就是我们的JSON数据体
  // axios 会自动将这个JavaScript对象序列化为JSON字符串
  return apiClient.post('/api/query', payload);
};


// 4. 导出一个我们可以使用的实例
export default apiClient;