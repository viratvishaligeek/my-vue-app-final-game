import { acquirePusherChannel } from './pusherManager.js'

/**
 * Acquire the authenticated player support channel from the shared Pusher
 * manager. Multiple consumers share one client and channel subscription.
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
  ) return null

  const channelName = 'private-users.' + userId
  const subscription = acquirePusherChannel({
    PusherConstructor,
    key,
    cluster,
    authEndpoint,
    token,
    channelName,
    events: { 'support.message.created': onMessage },
    onConnected,
    onDisconnected,
  })

  if (!subscription) return null

  let disconnected = false
  return {
    client: subscription.client,
    channel: subscription.channel,
    disconnect() {
      if (disconnected) return
      disconnected = true
      subscription.release()
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
