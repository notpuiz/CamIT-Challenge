<script setup>
const model = defineModel({ type: Boolean, default: false })

defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <label
    :for="id"
    data-pressable
    :data-disabled="disabled ? 'true' : undefined"
    :class="[
      'checkbox-row group inline-flex items-center gap-2.5 select-none',
      disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
    ]"
  >
    <input :id="id" v-model="model" type="checkbox" :disabled="disabled" class="peer sr-only" />
    <span
      :class="[
        'checkbox-box relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900 dark:peer-focus-visible:outline-zinc-200',
        model
          ? 'checkbox-box--checked bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-white text-white dark:bg-zinc-950/60',
      ]"
      aria-hidden="true"
    >
      <Transition name="check-pop">
        <svg
          v-if="model"
          class="h-3 w-3 shrink-0"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2.5 6.2 4.8 8.5 9.5 3.5" />
        </svg>
      </Transition>
    </span>
    <span class="text-sm text-zinc-600 tabular-nums dark:text-zinc-400">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-box {
  border: 1px solid var(--checkbox-border);
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms var(--ease-out),
    border-color 150ms var(--ease-out);
}

.checkbox-box--checked {
  border-color: var(--checkbox-checked-border);
}

.checkbox-row:active .checkbox-box,
.checkbox-row[data-pressed='true'] .checkbox-box {
  transform: scale(0.92);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .checkbox-row:hover .checkbox-box:not(.checkbox-box--checked) {
    border-color: var(--checkbox-border-hover);
  }
}

.check-pop-enter-active {
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out);
}

.check-pop-leave-active {
  transition:
    opacity 110ms var(--ease-out),
    transform 110ms var(--ease-out);
}

.check-pop-enter-from,
.check-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
