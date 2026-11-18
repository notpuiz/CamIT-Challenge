import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_DURATION_MS = 3200
const MAX_VISIBLE_TOASTS = 4

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  const timers = new Map()
  let paused = false
  let pauseStartedAt = 0
  let listenerAttached = false

  function clearTimer(id) {
    const timer = timers.get(id)
    if (timer?.timeoutId) {
      clearTimeout(timer.timeoutId)
    }
    timers.delete(id)
  }

  function scheduleTimer(id, remainingMs) {
    clearTimer(id)
    if (remainingMs <= 0) {
      dismissToast(id)
      return
    }
    const timeoutId = setTimeout(() => {
      dismissToast(id)
    }, remainingMs)

    timers.set(id, {
      timeoutId,
      startedAt: Date.now(),
      remainingMs,
    })
  }

  function ensureVisibilityListener() {
    if (listenerAttached || typeof document === 'undefined') return
    listenerAttached = true
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseAll()
      } else {
        resumeAll()
      }
    })
  }

  function showToast({
    title,
    description = '',
    tone = 'success',
    duration = DEFAULT_DURATION_MS,
  }) {
    if (!title) return null
    ensureVisibilityListener()

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast = { id, title, description, tone, duration }

    while (toasts.value.length >= MAX_VISIBLE_TOASTS) {
      const oldest = toasts.value[0]
      if (oldest) {
        clearTimer(oldest.id)
        toasts.value.shift()
      }
    }

    toasts.value.push(toast)

    if (duration > 0) {
      if (paused) {
        timers.set(id, {
          timeoutId: null,
          startedAt: Date.now(),
          remainingMs: duration,
        })
      } else {
        scheduleTimer(id, duration)
      }
    }

    return id
  }

  function dismissToast(id) {
    clearTimer(id)
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function pauseAll() {
    if (paused) return
    paused = true
    pauseStartedAt = Date.now()
    for (const [id, entry] of timers.entries()) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId)
        const elapsed = pauseStartedAt - entry.startedAt
        entry.remainingMs = Math.max(0, entry.remainingMs - elapsed)
        entry.timeoutId = null
        timers.set(id, entry)
      }
    }
  }

  function resumeAll() {
    if (!paused) return
    paused = false
    for (const [id, entry] of timers.entries()) {
      scheduleTimer(id, entry.remainingMs)
    }
  }

  return {
    toasts,
    showToast,
    dismissToast,
    pauseAll,
    resumeAll,
  }
})
