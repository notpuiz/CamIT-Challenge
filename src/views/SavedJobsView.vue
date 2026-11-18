<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import JobCard from '@/components/jobs/JobCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useJobsStore } from '@/stores/jobs'

const router = useRouter()
const { t, formatCount } = useI18n()
const jobsStore = useJobsStore()
const { savedJobs } = storeToRefs(jobsStore)

const savedCountLabel = computed(() =>
  formatCount(
    savedJobs.value.length,
    t('saved.countSingular'),
    t('saved.countPlural'),
    t('saved.countPlural'),
  ),
)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
          {{ t('saved.title') }}
        </h1>
        <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('saved.subtitle') }}
        </p>
      </div>
      <span class="text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
        {{ savedCountLabel }}
      </span>
    </div>

    <Transition name="surface-swap" mode="out-in">
      <div
        v-if="savedJobs.length === 0"
        key="empty"
        class="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('saved.emptyTitle') }}
        </h2>
        <p class="mx-auto mt-1.5 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('saved.emptySub') }}
        </p>
        <div class="mt-5">
          <BaseButton variant="primary" @click="router.push({ name: 'jobs' })">
            {{ t('saved.browseJobs') }}
          </BaseButton>
        </div>
      </div>

      <TransitionGroup
        v-else
        key="grid"
        name="list-glide"
        tag="div"
        class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <JobCard v-for="job in savedJobs" :key="job.id" :job="job" />
      </TransitionGroup>
    </Transition>
  </div>
</template>
