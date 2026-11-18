const PRESSABLE_SELECTOR =
  'button:not(:disabled), a[href], [data-pressable]:not([data-disabled="true"])'
const MIN_PRESS_MS = 85

let initialized = false
const pressStates = new WeakMap()
let activeElement = null

function releaseElement(el) {
  if (!el) return
  const state = pressStates.get(el)
  if (!state) {
    el.removeAttribute('data-pressed')
    return
  }

  if (state.timer) {
    clearTimeout(state.timer)
    state.timer = null
  }

  const elapsed = performance.now() - state.startTime
  const remaining = Math.max(0, MIN_PRESS_MS - elapsed)

  if (remaining === 0) {
    el.removeAttribute('data-pressed')
    pressStates.delete(el)
    return
  }

  state.timer = setTimeout(() => {
    el.removeAttribute('data-pressed')
    pressStates.delete(el)
  }, remaining)
}

function startPress(el) {
  const existing = pressStates.get(el)
  if (existing?.timer) {
    clearTimeout(existing.timer)
  }
  el.setAttribute('data-pressed', 'true')
  pressStates.set(el, { startTime: performance.now(), timer: null })
}

export function initTactilePress() {
  if (initialized || typeof document === 'undefined') return
  initialized = true

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      const el = event.target instanceof Element ? event.target.closest(PRESSABLE_SELECTOR) : null
      if (!el) return

      if (activeElement && activeElement !== el) {
        releaseElement(activeElement)
      }

      startPress(el)
      activeElement = el
    },
    { passive: true },
  )

  const handlePointerRelease = () => {
    if (!activeElement) return
    releaseElement(activeElement)
    activeElement = null
  }

  document.addEventListener('pointerup', handlePointerRelease, { passive: true })
  document.addEventListener('pointercancel', handlePointerRelease, { passive: true })

  document.addEventListener('keydown', (event) => {
    if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat) return

    const active = document.activeElement
    const el = active instanceof Element && active.matches(PRESSABLE_SELECTOR) ? active : null
    if (!el) return

    startPress(el)
  })

  document.addEventListener('keyup', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.target instanceof Element && event.target.hasAttribute('data-pressed')) {
      releaseElement(event.target)
    }
  })

  document.addEventListener(
    'blur',
    (event) => {
      if (event.target instanceof Element && event.target.hasAttribute('data-pressed')) {
        releaseElement(event.target)
      }
    },
    true,
  )
}
