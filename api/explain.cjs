const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-v4-flash'

const SYSTEM_PROMPT = `Bạn là trợ lý giáo dục y khoa chuyên ngành Tai Mũi Họng (TMH), hỗ trợ bác sĩ ôn thi trắc nghiệm.

QUY TẮC BẮT BUỘC:
1. Chỉ dựa trên kiến thức y khoa đã được công nhận trong giáo trình, sách chuyên khoa TMH, và guideline (AAO-HNS, NCCN, Bộ Y tế VN, v.v.). KHÔNG bịa đặt số liệu, tên nghiên cứu, PMID, ISBN, hoặc số trang cụ thể nếu không chắc chắn.
2. Mỗi luận điểm quan trọng phải có ít nhất một mục trong "sources" — ghi tên tài liệu/nguồn thật, loại nguồn, và mô tả ngắn.
3. Nếu không đủ căn cứ chuẩn hóa, đặt confidence là "low" và nêu rõ trong summary; không suy đoán.
4. Trả lời bằng tiếng Việt, đúng JSON schema, không markdown.

JSON schema:
{"summary":"","whyCorrect":"","whyOthersWrong":"","noteOnUserChoice":"","sources":[{"title":"","type":"textbook|guideline|review|other","detail":""}],"confidence":"high|medium|low","disclaimer":""}`

function parseBody(body) {
  if (body == null) return null
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }
  return body
}

function validatePayload(body) {
  if (!body || typeof body !== 'object') throw new Error('Body không hợp lệ')
  if (typeof body.section !== 'string' || !body.section) throw new Error('Thiếu section')
  if (typeof body.questionNumber !== 'number') throw new Error('Thiếu questionNumber')
  if (typeof body.question !== 'string' || !body.question) throw new Error('Thiếu question')
  if (!body.options || typeof body.options !== 'object') throw new Error('Thiếu options')
  if (typeof body.correctAnswer !== 'string') throw new Error('Thiếu correctAnswer')
  if (typeof body.selectedAnswer !== 'string') throw new Error('Thiếu selectedAnswer')
  if (body.type !== 'multiple_choice' && body.type !== 'true_false') {
    throw new Error('type không hợp lệ')
  }
  return body
}

function buildUserPrompt(p) {
  const optionsText = Object.entries(p.options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}. ${v}`)
    .join('\n')

  const label = (key) =>
    p.type === 'true_false' ? (key === 'A' ? 'Đúng' : 'Sai') : (p.options[key] ?? key)

  return `Chuyên mục: ${p.section}
Câu ${p.questionNumber}

Câu hỏi:
${p.question}

Các phương án:
${optionsText}

Đáp án đúng: ${p.correctAnswer} — ${label(p.correctAnswer)}
Học viên chọn: ${p.selectedAnswer} — ${label(p.selectedAnswer)}
Học viên ${p.selectedAnswer === p.correctAnswer ? 'TRẢ LỜI ĐÚNG' : 'TRẢ LỜI SAI'}.

Trả lời JSON theo schema.`
}

function parseModelJson(content) {
  let raw
  try {
    raw = JSON.parse(content)
  } catch {
    throw new Error('AI trả về định dạng không hợp lệ')
  }

  const str = (k) => (typeof raw[k] === 'string' ? raw[k] : '')
  const sources = Array.isArray(raw.sources)
    ? raw.sources
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({
          title: typeof s.title === 'string' ? s.title : 'Nguồn tham khảo',
          type: ['textbook', 'guideline', 'review', 'other'].includes(s.type) ? s.type : 'other',
          detail: typeof s.detail === 'string' ? s.detail : undefined,
        }))
        .filter((s) => s.title.length > 0)
    : []

  const confidence = ['high', 'medium', 'low'].includes(raw.confidence) ? raw.confidence : 'medium'

  const result = {
    summary: str('summary') || 'Không có tóm tắt.',
    whyCorrect: str('whyCorrect') || 'Không có giải thích.',
    whyOthersWrong: str('whyOthersWrong'),
    noteOnUserChoice: str('noteOnUserChoice'),
    sources,
    confidence,
    disclaimer:
      str('disclaimer') ||
      'Nội dung mang tính tham khảo ôn thi, không thay thế chẩn đoán lâm sàng.',
  }

  if (result.sources.length === 0) {
    throw new Error('Thiếu nguồn tham khảo — không thể hiển thị giải thích y khoa')
  }

  return result
}

async function callDeepSeek(payload, apiKey) {
  const modelsToTry = [DEEPSEEK_MODEL, 'deepseek-chat']

  let lastError = null

  for (const model of modelsToTry) {
    const requestBody = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
      temperature: 0.2,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
    }

    if (model === DEEPSEEK_MODEL) {
      requestBody.thinking = { type: 'disabled' }
    }

    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      if (res.status === 401) throw new Error('API key DeepSeek không hợp lệ')
      if (res.status === 429) throw new Error('Vượt giới hạn gọi API — thử lại sau')
      let detail = errText.slice(0, 300)
      try {
        const j = JSON.parse(errText)
        detail = j.error?.message || j.message || detail
      } catch {
        /* keep */
      }
      lastError = new Error(detail || `Lỗi DeepSeek (${res.status})`)
      continue
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastError = new Error('AI không trả về nội dung')
      continue
    }
    return parseModelJson(content)
  }

  throw lastError || new Error('Không gọi được DeepSeek API')
}

async function handler(req, res) {
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

    const apiKey = (process.env.DEEPSEEK_API_KEY || process.env.API_KEY || '').trim()
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chưa cấu hình DEEPSEEK_API_KEY trên Vercel.',
      })
    }

    const payload = validatePayload(parseBody(req.body))
    const result = await callDeepSeek(payload, apiKey)
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

module.exports = handler
module.exports.config = { maxDuration: 60 }
