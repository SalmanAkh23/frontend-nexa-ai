import { Menu, MoreHorizontal, PanelLeftClose, Sparkles } from 'lucide-react'

function ChatHeader({ onMenuClick, onSettingsClick }) {
  return (
    <header className="chat-header">
      <div className="header-leading">
        <button
          className="icon-button menu-toggle"
          type="button"
          aria-label="Buka/tutup sidebar"
          onClick={onMenuClick}
        >
          <Menu className="menu-icon" size={19} />
          <PanelLeftClose className="collapse-icon" size={18} />
        </button>
        <span className="header-avatar" aria-hidden="true">
          <Sparkles size={16} />
        </span>
        <div className="header-title">
          <strong>Nexa AI</strong>
          <span><i aria-hidden="true" /> Asisten Pintar</span>
        </div>
      </div>
      <button
        className="icon-button header-more"
        type="button"
        aria-label="Pengaturan"
        onClick={onSettingsClick}
      >
        <MoreHorizontal size={21} />
      </button>
    </header>
  )
}

export default ChatHeader
