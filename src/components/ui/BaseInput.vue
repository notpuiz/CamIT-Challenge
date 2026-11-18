<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: undefined,
  },
  inputmode: {
    type: String,
    default: undefined,
  },
  enterkeyhint: {
    type: String,
    default: undefined,
  },
  autocapitalize: {
    type: String,
    default: undefined,
  },
  autocorrect: {
    type: String,
    default: undefined,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const isPasswordVisible = ref(false)

const resolvedType = computed(() => {
  if (props.type === 'password' && isPasswordVisible.value) {
    return 'text'
  }
  return props.type
})

const disableSpellcheck = computed(() => {
  return props.type === 'email' || props.type === 'password' ? 'false' : undefined
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2">
      <label :for="id" class="text-sm font-medium text-zinc-800 select-none dark:text-zinc-200">
        {{ label }}
      </label>
      <slot name="labelRight" />
    </div>

    <div class="relative mt-1.5">
      <input
        :id="id"
        v-model="model"
        :type="resolvedType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :enterkeyhint="enterkeyhint"
        :autocapitalize="autocapitalize"
        :autocorrect="autocorrect"
        :disabled="disabled"
        :spellcheck="disableSpellcheck"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        :class="[
          'base-input block h-10 w-full rounded-lg bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-500',
          type === 'password' ? 'pr-10' : '',
          error ? 'base-input--error' : '',
        ]"
      />

      <button
        v-if="type === 'password'"
        type="button"
        :disabled="disabled"
        :aria-label="isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')"
        class="pw-toggle absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center rounded-r-lg px-3 text-zinc-400 select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:focus-visible:outline-zinc-200"
        @click="isPasswordVisible = !isPasswordVisible"
      >
        <Transition name="icon-swap" mode="out-in">
          <svg
            v-if="isPasswordVisible"
            key="hide"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
            />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
          <svg
            v-else
            key="show"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Transition>
      </button>
    </div>

    <Transition name="field-error">
      <p
        v-if="error"
        :id="`${id}-error`"
        role="alert"
        class="mt-1.5 max-w-[65ch] text-xs text-red-600 dark:text-red-400"
      >
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.base-input {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out),
    background-color 160ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .base-input:hover:not(:focus):not(:disabled):not(.base-input--error) {
    border-color: var(--input-border-hover);
  }

  .pw-toggle:hover:not(:disabled) {
    color: var(--link-hover-text);
  }
}

.base-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.base-input--error {
  border-color: var(--input-error);
}

.base-input--error:focus {
  border-color: var(--input-error);
  box-shadow: 0 0 0 3px var(--input-ring-error);
}

.pw-toggle {
  transition:
    transform 140ms var(--ease-out),
    color 150ms ease;
}

.pw-toggle:active:not(:disabled),
.pw-toggle[data-pressed='true']:not(:disabled) {
  transform: scale(0.92);
  transition-duration: 90ms;
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 140ms var(--ease-out),
    transform 140ms var(--ease-out),
    filter 140ms var(--ease-out);
}

.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.95);
  filter: blur(2px);
}

.field-error-enter-active {
  transition:
    opacity 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}

.field-error-leave-active {
  transition:
    opacity 130ms var(--ease-out),
    transform 130ms var(--ease-out);
}

.field-error-enter-from,
.field-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
