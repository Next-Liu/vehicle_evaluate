import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(userInfo) {
    username.value = userInfo.username
    role.value = userInfo.role
    localStorage.setItem('username', userInfo.username)
    localStorage.setItem('role', userInfo.role)
  }

  function clearUser() {
    token.value = ''
    username.value = ''
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  }

  function isLoggedIn() {
    return !!token.value
  }

  function isAdmin() {
    return role.value === 'ADMIN'
  }

  return {
    token,
    username,
    role,
    setToken,
    setUser,
    clearUser,
    isLoggedIn,
    isAdmin
  }
})
