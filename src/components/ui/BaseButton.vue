<script setup>
import { computed, useAttrs } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'responsive'].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()

const hasCustomDisplay = computed(() => {
  const raw = Array.isArray(attrs.class) ? attrs.class.join(' ') : String(attrs.class || '')
  return /(?:^|\s)!?(?:hidden|flex|inline-flex|block|inline-block|grid|inline-grid)(?:\s|$)/.test(
    raw,
  )
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') return 'h-9 px-2.5 text-xs sm:px-3'
  if (props.size === 'responsive') return 'h-9 px-2.5 text-xs sm:h-10 sm:px-4 sm:text-sm'
  return 'h-10 px-4 text-sm'
})

const variantClasses = computed(() => {
  if (props.variant === 'secondary') {
    return 'base-button--secondary bg-white text-zinc-800 ring-1 ring-zinc-950/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-zinc-800/75 dark:text-zinc-100 dark:ring-white/12 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]'
  }
  if (props.variant === 'ghost') {
    return 'base-button--ghost bg-transparent text-zinc-600 dark:text-zinc-400'
  }
  return 'base-button--primary bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.7)]'
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :class="[
      'base-button relative cursor-pointer items-center justify-center rounded-lg font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-55 dark:focus-visible:outline-zinc-200',
      hasCustomDisplay ? '' : 'inline-flex',
      sizeClasses,
      variantClasses,
      fullWidth ? 'w-full' : '',
    ]"
  >
    <Transition name="btn-swap" mode="out-in">
      <span v-if="loading" key="loading" class="inline-flex items-center justify-center gap-2">
        <svg
          class="btn-spinner h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2.5"
          />
          <path
            class="opacity-90"
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
        <slot name="loading">Signing in…</slot>
      </span>
      <span v-else key="idle" class="inline-flex items-center justify-center gap-2">
        <slot />
      </span>
    </Transition>
  </button>
</template>

<style scoped>
.base-button {
  transition:
    transform 160ms var(--ease-out),
    background-color 150ms var(--ease-out),
    box-shadow 150ms var(--ease-out),
    color 150ms ease,
    opacity 150ms ease;
}

.base-button:active:not(:disabled),
.base-button[data-pressed='true']:not(:disabled) {
  transform: translateY(0.5px) scale(0.965);
  transition-duration: 90ms;
}

.base-button--primary:active:not(:disabled),
.base-button--primary[data-pressed='true']:not(:disabled) {
  background-color: var(--btn-primary-active);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.base-button--secondary:active:not(:disabled),
.base-button--secondary[data-pressed='true']:not(:disabled) {
  background-color: var(--btn-secondary-active);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.base-button--ghost:active:not(:disabled),
.base-button--ghost[data-pressed='true']:not(:disabled) {
  background-color: var(--btn-ghost-active-bg);
  color: var(--btn-ghost-hover-text);
}

@media (hover: hover) and (pointer: fine) {
  .base-button--primary:hover:not(:disabled):not(:active):not([data-pressed='true']) {
    background-color: var(--btn-primary-hover);
    transform: translateY(-0.5px);
  }

  .base-button--secondary:hover:not(:disabled):not(:active):not([data-pressed='true']) {
    background-color: var(--btn-secondary-hover);
    transform: translateY(-0.5px);
  }

  .base-button--ghost:hover:not(:disabled):not(:active):not([data-pressed='true']) {
    background-color: var(--btn-ghost-hover-bg);
    color: var(--btn-ghost-hover-text);
  }
}

.btn-spinner {
  animation: btn-spin 650ms linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-swap-enter-active {
  transition:
    opacity 160ms var(--ease-out),
    transform 160ms var(--ease-out),
    filter 160ms var(--ease-out);
}

.btn-swap-leave-active {
  transition:
    opacity 120ms var(--ease-out),
    transform 120ms var(--ease-out),
    filter 120ms var(--ease-out);
}

.btn-swap-enter-from,
.btn-swap-leave-to {
  opacity: 0;
  transform: scale(0.96);
  filter: blur(2px);
}
</style>
