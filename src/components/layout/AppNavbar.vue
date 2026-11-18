<script setup>
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import JobsNavDropdown from '@/components/layout/JobsNavDropdown.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CurrencyToggle from '@/components/ui/CurrencyToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const authStore = useAuthStore()
const jobsStore = useJobsStore()

const { currentUser } = storeToRefs(authStore)
const { employerApplications } = storeToRefs(jobsStore)

function goToLogin(role = 'seeker', redirectPath = '/') {
  jobsStore.closeJobDetail()
  jobsStore.closePostJobModal()
  authStore.setAuthIntent({ role, mode: 'login', redirectPath })
  router.push({ name: 'login', query: { role, redirect: redirectPath } })
}

function handleLogout() {
  jobsStore.closeJobDetail()
  jobsStore.closePostJobModal()
  authStore.clearUser()
  if (route.meta.requiresAuth) {
    router.push({ name: 'jobs' })
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85"
  >
    <div class="flex h-16 w-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
      <!-- Brand + Primary Navigation -->
      <div class="flex items-center gap-5">
        <RouterLink
          :to="{ name: 'jobs' }"
          class="nav-brand-btn inline-flex items-center gap-2 rounded-lg py-1 pr-1 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.14)] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.7)]"
            aria-hidden="true"
          >
            <svg
              class="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
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
          </span>
          <span class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            CamIT
          </span>
          <span
            class="hidden rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-950/[0.06] sm:inline-flex dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-white/10"
          >
            KH
          </span>
        </RouterLink>

        <nav class="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
          <JobsNavDropdown menu-id="desktop-jobs-nav-menu" />

          <RouterLink
            v-if="!currentUser || currentUser.role === 'employer'"
            :to="{ name: 'employer' }"
            :class="[
              'nav-link inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
              route.name === 'employer'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400',
            ]"
          >
            <span>{{ t('nav.employerHub') }}</span>
            <span
              v-if="currentUser?.role === 'employer' && employerApplications.length > 0"
              class="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[11px] leading-none font-medium text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900"
            >
              {{ employerApplications.length }}
            </span>
          </RouterLink>
        </nav>
      </div>

      <!-- Top-Right Controls: Language, Currency, Theme, Auth -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <LanguageToggle />
        <CurrencyToggle />
        <ThemeToggle />

        <template v-if="!currentUser">
          <BaseButton
            variant="ghost"
            class="hidden whitespace-nowrap sm:inline-flex"
            @click="goToLogin('seeker', '/')"
          >
            {{ t('nav.signIn') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            class="whitespace-nowrap"
            @click="goToLogin('employer', '/employer')"
          >
            <span class="hidden sm:inline">{{ t('nav.postJob') }}</span>
            <span class="sm:hidden">{{ t('nav.signIn') }}</span>
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton
            v-if="currentUser.role === 'employer'"
            variant="primary"
            class="hidden whitespace-nowrap sm:inline-flex"
            @click="jobsStore.openPostJobModal"
          >
            {{ t('nav.postJob') }}
          </BaseButton>

          <RouterLink
            :to="currentUser.role === 'employer' ? { name: 'employer' } : { name: 'profile' }"
            class="nav-link hidden items-center gap-2 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs ring-1 ring-zinc-950/[0.06] sm:inline-flex dark:bg-zinc-900 dark:ring-white/10"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              aria-hidden="true"
            >
              {{
                (currentUser.role === 'employer' ? currentUser.companyName : currentUser.name)
                  ?.slice(0, 1)
                  .toUpperCase() || 'C'
              }}
            </span>
            <span class="max-w-[120px] truncate font-medium text-zinc-900 dark:text-zinc-100">
              {{ currentUser.role === 'employer' ? currentUser.companyName : currentUser.name }}
            </span>
            <span
              class="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10"
            >
              {{ currentUser.role === 'employer' ? t('nav.companyBadge') : t('nav.seekerBadge') }}
            </span>
          </RouterLink>

          <BaseButton variant="secondary" class="whitespace-nowrap" @click="handleLogout">
            {{ t('nav.signOut') }}
          </BaseButton>
        </template>
      </div>
    </div>

    <!-- Mobile Secondary Nav Row -->
    <nav
      class="flex flex-wrap items-center gap-1.5 border-t border-zinc-200/70 px-4 py-2 md:hidden dark:border-zinc-800/70"
      aria-label="Mobile navigation"
    >
      <JobsNavDropdown menu-id="mobile-jobs-nav-menu" compact />

      <RouterLink
        v-if="!currentUser || currentUser.role === 'employer'"
        :to="{ name: 'employer' }"
        :class="[
          'nav-link inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium select-none',
          route.name === 'employer'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
        ]"
      >
        <span>{{ t('nav.employerHub') }}</span>
        <span
          v-if="currentUser?.role === 'employer' && employerApplications.length > 0"
          class="tabular-nums opacity-75"
        >
          {{ employerApplications.length }}
        </span>
      </RouterLink>

      <button
        v-if="currentUser?.role === 'employer'"
        type="button"
        class="nav-link ml-auto inline-flex h-8 shrink-0 cursor-pointer items-center rounded-lg bg-zinc-900 px-2.5 text-xs font-medium text-white select-none dark:bg-zinc-100 dark:text-zinc-900"
        @click="jobsStore.openPostJobModal"
      >
        {{ t('nav.postJobShort') }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.nav-brand-btn,
.nav-link {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.nav-brand-btn:active,
.nav-brand-btn[data-pressed='true'],
.nav-link:active,
.nav-link[data-pressed='true'] {
  transform: scale(0.965);
  transition-duration: 90ms;
}

.nav-link:not([aria-current='page']):not(.bg-zinc-900):active,
.nav-link:not([aria-current='page']):not(.bg-zinc-900)[data-pressed='true'] {
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
}

@media (hover: hover) and (pointer: fine) {
  .nav-link:not([aria-current='page']):not(.bg-zinc-900):hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
