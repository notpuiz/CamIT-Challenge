export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
export const isRemoteApiEnabled = Boolean(API_BASE_URL)
export const AUTH_TOKEN_KEY = 'jobspacekh-auth-token'

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function clearAuthToken() {
  removeStorage(AUTH_TOKEN_KEY)
}

export function buildQueryString(params = {}) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'all' ||
      value === 'All industries' ||
      value === 'All locations' ||
      value === 'All modes' ||
      value === 'All levels' ||
      value === 'All types'
    ) {
      continue
    }
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function apiRequest(path, { method = 'GET', body, query, headers = {}, signal } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError('Remote API base URL is not configured.', {
      status: 0,
      code: 'API_DISABLED',
    })
  }

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`
  const token = getAuthToken()
  const locale = typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en'

  const requestHeaders = {
    Accept: 'application/json',
    'Accept-Language': locale,
    ...headers,
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
    signal,
  }

  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    requestHeaders['Content-Type'] = 'application/json'
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  const rawText = await response.text()
  let parsedData = null
  if (rawText) {
    try {
      parsedData = JSON.parse(rawText)
    } catch {
      parsedData = rawText
    }
  }

  if (!response.ok) {
    const message =
      (parsedData && typeof parsedData === 'object' && parsedData.message) ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, {
      status: response.status,
      code: (parsedData && typeof parsedData === 'object' && parsedData.code) || 'HTTP_ERROR',
      details: parsedData,
    })
  }

  return parsedData
}
