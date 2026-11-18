<script setup>
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { CAMBODIA_LOCATIONS } from '@/data/cambodiaJobs'
import { useI18n } from '@/i18n/useI18n'
import { normalizePortfolioProjectDto, normalizeUrl } from '@/services/camitApi'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { useProfileStore } from '@/stores/profile'
import { useToastStore } from '@/stores/toast'
import { convertAmount, formatMoney } from '@/utils/currency'

const router = useRouter()
const { t, tCategory, tLocation } = useI18n()
const preferencesStore = usePreferencesStore()
const jobsStore = useJobsStore()
const profileStore = useProfileStore()
const toastStore = useToastStore()

const { displayCurrency } = storeToRefs(preferencesStore)
const { profile, jobAlerts, isSavingProfile, profileCompleteness } = storeToRefs(profileStore)

const viewMode = ref('edit') // 'edit' | 'preview'
const newSkill = ref('')
const isProjectFormOpen = ref(false)
const editingProjectId = ref(null)

const form = reactive({
  fullName: '',
  headline: '',
  phone: '+855 ',
  telegram: '',
  location: 'Phnom Penh',
  expectedSalary: '800',
  currency: 'USD',
  cvFileName: '',
  skills: [],
  bio: '',
  openToWork: true,
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioProjects: [],
})

const projectDraft = reactive({
  title: '',
  role: '',
  url: '',
  techInput: '',
  description: '',
  error: '',
})

watch(
  profile,
  (next) => {
    form.fullName = next.fullName || ''
    form.headline = next.headline || ''
    form.phone = next.phone || '+855 '
    form.telegram = next.telegram || ''
    form.location = next.location || 'Phnom Penh'
    form.expectedSalary = String(next.expectedSalary || 800)
    form.currency = next.currency || 'USD'
    form.cvFileName = next.cvFileName || ''
    form.skills = [...(next.skills || [])]
    form.bio = next.bio || ''
    form.openToWork = Boolean(next.openToWork)
    form.portfolioUrl = next.portfolioUrl || ''
    form.githubUrl = next.githubUrl || ''
    form.linkedinUrl = next.linkedinUrl || ''
    form.portfolioProjects = Array.isArray(next.portfolioProjects)
      ? next.portfolioProjects.map((proj, idx) => normalizePortfolioProjectDto(proj, idx))
      : []
  },
  { immediate: true },
)

const locationOptions = CAMBODIA_LOCATIONS.filter((l) => l !== 'All locations').map((value) => ({
  value,
  label: tLocation(value),
}))

const currencyOptions = [
  { value: 'USD', label: t('postModal.usdOption') },
  { value: 'KHR', label: t('postModal.khrOption') },
]

const initials = computed(() => {
  const parts = String(form.fullName || 'CM')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || 'CM').toUpperCase()
})

const previewSalaryText = computed(() => {
  const converted = convertAmount(
    Number(form.expectedSalary) || 0,
    form.currency,
    displayCurrency.value,
  )
  return formatMoney(converted, displayCurrency.value)
})

const normalizedPreviewLinks = computed(() => {
  return [
    { key: 'portfolio', label: 'Portfolio', href: normalizeUrl(form.portfolioUrl) },
    { key: 'github', label: 'GitHub / Work', href: normalizeUrl(form.githubUrl) },
    { key: 'linkedin', label: 'LinkedIn', href: normalizeUrl(form.linkedinUrl) },
  ].filter((link) => Boolean(link.href))
})

function addSkill() {
  const value = newSkill.value.trim()
  if (!value) return
  if (!form.skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
    form.skills.push(value)
  }
  newSkill.value = ''
}

function removeSkill(skill) {
  form.skills = form.skills.filter((item) => item !== skill)
}

function handleCvSelect(event) {
  const file = event.target?.files?.[0]
  if (file) {
    form.cvFileName = file.name
  }
}

function useSampleCv() {
  const safeName = (form.fullName || 'Candidate').trim().replace(/\s+/g, '_')
  form.cvFileName = `${safeName}_CV_2026.pdf`
}

function openAddProject() {
  editingProjectId.value = null
  projectDraft.title = ''
  projectDraft.role = ''
  projectDraft.url = ''
  projectDraft.techInput = ''
  projectDraft.description = ''
  projectDraft.error = ''
  isProjectFormOpen.value = true
}

function openEditProject(project) {
  editingProjectId.value = project.id
  projectDraft.title = project.title || ''
  projectDraft.role = project.role || ''
  projectDraft.url = project.url || ''
  projectDraft.techInput = (project.techStack || []).join(', ')
  projectDraft.description = project.description || ''
  projectDraft.error = ''
  isProjectFormOpen.value = true
}

function cancelProjectDraft() {
  isProjectFormOpen.value = false
  editingProjectId.value = null
  projectDraft.error = ''
}

async function persistFormPatch() {
  await profileStore.saveProfile({
    fullName: form.fullName,
    headline: form.headline,
    phone: form.phone,
    telegram: form.telegram,
    location: form.location,
    expectedSalary: Number(form.expectedSalary) || 0,
    currency: form.currency,
    cvFileName: form.cvFileName,
    skills: form.skills,
    bio: form.bio,
    openToWork: form.openToWork,
    portfolioUrl: form.portfolioUrl,
    githubUrl: form.githubUrl,
    linkedinUrl: form.linkedinUrl,
    portfolioProjects: form.portfolioProjects,
  })
}

async function saveProjectDraft() {
  projectDraft.error = ''
  if (!projectDraft.title.trim()) {
    projectDraft.error = 'projectErrTitle'
    return
  }

  const normalized = normalizePortfolioProjectDto({
    id: editingProjectId.value || `proj-${Date.now()}`,
    title: projectDraft.title,
    role: projectDraft.role,
    url: projectDraft.url,
    techStack: projectDraft.techInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    description: projectDraft.description,
  })

  if (editingProjectId.value) {
    form.portfolioProjects = form.portfolioProjects.map((item) =>
      item.id === editingProjectId.value ? normalized : item,
    )
  } else {
    form.portfolioProjects = [normalized, ...form.portfolioProjects]
  }

  isProjectFormOpen.value = false
  editingProjectId.value = null
  await persistFormPatch()
  toastStore.showToast({
    title: t('profile.profileSavedToast'),
    description: normalized.title,
    tone: 'success',
  })
}

async function removeProject(projectId) {
  form.portfolioProjects = form.portfolioProjects.filter((item) => item.id !== projectId)
  if (editingProjectId.value === projectId) {
    cancelProjectDraft()
  }
  await persistFormPatch()
}

async function handleSaveProfile() {
  await persistFormPatch()
  toastStore.showToast({
    title: t('profile.profileSavedToast'),
    tone: 'success',
  })
}

function applyAlertFilters(alert) {
  jobsStore.resetFilters()
  jobsStore.filters.category = alert.category
  jobsStore.filters.location = alert.location
  router.push({ name: 'jobs' })
}
</script>

<template>
  <section aria-labelledby="profile-heading">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          id="profile-heading"
          class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
        >
          {{ t('profile.title') }}
        </h1>
        <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('profile.subtitle') }}
        </p>
      </div>

      <!-- Mode Switcher: Edit vs Employer Preview -->
      <div
        role="group"
        aria-label="Profile view mode"
        class="relative grid h-9 grid-cols-2 items-center rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-950/[0.06] select-none dark:bg-zinc-900 dark:ring-white/10"
      >
        <span
          aria-hidden="true"
          class="mode-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[6px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800 dark:ring-white/10"
          :style="{ transform: viewMode === 'preview' ? 'translateX(100%)' : 'translateX(0%)' }"
        />
        <button
          type="button"
          :aria-pressed="viewMode === 'edit'"
          :class="[
            'mode-tab relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-3 text-xs font-medium select-none',
            viewMode === 'edit'
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400',
          ]"
          @click="viewMode = 'edit'"
        >
          {{ t('profile.editTab') }}
        </button>
        <button
          type="button"
          :aria-pressed="viewMode === 'preview'"
          :class="[
            'mode-tab relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-3 text-xs font-medium select-none',
            viewMode === 'preview'
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400',
          ]"
          @click="viewMode = 'preview'"
        >
          {{ t('profile.previewTab') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Transition name="surface-swap" mode="out-in">
        <!-- Main Edit Form -->
        <form
          v-if="viewMode === 'edit'"
          key="edit"
          class="space-y-5 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
          @submit.prevent="handleSaveProfile"
        >
          <div
            class="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950/60"
          >
            <BaseCheckbox v-model="form.openToWork" :label="t('profile.openToWorkLabel')" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseInput
              id="profile-fullname"
              v-model="form.fullName"
              :label="t('drawer.fullName')"
              :placeholder="t('drawer.fullNamePlaceholder')"
            />
            <BaseInput
              id="profile-headline"
              v-model="form.headline"
              :label="t('profile.headlineLabel')"
              :placeholder="t('profile.headlinePlaceholder')"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseInput
              id="profile-phone"
              v-model="form.phone"
              :label="t('profile.phoneLabel')"
              type="tel"
              inputmode="tel"
            />
            <BaseInput
              id="profile-telegram"
              v-model="form.telegram"
              :label="t('profile.telegramLabel')"
              :placeholder="t('drawer.telegramPlaceholder')"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BaseSelect
              id="profile-location"
              v-model="form.location"
              :label="t('profile.locationLabel')"
              :options="locationOptions"
            />
            <BaseInput
              id="profile-salary"
              v-model="form.expectedSalary"
              :label="t('profile.expectedSalaryLabel')"
              type="number"
              inputmode="numeric"
            />
            <BaseSelect
              id="profile-currency"
              v-model="form.currency"
              :label="t('postModal.currency')"
              :options="currencyOptions"
            />
          </div>

          <!-- Portfolio & Social Links -->
          <div class="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
            <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {{ t('profile.linksSectionTitle') }}
            </h2>
            <div class="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <BaseInput
                id="profile-portfolio-url"
                v-model="form.portfolioUrl"
                :label="t('profile.portfolioUrlLabel')"
                type="url"
                :placeholder="t('profile.portfolioUrlPlaceholder')"
              />
              <BaseInput
                id="profile-github-url"
                v-model="form.githubUrl"
                :label="t('profile.githubUrlLabel')"
                type="url"
                :placeholder="t('profile.githubUrlPlaceholder')"
              />
              <BaseInput
                id="profile-linkedin-url"
                v-model="form.linkedinUrl"
                :label="t('profile.linkedinUrlLabel')"
                type="url"
                :placeholder="t('profile.linkedinUrlPlaceholder')"
              />
            </div>
          </div>

          <!-- Featured Portfolio Projects -->
          <div class="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {{ t('profile.projectsSectionTitle') }}
                </h2>
                <p class="mt-0.5 max-w-[65ch] text-xs text-zinc-500 dark:text-zinc-400">
                  {{ t('profile.projectsSectionSub') }}
                </p>
              </div>
              <BaseButton v-if="!isProjectFormOpen" variant="secondary" @click="openAddProject">
                {{ t('profile.addProjectBtn') }}
              </BaseButton>
            </div>

            <!-- Inline Project Composer -->
            <div
              v-if="isProjectFormOpen"
              class="mt-3.5 space-y-3.5 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <BaseInput
                  id="project-title"
                  v-model="projectDraft.title"
                  :label="t('profile.projectTitleLabel')"
                  :placeholder="t('profile.projectTitlePlaceholder')"
                  :error="projectDraft.error ? t(`profile.${projectDraft.error}`) : ''"
                  @update:model-value="projectDraft.error = ''"
                />
                <BaseInput
                  id="project-role"
                  v-model="projectDraft.role"
                  :label="t('profile.projectRoleLabel')"
                  :placeholder="t('profile.projectRolePlaceholder')"
                />
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <BaseInput
                  id="project-url"
                  v-model="projectDraft.url"
                  :label="t('profile.projectUrlLabel')"
                  type="url"
                  :placeholder="t('profile.projectUrlPlaceholder')"
                />
                <BaseInput
                  id="project-tech"
                  v-model="projectDraft.techInput"
                  :label="t('profile.projectTechLabel')"
                  :placeholder="t('profile.projectTechPlaceholder')"
                />
              </div>

              <div>
                <label
                  for="project-desc"
                  class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
                >
                  {{ t('profile.projectDescLabel') }}
                </label>
                <textarea
                  id="project-desc"
                  v-model="projectDraft.description"
                  rows="2"
                  :placeholder="t('profile.projectDescPlaceholder')"
                  class="profile-input mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              <div class="flex items-center justify-end gap-2">
                <BaseButton variant="ghost" @click="cancelProjectDraft">
                  {{ t('profile.cancelProjectBtn') }}
                </BaseButton>
                <BaseButton variant="primary" @click="saveProjectDraft">
                  {{ t('profile.saveProjectBtn') }}
                </BaseButton>
              </div>
            </div>

            <p
              v-if="form.portfolioProjects.length === 0 && !isProjectFormOpen"
              class="mt-3 rounded-xl border border-dashed border-zinc-200 px-4 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
            >
              {{ t('profile.emptyProjects') }}
            </p>

            <div v-else-if="form.portfolioProjects.length > 0" class="mt-3.5 space-y-3">
              <article
                v-for="project in form.portfolioProjects"
                :key="project.id"
                class="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
              >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ project.title }}
                    </h3>
                    <p v-if="project.role" class="text-xs text-zinc-500 dark:text-zinc-400">
                      {{ project.role }}
                    </p>
                  </div>

                  <div class="flex items-center gap-2 text-xs">
                    <a
                      v-if="project.url"
                      :href="project.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tactile-text-btn font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-200 dark:decoration-zinc-700"
                    >
                      {{ t('profile.visitProject') }} ↗
                    </a>
                    <button
                      type="button"
                      class="tactile-text-btn cursor-pointer font-medium text-zinc-600 dark:text-zinc-400"
                      @click="openEditProject(project)"
                    >
                      {{ t('profile.editProjectBtn') }}
                    </button>
                    <button
                      type="button"
                      class="tactile-text-btn cursor-pointer font-medium text-red-600 dark:text-red-400"
                      @click="removeProject(project.id)"
                    >
                      {{ t('profile.removeProjectBtn') }}
                    </button>
                  </div>
                </div>

                <p
                  v-if="project.description"
                  class="mt-2 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                >
                  {{ project.description }}
                </p>

                <div v-if="project.techStack?.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, idx) in project.techStack"
                    :key="idx"
                    class="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
                  >
                    {{ tag }}
                  </span>
                </div>
              </article>
            </div>
          </div>

          <!-- Skills Tag Builder -->
          <div class="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
            <label
              for="profile-skill-input"
              class="mb-1.5 block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
            >
              {{ t('profile.skillsLabel') }}
            </label>
            <div class="flex gap-2">
              <input
                id="profile-skill-input"
                v-model="newSkill"
                type="text"
                :placeholder="t('profile.addSkillPlaceholder')"
                class="profile-input h-10 min-w-0 flex-1 rounded-lg bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                @keydown.enter.prevent="addSkill"
              />
              <BaseButton variant="secondary" @click="addSkill">
                {{ t('profile.addSkillBtn') }}
              </BaseButton>
            </div>

            <div v-if="form.skills.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
              <span
                v-for="skill in form.skills"
                :key="skill"
                class="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pr-2 pl-2.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <span>{{ skill }}</span>
                <button
                  type="button"
                  :aria-label="`Remove ${skill}`"
                  class="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100"
                  @click="removeSkill(skill)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <!-- Default CV -->
          <div>
            <div class="flex items-center justify-between gap-2">
              <label
                for="profile-cv-input"
                class="text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
              >
                {{ t('profile.defaultCvLabel') }}
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
              for="profile-cv-input"
              data-pressable
              class="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 select-none dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-400"
            >
              <span class="truncate">{{
                form.cvFileName || t('drawer.chooseFilePlaceholder')
              }}</span>
              <span
                class="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
              >
                {{ t('drawer.browseBtn') }}
              </span>
            </label>
            <input
              id="profile-cv-input"
              type="file"
              accept=".pdf,.doc,.docx"
              class="sr-only"
              @change="handleCvSelect"
            />
          </div>

          <!-- Bio -->
          <div>
            <label
              for="profile-bio"
              class="block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200"
            >
              {{ t('profile.bioLabel') }}
            </label>
            <textarea
              id="profile-bio"
              v-model="form.bio"
              rows="3"
              :placeholder="t('profile.bioPlaceholder')"
              class="profile-input mt-1.5 block w-full rounded-lg bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div class="border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
            <BaseButton type="submit" variant="primary" :loading="isSavingProfile">
              {{ t('profile.saveProfileBtn') }}
              <template #loading>{{ t('profile.savingProfile') }}</template>
            </BaseButton>
          </div>
        </form>

        <!-- Employer Showcase Preview -->
        <div
          v-else
          key="preview"
          class="space-y-6 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-3.5">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-base font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                aria-hidden="true"
              >
                {{ initials }}
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2
                    class="text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
                  >
                    {{ form.fullName || t('drawer.fullNamePlaceholder') }}
                  </h2>
                  <span
                    v-if="form.openToWork"
                    class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                  >
                    {{ t('profile.openToWorkLabel') }}
                  </span>
                </div>
                <p class="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {{ form.headline || '—' }}
                </p>
                <p class="mt-1 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                  {{ tLocation(form.location) }} ·
                  <span data-currency-anim class="inline-block">{{ previewSalaryText }}</span>
                  {{ t('board.perMonth') }}
                  <span v-if="form.telegram"> · Telegram: {{ form.telegram }}</span>
                </p>
              </div>
            </div>

            <span
              v-if="form.cvFileName"
              class="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {{ form.cvFileName }}
            </span>
          </div>

          <p
            v-if="form.bio"
            class="max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
          >
            {{ form.bio }}
          </p>

          <div v-if="normalizedPreviewLinks.length > 0" class="flex flex-wrap gap-2">
            <a
              v-for="link in normalizedPreviewLinks"
              :key="link.key"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="tactile-text-btn inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-800 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
            >
              <span>{{ link.label }}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div v-if="form.skills.length > 0">
            <h3
              class="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
            >
              {{ t('profile.skillsLabel') }}
            </h3>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="skill in form.skills"
                :key="skill"
                class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <div class="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
            <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {{ t('profile.projectsSectionTitle') }}
            </h3>

            <p
              v-if="form.portfolioProjects.length === 0"
              class="mt-2 text-xs text-zinc-500 dark:text-zinc-400"
            >
              {{ t('profile.emptyProjects') }}
            </p>

            <div v-else class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <article
                v-for="project in form.portfolioProjects"
                :key="project.id"
                class="flex flex-col justify-between rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
              >
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {{ project.title }}
                      </h4>
                      <p v-if="project.role" class="text-xs text-zinc-500 dark:text-zinc-400">
                        {{ project.role }}
                      </p>
                    </div>
                    <a
                      v-if="project.url"
                      :href="project.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tactile-text-btn shrink-0 text-xs font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-200 dark:decoration-zinc-700"
                    >
                      {{ t('profile.visitProject') }} ↗
                    </a>
                  </div>
                  <p
                    v-if="project.description"
                    class="mt-2 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                  >
                    {{ project.description }}
                  </p>
                </div>

                <div v-if="project.techStack?.length > 0" class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, idx) in project.techStack"
                    :key="idx"
                    class="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
                  >
                    {{ tag }}
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Right Sidebar: Completeness & Saved Alerts -->
      <div class="space-y-4">
        <div
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div class="flex items-center justify-between gap-2 text-xs font-medium">
            <span class="text-zinc-500 dark:text-zinc-400">
              {{ t('profile.completenessLabel') }}
            </span>
            <span class="font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
              {{ profileCompleteness }}%
            </span>
          </div>
          <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              class="h-full origin-left rounded-full bg-zinc-900 transition-transform duration-300 dark:bg-zinc-100"
              :style="{ transform: `scaleX(${profileCompleteness / 100})` }"
            />
          </div>
        </div>

        <div
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ t('profile.alertsTitle') }}
          </h2>

          <p
            v-if="jobAlerts.length === 0"
            class="mt-2 max-w-[65ch] text-xs text-zinc-500 dark:text-zinc-400"
          >
            {{ t('profile.alertsEmpty') }}
          </p>

          <ul v-else class="mt-3 space-y-2.5">
            <li
              v-for="alert in jobAlerts"
              :key="alert.id"
              class="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.06]"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {{ tCategory(alert.category) }}
                  </p>
                  <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {{ tLocation(alert.location) }} · {{ alert.channel }}
                  </p>
                </div>
                <button
                  type="button"
                  :aria-label="t('profile.deleteAlertAria')"
                  class="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
                  @click="profileStore.removeJobAlert(alert.id)"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                class="tactile-text-btn mt-2 cursor-pointer text-[11px] font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-700"
                @click="applyAlertFilters(alert)"
              >
                {{ t('profile.applyAlertBtn') }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-input {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out);
}

.profile-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.mode-pill {
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-tab {
  transition:
    transform 140ms var(--ease-out),
    color 150ms ease;
}

.mode-tab:active,
.mode-tab[data-pressed='true'] {
  transform: scale(0.96);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .profile-input:hover:not(:focus) {
    border-color: var(--input-border-hover);
  }

  .mode-tab[aria-pressed='false']:hover {
    color: var(--link-hover-text);
  }
}
</style>
