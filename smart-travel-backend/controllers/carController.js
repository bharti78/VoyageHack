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
const IATA_TO_CITY = Object.entries(CITY_TO_IATA).reduce((acc, [city, iata]) => {
  if (!acc[iata]) acc[iata] = city;
  return acc;
}, {});

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

function toIsoPickupDateTime(pickupDate) {
  return `${pickupDate}T10:00:00`;
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cityFromInput({ destination, text, iata }) {
  const explicit = String(destination || text || "").trim();
  if (explicit) return titleCase(extractCityFromText(explicit) || explicit);
  return titleCase(IATA_TO_CITY[iata] || iata || "");
}

function normalizeTransferOffers(offers) {
  if (!Array.isArray(offers)) return [];
  return offers.map((offer, idx) => {
    const amount = String(offer?.quotation?.monetaryAmount || "0");
    const currency = String(offer?.quotation?.currencyCode || "USD");
    const includedDistance = Number(offer?.distance?.value || 0);
    const transferType = offer?.transferType || "PRIVATE";

    return {
      id: offer?.id || `transfer-offer-${idx + 1}`,
      provider: {
        companyName: offer?.serviceProvider?.name || offer?.serviceProvider?.code || "Transfer Provider",
        companyCode: offer?.serviceProvider?.code || "",
      },
      vehicle: {
        description: offer?.vehicle?.description || "Transfer Vehicle",
        category: offer?.vehicle?.category || transferType,
        seats: Number(offer?.vehicle?.seats?.[0]?.count || 4),
        passengers: Number(offer?.vehicle?.seats?.[0]?.count || 4),
        fuel: "As per provider",
        transmission: "Automatic",
        airConditioning: true,
        mileage: offer?.distance?.unit ? `${includedDistance} ${offer.distance.unit}` : "N/A",
        acrissCode: offer?.vehicle?.code || "",
      },
      quotes: [
        {
          price: { total: amount, currency },
          estimatedTotal: amount,
          policies: { fuelPolicy: "As per provider policy" },
          mileage: {
            includedDistance,
            extraDistanceRate: "0",
          },
        },
      ],
      price: { total: amount, currency },
      transferMeta: {
        startDateTime: offer?.start?.dateTime || "",
        endDateTime: offer?.end?.dateTime || "",
        transferType,
      },
    };
  });
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
    let payload = {};
    let usedFallbackEndpoint = false;
    try {
      const response = await axios.get(`${AMADEUS_BASE_URL}/v1/shopping/car-rental-offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickupLocationCode: detectedIata,
          pickUpLocationCode: detectedIata,
          pickupDate: resolvedPickupDate,
          pickUpDate: resolvedPickupDate,
          dropoffDate: resolvedDropoffDate,
          dropOffDate: resolvedDropoffDate,
        },
        timeout: AMADEUS_TIMEOUT_MS,
      });
      payload = response?.data || {};
    } catch (err) {
      if (err?.response?.status !== 404) throw err;
      usedFallbackEndpoint = true;

      const detectedCity = cityFromInput({ destination, text, iata: detectedIata });
      const transferResponse = await axios.post(
        `${AMADEUS_BASE_URL}/v1/shopping/transfer-offers`,
        {
          startLocationCode: detectedIata,
          endCityName: detectedCity,
          endCountryCode: "IN",
          endAddressLine: `${detectedCity} City Center`,
          transferType: "PRIVATE",
          startDateTime: toIsoPickupDateTime(resolvedPickupDate),
          passengers: 1,
          currencyCode: "INR",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: AMADEUS_TIMEOUT_MS,
        }
      );
      const transferPayload = transferResponse?.data || {};
      payload = {
        data: normalizeTransferOffers(transferPayload?.data || []),
        meta: {
          ...(transferPayload?.meta || {}),
          source: "transfer-offers-fallback",
        },
      };
    }

    return res.json({
      success: true,
      requestId,
      search: {
        pickupLocationCode: detectedIata,
        pickupDate: resolvedPickupDate,
        dropoffDate: resolvedDropoffDate,
      },
      data: Array.isArray(payload?.data) ? payload.data : [],
      meta: {
        ...(payload?.meta || {}),
        carSearchFallbackUsed: usedFallbackEndpoint,
      },
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
      upstreamRaw: upstreamData ? JSON.stringify(upstreamData) : null,
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
