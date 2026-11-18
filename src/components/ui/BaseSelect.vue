<script setup>
import { computed } from 'vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const normalizedOptions = computed(() => {
  return props.options.map((item) => {
    if (typeof item === 'string') {
      return { value: item, label: item }
    }
    return item
  })
})
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="
        hideLabel
          ? 'sr-only'
          : 'mb-1.5 block text-sm font-medium text-zinc-800 select-none dark:text-zinc-200'
      "
    >
      {{ label }}
    </label>

    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :class="[
          'base-select block h-10 w-full cursor-pointer appearance-none rounded-lg bg-white pr-9 pl-3 text-sm text-zinc-900 outline-none disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 dark:bg-zinc-950/60 dark:text-zinc-100 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-500',
          error ? 'base-select--error' : '',
        ]"
      >
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
          class="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {{ option.label }}
        </option>
      </select>

      <svg
        class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 shrink-0 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>

    <p v-if="error" role="alert" class="mt-1.5 max-w-[65ch] text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-select {
  border: 1px solid var(--input-border);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out),
    background-color 160ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .base-select:hover:not(:focus):not(:disabled):not(.base-select--error) {
    border-color: var(--input-border-hover);
  }
}

.base-select:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px var(--input-ring-focus);
}

.base-select--error {
  border-color: var(--input-error);
}

.base-select--error:focus {
  border-color: var(--input-error);
  box-shadow: 0 0 0 3px var(--input-ring-error);
}
</style>
