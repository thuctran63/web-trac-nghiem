interface OptionButtonProps {
  label: string
  text: string
  selected?: boolean
  correct?: boolean
  wrong?: boolean
  disabled?: boolean
  onSelect: () => void
}

export function OptionButton({ label, text, selected, correct, wrong, disabled, onSelect }: OptionButtonProps) {
  let className = 'option-btn'
  if (selected && correct) className += ' option-correct'
  else if (selected && wrong) className += ' option-wrong'
  else if (!selected && correct && disabled) className += ' option-reveal'

  return (
    <button className={className} onClick={onSelect} disabled={disabled}>
      <span className="option-label">{label}</span>
      <span className="option-text">{text}</span>
      {selected && correct && <span className="option-icon">✓</span>}
      {selected && wrong && <span className="option-icon">✗</span>}
      {!selected && correct && disabled && <span className="option-icon">✓</span>}
    </button>
  )
}
