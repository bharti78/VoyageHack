import { useState, useRef, useEffect } from "react"

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CHAT_API = `${API_ORIGIN}/api/chat`

function normalizeMessageText(value, fallback = "I couldn't generate a response right now.") {
  if (typeof value === "string") {
    const text = value.trim()
    if (text) return text
  }
  if (value && typeof value === "object") {
    if (typeof value.text === "string" && value.text.trim()) return value.text.trim()
    if (typeof value.reply === "string" && value.reply.trim()) return value.reply.trim()
  }
  return fallback
}

function cleanMarkdownText(raw) {
  let text = normalizeMessageText(raw, "")
  text = text.replace(/\r/g, "")
  text = text.replace(/```([\s\S]*?)```/g, "$1")
  text = text.replace(/\*\*(.*?)\*\*/g, "$1")
  text = text.replace(/__(.*?)__/g, "$1")
  text = text.replace(/`([^`]+)`/g, "$1")
  text = text.replace(/^#{1,6}\s+/gm, "")
  text = text.replace(/\s+(\d+\.)\s+/g, "\n$1 ")
  return text.trim()
}

function parseMessageBlocks(raw) {
  const text = cleanMarkdownText(raw)
  if (!text) return []

  const lines = text.split("\n")
  const blocks = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() })
    paragraph = []
  }

  const flushList = () => {
    if (!list || !list.items.length) return
    blocks.push(list)
    list = null
  }

  for (const lineRaw of lines) {
    const line = String(lineRaw || "").trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const ordered = line.match(/^(\d+)\.\s+(.+)$/)
    const bullet = line.match(/^[-*\u2022]\s+(.+)$/)

    if (ordered) {
      flushParagraph()
      if (!list || list.type !== "ordered") list = { type: "ordered", items: [] }
      list.items.push(ordered[2].trim())
      continue
    }

    if (bullet) {
      flushParagraph()
      if (!list || list.type !== "unordered") list = { type: "unordered", items: [] }
      list.items.push(bullet[1].trim())
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks.length ? blocks : [{ type: "paragraph", text }]
}

function MessageBody({ text }) {
  const blocks = parseMessageBlocks(text)
  return (
    <div className="space-y-3 text-[15px] leading-7 break-words">
      {blocks.map((block, idx) => {
        if (block.type === "ordered") {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-2">
              {block.items.map((item, i) => (
                <li key={`${idx}-${i}`}>{item}</li>
              ))}
            </ol>
          )
        }
        if (block.type === "unordered") {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2">
              {block.items.map((item, i) => (
                <li key={`${idx}-${i}`}>{item}</li>
              ))}
            </ul>
          )
        }
        return <p key={idx} className="whitespace-pre-wrap">{block.text}</p>
      })}
    </div>
  )
}

function ChatAssistant({ isOpen, onClose, mode = "modal" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      sender: "bot",
      text: "Hi, I'm your AI Travel Assistant. I can help you plan the perfect trip. Where would you like to go?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) setShowQuickSuggestions(true)
  }, [isOpen])

  const sendMessage = async (customText = null) => {
    const text = String(customText ?? input).trim()
    if (!text) return

    const userMessage = {
      role: "user",
      sender: "user",
      text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      console.log("Chat API response object:", data)
      if (!res.ok) {
        throw new Error(data?.error || "Chat request failed.")
      }

      const botReply = {
        role: "assistant",
        sender: "bot",
        text: normalizeMessageText(data?.reply),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botReply])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          sender: "bot",
          text: normalizeMessageText(error?.message, "Failed to reach AI service."),
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickSuggestions = [
    "Find budget-friendly hotels",
    "Best time to visit India",
    "Plan a 7-day itinerary",
    "Adventure activities",
    "Local food recommendations",
    "Transportation options",
  ]

  const handleSuggestionClick = (suggestion) => {
    setShowQuickSuggestions(false)
    sendMessage(suggestion)
  }

  if (!isOpen) return null

  const isFloating = mode === "floating"
  const wrapperClass = isFloating
    ? "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1300] pointer-events-none"
    : "fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  const panelClass = isFloating
    ? "pointer-events-auto bg-white rounded-3xl shadow-2xl w-[min(94vw,50vw)] min-w-[22rem] max-w-[52rem] h-[min(78vh,44rem)] flex flex-col border border-orange-100 overflow-hidden"
    : "bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[84vh] flex flex-col border border-orange-100 overflow-hidden"

  return (
    <div className={wrapperClass}>
      <div className={panelClass}>
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">??</div>
              <div>
                <h3 className="text-2xl font-bold leading-tight">AI Travel Assistant</h3>
                <p className="text-orange-100 text-sm">Your personal travel guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-[#fffaf5]">
          <div className="space-y-5">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] ${msg.sender === "user" ? "order-1" : "order-2"}`}>
                  {msg.sender === "bot" && (
                    <div className="mb-1 text-xs text-blue-700 font-semibold flex items-center gap-1">
                      <span>??</span>
                      <span>AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl border ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-800 border-orange-100 shadow-sm"
                    }`}
                  >
                    <MessageBody text={normalizeMessageText(msg?.text, "No message content")} />
                  </div>
                  <div className={`text-xs text-slate-500 mt-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 shadow-sm border border-orange-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {showQuickSuggestions && (
          <div className="p-4 bg-white border-t border-orange-100">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-semibold">Quick suggestions</p>
              <button
                type="button"
                onClick={() => setShowQuickSuggestions(false)}
                className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center"
                aria-label="Hide quick suggestions"
              >
                X
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-slate-700 text-sm rounded-full transition-colors border border-orange-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-white border-t border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask me anything about your trip..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pr-12 bg-[#fffaf5] border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-blue-600 text-white p-2 rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18zM12 5v8M4.5 13.5h15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatAssistant
