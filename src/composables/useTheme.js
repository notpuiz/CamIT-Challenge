import { nextTick, ref } from 'vue'

const STORAGE_KEY = 'jobspacekh-theme'

function resolveInitialTheme() {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return true
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

const isDark = ref(resolveInitialTheme())
let activeViewTransition = null

function commitDomTheme(dark, { persist = false } = {}) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('dark', dark)

  const meta = document.getElementById('theme-color-meta')
  if (meta) {
    meta.setAttribute('content', dark ? '#09090b' : '#fafafa')
  }

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      // Ignore storage access failures in restricted browsing contexts
    }
  }
}

function applyTheme(dark, { persist = false } = {}) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.add('theme-switching')
  commitDomTheme(dark, { persist })

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching')
    })
  })
}

function resolveOriginPoint(event) {
  const triggerEl =
    event?.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : document.querySelector('[data-theme-toggle]')

  if (triggerEl instanceof HTMLElement) {
    const rect = triggerEl.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        triggerEl,
      }
    }
  }

  return {
    x: window.innerWidth - 32,
    y: 32,
    triggerEl: null,
  }
}

function runFallbackButtonFade({ x, y, endRadius, previousDark, reducedMotion }) {
  if (!document.body || typeof document.body.animate !== 'function') return

  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '9999'
  overlay.style.backgroundColor = previousDark ? '#09090b' : '#fafafa'
  document.body.appendChild(overlay)

  const keyframes = reducedMotion
    ? [{ opacity: 0.65 }, { opacity: 0 }]
    : [
        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)`, opacity: 0.92 },
        { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 0.2 },
      ]

  const animation = overlay.animate(
    keyframes,
    reducedMotion
      ? { duration: 180, easing: 'ease' }
      : { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )

  const cleanup = () => {
    overlay.remove()
  }

  animation.addEventListener('finish', cleanup, { once: true })
  animation.addEventListener('cancel', cleanup, { once: true })
}

if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (event) => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      // Ignore storage access failures
    }
    isDark.value = event.matches
    applyTheme(event.matches, { persist: false })
  })
}

export function useTheme() {
  function toggleTheme(event) {
    const previousDark = isDark.value
    const nextDark = !previousDark

    if (typeof document === 'undefined' || typeof window === 'undefined') {
      isDark.value = nextDark
      return
    }

    const root = document.documentElement
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { x, y, triggerEl } = resolveOriginPoint(event)
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    if (typeof document.startViewTransition !== 'function') {
      root.classList.add('theme-switching')
      isDark.value = nextDark
      commitDomTheme(nextDark, { persist: true })
      runFallbackButtonFade({ x, y, endRadius, previousDark, reducedMotion })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove('theme-switching')
        })
      })
      return
    }

    if (activeViewTransition) {
      try {
        activeViewTransition.skipTransition()
      } catch {
        // Ignore already-finished transition
      }
      activeViewTransition = null
    }

    let transition
    try {
      transition = document.startViewTransition(async () => {
        root.classList.add('theme-vt-capturing')
        triggerEl?.removeAttribute('data-pressed')
        isDark.value = nextDark
        commitDomTheme(nextDark, { persist: true })
        await nextTick()
      })
    } catch {
      root.classList.remove('theme-vt-capturing')
      applyTheme(nextDark, { persist: true })
      return
    }

    activeViewTransition = transition

    transition.ready
      .then(() => {
        root.classList.remove('theme-vt-capturing')

        if (reducedMotion) {
          root.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 180,
            easing: 'ease',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          })
          return
        }

        root.animate(
          [
            {
              clipPath: `circle(0px at ${x}px ${y}px)`,
            },
            {
              clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
            },
          ],
          {
            duration: 460,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        if (activeViewTransition === transition) {
          root.classList.remove('theme-vt-capturing')
        }
      })

    transition.finished
      .catch(() => {})
      .finally(() => {
        if (activeViewTransition === transition) {
          root.classList.remove('theme-vt-capturing')
          activeViewTransition = null
        }
      })
  }

  return {
    isDark,
    toggleTheme,
  }
}
