import { useState, useRef, useEffect } from "react"

function ChatAssistant({ isOpen, onClose, mode = "modal" }) {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hi 👋 I'm your AI Travel Assistant! I can help you plan the perfect trip. Where would you like to go?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) setShowQuickSuggestions(true)
  }, [isOpen])

  const generateBotResponse = (userMessage) => {
    const responses = [
      "That sounds like an amazing destination! Let me find some great options for you.",
      "I'd love to help you plan this trip! What's your budget range?",
      "Excellent choice! Have you considered the best time to visit?",
      "Great question! Let me search for the best accommodations and activities.",
      "I can help you create the perfect itinerary. What type of activities interest you most?",
      "That's a popular destination! Let me find some hidden gems for you."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sendMessage = async (customText = null) => {
    const text = String(customText ?? input).trim()
    if (!text) return

    const userMessage = { 
      sender: "user", 
      text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botReply = {
        sender: "bot",
        text: generateBotResponse(text),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botReply])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
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
    "Transportation options"
  ]

  const handleSuggestionClick = (suggestion) => {
    setShowQuickSuggestions(false)
    sendMessage(suggestion)
  }

  if (!isOpen) return null

  const isFloating = mode === "floating"
  const wrapperClass = isFloating
    ? "fixed bottom-6 right-6 z-50"
    : "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  const panelClass = isFloating
    ? "bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-[min(92vw,24rem)] h-[70vh] max-h-[36rem] flex flex-col border border-white/20 overflow-hidden"
    : "bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/20 overflow-hidden"

  return (
    <div className={wrapperClass}>
      <div className={panelClass}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3m0-6l3 3m0 0l3-3m-3 3h6a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2h2l-3-3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Travel Assistant</h3>
                <p className="text-pink-100 text-sm">Your personal travel guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs lg:max-w-md ${
                  msg.sender === "user"
                    ? "order-1"
                    : "order-2"
                }`}>
                  {msg.sender === "bot" && (
                    <div className="mb-1 text-xs text-pink-600 font-semibold flex items-center gap-1">
                      <span>🤖</span>
                      <span>AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "bg-white text-gray-800 shadow-md border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md border border-gray-200 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {showQuickSuggestions && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Quick suggestions:</p>
              <button
                type="button"
                onClick={() => setShowQuickSuggestions(false)}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center justify-center"
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
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask me anything about your trip..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
