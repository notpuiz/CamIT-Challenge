<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { useProfileStore } from '@/stores/profile'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
  menuId: {
    type: String,
    default: 'jobs-nav-menu',
  },
})

const route = useRoute()
const { t } = useI18n()

const authStore = useAuthStore()
const jobsStore = useJobsStore()
const profileStore = useProfileStore()

const { currentUser } = storeToRefs(authStore)
const { openJobs, savedJobIds, myApplications, companies } = storeToRefs(jobsStore)
const { profile } = storeToRefs(profileStore)

const isOpen = ref(false)
const dropdownRef = ref(null)
const triggerRef = ref(null)
const menuRef = ref(null)

const canSeeApplications = computed(() => !currentUser.value || currentUser.value.role === 'seeker')

const menuItems = computed(() => {
  const items = [
    {
      id: 'jobs',
      to: { name: 'jobs' },
      label: t('nav.findJobs'),
      badge: String(openJobs.value.length),
      showTriggerCount: true,
      emphasizeCount: false,
      icon: 'search',
    },
    {
      id: 'saved',
      to: { name: 'saved' },
      label: t('nav.saved'),
      badge: String(savedJobIds.value.length),
      showTriggerCount: savedJobIds.value.length > 0,
      emphasizeCount: false,
      icon: 'bookmark',
    },
  ]

  if (canSeeApplications.value) {
    items.push(
      {
        id: 'applications',
        to: { name: 'applications' },
        label: t('nav.myApplications'),
        badge: String(myApplications.value.length),
        showTriggerCount: myApplications.value.length > 0,
        emphasizeCount: myApplications.value.length > 0,
        icon: 'applications',
      },
      {
        id: 'profile',
        to: { name: 'profile' },
        label: t('nav.myProfile'),
        badge: profile.value.cvFileName ? t('nav.cvReadyBadge') : '',
        showTriggerCount: false,
        emphasizeCount: false,
        icon: 'user',
      },
    )
  }

  items.push(
    {
      id: 'companies',
      to: { name: 'companies' },
      label: t('nav.companies'),
      badge: String(companies.value.length),
      showTriggerCount: true,
      emphasizeCount: false,
      icon: 'building',
    },
    {
      id: 'calculator',
      to: { name: 'calculator' },
      label: t('nav.salaryCalculator'),
      badge: '',
      showTriggerCount: false,
      emphasizeCount: false,
      icon: 'calculator',
    },
    {
      id: 'proposal',
      to: { name: 'proposal' },
      label: t('nav.proposal'),
      badge: '',
      showTriggerCount: false,
      emphasizeCount: false,
      icon: 'proposal',
    },
  )

  return items
})

const activeItem = computed(() => menuItems.value.find((item) => item.id === route.name) || null)
const isGroupActive = computed(() => Boolean(activeItem.value))
const displayItem = computed(() => activeItem.value || menuItems.value[0])

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) {
    triggerRef.value?.focus()
  }
}

function getMenuItemElements() {
  if (!menuRef.value) return []
  return Array.from(menuRef.value.querySelectorAll('[role="menuitem"]'))
}

async function openAndFocusItem(targetIndex = 0) {
  isOpen.value = true
  await nextTick()
  const items = getMenuItemElements()
  if (items.length === 0) return
  const resolvedIndex = targetIndex < 0 ? items.length - 1 : targetIndex
  items[resolvedIndex]?.focus()
}

function handleTriggerKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openAndFocusItem(0)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    openAndFocusItem(-1)
  } else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeMenu()
  }
}

function handleMenuKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu({ restoreFocus: true })
    return
  }

  if (event.key === 'Tab') {
    closeMenu()
    return
  }

  const items = getMenuItemElements()
  if (items.length === 0) return

  const currentIndex = items.indexOf(document.activeElement)

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    items[nextIndex]?.focus()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1
    items[prevIndex]?.focus()
  } else if (event.key === 'Home') {
    event.preventDefault()
    items[0]?.focus()
  } else if (event.key === 'End') {
    event.preventDefault()
    items[items.length - 1]?.focus()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)

function handleDocumentPointerDown(event) {
  if (!isOpen.value || !dropdownRef.value) return
  if (event.target instanceof Node && !dropdownRef.value.contains(event.target)) {
    closeMenu()
  }
}

function handleWindowResize() {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.offsetParent) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-flex">
    <button
      ref="triggerRef"
      type="button"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :aria-controls="menuId"
      :class="[
        compact
          ? [
              'dropdown-trigger inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
              isGroupActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10',
            ]
          : [
              'dropdown-trigger inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
              isGroupActive || isOpen
                ? 'bg-zinc-100 text-zinc-900 ring-1 ring-zinc-950/[0.08] dark:bg-zinc-800/90 dark:text-zinc-50 dark:ring-white/12'
                : 'bg-white/80 text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.08] dark:bg-zinc-900/80 dark:text-zinc-300 dark:ring-white/10',
            ],
      ]"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <svg
        :class="[compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'shrink-0 opacity-85']"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <template v-if="displayItem.icon === 'search'">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </template>
        <template v-else-if="displayItem.icon === 'bookmark'">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </template>
        <template v-else-if="displayItem.icon === 'user'">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </template>
        <template v-else-if="displayItem.icon === 'building'">
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </template>
        <template v-else-if="displayItem.icon === 'calculator'">
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="16" x2="16" y1="14" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
          <path d="M12 14h.01" />
          <path d="M8 14h.01" />
          <path d="M12 18h.01" />
          <path d="M8 18h.01" />
        </template>
        <template v-else-if="displayItem.icon === 'proposal'">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </template>
        <template v-else>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="m9 15 2 2 4-4" />
        </template>
      </svg>

      <span>{{ displayItem.label }}</span>

      <template v-if="displayItem.showTriggerCount && displayItem.badge">
        <span v-if="compact && isGroupActive" class="tabular-nums opacity-80">
          {{ displayItem.badge }}
        </span>
        <span
          v-else-if="displayItem.emphasizeCount"
          class="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[11px] leading-none font-medium text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900"
        >
          {{ displayItem.badge }}
        </span>
        <span
          v-else
          class="rounded-full bg-zinc-200/80 px-1.5 py-0.5 text-[11px] leading-none font-medium text-zinc-700 tabular-nums dark:bg-zinc-700/70 dark:text-zinc-200"
        >
          {{ displayItem.badge }}
        </span>
      </template>

      <svg
        class="dropdown-chevron h-3.5 w-3.5 shrink-0 opacity-70"
        :class="{ 'dropdown-chevron--open': isOpen }"
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
    </button>

    <Transition name="dropdown-pop">
      <div
        v-if="isOpen"
        :id="menuId"
        ref="menuRef"
        role="menu"
        :aria-label="t('nav.jobsMenuAria')"
        class="dropdown-panel absolute top-full left-0 z-50 mt-1.5 w-60 rounded-xl bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/10 sm:w-64 dark:bg-zinc-900 dark:shadow-[0_14px_34px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-white/12"
        @keydown="handleMenuKeydown"
      >
        <RouterLink
          v-for="item in menuItems"
          :key="item.id"
          :to="item.to"
          role="menuitem"
          :aria-current="route.name === item.id ? 'page' : undefined"
          :class="[
            'dropdown-item flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-200',
            route.name === item.id
              ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-zinc-50'
              : 'text-zinc-700 dark:text-zinc-300',
          ]"
          @click="closeMenu()"
        >
          <span class="flex min-w-0 items-center gap-2.5">
            <span
              :class="[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                route.name === item.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
              ]"
              aria-hidden="true"
            >
              <svg
                class="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <template v-if="item.icon === 'search'">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </template>
                <template v-else-if="item.icon === 'bookmark'">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </template>
                <template v-else-if="item.icon === 'user'">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </template>
                <template v-else-if="item.icon === 'building'">
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
                </template>
                <template v-else-if="item.icon === 'calculator'">
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <line x1="8" x2="16" y1="6" y2="6" />
                  <line x1="16" x2="16" y1="14" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </template>
                <template v-else-if="item.icon === 'proposal'">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </template>
                <template v-else>
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="m9 15 2 2 4-4" />
                </template>
              </svg>
            </span>
            <span class="truncate">{{ item.label }}</span>
          </span>

          <span class="flex shrink-0 items-center gap-1.5">
            <span
              v-if="item.badge"
              :class="[
                item.emphasizeCount
                  ? 'rounded-full bg-zinc-900 px-1.5 py-0.5 text-[11px] leading-none font-medium text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900'
                  : 'rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] leading-none font-medium text-zinc-600 tabular-nums ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10',
              ]"
            >
              {{ item.badge }}
            </span>

            <svg
              v-if="route.name === item.id"
              class="h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-panel {
  transform-origin: top left;
}

.dropdown-trigger,
.dropdown-item {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.dropdown-trigger:active,
.dropdown-trigger[data-pressed='true'] {
  transform: scale(0.97);
  transition-duration: 90ms;
}

.dropdown-item:active,
.dropdown-item[data-pressed='true'] {
  transform: scale(0.98);
  background-color: var(--chip-active-bg);
  transition-duration: 90ms;
}

.dropdown-chevron {
  transition: transform 180ms var(--ease-out);
}

.dropdown-chevron--open {
  transform: rotate(180deg);
}

@media (hover: hover) and (pointer: fine) {
  .dropdown-trigger:not(.bg-zinc-900):hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }

  .dropdown-item:not([aria-current='page']):hover {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}

.dropdown-pop-enter-active {
  transition:
    opacity 160ms var(--ease-out),
    transform 160ms var(--ease-out);
}

.dropdown-pop-leave-active {
  pointer-events: none;
  transition:
    opacity 115ms var(--ease-out),
    transform 115ms var(--ease-out);
}

.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-pop-enter-from,
  .dropdown-pop-leave-to {
    transform: none;
  }

  .dropdown-chevron {
    transition: none;
  }
}
</style>
