import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

const USER_STORAGE_KEY = 'jobspacekh-user'

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(loadSavedUser())

  const isAuthenticated = computed(() => Boolean(currentUser.value))
  const isEmployer = computed(() => currentUser.value?.role === 'employer')
  const isSeeker = computed(() => currentUser.value?.role === 'seeker')

  const authIntent = reactive({
    role: 'seeker',
    mode: 'login',
    redirectPath: '/',
    reopenJobId: null,
    openApplyOnReturn: false,
  })

  function setAuthIntent({
    role = 'seeker',
    mode = 'login',
    redirectPath = '/',
    reopenJobId = null,
    openApplyOnReturn = false,
  } = {}) {
    authIntent.role = role
    authIntent.mode = mode
    authIntent.redirectPath = redirectPath
    authIntent.reopenJobId = reopenJobId
    authIntent.openApplyOnReturn = openApplyOnReturn
  }

  function clearReopenIntent() {
    authIntent.reopenJobId = null
    authIntent.openApplyOnReturn = false
  }

  function setUser(userPayload) {
    currentUser.value = userPayload
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userPayload))
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  function clearUser() {
    currentUser.value = null
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isEmployer,
    isSeeker,
    authIntent,
    setAuthIntent,
    clearReopenIntent,
    setUser,
    clearUser,
  }
})
