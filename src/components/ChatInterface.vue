<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message-bubble"
        :class="{ 'user-message': message.sender === 'user', 'ai-message': message.sender === 'ai' }"
      >
        <p v-html="message.text"></p>
      </div>
      <!-- AI 正在输入的提示 -->
      <div v-if="isTyping" class="message-bubble ai-message typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="newMessage"
        @keydown.enter.prevent="sendMessage"
        placeholder="请提出您关心的问题..."
      ></textarea>
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
// 1. 导入我们的API函数
import { queryAnalysisApi } from '@/services/api';

// 聊天记录
const messages = ref([
  { id: 1, sender: 'ai', text: '您好！我已经完成了对财报的初步分析。您现在可以针对任何具体问题进行提问，例如：<strong>“详细解释一下现金流为什么会下降？”</strong>' }
]);

// 用户输入的新消息
const newMessage = ref('');
// AI是否正在“思考”
const isTyping = ref(false);
// 消息列表的DOM引用
const messageListRef = ref(null);

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick(); // 等待DOM更新
  const container = messageListRef.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// 发送消息
const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text || isTyping.value) return; // 如果正在输入或AI正在思考，则阻止发送

  // 1. 将用户消息添加到列表
  messages.value.push({
    id: Date.now(),
    sender: 'user',
    text: text
  });
  
  newMessage.value = '';
  scrollToBottom();

  // 2. 进入“AI正在输入”状态
  isTyping.value = true;

  try {
    // 3. 调用后端API
    // 我们传入从 props 中获取的 sessionId, 任务指令, 和用户的问题
    const response = await queryAnalysisApi(props.sessionId, 'chat_question', text);

    // 4. 从响应中提取AI的回答
    const aiAnswer = response.data.data.answer;

    if (aiAnswer) {
      // 5. 将AI的回答添加到消息列表
      messages.value.push({
        id: Date.now() + 1,
        sender: 'ai',
        text: aiAnswer
      });
    } else {
      throw new Error('API did not return a valid answer.');
    }

  } catch (error) {
    console.error("Chat API call failed:", error);
    // 在发生错误时，也给出一个友好的提示
    messages.value.push({
      id: Date.now() + 1,
      sender: 'ai',
      text: '抱歉，我在思考时遇到了一些问题，请稍后再试。'
    });
  } finally {
    // 6. 无论成功与否，都结束“正在输入”状态
    isTyping.value = false;
    scrollToBottom();
  }
};

const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
});

</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.message-list {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 滚动条样式 (可选，但能提升美感) */
.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
.message-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  line-height: 1.6;
  width: fit-content;
}

.ai-message {
  background-color: #2c2c2e;
  align-self: flex-start;
  border-bottom-left-radius: 3px;
}

.user-message {
  background-color: #007aff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 3px;
}

.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #333;
}

textarea {
  flex-grow: 1;
  background: #1c1c1e;
  border: 1px solid #444;
  border-radius: 8px;
  color: #eee;
  padding: 10px;
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  height: 40px; /* 自适应高度 */
  transition: height 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #007aff;
}

button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background-color: #0056b3;
}

/* AI 正在输入... 的动画 */
.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #777;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
</style>