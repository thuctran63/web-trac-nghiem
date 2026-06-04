import rawQuestions from './questions.json'

export interface Question {
  section: string
  questionNumber: number
  question: string
  options: Record<string, string>
  correctAnswer: string
  type: 'multiple_choice' | 'true_false'
}

export interface QuestionSet {
  id: string
  name: string
  questions: Question[]
}

const allQuestions = (rawQuestions as { questions: Question[] }).questions

export const currentSet: QuestionSet = {
  id: 'tmh-1',
  name: 'Tai Mũi Họng',
  questions: allQuestions,
}

export function getSections(set: QuestionSet = currentSet): { slug: string; name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const q of set.questions) {
    map.set(q.section, (map.get(q.section) || 0) + 1)
  }
  const sections = Array.from(map.entries()).map(([name, count]) => ({
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    count,
  }))
  sections.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return sections
}

export function getQuestionsBySection(
  sectionName: string,
  set: QuestionSet = currentSet,
): Question[] {
  return set.questions.filter((q) => q.section === sectionName)
}
