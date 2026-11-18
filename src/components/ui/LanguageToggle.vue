<script setup>
import { useI18n } from '@/i18n/useI18n'

const { locale, toggleLocale } = useI18n()
</script>

<template>
  <button
    type="button"
    :aria-label="locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)'"
    :title="locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)'"
    class="lang-toggle-btn relative inline-flex h-9 w-12 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-2 text-xs font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/10 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 sm:w-[4.75rem] sm:px-2.5 dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-white/12 dark:focus-visible:outline-zinc-200"
    @click="toggleLocale"
  >
    <svg
      :class="[
        'lang-globe hidden h-3.5 w-3.5 shrink-0 text-zinc-500 sm:block dark:text-zinc-400',
        locale === 'km' ? 'lang-globe--km' : '',
      ]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
    <Transition name="lang-swap" mode="out-in">
      <span :key="locale" class="inline-block leading-none">
        {{ locale === 'km' ? 'ខ្មែរ' : 'EN' }}
      </span>
    </Transition>
  </button>
</template>

<style scoped>
.lang-toggle-btn {
  transition:
    transform 150ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.lang-toggle-btn:active,
.lang-toggle-btn[data-pressed='true'] {
  transform: scale(0.94);
  background-color: var(--theme-toggle-active-bg);
  color: var(--theme-toggle-hover-text);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .lang-toggle-btn:hover:not(:active):not([data-pressed='true']) {
    background-color: var(--theme-toggle-hover-bg);
    color: var(--theme-toggle-hover-text);
    transform: translateY(-0.5px);
  }
}

.lang-globe {
  transition: transform 260ms var(--ease-out);
}

.lang-globe--km {
  transform: rotate(180deg);
}

.lang-swap-enter-active {
  transition:
    opacity 155ms var(--ease-out),
    transform 155ms var(--ease-out);
}

.lang-swap-leave-active {
  transition:
    opacity 110ms var(--ease-out),
    transform 110ms var(--ease-out);
}

.lang-swap-enter-from {
  opacity: 0;
  transform: translateY(5px) scale(0.94);
}

.lang-swap-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.94);
}

@media (prefers-reduced-motion: reduce) {
  .lang-globe {
    transition: none;
  }

  .lang-globe--km,
  .lang-swap-enter-from,
  .lang-swap-leave-to {
    transform: none;
  }
}
</style>
