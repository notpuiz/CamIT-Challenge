<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    data-theme-toggle
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="theme-toggle-btn relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/10 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-white/12 dark:focus-visible:outline-zinc-200"
    @click="toggleTheme($event)"
  >
    <svg
      :class="[
        'theme-icon h-4 w-4 shrink-0',
        isDark ? 'theme-icon--sun-hidden' : 'theme-icon--visible',
      ]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>

    <svg
      :class="[
        'theme-icon absolute h-4 w-4 shrink-0',
        isDark ? 'theme-icon--visible' : 'theme-icon--moon-hidden',
      ]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  transition:
    transform 150ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.theme-toggle-btn:active,
.theme-toggle-btn[data-pressed='true'] {
  transform: scale(0.93);
  background-color: var(--theme-toggle-active-bg);
  color: var(--theme-toggle-hover-text);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .theme-toggle-btn:hover:not(:active):not([data-pressed='true']) {
    background-color: var(--theme-toggle-hover-bg);
    color: var(--theme-toggle-hover-text);
    transform: translateY(-0.5px);
  }
}

.theme-icon {
  transition:
    opacity 240ms var(--ease-out),
    transform 240ms var(--ease-out);
}

.theme-icon--visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.theme-icon--sun-hidden {
  opacity: 0;
  transform: scale(0.75) rotate(65deg);
}

.theme-icon--moon-hidden {
  opacity: 0;
  transform: scale(0.75) rotate(-65deg);
}

@media (prefers-reduced-motion: reduce) {
  .theme-icon--sun-hidden,
  .theme-icon--moon-hidden {
    transform: none;
  }
}
</style>
