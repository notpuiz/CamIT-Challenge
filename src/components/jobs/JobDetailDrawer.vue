<script setup>
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useProfileStore } from '@/stores/profile'
import { useToastStore } from '@/stores/toast'
import { formatSecondaryEquivalent, formatSalaryRange } from '@/utils/currency'

const router = useRouter()
const { t, tCategory, tLocation, tWorkMode, tJobType, tExperience, tPosted, localizeJob } =
  useI18n()

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const jobsStore = useJobsStore()
const profileStore = useProfileStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { currentUser } = storeToRefs(authStore)
const { selectedJob, startInApplyMode } = storeToRefs(jobsStore)
const { profile } = storeToRefs(profileStore)
const { closeJobDetail, isJobSaved, toggleSaveJob, hasAppliedToJob, submitApplication } = jobsStore

const drawerStep = ref('details') // 'details' | 'apply' | 'sent'
const isSubmittingApply = ref(false)
const employerSwitchNotice = ref(false)
const usedProfilePrefill = ref(false)

const applyForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  telegram: '',
  portfolioUrl: '',
  includePortfolioProjects: true,
  cvFileName: '',
  coverNote: '',
})

const applyErrors = reactive({
  fullName: '',
  email: '',
  phone: '',
  cvFileName: '',
})

const localizedJob = computed(() => localizeJob(selectedJob.value))
const isSaved = computed(() => (selectedJob.value ? isJobSaved(selectedJob.value.id) : false))
const alreadyApplied = computed(() =>
  selectedJob.value ? hasAppliedToJob(selectedJob.value.id) : false,
)

const primarySalary = computed(() => {
  if (!selectedJob.value) return ''
  return formatSalaryRange(
    selectedJob.value.salaryMin,
    selectedJob.value.salaryMax,
    selectedJob.value.currency,
    displayCurrency.value,
  )
})

const secondarySalary = computed(() => {
  if (!selectedJob.value) return ''
  return formatSecondaryEquivalent(
    selectedJob.value.salaryMin,
    selectedJob.value.salaryMax,
    selectedJob.value.currency,
    displayCurrency.value,
  )
})

const shareUrl = computed(() => {
  if (!localizedJob.value || typeof window === 'undefined') return ''
  return `${window.location.origin}/?job=${encodeURIComponent(localizedJob.value.id)}`
})

const telegramShareUrl = computed(() => {
  if (!localizedJob.value || !shareUrl.value) return '#'
  const text = `${localizedJob.value.displayTitle} — ${localizedJob.value.company}`
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(text)}`
})

async function copyJobLink() {
  if (!shareUrl.value || typeof navigator === 'undefined') return
  try {
    await navigator.clipboard?.writeText(shareUrl.value)
    toastStore.showToast({
      title: t('drawer.linkCopied'),
      tone: 'success',
    })
  } catch {
    // Ignore clipboard permission denials
  }
}

function handleToggleSave() {
  if (!localizedJob.value) return
  const nowSaved = toggleSaveJob(localizedJob.value.id)
  toastStore.showToast({
    title: nowSaved ? t('toasts.jobSaved') : t('toasts.jobUnsaved'),
    description: localizedJob.value.displayTitle,
    tone: nowSaved ? 'success' : 'default',
  })
}

function openCompanyRoles() {
  if (!localizedJob.value) return
  const slug = localizedJob.value.companySlug
  closeJobDetail()
  router.push({ name: 'companies', query: { company: slug } })
}

function goToPortfolio() {
  closeJobDetail()
  router.push({ name: 'profile' })
}

function resetApplyForm() {
  const canPrefill = currentUser.value?.role === 'seeker'
  applyForm.fullName = (canPrefill ? profile.value.fullName : '') || currentUser.value?.name || ''
  applyForm.email = currentUser.value?.email || ''
  applyForm.phone = (canPrefill ? profile.value.phone : '') || '+855 '
  applyForm.telegram = canPrefill ? profile.value.telegram || '' : ''
  applyForm.portfolioUrl = canPrefill
    ? profile.value.portfolioUrl || profile.value.githubUrl || ''
    : ''
  applyForm.includePortfolioProjects = Boolean(
    canPrefill && profile.value.portfolioProjects?.length > 0,
  )
  applyForm.cvFileName = canPrefill ? profile.value.cvFileName || '' : ''
  applyForm.coverNote = ''
  usedProfilePrefill.value = Boolean(
    canPrefill &&
    (profile.value.cvFileName ||
      profile.value.telegram ||
      profile.value.portfolioUrl ||
      profile.value.portfolioProjects?.length > 0 ||
      (profile.value.phone && profile.value.phone !== '+855 ')),
  )
  applyErrors.fullName = ''
  applyErrors.email = ''
  applyErrors.phone = ''
  applyErrors.cvFileName = ''
}

function goToSeekerAuth() {
  if (!selectedJob.value) return
  const targetJobId = selectedJob.value.id
  authStore.setAuthIntent({
    role: 'seeker',
    mode: 'login',
    redirectPath: '/',
    reopenJobId: targetJobId,
    openApplyOnReturn: true,
  })
  closeJobDetail()
  router.push({ name: 'login', query: { role: 'seeker' } })
}

function handleApplyClick() {
  if (!selectedJob.value) return

  if (!currentUser.value) {
    goToSeekerAuth()
    return
  }

  if (currentUser.value.role === 'employer') {
    employerSwitchNotice.value = true
    return
  }

  resetApplyForm()
  employerSwitchNotice.value = false
  drawerStep.value = 'apply'
}

function handleFileSelect(event) {
  const file = event.target?.files?.[0]
  if (file) {
    applyForm.cvFileName = file.name
    applyErrors.cvFileName = ''
  }
}

function useSampleCv() {
  const safeName = (applyForm.fullName || 'Candidate').trim().replace(/\s+/g, '_')
  applyForm.cvFileName = `${safeName}_CV_2026.pdf`
  applyErrors.cvFileName = ''
}

async function handleSubmitApply() {
  if (!selectedJob.value || isSubmittingApply.value) return

  applyErrors.fullName = ''
  applyErrors.email = ''
  applyErrors.phone = ''
  applyErrors.cvFileName = ''

  let valid = true
  if (!applyForm.fullName.trim()) {
    applyErrors.fullName = 'errFullName'
    valid = false
  }
  if (!applyForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applyForm.email.trim())) {
    applyErrors.email = 'errEmail'
    valid = false
  }
  if (applyForm.phone.replace(/\D/g, '').length < 8) {
    applyErrors.phone = 'errPhone'
    valid = false
  }
  if (!applyForm.cvFileName.trim()) {
    applyErrors.cvFileName = 'errCv'
    valid = false
  }
  if (!valid) return

  isSubmittingApply.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 150))
    await submitApplication({
      jobId: selectedJob.value.id,
      fullName: applyForm.fullName,
      email: applyForm.email,
      phone: applyForm.phone,
      telegram: applyForm.telegram,
      portfolioUrl: applyForm.portfolioUrl,
      portfolioProjects: applyForm.includePortfolioProjects
        ? profile.value.portfolioProjects || []
        : [],
      cvFileName: applyForm.cvFileName,
      coverNote: applyForm.coverNote,
    })
    toastStore.showToast({
      title: t('toasts.applicationSent', { company: selectedJob.value.company }),
      tone: 'success',
    })
    drawerStep.value = 'sent'
  } finally {
    isSubmittingApply.value = false
  }
}

function viewMyApplications() {
  closeJobDetail()
  router.push({ name: 'applications' })
}

function onKeydown(event) {
  if (event.key === 'Escape' && selectedJob.value) {
    closeJobDetail()
  }
}

watch(
  selectedJob,
  (job) => {
    if (job) {
      employerSwitchNotice.value = false
      if (startInApplyMode.value && currentUser.value?.role === 'seeker' && !alreadyApplied.value) {
        resetApplyForm()
        drawerStep.value = 'apply'
      } else {
        drawerStep.value = 'details'
      }
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('overlay-open')
        window.addEventListener('keydown', onKeydown)
      }
    } else if (typeof document !== 'undefined') {
      if (!jobsStore.isPostJobModalOpen) {
        document.documentElement.classList.remove('overlay-open')
      }
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    if (!jobsStore.isPostJobModalOpen) {
      document.documentElement.classList.remove('overlay-open')
    }
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer" :duration="{ enter: 230, leave: 170 }">
      <div
        v-if="localizedJob"
        class="fixed inset-0 z-50 flex justify-end"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`drawer-title-${localizedJob.id}`"
      >
        <!-- Backdrop -->
        <div
          class="drawer-backdrop fixed inset-0 bg-zinc-950/45 dark:bg-black/70"
          @click="closeJobDetail"
        />

        <!-- Slide-over Panel -->
        <div
          class="drawer-panel relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl ring-1 ring-zinc-950/[0.08] dark:bg-zinc-900 dark:ring-white/[0.09]"
        >
          <!-- Top Bar -->
          <div
            class="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 sm:px-6 dark:border-zinc-800"
          >
            <div class="flex items-center gap-2.5">
              <button
                v-if="drawerStep === 'apply'"
                type="button"
                class="drawer-icon-btn inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-medium text-zinc-600 select-none dark:text-zinc-400"
                @click="drawerStep = 'details'"
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
                {{ t('drawer.roleDetails') }}
              </button>
              <span
                v-else
                class="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {{ tCategory(localizedJob.category) }}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="drawer-icon-btn inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-300 dark:focus-visible:outline-zinc-200"
                @click="copyJobLink"
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span class="hidden sm:inline">{{ t('drawer.copyLink') }}</span>
              </button>

              <a
                :href="telegramShareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="drawer-icon-btn inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-300 dark:focus-visible:outline-zinc-200"
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
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                <span class="hidden sm:inline">{{ t('drawer.shareTelegram') }}</span>
              </a>

              <button
                type="button"
                :aria-label="t('drawer.closeAria')"
                class="drawer-icon-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:focus-visible:outline-zinc-200"
                @click="closeJobDetail"
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
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            <Transition name="view-swap" mode="out-in">
              <!-- Details Step -->
              <div v-if="drawerStep === 'details'" key="details">
                <div class="flex items-start gap-3.5">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
                    aria-hidden="true"
                  >
                    {{ localizedJob.companyInitials }}
                  </div>
                  <div class="min-w-0">
                    <button
                      type="button"
                      class="tactile-text-btn cursor-pointer text-sm font-medium text-zinc-600 underline decoration-zinc-300/80 underline-offset-2 dark:text-zinc-400 dark:decoration-zinc-700"
                      @click="openCompanyRoles"
                    >
                      {{ localizedJob.company }}
                    </button>
                    <h2
                      :id="`drawer-title-${localizedJob.id}`"
                      class="mt-0.5 text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
                    >
                      {{ localizedJob.displayTitle }}
                    </h2>
                  </div>
                </div>

                <!-- Salary Box -->
                <div
                  class="mt-5 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
                >
                  <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {{ t('drawer.monthlyCompensation') }}
                  </div>
                  <div data-currency-anim class="mt-1 flex flex-wrap items-baseline gap-2.5">
                    <span
                      class="text-lg font-semibold text-zinc-900 tabular-nums dark:text-zinc-50"
                    >
                      {{ primarySalary }}
                      <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {{ t('board.perMonth') }}
                      </span>
                    </span>
                    <span class="text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                      {{ secondarySalary }}
                    </span>
                  </div>
                </div>

                <!-- Metadata Chips -->
                <div class="mt-4 flex flex-wrap gap-2 text-xs">
                  <span
                    class="rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ tLocation(localizedJob.location) }} · {{ localizedJob.displayDistrict }}
                  </span>
                  <span
                    class="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ tWorkMode(localizedJob.workMode) }}
                  </span>
                  <span
                    class="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ tJobType(localizedJob.jobType) }}
                  </span>
                  <span
                    class="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ tExperience(localizedJob.experienceLevel) }}
                  </span>
                  <span
                    class="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-500 tabular-nums dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {{ t('board.postedPrefix') }} {{ tPosted(localizedJob.postedLabel) }}
                  </span>
                </div>

                <div
                  v-if="employerSwitchNotice"
                  role="alert"
                  class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  <span class="max-w-[65ch]">
                    {{ t('drawer.employerSwitchNotice') }}
                  </span>
                  <button
                    type="button"
                    class="tactile-text-btn shrink-0 cursor-pointer font-semibold underline underline-offset-2"
                    @click="goToSeekerAuth"
                  >
                    {{ t('drawer.switchBtn') }}
                  </button>
                </div>

                <div class="mt-6 space-y-6">
                  <div>
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ t('drawer.aboutRole') }}
                    </h3>
                    <p
                      class="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                      {{ localizedJob.displaySummary }}
                    </p>
                  </div>

                  <div>
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ t('drawer.responsibilities') }}
                    </h3>
                    <ul
                      class="mt-2 max-w-[65ch] list-disc space-y-1.5 pl-4 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <li v-for="(item, idx) in localizedJob.displayResponsibilities" :key="idx">
                        {{ item }}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ t('drawer.requirements') }}
                    </h3>
                    <ul
                      class="mt-2 max-w-[65ch] list-disc space-y-1.5 pl-4 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <li v-for="(item, idx) in localizedJob.displayRequirements" :key="idx">
                        {{ item }}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ t('drawer.benefits') }}
                    </h3>
                    <ul
                      class="mt-2 max-w-[65ch] list-disc space-y-1.5 pl-4 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <li v-for="(item, idx) in localizedJob.displayBenefits" :key="idx">
                        {{ item }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Quick Apply Step -->
              <div v-else-if="drawerStep === 'apply'" key="apply">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h2
                    :id="`drawer-title-${localizedJob.id}`"
                    class="text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
                  >
                    {{ t('drawer.applyToCompany', { company: localizedJob.company }) }}
                  </h2>
                  <span
                    v-if="usedProfilePrefill"
                    class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                  >
                    {{ t('drawer.prefilledBadge') }}
                  </span>
                </div>
                <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
                  {{ localizedJob.displayTitle }} · {{ tLocation(localizedJob.location) }} ({{
                    primarySalary
                  }}
                  {{ t('board.perMonth') }})
                </p>

                <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmitApply">
                  <BaseInput
                    id="apply-fullname"
                    v-model="applyForm.fullName"
                    :label="t('drawer.fullName')"
                    :placeholder="t('drawer.fullNamePlaceholder')"
                    autocomplete="name"
                    :error="applyErrors.fullName ? t(`drawer.${applyErrors.fullName}`) : ''"
                    @update:model-value="applyErrors.fullName = ''"
                  />

                  <BaseInput
                    id="apply-email"
                    v-model="applyForm.email"
                    :label="t('drawer.emailAddress')"
                    type="email"
                    :placeholder="t('drawer.emailPlaceholder')"
                    autocomplete="email"
                    inputmode="email"
                    :error="applyErrors.email ? t(`drawer.${applyErrors.email}`) : ''"
                    @update:model-value="applyErrors.email = ''"
                  />

                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <BaseInput
                      id="apply-phone"
                      v-model="applyForm.phone"
                      :label="t('drawer.cambodiaPhone')"
                      type="tel"
                      :placeholder="t('drawer.phonePlaceholder')"
                      autocomplete="tel"
                      inputmode="tel"
                      :error="applyErrors.phone ? t(`drawer.${applyErrors.phone}`) : ''"
                      @update:model-value="applyErrors.phone = ''"
                    />

                    <BaseInput
                      id="apply-telegram"
                      v-model="applyForm.telegram"
                      :label="t('drawer.telegramLabel')"
                      :placeholder="t('drawer.telegramPlaceholder')"
                    />
                  </div>

                  <BaseInput
                    id="apply-portfolio-url"
                    v-model="applyForm.portfolioUrl"
                    :label="t('drawer.portfolioUrlLabel')"
                    type="url"
                    :placeholder="t('profile.portfolioUrlPlaceholder')"
                  />

                  <div
                    v-if="profile.portfolioProjects?.length > 0"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3.5 py-2.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
                  >
                    <BaseCheckbox
                      v-model="applyForm.includePortfolioProjects"
                      :label="
                        t('drawer.attachPortfolioProjects', {
                          count: profile.portfolioProjects.length,
                        })
                      "
                    />
                    <button
                      type="button"
                      class="tactile-text-btn cursor-pointer text-xs font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-700"
                      @click="goToPortfolio"
                    >
                      {{ t('drawer.managePortfolioLink') }}
                    </button>
                  </div>

                  <!-- CV Upload -->
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <label
                        for="apply-cv-input"
                        class="text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
                      >
                        {{ t('drawer.resumeCv') }}
                      </label>
                      <button
                        type="button"
                        class="tactile-text-btn cursor-pointer text-xs font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-600"
                        @click="useSampleCv"
                      >
                        {{ t('drawer.useSampleCv') }}
                      </button>
                    </div>

                    <label
                      for="apply-cv-input"
                      data-pressable
                      class="cv-upload-zone mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 select-none dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-400"
                    >
                      <span class="truncate">
                        {{
                          applyForm.cvFileName
                            ? applyForm.cvFileName
                            : t('drawer.chooseFilePlaceholder')
                        }}
                      </span>
                      <span
                        class="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
                      >
                        {{ t('drawer.browseBtn') }}
                      </span>
                    </label>
                    <input
                      id="apply-cv-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      class="sr-only"
                      @change="handleFileSelect"
                    />
                    <p
                      v-if="applyErrors.cvFileName"
                      role="alert"
                      class="mt-1.5 max-w-[65ch] text-xs text-red-600 dark:text-red-400"
                    >
                      {{ t(`drawer.${applyErrors.cvFileName}`) }}
                    </p>
                  </div>

                  <!-- Short Note -->
                  <div>
                    <label
                      for="apply-note"
                      class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
                    >
                      {{ t('drawer.shortMessageLabel') }}
                    </label>
                    <textarea
                      id="apply-note"
                      v-model="applyForm.coverNote"
                      rows="3"
                      :placeholder="t('drawer.shortMessagePlaceholder')"
                      class="note-textarea mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div class="pt-2">
                    <BaseButton
                      type="submit"
                      variant="primary"
                      full-width
                      :loading="isSubmittingApply"
                    >
                      {{ t('drawer.submitApplication') }}
                      <template #loading>{{ t('drawer.sendingApplication') }}</template>
                    </BaseButton>
                  </div>
                </form>
              </div>

              <!-- Sent Confirmation Step -->
              <div v-else key="sent" class="py-6 text-center">
                <div
                  class="sent-badge mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20"
                  aria-hidden="true"
                >
                  <svg
                    class="h-6 w-6 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path class="sent-check-path" pathLength="1" d="M20 6 9 17l-5-5" />
                  </svg>
                </div>

                <h2
                  :id="`drawer-title-${localizedJob.id}`"
                  class="mt-4 text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
                >
                  {{ t('drawer.sentTitle') }}
                </h2>
                <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
                  {{
                    t('drawer.sentSub', {
                      cv: applyForm.cvFileName,
                      company: localizedJob.company,
                      title: localizedJob.displayTitle,
                    })
                  }}
                </p>

                <div class="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  <BaseButton variant="primary" @click="viewMyApplications">
                    {{ t('drawer.viewMyApplications') }}
                  </BaseButton>
                  <BaseButton variant="secondary" @click="closeJobDetail">
                    {{ t('drawer.keepBrowsing') }}
                  </BaseButton>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Sticky Action Footer on Details Step -->
          <div
            v-if="drawerStep === 'details'"
            class="flex items-center gap-3 border-t border-zinc-200/80 bg-white px-5 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <BaseButton variant="secondary" @click="handleToggleSave">
              {{ isSaved ? t('drawer.savedBtn') : t('drawer.saveJobBtn') }}
            </BaseButton>

            <BaseButton
              variant="primary"
              full-width
              :disabled="alreadyApplied"
              @click="handleApplyClick"
            >
              {{ alreadyApplied ? t('drawer.alreadyAppliedBtn') : t('drawer.applyNowBtn') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.note-textarea {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out);
}

.note-textarea:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.drawer-icon-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.drawer-icon-btn:active,
.drawer-icon-btn[data-pressed='true'] {
  transform: scale(0.93);
  background-color: var(--chip-active-bg);
  color: var(--link-hover-text);
  transition-duration: 90ms;
}

.cv-upload-zone {
  transition:
    transform 150ms var(--ease-out),
    border-color 150ms ease;
}

.cv-upload-zone:active,
.cv-upload-zone[data-pressed='true'] {
  transform: scale(0.99);
  border-color: var(--input-border-focus);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .note-textarea:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }

  .cv-upload-zone:hover {
    border-color: var(--input-border-hover);
  }

  .drawer-icon-btn:hover:not(:active):not([data-pressed='true']) {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}

.drawer-backdrop {
  will-change: opacity;
}

.drawer-panel {
  will-change: transform;
  contain: layout style paint;
}

.drawer-enter-active .drawer-backdrop {
  transition: opacity 180ms var(--ease-out);
}

.drawer-leave-active .drawer-backdrop {
  transition: opacity 150ms var(--ease-out);
}

.drawer-enter-from .drawer-backdrop,
.drawer-leave-to .drawer-backdrop {
  opacity: 0;
}

.drawer-enter-active .drawer-panel {
  transition: transform 230ms var(--ease-drawer);
}

.drawer-leave-active .drawer-panel {
  transition: transform 170ms var(--ease-out);
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

.view-swap-enter-active {
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out);
}

.view-swap-leave-active {
  transition:
    opacity 100ms var(--ease-out),
    transform 100ms var(--ease-out);
}

.view-swap-enter-from,
.view-swap-leave-to {
  opacity: 0;
  transform: scale(0.985);
}

.sent-badge {
  animation: sent-badge-in 240ms var(--ease-out) both;
}

.sent-check-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: sent-check-draw 230ms var(--ease-out) 65ms both;
}

@keyframes sent-badge-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sent-check-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-from .drawer-panel,
  .drawer-leave-to .drawer-panel {
    transform: none;
  }

  .drawer-enter-active .drawer-panel,
  .drawer-leave-active .drawer-panel {
    transition: opacity 160ms ease;
  }

  .sent-badge {
    animation: none;
  }

  .sent-check-path {
    stroke-dashoffset: 0;
    animation: none;
  }
}
</style>
