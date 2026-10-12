import { Sparkles } from 'lucide-react'
import SuggestionCard from './SuggestionCard.jsx'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

const suggestions = [
  {
    title: 'Jelaskan konsep',
    description: 'Sederhanakan topik teknis atau rumit agar mudah dipahami',
    icon: 'lightbulb',
  },
  {
    title: 'Bantu menulis',
    description: 'Tulis atau rapikan email, artikel, dan dokumen kerja',
    icon: 'pen',
  },
  {
    title: 'Bantu coding & debug',
    description: 'Tinjau baris kode, temukan bug, atau rancang arsitektur',
    icon: 'code',
  },
  {
    title: 'Eksplorasi ide',
    description: 'Diskusikan solusi kreatif dan sudut pandang baru',
    icon: 'sparkles',
  },
]

function EmptyState({ onSuggestionSelect }) {
  const greeting = getGreeting()

  return (
    <div className="empty-state">
      <div className="welcome-mark" aria-hidden="true">
        <Sparkles size={24} strokeWidth={2} />
      </div>
      <p className="welcome-eyebrow">{greeting}</p>
      <h1>Ada yang bisa saya bantu hari ini?</h1>
      <p className="welcome-description">
        Tanyakan apa saja, diskusikan ide, atau unggah dokumen untuk dianalisis.
      </p>
      <div className="suggestion-grid" aria-label="Saran pertanyaan">
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
