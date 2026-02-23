import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HomepageNavbar";
import { buildAndStore, readUnified } from "../utils/unifiedSearch";

/* ── API base URLs ─────────────────────────────────────────────── */
const FLIGHTS_API   = "http://localhost:5000/api/flights";
const HOTELS_API    = "http://localhost:5000/api/hotels";
const SMART_API     = "http://localhost:5000/api/search";

/* ── Static lookup tables ──────────────────────────────────────── */
const COUNTRY_CODE_MAP = {
  india:"IN",uae:"AE",usa:"US",uk:"GB",singapore:"SG",
  thailand:"TH",indonesia:"ID",japan:"JP",france:"FR",
  australia:"AU",italy:"IT",turkey:"TR",maldives:"MV",
};
const ROUTE_MAP = {
  goa:        { from:{code:"DEL",city:"New Delhi"}, to:{code:"GOI",city:"Goa"} },
  mumbai:     { from:{code:"DEL",city:"New Delhi"}, to:{code:"BOM",city:"Mumbai"} },
  delhi:      { from:{code:"BOM",city:"Mumbai"},    to:{code:"DEL",city:"New Delhi"} },
  bangalore:  { from:{code:"DEL",city:"New Delhi"}, to:{code:"BLR",city:"Bangalore"} },
  kochi:      { from:{code:"DEL",city:"New Delhi"}, to:{code:"COK",city:"Kochi"} },
  manali:     { from:{code:"DEL",city:"New Delhi"}, to:{code:"KUU",city:"Kullu-Manali"} },
  jaipur:     { from:{code:"BOM",city:"Mumbai"},    to:{code:"JAI",city:"Jaipur"} },
  hyderabad:  { from:{code:"DEL",city:"New Delhi"}, to:{code:"HYD",city:"Hyderabad"} },
  kolkata:    { from:{code:"DEL",city:"New Delhi"}, to:{code:"CCU",city:"Kolkata"} },
};
const BUDGET_OPTIONS = [
  { label: "Any",        max: 0 },
  { label: "Under ₹5k",  max: 5000 },
  { label: "Under ₹15k", max: 15000 },
  { label: "Under ₹30k", max: 30000 },
  { label: "Under ₹60k", max: 60000 },
];
const INPUT_TYPE_META = {
  filter: { icon:"🎛️", label:"Filter Search" },
  text:   { icon:"⌨️", label:"Text Search" },
  voice:  { icon:"🎙️", label:"Voice Search" },
  image:  { icon:"🖼️", label:"Image Search" },
  chat:   { icon:"💬", label:"AI Assistant" },
};

/* ── Pure helpers ──────────────────────────────────────────────── */
function norm(v) {
  return String(v||"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
}
function asINR(v) {
  const n = Number(v||0);
  if (!n) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}
function toYmd(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function inDays(n) {
  const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString();
}
async function postJson(url, payload) {
  const res = await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload),
  });
  const text = await res.text();
  let json={};
  try { json=JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(json?.error||`HTTP ${res.status}`);
  if (json?.error) throw new Error(json.error);
  return json;
}

/* ── Data parsers ──────────────────────────────────────────────── */
function parseFlights(data) {
  try {
    const raw = data?.Response?.Results ?? data?.Results ?? [];
    const outer = Array.isArray(raw)?raw:[raw];
    return outer.flatMap(r=>Array.isArray(r)?r:[r])
      .filter(r=>r&&(r.Segments||r.Fare))
      .slice(0,20)
      .map((r,idx)=>{
        const seg = r?.Segments?.[0]?.[0]??r?.Segments?.[0]??{};
        return {
          id:`${idx}-${seg?.Airline?.AirlineCode||"AI"}${seg?.Airline?.FlightNumber||""}`,
          airline:`${seg?.Airline?.AirlineCode||""}${seg?.Airline?.FlightNumber||""}`.trim()||"Flight",
          airlineName: seg?.Airline?.AirlineName || "",
          origin:seg?.Origin?.Airport?.AirportCode||"N/A",
          destination:seg?.Destination?.Airport?.AirportCode||"N/A",
          depTime:seg?.Origin?.DepTime ? new Date(seg.Origin.DepTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "--:--",
          arrTime:seg?.Destination?.ArrTime ? new Date(seg.Destination.ArrTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "--:--",
          fare:Number(r?.Fare?.PublishedFare||r?.Fare?.OfferedFare||r?.TotalFare||0),
          stops:Math.max(0,(r?.Segments?.[0]?.length||1)-1),
        };
      });
  } catch { return []; }
}
function parseHotelPrice(h) {
  for (const v of [h?.Price?.OfferedPrice,h?.Price?.PublishedPrice,h?.MinPrice,h?.TotalFare]) {
    const n=Number(v); if(Number.isFinite(n)&&n>0) return n;
  }
  return 0;
}

/* ── Build canonical search object (reads from storage) ────────── */
function resolveSearch() {
  const u = readUnified() ?? {};
  const smartQuery = (() => { try { return JSON.parse(localStorage.getItem("voyagehack.smartQuery")||"{}"); } catch{return{};} })();
  const smartResults = (() => { try { return JSON.parse(localStorage.getItem("voyagehack.smartResults")||"{}"); } catch{return{};} })();
  const flightPrefill = (() => { try { return JSON.parse(localStorage.getItem("voyagehack.flight.prefill")||"{}"); } catch{return{};} })();

  const destination = u.destination || smartQuery?.destination || smartResults?.intent?.destination || "Goa";
  const startDate = u.startDate || inDays(7);
  const endDate   = u.endDate   || inDays(10);
  const budgetMax = Number(u.budget?.maxValue||0)||Number(smartQuery?.budget?.maxValue||0)||Number(smartResults?.intent?.budget||0)||60000;
  const guests = {
    adults:  Math.max(1,Number(u.guests?.adults??1)),
    children:Math.max(0,Number(u.guests?.children??0)),
    infants: Math.max(0,Number(u.guests?.infants??0)),
  };

  return {
    inputType: u.inputType || "filter",
    query: u.query || smartQuery?.query || "",
    destination,
    destinationObject: u.destinationObject || {},
    fromCity: u.fromCity || flightPrefill?.from?.city || "",
    fromObj: u.fromObj || flightPrefill?.from || null,
    startDate,
    endDate,
    budgetMax,
    guests,
    selectedTypes: u.selectedTypes || [],
    intentService: u.intentService || "all",
    uploadedImage: u.uploadedImage || "",
    flightPrefill,
    smartResults,
  };
}

/* ═══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Pill({ children, color = "blue" }) {
  const cls = {
    blue:  "bg-blue-100 text-blue-700",
    pink:  "bg-pink-100 text-pink-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls[color]||cls.slate}`}>
      {children}
    </span>
  );
}

function Stars({ n }) {
  const full = Math.min(5,Math.round(n||0));
  return (
    <span className="text-amber-400 text-xs leading-none">
      {"★".repeat(full)}{"☆".repeat(5-full)}
    </span>
  );
}

/* SectionHeader: shows title + count. When expanded, shows "Show less ↑"
   instead of "View all →". Both toggle the expanded state. */
function SectionHeader({ title, count, expanded, onToggle, icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span>{icon}</span>{title}
        {count > 0 && <Pill color="slate">{count}</Pill>}
      </h2>
      {count > 4 && (
        <button
          onClick={onToggle}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-colors"
        >
          {expanded
            ? <>Show less <span className="group-hover:-translate-y-0.5 transition-transform inline-block">↑</span></>
            : <>View all {count} <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span></>
          }
        </button>
      )}
    </div>
  );
}

function FlightCard({ f }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 p-4 hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
            {f.airline.substring(0,2)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm leading-tight">{f.airline}</p>
            {f.airlineName && <p className="text-xs text-slate-500">{f.airlineName}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900 text-base">{asINR(f.fare)}</p>
          <p className="text-xs text-slate-400">per person</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="text-center">
          <p className="font-bold text-slate-900">{f.depTime}</p>
          <p className="text-xs text-slate-500">{f.origin}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 border-t border-dashed border-slate-300"/>
            <span className="text-slate-400">✈</span>
            <div className="flex-1 border-t border-dashed border-slate-300"/>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{f.stops===0?"Non-stop":`${f.stops} stop`}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-900">{f.arrTime}</p>
          <p className="text-xs text-slate-500">{f.destination}</p>
        </div>
      </div>
    </div>
  );
}

function HotelCard({ h }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-pink-50/30 p-4 hover:shadow-md hover:border-pink-200 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate leading-tight">{h.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <span>📍</span>{h.city}
          </p>
          {h.rating > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Stars n={h.rating} />
              <span className="text-xs text-slate-500">{h.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-slate-900 text-base">{asINR(h.price)}</p>
          <p className="text-xs text-slate-400">per night</p>
        </div>
      </div>
    </div>
  );
}

function CabCard({ c }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/30 p-4 hover:shadow-md hover:border-amber-200 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{c.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {c.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Stars n={c.rating}/> {c.rating.toFixed(1)}
              </span>
            )}
            {c.gender && <Pill color="slate">{c.gender}</Pill>}
            {c.experience > 0 && <span className="text-xs text-slate-500">{c.experience} yrs</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-slate-900 text-base">{asINR(c.fare)}</p>
          <p className="text-xs text-slate-400">estimated</p>
        </div>
      </div>
    </div>
  );
}

function CarCard({ c }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-green-50/30 p-4 hover:shadow-md hover:border-green-200 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{c.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Pill color="green">{c.category}</Pill>
            <span className="text-xs text-slate-500">👥 {c.seats} seats</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-slate-900 text-base">{asINR(c.fare)}</p>
          <p className="text-xs text-slate-400">/ day</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"/>
          <div className="h-3 bg-slate-100 rounded w-1/2"/>
        </div>
        <div className="h-5 bg-slate-200 rounded w-16"/>
      </div>
      <div className="h-3 bg-slate-100 rounded w-2/3"/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Results() {
  const navigate = useNavigate();

  /* filter state */
  const [filterBudgetIdx, setFilterBudgetIdx] = useState(null);
  const [filterAdults,    setFilterAdults]    = useState(null);
  const [filterService,   setFilterService]   = useState("all");
  const [sidebarOpen,     setSidebarOpen]     = useState(false);

  /* which tab is active */
  const [activeTab, setActiveTab] = useState("all");

  /* per-section "show all" expanded flags */
  const [expandedSections, setExpandedSections] = useState({
    flights: false,
    hotels: false,
    cabs: false,
    carrental: false,
  });

  /* loading / error / data */
  const [loadingMap, setLoadingMap] = useState({ flights:true, hotels:true, cabs:true, carrental:true });
  const [errorMap,   setErrorMap]   = useState({});
  const [results,    setResults]    = useState({
    flights:  { items:[], meta:{} },
    hotels:   { items:[], meta:{} },
    cabs:     { items:[], meta:{} },
    carrental:{ items:[], meta:{} },
  });

  const search = useMemo(resolveSearch, []); // eslint-disable-line

  const activeBudget = filterBudgetIdx !== null
    ? (BUDGET_OPTIONS[filterBudgetIdx].max || 999999)
    : search.budgetMax;
  const activeAdults = filterAdults ?? search.guests.adults;

  /* Helper: toggle a section between collapsed (4 items) and expanded (all items).
     Also switch the active tab to that section when expanding. */
  function toggleSection(key) {
    setExpandedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    // When expanding, switch the tab to that section so the user can scroll into full view
    if (!expandedSections[key]) {
      setActiveTab(key);
    }
  }

  useEffect(()=>{
    if (!localStorage.getItem("token")) navigate("/");
  },[navigate]);

  /* ── Fetch helpers ───────────────────────────────────────────── */
  const fetchFlights = useCallback(async () => {
    setLoadingMap(p=>({...p,flights:true}));
    setErrorMap(p=>({...p,flights:""}));
    try {
      const destKey = norm(search.destination).split(" ")[0];
      const fallback = { from:{code:"DEL",city:"New Delhi"}, to:{code:"BOM",city:"Mumbai"} };
      const resolvedFrom = (search.fromObj?.code)
        ? { code: search.fromObj.code, city: search.fromObj.city || search.fromCity }
        : (search.flightPrefill?.from?.code ? search.flightPrefill.from : null);
      const resolvedTo = (search.destinationObject?.code)
        ? { code: search.destinationObject.code, city: search.destinationObject.city || search.destination }
        : (search.flightPrefill?.to?.code ? search.flightPrefill.to : null);
      const route = (resolvedFrom && resolvedTo)
        ? { from: resolvedFrom, to: resolvedTo }
        : (ROUTE_MAP[destKey] || fallback);
      const data = await postJson(`${FLIGHTS_API}/search`,{
        EndUserIp:"122.160.30.1", TokenId:"",
        AdultCount:String(activeAdults),
        ChildCount:String(search.guests.children),
        InfantCount:String(search.guests.infants),
        DirectFlight:"false", OneStopFlight:"false", JourneyType:"1",
        PreferredAirlines:null,
        Segments:[{
          Origin:route.from.code, Destination:route.to.code,
          FlightCabinClass:"1",
          PreferredDepartureTime:`${toYmd(search.startDate)}T00:00:00`,
          PreferredArrivalTime:`${toYmd(search.startDate)}T00:00:00`,
        }],
        Sources:null,
      });
      const items = parseFlights(data);
      setResults(p=>({...p,flights:{items,meta:{from:route.from,to:route.to}}}));
    } catch(e) {
      setErrorMap(p=>({...p,flights:e.message||"Flights unavailable"}));
      setResults(p=>({...p,flights:{items:[],meta:{}}}));
    } finally {
      setLoadingMap(p=>({...p,flights:false}));
    }
  },[search, activeAdults]);

  const fetchHotels = useCallback(async () => {
    setLoadingMap(p=>({...p,hotels:true}));
    setErrorMap(p=>({...p,hotels:""}));
    try {
      const countryName = norm(search.destinationObject?.country||"india");
      const countryCode = COUNTRY_CODE_MAP[countryName]||"IN";
      const cityRes = await postJson(`${HOTELS_API}/cities`,{countryCode});
      const cities = Array.isArray(cityRes?.cities)?cityRes.cities:[];
      const match = cities.find(c=>norm(c.CityName).includes(norm(search.destination)));
      if (!match) throw new Error("City not found in hotel database");
      const hotelRes = await postJson(`${HOTELS_API}/search`,{
        CheckIn:toYmd(search.startDate), CheckOut:toYmd(search.endDate),
        HotelCodes:"", GuestNationality:countryCode,
        PaxRooms:[{
          Adults:activeAdults, Children:search.guests.children,
          ChildrenAges:search.guests.children>0?Array(search.guests.children).fill(8):[],
        }],
        ResponseTime:23, IsDetailedResponse:true,
        Filters:{ Refundable:false, NoOfRooms:1, MaxPrice:activeBudget||undefined },
        CityId:match.CityId, CountryCode:countryCode,
      });
      const list = Array.isArray(hotelRes?.HotelResult)?hotelRes.HotelResult:[];
      /* fetch ALL hotels (up to 50) — we'll slice client-side for the preview */
      const items = list.slice(0,50).map((h,idx)=>({
        id:h.HotelCode||idx, name:h.HotelName||"Hotel",
        city:h.CityName||search.destination,
        rating:Number(h.StarRating||0), price:parseHotelPrice(h),
      }));
      setResults(p=>({...p,hotels:{items,meta:{cityId:match.CityId,countryCode}}}));
    } catch(e) {
      const fallback = Array.isArray(search.smartResults?.realtime?.hotels?.items)
        ? search.smartResults.realtime.hotels.items.slice(0,20).map((h,idx)=>({
            id:h._id||idx, name:h.name||"Hotel", city:h.city||search.destination,
            rating:Number(h.rating||0), price:Number(h.price||0),
          }))
        : [];
      setResults(p=>({...p,hotels:{items:fallback,meta:{}}}));
      if (!fallback.length) setErrorMap(p=>({...p,hotels:e.message||"Hotels unavailable"}));
    } finally {
      setLoadingMap(p=>({...p,hotels:false}));
    }
  },[search, activeBudget, activeAdults]);

  const fetchCabs = useCallback(async () => {
    setLoadingMap(p=>({...p,cabs:true}));
    setErrorMap(p=>({...p,cabs:""}));
    try {
      const data = await postJson(SMART_API,{
        city:search.destination, budget:activeBudget||999999,
        persona:localStorage.getItem("persona")||"solo",
        userGender:JSON.parse(localStorage.getItem("user")||"{}").gender||"",
        travelTime:"10:00",
      });
      const drivers = Array.isArray(data?.drivers)?data.drivers:[];
      /* fetch all drivers */
      const items = drivers.slice(0,30).map((d,idx)=>({
        id:d._id||idx, name:d.name||"Driver",
        rating:Number(d.rating||0), experience:Number(d.experienceYears||0),
        gender:d.gender||"N/A",
        fare:Math.max(200,Math.round((activeBudget||5000)/20)+idx*40),
      }));
      setResults(p=>({...p,cabs:{items,meta:{safetyMode:data?.safetyMode||"normal"}}}));
    } catch(e) {
      const fallback = Array.isArray(search.smartResults?.realtime?.cabs?.items)
        ? search.smartResults.realtime.cabs.items.slice(0,20).map((d,idx)=>({
            id:d._id||idx, name:d.name||"Driver",
            rating:Number(d.rating||0), experience:Number(d.experienceYears||0),
            gender:d.gender||"N/A", fare:300+idx*50,
          }))
        : [];
      setResults(p=>({...p,cabs:{items:fallback,meta:{}}}));
      if (!fallback.length) setErrorMap(p=>({...p,cabs:e.message||"Cabs unavailable"}));
    } finally {
      setLoadingMap(p=>({...p,cabs:false}));
    }
  },[search, activeBudget]);

  const fetchCars = useCallback(async () => {
    setLoadingMap(p=>({...p,carrental:true}));
    const items = [
      {id:"swift",   name:"Maruti Swift",   category:"Hatchback",   seats:5, fare:1200},
      {id:"dzire",   name:"Maruti Dzire",   category:"Sedan",       seats:5, fare:1500},
      {id:"creta",   name:"Hyundai Creta",  category:"Compact SUV", seats:5, fare:2200},
      {id:"innova",  name:"Toyota Innova",  category:"SUV",         seats:7, fare:2500},
      {id:"ertiga",  name:"Maruti Ertiga",  category:"MPV",         seats:7, fare:1800},
      {id:"brezza",  name:"Maruti Brezza",  category:"Compact SUV", seats:5, fare:1900},
      {id:"nexon",   name:"Tata Nexon",     category:"Compact SUV", seats:5, fare:2000},
      {id:"baleno",  name:"Maruti Baleno",  category:"Hatchback",   seats:5, fare:1350},
      {id:"city",    name:"Honda City",     category:"Sedan",       seats:5, fare:1650},
      {id:"fortuner",name:"Toyota Fortuner",category:"SUV",         seats:7, fare:3200},
    ];
    setResults(p=>({...p,carrental:{items,meta:{city:search.destination}}}));
    setLoadingMap(p=>({...p,carrental:false}));
  },[search]);

  /* initial parallel fetch */
  useEffect(()=>{
    Promise.all([fetchFlights(),fetchHotels(),fetchCabs(),fetchCars()]).catch(()=>{});
  },[]); // eslint-disable-line

  /* ── Apply filters → re-fetch ────────────────────────────────── */
  function applyFilters() {
    /* collapse all sections back to preview when re-fetching */
    setExpandedSections({ flights:false, hotels:false, cabs:false, carrental:false });
    buildAndStore({
      ...search,
      budget:{ selectedBudget: filterBudgetIdx!==null ? BUDGET_OPTIONS[filterBudgetIdx].label : null, maxValue: activeBudget },
      guests:{ ...search.guests, adults: activeAdults },
      intentService: filterService,
    });
    setSidebarOpen(false);
    setActiveTab(filterService==="all"?"all":filterService);
    Promise.all([fetchFlights(),fetchHotels(),fetchCabs(),fetchCars()]).catch(()=>{});
  }

  /* ── Derived ─────────────────────────────────────────────────── */
  const isAnyLoading = Object.values(loadingMap).some(Boolean);
  const intentMeta = INPUT_TYPE_META[search.inputType] || INPUT_TYPE_META.filter;

  /* How many items to show per section: 4 in preview, all when expanded */
  function visibleItems(key) {
    const all = results[key].items;
    return expandedSections[key] ? all : all.slice(0, 4);
  }

  const TABS = [
    {id:"all",       label:"✨ All"},
    {id:"hotels",    label:`🏨 Hotels (${results.hotels.items.length})`},
    {id:"flights",   label:`✈️ Flights (${results.flights.items.length})`},
    {id:"cabs",      label:`🚖 Cabs (${results.cabs.items.length})`},
    {id:"carrental", label:`🚗 Rentals (${results.carrental.items.length})`},
  ];

  /* When a tab is clicked, also auto-expand that section (except "all") */
  function handleTabClick(tabId) {
    setActiveTab(tabId);
    if (tabId !== "all") {
      setExpandedSections(prev => ({ ...prev, [tabId]: true }));
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar user={JSON.parse(localStorage.getItem("user")||"{}")} />

      {/* ── Summary banner ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">{intentMeta.icon}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">
                    {search.fromCity ? (
                      <span>{search.fromCity} <span className="text-orange-500 mx-1">→</span> {search.destination}</span>
                    ) : search.destination}
                  </h1>
                  <Pill color="blue">{intentMeta.label}</Pill>
                  {search.intentService!=="all" && <Pill color="pink">🎯 {search.intentService}</Pill>}
                  {isAnyLoading && <Pill color="amber">⟳ Loading…</Pill>}
                </div>
                <p className="text-sm text-slate-500">
                  {fmtDate(search.startDate)} → {fmtDate(search.endDate)} ·{" "}
                  {activeAdults} adult{activeAdults!==1?"s":""}
                  {search.guests.children>0?` · ${search.guests.children} child`:""}
                  {activeBudget&&activeBudget<999999?` · Budget ${asINR(activeBudget)}`:""}
                </p>
                {search.query && search.inputType!=="filter" && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">
                    "{search.query.length>60?search.query.slice(0,60)+"…":search.query}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {search.uploadedImage && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                  <img src={search.uploadedImage} alt="Query" className="w-full h-full object-cover"/>
                </div>
              )}
              <button
                onClick={()=>setSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                🎛️ Filters
              </button>
              <button
                onClick={()=>navigate("/search")}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                ✏️ New Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky tabs ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {TABS.map(t=>(
              <button
                key={t.id}
                onClick={()=>handleTabClick(t.id)}
                className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab===t.id
                    ?"text-indigo-700 border-indigo-600 bg-indigo-50"
                    :"text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {t.label}
                {loadingMap[t.id] && t.id!=="all" && (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── FLIGHTS ── */}
        {(activeTab==="all"||activeTab==="flights") && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <SectionHeader
              icon="✈️"
              title="Flights"
              count={results.flights.items.length}
              expanded={expandedSections.flights}
              onToggle={()=>toggleSection("flights")}
            />
            {/* route label */}
            {results.flights.meta?.from && (
              <p className="text-xs text-slate-400 mb-3 -mt-2">
                {results.flights.meta.from.city} ({results.flights.meta.from.code}) → {results.flights.meta.to?.city} ({results.flights.meta.to?.code})
              </p>
            )}
            {errorMap.flights && (
              <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ {errorMap.flights}
              </div>
            )}
            {loadingMap.flights ? (
              <div className="grid md:grid-cols-2 gap-3">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  {visibleItems("flights").map(f=><FlightCard key={f.id} f={f}/>)}
                  {results.flights.items.length===0 && !errorMap.flights && (
                    <p className="text-slate-500 text-sm col-span-2 py-4 text-center">No flights found for this route.</p>
                  )}
                </div>
                {/* inline expand / collapse button at the bottom */}
                {results.flights.items.length > 4 && (
                  <button
                    onClick={()=>toggleSection("flights")}
                    className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedSections.flights
                      ? <>↑ Show fewer flights</>
                      : <>View all {results.flights.items.length} flights →</>}
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* ── HOTELS ── */}
        {(activeTab==="all"||activeTab==="hotels") && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <SectionHeader
              icon="🏨"
              title="Hotels"
              count={results.hotels.items.length}
              expanded={expandedSections.hotels}
              onToggle={()=>toggleSection("hotels")}
            />
            {/* destination label */}
            <p className="text-xs text-slate-400 mb-3 -mt-2">
              📍 {search.destination}{search.guests.children>0?` · ${activeAdults} adults, ${search.guests.children} children`:` · ${activeAdults} adult${activeAdults!==1?"s":""}`}
            </p>
            {errorMap.hotels && (
              <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ {errorMap.hotels}
              </div>
            )}
            {loadingMap.hotels ? (
              <div className="grid md:grid-cols-2 gap-3">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  {visibleItems("hotels").map(h=><HotelCard key={h.id} h={h}/>)}
                  {results.hotels.items.length===0 && !errorMap.hotels && (
                    <p className="text-slate-500 text-sm col-span-2 py-4 text-center">No hotels found for this destination.</p>
                  )}
                </div>
                {results.hotels.items.length > 4 && (
                  <button
                    onClick={()=>toggleSection("hotels")}
                    className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedSections.hotels
                      ? <>↑ Show fewer hotels</>
                      : <>View all {results.hotels.items.length} hotels in {search.destination} →</>}
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* ── CABS ── */}
        {(activeTab==="all"||activeTab==="cabs") && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <SectionHeader
              icon="🚖"
              title="Cabs"
              count={results.cabs.items.length}
              expanded={expandedSections.cabs}
              onToggle={()=>toggleSection("cabs")}
            />
            <p className="text-xs text-slate-400 mb-3 -mt-2">
              📍 Available in {search.destination}
            </p>
            {errorMap.cabs && (
              <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ {errorMap.cabs}
              </div>
            )}
            {loadingMap.cabs ? (
              <div className="grid md:grid-cols-2 gap-3">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  {visibleItems("cabs").map(c=><CabCard key={c.id} c={c}/>)}
                  {results.cabs.items.length===0 && !errorMap.cabs && (
                    <p className="text-slate-500 text-sm col-span-2 py-4 text-center">No cabs found for this area.</p>
                  )}
                </div>
                {results.cabs.items.length > 4 && (
                  <button
                    onClick={()=>toggleSection("cabs")}
                    className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedSections.cabs
                      ? <>↑ Show fewer cabs</>
                      : <>View all {results.cabs.items.length} cabs →</>}
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* ── CAR RENTAL ── */}
        {(activeTab==="all"||activeTab==="carrental") && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <SectionHeader
              icon="🚗"
              title="Car Rentals"
              count={results.carrental.items.length}
              expanded={expandedSections.carrental}
              onToggle={()=>toggleSection("carrental")}
            />
            <p className="text-xs text-slate-400 mb-3 -mt-2">
              📍 Self-drive rentals in {search.destination}
            </p>
            {loadingMap.carrental ? (
              <div className="grid md:grid-cols-2 gap-3">{[0,1,2].map(i=><SkeletonCard key={i}/>)}</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  {visibleItems("carrental").map(c=><CarCard key={c.id} c={c}/>)}
                </div>
                {results.carrental.items.length > 4 && (
                  <button
                    onClick={()=>toggleSection("carrental")}
                    className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedSections.carrental
                      ? <>↑ Show fewer cars</>
                      : <>View all {results.carrental.items.length} cars →</>}
                  </button>
                )}
              </>
            )}
          </section>
        )}

      </div>

      {/* ══ Filter slide-over ══════════════════════════════════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={()=>setSidebarOpen(false)}/>
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
            {/* header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={()=>setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >✕</button>
            </div>

            <div className="flex-1 p-5 space-y-7">
              {/* Service type */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Show results for</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {id:"all",       label:"✨ All"},
                    {id:"hotels",    label:"🏨 Hotels"},
                    {id:"flights",   label:"✈️ Flights"},
                    {id:"cabs",      label:"🚖 Cabs"},
                    {id:"carrental", label:"🚗 Car Rental"},
                  ].map(s=>(
                    <button
                      key={s.id}
                      onClick={()=>setFilterService(s.id)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                        filterService===s.id
                          ?"bg-indigo-600 text-white shadow-md"
                          :"bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Budget (total trip)</p>
                <div className="space-y-2">
                  {BUDGET_OPTIONS.map((b,i)=>(
                    <button
                      key={i}
                      onClick={()=>setFilterBudgetIdx(i===0?null:i)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left flex items-center justify-between transition-colors ${
                        (i===0&&filterBudgetIdx===null)||(i===filterBudgetIdx)
                          ?"bg-indigo-600 text-white shadow-md"
                          :"bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{b.label}</span>
                      {b.max>0 && <span className="opacity-70 text-xs">{asINR(b.max)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adults */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Adults</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={()=>setFilterAdults(a=>Math.max(1,(a??search.guests.adults)-1))}
                    className="w-10 h-10 rounded-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg font-bold transition-colors"
                  >−</button>
                  <span className="w-8 text-center text-xl font-bold text-slate-900">
                    {filterAdults??search.guests.adults}
                  </span>
                  <button
                    onClick={()=>setFilterAdults(a=>(a??search.guests.adults)+1)}
                    className="w-10 h-10 rounded-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg font-bold transition-colors"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t border-slate-200 space-y-2 bg-slate-50">
              <button
                onClick={applyFilters}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Apply Filters & Search
              </button>
              <button
                onClick={()=>{setFilterBudgetIdx(null);setFilterAdults(null);setFilterService("all");}}
                className="w-full py-2.5 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
