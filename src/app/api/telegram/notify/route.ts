import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram credentials not configured' },
        { status: 500 }
      )
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    const resp = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    })

    const data = await resp.json()
    if (!resp.ok || !data.ok) {
      return NextResponse.json(
        { error: 'Failed to send Telegram message', details: data },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}


