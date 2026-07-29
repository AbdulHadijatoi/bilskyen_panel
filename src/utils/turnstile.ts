/**
 * Cloudflare Turnstile helpers for panel auth forms.
 */

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptLoading: Promise<void> | null = null

function getSiteKey(): string {
  return (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() || ''
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as unknown as { turnstile?: unknown }).turnstile) return Promise.resolve()
  if (scriptLoading) return scriptLoading

  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-bilskyen-turnstile]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed')))
      return
    }
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    script.defer = true
    script.dataset.bilskyenTurnstile = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile script failed'))
    document.head.appendChild(script)
  })

  return scriptLoading
}

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string | number
  execute: (id: string | number, opts?: Record<string, unknown>) => void
  getResponse: (id: string | number) => string
  remove: (id: string | number) => void
}

function getTurnstile(): TurnstileApi | null {
  return ((window as unknown as { turnstile?: TurnstileApi }).turnstile) || null
}

/**
 * Obtain a Turnstile token (invisible). Returns empty string when site key unset (local).
 */
export async function getTurnstileToken(): Promise<string> {
  const siteKey = getSiteKey()
  if (!siteKey) return ''

  await loadTurnstileScript()
  const turnstile = getTurnstile()
  if (!turnstile) return ''

  const host = document.createElement('div')
  host.style.position = 'absolute'
  host.style.left = '-9999px'
  document.body.appendChild(host)

  return new Promise((resolve) => {
    let settled = false
    const finish = (token: string) => {
      if (settled) return
      settled = true
      try {
        turnstile.remove(widgetId)
      } catch {
        /* ignore */
      }
      host.remove()
      resolve(token)
    }

    const widgetId = turnstile.render(host, {
      sitekey: siteKey,
      size: 'invisible',
      callback: (token: string) => finish(token),
      'error-callback': () => finish(''),
    })

    try {
      turnstile.execute(widgetId)
    } catch {
      /* managed widgets may auto-execute */
    }

    setTimeout(() => {
      finish(turnstile.getResponse(widgetId) || '')
    }, 5000)
  })
}

export function honeypotPayload(): Record<string, string> {
  return { website: '' }
}
