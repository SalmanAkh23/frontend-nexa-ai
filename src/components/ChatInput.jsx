import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Paperclip } from 'lucide-react'

function ChatInput({ onSend, enterToSend, disabled }) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [fileError, setFileError] = useState('')
  const canSend = Boolean(value.trim() || file)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [value])

  function submitMessage() {
    if (!canSend || disabled) return
    onSend({
      text: value,
      attachment: file?.name,
      attachmentContent: file?.content,
    })
    setValue('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleKeyDown(event) {
    const shouldSend =
      (enterToSend && event.key === 'Enter' && !event.shiftKey) ||
      (!enterToSend && event.key === 'Enter' && (event.ctrlKey || event.metaKey))
    if (shouldSend && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          submitMessage()
        }}
      >
        {file && (
          <div className="selected-file">
            <span>{file.name}</span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => {
                setFile(null)
                setFileError('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            >
              ×
            </button>
          </div>
        )}
        {file && (
          <p className="attachment-notice" role="status">
            Isi file teks akan disertakan sebagai konteks untuk Nexa AI.
          </p>
        )}
        {fileError && <p className="attachment-notice attachment-error" role="alert">{fileError}</p>}
        <div className="composer-row">
          <button
            className="attach-button"
            type="button"
            aria-label="Lampirkan file"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={19} />
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            aria-label="Pilih file untuk dilampirkan"
            accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
            onChange={async (event) => {
              const selectedFile = event.target.files?.[0]
              setFile(null)
              setFileError('')
              if (!selectedFile) return
              if (selectedFile.size > 20_000) {
                setFileError('File terlalu besar. Batas ukuran adalah 20 KB.')
                event.target.value = ''
                return
              }
              if (!/\.(txt|md|csv|json)$/i.test(selectedFile.name)) {
                setFileError('Format file yang didukung: TXT, MD, CSV, dan JSON.')
                event.target.value = ''
                return
              }
              try {
                const content = await selectedFile.text()
                setFile({
                  name: selectedFile.name,
                  content: content.slice(0, 2500),
                })
              } catch {
                setFileError('File tidak dapat dibaca. Silakan pilih file lain.')
                event.target.value = ''
              }
            }}
          />
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            aria-label="Kirim pesan ke Nexa AI"
            placeholder="Tanyakan apa saja kepada Nexa AI..."
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={1000}
          />
          <button
            className="send-button"
            type="submit"
            aria-label="Kirim pesan"
            disabled={!canSend || disabled}
          >
            <ArrowUp size={19} strokeWidth={2.3} />
          </button>
        </div>
      </form>
      <p className="composer-note">Nexa AI dapat membuat kesalahan. Harap verifikasi informasi penting.</p>
    </div>
  )
}

export default ChatInput
