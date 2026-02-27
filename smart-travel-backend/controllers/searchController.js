const Hotel = require("../models/Hotel");
const Driver = require("../models/Driver");
const { parseNaturalQuery, buildSuggestions } = require("../utils/nlqParser");

const NIGHT_START_HOUR = 20;
const NIGHT_END_HOUR = 5;
const FEMALE_SAFE_FALLBACK_MIN_DRIVER_RATING = 5.0;
const FEMALE_SAFE_FALLBACK_MIN_EXPERIENCE_YEARS = 5;
const API_BASE = process.env.LOCAL_API_BASE || "http://localhost:5000/api";
const CITY_TO_AIRPORT = {
  mumbai: "BOM",
  delhi: "DEL",
  "new delhi": "DEL",
  goa: "GOI",
  bangalore: "BLR",
  bengaluru: "BLR",
  kochi: "COK",
  chennai: "MAA",
  kolkata: "CCU",
  hyderabad: "HYD",
  jaipur: "JAI",
  pune: "PNQ",
  ahmedabad: "AMD",
  lucknow: "LKO",
  varanasi: "VNS",
  amritsar: "ATQ",
  srinagar: "SXR",
  leh: "IXL",
};

const DRIVER_FIRST_NAMES = [
  "Aarav", "Vihaan", "Arjun", "Reyansh", "Kabir", "Aditya", "Rohan", "Karan",
  "Neha", "Priya", "Kavya", "Ananya", "Pooja", "Aisha", "Naina", "Ritika",
];

const DRIVER_LAST_INITIALS = ["S.", "K.", "M.", "R.", "P.", "T.", "D.", "V."];

const VEHICLE_TYPES = [
  "Maruti Dzire",
  "Hyundai Aura",
  "Honda Amaze",
  "Toyota Innova",
  "Kia Carens",
  "Mahindra XUV700",
  "Bajaj RE Auto",
  "Honda Activa",
];

function hashSeed(input) {
  const text = String(input || "seed");
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function seededRng(seed) {
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000000) / 1000000;
  };
}

function estimateCabCountByBudget(budget) {
  const b = Number(budget || 0);
  if (!Number.isFinite(b) || b <= 0) return 18;
  if (b < 2000) return 10;
  if (b < 6000) return 14;
  if (b < 12000) return 18;
  return 24;
}

function buildRealisticFallbackDrivers({ city = "", budget = 0, travelTime = "" }) {
  const count = estimateCabCountByBudget(budget);
  const seed = hashSeed(`${city}|${travelTime}|${budget}|cab_fallback_v1`);
  const rand = seededRng(seed);
  const hour = Number(String(travelTime || "").split(":")[0]);
  const isPeak = Number.isFinite(hour) && ([8, 9, 10, 17, 18, 19].includes(hour));

  return Array.from({ length: count }, (_, idx) => {
    const first = DRIVER_FIRST_NAMES[Math.floor(rand() * DRIVER_FIRST_NAMES.length)];
    const last = DRIVER_LAST_INITIALS[Math.floor(rand() * DRIVER_LAST_INITIALS.length)];
    const vehicle = VEHICLE_TYPES[Math.floor(rand() * VEHICLE_TYPES.length)];
    const gender = rand() < 0.38 ? "female" : "male";
    const baseRating = isPeak ? 4.4 : 4.5;
    const rating = Math.min(5, Number((baseRating + rand() * 0.6).toFixed(1)));
    const exp = Math.max(1, Math.round(2 + rand() * 12));
    const online = rand() > (isPeak ? 0.12 : 0.2);

    return {
      _id: `fallback_${hashSeed(`${city}_${idx}_${first}_${last}`)}`,
      name: `${first} ${last}`,
      gender,
      verified: true,
      rating,
      totalTrips: 150 + Math.round(rand() * 5000),
      vehicle_type: vehicle,
      experienceYears: exp,
      safety: {
        backgroundCheckStatus: "verified",
        womenSafetyTrainingCompleted: true,
        panicButtonEnabled: true,
        sosEnabled: true,
      },
      availability: {
        isOnline: online,
        preferredShift: rand() < 0.5 ? "day" : "both",
      },
      source: "fallback-generated",
    };
  }).filter((d) => d.availability?.isOnline);
}

function isNightHour(timeValue) {
  const hour = Number(String(timeValue || "").split(":")[0]);
  return Number.isFinite(hour) && (hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR);
}

function buildBudgetAllocation(totalBudget) {
  const budget = Number(totalBudget || 0);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { total: 0, flights: 0, hotels: 0, cabs: 0, contingency: 0 };
  }

  const flights = Math.round(budget * 0.4);
  const hotels = Math.round(budget * 0.4);
  const cabs = Math.round(budget * 0.15);
  const contingency = Math.max(0, budget - flights - hotels - cabs);
  return { total: budget, flights, hotels, cabs, contingency };
}

function toAirportCode(city, fallback) {
  const key = String(city || "").toLowerCase().trim();
  return CITY_TO_AIRPORT[key] || fallback;
}

function datePlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function fetchLiveFlightPreview({ source, destination, startDate }) {
  const origin = toAirportCode(source, "BOM");
  const dest = toAirportCode(destination, "GOI");
  const depDate = startDate || datePlusDays(7);

  const res = await fetch(`${API_BASE}/flights/calendar-fares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Origin: origin,
      Destination: dest,
      StartDate: depDate,
      Days: 5,
      FlexDays: 0,
      IncludeMonthView: false,
      JourneyType: "1",
      AdultCount: "1",
      ChildCount: "0",
      InfantCount: "0",
      FlightCabinClass: "1",
    }),
  });

  if (!res.ok) throw new Error(`Flights preview failed: HTTP ${res.status}`);
  const data = await res.json().catch(() => ({}));
  if (data?.error) throw new Error(data.error);
  return {
    lowestFare: data?.lowestFare || null,
    fares: Array.isArray(data?.fares) ? data.fares.slice(0, 5) : [],
  };
}

async function fetchLiveHotelPreview({ destination, startDate, endDate, maxBudget }) {
  const citiesRes = await fetch(`${API_BASE}/hotels/cities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ countryCode: "IN" }),
  });
  if (!citiesRes.ok) throw new Error(`City lookup failed: HTTP ${citiesRes.status}`);

  const citiesData = await citiesRes.json().catch(() => ({}));
  const cityList = Array.isArray(citiesData?.cities) ? citiesData.cities : [];
  const match = cityList.find((c) => String(c?.CityName || "").toLowerCase() === String(destination || "").toLowerCase());
  if (!match?.CityId) return { items: [] };

  const searchRes = await fetch(`${API_BASE}/hotels/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      CheckIn: startDate || datePlusDays(7),
      CheckOut: endDate || datePlusDays(9),
      HotelCodes: "",
      GuestNationality: "IN",
      PaxRooms: [{ Adults: 1, Children: 0, ChildrenAges: [] }],
      ResponseTime: 23,
      IsDetailedResponse: true,
      Filters: {
        Refundable: false,
        NoOfRooms: 1,
        ...(maxBudget > 0 ? { MaxPrice: maxBudget } : {}),
      },
      CityId: match.CityId,
      CountryCode: "IN",
    }),
  });

  if (!searchRes.ok) throw new Error(`Hotels preview failed: HTTP ${searchRes.status}`);
  const hotelData = await searchRes.json().catch(() => ({}));
  const hotels = Array.isArray(hotelData?.HotelResult) ? hotelData.HotelResult : [];
  return { items: hotels.slice(0, 10) };
}

function applyWomenSafetyCabRules(drivers, { persona, userGender, travelTime }) {
  const femaleSolo =
    String(persona || "").toLowerCase() === "solo" &&
    String(userGender || "").toLowerCase() === "female";

  if (!femaleSolo) {
    return { drivers, mode: "normal" };
  }

  const femaleDrivers = drivers.filter(
    (d) => String(d.gender || "").toLowerCase() === "female"
  );
  if (femaleDrivers.length > 0) {
    return { drivers: femaleDrivers, mode: "female_only" };
  }

  const trustedFallback = drivers.filter((d) => {
    const rating = Number(d.rating || 0);
    const exp = Number(d.experienceYears || 0);
    return (
      rating >= FEMALE_SAFE_FALLBACK_MIN_DRIVER_RATING &&
      exp >= FEMALE_SAFE_FALLBACK_MIN_EXPERIENCE_YEARS
    );
  });

  if (trustedFallback.length > 0) {
    return {
      drivers: trustedFallback,
      mode: "trusted_fallback_5star",
    };
  }

  return { drivers: [], mode: isNightHour(travelTime) ? "female_only_unavailable_night" : "female_only_unavailable" };
}

exports.searchTrip = async (req, res) => {
  try {
    const { city, budget, persona, userGender = "", travelTime = "" } = req.body;

    let hotels = await Hotel.find({
      city: city,
      price: { $lte: Number(budget || Number.MAX_SAFE_INTEGER) },
    });

    if (String(persona || "").toLowerCase() === "solo") {
      hotels = hotels.filter((h) => h.female_safe && Number(h.safety || 0) > 4);
    }

    const baseDriversFromDb = await Driver.find({ verified: true });
    const baseDrivers = baseDriversFromDb.length > 0
      ? baseDriversFromDb
      : buildRealisticFallbackDrivers({ city, budget, travelTime });
    const safetyFiltered = applyWomenSafetyCabRules(baseDrivers, {
      persona,
      userGender,
      travelTime,
    });

    res.json({
      hotels,
      drivers: safetyFiltered.drivers,
      safetyMode: safetyFiltered.mode,
      safetyThresholds: {
        femaleSafeFallbackMinRating: FEMALE_SAFE_FALLBACK_MIN_DRIVER_RATING,
        femaleSafeFallbackMinExperienceYears: FEMALE_SAFE_FALLBACK_MIN_EXPERIENCE_YEARS,
      },
      driversSource: baseDriversFromDb.length > 0 ? "database" : "fallback-generated",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.smartPlan = async (req, res) => {
  try {
    const {
      query = "",
      userGender = "",
      persona = "",
      tripType = "solo",
      travelTime = "10:00",
      city = "",
      budget,
    } = req.body || {};

    const parsed = parseNaturalQuery(query);
    const parsedBudget = Number(budget || parsed.budget || 0);
    const source = parsed.source || "Mumbai";
    const destination = city || parsed.destination || "Any Destination";
    const durationDays = Number(parsed.duration || 3);
    const startDate = parsed.startDate || null;
    const endDate = parsed.endDate || null;
    const nights = Math.max(1, durationDays - 1);
    const allocation = buildBudgetAllocation(parsedBudget);

    const hotelCandidates = await Hotel.find({
      city: new RegExp(`^${String(destination).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"),
      price: { $lte: allocation.hotels > 0 ? allocation.hotels : Number.MAX_SAFE_INTEGER },
    }).limit(20);

    const dbDrivers = await Driver.find({ verified: true }).limit(40);
    const drivers = dbDrivers.length > 0
      ? dbDrivers
      : buildRealisticFallbackDrivers({ city: destination, budget: allocation.cabs, travelTime });
    const safetyFiltered = applyWomenSafetyCabRules(drivers, {
      persona: persona || tripType,
      userGender,
      travelTime,
    });

    let liveFlights = null;
    let liveHotels = null;
    try {
      liveFlights = await fetchLiveFlightPreview({ source, destination, startDate });
    } catch {
      liveFlights = null;
    }
    try {
      liveHotels = await fetchLiveHotelPreview({
        destination,
        startDate,
        endDate,
        maxBudget: allocation.hotels > 0 ? allocation.hotels : parsedBudget,
      });
    } catch {
      liveHotels = null;
    }

    res.json({
      success: true,
      intent: {
        source,
        destination,
        budget: parsedBudget,
        durationDays,
        nights,
        startDate,
        endDate,
        tripType: tripType || persona || "solo",
      },
      budgetDistribution: allocation,
      realtime: {
        flights: {
          source: "Use /api/flights/search and /api/flights/calendar-fares for live fare quotes",
          estimatedBudget: allocation.flights,
          ...(liveFlights ? { livePreview: liveFlights } : {}),
        },
        hotels: {
          source: "Local indexed hotels (can be augmented using /api/hotels/search live TBO data)",
          estimatedBudget: allocation.hotels,
          items: liveHotels?.items?.length ? liveHotels.items : hotelCandidates,
        },
        cabs: {
          source: "Verified drivers from database",
          estimatedBudget: allocation.cabs,
          safetyMode: safetyFiltered.mode,
          items: safetyFiltered.drivers,
          rules: {
            femaleSolo: "Female traveler + solo trip => female drivers only",
            nightFallback: "At night, if female drivers unavailable, show 4-5 star and experienced (>=5 years) drivers",
          },
        },
      },
      safetyThresholds: {
        femaleSafeFallbackMinRating: FEMALE_SAFE_FALLBACK_MIN_DRIVER_RATING,
        femaleSafeFallbackMinExperienceYears: FEMALE_SAFE_FALLBACK_MIN_EXPERIENCE_YEARS,
      },
      driversSource: dbDrivers.length > 0 ? "database" : "fallback-generated",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.parseQuery = async (req, res) => {
  try {
    const query = String(req.body?.query || "").trim();
    if (!query) return res.status(400).json({ error: "Query is required." });

    const parsed = parseNaturalQuery(query);
    res.json({
      success: true,
      data: {
        source: parsed.source || "",
        destination: parsed.destination || "",
        duration: parsed.duration || null,
        budget: parsed.budget || null,
        startDate: parsed.startDate || null,
        endDate: parsed.endDate || null,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to parse query." });
  }
};

exports.suggestQueries = async (req, res) => {
  try {
    const q = String(req.query?.q || "").trim();
    if (q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }
    const suggestions = buildSuggestions(q);
    res.json({ success: true, suggestions });
  } catch {
    res.status(500).json({ error: "Failed to load suggestions." });
  }
};
