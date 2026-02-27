import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HomepageNavbar";
import { buildAndStore, detectIntentService } from "../utils/unifiedSearch";
import { useAuth } from "../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SMART_SEARCH_API = `${API_ORIGIN}/api/search/plan`;
const SUGGEST_API = `${API_ORIGIN}/api/search/suggestions`;

const AIRPORT_BY_CITY = {
  mumbai: { code: "BOM", city: "Mumbai" },
  delhi: { code: "DEL", city: "New Delhi" },
  "new delhi": { code: "DEL", city: "New Delhi" },
  goa: { code: "GOI", city: "Goa" },
  bangalore: { code: "BLR", city: "Bangalore" },
  bengaluru: { code: "BLR", city: "Bangalore" },
  kochi: { code: "COK", city: "Kochi" },
  chennai: { code: "MAA", city: "Chennai" },
  kolkata: { code: "CCU", city: "Kolkata" },
  hyderabad: { code: "HYD", city: "Hyderabad" },
  jaipur: { code: "JAI", city: "Jaipur" },
};

const TYPE_OPTIONS = [
  { id: "flights", label: "Flights", icon: "✈" },
  { id: "hotels", label: "Hotels", icon: "🏨" },
  { id: "cabs", label: "Cabs", icon: "🚕" },
  { id: "carrental", label: "Car Rentals", icon: "🚗" },
];

function norm(v) {
  return String(v || "").toLowerCase().trim();
}

function resolveAirport(city, fallback) {
  return AIRPORT_BY_CITY[norm(city)] || fallback;
}

function toValidDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function Home() {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("flights");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDocClick(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch(`${SUGGEST_API}?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json().catch(() => ({}));
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  async function handleSearch() {
    if (!requireAuth()) return;
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(SMART_SEARCH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          userGender: user?.gender || "",
          persona: localStorage.getItem("persona") || "solo",
          tripType: localStorage.getItem("persona") || "solo",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Search failed.");

      const sourceText = data?.intent?.source || "Mumbai";
      const destinationText = data?.intent?.destination || "Goa";
      const durationDays = Math.max(1, Number(data?.intent?.durationDays || data?.intent?.duration || 3));
      const budget = Number(data?.intent?.budget || 0);

      const from = resolveAirport(sourceText, { code: "BOM", city: "Mumbai" });
      const to = resolveAirport(destinationText, { code: "GOI", city: destinationText || "Goa" });

      const parsedStart = data?.intent?.startDate ? toValidDate(`${data.intent.startDate}T00:00:00`) : null;
      const parsedEnd = data?.intent?.endDate ? toValidDate(`${data.intent.endDate}T00:00:00`) : null;
      const depDate = parsedStart || (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      })();
      const retDate = parsedEnd || (() => {
        const d = new Date(depDate);
        d.setDate(d.getDate() + Math.max(1, durationDays - 1));
        return d;
      })();

      localStorage.setItem("voyagehack.smartQuery", JSON.stringify({ query: q, ...data.intent }));
      localStorage.setItem("voyagehack.smartResults", JSON.stringify(data));
      localStorage.setItem("voyagehack.flight.prefill", JSON.stringify({
        from,
        to,
        depDate: depDate.toISOString(),
        retDate: retDate.toISOString(),
        tripType: "roundtrip",
        cabin: "Economy",
        pax: { adults: 1, children: 0, infants: 0 },
        budget,
      }));
      localStorage.setItem("voyagehack.hotel.prefill", JSON.stringify({
        destination: destinationText,
        startDate: depDate.toISOString(),
        endDate: retDate.toISOString(),
        budget,
        adults: 1,
        children: 0,
      }));
      localStorage.setItem("voyagehack.cab.prefill", JSON.stringify({ city: destinationText, budget }));
      localStorage.setItem("voyagehack.carrental.prefill", JSON.stringify({
        city: destinationText,
        pickupDate: depDate.toISOString(),
        returnDate: retDate.toISOString(),
        budget,
      }));

      buildAndStore({
        source: "home-text-search",
        inputType: "text",
        query: q,
        destination: destinationText,
        destinationObject: { city: destinationText },
        fromCity: from.city,
        fromObj: from,
        startDate: depDate.toISOString(),
        endDate: retDate.toISOString(),
        guests: { adults: 1, children: 0, infants: 0 },
        budget: { selectedBudget: null, maxValue: budget },
        selectedTypes: selectedType === "all" ? [] : [selectedType],
        intentService: selectedType || detectIntentService(q),
        intent: data?.intent || {},
      });

      setShowSuggestions(false);
      const routeMap = {
        flights: "/flights",
        hotels: "/hotels",
        cabs: "/cabs",
        carrental: "/carrental",
      };
      navigate(routeMap[selectedType] || "/flights");
    } catch (e) {
      setError(e.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/travel.jpeg)" }}>
      <div className="min-h-screen bg-black bg-opacity-40">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 pt-24">
          <div className="mb-4 flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  selectedType === option.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white/95 text-gray-700 border-gray-200 hover:border-orange-300"
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative" ref={boxRef}>
            <div className="bg-white/95 rounded-full shadow-xl border border-gray-200 p-2 flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Plan a trip from Mumbai to Goa for 5 days under 10k"
                className="flex-1 bg-transparent outline-none px-4 py-3 text-gray-800 placeholder-gray-400"
              />
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl">⌕</div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-3 font-semibold disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {showSuggestions && query.trim().length >= 2 && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-20">
                {suggestionsLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading suggestions...</div>
                )}
                {!suggestionsLoading && suggestions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                )}
                {!suggestionsLoading && suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setQuery(item.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50"
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-200 mt-3 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
