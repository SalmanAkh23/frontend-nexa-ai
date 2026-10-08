const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SAFE_ERROR_MESSAGE = 'Maaf, terjadi kesalahan saat menghubungi server.'

async function request(path, { token, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Backend tidak dapat dihubungi. Pastikan server berjalan.')
  }

  if (response.status === 204) return null

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(SAFE_ERROR_MESSAGE)
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(' ')
      : typeof data?.message === 'string'
        ? data.message
        : SAFE_ERROR_MESSAGE
    throw new Error(message)
  }

  return data
}

export function signIn(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function signUp(credentials) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getCurrentUser(token) {
  return request('/auth/me', { token })
}

export function signOut(token) {
  return request('/auth/logout', { token, method: 'POST' })
}

export function getConversations(token) {
  return request('/conversations', { token })
}

export function saveConversation(token, conversation) {
  return request('/conversations', {
    token,
    method: 'POST',
    body: JSON.stringify({
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map(
        ({ id, role, content, status, attachment }) => ({
          id,
          role,
          content,
          status: status ?? 'complete',
          ...(attachment ? { attachment } : {}),
        }),
      ),
    }),
  })
}

export function deleteConversation(token, conversationId) {
  return request(`/conversations/${encodeURIComponent(conversationId)}`, {
    token,
    method: 'DELETE',
  })
}

export function deleteAllConversations(token) {
  return request('/conversations', { token, method: 'DELETE' })
}

export function sendChat(messages, token) {
  return request('/chat', {
    token,
    method: 'POST',
    body: JSON.stringify({ messages }),
  }).then((data) => {
    if (typeof data?.message !== 'string' || !data.message.trim()) {
      throw new Error(SAFE_ERROR_MESSAGE)
    }
    return data
  })
}
