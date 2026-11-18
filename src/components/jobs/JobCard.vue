<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useToastStore } from '@/stores/toast'
import { formatSecondaryEquivalent, formatSalaryRange } from '@/utils/currency'

const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const { t, tLocation, tWorkMode, tJobType, tExperience, tPosted, localizeJob } = useI18n()
const preferencesStore = usePreferencesStore()
const jobsStore = useJobsStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { isJobSaved, toggleSaveJob, hasAppliedToJob, openJobDetail } = jobsStore

const localizedJob = computed(() => localizeJob(props.job))
const saved = computed(() => isJobSaved(props.job.id))
const applied = computed(() => hasAppliedToJob(props.job.id))

function handleToggleSave() {
  const nowSaved = toggleSaveJob(props.job.id)
  toastStore.showToast({
    title: nowSaved ? t('toasts.jobSaved') : t('toasts.jobUnsaved'),
    description: localizedJob.value.displayTitle,
    tone: nowSaved ? 'success' : 'default',
  })
}

function openCompanyProfile() {
  router.push({ name: 'companies', query: { company: props.job.companySlug } })
}

const primarySalary = computed(() =>
  formatSalaryRange(
    props.job.salaryMin,
    props.job.salaryMax,
    props.job.currency,
    displayCurrency.value,
  ),
)

const secondarySalary = computed(() =>
  formatSecondaryEquivalent(
    props.job.salaryMin,
    props.job.salaryMax,
    props.job.currency,
    displayCurrency.value,
  ),
)
</script>

<template>
  <article
    data-pressable
    class="job-card group relative flex cursor-pointer flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:bg-zinc-900/90 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
    @click="openJobDetail(job.id)"
  >
    <div>
      <!-- Top Row: Company Avatar + Title + Bookmark -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold tracking-tight text-zinc-800 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
            aria-hidden="true"
          >
            {{ job.companyInitials }}
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="tactile-text-btn cursor-pointer truncate text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
                @click.stop="openCompanyProfile"
              >
                {{ job.company }}
              </button>
              <span class="text-xs text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
              <span class="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
                {{ tPosted(job.postedLabel) }}
              </span>
              <span
                v-if="applied"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20"
              >
                {{ t('board.appliedBadge') }}
              </span>
            </div>

            <h2
              class="mt-0.5 text-base font-semibold tracking-[-0.015em] text-zinc-900 dark:text-zinc-50"
            >
              <button
                type="button"
                class="cursor-pointer rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200"
                @click.stop="openJobDetail(job.id)"
              >
                {{ localizedJob.displayTitle }}
              </button>
            </h2>
          </div>
        </div>

        <button
          type="button"
          :aria-label="
            saved
              ? t('board.unsaveAria', { title: localizedJob.displayTitle })
              : t('board.saveAria', { title: localizedJob.displayTitle })
          "
          :aria-pressed="saved"
          :class="[
            'bookmark-btn inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
            saved
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
          ]"
          @click.stop="handleToggleSave"
        >
          <svg
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            :fill="saved ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      </div>

      <!-- Summary -->
      <p
        class="mt-3 line-clamp-2 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
      >
        {{ localizedJob.displaySummary }}
      </p>

      <!-- Metadata Pills -->
      <div class="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          class="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300"
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
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ tLocation(job.location) }} · {{ localizedJob.displayDistrict }}
        </span>

        <span
          class="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
        >
          {{ tWorkMode(job.workMode) }}
        </span>

        <span
          class="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
        >
          {{ tJobType(job.jobType) }}
        </span>

        <span
          class="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
        >
          {{ tExperience(job.experienceLevel) }}
        </span>
      </div>
    </div>

    <!-- Bottom Salary & Action Row -->
    <div
      class="mt-4 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80"
    >
      <div>
        <div class="text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {{ primarySalary }}
          <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {{ t('board.perMonth') }}
          </span>
        </div>
        <div class="mt-0.5 text-[11px] text-zinc-400 tabular-nums dark:text-zinc-500">
          {{ secondarySalary }}
        </div>
      </div>

      <span
        class="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
      >
        <span>{{ t('board.viewRole') }}</span>
        <svg
          class="view-role-arrow h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </div>
  </article>
</template>

<style scoped>
.job-card {
  contain: layout style;
  border: 1px solid var(--card-border);
  transition:
    border-color 150ms var(--ease-out),
    transform 140ms var(--ease-out);
}

.job-card[data-pressed='true'] {
  transform: scale(0.992);
  transition-duration: 90ms;
}

.bookmark-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.bookmark-btn:active,
.bookmark-btn[data-pressed='true'] {
  transform: scale(0.9);
  transition-duration: 90ms;
}

.view-role-arrow {
  transition: transform 160ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .job-card:hover {
    border-color: var(--card-border-hover);
  }

  .job-card:hover .view-role-arrow {
    transform: translateX(2.5px);
  }

  .bookmark-btn[aria-pressed='false']:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
