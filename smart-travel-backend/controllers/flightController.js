const axios = require("axios");

const TBO_FLIGHT_BASE = process.env.TBO_FLIGHT_BASE || "https://Sharedapi.tektravels.com/SharedData.svc/rest";
const FLIGHT_API_BASE = process.env.TBO_FLIGHT_API_BASE || "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest";
const AUTH_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_AUTH_TIMEOUT_MS || 15000);
const SEARCH_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_SEARCH_TIMEOUT_MS || 120000);
const DEFAULT_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_TIMEOUT_MS || 30000);
const SEARCH_RETRIES = Math.max(0, Number(process.env.TBO_FLIGHT_SEARCH_RETRIES || 1));
const RETRY_DELAY_MS = Math.max(0, Number(process.env.TBO_FLIGHT_RETRY_DELAY_MS || 1500));

const TBO_CREDS = {
  UserName: process.env.TBO_FLIGHT_USER || process.env.TBO_USER || "Hackathon",
  Password: process.env.TBO_FLIGHT_PASS || process.env.TBO_PASS || "Hackathon@1234",
  ClientId: process.env.TBO_FLIGHT_CLIENT_ID || process.env.TBO_CLIENT_ID || "ApiIntegrationNew",
  EndUserIp: process.env.TBO_FLIGHT_END_USER_IP || process.env.TBO_END_USER_IP || "122.160.30.1",
};

const AIRPORT_MASTER = [
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi Intl", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl", country: "India" },
  { code: "BLR", city: "Bangalore", name: "Kempegowda Intl", country: "India" },
  { code: "MAA", city: "Chennai", name: "Chennai Intl", country: "India" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl", country: "India" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl", country: "India" },
  { code: "COK", city: "Kochi", name: "Cochin Intl", country: "India" },
  { code: "PNQ", city: "Pune", name: "Pune Airport", country: "India" },
  { code: "JAI", city: "Jaipur", name: "Jaipur Intl", country: "India" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel Intl", country: "India" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh Intl", country: "India" },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri Intl", country: "India" },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee Intl", country: "India" },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam Intl", country: "India" },
  { code: "IXL", city: "Leh", name: "Kushok Bakula Rimpochee Airport", country: "India" },
  { code: "KUU", city: "Kullu", name: "Kullu-Manali Airport", country: "India" },
  { code: "GOI", city: "Goa", name: "Dabolim Airport", country: "India" },
  { code: "GOX", city: "Goa", name: "Manohar Intl (Mopa)", country: "India" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE" },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK" },
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand" },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malaysia" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France" },
  { code: "DPS", city: "Bali", name: "Ngurah Rai Intl", country: "Indonesia" },
  { code: "NRT", city: "Tokyo", name: "Narita Intl", country: "Japan" },
  { code: "SYD", city: "Sydney", name: "Sydney Airport", country: "Australia" },
];

const AIRPORT_ALTERNATES = {
  GOI: ["GOX"],
  GOX: ["GOI"],
};

function getAlternateAirportCodes(code) {
  const normalized = String(code || "").toUpperCase();
  return AIRPORT_ALTERNATES[normalized] || [];
}

function isNoResultResponse(data) {
  const status = Number(data?.Response?.ResponseStatus ?? data?.Status ?? -1);
  const msg = String(data?.Response?.Error?.ErrorMessage || "").toLowerCase();
  return status === 2 || msg.includes("no result");
}

function hasFlightOptions(data) {
  return extractItineraries(data).length > 0;
}

function buildFallbackSearchPayloads(payload) {
  if (!Array.isArray(payload?.Segments) || payload.Segments.length !== 1) return [];

  const firstSeg = payload.Segments[0] || {};
  const origin = String(firstSeg.Origin || "").toUpperCase();
  const destination = String(firstSeg.Destination || "").toUpperCase();
  if (!origin || !destination) return [];

  const originAlts = getAlternateAirportCodes(origin);
  const destinationAlts = getAlternateAirportCodes(destination);
  const seen = new Set();
  const variants = [];

  const tryAdd = (o, d) => {
    const key = `${o}-${d}`;
    if (seen.has(key) || (o === origin && d === destination)) return;
    seen.add(key);
    variants.push({
      ...payload,
      Segments: [
        {
          ...firstSeg,
          Origin: o,
          Destination: d,
        },
      ],
    });
  };

  for (const dAlt of destinationAlts) tryAdd(origin, dAlt);
  for (const oAlt of originAlts) tryAdd(oAlt, destination);
  for (const oAlt of originAlts) {
    for (const dAlt of destinationAlts) {
      tryAdd(oAlt, dAlt);
    }
  }

  return variants;
}
// Cache token
let cachedToken = null;
let tokenExpiry = null;

function buildSearchPayload(body, token) {
  return {
    EndUserIp: TBO_CREDS.EndUserIp,
    TokenId: token,
    AdultCount: body.AdultCount || "1",
    ChildCount: body.ChildCount || "0",
    InfantCount: body.InfantCount || "0",
    DirectFlight: body.DirectFlight || "false",
    OneStopFlight: body.OneStopFlight || "false",
    JourneyType: body.JourneyType || "1",
    PreferredAirlines: body.PreferredAirlines || null,
    Segments: body.Segments,
    Sources: body.Sources || null,
  };
}

async function callFlightSearch(payload) {
  return postWithRetry(
    `${FLIGHT_API_BASE}/Search`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      timeout: SEARCH_TIMEOUT_MS,
    },
    SEARCH_RETRIES
  );
}

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMinFareFromResponse(data) {
  const raw = data?.Response?.Results ?? data?.Results ?? [];
  const outer = Array.isArray(raw) ? raw : [raw];
  const itineraries = outer.flatMap((item) => (Array.isArray(item) ? item : [item]));
  const fares = itineraries
    .map((r) => Number(r?.Fare?.PublishedFare ?? r?.Fare?.OfferedFare ?? r?.TotalFare))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (fares.length === 0) return null;
  return Math.min(...fares);
}

function extractItineraries(data) {
  const raw = data?.Response?.Results ?? data?.Results ?? [];
  const outer = Array.isArray(raw) ? raw : [raw];
  return outer.flatMap((item) => (Array.isArray(item) ? item : [item]));
}

function getCheapestItineraryDetail(data) {
  const itineraries = extractItineraries(data);
  if (itineraries.length === 0) return null;

  let best = null;
  for (const itinerary of itineraries) {
    const fare = Number(
      itinerary?.Fare?.PublishedFare ??
      itinerary?.Fare?.OfferedFare ??
      itinerary?.TotalFare
    );
    if (!Number.isFinite(fare) || fare <= 0) continue;
    if (!best || fare < best.fare) {
      const firstSegment = itinerary?.Segments?.[0]?.[0] || itinerary?.Segments?.[0] || {};
      best = {
        fare,
        airlineCode: firstSegment?.Airline?.AirlineCode || firstSegment?.AirlineCode || "",
        airlineName: firstSegment?.Airline?.AirlineName || "",
        stops: Math.max(0, Number(itinerary?.Segments?.[0]?.length || 1) - 1),
        durationMinutes: Number(itinerary?.Duration || firstSegment?.Duration || 0),
      };
    }
  }

  return best;
}

function extractFlightError(err, fallback) {
  if (err?.code === "ECONNABORTED" || String(err?.message || "").toLowerCase().includes("timeout")) {
    return `Flight provider timeout after ${SEARCH_TIMEOUT_MS}ms. Please retry.`;
  }
  return (
    err?.response?.data?.Response?.Error?.ErrorMessage ||
    err?.response?.data?.Response?.Error?.Error?.ErrorMessage ||
    err?.response?.data?.Error?.ErrorMessage ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

function isRetriableNetworkError(err) {
  const code = String(err?.code || "").toUpperCase();
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return true;
  if (code === "ECONNABORTED" || code === "ETIMEDOUT" || code === "ECONNRESET") return true;
  return String(err?.message || "").toLowerCase().includes("timeout");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postWithRetry(url, payload, config, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.post(url, payload, config);
    } catch (err) {
      lastErr = err;
      if (!isRetriableNetworkError(err) || attempt === retries) {
        throw err;
      }
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastErr;
}

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;

  const res = await axios.post(`${TBO_FLIGHT_BASE}/Authenticate`, TBO_CREDS, {
    headers: { "Content-Type": "application/json" },
    timeout: AUTH_TIMEOUT_MS,
  });

  const data = res.data;
  const statusCode = data?.Status?.Code ?? data?.Status;
  if (statusCode !== undefined && statusCode !== null && statusCode !== 1 && statusCode !== "1") {
    throw new Error(
      data?.Status?.Description ||
      data?.Error?.ErrorMessage ||
      data?.error ||
      "Authentication failed"
    );
  }

  cachedToken = data?.Member?.TokenId ?? data?.TokenId ?? null;
  if (!cachedToken) {
    throw new Error(
      data?.Status?.Description ||
      data?.Error?.ErrorMessage ||
      data?.error ||
      "Authentication failed: token not returned"
    );
  }
  tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
  return cachedToken;
}

exports.authenticate = async (req, res) => {
  try {
    const token = await getToken();
    res.json({ TokenId: token, success: true });
  } catch (err) {
    const msg = extractFlightError(err, "Authentication failed");
    console.error("Flight auth error:", msg);
    res.status(500).json({ error: msg });
  }
};

exports.airports = async (_req, res) => {
  res.json({ airports: AIRPORT_MASTER });
};

exports.searchFlights = async (req, res) => {
  try {
    if (!Array.isArray(req.body?.Segments) || req.body.Segments.length === 0) {
      return res.status(400).json({ error: "Flight search requires at least one segment." });
    }

    const token = await getToken();
    const payload = buildSearchPayload(req.body, token);
    const response = await callFlightSearch(payload);
    let bestData = response.data;

    if (!hasFlightOptions(bestData) && isNoResultResponse(bestData)) {
      const fallbackPayloads = buildFallbackSearchPayloads(payload);

      for (const fallbackPayload of fallbackPayloads) {
        try {
          const fallbackResponse = await callFlightSearch(fallbackPayload);
          const fallbackData = fallbackResponse.data;
          if (!hasFlightOptions(fallbackData)) continue;

          bestData = {
            ...fallbackData,
            SearchFallback: {
              applied: true,
              originalSegments: payload.Segments,
              usedSegments: fallbackPayload.Segments,
            },
          };
          break;
        } catch {
          // Ignore fallback leg failures and keep trying alternates.
        }
      }
    }

    res.json(bestData);
  } catch (err) {
    const msg = extractFlightError(err, "Flight search failed");
    console.error("Flight search error:", msg);
    res.status(502).json({ error: msg });
  }
};
exports.calendarFares = async (req, res) => {
  try {
    const {
      Origin,
      Destination,
      StartDate,
      Days = 14,
      FlexDays = 0,
      EndDate,
      IncludeRoundTrip = false,
      IncludeMonthView = true,
      FlightCabinClass = "1",
      AdultCount = "1",
      ChildCount = "0",
      InfantCount = "0",
      JourneyType = "1",
      DirectFlight = "false",
      OneStopFlight = "false",
      PreferredAirlines = null,
      Sources = null,
    } = req.body || {};

    if (!Origin || !Destination || !StartDate) {
      return res.status(400).json({ error: "calendar-fares requires Origin, Destination and StartDate." });
    }

    const baseDate = new Date(StartDate);
    if (Number.isNaN(baseDate.getTime())) {
      return res.status(400).json({ error: "StartDate must be a valid date (YYYY-MM-DD)." });
    }

    const returnDate = EndDate ? new Date(EndDate) : null;
    if (returnDate && Number.isNaN(returnDate.getTime())) {
      return res.status(400).json({ error: "EndDate must be a valid date (YYYY-MM-DD)." });
    }

    const totalDays = Math.max(1, Math.min(31, Number(Days) || 14));
    const flexDays = Math.max(0, Math.min(14, Number(FlexDays) || 0));
    const includeRoundTrip = String(IncludeRoundTrip) === "true" || IncludeRoundTrip === true;
    const token = await getToken();
    const calendar = [];
    const searchedDates = [];

    for (let i = -flexDays; i < totalDays + flexDays; i += 1) {
      const dt = new Date(baseDate);
      dt.setDate(baseDate.getDate() + i);
      searchedDates.push(formatYMD(dt));
    }

    const uniqDates = [...new Set(searchedDates)];

    for (const dateStr of uniqDates) {
      let roundTripMinFare = null;
      let roundTripDetail = null;

      const searchBody = {
        AdultCount,
        ChildCount,
        InfantCount,
        DirectFlight,
        OneStopFlight,
        JourneyType,
        PreferredAirlines,
        Sources,
        Segments: [
          {
            Origin,
            Destination,
            FlightCabinClass,
            PreferredDepartureTime: `${dateStr}T00:00:00`,
            PreferredArrivalTime: `${dateStr}T00:00:00`,
          },
        ],
      };

      try {
        const payload = buildSearchPayload(searchBody, token);
        const response = await callFlightSearch(payload);
        const detail = getCheapestItineraryDetail(response.data);
        const minFare = detail?.fare ?? null;

        if (includeRoundTrip && returnDate) {
          const returnDateStr = formatYMD(returnDate);
          const returnSearchBody = {
            AdultCount,
            ChildCount,
            InfantCount,
            DirectFlight,
            OneStopFlight,
            JourneyType: "2",
            PreferredAirlines,
            Sources,
            Segments: [
              {
                Origin,
                Destination,
                FlightCabinClass,
                PreferredDepartureTime: `${dateStr}T00:00:00`,
                PreferredArrivalTime: `${dateStr}T00:00:00`,
              },
              {
                Origin: Destination,
                Destination: Origin,
                FlightCabinClass,
                PreferredDepartureTime: `${returnDateStr}T00:00:00`,
                PreferredArrivalTime: `${returnDateStr}T00:00:00`,
              },
            ],
          };
          try {
            const roundTripPayload = buildSearchPayload(returnSearchBody, token);
            const roundTripResponse = await callFlightSearch(roundTripPayload);
            roundTripDetail = getCheapestItineraryDetail(roundTripResponse.data);
            roundTripMinFare = roundTripDetail?.fare ?? null;
          } catch {
            roundTripMinFare = null;
            roundTripDetail = null;
          }
        }

        calendar.push({
          date: dateStr,
          minFare,
          currency: "INR",
          detail: detail
            ? {
              airlineCode: detail.airlineCode,
              airlineName: detail.airlineName,
              stops: detail.stops,
              durationMinutes: detail.durationMinutes,
            }
            : null,
          roundTrip: roundTripDetail
            ? {
              fare: roundTripMinFare,
              airlineCode: roundTripDetail.airlineCode,
              airlineName: roundTripDetail.airlineName,
              stops: roundTripDetail.stops,
              durationMinutes: roundTripDetail.durationMinutes,
              returnDate: formatYMD(returnDate),
            }
            : null,
        });
      } catch (err) {
        calendar.push({ date: dateStr, minFare: null, currency: "INR", error: extractFlightError(err, "No fare") });
      }
    }

    const valid = calendar.filter((d) => Number.isFinite(d.minFare));
    const lowestFare = valid.length ? Math.min(...valid.map((d) => d.minFare)) : null;
    const lowestRoundTripFare = includeRoundTrip
      ? (() => {
        const rValid = calendar.filter((d) => Number.isFinite(d?.roundTrip?.fare));
        if (rValid.length === 0) return null;
        return Math.min(...rValid.map((d) => d.roundTrip.fare));
      })()
      : null;

    const monthBuckets = {};
    if (IncludeMonthView !== false && IncludeMonthView !== "false") {
      for (const item of calendar) {
        if (!Number.isFinite(item.minFare)) continue;
        const monthKey = String(item.date).slice(0, 7);
        if (!monthBuckets[monthKey] || item.minFare < monthBuckets[monthKey].lowestFare) {
          monthBuckets[monthKey] = {
            month: monthKey,
            lowestFare: item.minFare,
            date: item.date,
          };
        }
      }
    }

    res.json({
      success: true,
      origin: Origin,
      destination: Destination,
      startDate: formatYMD(baseDate),
      endDate: returnDate ? formatYMD(returnDate) : null,
      days: totalDays,
      flexDays,
      lowestFare,
      lowestRoundTripFare,
      fares: calendar.map((d) => ({
        ...d,
        isLowest: lowestFare !== null && d.minFare === lowestFare,
        isLowestRoundTrip: includeRoundTrip && lowestRoundTripFare !== null && d?.roundTrip?.fare === lowestRoundTripFare,
        level: !Number.isFinite(d.minFare)
          ? "na"
          : d.minFare <= lowestFare * 1.15
            ? "low"
            : d.minFare <= lowestFare * 1.35
              ? "mid"
              : "high",
      })),
      cheapestMonthView: Object.values(monthBuckets),
    });
  } catch (err) {
    const msg = extractFlightError(err, "Calendar fare search failed");
    res.status(502).json({ error: msg });
  }
};

exports.fareQuote = async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${FLIGHT_API_BASE}/FareQuote`,
      { EndUserIp: TBO_CREDS.EndUserIp, TokenId: token, ...req.body },
      { headers: { "Content-Type": "application/json" }, timeout: DEFAULT_TIMEOUT_MS }
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: extractFlightError(err, "FareQuote failed") });
  }
};

exports.fareRule = async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${FLIGHT_API_BASE}/FareRule`,
      { EndUserIp: TBO_CREDS.EndUserIp, TokenId: token, ...req.body },
      { headers: { "Content-Type": "application/json" }, timeout: DEFAULT_TIMEOUT_MS }
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: extractFlightError(err, "FareRule failed") });
  }
};

exports.ssrAvailability = async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${FLIGHT_API_BASE}/SSRAvailability`,
      { EndUserIp: TBO_CREDS.EndUserIp, TokenId: token, ...req.body },
      { headers: { "Content-Type": "application/json" }, timeout: DEFAULT_TIMEOUT_MS }
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: extractFlightError(err, "SSRAvailability failed") });
  }
};

exports.bookFlight = async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${FLIGHT_API_BASE}/Book`,
      { EndUserIp: TBO_CREDS.EndUserIp, TokenId: token, ...req.body },
      { headers: { "Content-Type": "application/json" }, timeout: DEFAULT_TIMEOUT_MS }
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: extractFlightError(err, "Book failed") });
  }
};

