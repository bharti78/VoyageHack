import { useState } from "react"

function ChatAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 How can I help plan your trip today?" }
  ])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input }
    const botReply = {
      sender: "bot",
      text: "Great choice! Let me find the best options for you..."
    }

    setMessages([...messages, userMessage, botReply])
    setInput("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">

      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h3 className="font-semibold">AI Travel Assistant</h3>
        <button onClick={onClose}>✖</button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl max-w-xs ${
              msg.sender === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-800 flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-lg bg-gray-700 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 rounded-lg"
        >
          ➤
        </button>
      </div>

    </div>
  )
}

export default ChatAssistant
