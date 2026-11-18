<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { dismissToast, pauseAll, resumeAll } = toastStore
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:bottom-6"
      aria-live="polite"
      aria-atomic="false"
      @mouseenter="pauseAll"
      @mouseleave="resumeAll"
    >
      <TransitionGroup name="toast-pop" tag="div" class="flex flex-col gap-2">
        <div
          v-for="item in toasts"
          :key="item.id"
          role="status"
          class="toast-card pointer-events-auto flex items-start gap-3 rounded-xl bg-white/95 p-3.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-zinc-950/10 backdrop-blur-md dark:bg-zinc-900/95 dark:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] dark:ring-white/12"
        >
          <span
            :class="[
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
              item.tone === 'success'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : item.tone === 'warning'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            ]"
            aria-hidden="true"
          >
            <svg
              v-if="item.tone === 'success'"
              class="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <svg
              v-else-if="item.tone === 'warning'"
              class="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <svg
              v-else
              class="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
              {{ item.title }}
            </p>
            <p
              v-if="item.description"
              class="mt-0.5 max-w-[65ch] text-xs text-zinc-500 dark:text-zinc-400"
            >
              {{ item.description }}
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            class="toast-dismiss -mt-0.5 -mr-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 select-none focus-visible:outline-2 focus-visible:outline-zinc-900 dark:text-zinc-500 dark:focus-visible:outline-zinc-200"
            @click="dismissToast(item.id)"
          >
            <svg
              class="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-pop-enter-active {
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.toast-pop-leave-active {
  pointer-events: none;
  transition:
    opacity 140ms var(--ease-out),
    transform 140ms var(--ease-out);
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-dismiss {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.toast-dismiss:active,
.toast-dismiss[data-pressed='true'] {
  transform: scale(0.92);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .toast-dismiss:hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-pop-enter-from,
  .toast-pop-leave-to {
    transform: none;
  }
}
</style>
