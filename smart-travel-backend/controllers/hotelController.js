require('dotenv').config();

const TBO_BASE = process.env.TBO_BASE;
const TBO_USER = process.env.TBO_USER;
const TBO_PASS = process.env.TBO_PASS;

if (!TBO_USER || !TBO_PASS || !TBO_BASE) {
  console.error('Missing TBO API credentials in environment variables');
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${TBO_USER}:${TBO_PASS}`).toString("base64");
const MAX_SEARCH_HOTEL_CODES = 100;
const MAX_TBO_RETRIES = 2;
const TBO_RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const SUCCESS_CODES = new Set([200, "200", "01", 201, "201"]);
const ENABLE_MOCK_BOOKING_MODE = String(process.env.ENABLE_MOCK_BOOKING_MODE || "false").toLowerCase() === "true";
const ALLOWED_IMAGE_HOSTS = new Set([
  "api.tbotechnology.in",
  "tbotechnology.in",
  "www.tbotechnology.in",
  "www.tboholidays.com",
  "tboholidays.com",
  "static-sources.s3-eu-west-1.amazonaws.com",
]);

function resolveTboBaseUrl(rawBase) {
  const trimmed = String(rawBase || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.endsWith("tbotechnology.in") && parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    if (/^api\.tbotechnology\.in/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }
}
const TBO_BASE_URL = resolveTboBaseUrl(TBO_BASE);

function isAllowedImageHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  if (ALLOWED_IMAGE_HOSTS.has(host)) return true;
  if (host.endsWith(".tbotechnology.in")) return true;
  if (host.endsWith(".tbotechnology.com")) return true;
  if (host.endsWith(".amazonaws.com")) return true;
  return false;
}

async function tboFetch(endpoint, payload = {}, options = {}) {
  const method = (options.method || "POST").toUpperCase();
  const includeCredentialsInBody = options.includeCredentialsInBody !== false;
  const hasBody = method !== "GET";
  const allowedBusinessCodes = new Set(
    (Array.isArray(options.allowBusinessErrorCodes) ? options.allowBusinessErrorCodes : []).map((v) =>
      String(v)
    )
  );

  console.log(`TBO API Request: ${method} ${endpoint}`, payload);

  const headers = { Authorization: AUTH };
  if (hasBody) headers["Content-Type"] = "application/json";

  const requestOptions = {
    method,
    headers,
  };

  if (hasBody) {
    requestOptions.body = JSON.stringify(
      includeCredentialsInBody
        ? { UserName: TBO_USER, Password: TBO_PASS, ...payload }
        : payload
    );
  }

  const retryable = options.retryable !== false;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_TBO_RETRIES; attempt += 1) {
    try {
      const resp = await fetch(`${TBO_BASE_URL}/${endpoint}`, requestOptions);
      const text = await resp.text();
      const contentType = String(resp.headers.get("content-type") || "").toLowerCase();
      console.log(`TBO API Response [attempt ${attempt + 1}]: ${text.slice(0, 500)}`);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        const retryThis = retryable && TBO_RETRY_STATUS.has(resp.status) && attempt < MAX_TBO_RETRIES;
        if (retryThis) {
          await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
          continue;
        }
        throw new Error(
          `TBO upstream returned non-JSON (status ${resp.status || "unknown"}, content-type ${contentType || "unknown"})`
        );
      }

      if (!resp.ok) {
        const upstreamMessage =
          data?.Status?.Description ||
          data?.error ||
          data?.message ||
          `TBO upstream HTTP ${resp.status}`;
        const retryThis = retryable && TBO_RETRY_STATUS.has(resp.status) && attempt < MAX_TBO_RETRIES;
        if (retryThis) {
          await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
          continue;
        }
        throw new Error(upstreamMessage);
      }

      // Check if TBO API returned a business-level error
      if (data.Status && !SUCCESS_CODES.has(data.Status.Code)) {
        const statusCode = String(data.Status.Code);
        if (allowedBusinessCodes.has(statusCode)) {
          return data;
        }
        throw new Error(`TBO API Error: ${data.Status.Description || "Unknown error"}`);
      }

      return data;
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || "");
      const retryThis = retryable
        && attempt < MAX_TBO_RETRIES
        && (/fetch failed|network|timeout|ECONN|ENOTFOUND|EAI_AGAIN|upstream/i.test(msg));
      if (retryThis) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw lastError || new Error("TBO request failed");
}

const cityCache = {};
const cityHotelCodeCache = {};
const cityHotelDetailsCache = {};
const hotelDetailsCache = {};
const fxRateCache = {};
const FX_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FX_FALLBACK_TO_INR = {
  USD: 83,
  EUR: 90,
  GBP: 106,
  AED: 22.6,
  SGD: 61,
  THB: 2.3,
};

function fallbackFxRate(base, to) {
  if (base === to) return 1;
  if (to === "INR" && Number.isFinite(Number(FX_FALLBACK_TO_INR[base]))) {
    return Number(FX_FALLBACK_TO_INR[base]);
  }
  if (base === "INR" && Number.isFinite(Number(FX_FALLBACK_TO_INR[to]))) {
    return 1 / Number(FX_FALLBACK_TO_INR[to]);
  }
  if (Number.isFinite(Number(FX_FALLBACK_TO_INR[base])) && Number.isFinite(Number(FX_FALLBACK_TO_INR[to]))) {
    return Number(FX_FALLBACK_TO_INR[base]) / Number(FX_FALLBACK_TO_INR[to]);
  }
  return Number.NaN;
}

function isInsufficientBalanceStatus(status) {
  const code = String(status?.Code || "").trim();
  const desc = String(status?.Description || "").toLowerCase();
  return code === "300" && desc.includes("insufficient balance");
}

function isMockBookingRequested(body = {}) {
  const requested = String(body?.MockBooking || body?.mockBooking || "").toLowerCase();
  return ENABLE_MOCK_BOOKING_MODE || requested === "true";
}

function buildMockBookingResponse(payload = {}, sourceStatus = {}) {
  const now = Date.now();
  const mockRef = `MOCKBK_${now}`;
  return {
    Status: {
      Code: 200,
      Description: "Mock booking confirmed (insufficient supplier balance).",
    },
    ConfirmationNumber: mockRef,
    BookingReferenceId: payload?.BookingReferenceId || mockRef,
    BookingId: mockRef,
    BookingStatus: "Confirmed",
    Mock: true,
    MockReason: "insufficient_balance",
    SourceStatus: sourceStatus || null,
    HotelResult: [],
  };
}

function buildMockBookingDetail(payload = {}) {
  const ref = String(payload?.ConfirmationNumber || payload?.BookingReferenceId || `MOCKBK_${Date.now()}`).trim();
  return {
    Status: { Code: 200, Description: "Mock booking detail" },
    BookingDetail: {
      ConfirmationNumber: ref,
      BookingReferenceId: ref,
      BookingStatus: "Confirmed",
      VoucherStatus: "Issued",
      Mock: true,
    },
  };
}

function buildMockCancelResponse(ref) {
  return {
    Status: { Code: 200, Description: "Mock booking cancelled" },
    ConfirmationNumber: ref,
    Mock: true,
  };
}

function normalizeHotelCodes(rawCodes) {
  if (!rawCodes) return "";
  const uniqueCodes = [...new Set(
    String(rawCodes)
      .split(",")
      .map(code => code.trim())
      .filter(Boolean)
  )];
  return uniqueCodes.slice(0, MAX_SEARCH_HOTEL_CODES).join(",");
}

function getHotelMinFare(searchData) {
  const list = Array.isArray(searchData?.HotelResult)
    ? searchData.HotelResult
    : (Array.isArray(searchData?.Hotels) ? searchData.Hotels : []);
  if (!Array.isArray(list) || list.length === 0) return null;

  const fares = [];
  for (const hotel of list) {
    const roomList = Array.isArray(hotel?.Rooms)
      ? hotel.Rooms
      : (hotel?.Rooms ? [hotel.Rooms] : []);
    for (const room of roomList) {
      const val = Number(
        room?.Price?.OfferedPrice ??
        room?.Price?.PublishedPrice ??
        room?.TotalFare
      );
      if (Number.isFinite(val) && val > 0) fares.push(val);
    }
    const fallback = Number(
      hotel?.Price?.OfferedPrice ??
      hotel?.Price?.PublishedPrice ??
      hotel?.TotalFare
    );
    if (Number.isFinite(fallback) && fallback > 0) fares.push(fallback);
  }
  if (fares.length === 0) return null;
  return Math.min(...fares);
}

async function getHotelCodesForCity(cityCode) {
  const key = String(cityCode || "").trim();
  if (!key) return "";

  if (Object.prototype.hasOwnProperty.call(cityHotelCodeCache, key)) {
    return cityHotelCodeCache[key];
  }

  let data;
  try {
    data = await tboFetch("TBOHotelCodeList", {
      CityCode: key,
      IsDetailedResponse: true,
    });
  } catch (err) {
    const msg = String(err?.message || "");
    if (/upstream|non-json|502|503|504|timeout|network/i.test(msg)) {
      // Upstream instability should not break search flow.
      cityHotelCodeCache[key] = "";
      return "";
    }
    if (/no\s+hotels?\s+found/i.test(msg)) {
      cityHotelCodeCache[key] = "";
      return "";
    }
    throw err;
  }

  const codes = (data.Hotels || [])
    .map(h => String(h.HotelCode || "").trim())
    .filter(Boolean)
    .slice(0, MAX_SEARCH_HOTEL_CODES);

  const hotelCodes = codes.join(",");
  cityHotelCodeCache[key] = hotelCodes;
  return hotelCodes;
}

function parseHotelRating(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const text = String(value).trim();
  if (!text) return null;

  const num = Number(text);
  if (!Number.isNaN(num)) return num;

  const lowered = text.toLowerCase();
  const map = {
    onestar: 1,
    twostar: 2,
    threestar: 3,
    fourstar: 4,
    fivestar: 5,
  };
  return map[lowered] ?? null;
}

function sanitizeImageUrl(value) {
  if (!value) return "";
  if (typeof value === "object") {
    const candidate = value.ImageUrl || value.ImageURL || value.imageURL || value.Url || value.URL || value.url;
    return sanitizeImageUrl(candidate);
  }
  const raw = String(value).replace(/[\r\n\t]/g, "").trim();
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
}

function formatYmd(dateValue) {
  const d = new Date(dateValue);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseImageList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(sanitizeImageUrl).filter(Boolean);
  if (typeof value !== "string") return [];

  const text = value.trim();
  if (!text) return [];

  // Try JSON array first.
  if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith("\"") && text.endsWith("\""))) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(sanitizeImageUrl).filter(Boolean);
      return [sanitizeImageUrl(parsed)].filter(Boolean);
    } catch {
      // fall through
    }
  }

  return text
    .split(/[,\s]+/)
    .map(sanitizeImageUrl)
    .filter(Boolean);
}

function extractHotelImages(detail, hotel) {
  const images = [
    ...parseImageList(detail?.Images),
    ...parseImageList(detail?.ImageUrls),
    ...parseImageList(detail?.imageURL),
    ...parseImageList(detail?.HotelPicture),
    ...parseImageList(detail?.ImagePath),
    ...parseImageList(hotel?.Images),
    ...parseImageList(hotel?.HotelPicture),
    ...parseImageList(hotel?.ImagePath),
  ];

  const roomDetails = Array.isArray(detail?.RoomDetails) ? detail.RoomDetails : [];
  for (const room of roomDetails) {
    images.push(...parseImageList(room?.imageURL));
    images.push(...parseImageList(room?.ImageURL));
    images.push(...parseImageList(room?.Images));
  }

  return [...new Set(images.filter(Boolean))];
}

async function getCityHotelDetails(cityCode) {
  const key = String(cityCode || "").trim();
  if (!key) return [];
  if (cityHotelDetailsCache[key]) return cityHotelDetailsCache[key];

  const data = await tboFetch("TBOHotelCodeList", {
    CityCode: key,
    IsDetailedResponse: true,
  });

  const hotels = Array.isArray(data.Hotels) ? data.Hotels : [];
  cityHotelDetailsCache[key] = hotels;
  return hotels;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function getFxRate(baseCurrency = "INR", toCurrency = "INR") {
  const base = String(baseCurrency || "INR").toUpperCase().trim();
  const to = String(toCurrency || "INR").toUpperCase().trim();
  if (!base || !to) throw new Error("Invalid currency code.");
  if (base === to) return { rate: 1, source: "identity", cached: false };

  const cacheKey = `${base}_${to}`;
  const now = Date.now();
  const cached = fxRateCache[cacheKey];
  if (cached && now - cached.savedAt < FX_CACHE_TTL_MS) {
    return { rate: cached.rate, source: cached.source || "cache", cached: true };
  }

  try {
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(to)}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) throw new Error(`FX upstream failed (${resp.status})`);
    const data = await resp.json().catch(() => ({}));
    const rate = Number(data?.rates?.[to]);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`FX rate unavailable for ${base}->${to}`);
    }
    fxRateCache[cacheKey] = { rate, savedAt: now, source: "frankfurter" };
    return { rate, source: "frankfurter", cached: false };
  } catch (err) {
    const fallback = fallbackFxRate(base, to);
    if (Number.isFinite(fallback) && fallback > 0) {
      fxRateCache[cacheKey] = { rate: fallback, savedAt: now, source: "fallback" };
      return { rate: fallback, source: "fallback", cached: false };
    }
    throw err;
  }
}

async function getHotelDetailsForCodes(hotelCodes) {
  const uniqueCodes = [...new Set(
    (hotelCodes || [])
      .map(code => String(code || "").trim())
      .filter(Boolean)
  )];

  const missing = uniqueCodes.filter(code => !hotelDetailsCache[code]);
  if (missing.length === 0) {
    return uniqueCodes.map(code => hotelDetailsCache[code]).filter(Boolean);
  }

  // Try batched fetch first, then fallback to single-code calls if needed.
  const batches = chunkArray(missing, 50);
  for (const batch of batches) {
    try {
      const data = await tboFetch("HotelDetails", {
        Hotelcodes: batch.join(","),
        Language: "EN",
        IsRoomDetailRequired: true,
      });
      const details = Array.isArray(data.HotelDetails) ? data.HotelDetails : [];
      for (const detail of details) {
        const code = String(detail?.HotelCode || "").trim();
        if (code) hotelDetailsCache[code] = detail;
      }
    } catch {
      for (const code of batch) {
        try {
          const data = await tboFetch("HotelDetails", { Hotelcodes: code, Language: "EN", IsRoomDetailRequired: true });
          const detail = Array.isArray(data.HotelDetails) ? data.HotelDetails[0] : null;
          if (detail) hotelDetailsCache[code] = detail;
        } catch {
          // Keep search results working even if static detail fetch fails.
        }
      }
    }
  }

  return uniqueCodes.map(code => hotelDetailsCache[code]).filter(Boolean);
}

function enrichSearchHotelResult(searchData, detailedHotels, hotelDetails) {
  if (!Array.isArray(searchData?.HotelResult) || !Array.isArray(detailedHotels) || detailedHotels.length === 0) {
    if (!Array.isArray(searchData?.HotelResult) || !Array.isArray(hotelDetails) || hotelDetails.length === 0) {
      return searchData;
    }
  }

  const cityDetailMap = new Map(
    detailedHotels
      .filter(h => h?.HotelCode !== undefined && h?.HotelCode !== null)
      .map(h => [String(h.HotelCode), h])
  );
  const hotelDetailMap = new Map(
    (hotelDetails || [])
      .filter(h => h?.HotelCode !== undefined && h?.HotelCode !== null)
      .map(h => [String(h.HotelCode), h])
  );

  const enriched = searchData.HotelResult.map(hotel => {
    const cityDetail = cityDetailMap.get(String(hotel?.HotelCode || "")) || {};
    const staticDetail = hotelDetailMap.get(String(hotel?.HotelCode || "")) || {};
    const detail = { ...cityDetail, ...staticDetail };
    if (!detail || Object.keys(detail).length === 0) return hotel;

    const mergedRating = parseHotelRating(hotel.HotelRating) ?? parseHotelRating(detail.HotelRating);
    const images = extractHotelImages(detail, hotel);
    const firstImage = images.length > 0 ? images[0] : undefined;

    return {
      ...detail,
      ...hotel,
      HotelName: hotel.HotelName || detail.HotelName,
      Address: hotel.Address || detail.Address,
      HotelAddress: hotel.HotelAddress || detail.Address || detail.HotelAddress,
      CityName: hotel.CityName || detail.CityName,
      CountryName: hotel.CountryName || detail.CountryName,
      CountryCode: hotel.CountryCode || detail.CountryCode,
      HotelRating: mergedRating ?? hotel.HotelRating ?? detail.HotelRating,
      HotelPicture: hotel.HotelPicture || detail.HotelPicture || detail.ImagePath || firstImage,
      ImagePath: hotel.ImagePath || detail.ImagePath || firstImage,
      Images: images,
      Description: hotel.Description || detail.Description,
      HotelFacilities: hotel.HotelFacilities || detail.HotelFacilities,
      Attractions: hotel.Attractions || detail.Attractions,
      HotelWebsiteURL: hotel.HotelWebsiteURL || detail.HotelWebsiteURL,
      PhoneNumber: hotel.PhoneNumber || detail.PhoneNumber,
      FaxNumber: hotel.FaxNumber || detail.FaxNumber,
    };
  });

  return { ...searchData, HotelResult: enriched };
}

exports.countryList = async (_req, res) => {
  try {
    const data = await tboFetch("CountryList", {}, { method: "GET", includeCredentialsInBody: false });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.searchCities = async (req, res) => {
  try {
    const { countryCode = "IN" } = req.body;
    const key = countryCode.toUpperCase();
    console.log(`Searching cities for country: ${key}`);

    if (!cityCache[key]) {
      console.log(`Fetching fresh city list for ${key}`);
      const data = await tboFetch("CityList", { CountryCode: key });
      console.log(`TBO CityList response:`, data);
      
      if (data.Status && data.Status.Code !== 200 && data.Status.Code !== "01") {
        throw new Error(`TBO API Error: ${data.Status.Description || 'Unknown error'}`);
      }
      
      // Transform TBO response to match frontend expectations.
      // TBO returns city.Name in "CityName, StateName" format (e.g. "Delhi, Delhi").
      // We preserve the full name for the API but also extract a ShortName (bare city)
      // so the frontend can match user input like "Delhi" → "Delhi, Delhi".
      const cities = (data.CityList || []).map(city => {
        const fullName = city.Name || "";
        // Short name = everything before the first comma, trimmed
        const shortName = fullName.includes(",")
          ? fullName.split(",")[0].trim()
          : fullName;
        return {
          CityId:    city.Code,
          CityName:  fullName,   // full "City, State" — sent to TBO API
          ShortName: shortName,  // bare city name — used for UI matching
        };
      });
      
      cityCache[key] = cities;
      console.log(`Cached ${cities.length} cities for ${key}`);
    }

    res.json({ cities: cityCache[key] });
  } catch (err) {
    console.error('City search error:', err);
    res.status(502).json({ error: err.message });
  }
};

exports.hotelSearch = async (req, res) => {
  try {
    console.log('Hotel search request:', req.body);
    const cityId = req.body?.CityId;

    const payload = { ...req.body };
    payload.HotelCodes = normalizeHotelCodes(payload.HotelCodes);
    const DAY_MS = 24 * 60 * 60 * 1000;
    let checkInDate = new Date(payload.CheckIn || Date.now());
    if (Number.isNaN(checkInDate.getTime())) checkInDate = new Date();
    let checkOutDate = new Date(payload.CheckOut || (checkInDate.getTime() + DAY_MS));
    if (Number.isNaN(checkOutDate.getTime()) || checkOutDate.getTime() <= checkInDate.getTime()) {
      checkOutDate = new Date(checkInDate.getTime() + DAY_MS);
    }
    payload.CheckIn = formatYmd(checkInDate);
    payload.CheckOut = formatYmd(checkOutDate);

    // If HotelCodes are missing, derive them from city using TBOHotelCodeList.
    if (!payload.HotelCodes && payload.CityId) {
      payload.HotelCodes = await getHotelCodesForCity(payload.CityId);
    }

    if (!payload.HotelCodes) {
      return res.json({
        Status: { Code: 200, Description: "No Hotels Found" },
        HotelResult: [],
      });
    }

    // Keep Search payload aligned with API spec.
    delete payload.CityId;
    delete payload.CountryCode;

    const data = await tboFetch("Search", payload);
    let detailedHotels = [];
    try {
      detailedHotels = cityId ? await getCityHotelDetails(cityId) : [];
    } catch {
      // Detail enrichment is optional; keep base search results available.
      detailedHotels = [];
    }
    const resultHotelCodes = Array.isArray(data?.HotelResult)
      ? data.HotelResult.map(h => h?.HotelCode).filter(Boolean)
      : [];
    const detailedStaticHotels = await getHotelDetailsForCodes(resultHotelCodes);
    const enriched = enrichSearchHotelResult(data, detailedHotels, detailedStaticHotels);
    console.log('Hotel search successful:', data);
    res.json(enriched);
  } catch (err) {
    console.error('Hotel search error:', err);
    res.status(502).json({ error: err.message });
  }
};

exports.calendarFares = async (req, res) => {
  try {
    const {
      CityId,
      CityName = "",
      CountryCode = "IN",
      CheckIn,
      CheckOut,
      HotelCodes = "",
      GuestNationality = "IN",
      PaxRooms,
      Filters = {},
      Days = 14,
      FlexDays = 0,
      ResponseTime = 4,
    } = req.body || {};

    if (!CityId) return res.status(400).json({ error: "calendar-fares requires CityId." });
    if (!CheckIn || !CheckOut) return res.status(400).json({ error: "calendar-fares requires CheckIn and CheckOut." });

    const baseCheckIn = new Date(CheckIn);
    const baseCheckOut = new Date(CheckOut);
    if (Number.isNaN(baseCheckIn.getTime()) || Number.isNaN(baseCheckOut.getTime())) {
      return res.status(400).json({ error: "CheckIn/CheckOut must be valid dates (YYYY-MM-DD)." });
    }

    const nightMs = 24 * 60 * 60 * 1000;
    const nights = Math.max(1, Math.round((baseCheckOut.getTime() - baseCheckIn.getTime()) / nightMs) || 1);
    const totalDays = Math.max(1, Math.min(31, Number(Days) || 14));
    const flexDays = Math.max(0, Math.min(14, Number(FlexDays) || 0));

    let normalizedHotelCodes = normalizeHotelCodes(HotelCodes);
    if (!normalizedHotelCodes) normalizedHotelCodes = await getHotelCodesForCity(CityId);
    if (!normalizedHotelCodes) {
      return res.json({ success: true, cityId: String(CityId), nights, days: totalDays, flexDays, lowestFare: null, fares: [] });
    }

    const dates = [];
    for (let i = -flexDays; i < totalDays + flexDays; i += 1) {
      const d = new Date(baseCheckIn);
      d.setDate(baseCheckIn.getDate() + i);
      dates.push(formatYmd(d));
    }
    const uniqDates = [...new Set(dates)];
    const calendar = [];

    for (const inDate of uniqDates) {
      const inDt = new Date(inDate);
      const outDt = new Date(inDt);
      outDt.setDate(inDt.getDate() + nights);
      const outDate = formatYmd(outDt);

      try {
        const payload = {
          CheckIn: inDate,
          CheckOut: outDate,
          HotelCodes: normalizedHotelCodes,
          GuestNationality,
          PaxRooms: Array.isArray(PaxRooms) && PaxRooms.length
            ? PaxRooms
            : [{ Adults: 2, Children: 0, ChildrenAges: [] }],
          ResponseTime,
          IsDetailedResponse: false,
          Filters: {
            Refundable: false,
            ...(Filters || {}),
          },
          CityName,
          CountryCode,
        };
        delete payload.CityId;

        const data = await tboFetch("Search", payload);
        const minFare = getHotelMinFare(data);
        calendar.push({
          checkIn: inDate,
          checkOut: outDate,
          minFare,
          currency: "INR",
        });
      } catch (err) {
        calendar.push({
          checkIn: inDate,
          checkOut: outDate,
          minFare: null,
          currency: "INR",
          error: err?.message || "No fare",
        });
      }
    }

    const valid = calendar.filter((x) => Number.isFinite(x.minFare) && x.minFare > 0);
    const lowestFare = valid.length ? Math.min(...valid.map((x) => x.minFare)) : null;

    res.json({
      success: true,
      cityId: String(CityId),
      nights,
      days: totalDays,
      flexDays,
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
    res.status(502).json({ error: err.message || "Hotel calendar fare search failed" });
  }
};

exports.hotelCodeList = async (_req, res) => {
  try {
    // As per v2.1 doc, this method is GET and returns the full static hotel code list.
    const data = await tboFetch("hotelcodelist", {}, { method: "GET", includeCredentialsInBody: false });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.tboHotelCodeList = async (req, res) => {
  try {
    const cityCode = String(req.body?.CityCode || req.body?.CityId || "").trim();
    if (!cityCode) {
      return res.status(400).json({ error: "TBOHotelCodeList requires CityCode." });
    }
    const data = await tboFetch("TBOHotelCodeList", {
      CityCode: cityCode,
      IsDetailedResponse: req.body?.IsDetailedResponse ?? true,
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.hotelDetails = async (req, res) => {
  try {
    const hotelCodes = req.body?.Hotelcodes ?? req.body?.HotelCodes ?? req.body?.HotelCode;
    if (!hotelCodes) {
      return res.status(400).json({ error: "HotelDetails requires Hotelcodes/HotelCodes." });
    }
    const payload = {
      Hotelcodes: hotelCodes,
      Language: req.body?.Language || "EN",
      ...(req.body?.IsRoomDetailRequired !== undefined
        ? { IsRoomDetailRequired: req.body.IsRoomDetailRequired }
        : {}),
    };
    const data = await tboFetch("HotelDetails", payload);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.bookingDetailsByDate = async (req, res) => {
  try {
    const fromDate = req.body?.FromDate || req.body?.fromdate;
    const toDate = req.body?.ToDate || req.body?.todate;
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "BookingDetailsbasedondate requires FromDate and ToDate." });
    }
    const data = await tboFetch("BookingDetailsbasedondate", {
      fromdate: fromDate,
      todate: toDate,
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.proxyHotelImage = async (req, res) => {
  try {
    const raw = String(req.query?.url || "").trim();
    if (!raw) return res.status(400).json({ error: "Image URL is required." });

    const normalizedRaw = raw.startsWith("//") ? `https:${raw}` : raw;
    const withProtocol = /^https?:\/\//i.test(normalizedRaw) ? normalizedRaw : `https://${normalizedRaw}`;

    let parsed;
    try {
      parsed = new URL(withProtocol);
    } catch {
      return res.status(400).json({ error: "Invalid image URL." });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Unsupported image URL protocol." });
    }
    if (!isAllowedImageHost(parsed.hostname)) {
      return res.status(403).json({ error: "Image host is not allowed." });
    }

    const imgResp = await fetch(parsed.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "VoyageHack-ImageProxy/1.0",
        Accept: "image/*,*/*;q=0.8",
      },
    });
    if (!imgResp.ok) {
      return res.status(imgResp.status).json({ error: "Unable to fetch image." });
    }

    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const cacheControl = imgResp.headers.get("cache-control") || "public, max-age=86400";
    const arr = await imgResp.arrayBuffer();
    const buffer = Buffer.from(arr);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: err.message || "Image proxy failed." });
  }
};

exports.preBook = async (req, res) => {
  try {
    const bookingCode = String(req.body?.BookingCode || "").trim();
    if (!bookingCode) {
      return res.status(400).json({ error: "PreBook requires a valid BookingCode." });
    }

    const payload = {
      BookingCode: bookingCode,
      PaymentMode: req.body?.PaymentMode || "Limit",
    };

    const data = await tboFetch("PreBook", payload, {
      allowBusinessErrorCodes: [300],
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.book = async (req, res) => {
  try {
    const bookingCode = String(req.body?.BookingCode || "").trim();
    if (!bookingCode) {
      return res.status(400).json({ error: "Book requires a valid BookingCode." });
    }

    const normalizedCustomerDetails = Array.isArray(req.body?.CustomerDetails)
      ? req.body.CustomerDetails.map(room => ({
          ...room,
          CustomerNames: Array.isArray(room?.CustomerNames)
            ? room.CustomerNames.map(guest => ({
                Title: guest?.Title || "Mr",
                FirstName: guest?.FirstName || "",
                LastName: guest?.LastName || "",
                Type: guest?.Type === "1" ? "Adult" : (guest?.Type || "Adult"),
              }))
            : [],
        }))
      : [];

    const payload = {
      BookingCode: bookingCode,
      CustomerDetails: normalizedCustomerDetails,
      ClientReferenceId: req.body?.ClientReferenceId || `TBO_${Date.now()}`,
      BookingReferenceId: req.body?.BookingReferenceId || req.body?.BookingRefNo || `BK_${Date.now()}`,
      TotalFare: Number(req.body?.TotalFare || 0),
      EmailId: req.body?.EmailId || req.body?.email || "",
      PhoneNumber: req.body?.PhoneNumber || req.body?.phone || "",
      BookingType: req.body?.BookingType || "Voucher",
      PaymentMode: req.body?.PaymentMode || "Limit",
    };

    const mockBookingEnabled = isMockBookingRequested(req.body);
    const data = await tboFetch("Book", payload, {
      allowBusinessErrorCodes: mockBookingEnabled ? [300] : [],
    });
    if (mockBookingEnabled && isInsufficientBalanceStatus(data?.Status)) {
      return res.json(buildMockBookingResponse(payload, data?.Status));
    }
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.bookingDetail = async (req, res) => {
  try {
    const payload = {
      ...(req.body?.ConfirmationNumber
        ? { ConfirmationNumber: req.body.ConfirmationNumber }
        : {}),
      ...(req.body?.BookingReferenceId
        ? { BookingReferenceId: req.body.BookingReferenceId }
        : {}),
      PaymentMode: req.body?.PaymentMode || "Limit",
    };

    if (!payload.ConfirmationNumber && !payload.BookingReferenceId) {
      return res.status(400).json({ error: "BookingDetail requires ConfirmationNumber or BookingReferenceId." });
    }

    const isMockRef = String(payload.ConfirmationNumber || payload.BookingReferenceId || "").startsWith("MOCKBK_");
    if (isMockRef) {
      return res.json(buildMockBookingDetail(payload));
    }

    const data = await tboFetch("BookingDetail", payload);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const confirmationNumber = String(
      req.body?.ConfirmationNumber || req.body?.confirmationNumber || req.body?.BookingRefNo || ""
    ).trim();
    const bookingReferenceId = String(
      req.body?.BookingReferenceId || req.body?.bookingReferenceId || req.body?.BookingRefNo || ""
    ).trim();

    if (!confirmationNumber && !bookingReferenceId) {
      return res.status(400).json({ error: "Cancel requires ConfirmationNumber or BookingReferenceId." });
    }

    const ref = confirmationNumber || bookingReferenceId;
    if (String(ref).startsWith("MOCKBK_")) {
      return res.json(buildMockCancelResponse(ref));
    }

    const payload = {
      ...(confirmationNumber ? { ConfirmationNumber: confirmationNumber } : {}),
      ...(bookingReferenceId ? { BookingReferenceId: bookingReferenceId } : {}),
    };

    const data = await tboFetch("Cancel", payload);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.fxRate = async (req, res) => {
  try {
    const base = String(req.query?.base || "INR").toUpperCase().trim();
    const to = String(req.query?.to || "INR").toUpperCase().trim();
    if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(to)) {
      return res.status(400).json({ error: "base/to must be valid 3-letter currency codes." });
    }
    const { rate, source, cached } = await getFxRate(base, to);
    return res.json({ base, to, rate, source, cached });
  } catch (err) {
    return res.status(502).json({ error: err.message || "FX rate fetch failed." });
  }
};
