import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  generateExplanation,
  validateExplainPayload,
} from './server/explainHandler'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function explainApiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'explain-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/explain') return next()

        const respon = res as ServerResponse

        if (req.method === 'OPTIONS') {
          respon.statusCode = 204
          respon.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          respon.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          respon.end()
          return
        }

        if (req.method !== 'POST') {
          respon.statusCode = 405
          respon.setHeader('Content-Type', 'application/json')
          respon.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const apiKey = env.DEEPSEEK_API_KEY
        if (!apiKey) {
          respon.statusCode = 503
          respon.setHeader('Content-Type', 'application/json')
          respon.end(
            JSON.stringify({
              error:
                'Thiếu DEEPSEEK_API_KEY. Tạo file .env.local với DEEPSEEK_API_KEY=sk-...',
            }),
          )
          return
        }

        try {
          const raw = await readBody(req)
          const body = raw ? JSON.parse(raw) : {}
          const payload = validateExplainPayload(body)
          const result = await generateExplanation(payload, apiKey)
          respon.statusCode = 200
          respon.setHeader('Content-Type', 'application/json')
          respon.end(JSON.stringify(result))
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Lỗi không xác định'
          const status = message.includes('Thiếu') || message.includes('Body') ? 400 : 502
          respon.statusCode = status
          respon.setHeader('Content-Type', 'application/json')
          respon.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), explainApiDevPlugin(env)],
  }
})
