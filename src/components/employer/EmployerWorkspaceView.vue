<script setup>
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { APPLICATION_STATUSES } from '@/data/cambodiaJobs'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useToastStore } from '@/stores/toast'
import { formatSalaryRange } from '@/utils/currency'

const { t, tCategory, tLocation, tStatus, tPosted, localizeJob, formatCount } = useI18n()

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const jobsStore = useJobsStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { currentUser } = storeToRefs(authStore)
const { employerJobs, employerApplications } = storeToRefs(jobsStore)
const {
  openPostJobModal,
  openEditJobModal,
  openJobDetail,
  toggleJobStatus,
  deleteJobPosting,
  updateApplicationStatus,
  updateApplicationNote,
} = jobsStore

const activeTab = ref('applicants')
const applicantSearch = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const noteDrafts = reactive({})

watch(
  employerApplications,
  (apps) => {
    for (const app of apps) {
      if (noteDrafts[app.id] === undefined) {
        noteDrafts[app.id] = app.employerNote || ''
      }
    }
  },
  { immediate: true },
)

const statusOptions = computed(() =>
  APPLICATION_STATUSES.map((value) => ({ value, label: tStatus(value) })),
)

const localizedEmployerJobs = computed(() => employerJobs.value.map((job) => localizeJob(job)))

const roleFilterOptions = computed(() => [
  { value: 'all', label: t('employer.allRoles') },
  ...localizedEmployerJobs.value.map((job) => ({
    value: job.id,
    label: job.displayTitle,
  })),
])

const statusFilterOptions = computed(() => [
  { value: 'all', label: t('employer.allStatuses') },
  ...APPLICATION_STATUSES.map((value) => ({ value, label: tStatus(value) })),
])

const localizedEmployerApplications = computed(() =>
  employerApplications.value.map((app) => ({
    ...app,
    localizedJob: localizeJob(app.job),
  })),
)

const filteredEmployerApplications = computed(() => {
  const q = applicantSearch.value.trim().toLowerCase()
  return localizedEmployerApplications.value.filter((app) => {
    if (roleFilter.value !== 'all' && app.jobId !== roleFilter.value) {
      return false
    }
    if (statusFilter.value !== 'all' && app.status !== statusFilter.value) {
      return false
    }
    if (q) {
      const searchable = [app.fullName, app.email, app.telegram, app.localizedJob?.displayTitle]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
})

const activePipelineCount = computed(() => {
  return employerApplications.value.filter(
    (app) => app.status === 'Shortlisted' || app.status === 'Interview',
  ).length
})

const openRoleCount = computed(
  () => employerJobs.value.filter((job) => job.listingStatus !== 'paused').length,
)

function applicantCountLabel(jobId) {
  const count = employerApplications.value.filter((app) => app.jobId === jobId).length
  return formatCount(
    count,
    t('employer.applicantSingular'),
    t('employer.applicantPlural'),
    t('employer.applicantPlural'),
  )
}

async function handleStatusChange(appId, status) {
  await updateApplicationStatus(appId, status)
  toastStore.showToast({
    title: t('toasts.statusUpdated', { status: tStatus(status) }),
    tone: 'success',
  })
}

async function handleSaveNote(appId) {
  await updateApplicationNote(appId, noteDrafts[appId] || '')
  toastStore.showToast({
    title: t('employer.noteSavedToast'),
    tone: 'success',
  })
}

async function handleToggleJobStatus(job) {
  const updated = await toggleJobStatus(job.id)
  if (!updated) return
  toastStore.showToast({
    title:
      updated.listingStatus === 'paused'
        ? t('employer.jobPausedToast')
        : t('employer.jobReopenedToast'),
    description: job.displayTitle,
    tone: 'default',
  })
}

async function handleDeleteJob(job) {
  await deleteJobPosting(job.id)
  toastStore.showToast({
    title: t('employer.jobDeletedToast'),
    description: job.displayTitle,
    tone: 'warning',
  })
}
</script>

<template>
  <section aria-labelledby="employer-heading">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span
            class="rounded-md bg-zinc-200/70 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {{ t('employer.workspaceBadge') }}
          </span>
        </div>
        <h1
          id="employer-heading"
          class="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
        >
          {{ currentUser?.companyName || t('employer.defaultTitle') }}
        </h1>
        <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('employer.subtitle') }}
        </p>
      </div>

      <BaseButton variant="primary" @click="openPostJobModal">
        <svg
          class="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {{ t('employer.postNewJob') }}
      </BaseButton>
    </div>

    <!-- 3 Compact Stat Cards -->
    <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div
        class="rounded-2xl bg-white p-4 ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {{ t('employer.openRoles') }}
        </div>
        <div class="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {{ openRoleCount }}
        </div>
      </div>

      <div
        class="rounded-2xl bg-white p-4 ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {{ t('employer.totalApplicants') }}
        </div>
        <div class="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {{ employerApplications.length }}
        </div>
      </div>

      <div
        class="rounded-2xl bg-white p-4 ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {{ t('employer.shortlistedInterview') }}
        </div>
        <div class="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {{ activePipelineCount }}
        </div>
      </div>
    </div>

    <!-- Section Switcher -->
    <div class="mt-6 flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
      <button
        type="button"
        :aria-pressed="activeTab === 'applicants'"
        :class="[
          'tab-btn inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-sm font-medium select-none',
          activeTab === 'applicants'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
        ]"
        @click="activeTab = 'applicants'"
      >
        <span>{{ t('employer.incomingApplicants') }}</span>
        <span class="text-xs tabular-nums opacity-80">{{ employerApplications.length }}</span>
      </button>

      <button
        type="button"
        :aria-pressed="activeTab === 'jobs'"
        :class="[
          'tab-btn inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-sm font-medium select-none',
          activeTab === 'jobs'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
        ]"
        @click="activeTab = 'jobs'"
      >
        <span>{{ t('employer.publishedJobs') }}</span>
        <span class="text-xs tabular-nums opacity-80">{{ employerJobs.length }}</span>
      </button>
    </div>

    <!-- Incoming Applicants -->
    <div v-if="activeTab === 'applicants'" class="mt-5">
      <div
        v-if="localizedEmployerApplications.length > 0"
        class="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_200px_180px]"
      >
        <input
          v-model="applicantSearch"
          type="search"
          :placeholder="t('employer.searchApplicantsPlaceholder')"
          :aria-label="t('employer.searchApplicantsPlaceholder')"
          class="employer-input h-10 rounded-lg bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <BaseSelect
          id="employer-role-filter"
          v-model="roleFilter"
          :label="t('employer.filterByRole')"
          hide-label
          :options="roleFilterOptions"
        />
        <BaseSelect
          id="employer-status-filter"
          v-model="statusFilter"
          :label="t('employer.filterByStatus')"
          hide-label
          :options="statusFilterOptions"
        />
      </div>

      <div
        v-if="localizedEmployerApplications.length === 0"
        class="rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('employer.noApplicantsTitle') }}
        </h2>
        <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('employer.noApplicantsSub') }}
        </p>
        <div class="mt-5">
          <BaseButton variant="primary" @click="openPostJobModal">
            {{ t('employer.postNewJob') }}
          </BaseButton>
        </div>
      </div>

      <div
        v-else-if="filteredEmployerApplications.length === 0"
        class="rounded-2xl bg-white p-8 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('board.noMatchingTitle') }}
        </p>
        <div class="mt-4">
          <BaseButton
            variant="secondary"
            @click="
              () => {
                applicantSearch = ''
                roleFilter = 'all'
                statusFilter = 'all'
              }
            "
          >
            {{ t('board.resetAllFilters') }}
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          v-for="app in filteredEmployerApplications"
          :key="app.id"
          class="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {{ app.fullName }}
                </h2>
                <span class="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
                  · {{ tPosted(app.appliedAt) }}
                </span>
              </div>

              <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {{ t('employer.appliedFor') }}
                <span class="font-medium text-zinc-800 dark:text-zinc-200">{{
                  app.localizedJob?.displayTitle
                }}</span>
              </p>

              <div
                class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 tabular-nums dark:text-zinc-400"
              >
                <span>{{ app.email }}</span>
                <span>{{ app.phone }}</span>
                <span v-if="app.telegram" class="font-medium text-zinc-700 dark:text-zinc-300">
                  Telegram: {{ app.telegram }}
                </span>
              </div>
            </div>

            <div class="w-full shrink-0 sm:w-48">
              <BaseSelect
                :id="`status-${app.id}`"
                :model-value="app.status"
                :label="t('employer.candidateStatus')"
                hide-label
                :options="statusOptions"
                @update:model-value="handleStatusChange(app.id, $event)"
              />
            </div>
          </div>

          <p
            v-if="app.coverNote"
            class="mt-3 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            {{ app.coverNote }}
          </p>

          <!-- Attached Portfolio Projects -->
          <div
            v-if="app.portfolioProjects?.length > 0"
            class="mt-3 rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
          >
            <div
              class="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
            >
              {{ t('employer.candidateProjectsTitle') }}
            </div>
            <ul class="mt-2 space-y-2.5">
              <li
                v-for="proj in app.portfolioProjects"
                :key="proj.id"
                class="rounded-lg bg-white p-2.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-900/90 dark:ring-white/[0.06]"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="min-w-0">
                    <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ proj.title }}
                    </span>
                    <span
                      v-if="proj.role"
                      class="ml-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"
                    >
                      · {{ proj.role }}
                    </span>
                  </div>
                  <a
                    v-if="proj.url"
                    :href="proj.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="tactile-text-btn shrink-0 text-[11px] font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-200 dark:decoration-zinc-700"
                  >
                    {{ t('profile.visitProject') }} ↗
                  </a>
                </div>
                <p
                  v-if="proj.description"
                  class="mt-1 max-w-[65ch] text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {{ proj.description }}
                </p>
                <div v-if="proj.techStack?.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                  <span
                    v-for="(tag, idx) in proj.techStack"
                    :key="idx"
                    class="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ tag }}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Inline Hiring Note Form -->
          <form class="mt-3 flex gap-2" @submit.prevent="handleSaveNote(app.id)">
            <input
              v-model="noteDrafts[app.id]"
              type="text"
              :aria-label="t('employer.hiringNoteLabel')"
              :placeholder="t('employer.hiringNotePlaceholder')"
              class="employer-input h-9 min-w-0 flex-1 rounded-lg bg-zinc-50 px-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <BaseButton type="submit" variant="secondary">
              {{ t('employer.saveNoteBtn') }}
            </BaseButton>
          </form>

          <div
            class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800/80"
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
                class="tactile-text-btn inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <span>{{ t('employer.portfolioLinkBtn') }}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <button
              v-if="app.localizedJob"
              type="button"
              class="tactile-text-btn cursor-pointer text-xs font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-400 dark:decoration-zinc-700"
              @click="openJobDetail(app.localizedJob.id)"
            >
              {{ t('employer.viewJobPost') }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- Published Jobs -->
    <div v-else class="mt-5">
      <div
        v-if="localizedEmployerJobs.length === 0"
        class="rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('employer.noPublishedTitle') }}
        </h2>
        <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('employer.noPublishedSub') }}
        </p>
        <div class="mt-5">
          <BaseButton variant="primary" @click="openPostJobModal">
            {{ t('employer.postNewJob') }}
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          v-for="job in localizedEmployerJobs"
          :key="job.id"
          class="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div
                class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
              >
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
                    job.listingStatus === 'paused'
                      ? 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
                  ]"
                >
                  {{
                    job.listingStatus === 'paused'
                      ? t('employer.statusPaused')
                      : t('employer.statusOpen')
                  }}
                </span>
                <span>{{ tCategory(job.category) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ tLocation(job.location) }} ({{ job.displayDistrict }})</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">{{ tPosted(job.postedLabel) }}</span>
              </div>
              <h2 class="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {{ job.displayTitle }}
              </h2>
              <p class="mt-1 text-sm font-medium text-zinc-700 tabular-nums dark:text-zinc-300">
                {{ formatSalaryRange(job.salaryMin, job.salaryMax, job.currency, displayCurrency) }}
                <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  {{ t('board.perMonth') }}
                </span>
              </p>
            </div>

            <span
              class="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300"
            >
              {{ applicantCountLabel(job.id) }}
            </span>
          </div>

          <div
            class="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800/80"
          >
            <BaseButton variant="secondary" @click="openEditJobModal(job.id)">
              {{ t('employer.editJob') }}
            </BaseButton>
            <BaseButton variant="secondary" @click="handleToggleJobStatus(job)">
              {{
                job.listingStatus === 'paused' ? t('employer.reopenJob') : t('employer.pauseJob')
              }}
            </BaseButton>
            <BaseButton variant="secondary" @click="openJobDetail(job.id)">
              {{ t('employer.preview') }}
            </BaseButton>
            <BaseButton variant="ghost" @click="handleDeleteJob(job)">
              {{ t('employer.deleteJob') }}
            </BaseButton>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.employer-input {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out);
}

.employer-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.tab-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.tab-btn:active,
.tab-btn[data-pressed='true'] {
  transform: scale(0.965);
  transition-duration: 90ms;
}

.tab-btn[aria-pressed='false']:active,
.tab-btn[aria-pressed='false'][data-pressed='true'] {
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
}

@media (hover: hover) and (pointer: fine) {
  .employer-input:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }

  .tab-btn[aria-pressed='false']:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
