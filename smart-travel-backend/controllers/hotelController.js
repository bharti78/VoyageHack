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

function enrichSearchHotelResult(searchData, detailedHotels) {
  if (!Array.isArray(searchData?.HotelResult) || !Array.isArray(detailedHotels) || detailedHotels.length === 0) {
    return searchData;
  }

  const detailMap = new Map(
    detailedHotels
      .filter(h => h?.HotelCode !== undefined && h?.HotelCode !== null)
      .map(h => [String(h.HotelCode), h])
  );

  const enriched = searchData.HotelResult.map(hotel => {
    const detail = detailMap.get(String(hotel?.HotelCode || ""));
    if (!detail) return hotel;

    const mergedRating = parseHotelRating(hotel.HotelRating) ?? parseHotelRating(detail.HotelRating);
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
    const enriched = enrichSearchHotelResult(data, detailedHotels);
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
    const data = await tboFetch("Book", req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.bookingDetail = async (req, res) => {
  try {
    const data = await tboFetch("BookingDetail", req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const data = await tboFetch("Cancel", req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
