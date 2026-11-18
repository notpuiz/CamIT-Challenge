import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { useToastStore } from '@/stores/toast'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function inferNameFromEmail(email) {
  const local = String(email).split('@')[0] || 'JobspaceKH Member'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function useLoginForm() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const authStore = useAuthStore()
  const jobsStore = useJobsStore()
  const toastStore = useToastStore()

  function resolveInitialRole() {
    if (route.query.role === 'employer') return 'employer'
    if (route.query.role === 'seeker') return 'seeker'
    return authStore.authIntent.role || 'seeker'
  }

  const role = ref(resolveInitialRole())
  const mode = ref(authStore.authIntent.mode || 'login')

  const fullName = ref('')
  const companyName = ref('')
  const email = ref('')
  const password = ref('')
  const rememberMe = ref(true)

  const errorKeys = reactive({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    form: '',
  })

  const customFormError = ref('')

  const errors = reactive({
    get fullName() {
      return errorKeys.fullName ? t(`auth.${errorKeys.fullName}`) : ''
    },
    get companyName() {
      return errorKeys.companyName ? t(`auth.${errorKeys.companyName}`) : ''
    },
    get email() {
      return errorKeys.email ? t(`auth.${errorKeys.email}`) : ''
    },
    get password() {
      return errorKeys.password ? t(`auth.${errorKeys.password}`) : ''
    },
    get form() {
      if (customFormError.value) return customFormError.value
      return errorKeys.form ? t(`auth.${errorKeys.form}`) : ''
    },
  })

  const isSubmitting = ref(false)
  const isSocialLoading = ref(false)
  const authenticatedUser = ref(null)
  const shakeCount = ref(0)
  let redirectTimer = null

  function cancelPendingRedirect() {
    if (redirectTimer) {
      clearTimeout(redirectTimer)
      redirectTimer = null
    }
  }

  onBeforeUnmount(() => {
    cancelPendingRedirect()
  })

  function clearFieldError(field) {
    if (errorKeys[field]) {
      errorKeys[field] = ''
    }
    if (errorKeys.form || customFormError.value) {
      errorKeys.form = ''
      customFormError.value = ''
    }
  }

  function clearAllErrors() {
    errorKeys.fullName = ''
    errorKeys.companyName = ''
    errorKeys.email = ''
    errorKeys.password = ''
    errorKeys.form = ''
    customFormError.value = ''
  }

  function syncFromIntent() {
    role.value = resolveInitialRole()
    mode.value = authStore.authIntent.mode || 'login'
    clearAllErrors()
  }

  function setRole(nextRole) {
    role.value = nextRole
    clearAllErrors()
  }

  function toggleMode() {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
    clearAllErrors()
  }

  function validate() {
    clearAllErrors()
    let isValid = true

    if (mode.value === 'signup') {
      if (!fullName.value.trim()) {
        errorKeys.fullName = 'errFullName'
        isValid = false
      }
      if (role.value === 'employer' && !companyName.value.trim()) {
        errorKeys.companyName = 'errCompany'
        isValid = false
      }
    }

    const trimmedEmail = email.value.trim()
    if (!trimmedEmail) {
      errorKeys.email = 'errEmailRequired'
      isValid = false
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errorKeys.email = 'errEmailInvalid'
      isValid = false
    }

    if (!password.value) {
      errorKeys.password = 'errPasswordRequired'
      isValid = false
    } else if (password.value.length < 6) {
      errorKeys.password = 'errPasswordMin'
      isValid = false
    }

    return isValid
  }

  async function finishSignIn(userPayload) {
    if (authenticatedUser.value) return

    authStore.setUser(userPayload)
    authenticatedUser.value = userPayload

    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const waitMs = prefersReducedMotion ? 260 : 680

    await new Promise((resolve) => {
      redirectTimer = setTimeout(() => {
        redirectTimer = null
        resolve()
      }, waitMs)
    })

    if (!authenticatedUser.value) return

    toastStore.showToast({
      title: t('toasts.signedInWelcome', { name: userPayload.name }),
      tone: 'success',
    })

    if (authStore.authIntent.reopenJobId) {
      const jobId = authStore.authIntent.reopenJobId
      const shouldApply = authStore.authIntent.openApplyOnReturn && userPayload.role === 'seeker'
      authStore.clearReopenIntent()
      await router.push({ name: 'jobs' })
      jobsStore.openJobDetail(jobId, { apply: shouldApply })
      return
    }

    if (userPayload.role === 'employer') {
      const target =
        typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
          ? route.query.redirect
          : '/employer'
      await router.push(target)
      return
    }

    const target =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : authStore.authIntent.redirectPath || '/'
    await router.push(target === '/employer' ? '/' : target)
  }

  async function handleSubmit() {
    if (isSubmitting.value || isSocialLoading.value || authenticatedUser.value) return
    if (!validate()) {
      shakeCount.value += 1
      return
    }

    isSubmitting.value = true
    errorKeys.form = ''
    customFormError.value = ''

    try {
      await delay(160)

      const trimmedEmail = email.value.trim()
      const resolvedName = fullName.value.trim() || inferNameFromEmail(trimmedEmail)
      const resolvedCompany =
        role.value === 'employer'
          ? companyName.value.trim() ||
            (trimmedEmail.toLowerCase() === 'hr@mekonglabs.kh'
              ? 'Mekong Digital Labs'
              : `${resolvedName} Co., Ltd.`)
          : ''

      password.value = ''
      await finishSignIn({
        name: resolvedName,
        email: trimmedEmail,
        role: role.value,
        companyName: resolvedCompany,
        rememberMe: rememberMe.value,
      })
    } catch (error) {
      if (error?.message) {
        customFormError.value = error.message
      } else {
        errorKeys.form = 'errGeneric'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function handleGoogleSignIn() {
    if (isSubmitting.value || isSocialLoading.value || authenticatedUser.value) return

    clearAllErrors()
    isSocialLoading.value = true

    try {
      await delay(160)

      if (role.value === 'employer') {
        await finishSignIn({
          name: 'Vannak Pich',
          email: 'hr@mekonglabs.kh',
          role: 'employer',
          companyName: 'Mekong Digital Labs',
          provider: 'Google',
          rememberMe: true,
        })
      } else {
        await finishSignIn({
          name: 'Sokha Chan',
          email: 'sokha@jobspace.kh',
          role: 'seeker',
          companyName: '',
          provider: 'Google',
          rememberMe: true,
        })
      }
    } catch (error) {
      if (error?.message) {
        customFormError.value = error.message
      } else {
        errorKeys.form = 'errGoogle'
      }
    } finally {
      isSocialLoading.value = false
    }
  }

  async function quickDemoLogin(targetRole) {
    if (isSubmitting.value || isSocialLoading.value || authenticatedUser.value) return
    clearAllErrors()
    if (targetRole === 'employer') {
      await finishSignIn({
        name: 'Vannak Pich',
        email: 'hr@mekonglabs.kh',
        role: 'employer',
        companyName: 'Mekong Digital Labs',
        rememberMe: true,
      })
      return
    }

    await finishSignIn({
      name: 'Sokha Chan',
      email: 'sokha@jobspace.kh',
      role: 'seeker',
      companyName: '',
      rememberMe: true,
    })
  }

  return {
    role,
    mode,
    fullName,
    companyName,
    email,
    password,
    rememberMe,
    errors,
    isSubmitting,
    isSocialLoading,
    authenticatedUser,
    shakeCount,
    cancelPendingRedirect,
    syncFromIntent,
    setRole,
    toggleMode,
    clearFieldError,
    handleSubmit,
    handleGoogleSignIn,
    quickDemoLogin,
  }
}
