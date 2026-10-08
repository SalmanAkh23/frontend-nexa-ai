import { Sparkles } from 'lucide-react'
import SuggestionCard from './SuggestionCard.jsx'

const suggestions = [
  {
    title: 'Explain something',
    description: 'Make a complex topic feel simple',
    icon: 'lightbulb',
  },
  {
    title: 'Write something',
    description: 'Find the right words for any moment',
    icon: 'pen',
  },
  {
    title: 'Help me code',
    description: 'Build, debug, and understand code',
    icon: 'code',
  },
  {
    title: 'Brainstorm ideas',
    description: 'Explore new angles and possibilities',
    icon: 'sparkles',
  },
]

function EmptyState({ onSuggestionSelect }) {
  return (
    <div className="empty-state">
      <div className="welcome-mark" aria-hidden="true">
        <Sparkles size={25} strokeWidth={1.8} />
      </div>
      <p className="welcome-eyebrow">A LITTLE MORE CLARITY, EVERY DAY</p>
      <h1>Nexa AI</h1>
      <p className="welcome-description">
        Your intelligent assistant for everyday tasks.
      </p>
      <div className="suggestion-grid" aria-label="Try asking Nexa AI">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.title}
            {...suggestion}
            onClick={() => onSuggestionSelect(suggestion.title)}
          />
        ))}
      </div>
    </div>
  )
}

export default EmptyState
