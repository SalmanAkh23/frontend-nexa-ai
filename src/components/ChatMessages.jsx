import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

function ChatMessages({ messages, onRegenerate }) {
  const endOfMessagesRef = useRef(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="messages-scroll-area">
      <div className="message-list" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
          />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  )
}

export default ChatMessages
