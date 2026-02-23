/**
 * unifiedSearchController.js
 * Parses a natural-language travel query, fetches live TekTravels flight data,
 * and returns structured results for flights, hotels, cabs and car rentals.
 */
const axios = require("axios");

// ─── TekTravels / TBO config ────────────────────────────────────────────────
const TBO_FLIGHT_BASE =
  process.env.TBO_FLIGHT_BASE ||
  "https://Sharedapi.tektravels.com/SharedData.svc/rest";
const FLIGHT_API_BASE =
  process.env.TBO_FLIGHT_API_BASE ||
  "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest";
const AUTH_TIMEOUT_MS = 15000;
const SEARCH_TIMEOUT_MS = 120000;

const TBO_CREDS = {
  UserName: process.env.TBO_FLIGHT_USER || "Hackathon",
  Password: process.env.TBO_FLIGHT_PASS || "Hackathon@1234",
  ClientId: process.env.TBO_FLIGHT_CLIENT_ID || "ApiIntegrationNew",
  EndUserIp: process.env.TBO_FLIGHT_END_USER_IP || "122.160.30.1",
};

// Token cache
let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;
  const res = await axios.post(`${TBO_FLIGHT_BASE}/Authenticate`, TBO_CREDS, {
    headers: { "Content-Type": "application/json" },
    timeout: AUTH_TIMEOUT_MS,
  });
  const data = res.data;
  if (data?.Status?.Code && data.Status.Code !== 1 && data.Status.Code !== "1") {
    throw new Error(data.Status.Description || "Authentication failed");
  }
  cachedToken = data.Member?.TokenId ?? data.TokenId;
  tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 min
  return cachedToken;
}

// ─── City → Airport code map ─────────────────────────────────────────────────
const CITY_TO_CODE = {
  "mumbai": "BOM", "delhi": "DEL", "new delhi": "DEL", "goa": "GOI",
  "bangalore": "BLR", "bengaluru": "BLR", "chennai": "MAA",
  "kolkata": "CCU", "hyderabad": "HYD", "kochi": "COK", "cochin": "COK",
  "pune": "PNQ", "jaipur": "JAI", "ahmedabad": "AMD", "lucknow": "LKO",
  "varanasi": "VNS", "amritsar": "ATQ", "srinagar": "SXR",
  "manali": "KUU", "leh": "IXL", "dubai": "DXB", "london": "LHR",
  "singapore": "SIN", "bangkok": "BKK", "paris": "CDG", "new york": "JFK",
  "bali": "DPS", "tokyo": "NRT", "sydney": "SYD",
};

const CODE_TO_CITY = Object.fromEntries(
  Object.entries(CITY_TO_CODE).map(([city, code]) => [code, city.replace(/\b\w/g, c => c.toUpperCase())])
);

function cityToCode(city) {
  if (!city) return null;
  return CITY_TO_CODE[String(city).toLowerCase().trim()] || null;
}

// ─── NLP Query Parser ─────────────────────────────────────────────────────────
function parseQuery(query) {
  if (!query) return {};
  const text = String(query).toLowerCase().trim();

  // Source city
  let source = "";
  const fromMatch = text.match(/\bfrom\s+([a-z ]{2,30}?)(?=\s+(?:to|for|under|below|budget|in|on|with|,)|\b|$)/i);
  if (fromMatch) source = fromMatch[1].trim();

  // Destination city
  let destination = "";
  const toMatch = text.match(/\bto\s+([a-z ]{2,30}?)(?=\s+(?:for|under|below|budget|in|on|from|with|,)|\b|$)/i);
  if (toMatch) destination = toMatch[1].trim();
  if (!destination) {
    const inMatch = text.match(/\bin\s+([a-z ]{2,30}?)(?=\s+(?:for|under|below|budget|,)|\b|$)/i);
    if (inMatch) destination = inMatch[1].trim();
  }

  // Duration
  let durationDays = null;
  const dayMatch = text.match(/(\d+)\s*(?:day|days)\b/);
  if (dayMatch) durationDays = Number(dayMatch[1]);
  const nightMatch = text.match(/(\d+)\s*(?:night|nights)\b/);
  if (nightMatch && !durationDays) durationDays = Number(nightMatch[1]) + 1;

  // Budget
  let budget = null;
  const kMatch = text.match(/(?:under|below|within|budget\s*[:=]?)?\s*(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) budget = Math.round(Number(kMatch[1]) * 1000);
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lac|lakh)\b/);
  if (lakhMatch) budget = Math.round(Number(lakhMatch[1]) * 100000);
  if (!budget) {
    const plainMatch = text.match(/(?:under|below|within|budget)\s*(?:rs\.?|inr)?\s*(\d{3,8})\b/);
    if (plainMatch) budget = Number(plainMatch[1]);
  }

  // Adults
  let adults = 1;
  const adultMatch = text.match(/(\d+)\s*(?:adult|adults|person|people|travell?er)/);
  if (adultMatch) adults = Math.max(1, Number(adultMatch[1]));

  // Dates
  let startDate = null;
  const dateMatch = text.match(/on\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
  if (dateMatch) {
    try { startDate = new Date(dateMatch[1]).toISOString(); } catch { /**/ }
  }

  // Default start = 7 days from now
  if (!startDate) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    startDate = d.toISOString();
  }

  // End date from duration
  let endDate = null;
  if (durationDays) {
    const ed = new Date(startDate);
    ed.setDate(ed.getDate() + Math.max(1, durationDays - 1));
    endDate = ed.toISOString();
  } else {
    const ed = new Date(startDate);
    ed.setDate(ed.getDate() + 3);
    endDate = ed.toISOString();
  }

  return { source, destination, durationDays, budget, adults, startDate, endDate };
}

// ─── Flight Search ────────────────────────────────────────────────────────────
function formatYMD(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function extractFlights(data) {
  try {
    const raw = data?.Response?.Results ?? data?.Results ?? [];
    const outer = Array.isArray(raw) ? raw : [raw];
    return outer.flatMap(item => (Array.isArray(item) ? item : [item]))
      .filter(item => item && typeof item === "object" && (item.Segments || item.Fare))
      .slice(0, 50);
  } catch { return []; }
}

function getFlightInfo(r) {
  const seg = r?.Segments?.[0]?.[0] ?? r?.Segments?.[0] ?? {};
  return {
    origin: seg.Origin?.Airport?.AirportCode ?? r?.Origin ?? "—",
    destination: seg.Destination?.Airport?.AirportCode ?? r?.Destination ?? "—",
    departureTime: seg.Origin?.DepTime ?? "",
    arrivalTime: seg.Destination?.ArrTime ?? "",
    airlineCode: seg.Airline?.AirlineCode ?? r?.AirlineCode ?? "",
    airlineName: seg.Airline?.AirlineName ?? "",
    flightNumber: seg.Airline?.FlightNumber ?? "",
    stops: Math.max(0, (r?.Segments?.[0]?.length ?? 1) - 1),
    duration: seg.Duration ?? r?.Duration ?? 0,
    fare: r?.Fare?.PublishedFare ?? r?.Fare?.OfferedFare ?? r?.TotalFare ?? 0,
    baseFare: r?.Fare?.BaseFare ?? 0,
    tax: r?.Fare?.Tax ?? 0,
    cabinClass: seg.CabinBaggage ?? seg.Baggage ?? "Economy",
    raw: r,
  };
}

async function searchFlights({ fromCode, toCode, depDate, retDate, adults, children, infants, tripType }) {
  const token = await getToken();
  const segments = [
    {
      Origin: fromCode,
      Destination: toCode,
      FlightCabinClass: "1",
      PreferredDepartureTime: `${formatYMD(depDate)}T00:00:00`,
      PreferredArrivalTime: `${formatYMD(depDate)}T00:00:00`,
    },
  ];
  if (tripType === "roundtrip" && retDate) {
    segments.push({
      Origin: toCode,
      Destination: fromCode,
      FlightCabinClass: "1",
      PreferredDepartureTime: `${formatYMD(retDate)}T00:00:00`,
      PreferredArrivalTime: `${formatYMD(retDate)}T00:00:00`,
    });
  }
  const payload = {
    EndUserIp: TBO_CREDS.EndUserIp,
    TokenId: token,
    AdultCount: String(adults || 1),
    ChildCount: String(children || 0),
    InfantCount: String(infants || 0),
    DirectFlight: "false",
    OneStopFlight: "false",
    JourneyType: tripType === "roundtrip" ? "2" : "1",
    PreferredAirlines: null,
    Segments: segments,
    Sources: null,
  };
  const res = await axios.post(`${FLIGHT_API_BASE}/Search`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: SEARCH_TIMEOUT_MS,
  });
  return extractFlights(res.data).map(r => ({ type: "flight", ...getFlightInfo(r) }));
}

// ─── Mock generators for hotels, cabs, car rentals ───────────────────────────
function generateHotels(destination, budget, nights) {
  const budgetPerNight = budget ? Math.round((budget * 0.4) / Math.max(1, nights)) : 8000;
  const HOTELS = [
    { name: "Grand Palace Hotel", stars: 5, amenities: ["Pool", "Spa", "WiFi", "Gym"], basePrice: 9500 },
    { name: "Comfort Inn Suites", stars: 4, amenities: ["WiFi", "Gym", "Breakfast"], basePrice: 4500 },
    { name: "City Center Stay", stars: 3, amenities: ["WiFi", "Parking", "AC"], basePrice: 2200 },
    { name: "Ocean Breeze Resort", stars: 5, amenities: ["Beach", "Pool", "Spa", "WiFi"], basePrice: 12000 },
    { name: "Budget Bliss Hostel", stars: 2, amenities: ["WiFi", "Common Area"], basePrice: 900 },
    { name: "Heritage Grand", stars: 4, amenities: ["WiFi", "Restaurant", "Gym"], basePrice: 6500 },
    { name: "Travellers Inn", stars: 3, amenities: ["WiFi", "AC", "TV"], basePrice: 1800 },
    { name: "Luxury Towers", stars: 5, amenities: ["Concierge", "Pool", "Fine Dining"], basePrice: 18000 },
  ];
  return HOTELS.map((h, i) => {
    const pricePerNight = Math.round(h.basePrice * (0.8 + Math.random() * 0.4));
    const totalPrice = pricePerNight * Math.max(1, nights);
    const withinBudget = !budget || totalPrice <= budget * 0.4;
    return {
      id: `hotel-${i}-${Date.now()}`,
      type: "hotel",
      name: h.name,
      stars: h.stars,
      location: destination,
      amenities: h.amenities,
      pricePerNight,
      totalPrice,
      nights: Math.max(1, nights),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      reviewCount: 100 + Math.floor(Math.random() * 900),
      withinBudget,
      image: `https://source.unsplash.com/400x250/?hotel,${h.stars}star,${i}`,
    };
  }).sort((a, b) => a.pricePerNight - b.pricePerNight);
}

function generateCabs(destination, budget) {
  const CAB_TYPES = [
    { id: "sedan", name: "Sedan", icon: "🚗", seats: 4, pricePerKm: 13, minFare: 200, baseKm: 15 },
    { id: "suv", name: "SUV", icon: "🚙", seats: 6, pricePerKm: 18, minFare: 350, baseKm: 15 },
    { id: "auto", name: "Auto Rickshaw", icon: "🛺", seats: 3, pricePerKm: 8, minFare: 50, baseKm: 10 },
    { id: "prime", name: "Prime Sedan", icon: "🚘", seats: 4, pricePerKm: 22, minFare: 300, baseKm: 15 },
  ];
  return CAB_TYPES.map((c, i) => ({
    id: `cab-${c.id}-${i}`,
    type: "cab",
    cabType: c.name,
    icon: c.icon,
    seats: c.seats,
    fare: Math.max(c.minFare, Math.round(c.pricePerKm * c.baseKm)),
    city: destination,
    provider: ["Ola", "Uber", "Rapido"][i % 3],
    eta: `${3 + Math.floor(Math.random() * 10)} min`,
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    features: ["Live Tracking", "All Payments", "AC"],
  }));
}

function generateCarRentals(destination, startDate, endDate, budget) {
  const days = Math.max(1, Math.round(
    (new Date(endDate) - new Date(startDate)) / 86400000
  ));
  const CARS = [
    { id: "swift", name: "Maruti Swift", category: "Hatchback", seats: 5, pricePerDay: 1200, icon: "🚗", fuel: "Petrol" },
    { id: "innova", name: "Toyota Innova", category: "SUV", seats: 7, pricePerDay: 2500, icon: "🚙", fuel: "Diesel" },
    { id: "fortuner", name: "Toyota Fortuner", category: "Premium SUV", seats: 7, pricePerDay: 4500, icon: "🚘", fuel: "Diesel" },
    { id: "dzire", name: "Maruti Dzire", category: "Sedan", seats: 5, pricePerDay: 1500, icon: "🚗", fuel: "Petrol/CNG" },
    { id: "creta", name: "Hyundai Creta", category: "Compact SUV", seats: 5, pricePerDay: 2200, icon: "🚘", fuel: "Petrol" },
  ];
  return CARS.map((c, i) => ({
    id: `car-${c.id}-${i}`,
    type: "carrental",
    name: c.name,
    category: c.category,
    seats: c.seats,
    icon: c.icon,
    fuel: c.fuel,
    pricePerDay: c.pricePerDay,
    totalPrice: c.pricePerDay * days,
    days,
    city: destination,
    company: ["Zoomcar", "Drivezy", "Revv", "Myles"][i % 4],
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    features: ["GPS", "Insurance", "24x7 Support"],
  }));
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
exports.unifiedSearch = async (req, res) => {
  try {
    const {
      query = "",
      fromCity = "",
      toCity = "",
      startDate: rawStart,
      endDate: rawEnd,
      adults: rawAdults,
      children: rawChildren,
      infants: rawInfants,
      budget: rawBudget,
      persona = "",
      userGender = "",
    } = req.body || {};

    // Parse natural-language query
    const parsed = parseQuery(query);

    // Merge parsed intent with explicit fields (explicit fields win)
    const destination = toCity || parsed.destination || "Goa";
    const source = fromCity || parsed.source || "Mumbai";
    const budget = Number(rawBudget || parsed.budget || 0);
    const durationDays = parsed.durationDays || 3;
    const adults = Number(rawAdults || parsed.adults || 1);
    const children = Number(rawChildren || 0);
    const infants = Number(rawInfants || 0);
    const startDate = rawStart || parsed.startDate;
    const endDate = rawEnd || parsed.endDate;

    // Resolve IATA codes
    const fromCode = cityToCode(source);
    const toCode = cityToCode(destination);

    // Budget allocation
    const allocation = budget > 0 ? {
      total: budget,
      flights: Math.round(budget * 0.35),
      hotels: Math.round(budget * 0.40),
      cabs: Math.round(budget * 0.15),
      contingency: Math.round(budget * 0.10),
    } : { total: 0, flights: 0, hotels: 0, cabs: 0, contingency: 0 };

    const nights = Math.max(1, durationDays - 1);

    // Fetch flights in parallel with other data
    const [flightResults, hotels, cabs, carRentals] = await Promise.allSettled([
      // Flights: try live TekTravels, fall back to mock on error
      (async () => {
        if (fromCode && toCode) {
          try {
            return await searchFlights({
              fromCode,
              toCode,
              depDate: startDate,
              retDate: endDate,
              adults,
              children,
              infants,
              tripType: "oneway",
            });
          } catch (err) {
            console.error("TekTravels flight search failed:", err.message);
            // Return mock flights on API failure
            return generateMockFlights(source, destination, startDate, adults, budget);
          }
        }
        return generateMockFlights(source, destination, startDate, adults, budget);
      })(),
      // Hotels
      Promise.resolve(generateHotels(destination, budget, nights)),
      // Cabs
      Promise.resolve(generateCabs(destination, budget)),
      // Car rentals
      Promise.resolve(generateCarRentals(destination, startDate, endDate, budget)),
    ]);

    const flights = flightResults.status === "fulfilled" ? flightResults.value : [];
    const hotelList = hotels.status === "fulfilled" ? hotels.value : [];
    const cabList = cabs.status === "fulfilled" ? cabs.value : [];
    const carList = carRentals.status === "fulfilled" ? carRentals.value : [];

    res.json({
      success: true,
      intent: {
        source,
        destination,
        fromCode: fromCode || "N/A",
        toCode: toCode || "N/A",
        budget,
        durationDays,
        nights,
        adults,
        children,
        infants,
        startDate,
        endDate,
        query,
      },
      budgetDistribution: allocation,
      results: {
        flights: { items: flights, count: flights.length, live: !!(fromCode && toCode) },
        hotels: { items: hotelList, count: hotelList.length },
        cabs: { items: cabList, count: cabList.length },
        carRentals: { items: carList, count: carList.length },
      },
    });
  } catch (err) {
    console.error("Unified search error:", err.message);
    res.status(500).json({ error: err.message || "Unified search failed" });
  }
};

// Fallback mock flights when API is unavailable
function generateMockFlights(source, destination, depDate, adults, budget) {
  const AIRLINES = [
    { code: "6E", name: "IndiGo" },
    { code: "AI", name: "Air India" },
    { code: "UK", name: "Vistara" },
    { code: "SG", name: "SpiceJet" },
    { code: "QP", name: "Akasa Air" },
  ];
  const baseFares = [3200, 4500, 5100, 2800, 6500];
  return AIRLINES.map((airline, i) => {
    const depH = 5 + i * 3;
    const depTime = new Date(depDate);
    depTime.setHours(depH, 0, 0, 0);
    const arrTime = new Date(depTime);
    arrTime.setMinutes(arrTime.getMinutes() + 90 + i * 20);
    const fare = baseFares[i] * Math.max(1, adults);
    return {
      id: `mock-flight-${i}`,
      type: "flight",
      origin: cityToCode(source) || "DEL",
      destination: cityToCode(destination) || "GOI",
      airlineCode: airline.code,
      airlineName: airline.name,
      flightNumber: `${airline.code}${300 + i * 11}`,
      departureTime: depTime.toISOString(),
      arrivalTime: arrTime.toISOString(),
      stops: i === 2 ? 1 : 0,
      duration: 90 + i * 20,
      fare,
      baseFare: Math.round(fare * 0.72),
      tax: Math.round(fare * 0.28),
      cabinClass: "Economy",
      isMock: true,
    };
  });
}
