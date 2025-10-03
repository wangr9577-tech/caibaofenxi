import { createRouter, createWebHistory } from 'vue-router'
// 导入我们新建的视图
import UploadView from '../views/UploadView.vue'
// 导入新视图
import LoadingView from '../views/LoadingView.vue'
// 导入新视图
import AnalysisView from '../views/AnalysisView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'upload',
      // 将根路径'/'指向UploadView组件
      component: UploadView
    },
    // 2. 添加新路由
    {
      path: '/loading',
      name: 'loading',
      component: LoadingView
    },
    // TODO: 稍后我们还会在这里添加 /analysis 路由
    // 2. 添加新路由
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView
    }
  ]
})

export default router