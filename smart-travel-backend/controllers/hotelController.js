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
const SUCCESS_CODES = new Set([200, "200", "01", 201, "201"]);
const ALLOWED_IMAGE_HOSTS = new Set([
  "api.tbotechnology.in",
  "tbotechnology.in",
  "www.tbotechnology.in",
  "www.tboholidays.com",
  "tboholidays.com",
  "static-sources.s3-eu-west-1.amazonaws.com",
]);

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

  const resp = await fetch(`${TBO_BASE}/${endpoint}`, requestOptions);
  const text = await resp.text();
  console.log(`TBO API Response: ${text.slice(0, 500)}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from TBO: ${text.slice(0, 200)}`);
  }
  
  // Check if TBO API returned an error
  if (data.Status && !SUCCESS_CODES.has(data.Status.Code)) {
    throw new Error(`TBO API Error: ${data.Status.Description || 'Unknown error'}`);
  }
  
  return data;
}

const cityCache = {};
const cityHotelCodeCache = {};
const cityHotelDetailsCache = {};
const hotelDetailsCache = {};

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

async function getHotelCodesForCity(cityCode) {
  const key = String(cityCode || "").trim();
  if (!key) return "";

  if (cityHotelCodeCache[key]) {
    return cityHotelCodeCache[key];
  }

  const data = await tboFetch("TBOHotelCodeList", {
    CityCode: key,
    IsDetailedResponse: true,
  });

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
      
      // Transform TBO response to match frontend expectations
      const cities = (data.CityList || []).map(city => ({
        CityId: city.Code,
        CityName: city.Name
      }));
      
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

    // If HotelCodes are missing, derive them from city using TBOHotelCodeList.
    if (!payload.HotelCodes && payload.CityId) {
      payload.HotelCodes = await getHotelCodesForCity(payload.CityId);
    }

    if (!payload.HotelCodes) {
      return res.status(400).json({
        error: "Unable to search hotels. No HotelCodes were provided and no hotel codes were found for the selected city.",
      });
    }

    // Keep Search payload aligned with API spec.
    delete payload.CityId;
    delete payload.CountryCode;

    const data = await tboFetch("Search", payload);
    const detailedHotels = cityId ? await getCityHotelDetails(cityId) : [];
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

    const data = await tboFetch("PreBook", payload);
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

    const data = await tboFetch("Book", payload);
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

    if (!confirmationNumber) {
      return res.status(400).json({ error: "Cancel requires ConfirmationNumber." });
    }

    const data = await tboFetch("Cancel", { ConfirmationNumber: confirmationNumber });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
