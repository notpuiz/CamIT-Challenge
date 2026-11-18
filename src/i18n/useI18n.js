import { storeToRefs } from 'pinia'
import { MESSAGES } from '@/i18n/messages'
import { usePreferencesStore } from '@/stores/preferences'
import { pluralize } from '@/utils/currency'

function lookupPath(obj, path) {
  return path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

export function useI18n() {
  const preferencesStore = usePreferencesStore()
  const { locale } = storeToRefs(preferencesStore)
  const { setLocale, toggleLocale } = preferencesStore

  function t(path, params = {}) {
    const activeDict = MESSAGES[locale.value] || MESSAGES.en
    let template = lookupPath(activeDict, path)
    if (template === undefined) {
      template = lookupPath(MESSAGES.en, path)
    }
    if (typeof template !== 'string') return path

    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : `{${key}}`
    })
  }

  function translateMap(section, value) {
    const activeMap = MESSAGES[locale.value]?.[section]
    if (activeMap && activeMap[value] !== undefined) {
      return activeMap[value]
    }
    return value
  }

  function tLocation(value) {
    return translateMap('locations', value)
  }

  function tCategory(value) {
    return translateMap('categories', value)
  }

  function tWorkMode(value) {
    return translateMap('workModes', value)
  }

  function tJobType(value) {
    return translateMap('jobTypes', value)
  }

  function tExperience(value) {
    return translateMap('experienceLevels', value)
  }

  function tStatus(value) {
    return translateMap('statuses', value)
  }

  function tPosted(value) {
    return translateMap('postedLabels', value)
  }

  function localizeJob(job) {
    if (!job) return null
    const isKm = locale.value === 'km'
    return {
      ...job,
      displayTitle: isKm && job.titleKm ? job.titleKm : job.title,
      displayDistrict: isKm && job.districtKm ? job.districtKm : job.district,
      displaySummary: isKm && job.summaryKm ? job.summaryKm : job.summary,
      displayResponsibilities:
        isKm && job.responsibilitiesKm?.length ? job.responsibilitiesKm : job.responsibilities,
      displayRequirements:
        isKm && job.requirementsKm?.length ? job.requirementsKm : job.requirements,
      displayBenefits: isKm && job.benefitsKm?.length ? job.benefitsKm : job.benefits,
    }
  }

  function formatCount(count, enSingular, enPlural, kmUnit) {
    if (locale.value === 'km') {
      return `${count} ${kmUnit}`
    }
    return pluralize(count, enSingular, enPlural)
  }

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
    tLocation,
    tCategory,
    tWorkMode,
    tJobType,
    tExperience,
    tStatus,
    tPosted,
    localizeJob,
    formatCount,
  }
}
