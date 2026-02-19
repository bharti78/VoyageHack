 import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatAssistant from "../components/ChatAssistant";
import Navbar from "../components/HomepageNavbar";
import SearchSection from "../components/SearchSection";

function Search() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    // Load homepage search data if available
    const homepageSearch = localStorage.getItem("homepageSearch");
    if (homepageSearch) {
      const searchData = JSON.parse(homepageSearch);
      if (searchData.destination && searchData.destination !== "Anywhere") {
        setQuery(searchData.destination);
      }
      // Clear the homepage search data after loading
      localStorage.removeItem("homepageSearch");
    }
  }, [navigate]);

  // 🔍 Normal Search
  const handleSearch = () => {
    if (!query.trim()) return;
    localStorage.setItem("searchQuery", query);
    navigate("/results", { state: { back: true } });
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
    <div className="min-h-screen bg-white">
      <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
      
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
        
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Explore Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                {" "}Destination
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search for amazing places and create unforgettable memories
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-2 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Search Input */}
                <div className="md:col-span-3">
                  <div className="flex w-full bg-gray-800 rounded-full overflow-hidden shadow-xl">
                    <input
                      type="text"
                      placeholder="Plan a winter trip to Manali for 5 days under 40k..."
                      className="flex-1 p-4 bg-transparent outline-none text-white placeholder-gray-400"
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
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Options */}
          <div className="flex justify-center gap-8 mt-12">
            <label className="cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90 px-6 py-3 rounded-xl transition shadow-md border border-gray-200">
              🖼 Search by Image
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>

            <button
              onClick={() => setChatOpen(true)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90 px-6 py-3 rounded-xl transition shadow-md border border-gray-200"
            >
              💬 AI Travel Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">500+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">10K+</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">4.8</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>

      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Search;
