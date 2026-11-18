<script setup>
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
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
import { useToastStore } from '@/stores/toast'
import { formatSecondaryEquivalent } from '@/utils/currency'

const { t, tCategory, tLocation, tWorkMode, tJobType, tExperience } = useI18n()

const authStore = useAuthStore()
const jobsStore = useJobsStore()
const toastStore = useToastStore()

const { currentUser } = storeToRefs(authStore)
const { isPostJobModalOpen, editingJob } = storeToRefs(jobsStore)
const { closePostJobModal, createJobPosting, updateJobPosting } = jobsStore

const categoryOptions = computed(() =>
  JOB_CATEGORIES.filter((c) => c !== 'All industries').map((value) => ({
    value,
    label: tCategory(value),
  })),
)

const locationOptions = computed(() =>
  CAMBODIA_LOCATIONS.filter((l) => l !== 'All locations').map((value) => ({
    value,
    label: tLocation(value),
  })),
)

const workModeOptions = computed(() =>
  WORK_MODES.filter((w) => w !== 'All modes').map((value) => ({
    value,
    label: tWorkMode(value),
  })),
)

const jobTypeOptions = computed(() =>
  JOB_TYPES.map((value) => ({
    value,
    label: tJobType(value),
  })),
)

const experienceOptions = computed(() =>
  EXPERIENCE_LEVELS.filter((e) => e !== 'All levels').map((value) => ({
    value,
    label: tExperience(value),
  })),
)

const currencyOptions = computed(() => [
  { value: 'USD', label: t('postModal.usdOption') },
  { value: 'KHR', label: t('postModal.khrOption') },
])

const isSaving = ref(false)
const isEditMode = computed(() => Boolean(editingJob.value))

const form = reactive({
  title: '',
  company: '',
  category: 'Tech & IT',
  location: 'Phnom Penh',
  district: '',
  workMode: 'Hybrid',
  jobType: 'Full-time',
  experienceLevel: 'Mid-level',
  currency: 'USD',
  salaryMin: '800',
  salaryMax: '1200',
  summary: '',
  requirementsText: '',
  benefitsText: '',
})

const errors = reactive({
  title: '',
  company: '',
  salary: '',
  summary: '',
})

const secondaryEquivalent = computed(() => {
  const min = Number(form.salaryMin)
  const max = Number(form.salaryMax)
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) {
    return ''
  }
  return formatSecondaryEquivalent(min, max, form.currency, form.currency)
})

function resetForm() {
  const source = editingJob.value
  if (source) {
    form.title = source.title || ''
    form.company = source.company || currentUser.value?.companyName || ''
    form.category = source.category || 'Tech & IT'
    form.location = source.location || 'Phnom Penh'
    form.district = source.district || ''
    form.workMode = source.workMode || 'Hybrid'
    form.jobType = source.jobType || 'Full-time'
    form.experienceLevel = source.experienceLevel || 'Mid-level'
    form.currency = source.currency || 'USD'
    form.salaryMin = String(source.salaryMin || 800)
    form.salaryMax = String(source.salaryMax || 1200)
    form.summary = source.summary || ''
    form.requirementsText = (source.requirements || []).join('\n')
    form.benefitsText = (source.benefits || []).join('\n')
  } else {
    form.title = ''
    form.company = currentUser.value?.companyName || ''
    form.category = 'Tech & IT'
    form.location = 'Phnom Penh'
    form.district = ''
    form.workMode = 'Hybrid'
    form.jobType = 'Full-time'
    form.experienceLevel = 'Mid-level'
    form.currency = 'USD'
    form.salaryMin = '800'
    form.salaryMax = '1200'
    form.summary = ''
    form.requirementsText = ''
    form.benefitsText = ''
  }
  errors.title = ''
  errors.company = ''
  errors.salary = ''
  errors.summary = ''
}

function handleCurrencyChange(newCurrency) {
  if (newCurrency === 'KHR' && form.currency === 'USD') {
    form.salaryMin = String((Number(form.salaryMin) || 500) * 4000)
    form.salaryMax = String((Number(form.salaryMax) || 900) * 4000)
  } else if (newCurrency === 'USD' && form.currency === 'KHR') {
    form.salaryMin = String(Math.max(100, Math.round((Number(form.salaryMin) || 2000000) / 4000)))
    form.salaryMax = String(Math.max(200, Math.round((Number(form.salaryMax) || 3600000) / 4000)))
  }
  form.currency = newCurrency
}

async function handleSubmit() {
  if (isSaving.value) return

  errors.title = ''
  errors.company = ''
  errors.salary = ''
  errors.summary = ''

  let valid = true
  if (!form.title.trim()) {
    errors.title = 'errTitle'
    valid = false
  }
  if (!form.company.trim()) {
    errors.company = 'errCompany'
    valid = false
  }

  const min = Number(form.salaryMin)
  const max = Number(form.salaryMax)
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) {
    errors.salary = 'errSalary'
    valid = false
  }

  if (!form.summary.trim()) {
    errors.summary = 'errSummary'
    valid = false
  }

  if (!valid) return

  isSaving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const parsedRequirements = form.requirementsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const parsedBenefits = form.benefitsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const payload = {
      title: form.title,
      company: form.company,
      category: form.category,
      location: form.location,
      district: form.district,
      workMode: form.workMode,
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      currency: form.currency,
      salaryMin: min,
      salaryMax: max,
      summary: form.summary,
      requirements: parsedRequirements,
      benefits: parsedBenefits,
    }

    if (editingJob.value) {
      await updateJobPosting(editingJob.value.id, payload)
      toastStore.showToast({
        title: t('employer.jobSavedToast'),
        description: form.title.trim(),
        tone: 'success',
      })
    } else {
      await createJobPosting(payload)
      toastStore.showToast({
        title: t('employer.jobCreatedToast'),
        description: form.title.trim(),
        tone: 'success',
      })
    }

    closePostJobModal()
  } finally {
    isSaving.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && isPostJobModalOpen.value) {
    closePostJobModal()
  }
}

watch(
  isPostJobModalOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('overlay-open')
        window.addEventListener('keydown', onKeydown)
      }
    } else if (typeof document !== 'undefined') {
      if (!jobsStore.selectedJob) {
        document.documentElement.classList.remove('overlay-open')
      }
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    if (!jobsStore.selectedJob) {
      document.documentElement.classList.remove('overlay-open')
    }
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" :duration="{ enter: 220, leave: 150 }">
      <div
        v-if="isPostJobModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-heading"
      >
        <div
          class="modal-backdrop fixed inset-0 bg-zinc-950/50 dark:bg-black/72"
          @click="closePostJobModal"
        />

        <div
          class="modal-pop relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-950/[0.08] dark:bg-zinc-900 dark:ring-white/[0.09]"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4 sm:px-6 dark:border-zinc-800"
          >
            <div>
              <h2
                id="post-job-heading"
                class="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
              >
                {{ isEditMode ? t('postModal.editTitle') : t('postModal.title') }}
              </h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ isEditMode ? t('postModal.editSubtitle') : t('postModal.subtitle') }}
              </p>
            </div>

            <button
              type="button"
              :aria-label="t('postModal.closeAria')"
              class="modal-close-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 select-none dark:text-zinc-400"
              @click="closePostJobModal"
            >
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form
            class="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6"
            @submit.prevent="handleSubmit"
          >
            <BaseInput
              id="post-job-title"
              v-model="form.title"
              :label="t('postModal.jobTitle')"
              :placeholder="t('postModal.jobTitlePlaceholder')"
              :error="errors.title ? t(`postModal.${errors.title}`) : ''"
              @update:model-value="errors.title = ''"
            />

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BaseInput
                id="post-job-company"
                v-model="form.company"
                :label="t('postModal.companyName')"
                :placeholder="t('postModal.companyPlaceholder')"
                :error="errors.company ? t(`postModal.${errors.company}`) : ''"
                @update:model-value="errors.company = ''"
              />

              <BaseSelect
                id="post-job-category"
                v-model="form.category"
                :label="t('postModal.industry')"
                :options="categoryOptions"
              />
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BaseSelect
                id="post-job-location"
                v-model="form.location"
                :label="t('postModal.provinceCity')"
                :options="locationOptions"
              />

              <BaseInput
                id="post-job-district"
                v-model="form.district"
                :label="t('postModal.districtArea')"
                :placeholder="t('postModal.districtPlaceholder')"
              />
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <BaseSelect
                id="post-job-mode"
                v-model="form.workMode"
                :label="t('postModal.workMode')"
                :options="workModeOptions"
              />

              <BaseSelect
                id="post-job-type"
                v-model="form.jobType"
                :label="t('postModal.jobType')"
                :options="jobTypeOptions"
              />

              <BaseSelect
                id="post-job-level"
                v-model="form.experienceLevel"
                :label="t('postModal.experienceLevel')"
                :options="experienceOptions"
              />
            </div>

            <!-- Salary & Dual Currency Equivalent -->
            <div
              class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <BaseSelect
                  id="post-job-currency"
                  :model-value="form.currency"
                  :label="t('postModal.currency')"
                  :options="currencyOptions"
                  @update:model-value="handleCurrencyChange"
                />

                <BaseInput
                  id="post-job-min"
                  v-model="form.salaryMin"
                  :label="t('postModal.minMonth')"
                  type="text"
                  inputmode="numeric"
                  placeholder="800"
                  @update:model-value="errors.salary = ''"
                />

                <BaseInput
                  id="post-job-max"
                  v-model="form.salaryMax"
                  :label="t('postModal.maxMonth')"
                  type="text"
                  inputmode="numeric"
                  placeholder="1200"
                  @update:model-value="errors.salary = ''"
                />
              </div>

              <p
                v-if="secondaryEquivalent"
                class="mt-2 text-xs text-zinc-500 tabular-nums dark:text-zinc-400"
              >
                {{ t('postModal.equivalentPrefix') }} {{ secondaryEquivalent }}
                {{ t('postModal.equivalentRateNote') }}
              </p>
              <p
                v-if="errors.salary"
                role="alert"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ t(`postModal.${errors.salary}`) }}
              </p>
            </div>

            <div>
              <label
                for="post-job-summary"
                class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
              >
                {{ t('postModal.roleSummary') }}
              </label>
              <textarea
                id="post-job-summary"
                v-model="form.summary"
                rows="2"
                :placeholder="t('postModal.roleSummaryPlaceholder')"
                class="modal-textarea mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                @input="errors.summary = ''"
              />
              <p
                v-if="errors.summary"
                role="alert"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ t(`postModal.${errors.summary}`) }}
              </p>
            </div>

            <div>
              <label
                for="post-job-reqs"
                class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
              >
                {{ t('postModal.requirementsLabel') }}
              </label>
              <textarea
                id="post-job-reqs"
                v-model="form.requirementsText"
                rows="3"
                :placeholder="t('postModal.requirementsPlaceholder')"
                class="modal-textarea mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label
                for="post-job-benefits"
                class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
              >
                {{ t('postModal.benefitsLabel') }}
              </label>
              <textarea
                id="post-job-benefits"
                v-model="form.benefitsText"
                rows="2"
                :placeholder="t('postModal.benefitsPlaceholder')"
                class="modal-textarea mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            <div
              class="flex items-center justify-end gap-2.5 border-t border-zinc-200/80 pt-4 dark:border-zinc-800"
            >
              <BaseButton variant="secondary" @click="closePostJobModal">
                {{ t('postModal.cancel') }}
              </BaseButton>
              <BaseButton type="submit" variant="primary" :loading="isSaving">
                {{ isEditMode ? t('postModal.saveChanges') : t('postModal.publishJob') }}
                <template #loading>{{
                  isEditMode ? t('postModal.savingChanges') : t('postModal.publishing')
                }}</template>
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-textarea {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out);
}

.modal-textarea:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.modal-close-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.modal-close-btn:active,
.modal-close-btn[data-pressed='true'] {
  transform: scale(0.93);
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .modal-textarea:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }

  .modal-close-btn:hover:not(:active):not([data-pressed='true']) {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}

.modal-backdrop {
  will-change: opacity;
}

.modal-enter-active .modal-backdrop {
  transition: opacity 220ms var(--ease-out);
}

.modal-leave-active .modal-backdrop {
  transition: opacity 150ms var(--ease-out);
}

.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-pop {
  transform-origin: center;
  will-change: transform, opacity;
  contain: layout style paint;
}

.modal-enter-active .modal-pop {
  transition:
    opacity 220ms var(--ease-out),
    transform 220ms var(--ease-out);
}

.modal-leave-active .modal-pop {
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out);
}

.modal-enter-from .modal-pop,
.modal-leave-to .modal-pop {
  opacity: 0;
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-from .modal-pop,
  .modal-leave-to .modal-pop {
    transform: none;
  }
}
</style>
