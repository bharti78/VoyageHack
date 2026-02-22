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
    const payload = {
      EndUserIp: TBO_CREDS.EndUserIp,
      TokenId: token,
      AdultCount: req.body.AdultCount || "1",
      ChildCount: req.body.ChildCount || "0",
      InfantCount: req.body.InfantCount || "0",
      DirectFlight: req.body.DirectFlight || "false",
      OneStopFlight: req.body.OneStopFlight || "false",
      JourneyType: req.body.JourneyType || "1",
      PreferredAirlines: req.body.PreferredAirlines || null,
      Segments: req.body.Segments,
      Sources: req.body.Sources || null,
    };

    const response = await axios.post(
      `${FLIGHT_API_BASE}/Search`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: SEARCH_TIMEOUT_MS,
      }
    );
    res.json(response.data);
  } catch (err) {
    const msg = extractFlightError(err, "Flight search failed");
    console.error("Flight search error:", msg);
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
