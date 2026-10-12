import { useCallback, useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen.jsx'
import ChatHeader from './components/ChatHeader.jsx'
import ChatInput from './components/ChatInput.jsx'
import ChatMessages from './components/ChatMessages.jsx'
import EmptyState from './components/EmptyState.jsx'
import SettingsDialog from './components/SettingsDialog.jsx'
import Sidebar from './components/Sidebar.jsx'
import {
  deleteAllConversations,
  deleteConversation,
  getConversations,
  getCurrentUser,
  saveConversation,
  sendChat,
  signIn,
  signOut,
  signUp,
} from './services/chatApi.js'

const AUTH_TOKEN_KEY = 'nexa-ai-auth-token'
const LEGACY_HISTORY_KEY = 'nexa-ai-chat-history'
const DEFAULT_SETTINGS = { theme: 'system', enterToSend: true }

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: [],
  }
}

function getConversationTitle(message) {
  const title = message.trim().replace(/\s+/g, ' ')
  return title.length > 30 ? `${title.slice(0, 29).trimEnd()}…` : title
}

function readToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error('Tidak dapat membaca sesi login:', error)
    return null
  }
}

function getSettings(userId) {
  try {
    const saved = window.localStorage.getItem(`nexa-ai-settings-${userId}`)
    if (!saved) return DEFAULT_SETTINGS
    const parsed = JSON.parse(saved)
    return {
      theme: ['system', 'light', 'dark'].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_SETTINGS.theme,
      enterToSend:
        typeof parsed.enterToSend === 'boolean'
          ? parsed.enterToSend
          : DEFAULT_SETTINGS.enterToSend,
    }
  } catch (error) {
    console.error('Tidak dapat membaca preferensi:', error)
    return DEFAULT_SETTINGS
  }
}

function readLegacyHistory() {
  const saved = window.localStorage.getItem(LEGACY_HISTORY_KEY)
  if (!saved) return []
  const parsed = JSON.parse(saved)
  if (!Array.isArray(parsed?.conversations)) return []

  return parsed.conversations
    .filter(
      (conversation) =>
        typeof conversation?.id === 'string' &&
        typeof conversation?.title === 'string' &&
        Array.isArray(conversation.messages),
    )
    .map((conversation) => ({
      id: conversation.id,
      title: conversation.title.slice(0, 100),
      messages: conversation.messages
        .filter(
          (message) =>
            typeof message?.id === 'string' &&
            ['user', 'assistant'].includes(message.role) &&
            typeof message.content === 'string',
        )
        .map((message) => ({
          id: message.id,
          role: message.role,
          content:
            message.status === 'loading'
              ? 'Respons terputus sebelum selesai. Silakan kirim ulang pesan.'
              : message.content.slice(0, 8000),
          status: message.status === 'error' ? 'error' : 'complete',
        })),
    }))
    .filter((conversation) => conversation.messages.length > 0)
}

function App() {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(token))
  const [isLoadingChats, setIsLoadingChats] = useState(Boolean(token))
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => !window.matchMedia('(max-width: 760px)').matches,
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [appError, setAppError] = useState('')
  const [sessionRetry, setSessionRetry] = useState(0)
  const currentConversation = conversations.find(
    (conversation) => conversation.id === currentConversationId,
  )

  const clearLocalSession = useCallback(() => {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Tidak dapat membersihkan sesi login:', error)
    }
    setToken(null)
    setUser(null)
    setConversations([])
    setCurrentConversationId(null)
    setIsLoadingChats(false)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsCheckingSession(false)
      setIsLoadingChats(false)
      return
    }

    let cancelled = false
    async function restoreAccount() {
      setIsCheckingSession(true)
      setIsLoadingChats(true)
      try {
        const account = await getCurrentUser(token)
        if (cancelled) return
        setUser(account)
        setSettings(getSettings(account.id))

        let chats = await getConversations(token)
        if (cancelled) return

        if (chats.length === 0) {
          try {
            const legacyChats = readLegacyHistory()
            for (const chat of legacyChats) {
              await saveConversation(token, chat)
            }
            if (legacyChats.length > 0) {
              chats = await getConversations(token)
              window.localStorage.removeItem(LEGACY_HISTORY_KEY)
            }
          } catch (migrationError) {
            console.error('Tidak dapat memindahkan riwayat chat lama:', migrationError)
          }
        }

        if (chats.length === 0) {
          const newConversation = createConversation()
          setConversations([newConversation])
          setCurrentConversationId(newConversation.id)
        } else {
          setConversations(chats)
        }
        const savedSelection = window.localStorage.getItem(
          `nexa-ai-current-chat-${account.id}`,
        )
        if (chats.length > 0) {
          setCurrentConversationId(
            chats.some((chat) => chat.id === savedSelection)
              ? savedSelection
              : chats[0].id,
          )
        }
      } catch (error) {
        if (cancelled) return
        if (/session|sign in|unauthorized|expired/i.test(error.message)) {
          clearLocalSession()
        } else {
          setAppError(error.message)
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false)
          setIsLoadingChats(false)
        }
      }
    }

    restoreAccount()
    return () => {
      cancelled = true
    }
  }, [token, clearLocalSession, sessionRetry])

  useEffect(() => {
    if (!user) return
    try {
      window.localStorage.setItem(
        `nexa-ai-settings-${user.id}`,
        JSON.stringify(settings),
      )
    } catch (error) {
      console.error('Tidak dapat menyimpan preferensi:', error)
      setAppError('Preferensi tidak dapat disimpan pada browser ini.')
    }
    function applyTheme() {
      document.documentElement.dataset.theme =
        settings.theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : settings.theme
    }
    applyTheme()
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    colorScheme.addEventListener('change', applyTheme)
    return () => colorScheme.removeEventListener('change', applyTheme)
  }, [settings, user])

  useEffect(() => {
    if (!user || !currentConversationId) return
    try {
      window.localStorage.setItem(
        `nexa-ai-current-chat-${user.id}`,
        currentConversationId,
      )
    } catch (error) {
      console.error('Tidak dapat menyimpan chat aktif:', error)
    }
  }, [currentConversationId, user])

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        handleNewChat()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  })

  async function handleAuthenticate(mode, credentials) {
    const result =
      mode === 'login' ? await signIn(credentials) : await signUp(credentials)
    try {
      window.localStorage.setItem(AUTH_TOKEN_KEY, result.token)
    } catch (error) {
      console.error('Tidak dapat menyimpan sesi login:', error)
      throw new Error('Browser tidak dapat menyimpan sesi. Aktifkan penyimpanan lokal lalu coba lagi.')
    }
    setAppError('')
    setUser(result.user)
    setToken(result.token)
    setIsCheckingSession(false)
    setIsLoadingChats(true)
  }

  async function handleSignOut() {
    if (!window.confirm('Sign out from Nexa AI?')) return
    try {
      await signOut(token)
    } catch (error) {
      setAppError(`Sesi lokal diakhiri, tetapi server belum mengonfirmasi logout: ${error.message}`)
    } finally {
      clearLocalSession()
    }
  }

  function handleNewChat() {
    const conversation = createConversation()
    setConversations((previous) => [...previous, conversation])
    setCurrentConversationId(conversation.id)
    setSidebarOpen(false)
  }

  function handleSelectConversation(conversationId) {
    setCurrentConversationId(conversationId)
    setSidebarOpen(false)
  }

  async function persistConversation(conversation) {
    try {
      await saveConversation(token, conversation)
    } catch (error) {
      setAppError(`Chat belum tersimpan ke akun: ${error.message}`)
    }
  }

  async function handleSendMessage({ text, attachment, attachmentContent }) {
    const messageText = text.trim() || (attachment ? 'Please summarize this file.' : '')
    if (!messageText || !currentConversation || !token) return

    const conversationId = currentConversation.id
    const userMessageId = crypto.randomUUID()
    const responseMessageId = crypto.randomUUID()
    const visibleContent = attachmentContent
      ? `${messageText}\n\n[File: ${attachment}]\n${attachmentContent}`
      : messageText
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: visibleContent,
      ...(attachment ? { attachment } : {}),
    }
    const requestMessages = [
      ...currentConversation.messages
        .filter(
          (message) =>
            message.status !== 'loading' && message.status !== 'error',
        )
        .map(({ role, content }) => ({ role, content })),
      { role: 'user', content: visibleContent },
    ]
    const updatedConversation = {
      ...currentConversation,
      title:
        currentConversation.messages.length === 0
          ? getConversationTitle(messageText)
          : currentConversation.title,
      messages: [
        ...currentConversation.messages,
        userMessage,
        {
          id: responseMessageId,
          role: 'assistant',
          content: '',
          status: 'loading',
        },
      ],
    }

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId ? updatedConversation : conversation,
      ),
    )
    setAppError('')
    await persistConversation(updatedConversation)

    try {
      const { message } = await sendChat(requestMessages, token)
      const completedConversation = {
        ...updatedConversation,
        messages: updatedConversation.messages.map((item) =>
          item.id === responseMessageId
            ? { ...item, content: message, status: 'complete' }
            : item,
        ),
      }
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? completedConversation : conversation,
        ),
      )
      await persistConversation(completedConversation)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Maaf, terjadi kesalahan saat menghubungi AI.'
      const failedConversation = {
        ...updatedConversation,
        messages: updatedConversation.messages.map((item) =>
          item.id === responseMessageId
            ? { ...item, content: errorMessage, status: 'error' }
            : item,
        ),
      }
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? failedConversation : conversation,
        ),
      )
      await persistConversation(failedConversation)
    }
  }

  async function handleRegenerate(assistantMessageId) {
    if (!currentConversation || !token) return
    const conversationId = currentConversation.id
    const msgs = currentConversation.messages
    const targetIndex = msgs.findIndex((item) => item.id === assistantMessageId)
    if (targetIndex === -1) return

    let precedingUserIndex = -1
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        precedingUserIndex = i
        break
      }
    }
    if (precedingUserIndex === -1) return

    const requestMessages = msgs
      .slice(0, precedingUserIndex + 1)
      .filter((m) => m.status !== 'loading' && m.status !== 'error')
      .map(({ role, content }) => ({ role, content }))

    const responseMessageId = assistantMessageId
    const updatedConversation = {
      ...currentConversation,
      messages: msgs.map((item) =>
        item.id === responseMessageId
          ? { ...item, content: '', status: 'loading' }
          : item,
      ),
    }

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId ? updatedConversation : conversation,
      ),
    )
    setAppError('')

    try {
      const { message } = await sendChat(requestMessages, token)
      const completedConversation = {
        ...updatedConversation,
        messages: updatedConversation.messages.map((item) =>
          item.id === responseMessageId
            ? { ...item, content: message, status: 'complete' }
            : item,
        ),
      }
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? completedConversation : conversation,
        ),
      )
      await persistConversation(completedConversation)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Maaf, terjadi kesalahan saat menghubungi AI.'
      const failedConversation = {
        ...updatedConversation,
        messages: updatedConversation.messages.map((item) =>
          item.id === responseMessageId
            ? { ...item, content: errorMessage, status: 'error' }
            : item,
        ),
      }
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? failedConversation : conversation,
        ),
      )
      await persistConversation(failedConversation)
    }
  }

  async function handleDeleteConversation(conversationId) {
    const conversation = conversations.find((item) => item.id === conversationId)
    if (!conversation) return
    if (conversation.messages.some((message) => message.status === 'loading')) {
      setAppError('Tunggu sampai balasan AI selesai sebelum menghapus chat ini.')
      return
    }
    if (!window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return

    try {
      await deleteConversation(token, conversationId)
      const remaining = conversations.filter((item) => item.id !== conversationId)
      if (conversationId === currentConversationId) {
        const nextConversation = remaining[0] ?? createConversation()
        setConversations(
          remaining.length ? remaining : [nextConversation],
        )
        setCurrentConversationId(nextConversation.id)
      } else {
        setConversations(remaining)
      }
    } catch (error) {
      setAppError(`Chat tidak dapat dihapus: ${error.message}`)
    }
  }

  async function handleClearHistory() {
    if (!window.confirm('Delete all conversations? This cannot be undone.')) return
    try {
      await deleteAllConversations(token)
      const conversation = createConversation()
      setConversations([conversation])
      setCurrentConversationId(conversation.id)
      setSettingsOpen(false)
    } catch (error) {
      setAppError(`Riwayat tidak dapat dihapus: ${error.message}`)
    }
  }

  if (isCheckingSession) {
    return <main className="auth-screen"><p role="status">Memeriksa sesi akun…</p></main>
  }

  if (!user && token) {
    return (
      <main className="auth-screen">
        <section className="auth-card" role="alert">
          <h1>Tidak dapat memuat akun</h1>
          <p className="auth-description">{appError || 'Periksa koneksi backend lalu coba lagi.'}</p>
          <button className="auth-submit" type="button" onClick={() => setSessionRetry((value) => value + 1)}>
            Coba lagi
          </button>
          <button className="auth-secondary" type="button" onClick={clearLocalSession}>
            Kembali ke login
          </button>
        </section>
      </main>
    )
  }

  if (!user) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />
  }

  if (isLoadingChats) {
    return <main className="auth-screen"><p role="status">Memuat percakapan…</p></main>
  }

  const visibleConversations = conversations
    .filter((conversation) => conversation.messages.length > 0)
    .slice()
    .reverse()
  const isSending = currentConversation?.messages.some(
    (message) => message.status === 'loading',
  )

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="drawer-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        conversations={visibleConversations}
        currentConversationId={currentConversationId}
        isOpen={sidebarOpen}
        user={user}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setSettingsOpen(true)}
        onSignOut={handleSignOut}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-panel">
        <ChatHeader
          onMenuClick={() => setSidebarOpen((isOpen) => !isOpen)}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {appError && (
          <div className="app-alert" role="alert">
            <span>{appError}</span>
            <button type="button" onClick={() => setAppError('')} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        )}
        <section className="chat-panel" aria-label="Conversation">
          {currentConversation?.messages.length ? (
            <ChatMessages
              messages={currentConversation.messages}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <EmptyState onSuggestionSelect={(text) => handleSendMessage({ text })} />
          )}
          <ChatInput
            onSend={handleSendMessage}
            enterToSend={settings.enterToSend}
            disabled={Boolean(isSending)}
          />
        </section>
      </main>

      {settingsOpen && (
        <SettingsDialog
          onClose={() => setSettingsOpen(false)}
          onClearHistory={handleClearHistory}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}
    </div>
  )
}

export default App
