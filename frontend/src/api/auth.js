import request from '@/utils/request'
import { mockLogin } from '@/stores/mockData'

// 演示模式开关
const DEMO_MODE = true

/**
 * 用户登录
 */
export function login(data) {
  if (DEMO_MODE) {
    return mockLogin(data.username, data.password)
  }
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 */
export function register(data) {
  if (DEMO_MODE) {
    return Promise.reject(new Error('演示模式下不支持注册'))
  }
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken) {
  return request({
    url: '/auth/refresh',
    method: 'post',
    params: { refreshToken }
  })
}

/**
 * 用户登出
 */
export function logout() {
  if (DEMO_MODE) {
    return Promise.resolve()
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
