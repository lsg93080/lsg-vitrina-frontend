import { ref } from 'vue'
import { getAuthorizationUrl } from '@/api/oauthService'
import type { OAuthProvider } from '@/types/models/oauth'

export interface OAuthPopupResult {
  success: boolean
  newConnection: boolean
  error?: string
}

const POPUP_WIDTH = 600
const POPUP_HEIGHT = 700
const POLL_INTERVAL_MS = 500

export function useOAuthPopup() {
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  async function connect(provider: OAuthProvider): Promise<OAuthPopupResult> {
    isConnecting.value = true
    error.value = null

    try {
      // Append ?provider= so oauth-callback.html knows which provider completed
      const callbackUrl =
        window.location.origin + '/vitrina/oauth-callback.html?provider=' + provider

      const { authorizationUrl } = await getAuthorizationUrl(provider, callbackUrl)

      const left = Math.round(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2)
      const top = Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2)

      const popup = window.open(
        authorizationUrl,
        'oauth_popup',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      )

      if (!popup) {
        throw new Error('Popup blocked by browser. Please allow popups for this site.')
      }

      return await new Promise<OAuthPopupResult>((resolve, reject) => {
        let settled = false
        const channel = new BroadcastChannel('oauth_channel')

        function settle(): void {
          if (settled) return
          settled = true
          clearInterval(pollTimer)
          window.removeEventListener('message', onMessage)
          channel.close()
        }

        function handleOAuthMessage(data: {
          type?: string
          provider?: OAuthProvider
          newConnection?: boolean
          error?: string
        }): void {
          if (data.type === 'oauth_success') {
            settle()
            resolve({ success: true, newConnection: data.newConnection ?? false })
          } else if (data.type === 'oauth_error') {
            settle()
            reject(new Error(data.error ?? 'OAuth authentication failed'))
          }
        }

        // BroadcastChannel: works even when window.opener is lost
        channel.onmessage = (event: MessageEvent) => {
          handleOAuthMessage(event.data)
        }

        // Fallback: postMessage from window.opener
        function onMessage(event: MessageEvent): void {
          if (event.origin !== window.location.origin) return
          handleOAuthMessage(event.data)
        }

        // Detect when the user closes the popup without completing the flow.
        // Grace period allows BroadcastChannel message to arrive after popup closes.
        let popupClosedAt = 0
        const GRACE_PERIOD_MS = 2000

        const pollTimer = setInterval(() => {
          if (!popup.closed || settled) {
            popupClosedAt = 0
            return
          }
          if (popupClosedAt === 0) {
            popupClosedAt = Date.now()
            return
          }
          if (Date.now() - popupClosedAt >= GRACE_PERIOD_MS) {
            settle()
            reject(new Error('cancelled'))
          }
        }, POLL_INTERVAL_MS)

        window.addEventListener('message', onMessage)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      throw err
    } finally {
      isConnecting.value = false
    }
  }

  return { isConnecting, error, connect }
}
