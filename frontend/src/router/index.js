import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'air-quality',
        name: 'AirQuality',
        component: () => import('@/views/AirQuality.vue'),
        meta: { title: '空气质量监测', icon: 'Monitor' }
      },
      {
        path: 'emission',
        name: 'Emission',
        component: () => import('@/views/Emission.vue'),
        meta: { title: '排放清单', icon: 'Van' }
      },
      {
        path: 'pollutant-prediction',
        name: 'PollutantPrediction',
        component: () => import('@/views/PollutantPrediction.vue'),
        meta: { title: '污染物预测', icon: 'DataAnalysis' }
      },
      {
        path: 'model-inference',
        name: 'ModelInference',
        component: () => import('@/views/ModelInference.vue'),
        meta: { title: '模型调用', icon: 'Cpu' }
      },
      {
        path: 'model-training',
        name: 'ModelTraining',
        component: () => import('@/views/ModelTraining.vue'),
        meta: { title: '模型训练', icon: 'MagicStick' }
      },
      {
        path: 'traffic-flow',
        name: 'TrafficFlow',
        component: () => import('@/views/TrafficFlow.vue'),
        meta: { title: '车流量展示', icon: 'Odometer' }
      },
      {
        path: 'policy',
        name: 'Policy',
        component: () => import('@/views/Policy.vue'),
        meta: { title: '政策评估', icon: 'Document' }
      },
      {
        path: 'feature-analysis',
        name: 'FeatureAnalysis',
        component: () => import('@/views/FeatureAnalysis.vue'),
        meta: { title: '特征分析', icon: 'TrendCharts' }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/admin/Index.vue'),
        redirect: '/admin/users',
        meta: { title: '系统管理', icon: 'Setting', roles: ['ADMIN'] },
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/admin/Users.vue'),
            meta: { title: '用户管理', roles: ['ADMIN'] }
          },
          {
            path: 'data',
            name: 'DataManagement',
            component: () => import('@/views/admin/Data.vue'),
            meta: { title: '数据管理', roles: ['ADMIN'] }
          },
          {
            path: 'models',
            name: 'ModelManagement',
            component: () => import('@/views/admin/Models.vue'),
            meta: { title: '模型管理', roles: ['ADMIN'] }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 机动车管控政策效益评估系统`
    : '机动车管控政策效益评估系统'

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    // 检查角色权限
    if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
