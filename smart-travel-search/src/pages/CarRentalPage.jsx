import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ServiceNav from "../components/ServiceNav";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CITIES = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Goa", "Jaipur", "Chandigarh"];

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

function toYmd(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function toTitleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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
    const partial = Object.keys(CITY_TO_IATA).find((cityKey) => candidate.includes(cityKey));
    if (partial) return partial;
    return candidate;
  }

  const embedded = Object.keys(CITY_TO_IATA).find((cityKey) => lowered.includes(cityKey));
  return embedded || raw;
}

function getIataForCity(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z]{3}$/.test(raw)) return raw.toUpperCase();
  return CITY_TO_IATA[raw.toLowerCase()] || "";
}

function parseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function mapAmadeusRentals(items, city, pickupDate, dropoffDate) {
  const days = Math.max(1, Math.round((new Date(dropoffDate) - new Date(pickupDate)) / 86400000));
  return (Array.isArray(items) ? items : []).map((item, idx) => {
    const quote = item?.quotes?.[0] || {};
    const vehicle = item?.vehicle || {};
    const provider = item?.provider || {};

    const totalAmount = parseAmount(quote?.price?.total || quote?.estimatedTotal || item?.price?.total || 0);
    const perDay = days > 0 ? Math.round(totalAmount / days) : totalAmount;

    return {
      id: item?.id || `${provider?.companyCode || "provider"}-${vehicle?.acrissCode || "car"}-${idx}`,
      company: provider?.companyName || provider?.companyCode || "Provider",
      pickupCity: city,
      days,
      finalPrice: Math.max(0, Math.round(totalAmount)),
      deposited: 0,
      fuelPolicy: quote?.policies?.fuelPolicy || "As per provider policy",
      kmIncluded: Number(quote?.mileage?.includedDistance || 0),
      extraKmCharge: parseAmount(quote?.mileage?.extraDistanceRate || 0),
      currency: quote?.price?.currency || "USD",
      image: "CAR",
      car: {
        name: vehicle?.description || vehicle?.model || "Rental Car",
        category: vehicle?.category || vehicle?.type || "Standard",
        seats: Number(vehicle?.seats || vehicle?.passengers || 4),
        fuel: vehicle?.fuel || "Not specified",
        transmission: vehicle?.transmission || "Automatic",
        ac: Boolean(vehicle?.airConditioning ?? true),
        pricePerDay: Math.max(0, perDay),
        mileage: vehicle?.mileage || "N/A",
        features: [
          vehicle?.acrissCode ? `ACRISS ${vehicle.acrissCode}` : null,
          vehicle?.airConditioning ? "Air Conditioning" : null,
          vehicle?.transmission || null,
        ].filter(Boolean),
      },
    };
  });
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cr-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#fdf4ff;min-height:100vh;display:flex;flex-direction:column}
.cr-hdr{display:flex;align-items:center;justify-content:space-between;padding:0 clamp(16px,3%,40px);background:#fff;border-bottom:1px solid #f0f0f0;min-height:72px;gap:12px;flex-shrink:0}
.cr-logo{display:flex;align-items:center;flex-shrink:0}
.cr-logo-img{height:58px;width:auto;object-fit:contain;display:block}
.cr-hdr-right{display:flex;align-items:center;gap:12px;margin-left:auto}
.cr-back-btn{background:#fff;border:1px solid #f0f0f0;color:#444;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .2s}
.cr-back-btn:hover{background:#fff5f0;color:#ff6600;border-color:#ffd8bf}

.cr-content{flex:1;padding:20px 28px 40px}
.cr-err{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:13px 16px;display:flex;gap:10px;margin-bottom:14px}
.cr-err-txt{font-size:.8rem;color:#7f1d1d;flex:1}
.cr-err-x{background:#e53e3e;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit}

.cr-sbox{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(109,40,217,.09),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(109,40,217,.08);margin-bottom:20px}
.cr-srow{display:flex;align-items:flex-end;padding:18px;gap:10px;flex-wrap:wrap}
.cr-f{display:flex;flex-direction:column;gap:4px;flex:1;min-width:150px}
.cr-f.dt{flex:0 0 155px}
.cr-lbl{font-size:.58rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px}
.cr-fin{display:flex;align-items:center;gap:8px;background:#faf5ff;border:1.5px solid #e9d5ff;border-radius:10px;padding:9px 12px;transition:all .2s;min-height:46px;cursor:pointer}
.cr-fin:hover,.cr-fin:focus-within{border-color:#7c3aed;background:#f3e8ff}
.cr-fic{color:#7c3aed;flex-shrink:0}
.cr-fic svg{width:17px;height:17px}
.cr-finput{border:none;outline:none;background:transparent;font-size:.86rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.cr-finput::placeholder{color:#a0aec0}
.cr-sbtn{flex-shrink:0;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border:none;border-radius:12px;padding:0 26px;height:46px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(109,40,217,.35);white-space:nowrap}
.cr-sbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(109,40,217,.45)}
.cr-sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.cr-sbtn svg{width:16px;height:16px}

.cr-filters{display:flex;gap:8px;flex-wrap:wrap;padding:0 18px 14px;border-top:1px solid #faf5ff;padding-top:12px}
.cr-chip{padding:6px 14px;border-radius:20px;border:1.5px solid #e9d5ff;background:#fff;cursor:pointer;font-size:.72rem;font-weight:600;color:#7c3aed;font-family:inherit;transition:all .2s}
.cr-chip.act{background:#7c3aed;color:#fff;border-color:#7c3aed}
.cr-chip:hover:not(.act){background:#f3e8ff}

.cr-results-hdr{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;flex-wrap:wrap;gap:8px}
.cr-results-title{font-size:1rem;font-weight:700;color:#1e293b}
.cr-results-sub{font-size:.75rem;color:#64748b;margin-top:2px}
.cr-sort{display:flex;gap:6px}
.cr-sort-btn{padding:5px 12px;border-radius:20px;border:1.5px solid #e9d5ff;background:#fff;cursor:pointer;font-size:.7rem;font-weight:600;color:#7c3aed;font-family:inherit;transition:all .2s}
.cr-sort-btn.act{background:#7c3aed;color:#fff;border-color:#7c3aed}

.cr-card{background:#fff;border-radius:16px;border:1.5px solid #e9d5ff;box-shadow:0 2px 10px rgba(109,40,217,.06);margin-bottom:14px;overflow:hidden;transition:all .2s}
.cr-card:hover{box-shadow:0 6px 24px rgba(109,40,217,.14);border-color:#c4b5fd;transform:translateY(-1px)}
.cr-card-top{padding:18px 20px;display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}
.cr-car-img{width:110px;height:80px;border-radius:12px;background:linear-gradient(135deg,#f3e8ff,#ede9fe);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;flex-shrink:0;color:#6d28d9}
.cr-car-info{flex:1;min-width:200px}
.cr-car-name{font-size:1rem;font-weight:800;color:#1e293b;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cr-car-company{font-size:.68rem;font-weight:600;background:#f3e8ff;color:#7c3aed;padding:2px 9px;border-radius:10px}
.cr-car-cat{font-size:.72rem;color:#94a3b8;margin-top:3px}
.cr-car-specs{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.cr-spec{font-size:.7rem;color:#64748b;display:flex;align-items:center;gap:4px}
.cr-car-features{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.cr-feature{font-size:.62rem;background:#faf5ff;color:#7c3aed;padding:2px 8px;border-radius:8px;font-weight:600}
.cr-price-block{text-align:right;flex-shrink:0}
.cr-ppd{font-size:.7rem;color:#94a3b8}
.cr-price{font-size:1.5rem;font-weight:800;color:#6d28d9}
.cr-price-days{font-size:.7rem;color:#94a3b8}
.cr-deposit{font-size:.66rem;color:#94a3b8;margin-top:1px}

.cr-card-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#faf5ff;border-top:1px solid #ede9fe;flex-wrap:wrap;gap:10px}
.cr-policy-tags{display:flex;gap:7px;flex-wrap:wrap}
.cr-ptag{font-size:.64rem;font-weight:600;background:#fff;border:1px solid #e9d5ff;color:#64748b;padding:3px 9px;border-radius:8px}
.cr-book-btn{background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border:none;border-radius:8px;padding:8px 24px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(109,40,217,.3);transition:all .2s;white-space:nowrap}
.cr-book-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(109,40,217,.4)}

.cr-loading{display:flex;align-items:center;gap:12px;padding:40px;justify-content:center;color:#64748b;font-size:.86rem}
.cr-spin{width:24px;height:24px;border:3px solid #e9d5ff;border-top-color:#7c3aed;border-radius:50%;animation:cr-spin .8s linear infinite}
@keyframes cr-spin{to{transform:rotate(360deg)}}

.cr-empty{text-align:center;padding:60px 20px}
.cr-empty-icon{font-size:2rem;margin-bottom:16px}
.cr-empty-title{font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:8px}
.cr-empty-sub{font-size:.82rem;color:#94a3b8}

.cr-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.cr-modal{background:#fff;border-radius:20px;padding:28px;max-width:450px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.cr-modal-title{font-size:1.1rem;font-weight:800;color:#1e293b;margin-bottom:20px}
.cr-modal-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #faf5ff;font-size:.82rem}
.cr-modal-row:last-of-type{border-bottom:none}
.cr-modal-key{color:#64748b;font-weight:500}
.cr-modal-val{color:#1e293b;font-weight:700;text-align:right;max-width:240px}
.cr-modal-btns{display:flex;gap:10px;margin-top:20px}
.cr-modal-cancel{flex:1;background:#faf5ff;border:1.5px solid #e9d5ff;color:#7c3aed;border-radius:10px;padding:10px;font-weight:600;cursor:pointer;font-family:inherit;font-size:.82rem}
.cr-modal-confirm{flex:1;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.82rem;box-shadow:0 4px 14px rgba(109,40,217,.35);transition:all .2s}

@media(max-width:768px){
  .cr-hdr{padding:0 12px;min-height:64px}
  .cr-logo-img{height:50px}
  .cr-content{padding:14px 12px 30px}
  .cr-card-top{gap:10px}
  .cr-price-block{text-align:left;width:100%}
  .cr-car-img{width:80px;height:60px;font-size:1rem}
}
`;

const CATEGORIES = ["All", "Hatchback", "Sedan", "Compact SUV", "SUV", "Premium SUV", "MPV", "Off-road 4x4", "Standard"];

export default function CarRentalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [city, setCity] = useState("");
  const [pickup, setPickup] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [category, setCategory] = useState("All");
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [sortBy, setSortBy] = useState("price-asc");

  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [pickupLocationCode, setPickupLocationCode] = useState("");
  const [bookingRental, setBookingRental] = useState(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    let shouldAutoSearch = false;
    let nextCity = "";
    let nextPickup = today;
    let nextReturn = tomorrow;

    try {
      const smart = JSON.parse(localStorage.getItem("voyagehack.smartQuery") || "{}");
      const unified = JSON.parse(localStorage.getItem("voyagehack.unifiedSearch") || "{}");
      const prefill = JSON.parse(localStorage.getItem("voyagehack.carrental.prefill") || "{}");
      const query = new URLSearchParams(location.search);

      const routeDestination = params?.destination || "";
      const stateDestination = location?.state?.destination || location?.state?.city || "";
      const searchText = stateDestination
        || routeDestination
        || query.get("destination")
        || query.get("city")
        || prefill.city
        || smart.destination
        || unified.destination
        || unified.toCity
        || smart.query
        || unified.query
        || "";

      const cityCandidate = extractCityFromText(searchText);
      nextCity = toTitleCase(cityCandidate || "");
      if (nextCity) {
        setCity(nextCity);
        shouldAutoSearch = true;
      }

      const prefBudget = Number(prefill.budget || unified?.budget?.maxValue || smart.budget || 0);
      if (prefBudget > 0) setBudgetLimit(prefBudget);

      const resolvedPickup = toYmd(prefill.pickupDate || smart.startDate || unified.startDate);
      const resolvedReturn = toYmd(prefill.returnDate || smart.endDate || unified.endDate);

      if (resolvedPickup) {
        nextPickup = resolvedPickup;
        setPickup(resolvedPickup);
      }
      if (resolvedReturn) {
        nextReturn = resolvedReturn;
        setReturnDate(resolvedReturn);
      }
    } catch {
      // Ignore malformed storage.
    }

    if (shouldAutoSearch) {
      setTimeout(() => {
        handleSearch({
          cityOverride: nextCity,
          pickupOverride: nextPickup,
          returnOverride: nextReturn,
        });
      }, 0);
    }
  }, []);

  async function handleSearch({ cityOverride, pickupOverride, returnOverride } = {}) {
    const finalCity = String(cityOverride || city || "").trim();
    const finalPickup = pickupOverride || pickup || today;
    const finalReturn = returnOverride || returnDate || tomorrow;

    if (!finalCity) {
      setError("Please enter a city for car rental.");
      return;
    }
    if (new Date(finalReturn) <= new Date(finalPickup)) {
      setError("Return date must be after pickup date.");
      return;
    }

    const iata = getIataForCity(finalCity);
    if (!iata) {
      setError("Unsupported city. Try Delhi, Mumbai, Jaipur, Goa, Bangalore, Chennai, Kolkata, Hyderabad, Pune, or Chandigarh.");
      return;
    }

    setCity(finalCity);
    setPickup(finalPickup);
    setReturnDate(finalReturn);
    setPickupLocationCode(iata);

    setError(null);
    setSearched(true);
    setLoading(true);
    setRentals([]);

    try {
      const rentalRes = await fetch(`${API_BASE}/api/car-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: finalCity,
          pickupLocationCode: iata,
          pickupDate: finalPickup || today,
          dropoffDate: finalReturn || tomorrow,
          text: finalCity,
        }),
      });
      const rentalData = await rentalRes.json().catch(() => ({}));

      if (!rentalRes.ok) {
        const detail = rentalData?.message || rentalData?.error?.errors?.[0]?.detail || "Failed to fetch car rentals";
        throw new Error(detail);
      }

      const list = mapAmadeusRentals(rentalData?.data || [], finalCity, finalPickup, finalReturn);
      setRentals(list);
    } catch (e) {
      setRentals([]);
      const isNetworkIssue = e instanceof TypeError;
      setError(
        isNetworkIssue
          ? `Failed to fetch: backend is unreachable at ${API_BASE}. Start backend and verify CORS_ORIGINS.`
          : (e?.message || "Failed to fetch car rentals.")
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmBook() {
    setBookingRental(null);
    setBooked(true);
    setTimeout(() => setBooked(false), 4000);
  }

  const displayed = rentals
    .filter((r) => (category === "All" || r.car.category === category) && (!budgetLimit || r.finalPrice <= budgetLimit))
    .sort((a, b) => (sortBy === "price-desc" ? b.finalPrice - a.finalPrice : a.finalPrice - b.finalPrice));

  return (
    <>
      <style>{css}</style>
      <div className="cr-wrap">
        <header className="cr-hdr">
          <div className="cr-logo" aria-label="tbo.com">
            <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com" className="cr-logo-img" />
          </div>
          <div className="cr-hdr-right">
            <button className="cr-back-btn" onClick={() => navigate("/searchsection")}>Home</button>
          </div>
        </header>

        <ServiceNav />

        <div className="cr-content">
          {error && (
            <div className="cr-err">
              <span className="cr-err-txt">{error}</span>
              <button className="cr-err-x" onClick={() => setError(null)}>X</button>
            </div>
          )}

          {booked && (
            <div style={{ background: "#f3e8ff", border: "1.5px solid #c4b5fd", borderRadius: 12, padding: "12px 18px", marginBottom: 14, fontSize: ".84rem", fontWeight: 600, color: "#3b0764" }}>
              Car rental confirmed! Check your email for details and pickup instructions.
            </div>
          )}

          <div className="cr-sbox">
            <div className="cr-srow">
              <div className="cr-f">
                <div className="cr-lbl">PICKUP CITY</div>
                <div className="cr-fin">
                  <div className="cr-fic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                    </svg>
                  </div>
                  <input className="cr-finput" placeholder="Enter city (e.g. Mumbai)" value={city} onChange={(e) => setCity(e.target.value)} list="cr-cities" />
                  <datalist id="cr-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
              </div>

              <div className="cr-f dt">
                <div className="cr-lbl">PICKUP DATE</div>
                <div className="cr-fin">
                  <div className="cr-fic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <input type="date" className="cr-finput" value={pickup} min={today} onChange={(e) => setPickup(e.target.value)} />
                </div>
              </div>

              <div className="cr-f dt">
                <div className="cr-lbl">RETURN DATE</div>
                <div className="cr-fin">
                  <div className="cr-fic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <input type="date" className="cr-finput" value={returnDate} min={pickup || today} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              </div>

              <button className="cr-sbtn" onClick={() => handleSearch()} disabled={loading}>
                {loading ? <><div className="cr-spin" />Searching...</> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> Search Cars</>}
              </button>
            </div>

            {searched && (
              <div className="cr-filters">
                <div className="cr-lbl" style={{ alignSelf: "center", marginRight: 4 }}>CATEGORY:</div>
                {CATEGORIES.map((c) => (
                  <button key={c} className={`cr-chip${category === c ? " act" : ""}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {loading && <div className="cr-loading"><div className="cr-spin" />Finding cars in {city}...</div>}

          {!loading && searched && (
            <div>
              <div className="cr-results-hdr">
                <div>
                  <div className="cr-results-title">{displayed.length} cars available in {city}</div>
                  <div className="cr-results-sub">
                    {pickup} to {returnDate} · {Math.max(1, Math.round((new Date(returnDate) - new Date(pickup)) / 86400000))} day{Math.max(1, Math.round((new Date(returnDate) - new Date(pickup)) / 86400000)) !== 1 ? "s" : ""} · {pickupLocationCode}
                  </div>
                </div>
                <div className="cr-sort">
                  <button className={`cr-sort-btn${sortBy === "price-asc" ? " act" : ""}`} onClick={() => setSortBy("price-asc")}>Price: Low to High</button>
                  <button className={`cr-sort-btn${sortBy === "price-desc" ? " act" : ""}`} onClick={() => setSortBy("price-desc")}>Price: High to Low</button>
                </div>
              </div>

              {displayed.map((r) => (
                <div key={r.id} className="cr-card">
                  <div className="cr-card-top">
                    <div className="cr-car-img">{r.image || "CAR"}</div>
                    <div className="cr-car-info">
                      <div className="cr-car-name">
                        {r.car.name}
                        <span className="cr-car-company">{r.company}</span>
                      </div>
                      <div className="cr-car-cat">{r.car.category} · {r.car.seats} Seats</div>
                      <div className="cr-car-specs">
                        <span className="cr-spec">Fuel: {r.car.fuel}</span>
                        <span className="cr-spec">Transmission: {r.car.transmission}</span>
                        {r.car.ac && <span className="cr-spec">AC</span>}
                        <span className="cr-spec">Mileage: {r.car.mileage}</span>
                      </div>
                      <div className="cr-car-features">
                        {r.car.features.map((f) => <span key={f} className="cr-feature">{f}</span>)}
                      </div>
                    </div>
                    <div className="cr-price-block">
                      <div className="cr-ppd">{r.currency} {r.car.pricePerDay.toLocaleString("en-IN")}/day</div>
                      <div className="cr-price">{r.currency} {r.finalPrice.toLocaleString("en-IN")}</div>
                      <div className="cr-price-days">for {r.days} day{r.days !== 1 ? "s" : ""} · all incl.</div>
                      <div className="cr-deposit">Deposit: {r.currency} {r.deposited.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="cr-card-footer">
                    <div className="cr-policy-tags">
                      <span className="cr-ptag">Fuel Policy: {r.fuelPolicy}</span>
                      <span className="cr-ptag">{r.kmIncluded} km included</span>
                      <span className="cr-ptag">Location: {r.pickupCity}</span>
                      <span className="cr-ptag">+{r.currency} {r.extraKmCharge}/km extra</span>
                    </div>
                    <button className="cr-book-btn" onClick={() => setBookingRental(r)}>
                      Book Now · {r.currency} {r.finalPrice.toLocaleString("en-IN")}
                    </button>
                  </div>
                </div>
              ))}

              {displayed.length === 0 && (
                <div className="cr-empty">
                  <div className="cr-empty-icon">CAR</div>
                  <div className="cr-empty-title">No cars available for this location</div>
                  <div className="cr-empty-sub">Try a different city, category, budget, or dates.</div>
                </div>
              )}
            </div>
          )}

          {!searched && !loading && (
            <div className="cr-empty">
              <div className="cr-empty-icon">CAR</div>
              <div className="cr-empty-title">Self-Drive Car Rental</div>
              <div className="cr-empty-sub">Choose a city and dates to find self-drive rental cars.</div>
            </div>
          )}
        </div>

        {bookingRental && (
          <div className="cr-modal-bg" onClick={() => setBookingRental(null)}>
            <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cr-modal-title">Confirm Car Rental</div>
              {[
                ["Vehicle", `${bookingRental.car.name} (${bookingRental.car.category})`],
                ["Provider", bookingRental.company],
                ["Pickup City", bookingRental.pickupCity],
                ["Pickup Date", pickup],
                ["Return Date", returnDate],
                ["Duration", `${bookingRental.days} day${bookingRental.days !== 1 ? "s" : ""}`],
                ["Km Included", `${bookingRental.kmIncluded} km`],
                ["Fuel Policy", bookingRental.fuelPolicy],
                ["Security Deposit", `${bookingRental.currency} ${bookingRental.deposited.toLocaleString("en-IN")} (refundable)`],
                ["Total Amount", `${bookingRental.currency} ${bookingRental.finalPrice.toLocaleString("en-IN")}`],
              ].map(([k, v]) => (
                <div key={k} className="cr-modal-row"><span className="cr-modal-key">{k}</span><span className="cr-modal-val">{v}</span></div>
              ))}
              <div className="cr-modal-btns">
                <button className="cr-modal-cancel" onClick={() => setBookingRental(null)}>Cancel</button>
                <button className="cr-modal-confirm" onClick={confirmBook}>Confirm Booking</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

