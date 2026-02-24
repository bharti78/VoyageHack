const Hotel = require("../models/Hotel");
const Driver = require("../models/Driver");
const { parseNaturalQuery, buildSuggestions } = require("../utils/nlqParser");

const NIGHT_START_HOUR = 20;
const NIGHT_END_HOUR = 5;
const FEMALE_NIGHT_MIN_DRIVER_RATING = 4.0;
const FEMALE_NIGHT_MAX_DRIVER_RATING = 5.0;
const FEMALE_NIGHT_MIN_EXPERIENCE_YEARS = 5;
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

  if (isNightHour(travelTime)) {
    const trustedFallback = drivers.filter((d) => {
      const rating = Number(d.rating || 0);
      const exp = Number(d.experienceYears || 0);
      return (
        rating >= FEMALE_NIGHT_MIN_DRIVER_RATING &&
        rating <= FEMALE_NIGHT_MAX_DRIVER_RATING &&
        exp >= FEMALE_NIGHT_MIN_EXPERIENCE_YEARS
      );
    });

    return {
      drivers: trustedFallback,
      mode: "night_trusted_fallback",
    };
  }

  return { drivers, mode: "fallback_no_female" };
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

    const baseDrivers = await Driver.find({ verified: true });
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
        femaleNightMinRating: FEMALE_NIGHT_MIN_DRIVER_RATING,
        femaleNightMaxRating: FEMALE_NIGHT_MAX_DRIVER_RATING,
        femaleNightMinExperienceYears: FEMALE_NIGHT_MIN_EXPERIENCE_YEARS,
      },
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

    const drivers = await Driver.find({ verified: true }).limit(40);
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
        femaleNightMinRating: FEMALE_NIGHT_MIN_DRIVER_RATING,
        femaleNightMaxRating: FEMALE_NIGHT_MAX_DRIVER_RATING,
        femaleNightMinExperienceYears: FEMALE_NIGHT_MIN_EXPERIENCE_YEARS,
      },
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
