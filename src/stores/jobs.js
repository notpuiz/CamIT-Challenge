import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { isRemoteApiEnabled } from '@/services/apiClient'
import {
  applicationsApi,
  hydrateInitialData,
  jobsApi,
  resetLocalDemoData,
  slugifyCompany,
} from '@/services/camitApi'
import { useAuthStore } from '@/stores/auth'
import { toUsd } from '@/utils/currency'

function buildInitials(companyName) {
  const parts = String(companyName || 'CM')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || 'CM').toUpperCase()
}

export const useJobsStore = defineStore('jobs', () => {
  const authStore = useAuthStore()
  const initialSnapshot = hydrateInitialData()

  const jobs = ref(initialSnapshot.jobs)
  const savedJobIds = ref(initialSnapshot.savedJobIds)
  const applications = ref(initialSnapshot.applications)

  const selectedJobId = ref(null)
  const startInApplyMode = ref(false)
  const isPostJobModalOpen = ref(false)
  const editingJobId = ref(null)

  const filters = reactive({
    query: '',
    category: 'All industries',
    location: 'All locations',
    workMode: 'All modes',
    jobType: 'All types',
    experienceLevel: 'All levels',
    salaryBracket: 'any',
    sortBy: 'newest',
  })

  const openJobs = computed(() => jobs.value.filter((job) => job.listingStatus !== 'paused'))

  const selectedJob = computed(() => {
    if (!selectedJobId.value) return null
    return jobs.value.find((job) => job.id === selectedJobId.value) || null
  })

  const editingJob = computed(() => {
    if (!editingJobId.value) return null
    return jobs.value.find((job) => job.id === editingJobId.value) || null
  })

  const filteredJobs = computed(() => {
    const q = filters.query.trim().toLowerCase()

    const matches = openJobs.value.filter((job) => {
      if (q && !(job.searchText || '').includes(q)) {
        return false
      }

      if (filters.category !== 'All industries' && job.category !== filters.category) {
        return false
      }

      if (filters.location !== 'All locations' && job.location !== filters.location) {
        return false
      }

      if (filters.workMode !== 'All modes' && job.workMode !== filters.workMode) {
        return false
      }

      if (filters.jobType !== 'All types' && job.jobType !== filters.jobType) {
        return false
      }

      if (
        filters.experienceLevel !== 'All levels' &&
        job.experienceLevel !== filters.experienceLevel
      ) {
        return false
      }

      if (filters.salaryBracket !== 'any') {
        const minUsd = toUsd(job.salaryMin, job.currency)
        const maxUsd = toUsd(job.salaryMax, job.currency)

        if (filters.salaryBracket === 'under-500' && !(minUsd < 500)) return false
        if (filters.salaryBracket === '500-1000' && !(maxUsd >= 500 && minUsd <= 1000)) return false
        if (filters.salaryBracket === '1000-2000' && !(maxUsd >= 1000 && minUsd <= 2000)) {
          return false
        }
        if (filters.salaryBracket === '2000-plus' && !(maxUsd >= 2000)) return false
      }

      return true
    })

    if (filters.sortBy === 'salary-desc') {
      return [...matches].sort(
        (a, b) => toUsd(b.salaryMax, b.currency) - toUsd(a.salaryMax, a.currency),
      )
    }

    if (filters.sortBy === 'salary-asc') {
      return [...matches].sort(
        (a, b) => toUsd(a.salaryMin, a.currency) - toUsd(b.salaryMin, b.currency),
      )
    }

    return [...matches].sort((a, b) => Number(b.createdAtTs || 0) - Number(a.createdAtTs || 0))
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.query.trim()) count++
    if (filters.category !== 'All industries') count++
    if (filters.location !== 'All locations') count++
    if (filters.workMode !== 'All modes') count++
    if (filters.jobType !== 'All types') count++
    if (filters.experienceLevel !== 'All levels') count++
    if (filters.salaryBracket !== 'any') count++
    return count
  })

  const companies = computed(() => {
    const grouped = new Map()
    for (const job of openJobs.value) {
      const slug = job.companySlug || slugifyCompany(job.company)
      const minUsd = toUsd(job.salaryMin, job.currency)
      const maxUsd = toUsd(job.salaryMax, job.currency)

      if (!grouped.has(slug)) {
        grouped.set(slug, {
          slug,
          name: job.company,
          initials: job.companyInitials,
          category: job.category,
          location: job.location,
          district: job.district,
          districtKm: job.districtKm || '',
          openCount: 1,
          minSalaryUsd: minUsd,
          maxSalaryUsd: maxUsd,
          benefits: [...(job.benefits || [])],
          benefitsKm: [...(job.benefitsKm || [])],
          jobs: [job],
        })
      } else {
        const entry = grouped.get(slug)
        entry.openCount += 1
        entry.minSalaryUsd = Math.min(entry.minSalaryUsd, minUsd)
        entry.maxSalaryUsd = Math.max(entry.maxSalaryUsd, maxUsd)
        entry.jobs.push(job)
      }
    }
    return Array.from(grouped.values()).sort((a, b) => b.openCount - a.openCount)
  })

  const savedJobs = computed(() => {
    return jobs.value.filter((job) => savedJobIds.value.includes(job.id))
  })

  const myApplications = computed(() => {
    const email = authStore.currentUser?.email?.toLowerCase()
    if (!email) return []
    return applications.value
      .filter((app) => app.email.toLowerCase() === email)
      .map((app) => ({
        ...app,
        job: jobs.value.find((job) => job.id === app.jobId) || null,
      }))
  })

  const employerJobs = computed(() => {
    if (!authStore.isEmployer || !authStore.currentUser?.email) return []
    const ownerEmail = authStore.currentUser.email.toLowerCase()
    return jobs.value.filter((job) => job.ownerEmail.toLowerCase() === ownerEmail)
  })

  const employerApplications = computed(() => {
    const ownedIds = new Set(employerJobs.value.map((job) => job.id))
    return applications.value
      .filter((app) => ownedIds.has(app.jobId))
      .map((app) => ({
        ...app,
        job: jobs.value.find((job) => job.id === app.jobId) || null,
      }))
  })

  function openJobDetail(jobId, { apply = false } = {}) {
    selectedJobId.value = jobId
    startInApplyMode.value = apply
  }

  function closeJobDetail() {
    selectedJobId.value = null
    startInApplyMode.value = false
  }

  function openPostJobModal() {
    editingJobId.value = null
    isPostJobModalOpen.value = true
  }

  function openEditJobModal(jobId) {
    editingJobId.value = jobId
    isPostJobModalOpen.value = true
  }

  function closePostJobModal() {
    isPostJobModalOpen.value = false
    editingJobId.value = null
  }

  function isJobSaved(jobId) {
    return savedJobIds.value.includes(jobId)
  }

  function toggleSaveJob(jobId) {
    let nowSaved = false
    if (savedJobIds.value.includes(jobId)) {
      savedJobIds.value = savedJobIds.value.filter((id) => id !== jobId)
    } else {
      savedJobIds.value = [...savedJobIds.value, jobId]
      nowSaved = true
    }
    jobsApi.saveBookmarks(savedJobIds.value)
    return nowSaved
  }

  function resetFilters() {
    filters.query = ''
    filters.category = 'All industries'
    filters.location = 'All locations'
    filters.workMode = 'All modes'
    filters.jobType = 'All types'
    filters.experienceLevel = 'All levels'
    filters.salaryBracket = 'any'
    filters.sortBy = 'newest'
  }

  function hasAppliedToJob(jobId) {
    const email = authStore.currentUser?.email?.toLowerCase()
    if (!email) return false
    return applications.value.some(
      (app) => app.jobId === jobId && app.email.toLowerCase() === email,
    )
  }

  async function submitApplication({
    jobId,
    fullName,
    email,
    phone,
    telegram = '',
    portfolioUrl = '',
    portfolioProjects = [],
    cvFileName,
    coverNote = '',
  }) {
    const created = await applicationsApi.create({
      jobId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      telegram: telegram.trim(),
      portfolioUrl: portfolioUrl.trim(),
      portfolioProjects: Array.isArray(portfolioProjects) ? portfolioProjects : [],
      cvFileName: cvFileName.trim(),
      coverNote: coverNote.trim(),
    })
    applications.value = [created, ...applications.value]
    return created
  }

  async function withdrawApplication(appId) {
    await applicationsApi.withdraw(appId)
    applications.value = applications.value.filter((app) => app.id !== appId)
  }

  async function createJobPosting(payload) {
    const ownerEmail = authStore.currentUser?.email || 'employer@camit.kh'
    const created = await jobsApi.create({
      title: payload.title.trim(),
      company: payload.company.trim(),
      companySlug: slugifyCompany(payload.company),
      companyInitials: buildInitials(payload.company),
      category: payload.category,
      location: payload.location,
      district: payload.district.trim() || 'City Center',
      workMode: payload.workMode,
      jobType: payload.jobType || 'Full-time',
      experienceLevel: payload.experienceLevel,
      currency: payload.currency,
      salaryMin: Number(payload.salaryMin),
      salaryMax: Number(payload.salaryMax),
      summary: payload.summary.trim(),
      responsibilities:
        payload.responsibilities?.length > 0
          ? payload.responsibilities
          : ['Collaborate with local teams across daily operations and deliverables.'],
      requirements:
        payload.requirements?.length > 0
          ? payload.requirements
          : ['Relevant experience or strong eagerness to learn and grow with the team.'],
      benefits: payload.benefits?.length > 0 ? payload.benefits : ['NSSF coverage & annual leave'],
      ownerEmail,
    })
    jobs.value = [created, ...jobs.value]
    return created
  }

  async function updateJobPosting(jobId, payload) {
    const patch = {
      ...payload,
      ...(payload.company
        ? {
            companySlug: slugifyCompany(payload.company),
            companyInitials: buildInitials(payload.company),
          }
        : {}),
    }
    const updated = await jobsApi.update(jobId, patch)
    if (updated) {
      jobs.value = jobs.value.map((job) => (job.id === jobId ? updated : job))
    }
    return updated
  }

  async function toggleJobStatus(jobId) {
    const target = jobs.value.find((job) => job.id === jobId)
    if (!target) return null
    const nextStatus = target.listingStatus === 'paused' ? 'open' : 'paused'
    return updateJobPosting(jobId, { listingStatus: nextStatus })
  }

  async function deleteJobPosting(jobId) {
    await jobsApi.remove(jobId)
    jobs.value = jobs.value.filter((job) => job.id !== jobId)
    if (savedJobIds.value.includes(jobId)) {
      savedJobIds.value = savedJobIds.value.filter((id) => id !== jobId)
      jobsApi.saveBookmarks(savedJobIds.value)
    }
    if (selectedJobId.value === jobId) {
      closeJobDetail()
    }
  }

  async function updateApplicationStatus(appId, status) {
    const updated = await applicationsApi.update(appId, { status })
    if (updated) {
      applications.value = applications.value.map((app) => (app.id === appId ? updated : app))
    }
    return updated
  }

  async function updateApplicationNote(appId, employerNote) {
    const updated = await applicationsApi.update(appId, { employerNote: employerNote.trim() })
    if (updated) {
      applications.value = applications.value.map((app) => (app.id === appId ? updated : app))
    }
    return updated
  }

  async function syncWithRemoteApi() {
    if (!isRemoteApiEnabled) return
    const [remoteJobs, remoteApplications] = await Promise.all([
      jobsApi.list(),
      applicationsApi.list(),
    ])
    jobs.value = remoteJobs
    applications.value = remoteApplications
  }

  function resetDemoData() {
    const fresh = resetLocalDemoData()
    jobs.value = fresh.jobs
    savedJobIds.value = fresh.savedJobIds
    applications.value = fresh.applications
    resetFilters()
  }

  return {
    jobs,
    openJobs,
    savedJobIds,
    applications,
    selectedJobId,
    startInApplyMode,
    isPostJobModalOpen,
    editingJobId,
    editingJob,
    filters,
    selectedJob,
    filteredJobs,
    activeFilterCount,
    companies,
    savedJobs,
    myApplications,
    employerJobs,
    employerApplications,
    openJobDetail,
    closeJobDetail,
    openPostJobModal,
    openEditJobModal,
    closePostJobModal,
    isJobSaved,
    toggleSaveJob,
    resetFilters,
    hasAppliedToJob,
    submitApplication,
    withdrawApplication,
    createJobPosting,
    updateJobPosting,
    toggleJobStatus,
    deleteJobPosting,
    updateApplicationStatus,
    updateApplicationNote,
    syncWithRemoteApi,
    resetDemoData,
  }
})
