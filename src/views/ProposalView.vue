<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useI18n } from '@/i18n/useI18n'

const { locale, setLocale } = useI18n()

const activeTab = ref('all') // 'all' | 'workflow' | 'proposal'

const tabIndex = computed(() => {
  if (activeTab.value === 'workflow') return 1
  if (activeTab.value === 'proposal') return 2
  return 0
})

const CONTENT = {
  en: {
    badge: 'CamIT-Challenge Documentation',
    title: 'System Workflow, Flowcharts & Project Proposal',
    subtitle:
      'Mobile-friendly reference guide covering how JobspaceKH works end-to-end, visual system flowcharts, and the formal CamIT-Challenge project proposal.',
    tabs: {
      all: 'Full Guide',
      workflow: 'Workflow',
      proposal: 'Proposal',
    },
    langHint: 'Reading language',
    backToBoard: 'Explore Live Board',
    part1Label: 'Part 01 · System Workflow & Flowcharts',
    journeyTitle: '1.1 End-to-End User Journey Flowchart',
    journeySub:
      'Every visitor can explore jobs, companies, and Cambodia salary tax estimates immediately before signing in as a Job Seeker or Company.',
    entrySteps: [
      {
        step: '01',
        title: 'Visitor Opens JobspaceKH',
        detail:
          'Restores saved EN / Khmer language, USD / KHR currency, and Light / Dark theme before first paint.',
      },
      {
        step: '02',
        title: 'Public Discovery Hub (No Login Needed)',
        detail:
          'Browse Jobs Board (/), Company Directory (/companies), Cambodia Tax Calculator (/calculator), and deep-linked Job Drawers (/?job=id).',
      },
      {
        step: '03',
        title: 'Role-Aware Auth Gate (/login)',
        detail:
          'Remembers which job the user clicked so they return straight to Quick Apply after signing in.',
      },
    ],
    seekerTrackTitle: 'Job Seeker Track',
    seekerTrackBadge: 'Candidate',
    seekerSteps: [
      {
        step: 'A1',
        title: 'Build Profile & Portfolio (/profile)',
        detail:
          'Save +855 phone, Telegram @handle, skills, default CV, GitHub/Website links, and Featured Portfolio Projects with Live Employer Preview.',
      },
      {
        step: 'A2',
        title: 'Bookmark & Filter Roles (/ & /saved)',
        detail:
          'Filter by Cambodia province, industry, work mode, and USD/KHR salary bracket; bookmark roles for comparison.',
      },
      {
        step: 'A3',
        title: '1-Click Quick Apply',
        detail:
          'Auto-prefills contact info, CV, and selected portfolio projects inside the job drawer.',
      },
      {
        step: 'A4',
        title: 'Track Status & Hiring Notes (/applications)',
        detail:
          'Follow real-time stage updates (New → Shortlisted → Interview → Offer) and read interview notes from employers.',
      },
    ],
    employerTrackTitle: 'Company / Employer Track',
    employerTrackBadge: 'Hiring Team',
    employerSteps: [
      {
        step: 'B1',
        title: 'Employer Hub Overview (/employer)',
        detail:
          'Monitor live KPIs: Open Roles, Total Applicants, and Shortlisted / Interview pipeline counts.',
      },
      {
        step: 'B2',
        title: 'Publish & Control Job Listings',
        detail:
          'Create or edit bilingual-ready roles with USD/KHR pay bands; pause, reopen, or delete listings anytime.',
      },
      {
        step: 'B3',
        title: 'Review CVs & Candidate Portfolios',
        detail:
          'Search applicants by name, email, or Telegram and inspect attached live portfolio projects.',
      },
      {
        step: 'B4',
        title: 'Advance Stage & Send Hiring Note',
        detail:
          'Update candidate status and save interview slots/notes — synced immediately to the candidate view.',
      },
    ],
    syncNote:
      'Real-Time State Sync: Employer stage & interview notes update the Job Seeker Applications view immediately.',
    lifecycleTitle: '1.2 Application Lifecycle Flowchart',
    lifecycleSub: 'Every submitted application moves through structured hiring stages:',
    lifecycleStages: [
      { name: 'Quick Apply', desc: 'Profile + CV + Portfolio prefilled', tone: 'neutral' },
      { name: 'New', desc: 'Delivered to Employer Hub', tone: 'sky' },
      { name: 'Shortlisted', desc: 'Selected for closer review', tone: 'amber' },
      { name: 'Interview', desc: 'Interview scheduled with hiring note', tone: 'violet' },
      { name: 'Offer', desc: 'Final job offer extended', tone: 'emerald' },
    ],
    lifecycleExitNote:
      'At New, Shortlisted, or Interview, an application can also exit cleanly as Declined (by employer) or Withdrawn (by candidate).',
    archTitle: '1.3 Dual-Mode Architecture & Auto-Deploy Flow',
    archSub:
      'JobspaceKH separates UI state from storage so it runs serverless on Vercel today and connects to any REST backend via a single env variable.',
    archFlow: [
      {
        layer: 'UI Layer',
        title: 'Vue 3 Views + Bilingual Engine',
        detail:
          'EN / Khmer messages, live USD ($) & KHR (៛) conversion, mobile-native drawers & View Transitions theme.',
      },
      {
        layer: 'State Layer',
        title: 'Pinia Reactive Stores',
        detail:
          'jobs.js, profile.js, auth.js, preferences.js, and toast.js keep views synchronized.',
      },
      {
        layer: 'Service Adapter',
        title: 'camitApi.js + apiClient.js',
        detail:
          'Checks VITE_API_BASE_URL: uses browser localStorage (jobspacekh-*) when unset, or REST fetch + Bearer token when configured.',
      },
      {
        layer: 'CI/CD Pipeline',
        title: 'GitHub (CamIT-Challenge) → Vercel Edge',
        detail:
          'Every git push to main triggers Vite 8 build (~350ms), applies SPA rewrites, and publishes zero-downtime updates.',
      },
    ],
    part2Label: 'Part 02 · Formal Project Proposal',
    proposalTitle: 'JobspaceKH — Cambodia Job Discovery & Portfolio Platform',
    metaItems: [
      { label: 'Project Name', value: 'JobspaceKH' },
      { label: 'Challenge Track', value: 'CamIT-Challenge — Modern Web Platform' },
      { label: 'Languages', value: 'English (EN) & Khmer (ខ្មែរ)' },
      { label: 'Currencies', value: 'USD ($) & Khmer Riel (៛)' },
      { label: 'Repository', value: 'github.com/notpuiz/CamIT-Challenge' },
      { label: 'Cloud Hosting', value: 'Vercel Global Edge CDN (Auto-Deploy)' },
    ],
    execTitle: '2.1 Executive Summary',
    execBody:
      'JobspaceKH is a mobile-first, bilingual (English / Khmer) job discovery and hiring web platform tailored specifically for Cambodia. Unlike English-only global portals or cluttered social media job posts, JobspaceKH unites transparent USD and Khmer Riel salary filtering, a Cambodia monthly salary tax calculator, portfolio-backed candidate profiles with Telegram contact handles, and an all-in-one Employer Hub in a fast single-page application.',
    problemTitle: '2.2 Problem Statement',
    problems: [
      {
        num: '01',
        title: 'Language & Search Fragmentation',
        desc: 'Global job boards exclude Khmer-first talent, while local social feeds lack structured filters for province, work mode, or salary.',
      },
      {
        num: '02',
        title: 'Mixed Currencies & Tax Uncertainty',
        desc: 'Cambodia job posts mix USD ($) and Riel (៛), leaving candidates unsure of their net take-home pay after progressive monthly salary tax.',
      },
      {
        num: '03',
        title: 'CV-Only Applications Hide Real Work',
        desc: 'Developers, designers, and graduates cannot showcase live demos or GitHub repos on traditional forms, while local hiring relies on Telegram (+855).',
      },
      {
        num: '04',
        title: 'Slow, Desktop-Heavy Portals on Mobile',
        desc: 'Most Cambodian job seekers browse on phones where sluggish multi-page layouts cause high application drop-off.',
      },
    ],
    solutionTitle: '2.3 Proposed Solution & Objectives',
    solutions: [
      {
        title: 'Instant Bilingual Switching (EN ↔ ខ្មែរ)',
        desc: 'Zero-reload translation across UI labels, Cambodian provinces, job categories, and listings using Plus Jakarta Sans + Kantumruy Pro.',
      },
      {
        title: 'Live USD / KHR Conversion & Tax Calculator',
        desc: 'Converts every salary band on the fly (1 USD ≈ 4,000 ៛) and calculates Cambodia resident monthly tax (0%–20%) and dependent allowances.',
      },
      {
        title: 'Portfolio-First Candidate Identity',
        desc: 'Reusable candidate profile with featured project cards, live links, Employer Preview mode, and 1-Click Quick Apply.',
      },
      {
        title: 'Streamlined SME Employer Workspace',
        desc: 'Fast job publishing, pause/reopen controls, portfolio review, applicant stage tracking, and direct interview notes.',
      },
    ],
    scopeTitle: '2.4 Core Functional Modules (Tap to Open)',
    modules: [
      {
        route: 'jobs',
        path: '/',
        name: 'Jobs Board',
        desc: 'Bilingual search, province & salary filters, deep-link drawer',
      },
      {
        route: 'saved',
        path: '/saved',
        name: 'Saved Jobs',
        desc: 'Persistent bookmarked roles for quick comparison',
      },
      {
        route: 'companies',
        path: '/companies',
        name: 'Companies',
        desc: 'Verified Cambodian employers, salary bands & perks',
      },
      {
        route: 'calculator',
        path: '/calculator',
        name: 'Tax Calculator',
        desc: 'Cambodia monthly salary tax & net pay in $ and ៛',
      },
      {
        route: 'profile',
        path: '/profile',
        name: 'Profile & Portfolio',
        desc: '+855 phone, Telegram, CV, featured projects & preview',
      },
      {
        route: 'applications',
        path: '/applications',
        name: 'My Applications',
        desc: 'Real-time status tracking & employer interview notes',
      },
      {
        route: 'employer',
        path: '/employer',
        name: 'Employer Hub',
        desc: 'Publish/pause jobs, review portfolios & manage stages',
      },
      {
        route: 'login',
        path: '/login',
        name: 'Role Auth & Demo',
        desc: 'Seeker/Company login with 1-click demo preview accounts',
      },
    ],
    roadmapTitle: '2.5 Implementation Roadmap',
    roadmap: [
      {
        phase: 'Phase 01',
        status: 'Completed',
        done: true,
        title: 'Core Bilingual SPA & Vercel Cloud Launch',
        desc: 'Full EN/Khmer UI, USD/KHR conversion, tax calculator, candidate portfolio builder, Employer Hub, mobile polish, and GitHub → Vercel CI/CD.',
      },
      {
        phase: 'Phase 02',
        status: 'Planned',
        done: false,
        title: 'REST API Backend & Cloud CV Storage',
        desc: 'Connect VITE_API_BASE_URL to Express/Laravel + PostgreSQL, JWT authentication, and S3/R2 PDF resume uploads.',
      },
      {
        phase: 'Phase 03',
        status: 'Planned',
        done: false,
        title: 'Telegram Bot Alerts & KHQR Integration',
        desc: 'Instant Telegram Bot notifications for job matches & interview invites, KHQR featured listings, and AI skill matching.',
      },
    ],
    impactTitle: '2.6 Expected Impact',
    impacts: [
      {
        metric: '>70%',
        label: 'Faster Repeat Applications',
        detail:
          'Saved profile, CV, and 1-click portfolio prefill eliminate repetitive typing on mobile.',
      },
      {
        metric: '2x',
        label: 'Richer Candidate Signal',
        detail:
          'Employers evaluate real portfolio projects alongside CVs and direct Telegram handles.',
      },
      {
        metric: '100%',
        label: 'Bilingual & Dual-Currency',
        detail: 'Accessible to both Khmer-first and English-speaking talent across all provinces.',
      },
    ],
  },
  km: {
    badge: 'ឯកសារគម្រោង CamIT-Challenge',
    title: 'លំហូរការងារប្រព័ន្ធ ដ្យាក្រាម និងសំណើគម្រោង',
    subtitle:
      'ឯកសារមគ្គុទ្ទេសក៍ដែលរៀបចំសម្រាប់អានលើទូរស័ព្ទដៃ បង្ហាញពីដំណើរការប្រព័ន្ធ JobspaceKH ដ្យាក្រាមលំហូរ និងសំណើគម្រោងផ្លូវការ។',
    tabs: {
      all: 'ទាំងអស់',
      workflow: 'លំហូរប្រព័ន្ធ',
      proposal: 'សំណើគម្រោង',
    },
    langHint: 'ភាសាអាន',
    backToBoard: 'ទៅកាន់ផ្ទាំងការងារ',
    part1Label: 'ផ្នែកទី ០១ · លំហូរការងារនៃប្រព័ន្ធ និងដ្យាក្រាម',
    journeyTitle: '១.១ ដ្យាក្រាមលំហូរអ្នកប្រើប្រាស់ទាំងមូល',
    journeySub:
      'អ្នកទស្សនាគ្រប់រូបអាចស្វែងរកការងារ មើលក្រុមហ៊ុន និងគណនាពន្ធប្រាក់ខែបានភ្លាមៗ មុននឹងចូលគណនីជាអ្នកស្វែងរកការងារ ឬក្រុមហ៊ុន។',
    entrySteps: [
      {
        step: '01',
        title: 'អ្នកប្រើប្រាស់បើកគេហទំព័រ JobspaceKH',
        detail:
          'ប្រព័ន្ធចងចាំភាសា (ខ្មែរ/EN) រូបិយប័ណ្ណ (USD/KHR) និងផ្ទៃភ្លឺ/ងងឹតដោយស្វ័យប្រវត្តិ។',
      },
      {
        step: '02',
        title: 'ទំព័រសាធារណៈ (មិនចាំបាច់ចូលគណនី)',
        detail:
          'រុករកផ្ទាំងការងារ (/), បញ្ជីក្រុមហ៊ុន (/companies), គណនាពន្ធប្រាក់ខែ (/calculator), និងមើលព័ត៌មានលម្អិតការងារ (/?job=id)។',
      },
      {
        step: '03',
        title: 'ច្រកចូលគណនីតាមតួនាទី (/login)',
        detail:
          'ចងចាំមុខតំណែងដែលអ្នកប្រើបានចុច ដើម្បីត្រឡប់មកបើកទម្រង់ដាក់ពាក្យវិញភ្លាមៗបន្ទាប់ពីចូលគណនី។',
      },
    ],
    seekerTrackTitle: 'លំហូរអ្នកស្វែងរកការងារ',
    seekerTrackBadge: 'បេក្ខជន',
    seekerSteps: [
      {
        step: 'A1',
        title: 'បង្កើតប្រវត្តិរូប និងស្នាដៃ (/profile)',
        detail:
          'រក្សាទុកលេខ +855, គណនី Telegram, ជំនាញ, CV គំរូ, តំណ GitHub/Website និងគម្រោងស្នាដៃលេចធ្លោ ព្រមទាំងមើលជាមុនសម្រាប់ក្រុមហ៊ុន។',
      },
      {
        step: 'A2',
        title: 'ចម្រាញ់ និងរក្សាទុកការងារ (/ និង /saved)',
        detail:
          'ចម្រាញ់តាមខេត្ត-ក្រុង វិស័យ របៀបធ្វើការ និងប្រាក់ខែ USD/KHR ព្រមទាំងរក្សាទុកមុខតំណែងដែលចាប់អារម្មណ៍។',
      },
      {
        step: 'A3',
        title: 'ដាក់ពាក្យរហ័ស 1-Click Quick Apply',
        detail: 'បំពេញព័ត៌មានទំនាក់ទំនង CV និងភ្ជាប់គម្រោងស្នាដៃពីប្រវត្តិរូបដោយស្វ័យប្រវត្តិ។',
      },
      {
        step: 'A4',
        title: 'តាមដានស្ថានភាព និងសារសម្ភាសន៍ (/applications)',
        detail:
          'តាមដានដំណាក់កាលជ្រើសរើស (ថ្មី → ជាប់សម្រាំង → សម្ភាសន៍ → ផ្តល់ការងារ) និងអានកំណត់ចំណាំពីក្រុមហ៊ុន។',
      },
    ],
    employerTrackTitle: 'លំហូរក្រុមហ៊ុនជ្រើសរើសបុគ្គលិក',
    employerTrackBadge: 'ក្រុមហ៊ុន',
    employerSteps: [
      {
        step: 'B1',
        title: 'ផ្ទាំងគ្រប់គ្រងក្រុមហ៊ុន (/employer)',
        detail:
          'ពិនិត្យតួលេខសំខាន់ៗ៖ មុខតំណែងកំពុងបើក ចំនួនបេក្ខជនសរុប និងបេក្ខជនជាប់សម្រាំង/សម្ភាសន៍។',
      },
      {
        step: 'B2',
        title: 'ប្រកាស និងគ្រប់គ្រងមុខតំណែង',
        detail:
          'បង្កើត ឬកែប្រែប្រកាសការងារជាមួយប្រាក់ខែ USD/KHR និងអាចផ្អាក បើកឡើងវិញ ឬលុបប្រកាសបានគ្រប់ពេល។',
      },
      {
        step: 'B3',
        title: 'ពិនិត្យ CV និងស្នាដៃបេក្ខជន (Portfolio)',
        detail:
          'ស្វែងរកបេក្ខជនតាមឈ្មោះ អ៊ីមែល ឬ Telegram និងចុចមើលគម្រោងស្នាដៃជាក់ស្តែងដែលបេក្ខជនបានភ្ជាប់។',
      },
      {
        step: 'B4',
        title: 'ប្តូរស្ថានភាព និងផ្ញើកំណត់ចំណាំសម្ភាសន៍',
        detail:
          'ផ្លាស់ប្តូរដំណាក់កាលបេក្ខជន និងរក្សាទុកម៉ោងសម្ភាសន៍ — ធ្វើបច្ចុប្បន្នភាពភ្លាមៗទៅកាន់ទំព័របេក្ខជន។',
      },
    ],
    syncNote:
      'ការភ្ជាប់ទិន្នន័យភ្លាមៗ៖ រាល់ការប្តូរស្ថានភាព និងកំណត់ចំណាំពីក្រុមហ៊ុន នឹងបង្ហាញភ្លាមៗនៅលើទំព័រការដាក់ពាក្យរបស់បេក្ខជន។',
    lifecycleTitle: '១.២ ដ្យាក្រាមវដ្តជីវិតនៃការដាក់ពាក្យការងារ',
    lifecycleSub: 'ពាក្យស្នើសុំនីមួយៗឆ្លងកាត់ដំណាក់កាលជ្រើសរើសយ៉ាងមានរបៀបរៀបរយ៖',
    lifecycleStages: [
      { name: 'ដាក់ពាក្យរហ័ស', desc: 'បំពេញ CV និងស្នាដៃស្វ័យប្រវត្តិ', tone: 'neutral' },
      { name: 'ថ្មី (New)', desc: 'បញ្ជូនដល់មជ្ឈមណ្ឌលក្រុមហ៊ុន', tone: 'sky' },
      { name: 'ជាប់សម្រាំង', desc: 'ជ្រើសចូលបញ្ជីពិនិត្យលម្អិត', tone: 'amber' },
      { name: 'សម្ភាសន៍', desc: 'ណាត់ម៉ោងសម្ភាសន៍ភ្ជាប់កំណត់ចំណាំ', tone: 'violet' },
      { name: 'ផ្តល់ការងារ', desc: 'ក្រុមហ៊ុនផ្តល់ឱកាសការងារផ្លូវការ', tone: 'emerald' },
    ],
    lifecycleExitNote:
      'នៅដំណាក់កាល ថ្មី ជាប់សម្រាំង ឬសម្ភាសន៍ ពាក្យស្នើសុំក៏អាចបញ្ចប់ដោយ បដិសេធ (ពីក្រុមហ៊ុន) ឬ ដកពាក្យវិញ (ដោយបេក្ខជន)។',
    archTitle: '១.៣ ស្ថាបត្យកម្មប្រព័ន្ធ និងការបង្ហោះស្វ័យប្រវត្តិលើ Cloud',
    archSub:
      'JobspaceKH បំបែកស្រទាប់ UI ចេញពីកន្លែងផ្ទុកទិន្នន័យ ដើម្បីដំណើរការលើ Vercel បានភ្លាមៗដោយមិនបាច់មាន Server និងត្រៀមភ្ជាប់ REST API គ្រប់ពេល។',
    archFlow: [
      {
        layer: 'ស្រទាប់ UI',
        title: 'Vue 3 Views + ប្រព័ន្ធពីរភាសា',
        detail:
          'ប្តូរភាសា ខ្មែរ/EN និងប្រាក់ខែ USD ($)/KHR (៛) ភ្លាមៗ រួមជាមួយចលនារលូនសម្រាប់ទូរស័ព្ទដៃ។',
      },
      {
        layer: 'ស្រទាប់គ្រប់គ្រងទិន្នន័យ',
        title: 'Pinia Reactive Stores',
        detail:
          'jobs.js, profile.js, auth.js, preferences.js និង toast.js រក្សាទិន្នន័យឱ្យស៊ីសង្វាក់គ្នាគ្រប់ទំព័រ។',
      },
      {
        layer: 'ស្រទាប់ភ្ជាប់ទិន្នន័យ',
        title: 'camitApi.js + apiClient.js',
        detail:
          'ពិនិត្យ VITE_API_BASE_URL៖ ប្រើ Browser localStorage (jobspacekh-*) ពេលមិនទាន់កំណត់ ឬភ្ជាប់ទៅ REST API ពេលកំណត់រួច។',
      },
      {
        layer: 'ប្រព័ន្ធ CI/CD ស្វ័យប្រវត្តិ',
        title: 'GitHub (CamIT-Challenge) → Vercel Edge',
        detail:
          'រាល់ពេល git push ទៅ main ប្រព័ន្ធនឹង Build ដោយស្វ័យប្រវត្តិ (~350ms) និងធ្វើបច្ចុប្បន្នភាពគេហទំព័រផ្ទាល់ភ្លាមៗ។',
      },
    ],
    part2Label: 'ផ្នែកទី ០២ · សំណើគម្រោងផ្លូវការ (Project Proposal)',
    proposalTitle: 'JobspaceKH — ថ្នាលស្វែងរកការងារ និងបង្ហាញស្នាដៃបេក្ខជននៅកម្ពុជា',
    metaItems: [
      { label: 'ឈ្មោះគម្រោង', value: 'JobspaceKH' },
      { label: 'កម្មវិធីប្រកួតប្រជែង', value: 'CamIT-Challenge — គេហទំព័រទំនើបសម្រាប់កម្ពុជា' },
      { label: 'ភាសាគាំទ្រ', value: 'ភាសាខ្មែរ (ខ្មែរ) និង អង់គ្លេស (EN)' },
      { label: 'រូបិយប័ណ្ណ', value: 'ដុល្លារអាមេរិក ($) និង ប្រាក់រៀលខ្មែរ (៛)' },
      { label: 'ប្រភពកូដ GitHub', value: 'github.com/notpuiz/CamIT-Challenge' },
      { label: 'ការបង្ហោះគេហទំព័រ', value: 'Vercel Global Edge CDN (ស្វ័យប្រវត្តិ)' },
    ],
    execTitle: '២.១ សេចក្តីសង្ខេបប្រតិបត្តិ (Executive Summary)',
    execBody:
      'JobspaceKH គឺជាគេហទំព័រស្វែងរកការងារ និងជ្រើសរើសបុគ្គលិកពីរភាសា (ខ្មែរ / អង់គ្លេស) ដែលផ្តោតលើភាពងាយស្រួលប្រើប្រាស់លើទូរស័ព្ទដៃសម្រាប់ទីផ្សារការងារនៅប្រទេសកម្ពុជា។ គម្រោងនេះរួមបញ្ចូលការបង្ហាញប្រាក់ខែប្រកបដោយតម្លាភាពជាដុល្លារ ($) និងរៀល (៛) កម្មវិធីគណនាពន្ធលើប្រាក់បៀវត្សកម្ពុជា ប្រវត្តិរូបបេក្ខជនភ្ជាប់គម្រោងស្នាដៃ (Portfolio) និង Telegram ព្រមទាំងមជ្ឈមណ្ឌលគ្រប់គ្រងការជ្រើសរើសសម្រាប់ក្រុមហ៊ុននៅកន្លែងតែមួយ។',
    problemTitle: '២.២ ចំណោទបញ្ហា (Problem Statement)',
    problems: [
      {
        num: '01',
        title: 'ឧបសគ្គភាសា និងការពិបាកស្វែងរក',
        desc: 'ថ្នាលអន្តរជាតិមានតែភាសាអង់គ្លេស ចំណែកការប្រកាសតាមបណ្តាញសង្គមពិបាកចម្រាញ់តាមខេត្ត វិស័យ ឬប្រាក់ខែ។',
      },
      {
        num: '02',
        title: 'ភាពច្របូកច្របល់នៃរូបិយប័ណ្ណ និងពន្ធប្រាក់ខែ',
        desc: 'ប្រកាសការងារលាយឡំរវាងដុល្លារ ($) និងរៀល (៛) ហើយបេក្ខជនពិបាកដឹងប្រាក់ខែសុទ្ធបន្ទាប់ពីកាត់ពន្ធប្រចាំខែ។',
      },
      {
        num: '03',
        title: 'ការដាក់តែឯកសារ CV មិនអាចបង្ហាញស្នាដៃពិត',
        desc: 'អ្នកអភិវឌ្ឍន៍កម្មវិធី អ្នករចនា និងនិស្សិតបញ្ចប់ការសិក្សាខ្វះកន្លែងភ្ជាប់គម្រោងស្នាដៃជាក់ស្តែង និងគណនី Telegram (+855)។',
      },
      {
        num: '04',
        title: 'គេហទំព័រចាស់ៗពិបាកប្រើលើទូរស័ព្ទដៃ',
        desc: 'អ្នករកការងារភាគច្រើនប្រើទូរស័ព្ទដៃ ប៉ុន្តែគេហទំព័រចាស់ៗមានទម្រង់ស្មុគស្មាញ និងផ្ទុកយឺត។',
      },
    ],
    solutionTitle: '២.៣ ដំណោះស្រាយ និងគោលបំណងគម្រោង',
    solutions: [
      {
        title: 'ប្តូរភាសាភ្លាមៗ (ខ្មែរ ↔ EN)',
        desc: 'គាំទ្រពីរភាសាពេញលេញទាំងម៉ឺនុយ ខេត្ត-ក្រុង និងមុខតំណែង ជាមួយពុម្ពអក្សរ Kantumruy Pro និង Plus Jakarta Sans។',
      },
      {
        title: 'បម្លែងប្រាក់ខែ USD / KHR និងគណនាពន្ធ',
        desc: 'បម្លែងប្រាក់ខែស្វ័យប្រវត្តិ (1 USD ≈ 4,000 ៛) និងគណនាពន្ធលើប្រាក់បៀវត្សប្រចាំខែនៅកម្ពុជា (0%–20%)។',
      },
      {
        title: 'ប្រវត្តិរូបភ្ជាប់ស្នាដៃ (Portfolio-First)',
        desc: 'រក្សាទុកគម្រោងស្នាដៃ តំណភ្ជាប់ផ្ទាល់ មើលជាមុនសម្រាប់ក្រុមហ៊ុន និងមុខងារដាក់ពាក្យរហ័សដោយចុចតែម្តង។',
      },
      {
        title: 'មជ្ឈមណ្ឌលជ្រើសរើសបុគ្គលិកដ៏រហ័ស',
        desc: 'ប្រកាស ផ្អាក ឬកែប្រែការងារ ពិនិត្យស្នាដៃបេក្ខជន ប្តូរស្ថានភាពជ្រើសរើស និងផ្ញើកំណត់ចំណាំសម្ភាសន៍។',
      },
    ],
    scopeTitle: '២.៤ មុខងារសំខាន់ៗក្នុងប្រព័ន្ធ (ចុចដើម្បីសាកល្បង)',
    modules: [
      {
        route: 'jobs',
        path: '/',
        name: 'ផ្ទាំងការងារ',
        desc: 'ស្វែងរកពីរភាសា ចម្រាញ់តាមខេត្ត និងប្រាក់ខែ',
      },
      {
        route: 'saved',
        path: '/saved',
        name: 'ការងាររក្សាទុក',
        desc: 'រក្សាទុកមុខតំណែងដែលចាប់អារម្មណ៍',
      },
      {
        route: 'companies',
        path: '/companies',
        name: 'បញ្ជីក្រុមហ៊ុន',
        desc: 'ក្រុមហ៊ុននៅកម្ពុជា ប្រាក់ខែ និងអត្ថប្រយោជន៍',
      },
      {
        route: 'calculator',
        path: '/calculator',
        name: 'គណនាពន្ធប្រាក់ខែ',
        desc: 'គណនាប្រាក់ខែសុទ្ធជា $ និង ៛ តាមច្បាប់កម្ពុជា',
      },
      {
        route: 'profile',
        path: '/profile',
        name: 'ប្រវត្តិរូប និងស្នាដៃ',
        desc: 'លេខ +855, Telegram, CV និងគម្រោងស្នាដៃ',
      },
      {
        route: 'applications',
        path: '/applications',
        name: 'ការដាក់ពាក្យរបស់ខ្ញុំ',
        desc: 'តាមដានស្ថានភាព និងអានសារសម្ភាសន៍',
      },
      {
        route: 'employer',
        path: '/employer',
        name: 'មជ្ឈមណ្ឌលក្រុមហ៊ុន',
        desc: 'ប្រកាសការងារ ពិនិត្យស្នាដៃ និងគ្រប់គ្រងបេក្ខជន',
      },
      {
        route: 'login',
        path: '/login',
        name: 'ចូលគណនី និងគំរូ',
        desc: 'បែងចែកបេក្ខជន/ក្រុមហ៊ុន រួមជាមួយគណនីសាកល្បងភ្លាមៗ',
      },
    ],
    roadmapTitle: '២.៥ ផែនទីបង្ហាញផ្លូវអភិវឌ្ឍន៍ (Project Roadmap)',
    roadmap: [
      {
        phase: 'ដំណាក់កាល ០១',
        status: 'បានបញ្ចប់',
        done: true,
        title: 'ថ្នាលពីរភាសាមូលដ្ឋាន និងការបង្ហោះលើ Vercel',
        desc: 'UI ខ្មែរ/EN រូបិយប័ណ្ណ $/៛ គណនាពន្ធ ប្រវត្តិរូប Portfolio មជ្ឈមណ្ឌលក្រុមហ៊ុន និងប្រព័ន្ធស្វ័យប្រវត្តិ GitHub → Vercel។',
      },
      {
        phase: 'ដំណាក់កាល ០២',
        status: 'គ្រោងទុក',
        done: false,
        title: 'ម៉ាស៊ីនមេ REST API និងប្រព័ន្ធផ្ទុកឯកសារ CV',
        desc: 'ភ្ជាប់ VITE_API_BASE_URL ទៅ Express/Laravel + PostgreSQL, ប្រព័ន្ធ JWT និងការបង្ហោះ PDF CV លើ Cloud។',
      },
      {
        phase: 'ដំណាក់កាល ០៣',
        status: 'គ្រោងទុក',
        done: false,
        title: 'ការជូនដំណឹងតាម Telegram Bot និងការទូទាត់ KHQR',
        desc: 'ផ្ញើដំណឹងការងារថ្មី និងការណាត់សម្ភាសន៍តាម Telegram Bot ការបង់ប្រាក់ប្រកាសលេចធ្លោតាម KHQR និង AI ផ្គូផ្គងជំនាញ។',
      },
    ],
    impactTitle: '២.៦ លទ្ធផលរំពឹងទុក (Expected Impact)',
    impacts: [
      {
        metric: '>70%',
        label: 'ដាក់ពាក្យលឿនជាងមុន',
        detail:
          'ប្រវត្តិរូប CV និងស្នាដៃបំពេញឱ្យស្វ័យប្រវត្តិ កាត់បន្ថយការវាយអក្សរដដែលៗលើទូរស័ព្ទ។',
      },
      {
        metric: '2x',
        label: 'វាយតម្លៃបេក្ខជនបានច្បាស់',
        detail: 'ក្រុមហ៊ុនអាចមើលឃើញស្នាដៃពិតប្រាកដ រួមជាមួយការទាក់ទងរហ័សតាម Telegram។',
      },
      {
        metric: '100%',
        label: 'គាំទ្រពីរភាសា និងពីររូបិយប័ណ្ណ',
        detail: 'ផ្តល់ឱកាសស្មើគ្នាសម្រាប់អ្នកប្រើប្រាស់ភាសាខ្មែរ និងអង់គ្លេសនៅគ្រប់ខេត្ត-ក្រុង។',
      },
    ],
  },
}

const copy = computed(() => (locale.value === 'km' ? CONTENT.km : CONTENT.en))

function stageBadgeClass(tone) {
  if (tone === 'sky') {
    return 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25'
  }
  if (tone === 'amber') {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25'
  }
  if (tone === 'violet') {
    return 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/25'
  }
  if (tone === 'emerald') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25'
  }
  return 'bg-zinc-100 text-zinc-700 ring-zinc-950/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10'
}
</script>

<template>
  <div class="min-h-svh">
    <main class="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 lg:px-8">
      <!-- Hero Card -->
      <section
        class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-7 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            {{ copy.badge }}
          </span>

          <RouterLink
            :to="{ name: 'jobs' }"
            class="proposal-btn inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 text-xs font-medium text-zinc-700 select-none dark:bg-zinc-800 dark:text-zinc-200"
          >
            <span>{{ copy.backToBoard }}</span>
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>

        <h1
          class="mt-4 text-xl font-bold tracking-[-0.02em] text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-50"
        >
          {{ copy.title }}
        </h1>
        <p class="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {{ copy.subtitle }}
        </p>

        <!-- Mobile-Friendly Controls: Section Tabs + Inline EN / Khmer Switch -->
        <div
          class="mt-5 flex flex-col gap-3 border-t border-zinc-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80"
        >
          <div
            role="tablist"
            class="relative grid h-9 w-full grid-cols-3 items-center rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-950/[0.06] select-none sm:w-80 dark:bg-zinc-950/70 dark:ring-white/10"
          >
            <span
              aria-hidden="true"
              class="tab-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800 dark:ring-white/10"
              :style="{ transform: `translateX(${tabIndex * 100}%)` }"
            />
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'all'"
              :class="[
                'proposal-tab relative z-10 h-8 cursor-pointer truncate rounded-[6px] px-2 text-xs font-medium',
                activeTab === 'all'
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400',
              ]"
              @click="activeTab = 'all'"
            >
              {{ copy.tabs.all }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'workflow'"
              :class="[
                'proposal-tab relative z-10 h-8 cursor-pointer truncate rounded-[6px] px-2 text-xs font-medium',
                activeTab === 'workflow'
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400',
              ]"
              @click="activeTab = 'workflow'"
            >
              {{ copy.tabs.workflow }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'proposal'"
              :class="[
                'proposal-tab relative z-10 h-8 cursor-pointer truncate rounded-[6px] px-2 text-xs font-medium',
                activeTab === 'proposal'
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400',
              ]"
              @click="activeTab = 'proposal'"
            >
              {{ copy.tabs.proposal }}
            </button>
          </div>

          <div class="flex items-center justify-between gap-2 sm:justify-end">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ copy.langHint }}:</span>
            <div class="inline-flex items-center gap-1.5">
              <button
                type="button"
                :aria-pressed="locale === 'en'"
                :class="[
                  'proposal-btn h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium select-none',
                  locale === 'en'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
                ]"
                @click="setLocale('en')"
              >
                English
              </button>
              <button
                type="button"
                :aria-pressed="locale === 'km'"
                :class="[
                  'proposal-btn h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium select-none',
                  locale === 'km'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
                ]"
                @click="setLocale('km')"
              >
                ភាសាខ្មែរ
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- PART 1: WORKFLOW & VISUAL FLOWCHARTS -->
      <div v-if="activeTab === 'all' || activeTab === 'workflow'" class="mt-8 space-y-6">
        <div class="flex items-center gap-3">
          <span
            class="text-xs font-semibold tracking-wider text-zinc-500 uppercase tabular-nums dark:text-zinc-400"
          >
            {{ copy.part1Label }}
          </span>
          <div class="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <!-- 1.1 End-to-End User Journey Flowchart -->
        <section
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            {{ copy.journeyTitle }}
          </h2>
          <p
            class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400"
          >
            {{ copy.journeySub }}
          </p>

          <!-- Shared Entry Flow Nodes -->
          <div class="mt-5 space-y-2">
            <template v-for="(item, idx) in copy.entrySteps" :key="item.step">
              <div
                class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {{ item.step }}
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ item.title }}
                    </h3>
                    <p
                      class="mt-0.5 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                      {{ item.detail }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="idx < copy.entrySteps.length - 1"
                class="flex justify-center"
                aria-hidden="true"
              >
                <svg
                  class="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </div>
            </template>
          </div>

          <!-- Branching Connector -->
          <div class="my-3 flex justify-center" aria-hidden="true">
            <svg
              class="h-5 w-5 shrink-0 text-zinc-400 dark:text-zinc-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3v8" />
              <path d="M6 15v6" />
              <path d="M18 15v6" />
              <path d="M6 15a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4" />
            </svg>
          </div>

          <!-- Two Role Branches: Stack on Mobile, Side-by-Side on Desktop -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Job Seeker Track -->
            <div
              class="rounded-xl border border-sky-200/80 bg-sky-50/40 p-4 dark:border-sky-500/20 dark:bg-sky-500/[0.04]"
            >
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {{ copy.seekerTrackTitle }}
                </h3>
                <span
                  class="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300"
                >
                  {{ copy.seekerTrackBadge }}
                </span>
              </div>

              <div class="mt-3 space-y-2.5">
                <div
                  v-for="step in copy.seekerSteps"
                  :key="step.step"
                  class="rounded-lg bg-white p-3 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-900 dark:ring-white/[0.08]"
                >
                  <div class="flex items-start gap-2.5">
                    <span
                      class="mt-0.5 inline-flex h-5 shrink-0 items-center rounded bg-sky-100 px-1.5 text-[10px] font-bold text-sky-800 tabular-nums dark:bg-sky-500/20 dark:text-sky-300"
                    >
                      {{ step.step }}
                    </span>
                    <div>
                      <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {{ step.title }}
                      </p>
                      <p class="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {{ step.detail }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Employer Track -->
            <div
              class="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/[0.04]"
            >
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {{ copy.employerTrackTitle }}
                </h3>
                <span
                  class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                >
                  {{ copy.employerTrackBadge }}
                </span>
              </div>

              <div class="mt-3 space-y-2.5">
                <div
                  v-for="step in copy.employerSteps"
                  :key="step.step"
                  class="rounded-lg bg-white p-3 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-900 dark:ring-white/[0.08]"
                >
                  <div class="flex items-start gap-2.5">
                    <span
                      class="mt-0.5 inline-flex h-5 shrink-0 items-center rounded bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-800 tabular-nums dark:bg-emerald-500/20 dark:text-emerald-300"
                    >
                      {{ step.step }}
                    </span>
                    <div>
                      <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {{ step.title }}
                      </p>
                      <p class="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {{ step.detail }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-4 rounded-xl bg-zinc-100/80 px-3.5 py-2.5 text-xs text-zinc-700 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-800/70 dark:text-zinc-300 dark:ring-white/10"
          >
            ⇄ {{ copy.syncNote }}
          </div>
        </section>

        <!-- 1.2 Application Lifecycle Flowchart -->
        <section
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            {{ copy.lifecycleTitle }}
          </h2>
          <p
            class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400"
          >
            {{ copy.lifecycleSub }}
          </p>

          <div class="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            <div
              v-for="(stage, idx) in copy.lifecycleStages"
              :key="stage.name"
              class="flex flex-col justify-between rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                    stageBadgeClass(stage.tone),
                  ]"
                >
                  {{ stage.name }}
                </span>
                <span class="text-[11px] font-medium text-zinc-400 tabular-nums"
                  >0{{ idx + 1 }}</span
                >
              </div>
              <p class="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {{ stage.desc }}
              </p>
            </div>
          </div>

          <p class="mt-3 max-w-[65ch] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {{ copy.lifecycleExitNote }}
          </p>
        </section>

        <!-- 1.3 Technical Architecture & Auto-Deploy Flow -->
        <section
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            {{ copy.archTitle }}
          </h2>
          <p
            class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400"
          >
            {{ copy.archSub }}
          </p>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              v-for="item in copy.archFlow"
              :key="item.layer"
              class="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
            >
              <span
                class="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
              >
                {{ item.layer }}
              </span>
              <h3 class="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {{ item.title }}
              </h3>
              <p class="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {{ item.detail }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- PART 2: FORMAL PROJECT PROPOSAL -->
      <div v-if="activeTab === 'all' || activeTab === 'proposal'" class="mt-10 space-y-6">
        <div class="flex items-center gap-3">
          <span
            class="text-xs font-semibold tracking-wider text-zinc-500 uppercase tabular-nums dark:text-zinc-400"
          >
            {{ copy.part2Label }}
          </span>
          <div class="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <!-- Proposal Overview & Metadata -->
        <section
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2
            class="text-lg font-bold tracking-[-0.02em] text-zinc-900 sm:text-xl dark:text-zinc-50"
          >
            {{ copy.proposalTitle }}
          </h2>

          <dl class="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="meta in copy.metaItems"
              :key="meta.label"
              class="rounded-xl bg-zinc-50 px-3.5 py-2.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.07]"
            >
              <dt class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {{ meta.label }}
              </dt>
              <dd class="mt-0.5 truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {{ meta.value }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 border-t border-zinc-200/70 pt-5 dark:border-zinc-800/80">
            <h3 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
              {{ copy.execTitle }}
            </h3>
            <p class="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {{ copy.execBody }}
            </p>
          </div>
        </section>

        <!-- Problem Statement & Proposed Solution -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section
            class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
          >
            <h2 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
              {{ copy.problemTitle }}
            </h2>
            <div class="mt-4 space-y-3">
              <div
                v-for="prob in copy.problems"
                :key="prob.num"
                class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.07]"
              >
                <div class="flex items-start gap-2.5">
                  <span
                    class="mt-0.5 text-xs font-bold text-zinc-400 tabular-nums dark:text-zinc-500"
                  >
                    {{ prob.num }}
                  </span>
                  <div>
                    <h3 class="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-zinc-100">
                      {{ prob.title }}
                    </h3>
                    <p
                      class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                      {{ prob.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
          >
            <h2 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
              {{ copy.solutionTitle }}
            </h2>
            <div class="mt-4 space-y-3">
              <div
                v-for="sol in copy.solutions"
                :key="sol.title"
                class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.05] dark:bg-zinc-950/60 dark:ring-white/[0.07]"
              >
                <div class="flex items-start gap-2.5">
                  <span
                    class="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 class="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-zinc-100">
                      {{ sol.title }}
                    </h3>
                    <p
                      class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                      {{ sol.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Interactive Functional Modules -->
        <section
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            {{ copy.scopeTitle }}
          </h2>

          <div class="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <RouterLink
              v-for="mod in copy.modules"
              :key="mod.route"
              :to="{ name: mod.route }"
              class="module-card flex flex-col justify-between rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.06] select-none dark:bg-zinc-950/60 dark:ring-white/[0.08]"
            >
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {{ mod.name }}
                  </span>
                  <code
                    class="rounded bg-zinc-200/70 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {{ mod.path }}
                  </code>
                </div>
                <p class="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {{ mod.desc }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Roadmap & Expected Impact -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
          <section
            class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
          >
            <h2 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
              {{ copy.roadmapTitle }}
            </h2>

            <div class="mt-4 space-y-3">
              <div
                v-for="step in copy.roadmap"
                :key="step.phase"
                class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="text-xs font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                    {{ step.phase }} · {{ step.title }}
                  </span>
                  <span
                    :class="[
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      step.done
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                    ]"
                  >
                    {{ step.status }}
                  </span>
                </div>
                <p
                  class="mt-1.5 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                >
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </section>

          <section
            class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-950/[0.07] sm:p-6 dark:bg-zinc-900/90 dark:ring-white/[0.08]"
          >
            <h2 class="text-base font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
              {{ copy.impactTitle }}
            </h2>

            <div class="mt-4 space-y-3">
              <div
                v-for="imp in copy.impacts"
                :key="imp.label"
                class="rounded-xl bg-zinc-50 p-3.5 ring-1 ring-zinc-950/[0.06] dark:bg-zinc-950/60 dark:ring-white/[0.08]"
              >
                <div class="flex items-baseline gap-2">
                  <span
                    class="text-xl font-bold tracking-[-0.02em] text-zinc-900 tabular-nums dark:text-zinc-50"
                  >
                    {{ imp.metric }}
                  </span>
                  <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {{ imp.label }}
                  </span>
                </div>
                <p
                  class="mt-1 max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                >
                  {{ imp.detail }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.tab-pill {
  transition: transform 180ms var(--ease-out);
}

.proposal-btn,
.proposal-tab,
.module-card {
  transition:
    transform 150ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.proposal-btn:active,
.proposal-btn[data-pressed='true'],
.proposal-tab:active,
.proposal-tab[data-pressed='true'],
.module-card:active,
.module-card[data-pressed='true'] {
  transform: scale(0.97);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .proposal-btn:hover {
    opacity: 0.92;
  }

  .module-card:hover {
    background-color: var(--chip-hover-bg);
    transform: translateY(-1px);
  }
}
</style>
