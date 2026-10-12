import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'

export function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Gagal menyalin kode:', err)
    }
  }

  const displayLang = language || 'code'

  return (
    <div className="claude-code-block">
      <div className="claude-code-header">
        <div className="claude-code-meta">
          <Terminal size={14} className="code-lang-icon" />
          <span className="code-lang-tag">{displayLang}</span>
        </div>
        <button
          type="button"
          className={`claude-code-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label={copied ? 'Kode tersalin' : 'Salin kode'}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <div className="claude-code-content">
        <pre>
          <code>{value}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
