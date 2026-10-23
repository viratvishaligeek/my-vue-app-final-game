const DEFAULT_MAX_ENTRIES = 120

export function createApiResponseCache({
  storage = null,
  now = () => Date.now(),
  maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) {
  const entries = new Map()
  const inFlight = new Map()
  let generation = 0
  const metrics = { hits: 0, misses: 0, deduplicated: 0, networkRequests: 0 }

  const removeExpired = () => {
    const currentTime = now()
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= currentTime) entries.delete(key)
    }
  }

  const remember = (key, response, ttl, scope, persistent) => {
    removeExpired()
    entries.delete(key)
    entries.set(key, { response, expiresAt: now() + ttl, scope })
    while (entries.size > maxEntries) entries.delete(entries.keys().next().value)

    if (persistent && storage) {
      try {
        storage.setItem(key, JSON.stringify({
          expiresAt: now() + ttl,
          data: response?.data,
        }))
      } catch {
        // Storage may be full or unavailable; the in-memory cache still works.
      }
    }
  }

  const getPersistent = (key, responseFromData) => {
    if (!storage) return null
    try {
      const raw = storage.getItem(key)
      if (!raw) return null
      const entry = JSON.parse(raw)
      if (!entry || entry.expiresAt <= now()) {
        storage.removeItem(key)
        return null
      }
      return responseFromData(entry.data)
    } catch {
      try { storage.removeItem(key) } catch { /* ignore storage errors */ }
      return null
    }
  }

  const getOrFetch = async (
    key,
    ttl,
    fetcher,
    { scope = 'private', persistent = false, responseFromData = (data) => ({ data }) } = {},
  ) => {
    removeExpired()
    const cached = entries.get(key)
    if (cached && cached.expiresAt > now()) {
      metrics.hits += 1
      return cached.response
    }

    if (persistent) {
      const persisted = getPersistent(key, responseFromData)
      if (persisted) {
        metrics.hits += 1
        entries.set(key, { response: persisted, expiresAt: now() + ttl, scope })
        return persisted
      }
    }

    const pending = inFlight.get(key)
    if (pending) {
      metrics.deduplicated += 1
      return pending
    }

    metrics.misses += 1
    metrics.networkRequests += 1
    const startedGeneration = generation
    const request = Promise.resolve().then(fetcher).then((response) => {
      if (startedGeneration === generation) remember(key, response, ttl, scope, persistent)
      return response
    }).finally(() => {
      if (inFlight.get(key) === request) inFlight.delete(key)
    })
    inFlight.set(key, request)
    return request
  }

  const clearPrivate = () => {
    generation += 1
    for (const [key, entry] of entries) {
      if (entry.scope === 'private') entries.delete(key)
    }
    inFlight.clear()
  }

  const clearAll = () => {
    generation += 1
    entries.clear()
    inFlight.clear()
    if (storage) {
      try {
        const keys = []
        for (let i = 0; i < storage.length; i += 1) {
          const key = storage.key(i)
          if (key?.startsWith('app-api-cache:')) keys.push(key)
        }
        keys.forEach((key) => storage.removeItem(key))
      } catch {
        // Persistent storage is optional.
      }
    }
  }

  return {
    getOrFetch,
    clearPrivate,
    clearAll,
    diagnostics: () => ({ ...metrics, entries: entries.size, inFlight: inFlight.size }),
  }
}

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      if (value[key] !== undefined) result[key] = stableValue(value[key])
      return result
    }, {})
  }
  return value
}

export function stableQueryString(params = {}) {
  const normalized = stableValue(params || {})
  const query = new URLSearchParams()
  const append = (key, value) => {
    if (value === null || value === undefined) return
    if (Array.isArray(value)) value.forEach((item) => append(key + '[]', item))
    else if (typeof value === 'object') query.set(key, JSON.stringify(value))
    else query.set(key, String(value))
  }
  Object.keys(normalized).sort().forEach((key) => append(key, normalized[key]))
  return query.toString()
}

const safeLocalStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export const apiResponseCache = createApiResponseCache({ storage: safeLocalStorage() })
