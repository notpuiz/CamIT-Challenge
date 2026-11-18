<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import CurrencyToggle from '@/components/ui/CurrencyToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { useLoginForm } from '@/composables/useLoginForm'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const {
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
  syncFromIntent,
  setRole,
  toggleMode,
  clearFieldError,
  handleSubmit,
  handleGoogleSignIn,
  quickDemoLogin,
} = useLoginForm()

const activeView = ref('login') // 'login' | 'forgot'
const resetEmail = ref('')
const resetErrorKey = ref('')
const isResetSubmitting = ref(false)
const resetSent = ref(false)

onMounted(() => {
  syncFromIntent()
})

function openForgotView() {
  resetEmail.value = email.value.trim()
  resetErrorKey.value = ''
  resetSent.value = false
  activeView.value = 'forgot'
}

function backToLogin() {
  resetErrorKey.value = ''
  resetSent.value = false
  activeView.value = 'login'
}

function handleBackToJobs() {
  authStore.clearReopenIntent()
  router.push({ name: 'jobs' })
}

async function handleResetSubmit() {
  if (isResetSubmitting.value) return

  const trimmed = resetEmail.value.trim()
  if (!trimmed) {
    resetErrorKey.value = 'errEmailRequired'
    return
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    resetErrorKey.value = 'errEmailInvalid'
    return
  }

  resetErrorKey.value = ''
  isResetSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 450))
    resetEmail.value = trimmed
    resetSent.value = true
  } finally {
    isResetSubmitting.value = false
  }
}
</script>

<template>
  <main
    class="auth-ambient-bg relative flex min-h-svh flex-col items-center justify-center px-4 pt-20 pb-10 text-zinc-900 sm:py-12 dark:text-zinc-100"
  >
    <!-- Top Bar: Back to Jobs (Left) + Language, Currency & Theme Toggle (Top-Right Corner) -->
    <div
      class="absolute top-4 right-4 left-4 z-10 flex items-center justify-between gap-2 sm:top-6 sm:right-6 sm:left-6"
    >
      <button
        type="button"
        class="inline-link-btn inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/10 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 sm:px-3 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/12 dark:focus-visible:outline-zinc-200"
        @click="handleBackToJobs"
      >
        <svg
          class="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span class="hidden sm:inline">{{ t('auth.backToJobs') }}</span>
      </button>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <LanguageToggle />
        <CurrencyToggle />
        <ThemeToggle />
      </div>
    </div>

    <div
      class="auth-card w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.07)] ring-1 ring-zinc-950/[0.07] sm:p-8 dark:bg-zinc-900/90 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_16px_40px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-white/[0.09]"
    >
      <Transition name="view-swap" mode="out-in">
        <!-- Sign-in / Sign-up View -->
        <section v-if="activeView === 'login'" key="login" aria-labelledby="login-heading">
          <div class="flex items-center justify-between gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.14)] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.7)]"
              aria-hidden="true"
            >
              <svg
                class="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M14.31 8 20.05 17.94" />
                <path d="M9.69 8h11.48" />
                <path d="M7.38 12 13.12 2.06" />
                <path d="M9.69 16 3.95 6.06" />
                <path d="M14.31 16H2.83" />
                <path d="M16.62 12 10.88 21.94" />
              </svg>
            </div>

            <!-- Job Seeker vs Company Segmented Control -->
            <div
              role="group"
              :aria-label="t('auth.accountTypeAria')"
              class="relative grid h-9 w-52 grid-cols-2 items-center rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-950/[0.06] select-none dark:bg-zinc-950/60 dark:ring-white/10"
            >
              <span
                aria-hidden="true"
                class="role-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[6px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800 dark:ring-white/10"
                :style="{ transform: role === 'employer' ? 'translateX(100%)' : 'translateX(0%)' }"
              />

              <button
                type="button"
                :aria-pressed="role === 'seeker'"
                :class="[
                  'role-btn relative z-10 h-8 cursor-pointer rounded-[6px] px-1.5 text-xs font-medium truncate',
                  role === 'seeker'
                    ? 'text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400',
                ]"
                @click="setRole('seeker')"
              >
                {{ t('auth.jobSeeker') }}
              </button>

              <button
                type="button"
                :aria-pressed="role === 'employer'"
                :class="[
                  'role-btn relative z-10 h-8 cursor-pointer rounded-[6px] px-1.5 text-xs font-medium truncate',
                  role === 'employer'
                    ? 'text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400',
                ]"
                @click="setRole('employer')"
              >
                {{ t('auth.company') }}
              </button>
            </div>
          </div>

          <h1
            id="login-heading"
            class="mt-5 text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
          >
            {{
              mode === 'signup'
                ? role === 'employer'
                  ? t('auth.createCompanyTitle')
                  : t('auth.createSeekerTitle')
                : role === 'employer'
                  ? t('auth.signInEmployerTitle')
                  : t('auth.signInSeekerTitle')
            }}
          </h1>
          <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
            {{ role === 'employer' ? t('auth.employerSub') : t('auth.seekerSub') }}
          </p>

          <div class="mt-5">
            <BaseButton
              variant="secondary"
              full-width
              :loading="isSocialLoading"
              :disabled="isSubmitting"
              @click="handleGoogleSignIn"
            >
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{{ t('auth.continueGoogle') }}</span>
              <template #loading>{{ t('auth.connecting') }}</template>
            </BaseButton>
          </div>

          <div class="relative my-5 flex items-center" aria-hidden="true">
            <div class="flex-grow border-t border-zinc-200/80 dark:border-zinc-800" />
            <span class="mx-3 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {{ t('auth.orContinueEmail') }}
            </span>
            <div class="flex-grow border-t border-zinc-200/80 dark:border-zinc-800" />
          </div>

          <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
            <div
              v-if="errors.form"
              role="alert"
              class="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
            >
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span class="max-w-[65ch]">{{ errors.form }}</span>
            </div>

            <BaseInput
              v-if="mode === 'signup'"
              id="auth-fullname"
              v-model="fullName"
              :label="t('auth.fullName')"
              :placeholder="t('auth.fullNamePlaceholder')"
              autocomplete="name"
              enterkeyhint="next"
              :disabled="isSubmitting || isSocialLoading"
              :error="errors.fullName"
              @update:model-value="clearFieldError('fullName')"
            />

            <BaseInput
              v-if="mode === 'signup' && role === 'employer'"
              id="auth-company"
              v-model="companyName"
              :label="t('auth.companyName')"
              :placeholder="t('auth.companyPlaceholder')"
              autocomplete="organization"
              enterkeyhint="next"
              :disabled="isSubmitting || isSocialLoading"
              :error="errors.companyName"
              @update:model-value="clearFieldError('companyName')"
            />

            <BaseInput
              id="login-email"
              v-model="email"
              :label="t('auth.emailAddress')"
              type="email"
              :placeholder="role === 'employer' ? 'hr@company.com.kh' : 'name@example.com'"
              autocomplete="email"
              inputmode="email"
              autocapitalize="none"
              autocorrect="off"
              enterkeyhint="next"
              :disabled="isSubmitting || isSocialLoading"
              :error="errors.email"
              @update:model-value="clearFieldError('email')"
            />

            <BaseInput
              id="login-password"
              v-model="password"
              :label="t('auth.password')"
              type="password"
              placeholder="••••••••"
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              enterkeyhint="done"
              :disabled="isSubmitting || isSocialLoading"
              :error="errors.password"
              @update:model-value="clearFieldError('password')"
            >
              <template #labelRight>
                <button
                  v-if="mode === 'login'"
                  type="button"
                  class="inline-link-btn cursor-pointer rounded text-xs font-medium text-zinc-500 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:focus-visible:outline-zinc-200"
                  @click="openForgotView"
                >
                  {{ t('auth.forgotPassword') }}
                </button>
              </template>
            </BaseInput>

            <div class="pt-0.5">
              <BaseCheckbox
                id="remember-me"
                v-model="rememberMe"
                :label="t('auth.keepSignedIn')"
                :disabled="isSubmitting || isSocialLoading"
              />
            </div>

            <div class="pt-1">
              <BaseButton
                type="submit"
                variant="primary"
                full-width
                :loading="isSubmitting"
                :disabled="isSocialLoading"
              >
                {{ mode === 'signup' ? t('auth.createAccount') : t('auth.signIn') }}
                <template #loading>
                  {{ mode === 'signup' ? t('auth.creating') : t('auth.signingIn') }}
                </template>
              </BaseButton>
            </div>
          </form>

          <p class="mt-5 max-w-[65ch] text-center text-xs text-zinc-500 dark:text-zinc-400">
            {{ mode === 'signup' ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount') }}
            <button
              type="button"
              class="inline-link-btn cursor-pointer rounded font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:decoration-zinc-600 dark:focus-visible:outline-zinc-200"
              @click="toggleMode"
            >
              {{ mode === 'signup' ? t('auth.signIn') : t('auth.createAccount') }}
            </button>
          </p>

          <!-- Instant Prototype Shortcuts -->
          <div class="mt-5 border-t border-zinc-100 pt-4 text-center dark:border-zinc-800/80">
            <p class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              {{ t('auth.quickPreview') }}
            </p>
            <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                class="demo-chip cursor-pointer rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 select-none dark:bg-zinc-800 dark:text-zinc-300"
                @click="quickDemoLogin('seeker')"
              >
                {{ t('auth.demoSeeker') }}
              </button>
              <button
                type="button"
                class="demo-chip cursor-pointer rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 select-none dark:bg-zinc-800 dark:text-zinc-300"
                @click="quickDemoLogin('employer')"
              >
                {{ t('auth.demoCompany') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Password Reset View -->
        <section v-else key="forgot" aria-labelledby="reset-heading">
          <button
            type="button"
            class="inline-link-btn inline-flex cursor-pointer items-center gap-1.5 rounded text-xs font-medium text-zinc-500 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:focus-visible:outline-zinc-200"
            @click="backToLogin"
          >
            <svg
              class="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {{ t('auth.backToSignIn') }}
          </button>

          <h1
            id="reset-heading"
            class="mt-5 text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
          >
            {{ t('auth.resetTitle') }}
          </h1>
          <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
            {{ resetSent ? t('auth.resetSentSub') : t('auth.resetSub') }}
          </p>

          <div v-if="resetSent" class="mt-6 space-y-4">
            <div
              class="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:text-zinc-300 dark:ring-white/[0.08]"
            >
              <p class="max-w-[65ch]">
                {{ t('auth.resetSentTo') }}
                <span class="font-medium text-zinc-900 dark:text-zinc-100">{{ resetEmail }}</span
                >.
              </p>
            </div>
            <BaseButton variant="secondary" full-width @click="backToLogin">
              {{ t('auth.returnToSignIn') }}
            </BaseButton>
          </div>

          <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="handleResetSubmit">
            <BaseInput
              id="reset-email"
              v-model="resetEmail"
              :label="t('auth.emailAddress')"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              inputmode="email"
              autocapitalize="none"
              autocorrect="off"
              enterkeyhint="send"
              :disabled="isResetSubmitting"
              :error="resetErrorKey ? t(`auth.${resetErrorKey}`) : ''"
              @update:model-value="resetErrorKey = ''"
            />

            <BaseButton type="submit" variant="primary" full-width :loading="isResetSubmitting">
              {{ t('auth.sendResetLink') }}
              <template #loading>{{ t('auth.sendingLink') }}</template>
            </BaseButton>
          </form>
        </section>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.auth-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 240ms var(--ease-out),
    transform 240ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(6px) scale(0.985);
  }
}

.role-pill {
  transition: transform 180ms var(--ease-out);
}

.role-btn,
.demo-chip,
.inline-link-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.role-btn:active,
.role-btn[data-pressed='true'],
.demo-chip:active,
.demo-chip[data-pressed='true'],
.inline-link-btn:active,
.inline-link-btn[data-pressed='true'] {
  transform: scale(0.96);
  transition-duration: 90ms;
}

.demo-chip:active,
.demo-chip[data-pressed='true'] {
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
}

@media (hover: hover) and (pointer: fine) {
  .inline-link-btn:hover,
  .role-btn:hover {
    color: var(--link-hover-text);
  }

  .demo-chip:hover:not(:active):not([data-pressed='true']) {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}

.view-swap-enter-active {
  transition:
    opacity 180ms var(--ease-out),
    transform 180ms var(--ease-out),
    filter 180ms var(--ease-out);
}

.view-swap-leave-active {
  transition:
    opacity 130ms var(--ease-out),
    transform 130ms var(--ease-out),
    filter 130ms var(--ease-out);
}

.view-swap-enter-from,
.view-swap-leave-to {
  opacity: 0;
  transform: scale(0.98);
  filter: blur(2px);
}
</style>
