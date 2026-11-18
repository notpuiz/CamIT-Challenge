import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

const CURRENCY_STORAGE_KEY = 'jobspacekh-currency'
const LOCALE_STORAGE_KEY = 'jobspacekh-locale'

const activeCurrencyAnims = new Set()
const activeLocaleAnims = new Set()

function isReducedMotionPreferred() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function cancelAnimSet(animSet) {
  for (const anim of animSet) {
    try {
      anim.cancel()
    } catch {
      // Ignore already-finished animations
    }
  }
  animSet.clear()
}

function runCurrencyRollAnimation(directionY) {
  if (typeof document === 'undefined') return
  cancelAnimSet(activeCurrencyAnims)

  const reduced = isReducedMotionPreferred()
  const nodes = document.querySelectorAll('[data-currency-anim]')

  for (const el of nodes) {
    if (typeof el.animate !== 'function') continue
    const anim = el.animate(
      reduced
        ? [{ opacity: 0.35 }, { opacity: 1 }]
        : [
            { opacity: 0.18, transform: `translateY(${directionY}px)` },
            { opacity: 1, transform: 'translateY(0)' },
          ],
      reduced
        ? { duration: 140, easing: 'ease' }
        : { duration: 210, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    )
    activeCurrencyAnims.add(anim)
    const cleanup = () => activeCurrencyAnims.delete(anim)
    anim.addEventListener('finish', cleanup, { once: true })
    anim.addEventListener('cancel', cleanup, { once: true })
  }
}

function runLocaleStageAnimation() {
  if (typeof document === 'undefined') return
  cancelAnimSet(activeLocaleAnims)

  const reduced = isReducedMotionPreferred()
  const stages = document.querySelectorAll('[data-locale-stage]')

  for (const el of stages) {
    if (typeof el.animate !== 'function') continue
    const anim = el.animate(
      reduced
        ? [{ opacity: 0.4 }, { opacity: 1 }]
        : [
            { opacity: 0.28, transform: 'translateY(3.5px) scale(0.996)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ],
      reduced
        ? { duration: 140, easing: 'ease' }
        : { duration: 195, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    )
    activeLocaleAnims.add(anim)
    const cleanup = () => activeLocaleAnims.delete(anim)
    anim.addEventListener('finish', cleanup, { once: true })
    anim.addEventListener('cancel', cleanup, { once: true })
  }
}

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

  async function setDisplayCurrency(currency) {
    const nextCurrency = currency === 'KHR' ? 'KHR' : 'USD'
    if (nextCurrency === displayCurrency.value) return

    const directionY = nextCurrency === 'KHR' ? 6 : -6
    displayCurrency.value = nextCurrency
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, displayCurrency.value)
    } catch {
      // Ignore storage access errors in restricted contexts
    }

    await nextTick()
    runCurrencyRollAnimation(directionY)
  }

  async function setLocale(nextLocale) {
    const resolved = nextLocale === 'km' ? 'km' : 'en'
    if (resolved === locale.value) return

    locale.value = resolved
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.value
    }
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale.value)
    } catch {
      // Ignore storage access errors in restricted contexts
    }

    await nextTick()
    runLocaleStageAnimation()
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
