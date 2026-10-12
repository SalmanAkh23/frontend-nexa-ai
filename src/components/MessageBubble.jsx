import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from 'lucide-react'
import CodeBlock from './CodeBlock.jsx'

function MessageBubble({ message, onRegenerate }) {
  const isAssistant = message.role === 'assistant'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'up' | 'down' | null

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Gagal menyalin pesan:', err)
    }
  }

  const handleFeedback = (type) => {
    setFeedback((prev) => (prev === type ? null : type))
  }

  return (
    <article className={`message-row ${isAssistant ? 'from-assistant' : 'from-user'}`}>
      <span
        className={`message-avatar ${isAssistant ? 'assistant-avatar' : 'user-avatar'}`}
        aria-hidden="true"
      >
        {isAssistant ? <Sparkles size={16} /> : <UserRound size={16} />}
      </span>
      <div className="message-content">
        <div className="message-header-row">
          <span className="message-author">{isAssistant ? 'Nexa AI' : 'Anda'}</span>
        </div>

        {message.status === 'loading' ? (
          <div className="typing-indicator" role="status" aria-label="Nexa AI sedang berpikir">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className={`message-text${message.status === 'error' ? ' message-error' : ''}`}>
            {isAssistant ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isCodeBlock = !inline && (match || String(children).includes('\n'))

                    if (isCodeBlock) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={String(children).replace(/\n$/, '')}
                        />
                      )
                    }
                    return (
                      <code className="claude-inline-code" {...props}>
                        {children}
                      </code>
                    )
                  },
                  a({ node, children, href, ...props }) {
                    return (
                      <a href={href} target="_blank" rel="noreferrer" {...props}>
                        {children}
                      </a>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="user-message-plain">{message.content}</div>
            )}
          </div>
        )}

        {message.attachment && (
          <div className="attachment-chip">
            <span className="attachment-file-icon" aria-hidden="true">↗</span>
            <span>{message.attachment}</span>
          </div>
        )}

        {/* Claude Action Toolbar */}
        {!message.status && message.content && (
          <div className="message-actions-toolbar" aria-label="Aksi pesan">
            <button
              type="button"
              className={`message-action-btn ${copied ? 'active' : ''}`}
              onClick={handleCopyMessage}
              title={copied ? 'Tersalin' : 'Salin pesan'}
              aria-label={copied ? 'Pesan tersalin' : 'Salin pesan'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="btn-label">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {isAssistant && onRegenerate && (
              <button
                type="button"
                className="message-action-btn"
                onClick={() => onRegenerate(message.id)}
                title="Buat ulang respon"
                aria-label="Buat ulang respon"
              >
                <RotateCcw size={14} />
                <span className="btn-label">Ulangi</span>
              </button>
            )}

            {isAssistant && (
              <>
                <button
                  type="button"
                  className={`message-action-btn ${feedback === 'up' ? 'feedback-active' : ''}`}
                  onClick={() => handleFeedback('up')}
                  title="Respon bagus"
                  aria-label="Respon bagus"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  type="button"
                  className={`message-action-btn ${feedback === 'down' ? 'feedback-active' : ''}`}
                  onClick={() => handleFeedback('down')}
                  title="Respon kurang memuaskan"
                  aria-label="Respon kurang memuaskan"
                >
                  <ThumbsDown size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default MessageBubble
