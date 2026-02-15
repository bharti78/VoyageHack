import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatAssistant from "../components/ChatAssistant";

function Search() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // 🔍 Normal Search
  const handleSearch = () => {
    if (!query.trim()) return;
    localStorage.setItem("searchQuery", query);
    navigate("/results");
  };

  // 🎤 Voice Search (Stable + Auto Retry Version)
  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Please use Google Chrome.");
      return;
    }

    // Stop previous session if running
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      setListening(false);

      localStorage.setItem("searchQuery", speechResult);
      navigate("/results");
    };

    recognition.onerror = (event) => {
      console.log("Speech error:", event.error);

      if (event.error === "no-speech") {
        // 🔥 Auto retry once if user silent
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            setListening(false);
          }
        }, 500);
      } else if (event.error === "not-allowed") {
        alert("Microphone permission denied.");
        setListening(false);
      } else if (event.error === "audio-capture") {
        alert("No microphone detected.");
        setListening(false);
      } else {
        alert("Voice recognition error: " + event.error);
        setListening(false);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  // 🖼 Image Upload (Temporary)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem("uploadedImage", reader.result);
      localStorage.setItem("searchType", "image");
      navigate("/results");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-12">
        Where would you like to travel?
      </h1>

      <div className="flex justify-center">
        <div className="flex w-full max-w-3xl bg-gray-800 rounded-full overflow-hidden shadow-xl">
          {/* Input */}
          <input
            type="text"
            placeholder="Plan a winter trip to Manali for 5 days under 40k..."
            className="flex-1 p-4 bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          {/* Voice Button */}
          <button
            onClick={handleVoice}
            className={`px-5 transition duration-300 ${
              listening
                ? "bg-red-600 animate-pulse"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {listening ? "🎙 Listening..." : "🎤"}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-8 bg-blue-600 hover:bg-blue-700 transition font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Extra Options */}
      <div className="flex justify-center gap-8 mt-10">
        <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition shadow-md">
          🖼 Search by Image
          <input type="file" className="hidden" onChange={handleImageUpload} />
        </label>

        <button
          onClick={() => setChatOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition shadow-md"
        >
          💬 AI Travel Assistant
        </button>
      </div>
      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Search;
