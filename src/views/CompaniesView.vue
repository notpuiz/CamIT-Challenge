<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JobCard from '@/components/jobs/JobCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { JOB_CATEGORIES } from '@/data/cambodiaJobs'
import { useI18n } from '@/i18n/useI18n'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { formatSalaryRange } from '@/utils/currency'

const route = useRoute()
const router = useRouter()
const { t, tCategory, tLocation, formatCount, localizeJob } = useI18n()
const jobsStore = useJobsStore()
const preferencesStore = usePreferencesStore()

const { companies } = storeToRefs(jobsStore)
const { displayCurrency } = storeToRefs(preferencesStore)

const query = ref('')
const selectedCategory = ref('All industries')
const selectedSlug = ref(typeof route.query.company === 'string' ? route.query.company : '')

watch(
  () => route.query.company,
  (nextCompany) => {
    selectedSlug.value = typeof nextCompany === 'string' ? nextCompany : ''
  },
)

const categoryOptions = computed(() =>
  JOB_CATEGORIES.map((value) => ({ value, label: tCategory(value) })),
)

const focusedCompany = computed(() => {
  if (!selectedSlug.value) return null
  return companies.value.find((company) => company.slug === selectedSlug.value) || null
})

const filteredCompanies = computed(() => {
  const q = query.value.trim().toLowerCase()
  return companies.value.filter((company) => {
    if (
      selectedCategory.value !== 'All industries' &&
      company.category !== selectedCategory.value
    ) {
      return false
    }
    if (q) {
      const searchable = [
        company.name,
        company.category,
        company.location,
        company.district,
        company.districtKm,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
})

function selectCompany(slug) {
  router.push({ name: 'companies', query: { company: slug } })
}

function clearCompanyFilter() {
  router.push({ name: 'companies' })
}

function roleCountLabel(count) {
  return formatCount(
    count,
    t('companies.openRoleSingular'),
    t('companies.openRolePlural'),
    t('companies.openRolePlural'),
  )
}

function companyLocationText(company) {
  const localizedFirst = company.jobs[0] ? localizeJob(company.jobs[0]) : null
  const district = localizedFirst?.displayDistrict || company.district
  return `${tLocation(company.location)} · ${district}`
}

function companyBenefitsList(company) {
  const localizedFirst = company.jobs[0] ? localizeJob(company.jobs[0]) : null
  return (localizedFirst?.displayBenefits || company.benefits || []).slice(0, 2)
}
</script>

<template>
  <section aria-labelledby="companies-heading">
    <!-- Focused Single-Company View -->
    <template v-if="focusedCompany">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            aria-hidden="true"
          >
            {{ focusedCompany.initials }}
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{{ tCategory(focusedCompany.category) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ companyLocationText(focusedCompany) }}</span>
            </div>
            <h1
              id="companies-heading"
              class="mt-0.5 text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
            >
              {{ focusedCompany.name }}
            </h1>
          </div>
        </div>

        <BaseButton variant="secondary" @click="clearCompanyFilter">
          {{ t('companies.clearCompanyFilter') }}
        </BaseButton>
      </div>

      <div
        v-if="companyBenefitsList(focusedCompany).length > 0"
        class="mt-5 flex flex-wrap items-center gap-2"
      >
        <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {{ t('companies.keyBenefits') }}:
        </span>
        <span
          v-for="(benefit, idx) in companyBenefitsList(focusedCompany)"
          :key="idx"
          class="rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {{ benefit }}
        </span>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <JobCard v-for="job in focusedCompany.jobs" :key="job.id" :job="job" />
      </div>
    </template>

    <!-- All Companies Directory -->
    <template v-else>
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1
            id="companies-heading"
            class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
          >
            {{ t('companies.title') }}
          </h1>
          <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('companies.subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-[240px_210px]">
          <input
            v-model="query"
            type="search"
            :placeholder="t('companies.searchPlaceholder')"
            :aria-label="t('companies.searchPlaceholder')"
            class="company-search h-10 rounded-lg bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <BaseSelect
            id="companies-industry-filter"
            v-model="selectedCategory"
            :label="t('postModal.industry')"
            hide-label
            :options="categoryOptions"
          />
        </div>
      </div>

      <div
        v-if="filteredCompanies.length === 0"
        class="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('companies.emptyTitle') }}
        </h2>
        <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('companies.emptySub') }}
        </p>
        <div class="mt-5">
          <BaseButton
            variant="secondary"
            @click="
              () => {
                query = ''
                selectedCategory = 'All industries'
              }
            "
          >
            {{ t('companies.allCompanies') }}
          </BaseButton>
        </div>
      </div>

      <div v-else class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="company in filteredCompanies"
          :key="company.slug"
          class="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div>
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
                  aria-hidden="true"
                >
                  {{ company.initials }}
                </div>
                <div class="min-w-0">
                  <h2 class="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {{ company.name }}
                  </h2>
                  <p class="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {{ tCategory(company.category) }}
                  </p>
                </div>
              </div>

              <span
                class="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300"
              >
                {{ roleCountLabel(company.openCount) }}
              </span>
            </div>

            <div class="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <p>{{ companyLocationText(company) }}</p>
              <p class="font-medium text-zinc-800 tabular-nums dark:text-zinc-200">
                {{ t('companies.salaryRange') }}:
                {{
                  formatSalaryRange(
                    company.minSalaryUsd,
                    company.maxSalaryUsd,
                    'USD',
                    displayCurrency,
                  )
                }}
                {{ t('board.perMonth') }}
              </p>
            </div>

            <ul
              v-if="companyBenefitsList(company).length > 0"
              class="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400"
            >
              <li
                v-for="(benefit, idx) in companyBenefitsList(company)"
                :key="idx"
                class="flex items-start gap-1.5"
              >
                <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-5 border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
            <BaseButton variant="secondary" full-width @click="selectCompany(company.slug)">
              {{ t('companies.viewRoles') }}
            </BaseButton>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.company-search {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out);
}

.company-search:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

@media (hover: hover) and (pointer: fine) {
  .company-search:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }
}
</style>
