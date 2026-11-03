/**
 * Creates the authenticated private Pusher subscription used by player live support.
 * The caller owns this subscription and must disconnect it when the view is disposed.
 */
export function createSupportRealtime({
  PusherConstructor,
  key,
  cluster,
  authEndpoint,
  token,
  userId,
  onConnected = () => {},
  onDisconnected = () => {},
  onMessage = () => {},
}) {
  if (
    typeof PusherConstructor !== 'function' ||
    !key ||
    !cluster ||
    !token ||
    userId === null ||
    userId === undefined ||
    userId === ''
  ) {
    return null
  }

  const channelName = 'private-users.' + userId
  const client = new PusherConstructor(key, {
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

  const channel = client.subscribe(channelName)
  client.connection.bind('connected', onConnected)
  client.connection.bind('disconnected', onDisconnected)
  client.connection.bind('unavailable', onDisconnected)
  client.connection.bind('failed', onDisconnected)
  channel.bind('support.message.created', onMessage)

  let disconnected = false

  return {
    client,
    channel,
    disconnect() {
      if (disconnected) return
      disconnected = true
      channel.unbind_all()
      client.unsubscribe(channelName)
      client.disconnect()
    },
  }
}

/**
 * Ignore player-originated events and messages for unrelated conversations.
 * Before the first history response, conversationId is not known yet.
 */
export function isRelevantSupportMessage(payload, conversationId, humanSupportRequested) {
  if (!humanSupportRequested || payload?.sender !== 'admin') return false
  if (!conversationId) return true
  return Number(payload.conversation_id) === Number(conversationId)
}
