import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { alertsApi, normalizeProfileDto, profileApi } from '@/services/camitApi'
import { isRemoteApiEnabled } from '@/services/apiClient'
import { useAuthStore } from '@/stores/auth'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()

  const profile = ref(normalizeProfileDto({}, ''))
  const jobAlerts = ref(alertsApi.listSync())
  const isSavingProfile = ref(false)

  watch(
    () => authStore.currentUser?.email,
    async (email) => {
      if (!email) {
        profile.value = normalizeProfileDto({}, '')
        return
      }

      const localProfile = profileApi.getSync(email)
      profile.value = normalizeProfileDto(
        {
          ...localProfile,
          fullName: localProfile.fullName || authStore.currentUser?.name || '',
        },
        email,
      )

      if (isRemoteApiEnabled) {
        try {
          const remote = await profileApi.get(email)
          profile.value = remote
        } catch {
          // Keep locally hydrated profile if remote sync fails
        }
      }
    },
    { immediate: true },
  )

  const profileCompleteness = computed(() => {
    const hasPortfolio = Boolean(
      profile.value.portfolioUrl.trim() ||
      profile.value.githubUrl.trim() ||
      profile.value.linkedinUrl.trim() ||
      profile.value.portfolioProjects.length > 0,
    )
    const checks = [
      Boolean(profile.value.fullName.trim()),
      Boolean(profile.value.headline.trim()),
      profile.value.phone.replace(/\D/g, '').length >= 8,
      Boolean(profile.value.telegram.trim()),
      Boolean(profile.value.location),
      Number(profile.value.expectedSalary) > 0,
      Boolean(profile.value.cvFileName.trim()),
      profile.value.skills.length > 0,
      Boolean(profile.value.bio.trim()),
      hasPortfolio,
    ]
    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
  })

  async function saveProfile(patch) {
    isSavingProfile.value = true
    try {
      const targetEmail = authStore.currentUser?.email || profile.value.email
      const nextPayload = normalizeProfileDto({ ...profile.value, ...patch }, targetEmail)
      const saved = await profileApi.save(targetEmail, nextPayload)
      profile.value = saved

      if (
        authStore.currentUser &&
        saved.fullName &&
        saved.fullName !== authStore.currentUser.name
      ) {
        authStore.setUser({
          ...authStore.currentUser,
          name: saved.fullName,
        })
      }

      return saved
    } finally {
      isSavingProfile.value = false
    }
  }

  async function addJobAlert(payload) {
    const created = await alertsApi.create(payload)
    jobAlerts.value = [created, ...jobAlerts.value]
    return created
  }

  async function removeJobAlert(alertId) {
    await alertsApi.remove(alertId)
    jobAlerts.value = jobAlerts.value.filter((item) => item.id !== alertId)
  }

  function reloadLocalProfile() {
    jobAlerts.value = alertsApi.listSync()
    const email = authStore.currentUser?.email || ''
    if (!email) {
      profile.value = normalizeProfileDto({}, '')
      return
    }
    const loaded = profileApi.getSync(email)
    profile.value = normalizeProfileDto(
      {
        ...loaded,
        fullName: loaded.fullName || authStore.currentUser?.name || '',
      },
      email,
    )
  }

  return {
    profile,
    jobAlerts,
    isSavingProfile,
    profileCompleteness,
    saveProfile,
    addJobAlert,
    removeJobAlert,
    reloadLocalProfile,
  }
})
