import { Sparkles, UserRound } from 'lucide-react'

function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant'

  return (
    <article className={`message-row ${isAssistant ? 'from-assistant' : 'from-user'}`}>
      <span className={`message-avatar ${isAssistant ? 'assistant-avatar' : 'user-avatar'}`} aria-hidden="true">
        {isAssistant ? <Sparkles size={15} /> : <UserRound size={16} />}
      </span>
      <div className="message-content">
        <span className="message-author">{isAssistant ? 'Nexa AI' : 'You'}</span>
        {message.status === 'loading' ? (
          <div className="typing-indicator" role="status" aria-label="Nexa AI is thinking">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className={`message-text${message.status === 'error' ? ' message-error' : ''}`}>
            {message.content}
          </div>
        )}
        {message.attachment && (
          <div className="attachment-chip">
            <span className="attachment-file-icon" aria-hidden="true">↗</span>
            <span>{message.attachment}</span>
          </div>
        )}
      </div>
    </article>
  )
}

export default MessageBubble
