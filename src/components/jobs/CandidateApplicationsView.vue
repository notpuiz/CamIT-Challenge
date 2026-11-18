<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { APPLICATION_STATUSES } from '@/data/cambodiaJobs'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useToastStore } from '@/stores/toast'
import { formatSalaryRange } from '@/utils/currency'

const router = useRouter()
const { t, tLocation, tWorkMode, tStatus, tPosted, localizeJob, formatCount } = useI18n()

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const jobsStore = useJobsStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { currentUser } = storeToRefs(authStore)
const { myApplications } = storeToRefs(jobsStore)
const { openJobDetail, withdrawApplication } = jobsStore

const activeStatus = ref('All')

const statusTabs = computed(() => {
  return [
    { value: 'All', label: t('applications.filterAll'), count: myApplications.value.length },
    ...APPLICATION_STATUSES.map((status) => ({
      value: status,
      label: tStatus(status),
      count: myApplications.value.filter((app) => app.status === status).length,
    })),
  ]
})

const filteredApplications = computed(() => {
  const source =
    activeStatus.value === 'All'
      ? myApplications.value
      : myApplications.value.filter((app) => app.status === activeStatus.value)
  return source.map((app) => ({
    ...app,
    localizedJob: localizeJob(app.job),
  }))
})

const countLabel = computed(() =>
  formatCount(
    filteredApplications.value.length,
    t('applications.countSingular'),
    t('applications.countPlural'),
    t('applications.countPlural'),
  ),
)

async function handleWithdraw(appId) {
  await withdrawApplication(appId)
  toastStore.showToast({
    title: t('applications.withdrawnToast'),
    tone: 'default',
  })
}

function statusClasses(status) {
  if (status === 'Shortlisted') {
    return 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20'
  }
  if (status === 'Interview') {
    return 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20'
  }
  if (status === 'Offer') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20'
  }
  if (status === 'Declined') {
    return 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20'
  }
  return 'bg-zinc-100 text-zinc-700 ring-zinc-950/[0.08] dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10'
}
</script>

<template>
  <section aria-labelledby="applications-heading">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          id="applications-heading"
          class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
        >
          {{ t('applications.title') }}
        </h1>
        <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('applications.subtitlePrefix') }}
          <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ currentUser?.email }}</span
          >.
        </p>
      </div>

      <span class="text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
        {{ countLabel }}
      </span>
    </div>

    <!-- Pipeline Status Filter Pills -->
    <div
      v-if="myApplications.length > 0"
      class="mt-5 flex flex-wrap items-center gap-1.5"
      role="group"
      :aria-label="t('employer.candidateStatus')"
    >
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        :aria-pressed="activeStatus === tab.value"
        :class="[
          'status-pill inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium select-none',
          activeStatus === tab.value
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-white text-zinc-600 ring-1 ring-zinc-950/[0.08] dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10',
        ]"
        @click="activeStatus = tab.value"
      >
        <span>{{ tab.label }}</span>
        <span class="tabular-nums opacity-75">{{ tab.count }}</span>
      </button>
    </div>

    <div
      v-if="myApplications.length === 0"
      class="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
    >
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {{ t('applications.emptyTitle') }}
      </h2>
      <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('applications.emptySub') }}
      </p>
      <div class="mt-5">
        <BaseButton variant="primary" @click="router.push({ name: 'jobs' })">
          {{ t('applications.browseJobs') }}
        </BaseButton>
      </div>
    </div>

    <div
      v-else-if="filteredApplications.length === 0"
      class="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
    >
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('board.noMatchingTitle') }}
      </p>
      <div class="mt-4">
        <BaseButton variant="secondary" @click="activeStatus = 'All'">
          {{ t('applications.filterAll') }}
        </BaseButton>
      </div>
    </div>

    <div v-else class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <article
        v-for="app in filteredApplications"
        :key="app.id"
        class="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {{ app.localizedJob?.company || t('applications.defaultEmployer') }}
              </span>
              <span class="text-xs text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
              <span class="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
                {{ t('applications.appliedPrefix') }} {{ tPosted(app.appliedAt) }}
              </span>
            </div>
            <h2 class="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {{ app.localizedJob?.displayTitle || t('applications.defaultRole') }}
            </h2>
            <p
              v-if="app.localizedJob"
              class="mt-1 text-xs text-zinc-500 tabular-nums dark:text-zinc-400"
            >
              {{ tLocation(app.localizedJob.location) }} ·
              {{ tWorkMode(app.localizedJob.workMode) }} ·
              {{
                formatSalaryRange(
                  app.localizedJob.salaryMin,
                  app.localizedJob.salaryMax,
                  app.localizedJob.currency,
                  displayCurrency,
                )
              }}
              {{ t('board.perMonth') }}
            </p>
          </div>

          <span
            :class="[
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1',
              statusClasses(app.status),
            ]"
          >
            {{ tStatus(app.status) }}
          </span>
        </div>

        <p v-if="app.coverNote" class="mt-3 max-w-[65ch] text-sm text-zinc-600 dark:text-zinc-400">
          “{{ app.coverNote }}”
        </p>

        <div
          v-if="app.employerNote"
          class="mt-3 rounded-xl bg-zinc-50 px-3.5 py-2.5 text-xs ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
        >
          <span class="font-semibold text-zinc-800 dark:text-zinc-200">
            {{ t('applications.employerNoteLabel') }}:
          </span>
          <span class="ml-1 text-zinc-600 dark:text-zinc-400">{{ app.employerNote }}</span>
        </div>

        <div
          class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800/80"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <svg
                class="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {{ app.cvFileName }}
            </span>

            <a
              v-if="app.portfolioUrl"
              :href="app.portfolioUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="tactile-text-btn inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <span>{{ t('employer.portfolioLinkBtn') }}</span>
              <span aria-hidden="true">↗</span>
            </a>

            <span
              v-if="app.portfolioProjects?.length > 0"
              class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 tabular-nums dark:bg-zinc-800 dark:text-zinc-300"
            >
              +{{ app.portfolioProjects.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <BaseButton variant="ghost" @click="handleWithdraw(app.id)">
              {{ t('applications.withdrawBtn') }}
            </BaseButton>
            <BaseButton
              v-if="app.localizedJob"
              variant="secondary"
              @click="openJobDetail(app.localizedJob.id)"
            >
              {{ t('applications.viewJobDetails') }}
            </BaseButton>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.status-pill {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.status-pill:active,
.status-pill[data-pressed='true'] {
  transform: scale(0.95);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .status-pill[aria-pressed='false']:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
