export interface ExplainPayload {
  section: string
  questionNumber: number
  question: string
  options: Record<string, string>
  correctAnswer: string
  selectedAnswer: string
  type: 'multiple_choice' | 'true_false'
}

export interface ExplanationSource {
  title: string
  type: 'textbook' | 'guideline' | 'review' | 'other'
  detail?: string
}

export interface ExplanationResult {
  summary: string
  whyCorrect: string
  whyOthersWrong: string
  noteOnUserChoice: string
  sources: ExplanationSource[]
  confidence: 'high' | 'medium' | 'low'
  disclaimer: string
}
