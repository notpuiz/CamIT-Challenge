<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import JobCard from '@/components/jobs/JobCard.vue'
import JobFilterBar from '@/components/jobs/JobFilterBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useI18n } from '@/i18n/useI18n'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { formatMoney } from '@/utils/currency'

const route = useRoute()
const { t, tCategory, tLocation, tWorkMode, tJobType, tExperience, formatCount } = useI18n()
const jobsStore = useJobsStore()
const preferencesStore = usePreferencesStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { jobs, filters, filteredJobs, selectedJobId } = storeToRefs(jobsStore)
const { closeJobDetail, openJobDetail, resetFilters } = jobsStore

const sortOptions = computed(() => [
  { value: 'newest', label: t('board.sortNewest') },
  { value: 'salary-desc', label: t('board.sortSalaryHigh') },
  { value: 'salary-asc', label: t('board.sortSalaryLow') },
])

const resultLabel = computed(() =>
  formatCount(
    filteredJobs.value.length,
    t('board.openJobSingular'),
    t('board.openJobPlural'),
    t('board.openJobPlural'),
  ),
)

const salaryChipLabel = computed(() => {
  const cur = displayCurrency.value
  const c500 = formatMoney(cur === 'KHR' ? 2000000 : 500, cur)
  const c1000 = formatMoney(cur === 'KHR' ? 4000000 : 1000, cur)
  const c2000 = formatMoney(cur === 'KHR' ? 8000000 : 2000, cur)

  if (filters.value.salaryBracket === 'under-500') {
    return t('board.underAmount', { amount: c500 })
  }
  if (filters.value.salaryBracket === '500-1000') return `${c500} – ${c1000}`
  if (filters.value.salaryBracket === '1000-2000') return `${c1000} – ${c2000}`
  if (filters.value.salaryBracket === '2000-plus') return `${c2000}+`
  return ''
})

const activeChips = computed(() => {
  const chips = []
  if (filters.value.query.trim()) {
    chips.push({ key: 'query', label: `“${filters.value.query.trim()}”` })
  }
  if (filters.value.category !== 'All industries') {
    chips.push({ key: 'category', label: tCategory(filters.value.category) })
  }
  if (filters.value.location !== 'All locations') {
    chips.push({ key: 'location', label: tLocation(filters.value.location) })
  }
  if (filters.value.workMode !== 'All modes') {
    chips.push({ key: 'workMode', label: tWorkMode(filters.value.workMode) })
  }
  if (filters.value.jobType !== 'All types') {
    chips.push({ key: 'jobType', label: tJobType(filters.value.jobType) })
  }
  if (filters.value.experienceLevel !== 'All levels') {
    chips.push({ key: 'experienceLevel', label: tExperience(filters.value.experienceLevel) })
  }
  if (filters.value.salaryBracket !== 'any') {
    chips.push({ key: 'salaryBracket', label: salaryChipLabel.value })
  }
  return chips
})

function clearFilterChip(key) {
  if (key === 'query') filters.value.query = ''
  else if (key === 'category') filters.value.category = 'All industries'
  else if (key === 'location') filters.value.location = 'All locations'
  else if (key === 'workMode') filters.value.workMode = 'All modes'
  else if (key === 'jobType') filters.value.jobType = 'All types'
  else if (key === 'experienceLevel') filters.value.experienceLevel = 'All levels'
  else if (key === 'salaryBracket') filters.value.salaryBracket = 'any'
}

function syncJobFromLocation() {
  if (typeof window === 'undefined') return
  const deepJobId = new URLSearchParams(window.location.search).get('job') || ''
  if (deepJobId && jobs.value.some((j) => j.id === deepJobId)) {
    if (selectedJobId.value !== deepJobId) {
      openJobDetail(deepJobId)
    }
  } else if (!deepJobId && selectedJobId.value) {
    closeJobDetail()
  }
}

onMounted(() => {
  syncJobFromLocation()
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', syncJobFromLocation)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', syncJobFromLocation)
  }
})

watch(
  () => route.query.job,
  (jobId) => {
    if (typeof jobId === 'string' && jobId && jobs.value.some((j) => j.id === jobId)) {
      if (selectedJobId.value !== jobId) {
        openJobDetail(jobId)
      }
    }
  },
)

watch(selectedJobId, (nextJobId) => {
  if (typeof window === 'undefined' || route.name !== 'jobs') return
  const url = new URL(window.location.href)
  const currentQueryJob = url.searchParams.get('job') || ''
  const targetQueryJob = nextJobId || ''
  if (currentQueryJob === targetQueryJob) return

  if (targetQueryJob) {
    url.searchParams.set('job', targetQueryJob)
  } else {
    url.searchParams.delete('job')
  }
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
})
</script>

<template>
  <div
    class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-7"
  >
    <!-- Left Sidebar: Search & Filters -->
    <div class="w-full lg:sticky lg:top-20">
      <JobFilterBar />
    </div>

    <!-- Right Content: Heading + Toolbar + Job Listings -->
    <div class="min-w-0">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 sm:text-3xl dark:text-zinc-50"
          >
            {{ t('board.heroTitle') }}
          </h1>
          <p class="mt-1.5 max-w-[65ch] text-sm text-zinc-600 dark:text-zinc-400">
            {{ t('board.heroSubtitle') }}
          </p>
        </div>

        <div class="w-full shrink-0 sm:w-52">
          <BaseSelect
            id="jobs-sort-select"
            v-model="filters.sortBy"
            :label="t('board.sortByLabel')"
            hide-label
            :options="sortOptions"
          />
        </div>
      </div>

      <!-- Active Filter Chips & Result Count -->
      <div v-if="activeChips.length > 0" class="mb-4 flex flex-wrap items-center gap-1.5">
        <span class="mr-1 text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
          {{ t('board.showingPrefix') }} {{ resultLabel }}
        </span>
        <button
          v-for="chip in activeChips"
          :key="chip.key"
          type="button"
          :aria-label="t('board.clearChipAria', { label: chip.label })"
          class="chip-remove inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-950/10 select-none dark:bg-zinc-900 dark:text-zinc-200 dark:ring-white/12"
          @click="clearFilterChip(chip.key)"
        >
          <span>{{ chip.label }}</span>
          <span class="text-zinc-400 dark:text-zinc-500" aria-hidden="true">×</span>
        </button>
      </div>

      <div
        v-if="filteredJobs.length === 0"
        class="rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('board.noMatchingTitle') }}
        </h2>
        <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('board.noMatchingSub') }}
        </p>
        <div class="mt-5">
          <BaseButton variant="secondary" @click="resetFilters">
            {{ t('board.resetAllFilters') }}
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <JobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chip-remove {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.chip-remove:active,
.chip-remove[data-pressed='true'] {
  transform: scale(0.95);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .chip-remove:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
