<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useI18n } from '@/i18n/useI18n'
import { useJobsStore } from '@/stores/jobs'
import { usePreferencesStore } from '@/stores/preferences'
import { KHR_PER_USD, calculateCambodiaSalaryTax, formatMoney } from '@/utils/currency'

const router = useRouter()
const { t } = useI18n()
const preferencesStore = usePreferencesStore()
const jobsStore = useJobsStore()

const { displayCurrency } = storeToRefs(preferencesStore)

const inputCurrency = ref(displayCurrency.value === 'KHR' ? 'KHR' : 'USD')
const grossSalary = ref(inputCurrency.value === 'KHR' ? '4800000' : '1200')
const dependents = ref(0)
const exchangeRate = ref(String(KHR_PER_USD))

const currencyOptions = computed(() => [
  { value: 'USD', label: t('postModal.usdOption') },
  { value: 'KHR', label: t('postModal.khrOption') },
])

const presets = computed(() => {
  if (inputCurrency.value === 'KHR') {
    return ['1600000', '3200000', '6000000', '10000000']
  }
  return ['400', '800', '1500', '2500']
})

const taxResult = computed(() =>
  calculateCambodiaSalaryTax({
    grossAmount: Number(grossSalary.value) || 0,
    currency: inputCurrency.value,
    dependents: dependents.value,
    exchangeRate: Number(exchangeRate.value) || KHR_PER_USD,
  }),
)

const brackets = [
  { id: 0, range: '0 – 1,500,000 ៛', rate: 0 },
  { id: 5, range: '1,500,001 – 2,000,000 ៛', rate: 5 },
  { id: 10, range: '2,000,001 – 8,500,000 ៛', rate: 10 },
  { id: 15, range: '8,500,001 – 12,500,000 ៛', rate: 15 },
  { id: 20, range: 'Over 12,500,000 ៛', rate: 20 },
]

function handleCurrencyChange(nextCurrency) {
  const rate = Math.max(100, Number(exchangeRate.value) || KHR_PER_USD)
  const numeric = Number(grossSalary.value) || 0
  if (nextCurrency === 'KHR' && inputCurrency.value === 'USD') {
    grossSalary.value = String(Math.round((numeric * rate) / 10000) * 10000)
  } else if (nextCurrency === 'USD' && inputCurrency.value === 'KHR') {
    grossSalary.value = String(Math.max(50, Math.round(numeric / rate)))
  }
  inputCurrency.value = nextCurrency
}

function browseMatchingJobs() {
  const usd = taxResult.value.grossUsd
  if (usd < 500) {
    jobsStore.filters.salaryBracket = 'under-500'
  } else if (usd <= 1000) {
    jobsStore.filters.salaryBracket = '500-1000'
  } else if (usd <= 2000) {
    jobsStore.filters.salaryBracket = '1000-2000'
  } else {
    jobsStore.filters.salaryBracket = '2000-plus'
  }
  router.push({ name: 'jobs' })
}
</script>

<template>
  <section aria-labelledby="calculator-heading">
    <div class="mb-6">
      <h1
        id="calculator-heading"
        class="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50"
      >
        {{ t('calculator.title') }}
      </h1>
      <p class="mt-1 max-w-[65ch] text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('calculator.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <!-- Input Controls Card -->
      <div
        class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
            <BaseInput
              id="calc-gross"
              v-model="grossSalary"
              :label="t('calculator.grossSalaryLabel')"
              type="number"
              inputmode="decimal"
            />
            <BaseSelect
              id="calc-currency"
              :model-value="inputCurrency"
              :label="t('calculator.currencyLabel')"
              :options="currencyOptions"
              @update:model-value="handleCurrencyChange"
            />
          </div>

          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="preset in presets"
              :key="preset"
              type="button"
              :aria-pressed="grossSalary === preset"
              :class="[
                'calc-preset inline-flex h-7 cursor-pointer items-center rounded-full px-2.5 text-xs font-medium tabular-nums select-none',
                grossSalary === preset
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
              ]"
              @click="grossSalary = preset"
            >
              {{ formatMoney(preset, inputCurrency) }}
            </button>
          </div>

          <div class="border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {{ t('calculator.dependentsLabel') }}
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  {{ t('calculator.dependentReliefNote') }}
                </p>
              </div>

              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease dependents"
                  :disabled="dependents <= 0"
                  class="stepper-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-800 select-none disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:text-zinc-200"
                  @click="dependents = Math.max(0, dependents - 1)"
                >
                  −
                </button>
                <span class="w-5 text-center text-sm font-semibold tabular-nums">
                  {{ dependents }}
                </span>
                <button
                  type="button"
                  aria-label="Increase dependents"
                  :disabled="dependents >= 8"
                  class="stepper-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-800 select-none disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:text-zinc-200"
                  @click="dependents = Math.min(8, dependents + 1)"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <BaseInput
            id="calc-rate"
            v-model="exchangeRate"
            :label="t('calculator.exchangeRateLabel')"
            type="number"
            inputmode="numeric"
          />

          <p class="max-w-[65ch] text-xs text-zinc-500 dark:text-zinc-400">
            {{ t('calculator.taxDisclaimer') }}
          </p>
        </div>
      </div>

      <!-- Output Results & Brackets -->
      <div class="space-y-4">
        <div
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {{ t('calculator.netMonthlyTitle') }}
          </div>
          <div data-currency-anim class="mt-2 flex flex-wrap items-baseline gap-3">
            <span
              class="text-3xl font-semibold tracking-[-0.02em] text-zinc-900 tabular-nums dark:text-zinc-50"
            >
              {{
                formatMoney(
                  displayCurrency === 'KHR' ? taxResult.netKhr : taxResult.netUsd,
                  displayCurrency,
                )
              }}
            </span>
            <span class="text-sm font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
              ≈
              {{
                formatMoney(
                  displayCurrency === 'KHR' ? taxResult.netUsd : taxResult.netKhr,
                  displayCurrency === 'KHR' ? 'USD' : 'KHR',
                )
              }}
            </span>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div data-currency-anim class="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950/60">
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ t('calculator.estimatedTaxTitle') }}
              </div>
              <div
                class="mt-1 text-base font-semibold text-zinc-900 tabular-nums dark:text-zinc-100"
              >
                {{
                  formatMoney(
                    displayCurrency === 'KHR' ? taxResult.taxKhr : taxResult.taxUsd,
                    displayCurrency,
                  )
                }}
              </div>
              <div class="text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
                ≈
                {{
                  formatMoney(
                    displayCurrency === 'KHR' ? taxResult.taxUsd : taxResult.taxKhr,
                    displayCurrency === 'KHR' ? 'USD' : 'KHR',
                  )
                }}
              </div>
            </div>

            <div class="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950/60">
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ t('calculator.marginalBracketTitle') }}
              </div>
              <div
                class="mt-1 text-base font-semibold text-zinc-900 tabular-nums dark:text-zinc-100"
              >
                {{ taxResult.marginalRate }}%
              </div>
              <div class="text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
                {{ t('calculator.taxableSalaryLabel') }}:
                {{ formatMoney(taxResult.taxableKhr, 'KHR') }}
              </div>
            </div>

            <div class="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950/60">
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ t('calculator.effectiveRateTitle') }}
              </div>
              <div
                class="mt-1 text-base font-semibold text-zinc-900 tabular-nums dark:text-zinc-100"
              >
                {{ taxResult.effectiveRate }}%
              </div>
            </div>
          </div>

          <div class="mt-5">
            <BaseButton variant="primary" @click="browseMatchingJobs">
              {{ t('calculator.browseMatchingJobs') }}
            </BaseButton>
          </div>
        </div>

        <!-- Progressive Bracket Reference -->
        <div
          class="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-zinc-950/[0.07] dark:bg-zinc-900/90 dark:ring-white/[0.08]"
        >
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ t('calculator.bracketsTitle') }}
          </h2>

          <div class="mt-3 overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr
                  class="border-b border-zinc-200/80 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                >
                  <th class="py-2 pr-4 font-medium">{{ t('calculator.bracketColRange') }}</th>
                  <th class="py-2 font-medium text-right">{{ t('calculator.bracketColRate') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                <tr
                  v-for="row in brackets"
                  :key="row.id"
                  :class="
                    taxResult.marginalRate === row.rate
                      ? 'bg-zinc-100/80 font-semibold text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50'
                      : 'text-zinc-600 dark:text-zinc-400'
                  "
                >
                  <td class="rounded-l-md px-2 py-2 tabular-nums">{{ row.range }}</td>
                  <td class="rounded-r-md px-2 py-2 text-right tabular-nums">{{ row.rate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calc-preset,
.stepper-btn {
  transition:
    transform 140ms var(--ease-out),
    background-color 150ms ease,
    color 150ms ease;
}

.calc-preset:active,
.calc-preset[data-pressed='true'],
.stepper-btn:active:not(:disabled),
.stepper-btn[data-pressed='true']:not(:disabled) {
  transform: scale(0.95);
  transition-duration: 90ms;
}

@media (hover: hover) and (pointer: fine) {
  .calc-preset[aria-pressed='false']:hover,
  .stepper-btn:hover:not(:disabled) {
    background-color: var(--chip-hover-bg);
    color: var(--link-hover-text);
  }
}
</style>
