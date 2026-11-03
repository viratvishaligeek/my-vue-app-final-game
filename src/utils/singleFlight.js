/**
 * Coalesce overlapping calls while preserving the result for every caller.
 * A later call starts a fresh task after the current one settles.
 */
export function createSingleFlight(task) {
  let inFlight = null

  return (...args) => {
    if (inFlight) return inFlight

    inFlight = Promise.resolve()
      .then(() => task(...args))
      .finally(() => {
        inFlight = null
      })

    return inFlight
  }
}
