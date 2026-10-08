import { ArrowUpRight, Code2, Lightbulb, PenLine, Sparkles } from 'lucide-react'

const icons = {
  lightbulb: Lightbulb,
  pen: PenLine,
  code: Code2,
  sparkles: Sparkles,
}

function SuggestionCard({ title, description, icon, onClick }) {
  const Icon = icons[icon]

  return (
    <button
      className="suggestion-card"
      type="button"
      onClick={onClick}
      aria-label={`Ask Nexa AI: ${title}`}
    >
      <span className="suggestion-icon"><Icon size={17} /></span>
      <span className="suggestion-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ArrowUpRight className="suggestion-arrow" size={16} aria-hidden="true" />
    </button>
  )
}

export default SuggestionCard
