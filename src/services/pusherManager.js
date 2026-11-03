/**
 * Module-wide Pusher lifecycle manager.
 *
 * A single authenticated client is shared by all feature subscriptions for
 * the same credentials. Channel subscriptions are reference-counted so one
 * view cannot disconnect another view's listeners.
 */
let client = null
let clientIdentity = null
const channels = new Map()

const identityFor = options => [
  options.key,
  options.cluster,
  options.authEndpoint,
  options.token,
].join('|')

const destroyClient = () => {
  if (!client) return

  for (const [channelName, entry] of channels) {
    for (const [eventName, callbacks] of entry.eventHandlers) {
      callbacks.forEach(callback => entry.channel.unbind?.(eventName, callback))
    }
    entry.connectionHandlers.forEach(({ eventName, callback }) => {
      client.connection.unbind?.(eventName, callback)
    })
    client.unsubscribe(channelName)
  }

  channels.clear()
  client.disconnect()
  client = null
  clientIdentity = null
}

export function acquirePusherChannel(options) {
  const {
    PusherConstructor,
    key,
    cluster,
    authEndpoint,
    token,
    channelName,
    events = {},
    onConnected = () => {},
    onDisconnected = () => {},
  } = options || {}

  if (
    typeof PusherConstructor !== 'function' ||
    !key ||
    !cluster ||
    !authEndpoint ||
    !token ||
    !channelName
  ) return null

  const nextIdentity = identityFor({ key, cluster, authEndpoint, token })
  if (client && clientIdentity !== nextIdentity) destroyClient()

  if (!client) {
    client = new PusherConstructor(key, {
      cluster,
      forceTLS: true,
      authEndpoint,
      auth: {
        headers: {
          Authorization: 'Bearer ' + token,
          Accept: 'application/json',
        },
      },
    })
    clientIdentity = nextIdentity
  }

  let entry = channels.get(channelName)
  if (!entry) {
    entry = {
      channel: client.subscribe(channelName),
      refs: 0,
      eventHandlers: new Map(),
      connectionHandlers: [],
    }
    channels.set(channelName, entry)
  }
  entry.refs += 1

  for (const [eventName, callback] of Object.entries(events)) {
    if (typeof callback !== 'function') continue
    entry.channel.bind(eventName, callback)
    const callbacks = entry.eventHandlers.get(eventName) || new Set()
    callbacks.add(callback)
    entry.eventHandlers.set(eventName, callbacks)
  }

  const bindConnection = (eventName, callback) => {
    if (typeof callback !== 'function') return
    client.connection.bind(eventName, callback)
    entry.connectionHandlers.push({ eventName, callback })
  }

  bindConnection('connected', onConnected)
  bindConnection('disconnected', onDisconnected)
  bindConnection('unavailable', onDisconnected)
  bindConnection('failed', onDisconnected)

  let released = false
  return {
    client,
    channel: entry.channel,
    release() {
      if (released) return
      released = true

      for (const [eventName, callback] of Object.entries(events)) {
        if (typeof callback !== 'function') continue
        entry.channel.unbind?.(eventName, callback)
        const callbacks = entry.eventHandlers.get(eventName)
        callbacks?.delete(callback)
        if (callbacks?.size === 0) entry.eventHandlers.delete(eventName)
      }

      entry.connectionHandlers.forEach(({ eventName, callback }) => {
        client?.connection.unbind?.(eventName, callback)
      })
      entry.connectionHandlers = []
      entry.refs = Math.max(0, entry.refs - 1)

      if (entry.refs === 0) {
        channels.delete(channelName)
        client?.unsubscribe(channelName)
      }
      if (channels.size === 0) destroyClient()
    },
  }
}

/** Explicitly close all realtime resources, e.g. on logout/account switch. */
export function disconnectPusher() {
  destroyClient()
}
