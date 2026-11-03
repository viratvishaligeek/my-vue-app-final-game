/**
 * Prevent repeated push-token registration calls during route navigation.
 * The endpoint is part of the identity because login/logout changes whether
 * a token belongs to an authenticated user or the public device subscription.
 */
export function createPushRegistrationCoordinator({
  register,
  storage,
  tokenKey = 'push_registration_token',
  scopeKey = 'push_registration_scope',
}) {
  let lastSignature = ''
  let inFlight = null
  let inFlightSignature = ''

  const read = key => {
    try { return storage?.getItem(key) || '' } catch { return '' }
  }
  const write = (key, value) => {
    try { storage?.setItem(key, value) } catch { /* storage is optional */ }
  }
  const remove = key => {
    try { storage?.removeItem(key) } catch { /* storage is optional */ }
  }

  const ensureRegistered = async ({ token, platform, endpoint }) => {
    if (!token || !platform || !endpoint) return false
    const scope = endpoint + '|' + platform
    const signature = scope + '|' + token

    if (
      signature === lastSignature ||
      (read(tokenKey) === token && read(scopeKey) === scope)
    ) {
      lastSignature = signature
      return true
    }

    if (inFlight) {
      if (inFlightSignature === signature) return inFlight
      await inFlight.catch(() => {})
      if (signature === lastSignature) return true
    }

    inFlightSignature = signature
    const request = Promise.resolve()
      .then(() => register(endpoint, { token, platform }))
      .then(() => {
        write(tokenKey, token)
        write(scopeKey, scope)
        lastSignature = signature
        return true
      })

    inFlight = request
    try {
      return await request
    } finally {
      if (inFlight === request) {
        inFlight = null
        inFlightSignature = ''
      }
    }
  }

  const clear = () => {
    lastSignature = ''
    remove(tokenKey)
    remove(scopeKey)
  }

  return { ensureRegistered, clear }
}
