# JobspaceKH — Cambodia Job Discovery Platform

A bilingual (**English / ខ្មែរ**) job search and hiring web platform tailored for **Cambodia**, featuring live **$ USD / ៛ KHR** currency conversion, Cambodia monthly salary tax estimation, candidate profile & portfolio showcases, and a full employer workspace — running out-of-the-box in the browser via `localStorage` and ready to connect to any REST backend.

## Key Features

- **Bilingual Switcher (`EN` ↔ `ខ្មែរ`)**: Instant translation across navigation, job listings, filters, candidate applications, employer tools, and page titles (`Plus Jakarta Sans` + `Kantumruy Pro`).
- **Dual Currency (`$ USD` ↔ `៛ KHR`)**: Live salary conversion (`1 USD ≈ 4,000 ៛`) across job cards, filters, company directory, candidate expectations, and job posting forms.
- **Left Sidebar Search & Filtering**: Filter open roles by keyword, industry, Cambodia province/district, work mode (`On-site`, `Hybrid`, `Remote`), job type, experience level, and salary bracket — plus sortable results, active filter chips, and deep-link sharing (`/?job=...`).
- **Job Seeker Profile & Portfolio (`/profile`)**: Manage phone (`+855`), Telegram `@username`, skills, default CV, portfolio links (`Website`, `GitHub`, `LinkedIn`), and featured portfolio projects with a live **Employer Preview** tab and 1-click **Quick Apply** prefill.
- **Cambodia Salary & Tax Calculator (`/calculator`)**: Estimates net monthly take-home pay in `$` and `៛` using Cambodian resident salary tax brackets and dependent deductions.
- **Company Directory (`/companies`)**: Browse active Cambodian employers, salary bands, benefits, and open roles per company.
- **Employer Workspace (`/employer`)**: Create, edit, pause/reopen, and delete job posts; search/filter incoming applicants; save candidate hiring notes visible to applicants; update pipeline statuses (`New`, `Shortlisted`, `Interview`, `Offer`, `Declined`).
- **Interactive UI & Theme System**: Light/Dark mode with button-anchored View Transitions fade, tactile pointer/keyboard press feedback, toast notifications, and `Reset demo data` for repeatable demos.

## Tech Stack

- **Vue 3** (`<script setup>`)
- **Vite 8** + **Tailwind CSS v4**
- **Pinia** (state management) + **Vue Router 5** (history routing)
- **Service Layer**: `src/services/apiClient.js` + `src/services/camitApi.js` (auto-uses `localStorage` when `VITE_API_BASE_URL` is unset, or REST endpoints when configured)

## Quick Demo Accounts

Click the **Demo Job Seeker** or **Demo Company** quick preview buttons on `/login`:

- **Job Seeker**: `sokha@jobspace.kh` (includes prefilled profile, portfolio projects, and a shortlisted application)
- **Employer / Company**: `hr@mekonglabs.kh` (owns published roles and can review incoming candidates & portfolios)

## Local Development

```sh
npm install
npm run dev
```

Build & lint checks:

```sh
npm run format
npm run lint
npm run build
```

## Deploying Frontend-Only (No Backend Required)

This repository already includes `vercel.json`, `netlify.toml`, and `public/_redirects` for single-page app routing.

### Deploy to Vercel

1. Import this repository in [Vercel](https://vercel.com/).
2. If you push `CamIT` as your repository root, Vercel auto-detects `framework: "vite"`, `npm run build`, and `dist` from `vercel.json` (only set **Root Directory** to `CamIT` if pushing the outer parent folder).
3. Keep Node.js `22.x` and leave `VITE_API_BASE_URL` empty to run in browser `localStorage` demo mode.
4. Click **Deploy**.

### Deploy to Netlify

1. Import this repository in [Netlify](https://app.netlify.com/) *(or run `npm run build` and drag `CamIT/dist` to Netlify Drop)*.
2. Set **Base directory** to `CamIT`, Build command `npm run build`, and Publish directory `dist`.
3. Click **Deploy site**.

## Connecting a Backend Later

To switch from browser `localStorage` demo mode to your own REST server (Express, Laravel, FastAPI, etc.), set the environment variable:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```
