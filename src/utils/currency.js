export const KHR_PER_USD = 4000

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const pluralRules = new Intl.PluralRules('en')

export function toUsd(amount, currency) {
  const numeric = Number(amount) || 0
  return currency === 'KHR' ? numeric / KHR_PER_USD : numeric
}

export function convertAmount(amount, fromCurrency, toCurrency) {
  const numeric = Number(amount) || 0
  if (fromCurrency === toCurrency) {
    return Math.round(numeric)
  }
  if (fromCurrency === 'USD' && toCurrency === 'KHR') {
    return Math.round((numeric * KHR_PER_USD) / 10000) * 10000
  }
  if (fromCurrency === 'KHR' && toCurrency === 'USD') {
    return Math.max(5, Math.round(numeric / KHR_PER_USD / 5) * 5)
  }
  return Math.round(numeric)
}

export function formatMoney(amount, currency) {
  const formatted = numberFormatter.format(Math.round(Number(amount) || 0))
  return currency === 'KHR' ? `${formatted} ៛` : `$${formatted}`
}

export function formatSalaryRange(min, max, jobCurrency, displayCurrency) {
  const convertedMin = convertAmount(min, jobCurrency, displayCurrency)
  const convertedMax = convertAmount(max, jobCurrency, displayCurrency)
  const fmtMin = numberFormatter.format(convertedMin)
  const fmtMax = numberFormatter.format(convertedMax)

  if (displayCurrency === 'KHR') {
    return `${fmtMin} – ${fmtMax} ៛`
  }
  return `$${fmtMin} – $${fmtMax}`
}

export function formatSecondaryEquivalent(min, max, jobCurrency, displayCurrency) {
  const otherCurrency = displayCurrency === 'USD' ? 'KHR' : 'USD'
  return `≈ ${formatSalaryRange(min, max, jobCurrency, otherCurrency)}`
}

export function pluralize(count, singular, plural) {
  const word = pluralRules.select(count) === 'one' ? singular : plural
  return `${count} ${word}`
}

export function calculateCambodiaSalaryTax({
  grossAmount,
  currency = 'USD',
  dependents = 0,
  exchangeRate = KHR_PER_USD,
}) {
  const safeRate = Math.max(100, Number(exchangeRate) || KHR_PER_USD)
  const rawGross = Math.max(0, Number(grossAmount) || 0)
  const grossKhr = currency === 'KHR' ? Math.round(rawGross) : Math.round(rawGross * safeRate)
  const grossUsd = currency === 'USD' ? rawGross : grossKhr / safeRate

  const normalizedDependents = Math.max(0, Math.floor(Number(dependents) || 0))
  const dependentReliefKhr = normalizedDependents * 150000
  const taxableKhr = Math.max(0, grossKhr - dependentReliefKhr)

  let taxKhr = 0
  let marginalRate = 0

  if (taxableKhr > 12500000) {
    taxKhr = Math.round(1275000 + (taxableKhr - 12500000) * 0.2)
    marginalRate = 20
  } else if (taxableKhr > 8500000) {
    taxKhr = Math.round(675000 + (taxableKhr - 8500000) * 0.15)
    marginalRate = 15
  } else if (taxableKhr > 2000000) {
    taxKhr = Math.round(25000 + (taxableKhr - 2000000) * 0.1)
    marginalRate = 10
  } else if (taxableKhr > 1500000) {
    taxKhr = Math.round((taxableKhr - 1500000) * 0.05)
    marginalRate = 5
  }

  const netKhr = Math.max(0, grossKhr - taxKhr)
  const taxUsd = taxKhr / safeRate
  const netUsd = netKhr / safeRate
  const effectiveRate = grossKhr > 0 ? Math.round((taxKhr / grossKhr) * 1000) / 10 : 0

  return {
    grossKhr,
    grossUsd,
    dependentReliefKhr,
    taxableKhr,
    taxKhr,
    taxUsd,
    netKhr,
    netUsd,
    marginalRate,
    effectiveRate,
  }
}
