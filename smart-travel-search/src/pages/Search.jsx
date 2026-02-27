import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildAndStore } from "../utils/unifiedSearch";
import ChatAssistant from "../components/ChatAssistant";
import Navbar from "../components/HomepageNavbar";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SMART_SEARCH_API = `${API_ORIGIN}/api/search/plan`;

function Search() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const homepageSearch = localStorage.getItem("homepageSearch");
    if (!homepageSearch) return;
    try {
      const data = JSON.parse(homepageSearch);
      if (data.destination && data.destination !== "Anywhere") {
        setQuery(data.destination);
      }
    } catch {
      // ignore malformed local storage
    } finally {
      localStorage.removeItem("homepageSearch");
    }
  }, []);

  async function handleSearch(customQuery = null) {
    const input = String(customQuery ?? query).trim();
    if (!input) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const persona = localStorage.getItem("persona") || "solo";

    setLoading(true);
    setError("");
    try {
      const res = await fetch(SMART_SEARCH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          userGender: user?.gender || "",
          persona,
          tripType: persona,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || "Unable to build trip plan.");
      }

      localStorage.setItem("searchQuery", input);
      localStorage.setItem("voyagehack.smartQuery", JSON.stringify(data.intent || {}));
      localStorage.setItem("voyagehack.smartResults", JSON.stringify(data));
      buildAndStore({
        source: "search-page",
        inputType: listeningRef.current ? "voice" : "text",
        query: input,
        destination: data?.intent?.destination || input,
        destinationObject: {},
        startDate: null,
        endDate: null,
        guests: { adults: 1, children: 0, infants: 0 },
        budget: { selectedBudget: null, maxValue: Number(data?.intent?.budget || 0) },
        selectedTypes: [],
        intentService: "all",
        intent: data?.intent || {},
      });
      navigate("/results", { state: { back: true } });
    } catch (e) {
      setError(e.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    listeningRef.current = true;
    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      setListening(false);
      await handleSearch(speechResult);
    };

    recognition.onerror = () => { listeningRef.current = false; setListening(false); };
    recognition.onend = () => { listeningRef.current = false; setListening(false); };
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("uploadedImage", reader.result);
      localStorage.setItem("searchType", "image");
      buildAndStore({
        source: "search-page",
        inputType: "image",
        query: file.name || "Image search",
        destination: "",
        guests: { adults: 1, children: 0, infants: 0 },
        budget: { selectedBudget: null, maxValue: 0 },
        intentService: "all",
        uploadedImage: reader.result,
      });
      navigate("/results", { state: { back: true } });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />

      <div className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Explore Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                {" "}Destination
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try: Plan a trip to Manali at 5000 budget
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-2 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-3">
                  <div className="flex w-full bg-gray-800 rounded-full overflow-hidden shadow-xl">
                    <input
                      type="text"
                      placeholder="Plan a trip to Manali at 5000 budget..."
                      className="flex-1 p-4 bg-transparent outline-none text-white placeholder-gray-400"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      onClick={handleVoice}
                      disabled={loading}
                      className={`px-5 transition duration-300 ${
                        listening ? "bg-red-600 animate-pulse" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {listening ? "Listening..." : "Voice"}
                    </button>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Planning..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="max-w-5xl mx-auto mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-10 flex-wrap">
            <label className="cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90 px-6 py-3 rounded-xl transition shadow-md border border-gray-200">
              Search by Image
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
            <button
              onClick={() => setChatOpen(true)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90 px-6 py-3 rounded-xl transition shadow-md border border-gray-200"
            >
              AI Travel Assistant
            </button>
          </div>
        </div>
      </div>

      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Search;
