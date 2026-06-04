import {
  generateExplanation,
  validateExplainPayload,
} from '../server/explainHandler'

interface VercelRequest {
  method?: string
  body?: unknown
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  end: () => void
  setHeader: (name: string, value: string) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      error: 'Chưa cấu hình DEEPSEEK_API_KEY. Thêm biến môi trường trên Vercel hoặc file .env.local.',
    })
  }

  try {
    const payload = validateExplainPayload(req.body)
    const result = await generateExplanation(payload, apiKey)
    return res.status(200).json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định'
    const status = message.includes('Body') || message.includes('Thiếu') ? 400 : 502
    return res.status(status).json({ error: message })
  }
}
