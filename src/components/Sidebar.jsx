import {
  Sparkles,
  ChevronLeft,
  MessageSquare,
  Plus,
  LogOut,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'

function Sidebar({
  conversations,
  currentConversationId,
  isOpen,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onOpenSettings,
  onSignOut,
  user,
  onClose,
}) {
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-top">
        <a className="brand" href="/" aria-label="Nexa AI Beranda">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={18} strokeWidth={2.2} />
          </span>
          <span className="brand-name">Nexa AI</span>
        </a>
        <button
          className="icon-button sidebar-close"
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <button className="new-chat-button" type="button" onClick={onNewChat}>
        <Plus size={17} strokeWidth={2.2} />
        <span>New chat</span>
        <span className="shortcut-hint" aria-hidden="true">Ctrl K</span>
      </button>

      <div className="history-section">
        <p className="section-label">YOUR CHATS</p>
        {conversations.length ? (
          <nav className="conversation-list" aria-label="Recent conversations">
            {conversations.map((conversation) => (
              <div className="conversation-item" key={conversation.id}>
                <button
                  className={`conversation-link${conversation.id === currentConversationId ? ' is-active' : ''}`}
                  type="button"
                  title={conversation.title}
                  aria-current={
                    conversation.id === currentConversationId ? 'page' : undefined
                  }
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>{conversation.title}</span>
                  {conversation.id === currentConversationId && (
                    <ChevronLeft className="active-indicator" size={14} aria-hidden="true" />
                  )}
                </button>
                <button
                  className="delete-conversation-button"
                  type="button"
                  aria-label={`Delete ${conversation.title}`}
                  title="Delete conversation"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </nav>
        ) : (
          <p className="history-empty">Your conversations will appear here.</p>
        )}
      </div>

      <div className="sidebar-bottom">
        <button
          className="settings-link"
          type="button"
          onClick={onOpenSettings}
        >
          <Settings2 size={17} />
          <span>Settings</span>
        </button>
        <button className="profile-card" type="button" onClick={onSignOut} title="Sign out">
          <span className="profile-avatar" aria-hidden="true">{initials}</span>
          <span className="profile-copy">
            <strong>{user.email}</strong>
            <span>Sign out</span>
          </span>
          <LogOut className="profile-menu-mark" size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
