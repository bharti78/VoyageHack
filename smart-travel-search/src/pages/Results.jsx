import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HomepageNavbar";

const FLIGHTS_API = "http://localhost:5000/api/flights";
const HOTELS_API = "http://localhost:5000/api/hotels";
const SMART_API = "http://localhost:5000/api/search";

const COUNTRY_CODE_MAP = {
  india: "IN",
  uae: "AE",
  usa: "US",
  uk: "GB",
  singapore: "SG",
  thailand: "TH",
  indonesia: "ID",
  japan: "JP",
  france: "FR",
  australia: "AU",
  italy: "IT",
  turkey: "TR",
  maldives: "MV",
};

const ROUTE_MAP = {
  goa: { from: { code: "DEL", city: "New Delhi" }, to: { code: "GOI", city: "Goa" } },
  mumbai: { from: { code: "DEL", city: "New Delhi" }, to: { code: "BOM", city: "Mumbai" } },
  delhi: { from: { code: "BOM", city: "Mumbai" }, to: { code: "DEL", city: "New Delhi" } },
  bangalore: { from: { code: "DEL", city: "New Delhi" }, to: { code: "BLR", city: "Bangalore" } },
  kochi: { from: { code: "DEL", city: "New Delhi" }, to: { code: "COK", city: "Kochi" } },
};

function normalizeText(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function asINR(v) {
  const n = Number(v || 0);
  return `Rs ${n.toLocaleString("en-IN")}`;
}

function parseJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function toYmd(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inDays(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function detectIntentService(query) {
  const q = normalizeText(query);
  if (q.includes("flight") || q.includes("air")) return "flights";
  if (q.includes("hotel") || q.includes("stay")) return "hotels";
  if (q.includes("cab")) return "cabs";
  if (q.includes("car rental") || q.includes("self drive")) return "carrental";
  return "all";
}

function parseFlightResults(data) {
  try {
    const raw = data?.Response?.Results ?? data?.Results ?? [];
    const outer = Array.isArray(raw) ? raw : [raw];
    return outer
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .filter((item) => item && typeof item === "object" && (item.Segments || item.Fare))
      .slice(0, 8)
      .map((r, idx) => {
        const seg = r?.Segments?.[0]?.[0] ?? r?.Segments?.[0] ?? {};
        const dep = seg?.Origin?.DepTime || "";
        const arr = seg?.Destination?.ArrTime || "";
        return {
          id: `${idx}-${seg?.Airline?.AirlineCode || "AI"}-${seg?.Airline?.FlightNumber || ""}`,
          airline: `${seg?.Airline?.AirlineCode || ""}${seg?.Airline?.FlightNumber || ""}`.trim() || "Flight",
          origin: seg?.Origin?.Airport?.AirportCode || "N/A",
          destination: seg?.Destination?.Airport?.AirportCode || "N/A",
          depTime: dep ? new Date(dep).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
          arrTime: arr ? new Date(arr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
          fare: Number(r?.Fare?.PublishedFare || r?.Fare?.OfferedFare || r?.TotalFare || 0),
          stops: Math.max(0, (r?.Segments?.[0]?.length || 1) - 1),
        };
      });
  } catch {
    return [];
  }
}

function hotelPrice(hotel) {
  const values = [
    hotel?.Price?.OfferedPrice,
    hotel?.Price?.PublishedPrice,
    hotel?.MinPrice,
    hotel?.TotalFare,
  ];
  for (const v of values) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function buildUnifiedSearchObject() {
  const unified = parseJSON("voyagehack.unifiedSearch", {});
  const smartQuery = parseJSON("voyagehack.smartQuery", {});
  const smartResults = parseJSON("voyagehack.smartResults", {});
  const homepage = parseJSON("homepageSearch", {});
  const whereObj = parseJSON("voyagehack.where.selected", {});
  const flightPrefill = parseJSON("voyagehack.flight.prefill", {});
  const searchType = localStorage.getItem("searchType") || "";
  const uploadedImage = localStorage.getItem("uploadedImage") || "";

  const destination =
    unified?.destination ||
    unified?.destinationObject?.city ||
    smartQuery?.destination ||
    homepage?.destination ||
    smartResults?.intent?.destination ||
    whereObj?.city ||
    "Goa";

  const startDate = unified?.startDate || homepage?.startDate || inDays(7);
  const endDate = unified?.endDate || homepage?.endDate || inDays(10);
  const budgetMax =
    Number(unified?.budget?.maxValue || 0) ||
    Number(smartQuery?.budget?.maxValue || 0) ||
    Number(homepage?.budgetMax || 0) ||
    Number(smartResults?.intent?.budget || 0) ||
    60000;

  const guests = {
    adults: Number(unified?.guests?.adults || homepage?.adults || 1),
    children: Number(unified?.guests?.children || homepage?.children || 0),
    infants: Number(unified?.guests?.infants || homepage?.infants || 0),
  };

  const intentService =
    unified?.intentService ||
    detectIntentService(unified?.query || smartQuery?.query || localStorage.getItem("searchQuery") || "");

  const query = unified?.query || smartQuery?.query || localStorage.getItem("searchQuery") || "";

  return {
    source: unified?.source || "results",
    inputType: unified?.inputType || (searchType === "image" ? "image" : "filter"),
    query,
    destination,
    destinationObject: unified?.destinationObject || smartQuery?.destinationObject || whereObj || {},
    startDate,
    endDate,
    budgetMax,
    guests,
    selectedTypes: unified?.selectedTypes || homepage?.selectedTypes || [],
    intentService,
    uploadedImage: searchType === "image" ? uploadedImage : "",
    flightPrefill,
    smartResults,
  };
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(json?.error || `Request failed: ${res.status}`);
  if (json?.error) throw new Error(json.error);
  return json;
}

export default function Results() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState({
    flights: { items: [], error: "", meta: {} },
    hotels: { items: [], error: "", meta: {} },
    cabs: { items: [], error: "", meta: {} },
    carrental: { items: [], error: "", meta: {} },
  });

  const search = useMemo(buildUnifiedSearchObject, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    let ignore = false;

    async function fetchAll() {
      setLoading(true);
      setError("");

      const destinationKey = normalizeText(search.destination).split(" ")[0];
      const fallbackRoute = ROUTE_MAP[destinationKey] || { from: { code: "DEL", city: "New Delhi" }, to: { code: "BOM", city: "Mumbai" } };
      const flightRoute = (search.flightPrefill?.from?.code && search.flightPrefill?.to?.code)
        ? { from: search.flightPrefill.from, to: search.flightPrefill.to }
        : fallbackRoute;

      const flightsPromise = postJson(`${FLIGHTS_API}/search`, {
        EndUserIp: "122.160.30.1",
        TokenId: "",
        AdultCount: String(search.guests.adults),
        ChildCount: String(search.guests.children),
        InfantCount: String(search.guests.infants),
        DirectFlight: "false",
        OneStopFlight: "false",
        JourneyType: "1",
        PreferredAirlines: null,
        Segments: [{
          Origin: flightRoute.from.code,
          Destination: flightRoute.to.code,
          FlightCabinClass: "1",
          PreferredDepartureTime: `${toYmd(search.startDate)}T00:00:00`,
          PreferredArrivalTime: `${toYmd(search.startDate)}T00:00:00`,
        }],
        Sources: null,
      })
        .then((data) => ({
          items: parseFlightResults(data),
          error: "",
          meta: { from: flightRoute.from, to: flightRoute.to },
        }))
        .catch((e) => ({ items: [], error: e.message || "Flights unavailable", meta: { from: flightRoute.from, to: flightRoute.to } }));

      const hotelsPromise = (async () => {
        try {
          const countryName = normalizeText(search.destinationObject?.country || "india");
          const countryCode = COUNTRY_CODE_MAP[countryName] || "IN";
          const cityRes = await postJson(`${HOTELS_API}/cities`, { countryCode });
          const cities = Array.isArray(cityRes?.cities) ? cityRes.cities : [];
          const match = cities.find((c) => normalizeText(c.CityName).includes(normalizeText(search.destination)));
          if (!match) throw new Error("City not matched for hotel search");

          const hotelRes = await postJson(`${HOTELS_API}/search`, {
            CheckIn: toYmd(search.startDate),
            CheckOut: toYmd(search.endDate),
            HotelCodes: "",
            GuestNationality: countryCode,
            PaxRooms: [{
              Adults: search.guests.adults,
              Children: search.guests.children,
              ChildrenAges: search.guests.children > 0 ? Array(search.guests.children).fill(8) : [],
            }],
            ResponseTime: 23,
            IsDetailedResponse: true,
            Filters: {
              Refundable: false,
              NoOfRooms: 1,
              MaxPrice: search.budgetMax || undefined,
            },
            CityId: match.CityId,
            CountryCode: countryCode,
          });
          const list = Array.isArray(hotelRes?.HotelResult) ? hotelRes.HotelResult : [];
          const items = list.slice(0, 8).map((h, idx) => ({
            id: h.HotelCode || idx,
            name: h.HotelName || "Hotel",
            city: h.CityName || search.destination,
            rating: Number(h.StarRating || 0),
            price: hotelPrice(h),
          }));
          return { items, error: "", meta: { cityId: match.CityId, countryCode } };
        } catch (e) {
          const fallback = Array.isArray(search.smartResults?.realtime?.hotels?.items)
            ? search.smartResults.realtime.hotels.items.slice(0, 8).map((h, idx) => ({
                id: h._id || idx,
                name: h.name || "Hotel",
                city: h.city || search.destination,
                rating: Number(h.rating || 0),
                price: Number(h.price || 0),
              }))
            : [];
          return { items: fallback, error: fallback.length ? "" : (e.message || "Hotels unavailable"), meta: {} };
        }
      })();

      const cabsPromise = postJson(`${SMART_API}`, {
        city: search.destination,
        budget: search.budgetMax || 999999,
        persona: localStorage.getItem("persona") || "solo",
        userGender: JSON.parse(localStorage.getItem("user") || "{}")?.gender || "",
        travelTime: "10:00",
      })
        .then((data) => {
          const drivers = Array.isArray(data?.drivers) ? data.drivers : [];
          const items = drivers.slice(0, 8).map((d, idx) => ({
            id: d._id || idx,
            name: d.name || "Driver",
            rating: Number(d.rating || 0),
            experience: Number(d.experienceYears || 0),
            gender: d.gender || "N/A",
            fare: Math.max(200, Math.round((search.budgetMax || 5000) / 20) + idx * 40),
          }));
          return { items, error: "", meta: { safetyMode: data?.safetyMode || "normal" } };
        })
        .catch((e) => {
          const fallback = Array.isArray(search.smartResults?.realtime?.cabs?.items)
            ? search.smartResults.realtime.cabs.items.slice(0, 8).map((d, idx) => ({
                id: d._id || idx,
                name: d.name || "Driver",
                rating: Number(d.rating || 0),
                experience: Number(d.experienceYears || 0),
                gender: d.gender || "N/A",
                fare: 300 + idx * 50,
              }))
            : [];
          return { items: fallback, error: fallback.length ? "" : (e.message || "Cabs unavailable"), meta: {} };
        });

      const carsPromise = Promise.resolve().then(() => {
        const items = [
          { id: "swift", name: "Maruti Swift", category: "Hatchback", seats: 5, fare: 1200 },
          { id: "dzire", name: "Maruti Dzire", category: "Sedan", seats: 5, fare: 1500 },
          { id: "creta", name: "Hyundai Creta", category: "Compact SUV", seats: 5, fare: 2200 },
          { id: "innova", name: "Toyota Innova", category: "SUV", seats: 7, fare: 2500 },
        ];
        return { items, error: "", meta: { city: search.destination } };
      });

      const [flights, hotels, cabs, carrental] = await Promise.all([
        flightsPromise,
        hotelsPromise,
        cabsPromise,
        carsPromise,
      ]);

      if (ignore) return;
      setResults({ flights, hotels, cabs, carrental });
      try {
        localStorage.setItem("voyagehack.unifiedSearch", JSON.stringify(search));
      } catch {
        // ignore
      }
      setLoading(false);
    }

    fetchAll().catch((e) => {
      if (ignore) return;
      setError(e.message || "Failed to load unified results.");
      setLoading(false);
    });

    return () => { ignore = true; };
  }, [search]);

  function openHotels() {
    localStorage.setItem("voyagehack.hotel.prefill", JSON.stringify({
      destination: search.destination,
      budget: search.budgetMax,
      startDate: search.startDate,
      endDate: search.endDate,
      adults: search.guests.adults,
      children: search.guests.children,
    }));
    navigate("/hotels");
  }

  function openFlights() {
    const route = results.flights.meta || {};
    localStorage.setItem("voyagehack.flight.prefill", JSON.stringify({
      from: route.from || { code: "DEL", city: "New Delhi" },
      to: route.to || { code: "BOM", city: "Mumbai" },
      depDate: search.startDate,
      retDate: search.endDate,
      tripType: search.endDate ? "roundtrip" : "oneway",
      cabin: "Economy",
      pax: search.guests,
    }));
    navigate("/flights");
  }

  function openCabs() {
    localStorage.setItem("voyagehack.cab.prefill", JSON.stringify({
      city: search.destination,
      budget: search.budgetMax,
    }));
    navigate("/cabs");
  }

  function openCars() {
    navigate("/carrental");
  }

  const tabs = [
    { id: "all", label: "All Results" },
    { id: "hotels", label: `Hotels (${results.hotels.items.length})` },
    { id: "flights", label: `Flights (${results.flights.items.length})` },
    { id: "cabs", label: `Cabs (${results.cabs.items.length})` },
    { id: "carrental", label: `Car Rental (${results.carrental.items.length})` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Unified Search Results</h1>
              <p className="text-sm text-slate-600 mt-1">
                {search.destination} · {toYmd(search.startDate)} to {toYmd(search.endDate)} · Budget {asINR(search.budgetMax)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Source: {search.inputType} · Intent: {search.intentService}
              </p>
            </div>
            {search.uploadedImage ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src={search.uploadedImage} alt="Uploaded query" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5">
          <div className="flex overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${
                  activeTab === t.id
                    ? "text-blue-700 border-blue-700 bg-blue-50"
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>}
        {loading && <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-600">Loading unified results...</div>}

        {!loading && (
          <div className="space-y-5">
            {(activeTab === "all" || activeTab === "flights") && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900">Top Flights</h2>
                  <button onClick={openFlights} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all flights</button>
                </div>
                {results.flights.error && <p className="text-sm text-amber-700 mb-2">{results.flights.error}</p>}
                <div className="grid md:grid-cols-2 gap-3">
                  {results.flights.items.slice(0, 4).map((f) => (
                    <div key={f.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{f.airline}</p>
                      <p className="text-sm text-slate-600">{f.origin} {f.depTime} → {f.destination} {f.arrTime}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{asINR(f.fare)} · {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}</p>
                    </div>
                  ))}
                  {results.flights.items.length === 0 && !results.flights.error && (
                    <p className="text-sm text-slate-500">No flight results for current input.</p>
                  )}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "hotels") && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900">Top Hotels</h2>
                  <button onClick={openHotels} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all hotels</button>
                </div>
                {results.hotels.error && <p className="text-sm text-amber-700 mb-2">{results.hotels.error}</p>}
                <div className="grid md:grid-cols-2 gap-3">
                  {results.hotels.items.slice(0, 4).map((h) => (
                    <div key={h.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{h.name}</p>
                      <p className="text-sm text-slate-600">{h.city}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {asINR(h.price)} {h.rating ? `· ${h.rating.toFixed(1)}★` : ""}
                      </p>
                    </div>
                  ))}
                  {results.hotels.items.length === 0 && !results.hotels.error && (
                    <p className="text-sm text-slate-500">No hotel results for current input.</p>
                  )}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "cabs") && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900">Top Cabs</h2>
                  <button onClick={openCabs} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all cabs</button>
                </div>
                {results.cabs.error && <p className="text-sm text-amber-700 mb-2">{results.cabs.error}</p>}
                <div className="grid md:grid-cols-2 gap-3">
                  {results.cabs.items.slice(0, 4).map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-sm text-slate-600">{c.gender} · {c.experience} years · {Number(c.rating || 0).toFixed(1)}★</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{asINR(c.fare)} est.</p>
                    </div>
                  ))}
                  {results.cabs.items.length === 0 && !results.cabs.error && (
                    <p className="text-sm text-slate-500">No cab results for current input.</p>
                  )}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "carrental") && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900">Top Car Rentals</h2>
                  <button onClick={openCars} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all cars</button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {results.carrental.items.slice(0, 4).map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-sm text-slate-600">{c.category} · {c.seats} seats</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{asINR(c.fare)} / day</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
