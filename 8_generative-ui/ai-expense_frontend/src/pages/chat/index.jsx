import React, { useState, useRef, useEffect } from 'react'
import { Plus, Mic, ArrowUp, Sparkles, ChevronDown } from 'lucide-react'
import { useSendMessage } from '@/apis'
import MessageItem from '@/components/chat/MessageItem'

const ChatPage = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [modelType, setModelType] = useState('Flash')
  const [threadId] = useState(() => `session-${Math.random().toString(36).slice(2, 11)}`)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { sendMessage, isLoading } = useSendMessage({
    onSuccess: (response) => {
      if (response && response.content) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.content },
        ])
      }
    },
  })

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')

    // Map messages format for LangGraph endpoint
    sendMessage({
      data: {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        threadId,
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full pb-36">

          {messages.length === 0 ? (
            /* First screen: "Where should we start?" */
            <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-8">
              <h2 className="text-4xl font-normal text-gray-800 tracking-tight text-center select-none flex items-center gap-2">
                Where should we start?
              </h2>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
                Ask me to record an expense, search your transaction history, or generate grouped charts.
              </p>
            </div>
          ) : (
            /* Second screen: Conversation list */
            <div className="pt-8 space-y-4">
              {messages.map((msg, idx) => (
                <MessageItem key={idx} role={msg.role} content={msg.content} />
              ))}

              {isLoading && (
                /* Gemini loader placeholder */
                <div className="flex items-start gap-3 my-6 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-2 flex-1 max-w-[80%] pt-1">
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>
      </div>

      {/* Input bar section */}
      <div className="border-gray-100/50 bg-gradient-to-t from-white via-white to-white/90 p-4 fixed bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-[#f0f4f9] rounded-full px-5 py-3 shadow-sm hover:shadow transition-shadow border border-gray-200/50">
            {/* Left + icon */}
            <button type="button" className="text-gray-500 hover:text-gray-800 transition-colors mr-3" title="Add attachments">
              <Plus className="w-5 h-5" />
            </button>

            {/* Input textarea/field */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm py-1.5"
            />

            {/* Right side controls */}
            <div className="flex items-center gap-3 ml-2">

              {/* Mic Icon */}
              <button type="button" className="text-gray-500 hover:text-gray-800 transition-colors" title="Voice input">
                <Mic className="w-5 h-5" />
              </button>

              {/* Send arrow button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all ${input.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-sm scale-100'
                  : 'bg-gray-200 text-gray-400 scale-95 cursor-not-allowed'
                  }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Bottom small footer notice */}
          <p className="text-[10px] text-gray-400 text-center mt-2.5">
            Gemini is AI and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
