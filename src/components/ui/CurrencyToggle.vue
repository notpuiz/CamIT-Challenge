<script setup>
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@/stores/preferences'

const preferencesStore = usePreferencesStore()
const { displayCurrency } = storeToRefs(preferencesStore)
const { setDisplayCurrency } = preferencesStore
</script>

<template>
  <div
    role="group"
    aria-label="Display currency"
    class="relative grid h-9 grid-cols-2 items-center rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-950/[0.06] select-none dark:bg-zinc-900 dark:ring-white/10"
  >
    <span
      aria-hidden="true"
      class="currency-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[6px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] dark:ring-white/10"
      :style="{ transform: displayCurrency === 'KHR' ? 'translateX(100%)' : 'translateX(0%)' }"
    />

    <button
      type="button"
      :aria-pressed="displayCurrency === 'USD'"
      :class="[
        'currency-btn relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-1.5 text-xs font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900 sm:px-2.5 dark:focus-visible:outline-zinc-200',
        displayCurrency === 'USD'
          ? 'text-zinc-900 dark:text-zinc-50'
          : 'text-zinc-500 dark:text-zinc-400',
      ]"
      @click="setDisplayCurrency('USD')"
    >
      <span class="sm:hidden">$</span>
      <span class="hidden sm:inline">$ USD</span>
    </button>

    <button
      type="button"
      :aria-pressed="displayCurrency === 'KHR'"
      :class="[
        'currency-btn relative z-10 inline-flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-1.5 text-xs font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900 sm:px-2.5 dark:focus-visible:outline-zinc-200',
        displayCurrency === 'KHR'
          ? 'text-zinc-900 dark:text-zinc-50'
          : 'text-zinc-500 dark:text-zinc-400',
      ]"
      @click="setDisplayCurrency('KHR')"
    >
      <span class="sm:hidden">៛</span>
      <span class="hidden sm:inline">៛ KHR</span>
    </button>
  </div>
</template>

<style scoped>
.currency-pill {
  transition: transform 180ms var(--ease-out);
}

.currency-btn {
  transition:
    transform 140ms var(--ease-out),
    color 150ms ease;
}

.currency-btn:active,
.currency-btn[data-pressed='true'] {
  transform: scale(0.95);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .currency-btn:hover {
    color: var(--link-hover-text);
  }
}
</style>
