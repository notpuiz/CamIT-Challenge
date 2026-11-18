import { defineStore } from 'pinia'
import { ref } from 'vue'

const CURRENCY_STORAGE_KEY = 'camit-currency'
const LOCALE_STORAGE_KEY = 'camit-locale'

function loadSavedCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY)
    return saved === 'KHR' ? 'KHR' : 'USD'
  } catch {
    return 'USD'
  }
}

function loadSavedLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'km' || saved === 'en') return saved
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  if (typeof document !== 'undefined' && document.documentElement.lang === 'km') {
    return 'km'
  }
  return 'en'
}

export const usePreferencesStore = defineStore('preferences', () => {
  const displayCurrency = ref(loadSavedCurrency())
  const locale = ref(loadSavedLocale())

  function setDisplayCurrency(currency) {
    displayCurrency.value = currency === 'KHR' ? 'KHR' : 'USD'
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, displayCurrency.value)
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  function setLocale(nextLocale) {
    locale.value = nextLocale === 'km' ? 'km' : 'en'
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.value
    }
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale.value)
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  function toggleLocale() {
    setLocale(locale.value === 'km' ? 'en' : 'km')
  }

  return {
    displayCurrency,
    setDisplayCurrency,
    locale,
    setLocale,
    toggleLocale,
  }
})
