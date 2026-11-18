<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  CAMBODIA_LOCATIONS,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_MODES,
} from '@/data/cambodiaJobs'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useProfileStore } from '@/stores/profile'
import { useToastStore } from '@/stores/toast'
import { formatMoney } from '@/utils/currency'

const { t, tLocation, tCategory, tWorkMode, tJobType, tExperience, formatCount } = useI18n()
const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const jobsStore = useJobsStore()
const profileStore = useProfileStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { filters, filteredJobs, activeFilterCount } = storeToRefs(jobsStore)
const { resetFilters } = jobsStore

const mobileFiltersOpen = ref(false)
const alertChannel = ref(profileStore.profile.telegram || authStore.currentUser?.email || '')

const locationOptions = computed(() =>
  CAMBODIA_LOCATIONS.map((value) => ({ value, label: tLocation(value) })),
)

const workModeOptions = computed(() =>
  WORK_MODES.map((value) => ({ value, label: tWorkMode(value) })),
)

const jobTypeOptions = computed(() => [
  { value: 'All types', label: t('board.allTypes') },
  ...JOB_TYPES.map((value) => ({ value, label: tJobType(value) })),
])

const experienceOptions = computed(() =>
  EXPERIENCE_LEVELS.map((value) => ({ value, label: tExperience(value) })),
)

const salaryOptions = computed(() => {
  const cur = displayCurrency.value
  const c500 = formatMoney(cur === 'KHR' ? 2000000 : 500, cur)
  const c1000 = formatMoney(cur === 'KHR' ? 4000000 : 1000, cur)
  const c2000 = formatMoney(cur === 'KHR' ? 8000000 : 2000, cur)

  return [
    { value: 'any', label: t('board.anySalary') },
    { value: 'under-500', label: t('board.underAmount', { amount: c500 }) },
    { value: '500-1000', label: `${c500} – ${c1000}` },
    { value: '1000-2000', label: `${c1000} – ${c2000}` },
    { value: '2000-plus', label: `${c2000}+` },
  ]
})

const resultLabel = computed(() =>
  formatCount(
    filteredJobs.value.length,
    t('board.openJobSingular'),
    t('board.openJobPlural'),
    t('board.openJobPlural'),
  ),
)

async function handleSaveAlert() {
  const channel = alertChannel.value.trim()
  if (!channel) {
    toastStore.showToast({
      title: t('board.alertEmptyChannel'),
      tone: 'warning',
    })
    return
  }

  await profileStore.addJobAlert({
    category: filters.value.category,
    location: filters.value.location,
    channel,
  })

  toastStore.showToast({
    title: t('board.alertSavedToast', { location: tLocation(filters.value.location) }),
    description: `${tCategory(filters.value.category)} · ${channel}`,
    tone: 'success',
  })
}
</script>

<template>
  <aside
    :aria-label="t('board.searchLabel')"
    class="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.06)] ring-1 ring-zinc-950/[0.07] sm:p-5 dark:bg-zinc-900/90 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] dark:ring-white/[0.08]"
  >
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <svg
          class="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="21" x2="14" y1="4" y2="4" />
          <line x1="10" x2="3" y1="4" y2="4" />
          <line x1="21" x2="12" y1="12" y2="12" />
          <line x1="8" x2="3" y1="12" y2="12" />
          <line x1="21" x2="16" y1="20" y2="20" />
          <line x1="12" x2="3" y1="20" y2="20" />
          <line x1="14" x2="14" y1="2" y2="6" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="16" x2="16" y1="18" y2="22" />
        </svg>
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('board.filtersTitle') }}
        </h2>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          v-if="activeFilterCount > 0"
          type="button"
          class="reset-btn inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:focus-visible:outline-zinc-200"
          @click="resetFilters"
        >
          <span>{{ t('board.resetFilters') }}</span>
          <span
            class="rounded-full bg-zinc-200/80 px-1.5 py-0.5 text-[10px] leading-none text-zinc-800 tabular-nums dark:bg-zinc-800 dark:text-zinc-200"
          >
            {{ activeFilterCount }}
          </span>
        </button>

        <button
          type="button"
          class="mobile-filter-btn inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 text-xs font-medium text-zinc-700 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 lg:hidden dark:bg-zinc-800 dark:text-zinc-200 dark:focus-visible:outline-zinc-200"
          :aria-expanded="mobileFiltersOpen"
          @click="mobileFiltersOpen = !mobileFiltersOpen"
        >
          <span>{{ t('board.toggleFilters') }}</span>
          <svg
            class="mobile-filter-chevron h-3.5 w-3.5 shrink-0"
            :style="{ transform: mobileFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Input (Always Visible) -->
    <div class="relative mt-3.5">
      <svg
        class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 shrink-0 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        id="job-search-input"
        v-model="filters.query"
        type="search"
        enterkeyhint="search"
        :placeholder="t('board.searchSidebarPlaceholder')"
        :aria-label="t('board.searchLabel')"
        class="search-input block h-10 w-full rounded-xl bg-white pr-9 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />

      <button
        v-if="filters.query"
        type="button"
        :aria-label="t('board.clearSearch')"
        class="clear-btn absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-400 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-500 dark:focus-visible:outline-zinc-200"
        @click="filters.query = ''"
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <!-- Vertical Filter Body -->
    <div :class="mobileFiltersOpen ? 'mt-4 block space-y-4' : 'mt-4 hidden space-y-4 lg:block'">
      <!-- Wrapped Industry Pills -->
      <div>
        <div class="mb-2 text-xs font-medium text-zinc-700 select-none dark:text-zinc-300">
          {{ t('postModal.industry') }}
        </div>
        <div class="flex flex-wrap gap-1.5" role="group" :aria-label="t('postModal.industry')">
          <button
            v-for="category in JOB_CATEGORIES"
            :key="category"
            type="button"
            :aria-pressed="filters.category === category"
            :class="[
              'category-chip inline-flex h-7 cursor-pointer items-center rounded-full px-2.5 text-xs font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
              filters.category === category
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300',
            ]"
            @click="filters.category = category"
          >
            {{ tCategory(category) }}
          </button>
        </div>
      </div>

      <!-- Stacked Labeled Selects -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <BaseSelect
          id="filter-location"
          v-model="filters.location"
          :label="t('board.locationLabel')"
          :options="locationOptions"
        />
        <BaseSelect
          id="filter-work-mode"
          v-model="filters.workMode"
          :label="t('board.workModeLabel')"
          :options="workModeOptions"
        />
        <BaseSelect
          id="filter-job-type"
          v-model="filters.jobType"
          :label="t('board.jobTypeLabel')"
          :options="jobTypeOptions"
        />
        <BaseSelect
          id="filter-experience"
          v-model="filters.experienceLevel"
          :label="t('board.experienceLabel')"
          :options="experienceOptions"
        />
        <BaseSelect
          id="filter-salary"
          v-model="filters.salaryBracket"
          :label="t('board.salaryLabel')"
          :options="salaryOptions"
        />
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="mt-4 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800/80">
      <p class="font-medium text-zinc-600 tabular-nums dark:text-zinc-400">
        {{ t('board.showingPrefix') }}
        <span class="text-zinc-900 dark:text-zinc-100">{{ resultLabel }}</span>
      </p>

      <!-- Quick Job Alert Box -->
      <form
        class="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
        @submit.prevent="handleSaveAlert"
      >
        <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {{ t('board.alertCardTitle') }}
        </div>
        <p class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {{
            t('board.alertCardSub', {
              category: tCategory(filters.category),
              location: tLocation(filters.location),
            })
          }}
        </p>
        <div class="mt-2 flex gap-1.5">
          <input
            v-model="alertChannel"
            type="text"
            :placeholder="t('board.alertChannelPlaceholder')"
            :aria-label="t('board.alertChannelPlaceholder')"
            class="search-input h-8 min-w-0 flex-1 rounded-lg bg-white px-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            class="alert-save-btn inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-2.5 text-xs font-medium text-white select-none dark:bg-zinc-100 dark:text-zinc-900"
          >
            {{ t('board.alertSaveBtn') }}
          </button>
        </div>
      </form>
    </div>
  </aside>
</template>

<style scoped>
.search-input {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out),
    background-color 160ms var(--ease-out);
}

.search-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.mobile-filter-chevron {
  transition: transform 160ms var(--ease-out);
}

.mobile-filter-btn,
.category-chip,
.clear-btn,
.reset-btn,
.alert-save-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.mobile-filter-btn:active,
.mobile-filter-btn[data-pressed='true'],
.category-chip:active,
.category-chip[data-pressed='true'],
.reset-btn:active,
.reset-btn[data-pressed='true'],
.alert-save-btn:active,
.alert-save-btn[data-pressed='true'] {
  transform: scale(0.95);
  transition-duration: 90ms;
}

.clear-btn:active,
.clear-btn[data-pressed='true'] {
  transform: scale(0.92);
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
  transition-duration: 90ms;
}

.mobile-filter-btn:active,
.mobile-filter-btn[data-pressed='true'],
.category-chip[aria-pressed='false']:active,
.category-chip[aria-pressed='false'][data-pressed='true'],
.reset-btn:active,
.reset-btn[data-pressed='true'] {
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
}

@media (hover: hover) and (pointer: fine) {
  .search-input:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }

  .category-chip[aria-pressed='false']:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }

  .mobile-filter-btn:hover,
  .clear-btn:hover,
  .reset-btn:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
