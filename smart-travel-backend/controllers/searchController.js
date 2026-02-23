const Hotel = require("../models/Hotel");
const Driver = require("../models/Driver");

const NIGHT_START_HOUR = 20;
const NIGHT_END_HOUR = 5;
const FEMALE_NIGHT_MIN_DRIVER_RATING = 4.0;
const FEMALE_NIGHT_MAX_DRIVER_RATING = 5.0;
const FEMALE_NIGHT_MIN_EXPERIENCE_YEARS = 5;

function isNightHour(timeValue) {
  const hour = Number(String(timeValue || "").split(":")[0]);
  return Number.isFinite(hour) && (hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR);
}

function parseBudget(query) {
  if (!query) return null;
  const text = String(query).toLowerCase();

  const kMatch = text.match(/(?:under|below|around|at|budget\s*[:=]?)?\s*(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) return Math.round(Number(kMatch[1]) * 1000);

  const lacMatch = text.match(/(?:under|below|around|at|budget\s*[:=]?)?\s*(\d+(?:\.\d+)?)\s*(?:lac|lakh)\b/);
  if (lacMatch) return Math.round(Number(lacMatch[1]) * 100000);

  const raw = text.match(/(?:under|below|around|at|budget\s*[:=]?)\s*(\d{3,8})\b/);
  if (raw) return Number(raw[1]);

  return null;
}

function parseDestination(query) {
  if (!query) return "";
  const text = String(query).replace(/\s+/g, " ").trim();
  const toMatch = text.match(/\bto\s+([a-zA-Z ]{2,40}?)(?=\s+(?:for|under|below|budget|in|on|from|with)\b|[,.!?]|$)/i);
  if (toMatch) return toMatch[1].trim();

  const inMatch = text.match(/\bin\s+([a-zA-Z ]{2,40})/i);
  if (inMatch) return inMatch[1].trim();

  return "";
}

function parseSource(query) {
  if (!query) return "";
  const text = String(query).replace(/\s+/g, " ").trim();
  const fromMatch = text.match(/\bfrom\s+([a-zA-Z ]{2,40}?)(?=\s+(?:to|for|under|below|budget|in|on|with)\b|[,.!?]|$)/i);
  if (!fromMatch) return "";
  return fromMatch[1].trim();
}

function parseDurationDays(query) {
  if (!query) return null;
  const text = String(query).toLowerCase();
  const dayMatch = text.match(/(\d+)\s*(?:day|days)\b/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isFinite(days) && days > 0 ? days : null;
  }
  const nightMatch = text.match(/(\d+)\s*(?:night|nights)\b/);
  if (nightMatch) {
    const nights = Number(nightMatch[1]);
    return Number.isFinite(nights) && nights > 0 ? nights + 1 : null;
  }
  return null;
}

function parseNights(query) {
  if (!query) return null;
  const text = String(query).toLowerCase();
  const m = text.match(/(\d+)\s*(?:day|days|night|nights)/);
  if (!m) return null;
  const days = Number(m[1]);
  if (!Number.isFinite(days) || days <= 0) return null;
  return Math.max(1, days - 1);
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

    const parsedBudget = Number(budget || parseBudget(query) || 0);
    const source = parseSource(query) || "Mumbai";
    const destination = city || parseDestination(query) || "Any Destination";
    const durationDays = parseDurationDays(query) || 3;
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

    res.json({
      success: true,
      intent: {
        source,
        destination,
        budget: parsedBudget,
        durationDays,
        nights,
        tripType: tripType || persona || "solo",
      },
      budgetDistribution: allocation,
      realtime: {
        flights: {
          source: "Use /api/flights/search and /api/flights/calendar-fares for live fare quotes",
          estimatedBudget: allocation.flights,
        },
        hotels: {
          source: "Local indexed hotels (can be augmented using /api/hotels/search live TBO data)",
          estimatedBudget: allocation.hotels,
          items: hotelCandidates,
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
