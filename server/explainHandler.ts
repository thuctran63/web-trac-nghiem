import type {
  ExplainPayload,
  ExplanationResult,
  ExplanationSource,
} from '../shared/explanation'

export type { ExplainPayload, ExplanationResult, ExplanationSource }

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `Bạn là trợ lý giáo dục y khoa chuyên ngành Tai Mũi Họng (TMH), hỗ trợ bác sĩ ôn thi trắc nghiệm.

QUY TẮC BẮT BUỘC:
1. Chỉ dựa trên kiến thức y khoa đã được công nhận trong giáo trình, sách chuyên khoa TMH, và guideline (AAO-HNS, NCCN, Bộ Y tế VN, v.v.). KHÔNG bịa đặt số liệu, tên nghiên cứu, PMID, ISBN, hoặc số trang cụ thể nếu không chắc chắn.
2. Mỗi luận điểm quan trọng phải có ít nhất một mục trong "sources" — ghi tên tài liệu/nguồn thật, loại nguồn, và mô tả ngắn (ví dụ: chương/mục nếu biết chung, không cần số trang giả).
3. Nếu không đủ căn cứ chuẩn hóa để giải thích chắc chắn, đặt confidence là "low" và nêu rõ trong summary; không suy đoán.
4. Trả lời bằng tiếng Việt, đúng JSON schema, không markdown ngoài các trường chuỗi.

JSON schema (bắt buộc):
{
  "summary": "Tóm tắt 1-3 câu",
  "whyCorrect": "Giải thích vì sao đáp án đúng, có căn cứ",
  "whyOthersWrong": "Giải thích ngắn vì sao các phương án khác không đúng (hoặc chuỗi rỗng nếu đúng/sai)",
  "noteOnUserChoice": "Nhận xét lựa chọn của học viên; nếu đúng thì khen ngắn và củng cố",
  "sources": [{"title": "Tên sách/guideline", "type": "textbook|guideline|review|other", "detail": "Mô tả ngắn"}],
  "confidence": "high|medium|low",
  "disclaimer": "Nội dung mang tính tham khảo ôn thi, không thay thế chẩn đoán và điều trị lâm sàng."
}`

function buildUserPrompt(p: ExplainPayload): string {
  const optionsText = Object.entries(p.options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}. ${v}`)
    .join('\n')

  const selectedLabel =
    p.type === 'true_false'
      ? p.selectedAnswer === 'A'
        ? 'Đúng'
        : 'Sai'
      : p.options[p.selectedAnswer] ?? p.selectedAnswer

  const correctLabel =
    p.type === 'true_false'
      ? p.correctAnswer === 'A'
        ? 'Đúng'
        : 'Sai'
      : p.options[p.correctAnswer] ?? p.correctAnswer

  return `Chuyên mục: ${p.section}
Câu ${p.questionNumber} (${p.type === 'true_false' ? 'Đúng/Sai' : 'trắc nghiệm'})

Câu hỏi:
${p.question}

Các phương án:
${optionsText}

Đáp án đúng: ${p.correctAnswer} — ${correctLabel}
Học viên chọn: ${p.selectedAnswer} — ${selectedLabel}
Học viên ${p.selectedAnswer === p.correctAnswer ? 'TRẢ LỜI ĐÚNG' : 'TRẢ LỜI SAI'}.

Hãy giải thích theo schema JSON. Ưu tiên nguồn: sách TMH/giáo trình y khoa VN, Scott-Brown/Bailey ENT, Rosen's, Cummings, guideline chuyên ngành.`
}

function parseModelJson(content: string): ExplanationResult {
  let raw: unknown
  try {
    raw = JSON.parse(content)
  } catch {
    throw new Error('AI trả về định dạng không hợp lệ')
  }

  const o = raw as Record<string, unknown>
  const str = (k: string) => (typeof o[k] === 'string' ? o[k] : '')
  const sources = Array.isArray(o.sources)
    ? o.sources
        .filter((s): s is Record<string, unknown> => s != null && typeof s === 'object')
        .map((s) => ({
          title: typeof s.title === 'string' ? s.title : 'Nguồn tham khảo',
          type: (['textbook', 'guideline', 'review', 'other'].includes(String(s.type))
            ? s.type
            : 'other') as ExplanationSource['type'],
          detail: typeof s.detail === 'string' ? s.detail : undefined,
        }))
        .filter((s) => s.title.length > 0)
    : []

  const confidence = ['high', 'medium', 'low'].includes(String(o.confidence))
    ? (o.confidence as ExplanationResult['confidence'])
    : 'medium'

  const result: ExplanationResult = {
    summary: str('summary') || 'Không có tóm tắt.',
    whyCorrect: str('whyCorrect') || 'Không có giải thích.',
    whyOthersWrong: str('whyOthersWrong'),
    noteOnUserChoice: str('noteOnUserChoice'),
    sources,
    confidence,
    disclaimer:
      str('disclaimer') ||
      'Nội dung mang tính tham khảo ôn thi, không thay thế chẩn đoán và điều trị lâm sàng.',
  }

  if (result.sources.length === 0) {
    throw new Error('Thiếu nguồn tham khảo — không thể hiển thị giải thích y khoa')
  }

  return result
}

export async function generateExplanation(
  payload: ExplainPayload,
  apiKey: string,
): Promise<ExplanationResult> {
  if (!apiKey) {
    throw new Error('Chưa cấu hình DEEPSEEK_API_KEY trên server')
  }

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
      temperature: 0.2,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('API key DeepSeek không hợp lệ')
    if (res.status === 429) throw new Error('Vượt giới hạn gọi API — thử lại sau')
    throw new Error(errText || `Lỗi DeepSeek (${res.status})`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('AI không trả về nội dung')

  return parseModelJson(content)
}

export function validateExplainPayload(body: unknown): ExplainPayload {
  if (!body || typeof body !== 'object') throw new Error('Body không hợp lệ')
  const b = body as Record<string, unknown>
  if (typeof b.section !== 'string' || !b.section) throw new Error('Thiếu section')
  if (typeof b.questionNumber !== 'number') throw new Error('Thiếu questionNumber')
  if (typeof b.question !== 'string' || !b.question) throw new Error('Thiếu question')
  if (!b.options || typeof b.options !== 'object') throw new Error('Thiếu options')
  if (typeof b.correctAnswer !== 'string') throw new Error('Thiếu correctAnswer')
  if (typeof b.selectedAnswer !== 'string') throw new Error('Thiếu selectedAnswer')
  if (b.type !== 'multiple_choice' && b.type !== 'true_false') throw new Error('type không hợp lệ')
  return {
    section: b.section,
    questionNumber: b.questionNumber,
    question: b.question,
    options: b.options as Record<string, string>,
    correctAnswer: b.correctAnswer,
    selectedAnswer: b.selectedAnswer,
    type: b.type,
  }
}
