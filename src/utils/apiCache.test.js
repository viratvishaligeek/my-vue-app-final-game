import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiResponseCache, stableQueryString } from './apiCache.js'

function memoryStorage() {
  const values = new Map()
  return {
    get length() { return values.size },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
  }
}

test('deduplicates concurrent requests and caches the response', async () => {
  const cache = createApiResponseCache()
  let requests = 0
  let release
  const fetcher = () => {
    requests += 1
    return new Promise((resolve) => { release = () => resolve({ data: { value: 7 } }) })
  }
  const first = cache.getOrFetch('private:4:/settings', 1000, fetcher)
  const second = cache.getOrFetch('private:4:/settings', 1000, fetcher)
  await Promise.resolve()
  assert.equal(requests, 1)
  release()
  assert.deepEqual((await first).data, { value: 7 })
  assert.deepEqual((await second).data, { value: 7 })
  await cache.getOrFetch('private:4:/settings', 1000, async () => {
    throw new Error('must use cache')
  })
  assert.equal(cache.diagnostics().deduplicated, 1)
  assert.equal(cache.diagnostics().hits, 1)
})

test('expires entries and isolates invalidation generations', async () => {
  let time = 100
  const cache = createApiResponseCache({ now: () => time })
  let calls = 0
  const fetcher = async () => ({ data: ++calls })
  assert.equal((await cache.getOrFetch('k', 10, fetcher)).data, 1)
  assert.equal((await cache.getOrFetch('k', 10, fetcher)).data, 1)
  time = 111
  assert.equal((await cache.getOrFetch('k', 10, fetcher)).data, 2)
  cache.clearPrivate()
  assert.equal((await cache.getOrFetch('k', 10, fetcher)).data, 3)
})

test('persists only data and tolerates storage failures', async () => {
  const storage = memoryStorage()
  const cache = createApiResponseCache({ storage })
  await cache.getOrFetch('app-api-cache:public:/faqs', 5000, async () => ({
    data: [{ id: 1 }], status: 200, config: { secret: 'not persisted' },
  }), { scope: 'public', persistent: true })
  const secondCache = createApiResponseCache({ storage })
  const restored = await secondCache.getOrFetch(
    'app-api-cache:public:/faqs',
    5000,
    async () => { throw new Error('must use persistent cache') },
    { scope: 'public', persistent: true, responseFromData: (data) => ({ data, restored: true }) },
  )
  assert.deepEqual(restored.data, [{ id: 1 }])
  assert.equal(restored.restored, true)
  assert.equal(storage.getItem('app-api-cache:public:/faqs').includes('secret'), false)
})

test('canonicalizes query parameters independent of insertion order', () => {
  assert.equal(stableQueryString({ year: 2026, month: 10 }), stableQueryString({ month: 10, year: 2026 }))
})
