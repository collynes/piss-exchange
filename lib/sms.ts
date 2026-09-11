// Bulk SMS via Advanta (Smart-SMS API) — the same gateway Dawahub already
// uses. Configure ADVANTA_API_KEY, ADVANTA_PARTNER_ID and ADVANTA_SHORTCODE
// once credentials are issued; until then this silently no-ops so it's safe
// to ship ahead of the credentials arriving.
//
// Fire-and-forget by design, same as captureServerEvent's local-log sink —
// an SMS gateway outage must never block a trading operation (order
// creation, payment, etc). Callers should not await this for anything
// user-facing; call it and move on.

const ADVANTA_URL = 'https://quicksms.advantasms.com/api/services/sendsms/'

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const trimmed = phone.trim().replace(/^\+/, '').replace(/^0/, '254')
  return /^254\d{9}$/.test(trimmed) ? trimmed : null
}

export function sendSms(phone: string | null | undefined, message: string): void {
  const apiKey = process.env.ADVANTA_API_KEY
  const partnerId = process.env.ADVANTA_PARTNER_ID
  const shortcode = process.env.ADVANTA_SHORTCODE
  if (!apiKey || !partnerId || !shortcode) return // not configured yet — no-op

  const mobile = normalizePhone(phone)
  if (!mobile) return

  void (async () => {
    try {
      await fetch(ADVANTA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: apiKey,
          partnerID: partnerId,
          shortcode,
          mobile,
          message: message.slice(0, 459), // Advanta caps at 3 concatenated SMS segments
        }),
      })
    } catch {
      // swallowed — an SMS failure must never surface to the caller
    }
  })()
}
