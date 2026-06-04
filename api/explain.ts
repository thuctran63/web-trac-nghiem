import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  generateExplanation,
  parseRequestBody,
  validateExplainPayload,
} from '../lib/explainCore'

export const config = {
  maxDuration: 60,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      return res.status(204).end()
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return res.status(503).json({
        error:
          'Chưa cấu hình DEEPSEEK_API_KEY. Thêm biến môi trường trên Vercel (Settings → Environment Variables).',
      })
    }

    const rawBody = parseRequestBody(req.body)
    const payload = validateExplainPayload(rawBody)
    const result = await generateExplanation(payload, apiKey)
    return res.status(200).json(result)
  } catch (e) {
    console.error('[api/explain]', e)
    const message = e instanceof Error ? e.message : 'Lỗi không xác định'
    const isClient =
      message.includes('Body') ||
      message.includes('Thiếu') ||
      message.includes('type không hợp lệ')
    return res.status(isClient ? 400 : 502).json({ error: message })
  }
}
