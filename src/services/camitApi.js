import { INITIAL_APPLICATIONS, INITIAL_JOBS } from '@/data/cambodiaJobs'
import { MESSAGES } from '@/i18n/messages'
import {
  apiRequest,
  isRemoteApiEnabled,
  readStorage,
  removeStorage,
  writeStorage,
} from '@/services/apiClient'

export const JOBS_STORAGE_KEY = 'jobspacekh-jobs-v1'
export const SAVED_JOBS_STORAGE_KEY = 'jobspacekh-saved-jobs'
export const APPLICATIONS_STORAGE_KEY = 'jobspacekh-applications-v1'
export const PROFILES_STORAGE_KEY = 'jobspacekh-profiles-v1'
export const ALERTS_STORAGE_KEY = 'jobspacekh-job-alerts-v1'

const SEED_BASE_TS = 1700000000000

const DEFAULT_PROFILES = {
  'sokha@jobspace.kh': {
    email: 'sokha@jobspace.kh',
    fullName: 'Sokha Chan',
    headline: 'Senior Frontend Developer',
    phone: '+855 12 345 678',
    telegram: '@sokha_chan',
    location: 'Phnom Penh',
    expectedSalary: 1600,
    currency: 'USD',
    cvFileName: 'Sokha_Chan_Frontend_CV.pdf',
    skills: ['Vue 3', 'Tailwind CSS', 'JavaScript', 'REST APIs'],
    bio: 'Frontend developer based in Phnom Penh building fast bilingual web applications.',
    openToWork: true,
    portfolioUrl: 'https://sokha.dev',
    githubUrl: 'https://github.com/sokhachan',
    linkedinUrl: 'https://linkedin.com/in/sokhachan',
    portfolioProjects: [
      {
        id: 'proj-seed-1',
        title: 'KHQR Merchant Analytics Portal',
        role: 'Lead Frontend Engineer',
        url: 'https://khqr-demo.sokha.dev',
        techStack: ['Vue 3', 'Tailwind CSS', 'Pinia'],
        description:
          'Bilingual USD & KHR settlement dashboard used by 450+ retail merchants in Phnom Penh.',
      },
      {
        id: 'proj-seed-2',
        title: 'Angkor Boutique Booking Web App',
        role: 'UI Engineer',
        url: 'https://angkorstays.example.kh',
        techStack: ['Vue 3', 'Vue Router', 'REST APIs'],
        description:
          'Mobile-first room reservation and local payment checkout built for Siem Reap hospitality teams.',
      },
    ],
  },
}

export function normalizeUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return ''
  return `https://${trimmed}`
}

export function normalizePortfolioProjectDto(raw = {}, index = 0) {
  const techStack = Array.isArray(raw?.techStack)
    ? raw.techStack.map((item) => String(item).trim()).filter(Boolean)
    : []

  return {
    id: String(raw?.id || `proj-${Date.now()}-${index}`),
    title: String(raw?.title || '').trim(),
    role: String(raw?.role || '').trim(),
    url: normalizeUrl(raw?.url),
    techStack,
    description: String(raw?.description || '').trim(),
  }
}

export function slugifyCompany(name) {
  const slug = String(name || 'company')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'company'
}

export function normalizeJobDto(raw, index = 0) {
  const title = String(raw?.title || '').trim()
  const company = String(raw?.company || 'JobspaceKH Employer').trim()
  const category = raw?.category || 'Tech & IT'
  const location = raw?.location || 'Phnom Penh'
  const district = String(raw?.district || 'City Center').trim()
  const jobType = raw?.jobType || 'Full-time'
  const summary = String(raw?.summary || '').trim()
  const responsibilities = Array.isArray(raw?.responsibilities)
    ? raw.responsibilities.filter(Boolean)
    : []
  const requirements = Array.isArray(raw?.requirements) ? raw.requirements.filter(Boolean) : []
  const benefits = Array.isArray(raw?.benefits) ? raw.benefits.filter(Boolean) : []

  const searchText = [
    title,
    raw?.titleKm,
    company,
    location,
    MESSAGES.km.locations?.[location],
    district,
    raw?.districtKm,
    category,
    MESSAGES.km.categories?.[category],
    jobType,
    MESSAGES.km.jobTypes?.[jobType],
    summary,
    raw?.summaryKm,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    ...raw,
    id: String(raw?.id || `job-${Date.now()}-${index}`),
    title,
    company,
    companySlug: raw?.companySlug || slugifyCompany(company),
    companyInitials: String(raw?.companyInitials || company.slice(0, 2) || 'JS').toUpperCase(),
    category,
    location,
    district,
    workMode: raw?.workMode || 'On-site',
    jobType,
    experienceLevel: raw?.experienceLevel || 'Mid-level',
    currency: raw?.currency === 'KHR' ? 'KHR' : 'USD',
    salaryMin: Number(raw?.salaryMin) || 0,
    salaryMax: Number(raw?.salaryMax) || 0,
    postedLabel: raw?.postedLabel || 'Today',
    listingStatus: raw?.listingStatus === 'paused' ? 'paused' : 'open',
    createdAtTs: Number(raw?.createdAtTs) || SEED_BASE_TS - index * 3600000,
    summary,
    responsibilities,
    requirements,
    benefits,
    searchText,
    ownerEmail: String(raw?.ownerEmail || 'hr@jobspace.kh').trim(),
  }
}

export function normalizeApplicationDto(raw, index = 0) {
  const portfolioProjects = Array.isArray(raw?.portfolioProjects)
    ? raw.portfolioProjects.map((project, idx) => normalizePortfolioProjectDto(project, idx))
    : []

  return {
    id: String(raw?.id || `app-${Date.now()}-${index}`),
    jobId: String(raw?.jobId || ''),
    fullName: String(raw?.fullName || '').trim(),
    email: String(raw?.email || '').trim(),
    phone: String(raw?.phone || '').trim(),
    telegram: String(raw?.telegram || '').trim(),
    portfolioUrl: normalizeUrl(raw?.portfolioUrl),
    portfolioProjects,
    cvFileName: String(raw?.cvFileName || '').trim(),
    coverNote: String(raw?.coverNote || '').trim(),
    employerNote: String(raw?.employerNote || '').trim(),
    appliedAt: raw?.appliedAt || 'Just now',
    status: raw?.status || 'New',
    createdAtTs: Number(raw?.createdAtTs) || SEED_BASE_TS - index * 1800000,
  }
}

export function normalizeProfileDto(raw = {}, email = '') {
  const normalizedEmail = String(raw?.email || email || '')
    .trim()
    .toLowerCase()
  const seed = DEFAULT_PROFILES[normalizedEmail] || {}
  const skills = Array.isArray(raw?.skills)
    ? raw.skills.map((s) => String(s).trim()).filter(Boolean)
    : Array.isArray(seed.skills)
      ? [...seed.skills]
      : []

  const rawProjects = Array.isArray(raw?.portfolioProjects)
    ? raw.portfolioProjects
    : Array.isArray(seed.portfolioProjects)
      ? seed.portfolioProjects
      : []

  return {
    email: normalizedEmail,
    fullName: String(raw?.fullName ?? seed.fullName ?? '').trim(),
    headline: String(raw?.headline ?? seed.headline ?? '').trim(),
    phone: String(raw?.phone ?? seed.phone ?? '+855 ').trim() || '+855 ',
    telegram: String(raw?.telegram ?? seed.telegram ?? '').trim(),
    location: raw?.location ?? seed.location ?? 'Phnom Penh',
    expectedSalary: Number(raw?.expectedSalary ?? seed.expectedSalary ?? 800) || 0,
    currency: (raw?.currency ?? seed.currency) === 'KHR' ? 'KHR' : 'USD',
    cvFileName: String(raw?.cvFileName ?? seed.cvFileName ?? '').trim(),
    skills,
    bio: String(raw?.bio ?? seed.bio ?? '').trim(),
    openToWork: typeof raw?.openToWork === 'boolean' ? raw.openToWork : (seed.openToWork ?? true),
    portfolioUrl: normalizeUrl(raw?.portfolioUrl ?? seed.portfolioUrl ?? ''),
    githubUrl: normalizeUrl(raw?.githubUrl ?? seed.githubUrl ?? ''),
    linkedinUrl: normalizeUrl(raw?.linkedinUrl ?? seed.linkedinUrl ?? ''),
    portfolioProjects: rawProjects.map((project, idx) =>
      normalizePortfolioProjectDto(project, idx),
    ),
  }
}

export function normalizeAlertDto(raw = {}, index = 0) {
  return {
    id: String(raw?.id || `alert-${Date.now()}-${index}`),
    category: raw?.category || 'All industries',
    location: raw?.location || 'All locations',
    channel: String(raw?.channel || '').trim(),
    createdAt: raw?.createdAt || new Date().toISOString().slice(0, 10),
  }
}

function loadLocalJobs() {
  const stored = readStorage(JOBS_STORAGE_KEY, null)
  const seedMap = new Map(INITIAL_JOBS.map((job, idx) => [job.id, normalizeJobDto(job, idx)]))

  if (!Array.isArray(stored)) {
    return INITIAL_JOBS.map((job, idx) => normalizeJobDto(job, idx))
  }

  return stored.map((item, idx) => {
    const seed = seedMap.get(item?.id)
    if (seed && !item?._edited) {
      return normalizeJobDto({ ...seed, ...item }, idx)
    }
    return normalizeJobDto(item, idx)
  })
}

function saveLocalJobs(jobs) {
  writeStorage(JOBS_STORAGE_KEY, jobs)
}

function loadLocalSavedIds() {
  const stored = readStorage(SAVED_JOBS_STORAGE_KEY, [])
  return Array.isArray(stored) ? stored.map(String) : []
}

function loadLocalApplications() {
  const stored = readStorage(APPLICATIONS_STORAGE_KEY, null)
  if (!Array.isArray(stored)) {
    return INITIAL_APPLICATIONS.map((app, idx) => normalizeApplicationDto(app, idx))
  }
  return stored.map((app, idx) => normalizeApplicationDto(app, idx))
}

function saveLocalApplications(applications) {
  writeStorage(APPLICATIONS_STORAGE_KEY, applications)
}

function loadLocalProfilesMap() {
  const stored = readStorage(PROFILES_STORAGE_KEY, null)
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return { ...DEFAULT_PROFILES }
  }
  return { ...DEFAULT_PROFILES, ...stored }
}

function loadLocalAlerts() {
  const stored = readStorage(ALERTS_STORAGE_KEY, [])
  return Array.isArray(stored) ? stored.map((item, idx) => normalizeAlertDto(item, idx)) : []
}

export function hydrateInitialData() {
  return {
    jobs: loadLocalJobs(),
    savedJobIds: loadLocalSavedIds(),
    applications: loadLocalApplications(),
  }
}

export function resetLocalDemoData() {
  removeStorage(JOBS_STORAGE_KEY)
  removeStorage(SAVED_JOBS_STORAGE_KEY)
  removeStorage(APPLICATIONS_STORAGE_KEY)
  removeStorage(PROFILES_STORAGE_KEY)
  removeStorage(ALERTS_STORAGE_KEY)
  return hydrateInitialData()
}

export const jobsApi = {
  async list(params = {}) {
    if (isRemoteApiEnabled) {
      const response = await apiRequest('/jobs', { query: params })
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : []
      return items.map((item, idx) => normalizeJobDto(item, idx))
    }
    return loadLocalJobs()
  },

  async create(payload) {
    if (isRemoteApiEnabled) {
      const created = await apiRequest('/jobs', { method: 'POST', body: payload })
      return normalizeJobDto(created)
    }

    const existing = loadLocalJobs()
    const created = normalizeJobDto({
      ...payload,
      id: `job-${Date.now()}`,
      postedLabel: 'Just now',
      listingStatus: 'open',
      createdAtTs: Date.now(),
    })
    const next = [created, ...existing]
    saveLocalJobs(next)
    return created
  },

  async update(jobId, patch) {
    if (isRemoteApiEnabled) {
      const updated = await apiRequest(`/jobs/${encodeURIComponent(jobId)}`, {
        method: 'PATCH',
        body: patch,
      })
      return normalizeJobDto(updated)
    }

    const existing = loadLocalJobs()
    let updatedItem = null
    const next = existing.map((job) => {
      if (job.id !== jobId) return job
      const titleChanged = patch.title !== undefined && patch.title.trim() !== job.title
      const districtChanged = patch.district !== undefined && patch.district.trim() !== job.district
      const summaryChanged = patch.summary !== undefined && patch.summary.trim() !== job.summary
      const merged = normalizeJobDto({
        ...job,
        ...patch,
        _edited: true,
        titleKm: titleChanged ? '' : (patch.titleKm ?? job.titleKm),
        districtKm: districtChanged ? '' : (patch.districtKm ?? job.districtKm),
        summaryKm: summaryChanged ? '' : (patch.summaryKm ?? job.summaryKm),
        requirementsKm: patch.requirements ? [] : job.requirementsKm,
        benefitsKm: patch.benefits ? [] : job.benefitsKm,
      })
      updatedItem = merged
      return merged
    })
    saveLocalJobs(next)
    return updatedItem
  },

  async remove(jobId) {
    if (isRemoteApiEnabled) {
      await apiRequest(`/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' })
      return { id: jobId }
    }

    const existing = loadLocalJobs()
    saveLocalJobs(existing.filter((job) => job.id !== jobId))
    return { id: jobId }
  },

  async saveBookmarks(ids) {
    const normalized = Array.isArray(ids) ? ids.map(String) : []
    if (isRemoteApiEnabled) {
      await apiRequest('/bookmarks', { method: 'PUT', body: { jobIds: normalized } })
    }
    writeStorage(SAVED_JOBS_STORAGE_KEY, normalized)
    return normalized
  },
}

export const applicationsApi = {
  async list() {
    if (isRemoteApiEnabled) {
      const response = await apiRequest('/applications')
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : []
      return items.map((item, idx) => normalizeApplicationDto(item, idx))
    }
    return loadLocalApplications()
  },

  async create(payload) {
    if (isRemoteApiEnabled) {
      const created = await apiRequest('/applications', { method: 'POST', body: payload })
      return normalizeApplicationDto(created)
    }

    const existing = loadLocalApplications()
    const created = normalizeApplicationDto({
      ...payload,
      id: `app-${Date.now()}`,
      appliedAt: 'Just now',
      status: 'New',
      employerNote: '',
      createdAtTs: Date.now(),
    })
    const next = [created, ...existing]
    saveLocalApplications(next)
    return created
  },

  async update(appId, patch) {
    if (isRemoteApiEnabled) {
      const updated = await apiRequest(`/applications/${encodeURIComponent(appId)}`, {
        method: 'PATCH',
        body: patch,
      })
      return normalizeApplicationDto(updated)
    }

    const existing = loadLocalApplications()
    let updatedItem = null
    const next = existing.map((app) => {
      if (app.id !== appId) return app
      updatedItem = normalizeApplicationDto({ ...app, ...patch })
      return updatedItem
    })
    saveLocalApplications(next)
    return updatedItem
  },

  async withdraw(appId) {
    if (isRemoteApiEnabled) {
      await apiRequest(`/applications/${encodeURIComponent(appId)}`, { method: 'DELETE' })
      return { id: appId }
    }

    const existing = loadLocalApplications()
    saveLocalApplications(existing.filter((app) => app.id !== appId))
    return { id: appId }
  },
}

export const profileApi = {
  getSync(email) {
    const key = String(email || '')
      .trim()
      .toLowerCase()
    const map = loadLocalProfilesMap()
    return normalizeProfileDto(map[key] || {}, key)
  },

  async get(email) {
    const key = String(email || '')
      .trim()
      .toLowerCase()
    if (isRemoteApiEnabled && key) {
      const data = await apiRequest('/profile')
      return normalizeProfileDto(data, key)
    }
    return this.getSync(key)
  },

  async save(email, profilePayload) {
    const key = String(email || profilePayload?.email || '')
      .trim()
      .toLowerCase()
    const normalized = normalizeProfileDto(profilePayload, key)

    if (isRemoteApiEnabled) {
      const saved = await apiRequest('/profile', { method: 'PUT', body: normalized })
      return normalizeProfileDto(saved, key)
    }

    if (key) {
      const map = loadLocalProfilesMap()
      map[key] = normalized
      writeStorage(PROFILES_STORAGE_KEY, map)
    }
    return normalized
  },
}

export const alertsApi = {
  listSync() {
    return loadLocalAlerts()
  },

  async list() {
    if (isRemoteApiEnabled) {
      const response = await apiRequest('/alerts')
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : []
      return items.map((item, idx) => normalizeAlertDto(item, idx))
    }
    return loadLocalAlerts()
  },

  async create(payload) {
    if (isRemoteApiEnabled) {
      const created = await apiRequest('/alerts', { method: 'POST', body: payload })
      return normalizeAlertDto(created)
    }

    const existing = loadLocalAlerts()
    const created = normalizeAlertDto({
      ...payload,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    const next = [created, ...existing]
    writeStorage(ALERTS_STORAGE_KEY, next)
    return created
  },

  async remove(alertId) {
    if (isRemoteApiEnabled) {
      await apiRequest(`/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE' })
      return { id: alertId }
    }

    const existing = loadLocalAlerts()
    writeStorage(
      ALERTS_STORAGE_KEY,
      existing.filter((item) => item.id !== alertId),
    )
    return { id: alertId }
  },
}
