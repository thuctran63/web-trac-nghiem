import type { ExplanationStatus } from '../hooks/useExplanation'
import type { CachedExplanation } from '../types/explanation'

const SOURCE_TYPE_LABEL: Record<string, string> = {
  textbook: 'Sách / Giáo trình',
  guideline: 'Guideline',
  review: 'Bài review',
  other: 'Tài liệu',
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'Căn cứ vững',
  medium: 'Căn cứ trung bình',
  low: 'Cần đối chiếu thêm',
}

interface ExplanationPanelProps {
  status: ExplanationStatus
  data: CachedExplanation | null
  error: string | null
  fromCache: boolean
  isUserCorrect: boolean
  onRetry: () => void
}

export function ExplanationPanel({
  status,
  data,
  error,
  fromCache,
  isUserCorrect,
  onRetry,
}: ExplanationPanelProps) {
  if (status === 'idle') return null

  return (
    <section className="explanation-panel" aria-live="polite" aria-busy={status === 'loading'}>
      <header className="explanation-header">
        <div className="explanation-header-title">
          <span className="explanation-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              <path d="M5 19h14M8 22h8" strokeLinecap="round" />
            </svg>
          </span>
          <h3>Giải thích AI</h3>
        </div>
        {fromCache && status !== 'loading' && (
          <span className="explanation-badge">Đã lưu — không gọi API</span>
        )}
      </header>

      {status === 'loading' && (
        <div className="explanation-loading">
          <div className="explanation-skeleton" />
          <div className="explanation-skeleton explanation-skeleton--short" />
          <div className="explanation-skeleton explanation-skeleton--medium" />
          <p className="explanation-loading-text">DeepSeek đang soạn giải thích có nguồn tham khảo…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="explanation-error">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
            Thử lại
          </button>
        </div>
      )}

      {data && status !== 'loading' && status !== 'error' && (
        <div className="explanation-body">
          <div className="explanation-meta">
            <span className={`explanation-confidence explanation-confidence--${data.confidence}`}>
              {CONFIDENCE_LABEL[data.confidence] ?? data.confidence}
            </span>
            {!isUserCorrect && (
              <span className="explanation-user-wrong">Bạn chọn sai — xem gợi ý bên dưới</span>
            )}
          </div>

          <p className="explanation-summary">{data.summary}</p>

          <div className="explanation-block">
            <h4>Vì sao đáp án đúng</h4>
            <p>{data.whyCorrect}</p>
          </div>

          {data.whyOthersWrong && (
            <div className="explanation-block">
              <h4>Các phương án khác</h4>
              <p>{data.whyOthersWrong}</p>
            </div>
          )}

          {data.noteOnUserChoice && (
            <div className="explanation-block explanation-block--note">
              <h4>Nhận xét lựa chọn của bạn</h4>
              <p>{data.noteOnUserChoice}</p>
            </div>
          )}

          <div className="explanation-block">
            <h4>Nguồn tham khảo</h4>
            <ul className="explanation-sources">
              {data.sources.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  <span className="source-type">{SOURCE_TYPE_LABEL[s.type] ?? s.type}</span>
                  <strong>{s.title}</strong>
                  {s.detail && <span className="source-detail"> — {s.detail}</span>}
                </li>
              ))}
            </ul>
          </div>

          <p className="explanation-disclaimer">{data.disclaimer}</p>
        </div>
      )}
    </section>
  )
}
