const axios = require("axios");

const TBO_FLIGHT_BASE = process.env.TBO_FLIGHT_BASE || "https://Sharedapi.tektravels.com/SharedData.svc/rest";
const FLIGHT_API_BASE = process.env.TBO_FLIGHT_API_BASE || "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest";
const AUTH_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_AUTH_TIMEOUT_MS || 15000);
const SEARCH_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_SEARCH_TIMEOUT_MS || 65000);
const DEFAULT_TIMEOUT_MS = Number(process.env.TBO_FLIGHT_TIMEOUT_MS || 30000);

const TBO_CREDS = {
  UserName: process.env.TBO_FLIGHT_USER || "Hackathon",
  Password: process.env.TBO_FLIGHT_PASS || "Hackathon@1234",
  ClientId: process.env.TBO_FLIGHT_CLIENT_ID || "ApiIntegrationNew",
  EndUserIp: process.env.TBO_FLIGHT_END_USER_IP || "122.160.30.1",
};

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
  return axios.post(
    `${FLIGHT_API_BASE}/Search`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      timeout: SEARCH_TIMEOUT_MS,
    }
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

function extractFlightError(err, fallback) {
  return (
    err?.response?.data?.Response?.Error?.ErrorMessage ||
    err?.response?.data?.Response?.Error?.Error?.ErrorMessage ||
    err?.response?.data?.Error?.ErrorMessage ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

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

exports.searchFlights = async (req, res) => {
  try {
    if (!Array.isArray(req.body?.Segments) || req.body.Segments.length === 0) {
      return res.status(400).json({ error: "Flight search requires at least one segment." });
    }

    const token = await getToken();
    const payload = buildSearchPayload(req.body, token);
    const response = await callFlightSearch(payload);
    res.json(response.data);
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

    const totalDays = Math.max(1, Math.min(31, Number(Days) || 14));
    const token = await getToken();
    const calendar = [];

    for (let i = 0; i < totalDays; i += 1) {
      const dt = new Date(baseDate);
      dt.setDate(baseDate.getDate() + i);
      const dateStr = formatYMD(dt);

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
        const minFare = getMinFareFromResponse(response.data);
        calendar.push({ date: dateStr, minFare, currency: "INR" });
      } catch (err) {
        calendar.push({ date: dateStr, minFare: null, currency: "INR", error: extractFlightError(err, "No fare") });
      }
    }

    const valid = calendar.filter((d) => Number.isFinite(d.minFare));
    const lowestFare = valid.length ? Math.min(...valid.map((d) => d.minFare)) : null;

    res.json({
      success: true,
      origin: Origin,
      destination: Destination,
      startDate: formatYMD(baseDate),
      days: totalDays,
      lowestFare,
      fares: calendar.map((d) => ({
        ...d,
        isLowest: lowestFare !== null && d.minFare === lowestFare,
        level: !Number.isFinite(d.minFare)
          ? "na"
          : d.minFare <= lowestFare * 1.15
            ? "low"
            : d.minFare <= lowestFare * 1.35
              ? "mid"
              : "high",
      })),
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
