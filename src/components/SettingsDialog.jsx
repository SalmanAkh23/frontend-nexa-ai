import { useEffect } from 'react'
import { Moon, Sun, Trash2, X } from 'lucide-react'

function SettingsDialog({
  onClose,
  onClearHistory,
  settings,
  onSettingsChange,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="section-label">PREFERENCES</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close settings" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <strong>Appearance</strong>
            <span>Choose how Nexa AI looks on this device.</span>
          </div>
          <div className="theme-options" role="group" aria-label="Appearance">
            <button
              type="button"
              className={settings.theme === 'light' ? 'is-selected' : ''}
              aria-pressed={settings.theme === 'light'}
              onClick={() => onSettingsChange({ ...settings, theme: 'light' })}
            >
              <Sun size={16} /> Light
            </button>
            <button
              type="button"
              className={settings.theme === 'dark' ? 'is-selected' : ''}
              aria-pressed={settings.theme === 'dark'}
              onClick={() => onSettingsChange({ ...settings, theme: 'dark' })}
            >
              <Moon size={16} /> Dark
            </button>
            <button
              type="button"
              className={settings.theme === 'system' ? 'is-selected' : ''}
              aria-pressed={settings.theme === 'system'}
              onClick={() => onSettingsChange({ ...settings, theme: 'system' })}
            >
              System
            </button>
          </div>
        </div>

        <label className="settings-toggle">
          <span>
            <strong>Send messages with Enter</strong>
            <small>Use Shift + Enter to add a new line.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.enterToSend}
            onChange={(event) =>
              onSettingsChange({ ...settings, enterToSend: event.target.checked })
            }
          />
        </label>

        <div className="settings-danger-zone">
          <div>
            <strong>Delete all chats</strong>
            <span>Permanently remove all conversations from your account.</span>
          </div>
          <button className="delete-all-button" type="button" onClick={onClearHistory}>
            <Trash2 size={15} /> Delete all
          </button>
        </div>

        <button className="dialog-done" type="button" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}

export default SettingsDialog
