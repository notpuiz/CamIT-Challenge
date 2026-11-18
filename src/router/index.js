import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/components/auth/LoginView.vue'
import EmployerWorkspaceView from '@/components/employer/EmployerWorkspaceView.vue'
import CandidateApplicationsView from '@/components/jobs/CandidateApplicationsView.vue'
import { MESSAGES } from '@/i18n/messages'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import CandidateProfileView from '@/views/CandidateProfileView.vue'
import CompaniesView from '@/views/CompaniesView.vue'
import JobsBoardView from '@/views/JobsBoardView.vue'
import SalaryCalculatorView from '@/views/SalaryCalculatorView.vue'
import SavedJobsView from '@/views/SavedJobsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'jobs',
      component: JobsBoardView,
      meta: {
        titleKey: 'jobs',
      },
    },
    {
      path: '/saved',
      name: 'saved',
      component: SavedJobsView,
      meta: {
        titleKey: 'saved',
      },
    },
    {
      path: '/companies',
      name: 'companies',
      component: CompaniesView,
      meta: {
        titleKey: 'companies',
      },
    },
    {
      path: '/calculator',
      name: 'calculator',
      component: SalaryCalculatorView,
      meta: {
        titleKey: 'calculator',
      },
    },
    {
      path: '/applications',
      name: 'applications',
      component: CandidateApplicationsView,
      meta: {
        titleKey: 'applications',
        requiresAuth: true,
        role: 'seeker',
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: CandidateProfileView,
      meta: {
        titleKey: 'profile',
        requiresAuth: true,
        role: 'seeker',
      },
    },
    {
      path: '/employer',
      name: 'employer',
      component: EmployerWorkspaceView,
      meta: {
        titleKey: 'employer',
        requiresAuth: true,
        role: 'employer',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        titleKey: 'login',
        hideNavbar: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'jobs' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const preferencesStore = usePreferencesStore()
  const titleKey = to.meta.titleKey || 'jobs'
  if (typeof document !== 'undefined') {
    const dict = MESSAGES[preferencesStore.locale] || MESSAGES.en
    document.title = dict.pageTitles[titleKey] || MESSAGES.en.pageTitles.jobs
  }

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    const jobsStore = useJobsStore()

    if (!authStore.currentUser || (to.meta.role && authStore.currentUser.role !== to.meta.role)) {
      jobsStore.closeJobDetail()
      jobsStore.closePostJobModal()
      authStore.setAuthIntent({
        role: to.meta.role || 'seeker',
        mode: 'login',
        redirectPath: to.fullPath,
      })

      return {
        name: 'login',
        query: {
          role: to.meta.role || 'seeker',
          redirect: to.fullPath,
        },
      }
    }
  }
})

export default router
