import { useState, useRef, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import ServiceNav from "../components/ServiceNav";
import { saveBookingRecord } from "../utils/bookingLedger";

/* ═══════════════════════════════════════════════
   BACKEND PROXY  ─  all TBO calls go through here
   ═══════════════════════════════════════════════ */
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api/hotels`;
const MOCK_HOTEL_BOOKING = String(import.meta.env.VITE_MOCK_HOTEL_BOOKING || "false").toLowerCase() === "true";
const HOTEL_FORM_STORAGE_KEY = "voyagehack.hotels.form.v1";
const HOTEL_CITIES_CACHE_KEY = "voyagehack.hotels.cities.cache.v1";
const HOTEL_RESULTS_CACHE_KEY = "voyagehack.hotels.results.v1";
const HOTEL_SEARCH_RESPONSE_TIME = 4;

// ==========================================================
// CITY_STATE_MAP
// TBO CityList returns names like "Goa, Goa" / "Delhi, Delhi".
// When user types a bare city ("Goa"), we look it up here to
// get the full string before trying to match against allCities.
// ==========================================================
const CITY_STATE_MAP = {
  "goa":"Goa, Goa","delhi":"Delhi, Delhi","new delhi":"Delhi, Delhi",
  "chandigarh":"Chandigarh, Chandigarh","puducherry":"Puducherry, Puducherry",
  "pondicherry":"Puducherry, Puducherry","port blair":"Port Blair, Andaman and Nicobar Islands",
  "mumbai":"Mumbai, Maharashtra","bombay":"Mumbai, Maharashtra",
  "pune":"Pune, Maharashtra","nagpur":"Nagpur, Maharashtra",
  "nashik":"Nashik, Maharashtra","aurangabad":"Aurangabad, Maharashtra",
  "shirdi":"Shirdi, Maharashtra","lonavala":"Lonavala, Maharashtra",
  "mahabaleshwar":"Mahabaleshwar, Maharashtra","kolhapur":"Kolhapur, Maharashtra",
  "bangalore":"Bangalore, Karnataka","bengaluru":"Bangalore, Karnataka",
  "mysore":"Mysore, Karnataka","mysuru":"Mysore, Karnataka",
  "mangalore":"Mangalore, Karnataka","coorg":"Coorg, Karnataka","hampi":"Hampi, Karnataka",
  "chennai":"Chennai, Tamil Nadu","madras":"Chennai, Tamil Nadu",
  "coimbatore":"Coimbatore, Tamil Nadu","madurai":"Madurai, Tamil Nadu",
  "ooty":"Ooty, Tamil Nadu","kodaikanal":"Kodaikanal, Tamil Nadu",
  "kanyakumari":"Kanyakumari, Tamil Nadu","mahabalipuram":"Mahabalipuram, Tamil Nadu",
  "kochi":"Kochi, Kerala","cochin":"Kochi, Kerala",
  "thiruvananthapuram":"Thiruvananthapuram, Kerala","trivandrum":"Thiruvananthapuram, Kerala",
  "kozhikode":"Kozhikode, Kerala","calicut":"Kozhikode, Kerala",
  "thrissur":"Thrissur, Kerala","munnar":"Munnar, Kerala",
  "alleppey":"Alleppey, Kerala","alappuzha":"Alleppey, Kerala",
  "thekkady":"Thekkady, Kerala","wayanad":"Wayanad, Kerala","varkala":"Varkala, Kerala",
  "hyderabad":"Hyderabad, Telangana","visakhapatnam":"Visakhapatnam, Andhra Pradesh",
  "vizag":"Visakhapatnam, Andhra Pradesh","vijayawada":"Vijayawada, Andhra Pradesh",
  "tirupati":"Tirupati, Andhra Pradesh","warangal":"Warangal, Telangana",
  "kolkata":"Kolkata, West Bengal","calcutta":"Kolkata, West Bengal",
  "darjeeling":"Darjeeling, West Bengal","siliguri":"Siliguri, West Bengal",
  "jaipur":"Jaipur, Rajasthan","jodhpur":"Jodhpur, Rajasthan",
  "udaipur":"Udaipur, Rajasthan","ajmer":"Ajmer, Rajasthan",
  "pushkar":"Pushkar, Rajasthan","jaisalmer":"Jaisalmer, Rajasthan",
  "bikaner":"Bikaner, Rajasthan","mount abu":"Mount Abu, Rajasthan",
  "ahmedabad":"Ahmedabad, Gujarat","surat":"Surat, Gujarat",
  "vadodara":"Vadodara, Gujarat","baroda":"Vadodara, Gujarat",
  "rajkot":"Rajkot, Gujarat","dwarka":"Dwarka, Gujarat","bhuj":"Bhuj, Gujarat",
  "bhopal":"Bhopal, Madhya Pradesh","indore":"Indore, Madhya Pradesh",
  "ujjain":"Ujjain, Madhya Pradesh","khajuraho":"Khajuraho, Madhya Pradesh",
  "gwalior":"Gwalior, Madhya Pradesh","jabalpur":"Jabalpur, Madhya Pradesh",
  "lucknow":"Lucknow, Uttar Pradesh","varanasi":"Varanasi, Uttar Pradesh",
  "agra":"Agra, Uttar Pradesh","mathura":"Mathura, Uttar Pradesh",
  "prayagraj":"Prayagraj, Uttar Pradesh","allahabad":"Prayagraj, Uttar Pradesh",
  "kanpur":"Kanpur, Uttar Pradesh","ayodhya":"Ayodhya, Uttar Pradesh",
  "amritsar":"Amritsar, Punjab","ludhiana":"Ludhiana, Punjab",
  "gurugram":"Gurugram, Haryana","gurgaon":"Gurugram, Haryana",
  "shimla":"Shimla, Himachal Pradesh","manali":"Manali, Himachal Pradesh",
  "dharamshala":"Dharamshala, Himachal Pradesh","kullu":"Kullu, Himachal Pradesh",
  "dalhousie":"Dalhousie, Himachal Pradesh","kasauli":"Kasauli, Himachal Pradesh",
  "dehradun":"Dehradun, Uttarakhand","haridwar":"Haridwar, Uttarakhand",
  "rishikesh":"Rishikesh, Uttarakhand","nainital":"Nainital, Uttarakhand",
  "mussoorie":"Mussoorie, Uttarakhand",
  "srinagar":"Srinagar, Jammu and Kashmir","jammu":"Jammu, Jammu and Kashmir",
  "gulmarg":"Gulmarg, Jammu and Kashmir","pahalgam":"Pahalgam, Jammu and Kashmir",
  "leh":"Leh, Ladakh","kargil":"Kargil, Ladakh",
  "patna":"Patna, Bihar","ranchi":"Ranchi, Jharkhand",
  "bhubaneswar":"Bhubaneswar, Odisha","puri":"Puri, Odisha","konark":"Konark, Odisha",
  "guwahati":"Guwahati, Assam","shillong":"Shillong, Meghalaya",
  "gangtok":"Gangtok, Sikkim",
};

// Given a bare city name, return the full "City, State" TBO expects.
function resolveCityToFullName(cityInput) {
  if (!cityInput) return cityInput;
  return CITY_STATE_MAP[cityInput.trim().toLowerCase()] || cityInput;
}

// Find the best matching city object from allCities for a user-entered city string.
// Tries exact, ShortName, CITY_STATE_MAP lookup, startsWith, then broad includes.
function findBestCityMatch(cityInput, allCities) {
  if (!cityInput || !allCities.length) return null;
  const q = cityInput.trim().toLowerCase();
  const fullGuess = resolveCityToFullName(cityInput).toLowerCase();
  return (
    allCities.find(c => (c.CityName||"").toLowerCase() === q) ||
    allCities.find(c => (c.ShortName||"").toLowerCase() === q) ||
    allCities.find(c => (c.CityName||"").toLowerCase() === fullGuess) ||
    allCities.find(c => (c.CityName||"").toLowerCase().startsWith(q + ",") || (c.CityName||"").toLowerCase().startsWith(q + " ")) ||
    allCities.find(c => (c.ShortName||"").toLowerCase().startsWith(q)) ||
    allCities.find(c => (c.CityName||"").toLowerCase().includes(q)) ||
    null
  );
}

function extractToCityFromQuery(queryText) {
  if (!queryText) return "";
  const normalized = String(queryText).replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const stopWords = "(?:for|under|below|max|budget|with|within|in|on|starting|start|by|after|before|days?|nights?|night|day|flight|flights|hotel|hotels|trip|travel|vacation|holiday|please|now)";
  const toMatch = normalized.match(new RegExp(`\\bto\\s+(.+?)(?=\\s+${stopWords}\\b|$)`, "i"));
  return (toMatch?.[1] || "").trim();
}

function extractDays(queryText) {
  if (!queryText) return 1;
  const normalized = String(queryText).toLowerCase();
  const dayMatch = normalized.match(/(\d+)\s*(day|days|d)\b/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isFinite(days) && days > 0 ? days : 1;
  }
  const nightMatch = normalized.match(/(?:stay\s*)?(\d+)\s*(night|nights|n)\b/);
  if (nightMatch) {
    const nights = Number(nightMatch[1]);
    return Number.isFinite(nights) && nights > 0 ? nights : 1;
  }
  return 1;
}

function extractBudget(queryText) {
  if (!queryText) return 0;
  const text = String(queryText).toLowerCase().replace(/,/g, " ").trim();
  if (!text) return 0;

  const scoped = text.match(/(?:under|below|max(?:imum)?|budget(?:\s*of)?|within)\s*₹?\s*(\d+(?:\.\d+)?)\s*([kml])?/i);
  const trailingBudget = text.match(/\b(\d+(?:\.\d+)?)\s*([kml])?\s*budget\b/i);
  const generic = scoped || trailingBudget || text.match(/₹\s*(\d+(?:\.\d+)?)\s*([kml])?/i);
  if (!generic) return 0;

  const value = Number(generic[1]);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const suffix = String(generic[2] || "").toLowerCase();
  const multiplier = suffix === "k" ? 1000 : suffix === "m" ? 1000000 : suffix === "l" ? 100000 : 1;
  return Math.round(value * multiplier);
}

// Backward-compatible aliases
const extractDurationDaysFromQuery = extractDays;
const extractBudgetFromQuery = extractBudget;

async function apiPost(endpoint, payload, options = {}) {
  const allowStatusCodes = new Set(
    (Array.isArray(options?.allowStatusCodes) ? options.allowStatusCodes : []).map((v) => String(v))
  );
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Non-JSON response: ${text.slice(0,200)}`); }
  if (json.error) throw new Error(json.error);
  if (json.Status?.Code && json.Status.Code !== 200 && json.Status.Code !== "01") {
    if (allowStatusCodes.has(String(json.Status.Code))) return json;
    const desc = json.Status?.Description;
    if (desc && !desc.toLowerCase().includes("success")) throw new Error(desc);
  }
  return json;
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  return [v];
}

function roomTotal(room, hotel) {
  const candidates = [
    room?.Price?.OfferedPrice,
    room?.Price?.PublishedPrice,
    room?.Price?.OfferedPriceRoundedOff,
    room?.Price?.PublishedPriceRoundedOff,
    room?.TotalFare,
    hotel?.Price?.OfferedPrice,
    hotel?.Price?.PublishedPrice,
    hotel?.Price?.OfferedPriceRoundedOff,
    hotel?.Price?.PublishedPriceRoundedOff,
    hotel?.TotalFare,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function getPrebookRooms(prebookRes) {
  if (Array.isArray(prebookRes?.HotelResult)) {
    return prebookRes.HotelResult[0]?.Rooms || [];
  }
  return prebookRes?.HotelResult?.Rooms || [];
}

function normalizeFacilities(facilities) {
  if (Array.isArray(facilities)) return facilities.filter(Boolean);
  if (typeof facilities !== "string") return [];
  return facilities
    .split(/[,|]/)
    .map(v => v.trim())
    .filter(Boolean);
}

function firstHotelImage(hotel) {
  if (hotel?.HotelPicture) return hotel.HotelPicture;
  if (hotel?.ImagePath) return hotel.ImagePath;
  if (Array.isArray(hotel?.Images) && hotel.Images.length > 0) return hotel.Images[0];
  return null;
}

function textPreview(value, max = 120) {
  if (!value) return "";
  const plain = String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}...`;
}

function facilityHighlights(facilities) {
  const list = normalizeFacilities(facilities).map((f) => f.toLowerCase());
  const hasSenior = list.some((f) => /wheelchair|lift|elevator|accessible|senior|medical/.test(f));
  const hasDining = list.some((f) => /restaurant|dining|breakfast|meal|buffet|cafe/.test(f));
  const hasWellness = list.some((f) => /spa|gym|fitness|pool|wellness/.test(f));
  const hasCab = list.some((f) => /cab|taxi|shuttle|transfer|airport pickup|airport drop|car hire/.test(f));
  return [
    hasSenior ? "Senior Friendly" : null,
    hasDining ? "Dining Options" : null,
    hasWellness ? "Wellness" : null,
    hasCab ? "Cab Facility" : null,
  ].filter(Boolean);
}

function seniorFacilityMatch(hotel) {
  const facilities = normalizeFacilities(hotel?.HotelFacilities).map((f) => String(f).toLowerCase());
  const address = String(hotel?.HotelAddress || hotel?.Address || "").toLowerCase();
  const desc = String(hotel?.Description || "").toLowerCase();
  const joined = `${facilities.join(" ")} ${address} ${desc}`;
  const liftAccess = /lift|elevator/.test(joined);
  const wheelchairSupport = /wheelchair|accessible|disabled access|barrier free|senior friendly/.test(joined);
  const groundFloorSupport = /ground floor|lower floor|easy access room/.test(joined) || liftAccess;
  const minimalWalkingSupport = /walking distance|city center|central|near metro|near station|easy access|close to/.test(joined);
  const easyTransferSupport = /transfer|shuttle|airport pickup|airport drop|cab|taxi|car hire/.test(joined);
  const score = [
    liftAccess,
    wheelchairSupport,
    groundFloorSupport,
    minimalWalkingSupport,
    easyTransferSupport,
  ].filter(Boolean).length;
  return {
    liftAccess,
    wheelchairSupport,
    groundFloorSupport,
    minimalWalkingSupport,
    easyTransferSupport,
    score,
  };
}

function loadPersistedHotelForm() {
  try {
    const raw = localStorage.getItem(HOTEL_FORM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readCitiesCache(countryCode) {
  try {
    const raw = localStorage.getItem(HOTEL_CITIES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const key = String(countryCode || "").toUpperCase();
    const entry = parsed?.[key];
    if (!entry || !Array.isArray(entry.cities)) return null;
    return entry.cities;
  } catch {
    return null;
  }
}

function writeCitiesCache(countryCode, cities) {
  try {
    const raw = localStorage.getItem(HOTEL_CITIES_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = String(countryCode || "").toUpperCase();
    parsed[key] = { cities: Array.isArray(cities) ? cities : [], savedAt: new Date().toISOString() };
    localStorage.setItem(HOTEL_CITIES_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore cache failures.
  }
}

function parseStoredDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function loadCachedHotelResults() {
  try {
    const raw = localStorage.getItem(HOTEL_RESULTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.hotels)) return null;
    const savedAt = Number(parsed.savedAt || 0);
    // Keep warm results for 20 minutes so back-navigation is instant.
    if (!savedAt || Date.now() - savedAt > 20 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedHotelResults(payload) {
  try {
    localStorage.setItem(HOTEL_RESULTS_CACHE_KEY, JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }));
  } catch {
    // Ignore cache failures.
  }
}

function clearCachedHotelResults() {
  try {
    localStorage.removeItem(HOTEL_RESULTS_CACHE_KEY);
  } catch {
    // Ignore cache clear failures.
  }
}

function parseHotelMapPoint(hotel) {
  const raw = hotel?.Map || hotel?.map || "";
  if (!raw || typeof raw !== "string" || !raw.includes("|")) return null;
  const [latRaw, lngRaw] = raw.split("|");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function normalizeImageUrl(url) {
  if (!url) return "";
  const clean = String(url).replace(/[\r\n\t]/g, "").replace(/\s+/g, "").trim();
  if (!clean) return "";
  if (clean.startsWith("//")) return `https:${clean}`;
  try {
    return encodeURI(clean);
  } catch {
    return clean;
  }
}

const FX_FALLBACK_RATES = {
  USD: 83,
  EUR: 90,
  GBP: 106,
  AED: 22.6,
  SGD: 61,
  THB: 2.3,
};
const EMPTY_GUEST = { title: "Mr", first: "", last: "", email: "", phone: "", addr: "", city2: "", country: "IN" };

function toINR(amount, currency, fxRates = {}) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const code = String(currency || "INR").toUpperCase();
  if (code === "INR") return value;
  const liveRate = Number(fxRates?.[code]);
  const fallbackRate = Number(FX_FALLBACK_RATES?.[code]);
  const rate = Number.isFinite(liveRate) && liveRate > 0 ? liveRate : fallbackRate;
  if (!Number.isFinite(rate) || rate <= 0) return Number.NaN;
  return value * rate;
}

function roomCurrency(room, hotel) {
  return (
    room?.Price?.CurrencyCode ||
    room?.CurrencyCode ||
    hotel?.Price?.CurrencyCode ||
    hotel?.Currency ||
    "INR"
  );
}

function hotelDisplayPrice(hotel, fxRates = {}) {
  const rooms = Array.isArray(hotel?.Rooms)
    ? hotel.Rooms
    : (hotel?.Rooms ? [hotel.Rooms] : []);
  const roomPrices = rooms
    .map((r) => ({ amount: roomTotal(r, hotel), currency: roomCurrency(r, hotel) }))
    .filter((p) => p.amount > 0);

  if (roomPrices.length > 0) {
    const cheapest = roomPrices.reduce((min, cur) => (cur.amount < min.amount ? cur : min), roomPrices[0]);
    return {
      amount: cheapest.amount,
      currency: cheapest.currency,
      amountINR: toINR(cheapest.amount, cheapest.currency, fxRates),
    };
  }

  const fallbackAmount = roomTotal(null, hotel);
  const fallbackCurrency = roomCurrency(null, hotel);
  return {
    amount: fallbackAmount,
    currency: fallbackCurrency,
    amountINR: toINR(fallbackAmount, fallbackCurrency, fxRates),
  };
}

function hotelImageUrls(hotel) {
  const parseAnyImages = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => {
          if (!item) return [];
          if (typeof item === "string") return [item];
          if (typeof item === "object") {
            return [
              item.ImageUrl,
              item.ImageURL,
              item.imageURL,
              item.Url,
              item.URL,
              item.url,
            ].filter(Boolean);
          }
          return [];
        })
        .map(normalizeImageUrl)
        .filter(Boolean);
    }
    if (typeof value !== "string") return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(normalizeImageUrl).filter(Boolean);
      } catch {
        // fallback split
      }
    }
    return trimmed.split(/[,\s]+/).map(normalizeImageUrl).filter(Boolean);
  };

  const urls = [
    hotel?.HotelPicture,
    hotel?.ImagePath,
    ...parseAnyImages(hotel?.Images),
    ...parseAnyImages(hotel?.ImageUrls),
    ...parseAnyImages(hotel?.imageURL),
  ]
    .map(normalizeImageUrl)
    .filter(Boolean);
  const roomDetails = Array.isArray(hotel?.RoomDetails) ? hotel.RoomDetails : [];
  for (const room of roomDetails) {
    urls.push(
      ...parseAnyImages(room?.imageURL),
      ...parseAnyImages(room?.ImageURL),
      ...parseAnyImages(room?.ImageUrls),
      ...parseAnyImages(room?.Images)
    );
  }
  return [...new Set(urls)];
}

function proxyImageUrl(url) {
  if (!url) return "";
  return `${API_BASE}/image?url=${encodeURIComponent(url)}`;
}

function HotelImage({ hotel, alt, style, className }) {
  const urls = hotelImageUrls(hotel);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [hotel?.HotelCode, hotel?.HotelName]);

  if (urls.length === 0) return <span>🏨</span>;
  return (
    <img
      src={proxyImageUrl(urls[idx])}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (idx < urls.length - 1) setIdx((i) => i + 1);
      }}
    />
  );
}

/* ═══════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.hp-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#eef2f7;min-height:100vh;display:flex;flex-direction:column}

/* ── header ── */
.hp-hdr{display:flex;align-items:center;justify-content:space-between;padding:0 clamp(16px,3%,40px);background:#fff;border-bottom:1px solid #f0f0f0;min-height:72px;gap:12px;flex-shrink:0}
.hp-logo{display:flex;align-items:center;flex-shrink:0}
.hp-logo-img{height:58px;width:auto;object-fit:contain;display:block}
.hp-hdr-right{display:flex;align-items:center;gap:12px;flex-shrink:0;margin-left:auto}
.hp-home-btn{background:#fff;border:1px solid #f0f0f0;color:#444;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .2s}
.hp-home-btn:hover{background:#fff5f0;color:#ff6600;border-color:#ffd8bf}

/* ── sub-nav ── */
.hp-nav{background:linear-gradient(90deg,#0b3d6e,#0f5298);display:flex;align-items:center;padding:0 28px;height:60px;gap:4px;box-shadow:0 3px 10px rgba(0,0,0,.2);flex-shrink:0}
.hp-nav-menu{display:flex;align-items:center;gap:4px;width:100%}
.hp-nav-toggle{display:none}
.hp-ni{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 16px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.6);font-size:.66rem;font-weight:600;letter-spacing:.3px;text-transform:uppercase;transition:all .2s;border:1px solid transparent;min-width:68px}
.hp-ni:hover{background:rgba(255,255,255,.1);color:#fff}
.hp-ni.act{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.25)}
.hp-ni.act span{color:#ffd740}
.hp-ni svg{width:19px;height:19px}
.hp-back-btn{margin-left:auto;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;padding:5px 13px;border-radius:8px;cursor:pointer;font-size:.7rem;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;transition:background .2s}
.hp-back-btn:hover{background:rgba(255,255,255,.2)}

/* ── content ── */
.hp-content{flex:1;padding:20px 28px 40px;display:flex;flex-direction:column;gap:0;overflow:auto;position:relative;isolation:isolate}
.hp-bc{font-size:.73rem;color:#64748b;margin-bottom:14px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.hp-bc .act{color:#0f5298;font-weight:600}
.hp-bc-sep{color:#cbd5e1}

/* ── error ── */
.hp-err{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:13px 16px;display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;animation:fadeIn .2s ease}
.hp-err-txt{font-size:.8rem;color:#7f1d1d;line-height:1.55;flex:1}
.hp-err-x{background:#e53e3e;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;font-family:inherit}
.hp-err.hp-ok{background:#ecfdf3;border-color:#86efac}
.hp-err.hp-ok .hp-err-txt{color:#166534}
.hp-err.hp-ok .hp-err-x{background:#16a34a}

/* ── search box ── */
.hp-sbox{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(15,82,152,.09),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(15,82,152,.08);position:relative}
.hp-search-box{z-index:40}
.hp-srow1{display:flex;align-items:flex-end;padding:18px 18px 14px;gap:10px;border-bottom:1px solid #f0f4f8;flex-wrap:wrap}
.hp-srow2{display:flex;align-items:flex-end;padding:12px 18px 16px;gap:10px;flex-wrap:wrap}
.hp-filters-toggle{display:none}

/* field */
.hp-f{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.hp-f.city{flex:2;min-width:200px}
.hp-f.dt{flex:0 0 158px}
.hp-f.rm{flex:0 0 212px}
.hp-ff{flex:1;min-width:130px;display:flex;flex-direction:column;gap:4px}
.hp-lbl{font-size:.58rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;padding-left:2px}
.hp-fin{display:flex;align-items:center;gap:8px;background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:10px;padding:9px 12px;transition:all .2s;cursor:pointer;min-height:46px}
.hp-fin:hover{border-color:#0f5298;background:#f0f7ff}
.hp-fin:focus-within{border-color:#0f5298;box-shadow:0 0 0 3px rgba(15,82,152,.08);background:#fff}
.hp-fic{color:#0f5298;flex-shrink:0}
.hp-fic svg{width:17px;height:17px}
.hp-finput{border:none;outline:none;background:transparent;font-size:.86rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.hp-finput::placeholder{color:#a0aec0;font-weight:400}
.hp-fval{font-size:.86rem;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hp-fval.ph{color:#a0aec0;font-weight:400}
.hp-fsub{font-size:.62rem;color:#94a3b8;margin-top:1px}

.hp-ffin{display:flex;align-items:center;gap:7px;background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:8px;padding:7px 10px;cursor:pointer;transition:all .2s;min-height:38px}
.hp-ffin:hover{border-color:#0f5298;background:#f0f7ff}
.hp-ffin:focus-within{border-color:#0f5298;background:#fff}
.hp-ffic{color:#64748b;flex-shrink:0}
.hp-ffic svg{width:14px;height:14px}
.hp-ffval{font-size:.76rem;color:#475569;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.hp-ffval.ph{color:#a0aec0;font-weight:400}
.hp-ffin input{border:none;outline:none;background:transparent;font-size:.76rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.hp-ffin input::placeholder{color:#a0aec0}
.hp-chev svg{width:12px;height:12px;color:#94a3b8}
.hp-ff.senior{flex:0 0 300px;min-width:250px}
.hp-senior-dd{padding:10px 12px;min-width:285px}
.hp-senior-dd-title{font-size:.68rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.hp-senior-row{display:flex;align-items:flex-start;gap:8px;padding:6px 0}
.hp-senior-row input{margin-top:2px}
.hp-senior-row label{font-size:.76rem;color:#334155;line-height:1.4;cursor:pointer}
.hp-senior-row.sub label{font-size:.72rem;color:#475569}
.hp-senior-row.sub{padding-left:16px}
.hp-senior-row.off{opacity:.5}
.hp-senior-apply{width:100%;margin-top:8px;background:#0f5298;color:#fff;border:none;border-radius:8px;padding:8px 10px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit}

/* search btn */
.hp-sbtn{flex-shrink:0;background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:12px;padding:0 26px;height:46px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(15,82,152,.35);white-space:nowrap}
.hp-sbtn:hover:not(:disabled){background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,82,152,.45)}
.hp-sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.hp-sbtn svg{width:16px;height:16px}

/* dropdown */
.hp-drop{position:absolute;top:calc(100% + 6px);left:0;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.05);z-index:5000;animation:fadeDown .18s ease both;overflow:hidden}
.hp-cal-drop{min-width:305px;overflow:visible}
@keyframes fadeDown{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}

/* calendar */
.hp-cal{padding:15px;min-width:275px}
.hp-cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.hp-cal-nav{background:#f0f4f8;border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:#334155;transition:background .15s}
.hp-cal-nav:hover{background:#dbeafe;color:#0f5298}
.hp-cal-mon{font-size:.82rem;font-weight:700;color:#1e293b}
.hp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.hp-dow{font-size:.56rem;font-weight:700;text-align:center;color:#94a3b8;padding:3px;text-transform:uppercase}
.hp-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:7px;cursor:pointer;font-size:.72rem;font-weight:500;color:#334155;transition:all .13s;position:relative;padding:4px 2px}
.hp-day:hover:not(.dis){background:#e8f0fe;color:#0f5298}
.hp-day.dis{color:#d1d5db;cursor:default}
.hp-day.sel{background:#0f5298 !important;color:#fff !important;font-weight:700}
.hp-day.tod::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#0f5298}
.hp-day.tod.sel::after{background:rgba(255,255,255,.7)}
.hp-day-num{line-height:1}
.hp-day-fare{font-size:.56rem;font-weight:700;line-height:1}
.hp-day-fare.low{color:#166534}
.hp-day-fare.mid{color:#854d0e}
.hp-day-fare.high{color:#991b1b}
.hp-day.sel .hp-day-fare{color:#fff !important}

/* rooms dropdown */
.hp-rm-drop{padding:15px;min-width:255px}
.hp-rm-ttl{font-size:.68rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:11px}
.hp-rm-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.hp-rm-lbl{font-size:.8rem;font-weight:600;color:#1e293b}
.hp-rm-sub{font-size:.62rem;color:#94a3b8;margin-top:1px}
.hp-ctr{display:flex;align-items:center;gap:7px}
.hp-ctr-btn{width:27px;height:27px;border-radius:7px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#334155;transition:all .15s;line-height:1}
.hp-ctr-btn:hover:not(:disabled){border-color:#0f5298;color:#0f5298;background:#e8f0fe}
.hp-ctr-btn:disabled{opacity:.3;cursor:default}
.hp-ctr-val{font-size:.88rem;font-weight:700;color:#1e293b;min-width:18px;text-align:center}
.hp-rm-apply{width:100%;margin-top:3px;background:#0f5298;color:#fff;border:none;border-radius:8px;padding:9px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit}

/* simple list dropdown */
.hp-slist{padding:7px;min-width:175px;max-height:260px;overflow-y:auto}
.hp-sitem{padding:8px 11px;border-radius:7px;cursor:pointer;font-size:.78rem;color:#334155;font-weight:500;display:flex;align-items:center;gap:7px;transition:background .14s}
.hp-sitem:hover{background:#f0f7ff;color:#0f5298}
.hp-sitem.act{background:#dbeafe;color:#0f5298;font-weight:700}

/* ── loading ── */
.hp-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;padding:60px 20px}
.hp-spin{width:38px;height:38px;border:3px solid #e2e8f0;border-top-color:#0f5298;border-radius:50%;animation:spin .75s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.hp-load-txt{font-size:.84rem;color:#64748b;font-weight:500;text-align:center}

/* ── results ── */
.hp-res-bar{display:flex;align-items:center;justify-content:space-between;margin:16px 0 11px;flex-wrap:wrap;gap:8px}
.hp-res-ct{font-size:.88rem;font-weight:700;color:#1e293b}
.hp-res-ct span{color:#0f5298}
.hp-sort-wrap{display:flex;align-items:center;gap:7px}
.hp-sort-lbl{font-size:.72rem;color:#64748b}
.hp-sort-sel{border:1.5px solid #e2e8f0;border-radius:8px;padding:5px 9px;font-size:.76rem;font-family:inherit;color:#334155;background:#fff;cursor:pointer;outline:none}

/* hotel card */
.hp-hcard{background:#fff;border-radius:14px;border:1.5px solid #e8f0fb;box-shadow:0 2px 12px rgba(15,82,152,.06);margin-bottom:11px;overflow:hidden;transition:all .2s}
.hp-hcard:hover{box-shadow:0 6px 24px rgba(15,82,152,.14);border-color:#bfdbfe;transform:translateY(-1px)}
.hp-hcard-inner{display:grid;grid-template-columns:190px 1fr 185px;gap:0}
.hp-himg{width:190px;height:145px;object-fit:cover;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;font-size:2.4rem;flex-shrink:0}
.hp-hbody{padding:13px 15px;display:flex;flex-direction:column;gap:5px;min-width:0}
.hp-hname{font-size:.97rem;font-weight:700;color:#1e293b;line-height:1.3}
.hp-hstars{color:#f59e0b;font-size:.72rem;letter-spacing:1px}
.hp-haddr{font-size:.71rem;color:#64748b;display:flex;align-items:center;gap:4px}
.hp-haddr svg{width:11px;height:11px;flex-shrink:0}
.hp-htags{display:flex;gap:5px;flex-wrap:wrap;margin-top:3px}
.hp-htag{background:#f0f9ff;color:#0369a1;font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid #bae6fd}
.hp-havail{font-size:.68rem;color:#16a34a;font-weight:600;margin-top:auto}
.hp-hprice{padding:13px 15px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;border-left:1px solid #f0f4f8}
.hp-plbl{font-size:.62rem;color:#94a3b8;text-transform:uppercase;font-weight:600}
.hp-pval{font-size:1.45rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;line-height:1}
.hp-pcur{font-size:.74rem;font-weight:500;color:#64748b;margin-top:1px}
.hp-pper{font-size:.62rem;color:#94a3b8}
.hp-rbadge{font-size:.6rem;padding:2px 8px;border-radius:20px;font-weight:700}
.hp-rbadge.ref{background:#dcfce7;color:#15803d}
.hp-rbadge.nref{background:#fef9c3;color:#a16207}
.hp-selrm-btn{background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 3px 10px rgba(15,82,152,.3);width:100%}
.hp-selrm-btn:hover{background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px)}

/* ── modal overlay ── */
.hp-modal-bg{position:fixed;inset:0;background:rgba(11,61,110,.5);z-index:800;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)}
.hp-modal{background:#fff;border-radius:20px;border:1px solid #dbeafe;box-shadow:0 24px 80px rgba(0,0,0,.25);width:100%;max-width:780px;max-height:92vh;overflow-y:auto;animation:modalIn .24s cubic-bezier(.34,1.56,.64,1)}
@keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(14px)}to{opacity:1;transform:none}}
.hp-mhdr{padding:18px 22px 14px;border-bottom:1px solid #f0f4f8;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%)}
.hp-mttl{font-size:1.05rem;font-weight:700;color:#1e293b}
.hp-msub{font-size:.72rem;color:#64748b;margin-top:2px}
.hp-mmeta{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
.hp-mchip{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid #dbeafe;background:#f8fbff;color:#334155;font-size:.63rem;font-weight:700;line-height:1}
.hp-mchip.rating{background:#fff7ed;border-color:#fed7aa;color:#b45309}
.hp-mchip.price{background:#eef6ff;border-color:#bfdbfe;color:#0f5298}
.hp-mchip.ok{background:#ecfeff;border-color:#a5f3fc;color:#0f766e}
.hp-mchip.muted{background:#f8fafc;border-color:#e2e8f0;color:#64748b}
.hp-mclose{width:30px;height:30px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:1rem;transition:all .15s;flex-shrink:0}
.hp-mclose:hover{background:#fee2e2;border-color:#fca5a5;color:#e53e3e}
.hp-mbody{padding:18px 22px}
.hp-mftr{padding:14px 22px;border-top:1px solid #f0f4f8;display:flex;align-items:center;justify-content:flex-end;gap:10px}
.hp-detail-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px}
.hp-detail-left{min-width:0}
.hp-detail-right{display:flex;flex-direction:column;gap:10px}
.hp-detail-loading{margin-bottom:8px;font-size:.74rem;color:#64748b}
.hp-detail-main-image{height:320px;border-radius:14px;overflow:hidden;border:1px solid #dbeafe;background:linear-gradient(135deg,#f8fafc,#f1f5f9);display:flex;align-items:center;justify-content:center}
.hp-detail-thumbs{display:flex;gap:8px;overflow-x:auto;margin-top:10px;padding:2px 0 4px}
.hp-detail-thumb{border:1px solid #cbd5e1;border-radius:9px;padding:0;overflow:hidden;width:84px;height:56px;background:#fff;cursor:pointer;flex-shrink:0;transition:border-color .14s,box-shadow .14s}
.hp-detail-thumb.active{border:2px solid #0f5298;box-shadow:0 0 0 2px rgba(15,82,152,.1)}
.hp-detail-section{margin-top:14px;background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);border:1px solid #dbeafe;border-radius:14px;padding:14px;box-shadow:0 4px 14px rgba(15,82,152,.08)}
.hp-detail-section-title{font-size:.78rem;font-weight:800;color:#1e293b;margin-bottom:9px;display:flex;align-items:center;gap:7px;letter-spacing:.2px}
.hp-detail-section-title::before{content:"";width:8px;height:8px;border-radius:999px;background:#0f5298;box-shadow:0 0 0 4px rgba(15,82,152,.12)}
.hp-detail-desc-list{display:grid;gap:8px}
.hp-detail-desc{font-size:.8rem;color:#334155;line-height:1.72;background:#ffffffc9;border:1px solid #e2e8f0;border-radius:10px;padding:9px 10px}
.hp-detail-side-card{border:1px solid #dbeafe;border-radius:12px;background:linear-gradient(180deg,#eff6ff 0%,#ffffff 100%);padding:12px 13px}
.hp-detail-side-label{font-size:.66rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.45px;margin-bottom:4px}
.hp-detail-side-price{font-size:1.25rem;font-weight:800;color:#0f5298;line-height:1;font-family:'Sora',sans-serif}
.hp-detail-side-sub{font-size:.68rem;color:#64748b;margin-top:4px}
.hp-link-clean{color:#0f5298;text-decoration:none;font-weight:700}
.hp-link-clean:hover{text-decoration:underline}
.hp-detail-contact{background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);border-color:#dbeafe}
.hp-detail-more-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.hp-detail-more-item{border:1px solid #cbd5e1;border-radius:8px;padding:0;overflow:hidden;height:78px;background:#fff;cursor:pointer}
.hp-detail-more-item.active{border:2px solid #0f5298}
.hp-detail-map{height:220px;border-radius:10px;overflow:hidden;border:1px solid #dbeafe}
.hp-detail-map-empty{font-size:.74rem;color:#64748b;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:12px}
.hp-img-lightbox{position:fixed;inset:0;background:rgba(2,6,23,.88);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.hp-img-lightbox-inner{max-width:min(96vw,1400px);max-height:92vh;display:flex;align-items:center;justify-content:center}
.hp-img-lightbox-inner img{max-width:100%;max-height:92vh;object-fit:contain;border-radius:10px;box-shadow:0 16px 48px rgba(0,0,0,.5)}
.hp-img-lightbox-close{position:absolute;top:16px;right:16px;width:38px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(15,23,42,.7);color:#fff;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center}

/* rate cards */
.hp-rcard{border:1.5px solid #e2e8f0;border-radius:12px;padding:13px 15px;margin-bottom:9px;cursor:pointer;transition:all .18s}
.hp-rcard:hover{border-color:#93c5fd;background:#f8fbff}
.hp-rcard.sel{border-color:#0f5298;background:#eff6ff;box-shadow:0 0 0 3px rgba(15,82,152,.1)}
.hp-rcard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.hp-rname{font-size:.86rem;font-weight:700;color:#1e293b}
.hp-rprice{font-size:1.18rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;white-space:nowrap}
.hp-rcur{font-size:.67rem;color:#64748b}
.hp-rtags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.hp-rtag{font-size:.6rem;font-weight:600;padding:2px 7px;border-radius:20px}
.hp-rtag.g{background:#dcfce7;color:#15803d}
.hp-rtag.b{background:#dbeafe;color:#1d4ed8}
.hp-rtag.o{background:#fff7ed;color:#c2410c}
.hp-rcancel{font-size:.66rem;color:#64748b;margin-top:5px}

/* guest form */
.hp-fsec{margin-bottom:18px}
.hp-fsec-ttl{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:11px;padding-bottom:7px;border-bottom:1px solid #f0f4f8}
.hp-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.hp-ffield{display:flex;flex-direction:column;gap:3px}
.hp-flbl{font-size:.64rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
.hp-finp{border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 11px;font-size:.82rem;font-family:inherit;color:#1e293b;outline:none;transition:border-color .2s;background:#fafcff}
.hp-finp:focus{border-color:#0f5298;box-shadow:0 0 0 3px rgba(15,82,152,.07);background:#fff}
.hp-fsel{border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 11px;font-size:.82rem;font-family:inherit;color:#1e293b;outline:none;background:#fafcff;cursor:pointer}
.hp-fsel:focus{border-color:#0f5298}

/* summary box */
.hp-sumbox{background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px}
.hp-sumttl{font-size:.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:9px}
.hp-sumrow{display:flex;justify-content:space-between;align-items:center;font-size:.78rem;color:#475569;margin-bottom:5px}
.hp-sumrow.tot{font-weight:700;color:#1e293b;font-size:.88rem;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:3px}
.hp-sumval{font-weight:600;color:#1e293b;text-align:right;max-width:190px;font-size:.78rem}

/* buttons */
.hp-btn-pri{background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:7px;box-shadow:0 3px 10px rgba(15,82,152,.3)}
.hp-btn-pri:hover:not(:disabled){background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px)}
.hp-btn-pri:disabled{opacity:.55;cursor:not-allowed;transform:none}
.hp-btn-out{background:#fff;color:#0f5298;border:1.5px solid #bfdbfe;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:7px}
.hp-btn-out:hover{background:#eff6ff}
.hp-btn-red{background:#fee2e2;color:#c53030;border:1.5px solid #fca5a5;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
.hp-btn-red:hover:not(:disabled){background:#e53e3e;color:#fff;border-color:#e53e3e}
.hp-btn-red:disabled{opacity:.5;cursor:not-allowed}

/* confirm page */
.hp-confirm{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(15,82,152,.09);padding:32px 28px;text-align:center;margin-top:14px}
.hp-ck-icon{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 22px rgba(34,197,94,.35)}
.hp-ck-icon svg{width:32px;height:32px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round}
.hp-ck-ttl{font-size:1.28rem;font-weight:800;color:#1e293b;margin-bottom:5px;font-family:'Sora',sans-serif}
.hp-ck-sub{font-size:.82rem;color:#64748b;margin-bottom:20px}
.hp-ref-box{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:11px 20px;display:inline-flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:22px}
.hp-ref-lbl{font-size:.62rem;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.5px}
.hp-ref-val{font-size:1.35rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;letter-spacing:2px}
.hp-ck-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;text-align:left;margin-bottom:22px;max-width:600px;margin-left:auto;margin-right:auto}
.hp-ck-item{background:#f7fafd;border-radius:10px;padding:11px 13px}
.hp-ck-lbl{font-size:.62rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.hp-ck-val{font-size:.84rem;font-weight:600;color:#1e293b}
.hp-ck-acts{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}

/* booking detail table */
.hp-dtbl{width:100%;border-collapse:collapse;margin-top:10px;font-size:.78rem}
.hp-dtbl th{background:#f0f7ff;padding:8px 12px;font-size:.67rem;font-weight:700;color:#475569;text-align:left;text-transform:uppercase;letter-spacing:.4px}
.hp-dtbl td{padding:9px 12px;color:#334155;border-bottom:1px solid #f0f4f8;vertical-align:top;word-break:break-word}
.hp-dtbl tr:hover td{background:#f8fbff}

/* quick stats */
.hp-stats{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
.hp-stat{background:#fff;border-radius:12px;padding:15px 17px;display:flex;align-items:flex-start;gap:11px;box-shadow:0 2px 10px rgba(15,82,152,.07);border:1px solid rgba(15,82,152,.07);cursor:pointer;transition:all .2s}
.hp-stat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(15,82,152,.13)}
.hp-stat-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hp-stat-ic.bl{background:#e8f0fe;color:#0f5298}
.hp-stat-ic.or{background:#fff3e0;color:#e65100}
.hp-stat-ic.gr{background:#e8f5e9;color:#2e7d32}
.hp-stat-ic svg{width:18px;height:18px}
.hp-stat-ttl{font-size:.8rem;font-weight:700;color:#1e293b;margin-bottom:2px}
.hp-stat-desc{font-size:.67rem;color:#64748b}
.hp-stat-n{font-size:1.28rem;font-weight:800;font-family:'Sora',sans-serif;line-height:1;margin-top:5px;color:#0f5298}

@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.fade{animation:fadeIn .22s ease}

/* city autocomplete */
.hp-city-dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.05);z-index:5000;animation:fadeDown .18s ease both;max-height:260px;overflow-y:auto;padding:5px}

/* Keep Leaflet map panes below field dropdowns/calendars */
.leaflet-container{z-index:1 !important}
.leaflet-pane,.leaflet-top,.leaflet-bottom,.leaflet-control,.leaflet-map-pane{z-index:1 !important}
.hp-city-item{padding:9px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:background .14s}
.hp-city-item:hover{background:#f0f7ff}
.hp-city-item .name{font-size:.82rem;font-weight:600;color:#1e293b}
.hp-city-item .code{font-size:.62rem;color:#94a3b8;font-weight:500;flex-shrink:0}
.hp-city-sel{display:flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:.62rem;font-weight:700;padding:2px 8px;border-radius:20px;flex-shrink:0;white-space:nowrap}
.hp-city-loading{padding:14px;text-align:center;font-size:.78rem;color:#94a3b8}

@media(max-width:900px){
  .hp-hcard-inner{grid-template-columns:140px 1fr}
  .hp-hprice{grid-column:1/-1;border-left:none;border-top:1px solid #f0f4f8;flex-direction:row;align-items:center}
  .hp-stats{grid-template-columns:1fr 1fr}
  .hp-ck-grid{grid-template-columns:1fr}
  .hp-fgrid{grid-template-columns:1fr}
  .hp-ff.senior{flex:1 1 100%;min-width:0}
  .hp-nav{position:relative;height:auto;min-height:56px;padding:10px 12px;flex-direction:column;align-items:stretch;gap:8px}
  .hp-nav-toggle{display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:.76rem;font-weight:700;border-radius:10px;padding:10px 12px;cursor:pointer;font-family:inherit}
  .hp-nav-toggle svg{width:18px;height:18px}
  .hp-nav-menu{display:none;position:absolute;top:calc(100% + 6px);left:12px;right:12px;z-index:520;flex-direction:column;align-items:stretch;gap:6px;padding:8px;background:linear-gradient(135deg,#0b3d6e,#0f5298);border:1px solid rgba(255,255,255,.18);border-radius:12px;box-shadow:0 12px 24px rgba(2,6,23,.35)}
  .hp-nav-menu.open{display:flex}
  .hp-ni{flex-direction:row;justify-content:flex-start;gap:10px;padding:10px 12px;min-width:0;font-size:.74rem}
  .hp-ni svg{width:17px;height:17px}
  .hp-back-btn{margin-left:0;justify-content:center}
  .hp-srow2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;padding:12px 14px 14px;gap:10px}
  .hp-ff{min-width:0}
  .hp-ffin{min-height:42px}
  .hp-detail-grid{grid-template-columns:1fr}
}
@media(max-width:640px){
  .hp-hdr{padding:0 12px;min-height:64px;gap:10px}
  .hp-logo-img{height:50px}
  .hp-hdr-right{gap:8px}
  .hp-content{padding:12px 14px 32px}
  .hp-hcard-inner{grid-template-columns:1fr}
  .hp-himg{width:100%;height:130px;border-radius:0}
  .hp-stats{grid-template-columns:1fr}
  .hp-sbox{border-radius:14px}
  .hp-srow1{padding:12px}
  .hp-filters-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;width:calc(100% - 24px);margin:0 12px 10px;background:linear-gradient(135deg,#eef6ff,#e4f0ff);border:1.5px solid #bfdbfe;border-radius:11px;padding:10px 12px;color:#0f5298;font-size:.82rem;font-weight:700;font-family:inherit;cursor:pointer}
  .hp-filters-toggle svg{width:16px;height:16px;flex-shrink:0}
  .hp-srow2{display:none;grid-template-columns:1fr;gap:12px;padding:0 12px 12px}
  .hp-srow2-wrap.open .hp-srow2{display:grid}
  .hp-lbl{font-size:.64rem;letter-spacing:.7px;color:#64748b}
  .hp-ffin{padding:10px 12px;min-height:46px;border-radius:10px}
  .hp-ffval,.hp-ffin input{font-size:.88rem;color:#1e293b}
  .hp-ffic svg,.hp-chev svg{width:16px;height:16px}
  .hp-ff .hp-drop{left:0;right:0;min-width:0;width:100%}
  .hp-senior-dd{min-width:0}
  .hp-detail-main-image{height:220px}
  .hp-detail-map{height:180px}
  .hp-detail-side-price{font-size:1.1rem}
}
`;

/* ═══════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const NAT = [
  {code:"IN",label:"Indian"},{code:"US",label:"American"},{code:"GB",label:"British"},
  {code:"AU",label:"Australian"},{code:"AE",label:"UAE"},{code:"CA",label:"Canadian"},
  {code:"DE",label:"German"},{code:"FR",label:"French"},{code:"SG",label:"Singaporean"},
  {code:"MY",label:"Malaysian"},{code:"NZ",label:"New Zealander"},{code:"ZA",label:"South African"},
];
const DEST_COUNTRIES = [
  {code:"IN",label:"India"},{code:"AE",label:"UAE"},{code:"TH",label:"Thailand"},
  {code:"SG",label:"Singapore"},{code:"MY",label:"Malaysia"},{code:"ID",label:"Indonesia"},
  {code:"GB",label:"United Kingdom"},{code:"US",label:"United States"},{code:"AU",label:"Australia"},
  {code:"FR",label:"France"},{code:"DE",label:"Germany"},{code:"CA",label:"Canada"},
  {code:"NZ",label:"New Zealand"},{code:"LK",label:"Sri Lanka"},{code:"NP",label:"Nepal"},
];
const STAR_OPTS = [
  {label:"All",val:null},
  {label:"5 Star",val:[5]},
  {label:"4 Star",val:[4]},
  {label:"3 Star",val:[3]},
];

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function fmtDisp(d){ if(!d) return null; return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`; }
function fmtApi(d){ if(!d) return ""; const m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0"); return `${d.getFullYear()}-${m}-${dd}`; }
function nights(a,b){ if(!a||!b) return 0; return Math.round((b-a)/864e5); }
function stars(n){ n=Math.max(0,Math.min(5,n||0)); return "★".repeat(n)+"☆".repeat(5-n); }

/* ═══════════════════════════════════════════════
   MINI CALENDAR
   ═══════════════════════════════════════════════ */
function dateKeyFromDate(dt){ if(!dt) return ""; return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`; }
function stableHash(text){ let h=0; for(let i=0;i<text.length;i+=1){ h=((h<<5)-h+text.charCodeAt(i))|0; } return Math.abs(h); }
function buildRealisticHotelFallbackFare({date,citySeed,rooms,adults,children}){
  const routeSeed = stableHash(String(citySeed||"city"));
  const dateSeed = stableHash(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
  const day = date.getDay();
  const weekendLift = day===5 || day===6 || day===0 ? 700 : 0;
  const occupancyLift = Math.max(0, Number(rooms||1)-1) * 1200 + Math.max(0, Number(adults||2)-2) * 600 + Math.max(0, Number(children||0)) * 350;
  const base = 2400 + (routeSeed % 4200);
  const swing = (dateSeed % 1400) - 500;
  return Math.max(1800, Math.round(base + occupancyLift + weekendLift + swing));
}

function MiniCal({value, onChange, onClose, minDate, faresByDate = {}, onViewChange, fallbackSeed = "city", roomCfg = {count:1,adults:2,children:0}}){
  const today=new Date(); today.setHours(0,0,0,0);
  const init=value||today;
  const [v,setV]=useState({y:init.getFullYear(),m:init.getMonth()});
  useEffect(()=>{ if(!onViewChange) return; onViewChange(new Date(v.y,v.m,1)); },[v.y,v.m]); // eslint-disable-line react-hooks/exhaustive-deps
  const days=new Date(v.y,v.m+1,0).getDate();
  const first=new Date(v.y,v.m,1).getDay();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  function pick(d){
    if(!d) return;
    const dt=new Date(v.y,v.m,d); dt.setHours(0,0,0,0);
    if(dt<(minDate||today)) return;
    onChange(dt); onClose();
  }
  function cls(d){
    if(!d) return "hp-day dis";
    const dt=new Date(v.y,v.m,d); dt.setHours(0,0,0,0);
    let c="hp-day";
    if(dt<(minDate||today)) c+=" dis";
    else {
      if(value && dt.toDateString()===value.toDateString()) c+=" sel";
      if(dt.toDateString()===today.toDateString()) c+=" tod";
    }
    return c;
  }
  function fareMeta(d){
    if(!d) return null;
    const dt=new Date(v.y,v.m,d); dt.setHours(0,0,0,0);
    if(dt<(minDate||today)) return null;
    const key = dateKeyFromDate(dt);
    const apiFare = faresByDate[key];
    const fallback = buildRealisticHotelFallbackFare({date:dt,citySeed:fallbackSeed,rooms:roomCfg.count,adults:roomCfg.adults,children:roomCfg.children});
    const amount = Number.isFinite(Number(apiFare?.minFare)) ? Number(apiFare.minFare) : fallback;
    const level = apiFare?.level || (amount <= 3500 ? "low" : amount <= 6000 ? "mid" : "high");
    return { amount, level };
  }
  return (
    <div className="hp-cal">
      <div className="hp-cal-hdr">
        <button className="hp-cal-nav" onClick={()=>setV(v=>v.m===0?{y:v.y-1,m:11}:{y:v.y,m:v.m-1})}>‹</button>
        <span className="hp-cal-mon">{MONTHS[v.m]} {v.y}</span>
        <button className="hp-cal-nav" onClick={()=>setV(v=>v.m===11?{y:v.y+1,m:0}:{y:v.y,m:v.m+1})}>›</button>
      </div>
      <div className="hp-cal-grid">
        {DOW.map(d=><div key={d} className="hp-dow">{d}</div>)}
        {cells.map((d,i)=>{
          const meta = fareMeta(d);
          return (
            <div key={i} className={cls(d)} onClick={()=>pick(d)}>
              <div className="hp-day-num">{d}</div>
              {meta && <div className={`hp-day-fare ${meta.level}`}>Rs {Math.round(meta.amount).toLocaleString("en-IN")}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function HotelsPage({onBack}){
  const navigate = useNavigate();
  const persistedForm = loadPersistedHotelForm() || {};

  /* ── search form state ── */
  const [cityQuery,setCityQuery]   = useState(persistedForm.cityQuery || "");
  const [cityId,setCityId]         = useState(persistedForm.cityId || "");
  const [cityName,setCityName]     = useState(persistedForm.cityName || "");
  const [allCities,setAllCities]   = useState([]);
  const [cityLoading,setCityLoading] = useState(false);
  const [showCityDD,setShowCityDD] = useState(false);
  const [destCountry,setDestCountry] = useState(persistedForm.destCountry || "IN");
  const [hotelCodes,setHotelCodes] = useState(persistedForm.hotelCodes || "");
  const [showHotelCodes,setShowHotelCodes] = useState(false);
  const [checkIn,setCI]    = useState(parseStoredDate(persistedForm.checkIn));
  const [checkOut,setCO]   = useState(parseStoredDate(persistedForm.checkOut));
  const [roomCfg,setRC]    = useState(persistedForm.roomCfg || {count:1,adults:2,children:0});
  const [nat,setNat]       = useState(persistedForm.nat || "IN");
  const [starF,setStarF]   = useState(persistedForm.starF ?? null);
  const [budget,setBudget] = useState(persistedForm.budget || "");
  const [seniorAssist,setSeniorAssist] = useState(Boolean(persistedForm.seniorAssist || false));
  const [groundFloorPref,setGroundFloorPref] = useState(Boolean(persistedForm.groundFloorPref || false));
  const [minimalWalkingPref,setMinimalWalkingPref] = useState(Boolean(persistedForm.minimalWalkingPref || false));
  const [easyTransferPref,setEasyTransferPref] = useState(Boolean(persistedForm.easyTransferPref || false));
  const [drop,setDrop]     = useState(null);

  /* ── api / page state ── */
  const [page,setPage]       = useState("home");   // home | results | prebook | confirm | detail
  const [loading,setLoading] = useState(false);
  const [apiErr,setApiErr]   = useState("");

  /* ── results ── */
  const [searchId,setSearchId] = useState("");
  const [hotels,setHotels]     = useState([]);
  const calendarFlexDays = 3;
  const [hotelCalendarFares,setHotelCalendarFares] = useState([]);
  const [sortBy,setSortBy]     = useState(persistedForm.sortBy || "price_asc");
  const [fxRates,setFxRates]   = useState({ INR: 1 });
  const [showMap,setShowMap]   = useState(true);
  const [mobileNavOpen,setMobileNavOpen] = useState(false);
  const [mobileFiltersOpen,setMobileFiltersOpen] = useState(false);
  const [detailHotel,setDetailHotel] = useState(null);
  const [detailImageIdx,setDetailImageIdx] = useState(0);
  const [detailLoading,setDetailLoading] = useState(false);
  const [fullscreenImageUrl,setFullscreenImageUrl] = useState("");
  const [autoSearchPending,setAutoSearchPending] = useState(false);

  const hotelCalendarFareMap = useMemo(()=>{
    const out = {};
    for (const fare of hotelCalendarFares) {
      if (!fare?.checkIn) continue;
      out[String(fare.checkIn)] = fare;
    }
    return out;
  }, [hotelCalendarFares]);

  /* ── prebook / booking ── */
  const [selHotel,setSelHotel]   = useState(null);
  const [prebookRes,setPrebookRes] = useState(null);
  const [selRateIdx,setSelRateIdx] = useState(0);
  const [guest,setGuest] = useState(() => ({ ...EMPTY_GUEST }));

  /* ── post-booking ── */
  const [bookingRef,setBookingRef]     = useState("");
  const [bookingDetail,setBookingDetail] = useState(null);
  const [cancelMsg,setCancelMsg]         = useState("");

  const boxRef = useRef(null);
  const cityDDRef = useRef(null);
  const hasFetchedCitiesOnce = useRef(false);
  const lastAppliedQuerySignature = useRef("");

  /* fetch city list when destination country changes */
  useEffect(()=>{
    let cancelled = false;
    setCityLoading(true);
    // Keep restored values on first load; clear only when country is changed by user.
    if (hasFetchedCitiesOnce.current) {
      setCityId(""); setCityName(""); setCityQuery("");
    } else {
      hasFetchedCitiesOnce.current = true;
    }
    const cachedCities = readCitiesCache(destCountry);
    if (!cancelled && Array.isArray(cachedCities) && cachedCities.length > 0) {
      setAllCities(cachedCities);
      setCityLoading(false);
    }
    (async ()=>{
      try {
        const data = await apiPost("cities",{countryCode:destCountry});
        if(!cancelled) {
          const cities = Array.isArray(data.cities) ? data.cities : [];
          setAllCities(cities);
          writeCitiesCache(destCountry, cities);
        }
      } catch(e){ console.error("City list fetch failed:",e); }
      finally { if(!cancelled) setCityLoading(false); }
    })();
    return ()=>{ cancelled=true; };
  },[destCountry]);

  useEffect(() => {
    try {
      const prefill = JSON.parse(localStorage.getItem("voyagehack.hotel.prefill") || "{}");
      const unified = JSON.parse(localStorage.getItem("voyagehack.unifiedSearch") || "{}");
      const smart = JSON.parse(localStorage.getItem("voyagehack.smartQuery") || "{}");
      const queryText = prefill.query || smart.query || unified.query || "";
      const prefBudget = Number(
        prefill.budget ||
        prefill.maxBudget ||
        unified?.budget?.maxValue ||
        smart.budget ||
        extractBudgetFromQuery(queryText) ||
        0
      );

      // Destination: prefer explicit prefill, then smart query destination.
      // Keep the visible field as user-typed city text (e.g. "Jaipur"),
      // while resolving CityId/CityName in background for API calls.
      const queryDest = extractToCityFromQuery(prefill.query || smart.query || unified.query || "");
      const smartDest = smart.destination || unified.destination || unified.toCity || "";
      const rawDest = prefill.destination || prefill.toCity || smartDest || queryDest || "";
      if (rawDest) {
        const nextText = String(rawDest).trim();
        const currentText = String(cityQuery || "").trim();
        const destinationChanged = !currentText || currentText.toLowerCase() !== nextText.toLowerCase();
        if (!currentText || currentText.toLowerCase() !== nextText.toLowerCase()) {
          setCityQuery(nextText);
          setCityId("");
          setCityName(nextText);
        }
        // If allCities is loaded we can also set cityId immediately.
        if (allCities.length > 0) {
          const match = findBestCityMatch(nextText, allCities);
          if (match) {
            setCityId(match.CityId);
            setCityName(match.CityName);
          }
        }
        const hasExistingSearchState = page === "results";
        if (destinationChanged || !hasExistingSearchState) {
          setAutoSearchPending(true);
        }
      }

      const hasIncomingSearchContext = Boolean(
        prefill.query || smart.query || unified.query ||
        prefill.destination || prefill.toCity || smart.destination || unified.destination || unified.toCity
      );
      if (prefBudget > 0) {
        const currentBudget = Number(budget || 0);
        if ((hasIncomingSearchContext || currentBudget <= 0) && currentBudget !== prefBudget) {
          setBudget(String(prefBudget));
        }
      }

      // Dates: prefer prefill, then smart query.
      // If no dates are stored, default to today and derive checkout from duration.
      const startDateSrc = prefill.startDate || smart.startDate || unified.startDate;
      const endDateSrc = prefill.endDate || smart.endDate || unified.endDate;
      const durationDays = Number(prefill.durationDays || smart.durationDays || smart.duration || 0) || extractDays(queryText);
      const querySignature = `${String(queryText || "").trim().toLowerCase()}::${String(smart.createdAt || prefill.createdAt || unified.createdAt || "")}`;

      // Fresh duration extraction per new search query:
      // always reset stay to today + extracted days (default 1 day if no match).
      if (String(queryText || "").trim() && querySignature !== lastAppliedQuerySignature.current) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkout = new Date(today);
        checkout.setDate(checkout.getDate() + Math.max(1, durationDays));
        setCI(today);
        setCO(checkout);
        lastAppliedQuerySignature.current = querySignature;
      }

      // Respect explicit/manual dates first.
      // Auto-detect from query only when there are no incoming dates and no preselected dates.
      const hasExplicitDates = Boolean(startDateSrc || endDateSrc || checkIn || checkOut);
      if (!hasExplicitDates && !String(queryText || "").trim()) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkout = new Date(today);
        checkout.setDate(checkout.getDate() + Math.max(1, durationDays));
        setCI(today);
        setCO(checkout);
      } else {

        if (startDateSrc && !checkIn) {
          const d = new Date(startDateSrc);
          if (!Number.isNaN(d.getTime())) setCI(d);
        } else if (!startDateSrc && !checkIn) {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          setCI(d);
        }

        if (endDateSrc && !checkOut) {
          const d = new Date(endDateSrc);
          if (!Number.isNaN(d.getTime())) setCO(d);
        }

        if (startDateSrc && !endDateSrc && !checkOut) {
          const d = new Date(startDateSrc);
          if (!Number.isNaN(d.getTime())) {
            d.setDate(d.getDate() + durationDays);
            setCO(d);
          }
        } else if (!startDateSrc && !endDateSrc && !checkOut) {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + durationDays);
          setCO(d);
        } else if (!startDateSrc && endDateSrc && !checkIn) {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          if (!Number.isNaN(d.getTime())) {
            setCI(d);
          }
        }
      }

      // Guests from unified search
      const guestsSrc = prefill.adults || unified?.guests?.adults;
      if (prefill.adults || prefill.children) {
        setRC((prev) => ({
          ...prev,
          adults: Math.max(1, Number(prefill.adults || prev.adults || 1)),
          children: Math.max(0, Number(prefill.children || prev.children || 0)),
        }));
      } else if (unified?.guests) {
        setRC((prev) => ({
          ...prev,
          adults: Math.max(1, Number(unified.guests.adults || prev.adults || 1)),
          children: Math.max(0, Number(unified.guests.children || prev.children || 0)),
        }));
      }
    } catch {
      // ignore malformed storage payloads
    }
  }, []);

  useEffect(() => {
    if (!autoSearchPending || !cityId || !checkIn || !checkOut) return;
    setAutoSearchPending(false);
    doSearch();
  }, [autoSearchPending, cityId, checkIn, checkOut]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resolve cityQuery to a full city object when allCities loads.
  // Uses findBestCityMatch() which handles "Goa" → "Goa, Goa" etc.
  useEffect(() => {
    if (!cityId && cityQuery && allCities.length > 0) {
      const match = findBestCityMatch(cityQuery, allCities);
      if (match) {
        setCityId(match.CityId);
        setCityName(match.CityName);
      }
    }
  }, [allCities, cityId, cityQuery]);

  /* persist hotel form inputs so refresh does not wipe user-entered details */
  useEffect(() => {
    const payload = {
      cityQuery,
      cityId,
      cityName,
      destCountry,
      hotelCodes,
      checkIn: checkIn ? checkIn.toISOString() : null,
      checkOut: checkOut ? checkOut.toISOString() : null,
      roomCfg,
      nat,
      starF,
      budget,
      seniorAssist,
      groundFloorPref,
      minimalWalkingPref,
      easyTransferPref,
      sortBy,
    };
    try {
      localStorage.setItem(HOTEL_FORM_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors and keep app usable.
    }
  }, [cityQuery, cityId, cityName, destCountry, hotelCodes, checkIn, checkOut, roomCfg, nat, starF, budget, seniorAssist, groundFloorPref, minimalWalkingPref, easyTransferPref, sortBy]);

  /* close dropdowns on outside click */
  useEffect(()=>{
    const h=e=>{
      if(boxRef.current&&!boxRef.current.contains(e.target)) setDrop(null);
      if(cityDDRef.current&&!cityDDRef.current.contains(e.target)) setShowCityDD(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const tog = name => setDrop(o=>o===name?null:name);

  /* client-side city filtering */
  // Filter cities for dropdown: match on CityName OR ShortName so that
  // typing "Goa" surfaces "Goa, Goa" and typing "Delhi" surfaces "Delhi, Delhi".
  const filteredCities = cityQuery.trim()
    ? allCities.filter(c => {
        const q = cityQuery.toLowerCase();
        return (
          (c.CityName  || "").toLowerCase().includes(q) ||
          (c.ShortName || "").toLowerCase().includes(q)
        );
      }).slice(0, 20)
    : [];

  /* ── derived ── */
  const nt = nights(checkIn,checkOut);
  const roomLbl = `${roomCfg.count} Room${roomCfg.count>1?"s":""} (${roomCfg.adults} Adult${roomCfg.adults>1?"s":""},  ${roomCfg.children} Child${roomCfg.children!==1?"ren":""})`;
  const starLbl = STAR_OPTS.find(s=>JSON.stringify(s.val)===JSON.stringify(starF))?.label||"All";
  const natLbl  = NAT.find(n=>n.code===nat)?.label||nat;

  /* ══════════════════════
     SEARCH
     ══════════════════════ */
  async function doSearch(options = {}){
    const activeCheckIn = options.checkInDate || checkIn;
    const activeCheckOut = options.checkOutDate || checkOut;
    if(!cityId){ setApiErr("Please select a city from the suggestions."); return; }
    if(!activeCheckIn||!activeCheckOut){ setApiErr("Please select check-in and check-out dates."); return; }
    const searchKey = JSON.stringify({
      cityId,
      cityName: cityQuery || cityName || "",
      country: destCountry,
      checkIn: fmtApi(activeCheckIn),
      checkOut: fmtApi(activeCheckOut),
      rooms: roomCfg,
      nat,
      starF,
      budget: budget || "",
      hotelCodes: hotelCodes || "",
    });
    const warmCache = loadCachedHotelResults();
    const hasInstantResults =
      warmCache?.searchKey === searchKey &&
      Array.isArray(warmCache?.hotels) &&
      warmCache.hotels.length > 0;

    setApiErr("");
    setPage("results");
    if (hasInstantResults) {
      setSearchId(warmCache.searchId || "");
      setHotels(warmCache.hotels);
      setLoading(false);
    } else {
      setSearchId("");
      setLoading(true);
    }
    try{
      const body={
        CheckIn   : fmtApi(activeCheckIn),
        CheckOut  : fmtApi(activeCheckOut),
        HotelCodes: hotelCodes,
        GuestNationality: nat,
        PaxRooms  : Array.from({length:roomCfg.count},()=>({
          Adults      : roomCfg.adults,
          Children    : roomCfg.children,
          ChildrenAges: roomCfg.children>0?Array(roomCfg.children).fill(8):[],
        })),
        ResponseTime       : HOTEL_SEARCH_RESPONSE_TIME,
        IsDetailedResponse : true,
        Filters: {
          Refundable: false,
          NoOfRooms : roomCfg.count,
          ...(starF?{StarRating:starF}:{}),
          ...(budget?{MaxPrice:parseFloat(budget)}:{}),
        },
        CityId      : cityId,
        CityName    : cityQuery || cityName || "",
        CountryCode : destCountry,
      };
      const data = await apiPost("search", body);
      setSearchId(data.SearchId||"");
      const list = data.Hotels||data.HotelResult||[];
      setHotels(list);
      writeCachedHotelResults({
        searchId: data.SearchId || "",
        searchKey,
        hotels: Array.isArray(list) ? list : [],
      });
      if(list.length===0) setApiErr("No hotels found. Try a different city, dates, or relax the filters.");
    }catch(e){
      if (!hasInstantResults) {
        setApiErr(`Search failed: ${e.message}`);
      }
    }finally{ setLoading(false); }
  }


  async function loadCalendarFares(anchorDate = checkIn, options = {}){
    const { silent = false } = options;
    if(!cityId){ setApiErr("Please select a city from the suggestions."); return; }
    if(!anchorDate){ setApiErr("Please select check-in and check-out dates."); return; }

    const stayNights = Math.max(1, nights(checkIn, checkOut) || 1);
    const activeCheckIn = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const activeCheckOut = new Date(activeCheckIn);
    activeCheckOut.setDate(activeCheckOut.getDate() + stayNights);

    if(!silent) setApiErr("");
    try{
      const data = await apiPost("calendar-fares",{
        CityId      : cityId,
        CityName    : cityQuery || cityName || "",
        CountryCode : destCountry,
        CheckIn     : fmtApi(activeCheckIn),
        CheckOut    : fmtApi(activeCheckOut),
        HotelCodes  : hotelCodes,
        GuestNationality: nat,
        PaxRooms    : Array.from({length:roomCfg.count},()=>({
          Adults      : roomCfg.adults,
          Children    : roomCfg.children,
          ChildrenAges: roomCfg.children>0?Array(roomCfg.children).fill(8):[],
        })),
        ResponseTime: HOTEL_SEARCH_RESPONSE_TIME,
        Days: 42,
        FlexDays: calendarFlexDays,
        Filters: {
          Refundable: false,
          NoOfRooms : roomCfg.count,
          ...(starF?{StarRating:starF}:{}),
          ...(budget?{MaxPrice:parseFloat(budget)}:{}),
        },
      });
      setHotelCalendarFares(Array.isArray(data?.fares) ? data.fares : []);
    }catch(e){
      if(!silent) setApiErr(`Calendar fare failed: ${e.message}`);
      setHotelCalendarFares([]);
    }
  }
  useEffect(()=>{
    if (drop!=="ci" && drop!=="co") return;
    const seed = drop==="co" ? (checkOut || checkIn) : checkIn;
    if (!seed || !cityId) return;
    void loadCalendarFares(seed, { silent: true });
  }, [drop, cityId, cityName, cityQuery, checkIn, checkOut, hotelCodes, nat, roomCfg.count, roomCfg.adults, roomCfg.children, destCountry, calendarFlexDays]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const currencies = new Set();
    for (const hotel of hotels) {
      const rooms = Array.isArray(hotel?.Rooms) ? hotel.Rooms : (hotel?.Rooms ? [hotel.Rooms] : []);
      if (rooms.length > 0) {
        rooms.forEach((room) => currencies.add(String(roomCurrency(room, hotel) || "INR").toUpperCase()));
      } else {
        currencies.add(String(roomCurrency(null, hotel) || "INR").toUpperCase());
      }
    }

    const missing = [...currencies].filter((code) => code !== "INR" && !Number.isFinite(Number(fxRates?.[code])));
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const updates = {};
      await Promise.all(
        missing.map(async (cur) => {
          try {
            const res = await fetch(`${API_BASE}/fx-rate?base=${encodeURIComponent(cur)}&to=INR`);
            const data = await res.json().catch(() => ({}));
            const rate = Number(data?.rate);
            if (res.ok && Number.isFinite(rate) && rate > 0) updates[cur] = rate;
          } catch {
            // Keep UI usable even if FX fetch fails for some currencies.
          }
        })
      );
      if (!cancelled && Object.keys(updates).length > 0) {
        setFxRates((prev) => ({ ...prev, ...updates }));
      }
    })();

    return () => { cancelled = true; };
  }, [hotels, fxRates]);

  async function openHotelDetails(hotel){
    setDetailImageIdx(0);
    setDetailHotel(hotel);
    const hotelCode = String(hotel?.HotelCode || "").trim();
    if(!hotelCode) return;

    setDetailLoading(true);
    try{
      const data = await apiPost("hoteldetails",{
        Hotelcodes: hotelCode,
        Language: "EN",
        IsRoomDetailRequired: true,
      });
      const detail = Array.isArray(data?.HotelDetails) ? data.HotelDetails[0] : null;
      if(!detail) return;

      const merged = { ...hotel, ...detail };
      const mergedImages = [...new Set([...hotelImageUrls(hotel), ...hotelImageUrls(detail)])];
      if (mergedImages.length > 0) merged.Images = mergedImages;
      setDetailHotel(merged);
    }catch{
      // Keep base search data modal open if detailed fetch fails.
    }finally{
      setDetailLoading(false);
    }
  }

  function openCabForHotel(hotel) {
    const fallbackCity = cityQuery || cityName || hotel?.CityName || "";
    const city = String(fallbackCity || "").trim();
    if (!city) return;
    const pickupDate = checkIn ? new Date(checkIn) : new Date();
    try {
      localStorage.setItem("voyagehack.cab.prefill", JSON.stringify({
        city,
        budget: Number(budget || 0) || 0,
        date: pickupDate.toISOString(),
        seniorAssist,
        easyTransferOnly: seniorAssist && easyTransferPref,
      }));
      const prevUnified = JSON.parse(localStorage.getItem("voyagehack.unifiedSearch") || "{}");
      localStorage.setItem("voyagehack.unifiedSearch", JSON.stringify({
        ...prevUnified,
        destination: city,
        startDate: checkIn ? checkIn.toISOString() : prevUnified?.startDate || "",
        endDate: checkOut ? checkOut.toISOString() : prevUnified?.endDate || "",
        budget: {
          ...(prevUnified?.budget || {}),
          maxValue: Number(budget || prevUnified?.budget?.maxValue || 0) || 0,
        },
        preferences: {
          ...(prevUnified?.preferences || {}),
          seniorAssist,
          groundFloorPref: seniorAssist && groundFloorPref,
          minimalWalkingPref: seniorAssist && minimalWalkingPref,
          easyTransferPref: seniorAssist && easyTransferPref,
        },
      }));
    } catch {
      // Ignore storage issues and still navigate.
    }
    navigate("/cabs");
  }

  /* ══════════════════════
     PREBOOK
     ══════════════════════ */
  async function doPrebook(hotel){
    setSelHotel(hotel); setPrebookRes(null); setSelRateIdx(0); setGuest({ ...EMPTY_GUEST });
    setApiErr("");

    const firstRoom = Array.isArray(hotel?.Rooms) ? hotel.Rooms[0] : null;
    const bcode = firstRoom?.BookingCode || firstRoom?.bookingCode || hotel?.BookingCode || "";
    if (!bcode) {
      setApiErr("Unable to open room details: booking code is missing in search response for this hotel.");
      return;
    }

    setLoading(true); setPage("prebook");
    try{
      const data  = await apiPost("prebook",{
        BookingCode: bcode,
        PaymentMode: "Limit",
      }, { allowStatusCodes: [300] });
      setPrebookRes(data);
      if (String(data?.Status?.Code) === "300") {
        setApiErr(
          MOCK_HOTEL_BOOKING
            ? "Live fare loaded. Mock booking mode is ON, so you can continue demo booking."
            : "Live fare loaded, but booking is currently blocked because TBO account has insufficient balance."
        );
      }
    }catch(e){
      setApiErr(`PreBook failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     BOOK
     ══════════════════════ */
  async function doBook(){
    if(!guest.first||!guest.last||!guest.email||!guest.phone){
      setApiErr("Please fill in all required guest fields (First Name, Last Name, Email, Phone)."); return;
    }
    setApiErr(""); setLoading(true);

    /* pick chosen rate's booking code */
    const rates    = getPrebookRooms(prebookRes).length ? getPrebookRooms(prebookRes) : (selHotel?.Rooms || []);
    const rate     = rates[selRateIdx] || rates[0] || selHotel || {};
    const bcode    = prebookRes?.BookingCode || rate.BookingCode || selHotel?.BookingCode || "";
    if (!bcode) {
      setApiErr("Unable to confirm booking: booking code is missing. Please re-open room selection.");
      setLoading(false);
      return;
    }
    if (String(prebookRes?.Status?.Code) === "300" && !MOCK_HOTEL_BOOKING) {
      setApiErr("Cannot complete booking: TBO account has insufficient balance. Please top up supplier wallet.");
      setLoading(false);
      return;
    }

    const customerDetails = Array.from({ length: Math.max(roomCfg.count, 1) }, (_, roomIdx) => {
      const customerNames = [];

      for (let i = 0; i < Math.max(roomCfg.adults, 1); i += 1) {
        const isLeadGuest = roomIdx === 0 && i === 0;
        customerNames.push({
          Title: isLeadGuest ? guest.title : "Mr",
          FirstName: isLeadGuest ? guest.first : `Adult${roomIdx + 1}${i + 1}`,
          LastName: isLeadGuest ? guest.last : "Guest",
          Type: "Adult",
        });
      }

      for (let i = 0; i < Math.max(roomCfg.children, 0); i += 1) {
        customerNames.push({
          Title: "Ms",
          FirstName: `Child${roomIdx + 1}${i + 1}`,
          LastName: "Guest",
          Type: "Child",
        });
      }

      return { CustomerNames: customerNames };
    });
    const computedFare = Number(
      rate?.TotalFare ??
      prebookRes?.HotelResult?.[0]?.Rooms?.[0]?.TotalFare ??
      totalPrice ??
      0
    );
    const computedCurrency = roomCurrency(rate, selHotel);
    const computedFareINR = (() => {
      const primary = toINR(computedFare, computedCurrency, fxRates);
      if (Number.isFinite(primary) && primary > 0) return primary;
      const fallback = Number(totalPriceINR);
      if (Number.isFinite(fallback) && fallback > 0) return fallback;
      return computedFare;
    })();

    try{
      const data = await apiPost("book",{
        BookingCode       : bcode,
        CustomerDetails   : customerDetails,
        ClientReferenceId : `TBO_${Date.now()}`,
        BookingReferenceId: `BK_${Date.now()}`,
        TotalFare         : computedFare,
        EmailId           : guest.email,
        PhoneNumber       : guest.phone,
        BookingType       : "Voucher",
        PaymentMode       : "Limit",
        MockBooking       : MOCK_HOTEL_BOOKING,
      });
      const ref = data.ConfirmationNumber || data.BookingReferenceId || data.BookingId || `REF${Date.now()}`;
      setBookingRef(ref);
      saveBookingRecord({
        service: "hotel",
        reference: String(ref),
        status: "Confirmed",
        title: String(selHotel?.HotelName || "Hotel Booking"),
        location: String(cityQuery || cityName || selHotel?.CityName || ""),
        date: checkIn ? checkIn.toISOString() : "",
        amount: Number(computedFareINR || 0),
        currency: "INR",
        details: {
          checkIn: checkIn ? fmtApi(checkIn) : "",
          checkOut: checkOut ? fmtApi(checkOut) : "",
          nights: nt,
          rooms: roomCfg?.count || 1,
          guest: `${guest?.first || ""} ${guest?.last || ""}`.trim(),
        },
      });
      setPage("confirm");
    }catch(e){
      setApiErr(`Booking failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     BOOKING DETAIL
     ══════════════════════ */
  async function doDetail(){
    setApiErr(""); setLoading(true);
    try{
      const data = await apiPost("detail",{
        ConfirmationNumber: bookingRef,
        BookingReferenceId: bookingRef,
        PaymentMode:"Limit",
        MockBooking:MOCK_HOTEL_BOOKING
      });
      setBookingDetail(data.BookingDetail||data);
      setPage("detail");
    }catch(e){
      setApiErr(`Could not fetch booking detail: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     CANCEL
     ══════════════════════ */
  async function doCancel(){
    if(!window.confirm("Are you sure you want to cancel this booking? This action may be irreversible.")) return;
    setApiErr(""); setLoading(true); setCancelMsg("");
    try{
      const data = await apiPost("cancel",{
        ConfirmationNumber: bookingRef,
        BookingReferenceId: bookingRef,
        MockBooking:MOCK_HOTEL_BOOKING
      });
      const ok   = data.Status?.Code==="01"
                || data.Status?.Code===200
                || String(data.Status?.Description||"").toLowerCase().includes("success")
                || String(data.Status?.Description||"").toLowerCase().includes("cancel");
      if(ok){
        setCancelMsg("✅ Booking cancelled successfully.");
        setTimeout(()=>{ setPage("home"); setBookingRef(""); setBookingDetail(null); setCancelMsg(""); },3000);
      } else {
        setApiErr(`Cancellation response: ${data.Status?.Description||JSON.stringify(data)}`);
      }
    }catch(e){
      setApiErr(`Cancellation failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     SORT results
     ══════════════════════ */
  const activeBudget = Number(budget || 0);
  const activeStarValues = Array.isArray(starF) ? starF.map((v) => Number(v)).filter(Number.isFinite) : [];
  const hasStarFilter = activeStarValues.length > 0;
  const filteredHotels = hotels.filter((hotel) => {
    if (hasStarFilter) {
      const rawRating = Number(hotel?.HotelRating ?? hotel?.StarRating ?? 0);
      const bucket = Math.floor(rawRating);
      if (!activeStarValues.includes(bucket)) return false;
    }
    if (Number.isFinite(activeBudget) && activeBudget > 0) {
      const priceInINR = Number(hotelDisplayPrice(hotel, fxRates).amountINR);
      if (Number.isFinite(priceInINR) && !(priceInINR > 0 && priceInINR <= activeBudget)) return false;
    }
    return true;
  });

  const baseSorted = [...filteredHotels].sort((a,b)=>{
    const pa = roomTotal(a?.Rooms?.[0], a), pb = roomTotal(b?.Rooms?.[0], b);
    if(sortBy==="price_asc")  return pa-pb;
    if(sortBy==="price_desc") return pb-pa;
    if(sortBy==="stars" || sortBy==="rating_desc") return (b.HotelRating||0)-(a.HotelRating||0);
    if(sortBy==="name")       return (a.HotelName||"").localeCompare(b.HotelName||"");
    return 0;
  });
  const sorted = seniorAssist
    ? [...baseSorted].sort((a, b) => {
        const sa = seniorFacilityMatch(a);
        const sb = seniorFacilityMatch(b);
        const prefA = sa.score
          + (groundFloorPref && sa.groundFloorSupport ? 1 : 0)
          + (minimalWalkingPref && sa.minimalWalkingSupport ? 1 : 0)
          + (easyTransferPref && sa.easyTransferSupport ? 1 : 0);
        const prefB = sb.score
          + (groundFloorPref && sb.groundFloorSupport ? 1 : 0)
          + (minimalWalkingPref && sb.minimalWalkingSupport ? 1 : 0)
          + (easyTransferPref && sb.easyTransferSupport ? 1 : 0);
        if (prefB !== prefA) return prefB - prefA;
        return 0;
      })
    : baseSorted;
  const mappedHotels = sorted
    .map((hotel) => ({ hotel, point: parseHotelMapPoint(hotel) }))
    .filter((x) => x.point);

  /* ══════════════════════
     PREBOOK rate list
     ══════════════════════ */
  const prebookRooms = getPrebookRooms(prebookRes);
  const rateList = prebookRooms.length ? prebookRooms : (selHotel?.Rooms || []);
  const pickedRate = rateList[selRateIdx] || rateList[0] || selHotel || {};
  const totalPrice = roomTotal(pickedRate, selHotel);
  const totalPriceCurrency = roomCurrency(pickedRate, selHotel);
  const totalPriceINR = toINR(totalPrice, totalPriceCurrency, fxRates);
  const detailImages = detailHotel ? hotelImageUrls(detailHotel) : [];
  const detailMapPoint = detailHotel ? parseHotelMapPoint(detailHotel) : null;
  const detailDescription = detailHotel?.Description
    ? String(detailHotel.Description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const detailDescriptionParts = detailDescription
    ? detailDescription
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
  const detailFacilities = normalizeFacilities(detailHotel?.HotelFacilities);
  const detailHighlights = facilityHighlights(detailHotel?.HotelFacilities);
  const detailPricing = detailHotel ? hotelDisplayPrice(detailHotel, fxRates) : { amount: 0, currency: "INR", amountINR: 0 };
  const detailStarCount = Math.max(0, Math.min(5, Math.round(Number(detailHotel?.HotelRating || detailHotel?.StarRating || 0))));
  const isSuccessApiMsg = String(apiErr || "").startsWith("Live fare loaded. Mock booking mode is ON");

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="hp-wrap">

        {/* ── HEADER ── */}
        <header className="hp-hdr">
          <div className="hp-logo" aria-label="tbo.com">
            <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com" className="hp-logo-img" />
          </div>
          <div className="hp-hdr-right">
            <button className="hp-home-btn" onClick={() => navigate("/searchsection")}>Home</button>
          </div>
        </header>


        <ServiceNav />

        

        {/* ── CONTENT ── */}
        <div className="hp-content">

          {/* breadcrumb */}
          <div className="hp-bc">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="act" style={{cursor:"pointer"}} onClick={()=>setPage("home")}>Hotels</span>
            {page==="results"  && <><span className="hp-bc-sep">›</span><span className="act">Search Results</span></>}
            {page==="prebook"  && <><span className="hp-bc-sep">›</span><span style={{cursor:"pointer"}} onClick={()=>setPage("results")}>Results</span><span className="hp-bc-sep">›</span><span className="act">Select Rate</span></>}
            {page==="confirm"  && <><span className="hp-bc-sep">›</span><span className="act">Confirmation</span></>}
            {page==="detail"   && <><span className="hp-bc-sep">›</span><span style={{cursor:"pointer"}} onClick={()=>setPage("confirm")}>Confirmation</span><span className="hp-bc-sep">›</span><span className="act">Booking Detail</span></>}
          </div>

          {/* error banner */}
          {apiErr && (
            <div className={`hp-err ${isSuccessApiMsg ? "hp-ok" : ""}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isSuccessApiMsg ? "#166534" : "#c53030"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="hp-err-txt">{apiErr}</div>
              <button className="hp-err-x" onClick={()=>setApiErr("")}>✕</button>
            </div>
          )}

          {/* cancel success msg */}
          {cancelMsg && (
            <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:".82rem",color:"#14532d",fontWeight:600}}>
              {cancelMsg}
            </div>
          )}

          {/* ══════════════════════════════
              SEARCH FORM (shown on home + results)
              ══════════════════════════════ */}
          {(page==="home"||page==="results") && (
            <div className="hp-sbox hp-search-box" ref={boxRef}>
              {/* row 1 */}
              <div className="hp-srow1">

                {/* city with autocomplete */}
                <div className="hp-f city" style={{position:"relative"}} ref={cityDDRef}>
                  <div className="hp-lbl">City Name</div>
                  <div className="hp-fin">
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <input className="hp-finput"
                      placeholder={cityLoading?"Loading cities…":"Type city name…"}
                      value={cityQuery}
                      onChange={e=>{setCityQuery(e.target.value);setCityId("");setCityName("");setShowCityDD(true);}}
                      onFocus={()=>cityQuery.trim()&&filteredCities.length>0&&setShowCityDD(true)}
                      onKeyDown={e => {
                        if (e.key !== "Enter") return;
                        if (cityId) { doSearch(); return; }
                        // Try to auto-resolve the typed text using findBestCityMatch
                        const bestMatch = filteredCities.length === 1
                          ? filteredCities[0]
                          : findBestCityMatch(cityQuery, filteredCities.length > 0 ? filteredCities : allCities);
                        if (bestMatch) {
                          setCityId(bestMatch.CityId);
                          setCityName(bestMatch.CityName);
                          setCityQuery(bestMatch.CityName);
                          setShowCityDD(false);
                        }
                      }}
                    />
                    {cityId && <span className="hp-city-sel">✓ {cityName}</span>}
                  </div>
                  {showCityDD && cityQuery.trim() && (
                    <div className="hp-city-dd">
                      {filteredCities.length>0 ? filteredCities.map(c=>(
                        <div key={c.CityId} className="hp-city-item" onClick={()=>{
                          setCityId(c.CityId);
                          setCityName(c.CityName);
                          setCityQuery(c.CityName);
                          setShowCityDD(false);
                        }}>
                          <span className="name">{c.ShortName || c.CityName}</span>
                          <span className="code" style={{color:"#94a3b8",fontSize:"0.75rem"}}>
                            {c.ShortName ? c.CityName : `ID: ${c.CityId}`}
                          </span>
                        </div>
                      )) : (
                        <div className="hp-city-loading">
                          {cityLoading ? "Loading…" : "No cities found. Try a different spelling."}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* hotel codes - optional field for specific hotel search */}
                <div className="hp-f" style={{flex:1,minWidth:200}}>
                  <div className="hp-lbl">Hotel Codes (Optional)</div>
                  <div className="hp-fin">
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <input 
                      className="hp-finput"
                      placeholder="Enter hotel codes (comma separated)"
                      value={hotelCodes}
                      onChange={e=>setHotelCodes(e.target.value)}
                    />
                  </div>
                  {hotelCodes && <span className="hp-city-sel">🏨 {hotelCodes.split(',').length} hotel{hotelCodes.split(',').length>1?'s':''}</span>}
                </div>

                {/* check-in */}
                <div className="hp-f dt" style={{position:"relative"}}>
                  <div className="hp-lbl">Check-In</div>
                  <div className="hp-fin" onClick={()=>tog("ci")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <div className={`hp-fval${!checkIn?" ph":""}`}>{checkIn?fmtDisp(checkIn):"Select date"}</div>
                      {checkIn&&<div className="hp-fsub">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][checkIn.getDay()]}</div>}
                    </div>
                  </div>
                  {drop==="ci" && (
                    <div className="hp-drop hp-cal-drop">
                      <MiniCal
                        value={checkIn}
                        onChange={d=>{setCI(d);if(checkOut&&d>=checkOut)setCO(null);}}
                        onClose={()=>setDrop(null)}
                        faresByDate={hotelCalendarFareMap}
                        onViewChange={(monthDate)=>{ void loadCalendarFares(monthDate,{ silent:true }); }}
                        fallbackSeed={cityId || cityQuery || cityName}
                        roomCfg={roomCfg}
                      />
                    </div>
                  )}
                </div>

                {/* check-out */}
                <div className="hp-f dt" style={{position:"relative"}}>
                  <div className="hp-lbl">Check-Out</div>
                  <div className="hp-fin" onClick={()=>tog("co")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <div className={`hp-fval${!checkOut?" ph":""}`}>{checkOut?fmtDisp(checkOut):"Select date"}</div>
                      {checkIn&&checkOut&&<div className="hp-fsub">{nt} night{nt!==1?"s":""}</div>}
                    </div>
                  </div>
                  {drop==="co" && (
                    <div className="hp-drop hp-cal-drop">
                      <MiniCal
                        value={checkOut}
                        onChange={d=>{setCO(d);setDrop(null);}}
                        onClose={()=>setDrop(null)}
                        minDate={checkIn||new Date()}
                        faresByDate={hotelCalendarFareMap}
                        onViewChange={(monthDate)=>{ void loadCalendarFares(monthDate,{ silent:true }); }}
                        fallbackSeed={cityId || cityQuery || cityName}
                        roomCfg={roomCfg}
                      />
                    </div>
                  )}
                </div>

                {/* rooms */}
                <div className="hp-f rm" style={{position:"relative"}}>
                  <div className="hp-lbl">Rooms & Guests</div>
                  <div className="hp-fin" onClick={()=>tog("rm")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </span>
                    <div className="hp-fval">{roomLbl}</div>
                    <svg style={{marginLeft:"auto",flexShrink:0}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {drop==="rm" && (
                    <div className="hp-drop" style={{minWidth:255}}>
                      <div className="hp-rm-drop">
                        <div className="hp-rm-ttl">Rooms & Guests</div>
                        {[{k:"count",lbl:"Rooms",min:1,max:8},{k:"adults",lbl:"Adults",sub:"per room",min:1,max:6},{k:"children",lbl:"Children",sub:"per room",min:0,max:4}].map(g=>(
                          <div className="hp-rm-row" key={g.k}>
                            <div><div className="hp-rm-lbl">{g.lbl}</div>{g.sub&&<div className="hp-rm-sub">{g.sub}</div>}</div>
                            <div className="hp-ctr">
                              <button className="hp-ctr-btn" disabled={roomCfg[g.k]<=g.min} onClick={()=>setRC(r=>({...r,[g.k]:r[g.k]-1}))}>−</button>
                              <span className="hp-ctr-val">{roomCfg[g.k]}</span>
                              <button className="hp-ctr-btn" disabled={roomCfg[g.k]>=g.max} onClick={()=>setRC(r=>({...r,[g.k]:r[g.k]+1}))}>+</button>
                            </div>
                          </div>
                        ))}
                        <button className="hp-rm-apply" onClick={()=>setDrop(null)}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* search btn */}
                <button className="hp-sbtn" onClick={doSearch} disabled={loading}>
                  {loading
                    ? <><div className="hp-spin" style={{width:16,height:16,borderWidth:2}}/>Searching…</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Search</>}
                </button>
              </div>

              {/* row 2 – filters */}
              <div className={`hp-srow2-wrap${mobileFiltersOpen ? " open" : ""}`}>
                <button
                  type="button"
                  className="hp-filters-toggle"
                  onClick={()=>{
                    setMobileFiltersOpen(v=>!v);
                    if (mobileFiltersOpen) setDrop(null);
                  }}
                  aria-label={mobileFiltersOpen ? "Hide filters" : "Show filters"}
                >
                  <span style={{display:"flex",alignItems:"center",gap:8}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3"/>
                    </svg>
                    Filters
                  </span>
                  <span>{mobileFiltersOpen ? "Hide" : "Show"}</span>
                </button>
                <div className="hp-srow2">

                {/* destination country */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Destination Country</div>
                  <div className="hp-ffin" onClick={()=>tog("dcountry")}>
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <span className="hp-ffval">{DEST_COUNTRIES.find(c=>c.code===destCountry)?.label||destCountry}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="dcountry" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {DEST_COUNTRIES.map(c=>(
                          <div key={c.code} className={`hp-sitem${destCountry===c.code?" act":""}`} onClick={()=>{setDestCountry(c.code);setDrop(null);}}>
                            {destCountry===c.code&&<span>✓</span>}{c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* nationality */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Nationality</div>
                  <div className="hp-ffin" onClick={()=>tog("nat")}>
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <span className="hp-ffval">{natLbl}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="nat" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {NAT.map(n=>(
                          <div key={n.code} className={`hp-sitem${nat===n.code?" act":""}`} onClick={()=>{setNat(n.code);setDrop(null);}}>
                            {nat===n.code&&<span>✓</span>}{n.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* star rating */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Star Rating</div>
                  <div className="hp-ffin" onClick={()=>tog("star")}>
                    <span className="hp-ffic" style={{color:"#f59e0b"}}>
                      <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                    <span className="hp-ffval">{starLbl}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="star" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {STAR_OPTS.map(s=>(
                          <div key={s.label} className={`hp-sitem${JSON.stringify(starF)===JSON.stringify(s.val)?" act":""}`}
                            onClick={()=>{setStarF(s.val);setDrop(null);}}>
                            {s.val&&<span style={{color:"#f59e0b"}}>{"★".repeat(s.val[0])}</span>}
                            {s.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* budget */}
                <div className="hp-ff">
                  <div className="hp-lbl">Max Budget / Night</div>
                  <div className="hp-ffin">
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                    <input type="number" min="0" placeholder="e.g. 5000" value={budget} onChange={e=>setBudget(e.target.value)}/>
                  </div>
                </div>

                {/* senior comfort */}
                <div className="hp-ff senior" style={{position:"relative"}}>
                  <div className="hp-lbl">Senior Comfort</div>
                  <div className="hp-ffin" onClick={()=>tog("senior")}>
                    <span className="hp-ffic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>
                      </svg>
                    </span>
                    <span className="hp-ffval">
                      {!seniorAssist
                        ? "Off"
                        : `${[groundFloorPref,minimalWalkingPref,easyTransferPref].filter(Boolean).length} preference${[groundFloorPref,minimalWalkingPref,easyTransferPref].filter(Boolean).length!==1?"s":""} selected`}
                    </span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="senior" && (
                    <div className="hp-drop">
                      <div className="hp-senior-dd">
                        <div className="hp-senior-dd-title">Senior Comfort Preferences</div>
                        <div className="hp-senior-row">
                          <input
                            id="hp-senior-assist"
                            type="checkbox"
                            checked={seniorAssist}
                            onChange={(e)=>{
                              const v = e.target.checked;
                              setSeniorAssist(v);
                              if (!v) {
                                setGroundFloorPref(false);
                                setMinimalWalkingPref(false);
                                setEasyTransferPref(false);
                              }
                            }}
                          />
                          <label htmlFor="hp-senior-assist">Travelling with Senior Citizen</label>
                        </div>
                        <div className={`hp-senior-row sub${!seniorAssist ? " off" : ""}`}>
                          <input
                            id="hp-ground-floor"
                            type="checkbox"
                            disabled={!seniorAssist}
                            checked={groundFloorPref}
                            onChange={(e)=>setGroundFloorPref(e.target.checked)}
                          />
                          <label htmlFor="hp-ground-floor">Ground-floor preference</label>
                        </div>
                        <div className={`hp-senior-row sub${!seniorAssist ? " off" : ""}`}>
                          <input
                            id="hp-minimal-walking"
                            type="checkbox"
                            disabled={!seniorAssist}
                            checked={minimalWalkingPref}
                            onChange={(e)=>setMinimalWalkingPref(e.target.checked)}
                          />
                          <label htmlFor="hp-minimal-walking">Minimal walking distance</label>
                        </div>
                        <div className={`hp-senior-row sub${!seniorAssist ? " off" : ""}`}>
                          <input
                            id="hp-easy-transfer"
                            type="checkbox"
                            disabled={!seniorAssist}
                            checked={easyTransferPref}
                            onChange={(e)=>setEasyTransferPref(e.target.checked)}
                          />
                          <label htmlFor="hp-easy-transfer">Easy-transfer vehicle needed</label>
                        </div>
                        <button type="button" className="hp-senior-apply" onClick={()=>setDrop(null)}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                </div>
              </div>
            </div>
          )}


          {false && hotelCalendarFares.length > 0 && (
            <div className="hp-sbox" style={{padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
                <div style={{fontSize:".9rem",fontWeight:700,color:"#1e293b"}}>
                  14-Day Hotel Calendar Fare: {cityQuery || cityName}
                </div>
                <div style={{fontSize:".68rem",color:"#64748b"}}>
                  Green = cheaper, Yellow = medium, Red = expensive
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                {hotelCalendarFares.map((f) => {
                  const bg = f.level === "low" ? "#dcfce7" : f.level === "mid" ? "#fef9c3" : f.level === "high" ? "#fee2e2" : "#f8fafc";
                  const bd = f.level === "low" ? "#86efac" : f.level === "mid" ? "#fde047" : f.level === "high" ? "#fca5a5" : "#e2e8f0";
                  return (
                    <button
                      key={`${f.checkIn}-${f.checkOut}`}
                      type="button"
                      onClick={() => {
                        const inDate = new Date(f.checkIn);
                        const outDate = new Date(f.checkOut);
                        if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return;
                        setCI(inDate);
                        setCO(outDate);
                        setPage("results");
                        void doSearch({ checkInDate: inDate, checkOutDate: outDate });
                      }}
                      style={{textAlign:"left",background:bg,border:`1.5px solid ${bd}`,borderRadius:10,padding:"9px 10px",cursor:"pointer",fontFamily:"inherit"}}
                    >
                      <div style={{fontSize:".68rem",color:"#475569",fontWeight:600}}>{f.checkIn}</div>
                      <div style={{fontSize:".88rem",fontWeight:800,color:"#1e293b",marginTop:2}}>
                        {Number.isFinite(f.minFare) ? `Rs ${Math.round(f.minFare).toLocaleString("en-IN")}` : "N/A"}
                      </div>
                      {f.isLowest && <div style={{fontSize:".6rem",fontWeight:700,color:"#166534",marginTop:3}}>Lowest Fare</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* ══════════════════════════════
              LOADING
              ══════════════════════════════ */}
          {loading && (page!=="results" || sorted.length===0) && (
            <div className="hp-loader">
              <div className="hp-spin"/>
              <div className="hp-load-txt">
                {page==="results" && "Searching hotels across our global network…"}
                {page==="prebook" && "Fetching latest rate details & room options…"}
                {(page==="confirm"||page==="detail") && "Processing your request, please wait…"}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              RESULTS
              ══════════════════════════════ */}
          {page==="results" && (
            <div className="fade">
              {loading && sorted.length > 0 && (
                <div className="hp-load-txt" style={{marginBottom:10,textAlign:"left"}}>Refreshing hotels and prices...</div>
              )}
              <div className="hp-res-bar">
                <div className="hp-res-ct">
                  {sorted.length>0
                    ? <><span>{sorted.length}</span> hotel{sorted.length!==1?"s":""} found{checkIn&&checkOut?` · ${fmtDisp(checkIn)} → ${fmtDisp(checkOut)} · ${nt} night${nt!==1?"s":""}`:""}</>
                    : (loading ? "Searching hotels across our global network..." : "No hotels found for your search criteria")}
                </div>
                {hotels.length>0 && (
                  <div className="hp-sort-wrap">
                    <span className="hp-sort-lbl">Sort by:</span>
                    <select className="hp-sort-sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="rating_desc">Rating: High → Low</option>
                      <option value="name">Name A – Z</option>
                    </select>
                  </div>
                )}
              </div>
              {seniorAssist && (
                <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"8px 10px",marginBottom:10,fontSize:".72rem",color:"#1e3a8a",fontWeight:600}}>
                  Senior Comfort mode is ON: results are prioritized for lift access, wheelchair support and your selected comfort preferences.
                </div>
              )}

              {mappedHotels.length > 0 && (
                <div className="hp-sbox" style={{padding:"10px 12px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{fontSize:".78rem",fontWeight:700,color:"#334155"}}>Hotel Map View</div>
                    <button
                      type="button"
                      className="hp-btn-out"
                      style={{padding:"6px 10px",fontSize:".7rem"}}
                      onClick={() => setShowMap(v => !v)}
                    >
                      {showMap ? "Hide Map" : "Show Map"}
                    </button>
                  </div>
                  {showMap && (
                    <div style={{height:320,borderRadius:12,overflow:"hidden",border:"1px solid #dbeafe"}}>
                      <MapContainer
                        center={[mappedHotels[0].point.lat, mappedHotels[0].point.lng]}
                        zoom={12}
                        style={{height:"100%",width:"100%"}}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {mappedHotels.map(({ hotel, point }) => (
                          <Marker key={String(hotel.HotelCode || hotel.HotelName)} position={[point.lat, point.lng]}>
                            <Popup>
                              <div style={{maxWidth:220}}>
                                <div style={{fontWeight:700}}>{hotel.HotelName || "Hotel"}</div>
                                <div style={{fontSize:12,color:"#475569"}}>{hotel.HotelAddress || hotel.Address || "Address not available"}</div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  )}
                </div>
              )}

              {sorted.map((h,idx)=>{
                const pricing = hotelDisplayPrice(h, fxRates);
                const priceInr = pricing.amountINR;
                const img   = firstHotelImage(h);
                const ref   = h.IsRefundable ?? true;
                const stRaw = h.HotelRating  || h.StarRating || 0;
                const facilities = normalizeFacilities(h.HotelFacilities).slice(0,4);
                const highlights = facilityHighlights(h.HotelFacilities);
                const seniorMatch = seniorFacilityMatch(h);
                const hasCabFacility = highlights.includes("Cab Facility");
                const attractionPreview = Array.isArray(h.Attractions)
                  ? textPreview(h.Attractions[0], 95)
                  : textPreview(h.Attractions, 95);
                const descriptionPreview = textPreview(h.Description, 140);
                return (
                  <div key={h.HotelCode||idx} className="hp-hcard">
                    <div className="hp-hcard-inner">
                      {/* image */}
                      <div className="hp-himg" style={{cursor:"pointer"}} onClick={()=>openHotelDetails(h)}>
                        {img
                          ? <HotelImage hotel={h} alt={h.HotelName} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span>🏨</span>}
                      </div>
                      {/* body */}
                      <div className="hp-hbody">
                        <div className="hp-hname" style={{cursor:"pointer"}} onClick={()=>openHotelDetails(h)}>{h.HotelName||"Hotel"}</div>
                        {stRaw>0 && <div className="hp-hstars">{stars(stRaw)}</div>}
                        <div className="hp-haddr">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {h.HotelAddress||h.Address||"Address not provided"}
                        </div>
                        {descriptionPreview && (
                          <div style={{fontSize:".69rem",color:"#475569",lineHeight:1.45}}>
                            {descriptionPreview}
                          </div>
                        )}
                        {attractionPreview && (
                          <div style={{fontSize:".68rem",color:"#64748b"}}>
                            Nearby: {attractionPreview}
                          </div>
                        )}
                        {facilities.length>0 && (
                          <div className="hp-htags">
                            {facilities.map((f,i)=><span key={i} className="hp-htag">{f}</span>)}
                          </div>
                        )}
                        {highlights.length>0 && (
                          <div className="hp-htags">
                            {highlights.map((f,i)=><span key={i} className="hp-htag" style={f==="Cab Facility"?{background:"#f0fdf4",borderColor:"#86efac",color:"#166534"}:{background:"#ecfeff",borderColor:"#a5f3fc",color:"#0f766e"}}>{f}</span>)}
                          </div>
                        )}
                        {seniorAssist && seniorMatch.score > 0 && (
                          <div className="hp-htags">
                            <span className="hp-htag" style={{background:"#fff7ed",borderColor:"#fed7aa",color:"#b45309"}}>
                              Senior Match: {seniorMatch.score}/5
                            </span>
                            {seniorMatch.liftAccess && <span className="hp-htag" style={{background:"#f0f9ff",borderColor:"#bae6fd",color:"#0369a1"}}>Lift Access</span>}
                            {seniorMatch.wheelchairSupport && <span className="hp-htag" style={{background:"#ecfeff",borderColor:"#a5f3fc",color:"#0f766e"}}>Wheelchair Support</span>}
                          </div>
                        )}
                        {(h.PhoneNumber || h.FaxNumber || h.HotelWebsiteURL) && (
                          <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:".66rem",color:"#64748b"}}>
                            {h.PhoneNumber && <span>Phone: {h.PhoneNumber}</span>}
                            {h.FaxNumber && <span>Fax: {h.FaxNumber}</span>}
                            {h.HotelWebsiteURL && <a href={h.HotelWebsiteURL} target="_blank" rel="noreferrer" style={{color:"#0f5298",textDecoration:"none"}}>Hotel Site</a>}
                          </div>
                        )}
                        {h.Rooms?.length>0 && <div className="hp-havail">✓ {h.Rooms.length} room option{h.Rooms.length>1?"s":""} available</div>}
                      </div>
                      {/* price */}
                      <div className="hp-hprice">
                        <div>
                          <div className="hp-plbl">Starting from</div>
                          <div className="hp-pval">{priceInr>0?Math.round(priceInr).toLocaleString("en-IN"):"—"}</div>
                          <div className="hp-pcur">INR</div>
                          {pricing.amount > 0 && String(pricing.currency).toUpperCase() !== "INR" && (
                            <div style={{fontSize:".62rem",color:"#64748b"}}>
                              {pricing.currency} {Math.round(pricing.amount).toLocaleString("en-IN")}
                            </div>
                          )}
                          {nt>0&&priceInr>0&&<div className="hp-pper">≈ {Math.round(priceInr/nt).toLocaleString("en-IN")} / night</div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                          <span className={`hp-rbadge ${ref?"ref":"nref"}`}>{ref?"✓ Refundable":"Non-Refundable"}</span>
                          <button className="hp-detail-btn" style={{background:hasCabFacility?"#f0fdf4":"#f8fafc",border:`1px solid ${hasCabFacility?"#86efac":"#cbd5e1"}`,color:hasCabFacility?"#166534":"#334155",borderRadius:8,padding:"7px 10px",fontSize:".72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",width:"100%"}} onClick={()=>openCabForHotel(h)}>{hasCabFacility ? "Book Hotel Cab" : "Need Cab? Book Now"}</button>
                          <button className="hp-detail-btn" style={{background:"#eef6ff",border:"1px solid #bfdbfe",color:"#0f5298",borderRadius:8,padding:"7px 10px",fontSize:".72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",width:"100%"}} onClick={()=>openHotelDetails(h)}>View Details</button>
                          <button className="hp-selrm-btn" onClick={()=>doPrebook(h)}>Select Room →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

                    {detailHotel && (
            <div className="hp-modal-bg" onClick={()=>setDetailHotel(null)}>
              <div className="hp-modal" onClick={(e)=>e.stopPropagation()} style={{maxWidth:980}}>
                <div className="hp-mhdr">
                  <div>
                    <div className="hp-mttl">{detailHotel.HotelName || "Hotel Details"}</div>
                    <div className="hp-msub">{detailHotel.HotelAddress || detailHotel.Address || "Address not available"}</div>
                    <div className="hp-mmeta">
                      {detailStarCount > 0 && <span className="hp-mchip rating">{stars(detailStarCount)}</span>}
                      {detailImages.length > 0 && <span className="hp-mchip">{detailImages.length} photos</span>}
                      <span className={`hp-mchip ${detailMapPoint ? "ok" : "muted"}`}>{detailMapPoint ? "Map view available" : "Map not available"}</span>
                      {detailPricing.amountINR > 0 && <span className="hp-mchip price">From Rs {Math.round(detailPricing.amountINR).toLocaleString("en-IN")} / night</span>}
                    </div>
                  </div>
                  <button className="hp-mclose" onClick={()=>setDetailHotel(null)}>x</button>
                </div>
                <div className="hp-mbody hp-detail-grid">
                  <div className="hp-detail-left">
                    {detailLoading && <div className="hp-detail-loading">Loading more hotel photos...</div>}
                    <div
                      className="hp-detail-main-image"
                      style={{cursor: detailImages[detailImageIdx] ? "zoom-in" : "default"}}
                      onClick={() => {
                        const selected = detailImages[detailImageIdx];
                        if (selected) setFullscreenImageUrl(selected);
                      }}
                    >
                      <HotelImage
                        hotel={{...detailHotel, Images: detailImages.slice(detailImageIdx)}}
                        alt={detailHotel.HotelName}
                        style={{width:"100%",height:"100%",objectFit:"cover"}}
                      />
                    </div>
                    {detailImages.length > 1 && (
                      <div className="hp-detail-thumbs">
                        {detailImages.map((u, i) => (
                          <button
                            key={`${u}-${i}`}
                            type="button"
                            onClick={()=>{
                              setDetailImageIdx(i);
                              setFullscreenImageUrl(u);
                            }}
                            className={`hp-detail-thumb${i===detailImageIdx ? " active" : ""}`}
                          >
                            <img src={proxyImageUrl(u)} alt={`Hotel ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}
                    {detailDescription && (
                      <div className="hp-detail-section">
                        <div className="hp-detail-section-title">About This Hotel</div>
                        <div className="hp-detail-desc-list">
                          {(detailDescriptionParts.length > 1 ? detailDescriptionParts : [detailDescription]).map((part, idx) => (
                            <div key={`desc-${idx}`} className="hp-detail-desc">{part}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailFacilities.length > 0 && (
                      <div className="hp-detail-section">
                        <div className="hp-detail-section-title">Top Facilities</div>
                        <div className="hp-htags" style={{marginTop:0}}>
                          {detailFacilities.slice(0,12).map((f,i)=><span key={i} className="hp-htag">{f}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="hp-detail-right">
                    {detailPricing.amountINR > 0 && (
                      <div className="hp-detail-side-card">
                        <div className="hp-detail-side-label">Starting Price</div>
                        <div className="hp-detail-side-price">Rs {Math.round(detailPricing.amountINR).toLocaleString("en-IN")}</div>
                        <div className="hp-detail-side-sub">
                          {String(detailPricing.currency).toUpperCase() !== "INR" && detailPricing.amount > 0
                            ? `${detailPricing.currency} ${Math.round(detailPricing.amount).toLocaleString("en-IN")} available`
                            : "Per night indicative rate"}
                        </div>
                        {detailHighlights.length > 0 && (
                          <div className="hp-htags" style={{marginTop:10}}>
                            {detailHighlights.map((h, i) => (
                              <span key={`${h}-${i}`} className="hp-htag">{h}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {detailMapPoint ? (
                      <div className="hp-detail-map">
                        <MapContainer center={[detailMapPoint.lat, detailMapPoint.lng]} zoom={14} style={{height:"100%",width:"100%"}} scrollWheelZoom={false}>
                          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[detailMapPoint.lat, detailMapPoint.lng]}>
                            <Popup>{detailHotel.HotelName}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    ) : (
                      <div className="hp-detail-map-empty">Map location not available for this hotel.</div>
                    )}
                    <div className="hp-sumbox hp-detail-contact" style={{marginBottom:0}}>
                      <div className="hp-sumttl">Contact</div>
                      <div className="hp-sumrow"><span>Phone</span><span className="hp-sumval">{detailHotel.PhoneNumber || "N/A"}</span></div>
                      <div className="hp-sumrow"><span>Fax</span><span className="hp-sumval">{detailHotel.FaxNumber || "N/A"}</span></div>
                      <div className="hp-sumrow"><span>Website</span><span className="hp-sumval">{detailHotel.HotelWebsiteURL ? <a className="hp-link-clean" href={detailHotel.HotelWebsiteURL} target="_blank" rel="noreferrer">Visit Site</a> : "N/A"}</span></div>
                    </div>
                    <button className="hp-btn-pri" style={{justifyContent:"center"}} onClick={()=>{ const h = detailHotel; setDetailHotel(null); doPrebook(h); }}>
                      Select Room & Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              PRE-BOOK / RATE SELECT
              ══════════════════════════════ */}

          {fullscreenImageUrl && (
            <div className="hp-img-lightbox" onClick={()=>setFullscreenImageUrl("")}>
              <button
                type="button"
                className="hp-img-lightbox-close"
                onClick={()=>setFullscreenImageUrl("")}
                aria-label="Close image"
              >
                x
              </button>
              <div className="hp-img-lightbox-inner" onClick={(e)=>e.stopPropagation()}>
                <img src={proxyImageUrl(fullscreenImageUrl)} alt="Hotel full size" loading="eager" />
              </div>
            </div>
          )}
          {page==="prebook" && !loading && selHotel && (
            <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start"}}>

              {/* ─ LEFT COLUMN ─ */}
              <div>
                <button onClick={()=>setPage("results")} style={{marginBottom:13,background:"none",border:"none",color:"#0f5298",cursor:"pointer",fontWeight:600,fontSize:".8rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  ← Back to results
                </button>

                {/* hotel header card */}
                <div className="hp-sbox" style={{padding:"16px 18px",marginBottom:13}}>
                  <div style={{fontWeight:700,fontSize:"1rem",color:"#1e293b",marginBottom:3}}>{selHotel.HotelName}</div>
                  {selHotel.HotelRating>0&&<div style={{color:"#f59e0b",fontSize:".72rem",marginBottom:6}}>{stars(selHotel.HotelRating)}</div>}
                  <div style={{fontSize:".73rem",color:"#64748b"}}>
                    {fmtDisp(checkIn)} → {fmtDisp(checkOut)} &nbsp;·&nbsp; {nt} night{nt!==1?"s":""} &nbsp;·&nbsp; {roomLbl}
                  </div>
                </div>

                {/* rate list */}
                <div className="hp-sbox" style={{padding:"16px 18px",marginBottom:13}}>
                  <div style={{fontWeight:700,fontSize:".72rem",color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:11}}>Available Rates</div>
                  {rateList.length===0 && (
                    <div style={{fontSize:".82rem",color:"#64748b",padding:"10px 0"}}>No rate breakdown available from PreBook response. Proceeding with base rate.</div>
                  )}
                  {(rateList.length?rateList:[selHotel]).map((r,idx)=>(
                    <div key={idx} className={`hp-rcard${selRateIdx===idx?" sel":""}`} onClick={()=>setSelRateIdx(idx)}>
                      <div className="hp-rcard-top">
                        <div style={{flex:1}}>
                          <div className="hp-rname">{r.RoomTypeName||r.Name||"Standard Room"}</div>
                          <div className="hp-rtags">
                            {r.IsRefundable&&<span className="hp-rtag b">Refundable</span>}
                            {r.IsRefundable===false&&<span className="hp-rtag o">Non-Refundable</span>}
                            {r.MealType&&<span className="hp-rtag g">{r.MealType}</span>}
                            {toArray(r.Inclusion).map((inc,i)=><span key={i} className="hp-rtag g">{inc}</span>)}
                          </div>
                          {(r.CancellationPolicies?.length>0 || r.CancelPolicies?.length>0) && (
                            <div className="hp-rcancel">
                              Cancel policy: {typeof (r.CancellationPolicies?.[0] || r.CancelPolicies?.[0]) === "string"
                                ? (r.CancellationPolicies?.[0] || r.CancelPolicies?.[0])
                                : JSON.stringify(r.CancellationPolicies?.[0] || r.CancelPolicies?.[0])}
                            </div>
                          )}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div className="hp-rcur">{r.Price?.CurrencyCode||prebookRes?.HotelResult?.[0]?.Currency||selHotel?.Currency||"INR"}</div>
                          <div className="hp-rprice">{Math.round(roomTotal(r, selHotel)).toLocaleString()}</div>
                          <div style={{fontSize:".6rem",color:"#94a3b8"}}>total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* guest form */}
                <div className="hp-sbox" style={{padding:"16px 18px"}}>
                  <div className="hp-fsec-ttl">Primary Guest Details</div>
                  <div className="hp-fgrid">
                    <div className="hp-ffield">
                      <label className="hp-flbl">Title *</label>
                      <select className="hp-fsel" value={guest.title} onChange={e=>setGuest(g=>({...g,title:e.target.value}))}>
                        {["Mr","Mrs","Ms","Dr","Prof"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">First Name *</label>
                      <input className="hp-finp" placeholder="First name" value={guest.first} onChange={e=>setGuest(g=>({...g,first:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Last Name *</label>
                      <input className="hp-finp" placeholder="Last name" value={guest.last} onChange={e=>setGuest(g=>({...g,last:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Email *</label>
                      <input className="hp-finp" type="email" placeholder="email@example.com" value={guest.email} onChange={e=>setGuest(g=>({...g,email:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Phone *</label>
                      <input className="hp-finp" type="tel" placeholder="+91 9876543210" value={guest.phone} onChange={e=>setGuest(g=>({...g,phone:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Country</label>
                      <select className="hp-fsel" value={guest.country} onChange={e=>setGuest(g=>({...g,country:e.target.value}))}>
                        {NAT.map(n=><option key={n.code} value={n.code}>{n.label}</option>)}
                      </select>
                    </div>
                    <div className="hp-ffield" style={{gridColumn:"1/-1"}}>
                      <label className="hp-flbl">Address</label>
                      <input className="hp-finp" placeholder="Street address" value={guest.addr} onChange={e=>setGuest(g=>({...g,addr:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">City</label>
                      <input className="hp-finp" placeholder="City" value={guest.city2} onChange={e=>setGuest(g=>({...g,city2:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ RIGHT COLUMN – SUMMARY ─ */}
              <div style={{position:"sticky",top:18}}>
                <div className="hp-sbox" style={{padding:"16px 18px"}}>
                  <div className="hp-sumttl">Booking Summary</div>
                  <div className="hp-sumbox">
                    {[
                      ["Hotel",selHotel.HotelName],
                      ["Check-In",fmtDisp(checkIn)],
                      ["Check-Out",fmtDisp(checkOut)],
                      ["Nights",nt],
                      ["Rooms",roomCfg.count],
                      ["Adults",roomCfg.adults],
                      ["Rate",rateList[selRateIdx]?.RoomTypeName||"Standard"],
                    ].map(([k,v])=>(
                      <div className="hp-sumrow" key={k}>
                        <span>{k}</span>
                        <span className="hp-sumval">{v}</span>
                      </div>
                    ))}
                    <div className="hp-sumrow tot">
                      <span>Total</span>
                      <span style={{color:"#0f5298",fontSize:"1.05rem"}}>
                        {totalPrice > 0
                          ? (Number.isFinite(totalPriceINR) && totalPriceINR > 0
                              ? `INR ${Math.round(totalPriceINR).toLocaleString("en-IN")}`
                              : `${String(totalPriceCurrency || "INR").toUpperCase()} ${Math.round(totalPrice).toLocaleString("en-IN")}`)
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="hp-btn-pri"
                    style={{width:"100%",justifyContent:"center",fontSize:".88rem",padding:"11px 0"}}
                    onClick={doBook}
                    disabled={loading||!guest.first||!guest.last||!guest.email||!guest.phone}
                  >
                    {loading
                      ? <><div className="hp-spin" style={{width:15,height:15,borderWidth:2}}/>Booking…</>
                      : "✓ Confirm Booking"}
                  </button>
                  <div style={{fontSize:".62rem",color:"#94a3b8",textAlign:"center",marginTop:7}}>🔒 Secured booking via TBO</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              CONFIRMATION
              ══════════════════════════════ */}
          {page==="confirm" && bookingRef && (
            <div className="fade">
              <div className="hp-confirm">
                <div className="hp-ck-icon">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="hp-ck-ttl">Booking Confirmed! 🎉</div>
                <div className="hp-ck-sub">Your hotel reservation has been successfully placed via TBO.</div>
                <div className="hp-ref-box">
                  <div className="hp-ref-lbl">Booking Reference No.</div>
                  <div className="hp-ref-val">{bookingRef}</div>
                </div>

                <div className="hp-ck-grid">
                  {[
                    ["Hotel",selHotel?.HotelName],
                    ["Guest",`${guest.title} ${guest.first} ${guest.last}`],
                    ["Email",guest.email],
                    ["Phone",guest.phone],
                    ["Check-In",fmtDisp(checkIn)],
                    ["Check-Out",fmtDisp(checkOut)],
                    ["Duration",`${nt} night${nt!==1?"s":""}`],
                    ["Rooms",roomCfg.count],
                  ].map(([k,v])=>(
                    <div className="hp-ck-item" key={k}>
                      <div className="hp-ck-lbl">{k}</div>
                      <div className="hp-ck-val">{v||"—"}</div>
                    </div>
                  ))}
                </div>

                <div className="hp-ck-acts">
                  <button className="hp-btn-pri" onClick={doDetail} disabled={loading}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {loading?"Loading…":"View Booking Detail"}
                  </button>
                  <button className="hp-btn-out" onClick={()=>{setPage("home");setHotels([]);setSearchId("");clearCachedHotelResults();}}>
                    Search More Hotels
                  </button>
                  <button className="hp-btn-red" onClick={doCancel} disabled={loading}>
                    {loading?"Processing…":"Cancel Booking"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              BOOKING DETAIL
              ══════════════════════════════ */}
          {page==="detail" && (
            <div className="fade">
              <button onClick={()=>setPage("confirm")} style={{marginBottom:13,background:"none",border:"none",color:"#0f5298",cursor:"pointer",fontWeight:600,fontSize:".8rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                ← Back
              </button>
              <div className="hp-sbox" style={{padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
                  <div>
                    <div style={{fontSize:"1.02rem",fontWeight:700,color:"#1e293b"}}>Booking Details</div>
                    <div style={{fontSize:".73rem",color:"#64748b",marginTop:3}}>
                      Reference: <strong style={{color:"#0f5298"}}>{bookingRef}</strong>
                    </div>
                  </div>
                  <button className="hp-btn-red" onClick={doCancel} disabled={loading}>
                    {loading?"Processing…":"Cancel This Booking"}
                  </button>
                </div>

                {bookingDetail ? (
                  <table className="hp-dtbl">
                    <thead><tr><th style={{width:200}}>Field</th><th>Value</th></tr></thead>
                    <tbody>
                      {Object.entries(bookingDetail).map(([k,v])=>(
                        <tr key={k}>
                          <td style={{fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>{k}</td>
                          <td>{typeof v==="object"&&v!==null?JSON.stringify(v,null,2):String(v??"—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{textAlign:"center",padding:"28px 0",color:"#94a3b8",fontSize:".84rem"}}>
                    No detail data returned from API.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              HOME DASHBOARD STATS
              ══════════════════════════════ */}
          {page==="home" && (
            <div className="hp-stats fade">
              {[
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,cls:"bl",t:"Active Bookings",d:"Currently active reservations",n:"12"},
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,cls:"or",t:"Pending",d:"Awaiting client confirmation",n:"5",nc:"#e65100"},
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,cls:"gr",t:"Completed",d:"Successful bookings this month",n:"38",nc:"#2e7d32"},
              ].map(c=>(
                <div key={c.t} className="hp-stat">
                  <div className={`hp-stat-ic ${c.cls}`}>{c.ic}</div>
                  <div>
                    <div className="hp-stat-ttl">{c.t}</div>
                    <div className="hp-stat-desc">{c.d}</div>
                    <div className="hp-stat-n" style={c.nc?{color:c.nc}:{}}>{c.n}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>{/* end content */}
      </div>
    </>
  );
}





