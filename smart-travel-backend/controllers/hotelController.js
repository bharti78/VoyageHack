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

async function tboFetch(endpoint, payload) {
  console.log(`TBO API Request: ${endpoint}`, payload);
  const resp = await fetch(`${TBO_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: AUTH },
    body: JSON.stringify({ UserName: TBO_USER, Password: TBO_PASS, ...payload }),
  });
  const text = await resp.text();
  console.log(`TBO API Response: ${text.slice(0, 500)}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from TBO: ${text.slice(0, 200)}`);
  }
  
  // Check if TBO API returned an error
  if (data.Status && (data.Status.Code !== 200 && data.Status.Code !== "01" && data.Status.Code !== 201)) {
    throw new Error(`TBO API Error: ${data.Status.Description || 'Unknown error'}`);
  }
  
  return data;
}

const cityCache = {};
const cityHotelCodeCache = {};

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
    console.log('Hotel search successful:', data);
    res.json(data);
  } catch (err) {
    console.error('Hotel search error:', err);
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
