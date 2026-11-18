<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { isRemoteApiEnabled } from '@/services/apiClient'
import { useJobsStore } from '@/stores/jobs'
import { useProfileStore } from '@/stores/profile'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const { t, tLocation } = useI18n()
const jobsStore = useJobsStore()
const profileStore = useProfileStore()
const toastStore = useToastStore()

const featuredProvinces = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot']

function filterByProvince(province) {
  jobsStore.resetFilters()
  jobsStore.filters.location = province
  router.push({ name: 'jobs' })
}

function handleResetDemo() {
  jobsStore.resetDemoData()
  profileStore.reloadLocalProfile()
  toastStore.showToast({
    title: t('footer.resetDemoToast'),
    tone: 'success',
  })
}
</script>

<template>
  <footer
    class="mt-10 border-t border-zinc-200/80 bg-white/70 px-4 py-8 sm:px-6 lg:px-8 dark:border-zinc-800/80 dark:bg-zinc-950/70"
  >
    <div class="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            aria-hidden="true"
          >
            C
          </span>
          <span class="text-sm font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            CamIT
          </span>
          <span
            class="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            KH
          </span>
        </div>

        <p class="mt-2.5 max-w-[65ch] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {{ t('footer.tagline') }}
        </p>

        <div
          class="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400"
        >
          <span class="inline-flex items-center gap-1.5">
            <span
              :class="[
                'h-2 w-2 shrink-0 rounded-full',
                isRemoteApiEnabled ? 'bg-emerald-500' : 'bg-sky-500',
              ]"
              aria-hidden="true"
            />
            <span>
              {{ isRemoteApiEnabled ? t('footer.dataModeRemote') : t('footer.dataModeLocal') }}
            </span>
          </span>

          <button
            v-if="!isRemoteApiEnabled"
            type="button"
            class="tactile-text-btn cursor-pointer text-[11px] font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-700"
            @click="handleResetDemo"
          >
            {{ t('footer.resetDemoBtn') }}
          </button>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          {{ t('footer.exploreHeading') }}
        </h3>
        <ul class="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <li>
            <RouterLink :to="{ name: 'jobs' }" class="tactile-text-btn">
              {{ t('nav.findJobs') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'companies' }" class="tactile-text-btn">
              {{ t('nav.companies') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'calculator' }" class="tactile-text-btn">
              {{ t('nav.salaryCalculator') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'employer' }" class="tactile-text-btn">
              {{ t('nav.employerHub') }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          {{ t('footer.provincesHeading') }}
        </h3>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <button
            v-for="province in featuredProvinces"
            :key="province"
            type="button"
            class="footer-chip inline-flex h-7 cursor-pointer items-center rounded-full bg-zinc-100 px-2.5 text-xs font-medium text-zinc-700 select-none dark:bg-zinc-900 dark:text-zinc-300"
            @click="filterByProvince(province)"
          >
            {{ tLocation(province) }}
          </button>
        </div>
      </div>
    </div>

    <div
      class="mt-8 border-t border-zinc-200/70 pt-4 text-xs text-zinc-400 dark:border-zinc-800/70 dark:text-zinc-500"
    >
      © 2026 {{ t('footer.copyright') }}
    </div>
  </footer>
</template>

<style scoped>
.footer-chip {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.footer-chip:active,
.footer-chip[data-pressed='true'] {
  transform: scale(0.95);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .footer-chip:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
