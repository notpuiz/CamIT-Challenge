<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import PostJobModal from '@/components/employer/PostJobModal.vue'
import JobDetailDrawer from '@/components/jobs/JobDetailDrawer.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastViewport from '@/components/ui/ToastViewport.vue'
import { MESSAGES } from '@/i18n/messages'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'

const route = useRoute()
const preferencesStore = usePreferencesStore()
const jobsStore = useJobsStore()
const { locale } = storeToRefs(preferencesStore)

watch(
  [locale, () => route.meta.titleKey],
  ([activeLocale, titleKey]) => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = activeLocale
    const dict = MESSAGES[activeLocale] || MESSAGES.en
    document.title = dict.pageTitles[titleKey || 'jobs'] || MESSAGES.en.pageTitles.jobs
  },
  { immediate: true },
)

onMounted(() => {
  jobsStore.syncWithRemoteApi()
})
</script>

<template>
  <div>
    <RouterView v-if="route.meta.hideNavbar" />

    <div v-else class="auth-ambient-bg flex min-h-svh flex-col text-zinc-900 dark:text-zinc-100">
      <AppNavbar />

      <main class="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <div :key="currentRoute.path" class="page-enter">
            <component :is="Component" />
          </div>
        </RouterView>
      </main>

      <AppFooter />
      <JobDetailDrawer />
      <PostJobModal />
    </div>

    <ToastViewport />
  </div>
</template>

<style scoped>
.page-enter {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 140ms var(--ease-out),
    transform 140ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter {
    transition: opacity 120ms ease;

    @starting-style {
      opacity: 0;
      transform: none;
    }
  }
}
</style>
