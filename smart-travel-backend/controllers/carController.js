const axios = require("axios");

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
const AMADEUS_TIMEOUT_MS = Number(process.env.AMADEUS_TIMEOUT_MS || 20000);

const CITY_TO_IATA = {
  delhi: "DEL",
  "new delhi": "DEL",
  mumbai: "BOM",
  bombay: "BOM",
  jaipur: "JAI",
  goa: "GOI",
  bangalore: "BLR",
  bengaluru: "BLR",
  chennai: "MAA",
  kolkata: "CCU",
  hyderabad: "HYD",
  pune: "PNQ",
  chandigarh: "IXC",
};

let tokenCache = {
  accessToken: "",
  expiresAt: 0,
};

function toYmd(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function addDaysYmd(baseDate, n) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + n);
  return toYmd(d);
}

function extractCityFromText(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const lowered = raw
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (CITY_TO_IATA[lowered]) return lowered;

  const patterns = [
    /\btrip to\s+([a-z\s]+)$/,
    /\bcars in\s+([a-z\s]+)$/,
    /\bcar rental in\s+([a-z\s]+)$/,
    /\brent(?:\s+a)?\s+car in\s+([a-z\s]+)$/,
    /\bto\s+([a-z\s]+)$/,
    /\bin\s+([a-z\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = lowered.match(pattern);
    if (!match?.[1]) continue;
    const candidate = match[1].trim();
    if (CITY_TO_IATA[candidate]) return candidate;
    const embedded = Object.keys(CITY_TO_IATA).find((cityKey) => candidate.includes(cityKey));
    if (embedded) return embedded;
    return candidate;
  }

  return Object.keys(CITY_TO_IATA).find((cityKey) => lowered.includes(cityKey)) || lowered;
}

function resolveIata(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  if (/^[a-z]{3}$/i.test(raw)) return raw.toUpperCase();
  const city = extractCityFromText(raw);
  return CITY_TO_IATA[String(city || "").toLowerCase()] || "";
}

async function getAmadeusToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 30 * 1000) {
    return tokenCache.accessToken;
  }

  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;
  if (!key || !secret) {
    throw new Error("Missing Amadeus credentials in backend .env");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", key);
  body.set("client_secret", secret);

  const response = await axios.post(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    body.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: AMADEUS_TIMEOUT_MS,
    }
  );

  const accessToken = response?.data?.access_token;
  const expiresIn = Number(response?.data?.expires_in || 1799);
  if (!accessToken) throw new Error("Amadeus token response missing access token");

  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };
  return accessToken;
}

async function carSearch(req, res) {
  const requestId = `car_${Date.now().toString(36)}`;
  const {
    destination = "",
    pickupLocationCode = "",
    pickupDate = "",
    dropoffDate = "",
    text = "",
  } = req.body || {};

  try {
    const detectedIata = resolveIata(pickupLocationCode || destination || text);
    if (!detectedIata) {
      return res.status(400).json({
        success: false,
        message: "Could not detect destination airport code.",
        requestId,
      });
    }

    const resolvedPickupDate = toYmd(pickupDate) || toYmd(new Date());
    let resolvedDropoffDate = toYmd(dropoffDate);
    if (!resolvedDropoffDate) resolvedDropoffDate = addDaysYmd(resolvedPickupDate, 1);
    if (new Date(resolvedDropoffDate) <= new Date(resolvedPickupDate)) {
      resolvedDropoffDate = addDaysYmd(resolvedPickupDate, 1);
    }

    const token = await getAmadeusToken();
    const response = await axios.get(`${AMADEUS_BASE_URL}/v1/shopping/car-rentals`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickupLocationCode: detectedIata,
        pickupDate: resolvedPickupDate,
        dropoffDate: resolvedDropoffDate,
      },
      timeout: AMADEUS_TIMEOUT_MS,
    });

    const payload = response?.data || {};
    return res.json({
      success: true,
      requestId,
      search: {
        pickupLocationCode: detectedIata,
        pickupDate: resolvedPickupDate,
        dropoffDate: resolvedDropoffDate,
      },
      data: Array.isArray(payload?.data) ? payload.data : [],
      meta: payload?.meta || {},
    });
  } catch (error) {
    const upstreamStatus = error?.response?.status || 502;
    const upstreamData = error?.response?.data || null;
    console.error("[car-search] request failed", {
      requestId,
      message: error?.message,
      status: upstreamStatus,
      body: req.body || {},
      upstream: upstreamData,
    });

    return res.status(upstreamStatus).json({
      success: false,
      requestId,
      message:
        upstreamData?.errors?.[0]?.detail ||
        upstreamData?.error_description ||
        error?.message ||
        "Car search failed",
      error: upstreamData || null,
    });
  }
}

module.exports = { carSearch };
