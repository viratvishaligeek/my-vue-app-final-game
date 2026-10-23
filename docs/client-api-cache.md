# App-side API cache inventory

The Axios client caches only allow-listed GET endpoints. Cache keys include the path, canonicalized query parameters, and (for authenticated responses) the stored authenticated user ID. Identical concurrent GETs share one in-flight request.

| Endpoint | Client TTL | Storage | Invalidation / freshness |
|---|---:|---|---|
| `GET /settings` | 5 minutes | In-memory, user-scoped | Cleared after successful mutations and auth changes |
| `GET /games/list` | 2 minutes | In-memory, user-scoped | Cleared after successful mutations and auth changes |
| `GET /result-chart/index?month=…&year=…` | 60 seconds | In-memory, user-scoped; query-sensitive | Separate entries by query; cleared after successful mutations |
| `GET /wallet/payment-methods` | 30 seconds | In-memory, user-scoped | Cleared after successful mutations |
| `GET /notifications` | 5 seconds | In-memory, user-scoped | Cleared after successful mutations; unread count endpoint remains uncached |
| `GET /faqs` | 5 minutes | Persistent browser/Capacitor local storage; public data only | Expires by TTL |
| `GET /app-update` | 5 minutes | Persistent browser/Capacitor local storage; public data only | Expires by TTL |

## Explicitly not cached

Wallet balance/summary, transaction and withdrawal history, pending payment requests, gateway payment status, payment creation/verification, current betting state, notification lists/counts, and profile responses that may include wallet fields are not cached. These endpoints must remain fresh or be invalidated according to their financial/security behavior.

## Invalidation and account isolation

- Every successful non-GET API response clears private in-memory entries. This is intentionally conservative to avoid stale data after mutations.
- Login, logout, 401/403 authentication failures, and account switching clear private cache entries.
- Authenticated cache entries are never persisted. Their keys are scoped by user ID.
- Public persistent cache entries contain only serialized response data—not request headers, tokens, or Axios config. Storage failures are ignored and the network request still runs.
- Monthly Chart re-fetches when the app returns to foreground if its last successful fetch is at least 60 seconds old.
- A cache generation counter prevents a request started before invalidation from repopulating the cache afterward.
- The cache never treats an API timeout as payment failure or wallet credit.

## Diagnostics and tests

In development, call `window.__APP_API_CACHE_DIAGNOSTICS__()` in the browser console to inspect cache hits, misses, deduplicated requests, cache-layer network requests, and total Axios requests. This provides a way to compare repeated navigation journeys, but no before/after production request-count benchmark has been collected yet.

Run `npm run test:unit` for expiry, persistence, query-key canonicalization, request deduplication, and Joda matcher tests.
