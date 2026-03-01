import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceNav from "../components/ServiceNav";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SMART_SEARCH_API = `${API_ORIGIN}/api/search`;

/* ── Mock cab data ── */
const CITIES = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Goa"];
const CAB_TYPES = [
  { id: "sedan", name: "Sedan", icon: "🚗", desc: "AC · 4 Seats · Comfortable", rating: 4.5, baseKm: 12, pricePerKm: 13, minFare: 200, surgeHours: [8,9,17,18,19] },
  { id: "suv", name: "SUV", icon: "🚙", desc: "AC · 6 Seats · Spacious", rating: 4.6, baseKm: 12, pricePerKm: 18, minFare: 350, surgeHours: [8,9,17,18,19] },
  { id: "auto", name: "Auto Rickshaw", icon: "🛺", desc: "3 Seats · Economy", rating: 4.2, baseKm: 10, pricePerKm: 8, minFare: 50, surgeHours: [] },
  { id: "prime", name: "Prime Sedan", icon: "🚘", desc: "AC · 4 Seats · Premium", rating: 4.8, baseKm: 12, pricePerKm: 22, minFare: 300, surgeHours: [8,9,17,18,19] },
  { id: "xl", name: "SUV XL", icon: "🚐", desc: "AC · 8 Seats · Family", rating: 4.7, baseKm: 12, pricePerKm: 25, minFare: 500, surgeHours: [8,9] },
  { id: "bike", name: "Bike Taxi", icon: "🏍️", desc: "1 Seat · Quick", rating: 4.3, baseKm: 5, pricePerKm: 5, minFare: 30, surgeHours: [] },
];

const CAB_PROVIDERS = [
  { name: "Ola", logo: "🟡", color: "#2b7219" },
  { name: "Uber", logo: "⚫", color: "#000" },
  { name: "Rapido", logo: "🟠", color: "#e03e0e" },
  { name: "Meru", logo: "🔵", color: "#1565c0" },
];

function generateCabs(pickup, drop, date, time, cabType) {
  const distKm = 5 + Math.floor(Math.random() * 30);
  const hour = time ? parseInt(time.split(":")[0]) : new Date().getHours();
  return CAB_TYPES.filter(c => !cabType || c.id === cabType).flatMap(cat => {
    const isSurge = cat.surgeHours.includes(hour);
    return CAB_PROVIDERS.slice(0, 3 + Math.floor(Math.random() * 2)).map(prov => {
      const fare = Math.max(cat.minFare, Math.round(cat.pricePerKm * distKm * (isSurge ? 1.3 : 1)));
      const eta = 3 + Math.floor(Math.random() * 12);
      return {
        id: `${cat.id}-${prov.name}-${Math.random().toString(36).slice(2,7)}`,
        type: cat,
        provider: prov,
        fare,
        distKm,
        eta,
        isSurge,
        driverName: ["Ramesh K.", "Suresh M.", "Priya S.", "Anil T.", "Kavya R.", "Neha P.", "Pooja N."][Math.floor(Math.random() * 7)],
        driverGender: Math.random() > 0.55 ? "male" : "female",
        driverRating: (4.1 + Math.random() * 0.9).toFixed(1),
        yearsExperience: 1 + Math.floor(Math.random() * 14),
        carModel: cat.id === "bike" ? "Honda Activa" : cat.id === "auto" ? "Bajaj RE" : cat.id === "suv" ? "Toyota Innova" : cat.id === "xl" ? "Force Urbania" : "Maruti Dzire",
        plateNo: `DL ${10 + Math.floor(Math.random() * 90)} AB ${1000 + Math.floor(Math.random() * 9000)}`,
        acAvailable: cat.id !== "bike" && cat.id !== "auto",
        features: [
          cat.id !== "bike" ? "📡 Live Tracking" : null,
          cat.acAvailable ? "❄️ AC" : null,
          "💳 All Payments",
          isSurge ? null : "💰 Best Price",
        ].filter(Boolean),
      };
    });
  });
}

function isNightHour(timeValue) {
  const hour = Number(String(timeValue || "00:00").split(":")[0]);
  return Number.isFinite(hour) && (hour >= 20 || hour < 5);
}

function applyCabSafetyRules(cabs, { persona, travelerGender, time }) {
  if (!Array.isArray(cabs)) return { list: [], mode: "none" };
  const femaleSolo = persona === "solo" && String(travelerGender || "").toLowerCase() === "female";
  if (!femaleSolo) return { list: cabs, mode: "normal" };

  const femaleDrivers = cabs.filter((c) => String(c.driverGender).toLowerCase() === "female");
  if (femaleDrivers.length > 0) return { list: femaleDrivers, mode: "female_only" };

  const trustedFiveStar = cabs.filter((c) => Number(c.driverRating) >= 5 && Number(c.yearsExperience) >= 5);
  if (trustedFiveStar.length > 0) {
    return { list: trustedFiveStar, mode: "trusted_fallback_5star" };
  }

  return { list: [], mode: isNightHour(time) ? "female_only_unavailable_night" : "female_only_unavailable" };
}

async function fetchLiveCabSearch({ city, budget, persona, userGender, travelTime }) {
  const res = await fetch(SMART_SEARCH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, budget, persona, userGender, travelTime }),
  });
  if (!res.ok) throw new Error(`Cab API failed (${res.status})`);
  const data = await res.json().catch(() => ({}));
  const drivers = Array.isArray(data?.drivers) ? data.drivers : [];
  return { drivers, safetyMode: data?.safetyMode || "normal" };
}

function inferCabTypeFromDriver(driver = {}) {
  const vehicle = String(driver?.vehicle_type || "").toLowerCase();
  if (vehicle.includes("bike")) return CAB_TYPES.find((t) => t.id === "bike") || CAB_TYPES[0];
  if (vehicle.includes("auto")) return CAB_TYPES.find((t) => t.id === "auto") || CAB_TYPES[0];
  if (vehicle.includes("suv") || vehicle.includes("innova")) return CAB_TYPES.find((t) => t.id === "suv") || CAB_TYPES[0];
  if (vehicle.includes("xl") || vehicle.includes("urbania") || vehicle.includes("tempo")) return CAB_TYPES.find((t) => t.id === "xl") || CAB_TYPES[0];
  if (vehicle.includes("prime") || vehicle.includes("premium")) return CAB_TYPES.find((t) => t.id === "prime") || CAB_TYPES[0];
  return CAB_TYPES.find((t) => t.id === "sedan") || CAB_TYPES[0];
}

function mapDriverToCab(driver, idx, { pickup, drop, time }) {
  const type = inferCabTypeFromDriver(driver);
  const hour = time ? parseInt(time.split(":")[0], 10) : new Date().getHours();
  const isSurge = type.surgeHours.includes(hour);
  const distKm = 6 + ((idx * 3) % 18);
  const fare = Math.max(type.minFare, Math.round(type.pricePerKm * distKm * (isSurge ? 1.25 : 1)));
  const eta = 4 + ((idx * 2) % 11);
  const gender = String(driver?.gender || "male").toLowerCase();
  return {
    id: String(driver?._id || `live-${idx}`),
    type,
    provider: { name: "Verified Local", logo: "✅", color: "#166534" },
    fare,
    distKm,
    eta,
    isSurge,
    driverName: String(driver?.name || "Driver"),
    driverGender: gender || "male",
    driverRating: Number(driver?.rating || type.rating || 4).toFixed(1),
    yearsExperience: Number(driver?.experienceYears || 0),
    carModel: String(driver?.vehicle_type || type.name),
    plateNo: "Verified by partner",
    acAvailable: type.id !== "bike" && type.id !== "auto",
    pickup,
    drop,
    features: [
      "📡 Live Tracking",
      type.id !== "bike" && type.id !== "auto" ? "❄️ AC" : null,
      "💳 All Payments",
      "🛡️ Verified Driver",
      isSurge ? null : "💰 Best Price",
    ].filter(Boolean),
  };
}

function isEasyTransferCab(cab) {
  const id = String(cab?.type?.id || "").toLowerCase();
  return id !== "bike" && id !== "auto";
}

/* ── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cp-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#f0fdf4;min-height:100vh;display:flex;flex-direction:column}
.cp-hdr{display:flex;align-items:center;justify-content:space-between;padding:0 clamp(16px,3%,40px);background:#fff;border-bottom:1px solid #f0f0f0;min-height:72px;gap:12px;flex-shrink:0}
.cp-logo{display:flex;align-items:center;flex-shrink:0}
.cp-logo-img{height:58px;width:auto;object-fit:contain;display:block}
.cp-hdr-right{display:flex;align-items:center;gap:12px;margin-left:auto}
.cp-back-btn{background:#fff;border:1px solid #f0f0f0;color:#444;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .2s}
.cp-back-btn:hover{background:#fff5f0;color:#ff6600;border-color:#ffd8bf}
.cp-nav{background:linear-gradient(90deg,#064e3b,#047857);display:flex;align-items:center;padding:0 28px;height:56px;gap:4px;box-shadow:0 3px 10px rgba(0,0,0,.2)}
.cp-nav-menu{display:flex;align-items:center;gap:4px;width:100%}
.cp-nav-toggle{display:none}
.cp-ni{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 14px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.6);font-size:.64rem;font-weight:600;letter-spacing:.3px;text-transform:uppercase;transition:all .2s;border:1px solid transparent;min-width:64px}
.cp-ni:hover{background:rgba(255,255,255,.1);color:#fff}
.cp-ni.act{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.25)}
.cp-ni.act span{color:#6ee7b7}
.cp-ni svg{width:18px;height:18px}

.cp-content{flex:1;padding:20px 28px 40px;display:flex;flex-direction:column;gap:0}

.cp-err{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:13px 16px;display:flex;align-items:flex-start;gap:10px;margin-bottom:14px}
.cp-err-txt{font-size:.8rem;color:#7f1d1d;flex:1}
.cp-err-x{background:#e53e3e;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit}

.cp-sbox{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(4,120,87,.09),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(4,120,87,.08);margin-bottom:20px}
.cp-srow{display:flex;align-items:flex-end;padding:18px;gap:10px;flex-wrap:wrap}
.cp-f{display:flex;flex-direction:column;gap:4px;flex:1;min-width:160px}
.cp-f.dt{flex:0 0 150px}
.cp-f.tm{flex:0 0 130px}
.cp-lbl{font-size:.58rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px}
.cp-fin{display:flex;align-items:center;gap:8px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:9px 12px;transition:all .2s;min-height:46px;cursor:pointer}
.cp-fin:hover,.cp-fin:focus-within{border-color:#059669;background:#dcfce7}
.cp-fic{color:#059669;flex-shrink:0}
.cp-fic svg{width:17px;height:17px}
.cp-finput{border:none;outline:none;background:transparent;font-size:.86rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.cp-finput::placeholder{color:#a0aec0}
.cp-sbtn{flex-shrink:0;background:linear-gradient(135deg,#047857,#059669);color:#fff;border:none;border-radius:12px;padding:0 26px;height:46px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(4,120,87,.35);white-space:nowrap}
.cp-sbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(4,120,87,.45)}
.cp-sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.cp-sbtn svg{width:16px;height:16px}

/* filter chips */
.cp-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.cp-chip{padding:6px 14px;border-radius:20px;border:1.5px solid #bbf7d0;background:#fff;cursor:pointer;font-size:.72rem;font-weight:600;color:#047857;font-family:inherit;transition:all .2s}
.cp-chip.act{background:#047857;color:#fff;border-color:#047857}
.cp-chip:hover:not(.act){background:#dcfce7}

/* results */
.cp-results-hdr{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;flex-wrap:wrap;gap:8px}
.cp-results-title{font-size:1rem;font-weight:700;color:#1e293b}
.cp-results-sub{font-size:.75rem;color:#64748b;margin-top:2px}

/* cab card */
.cp-card{background:#fff;border-radius:16px;border:1.5px solid #bbf7d0;box-shadow:0 2px 10px rgba(4,120,87,.06);padding:18px 20px;margin-bottom:12px;transition:all .2s;cursor:default}
.cp-card:hover{box-shadow:0 6px 24px rgba(4,120,87,.13);border-color:#6ee7b7;transform:translateY(-1px)}
.cp-card-main{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.cp-cab-icon{width:54px;height:54px;border-radius:12px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0}
.cp-cab-info{flex:1;min-width:120px}
.cp-cab-name{font-size:.9rem;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:6px}
.cp-cab-provider{font-size:.72rem;color:#047857;font-weight:600;background:#dcfce7;padding:2px 8px;border-radius:10px}
.cp-cab-desc{font-size:.72rem;color:#64748b;margin-top:2px}
.cp-cab-driver{font-size:.7rem;color:#94a3b8;margin-top:4px}
.cp-eta{display:flex;flex-direction:column;align-items:center;flex:0 0 80px}
.cp-eta-min{font-size:1.3rem;font-weight:800;color:#047857}
.cp-eta-lbl{font-size:.62rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
.cp-fare-block{margin-left:auto;text-align:right;flex-shrink:0}
.cp-fare{font-size:1.35rem;font-weight:800;color:#064e3b}
.cp-fare-sub{font-size:.64rem;color:#94a3b8;margin-top:2px}
.cp-surge-badge{font-size:.6rem;font-weight:700;background:#fef9c3;color:#713f12;padding:2px 7px;border-radius:8px;display:inline-block;margin-top:3px}
.cp-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid #f0fdf4;flex-wrap:wrap;gap:8px}
.cp-tags{display:flex;gap:6px;flex-wrap:wrap}
.cp-tag{padding:3px 9px;border-radius:12px;font-size:.62rem;font-weight:600;background:#f0fdf4;color:#047857}
.cp-book-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;border:none;border-radius:8px;padding:8px 22px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(4,120,87,.3);transition:all .2s;white-space:nowrap}
.cp-book-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(4,120,87,.4)}

/* loading */
.cp-loading{display:flex;align-items:center;gap:12px;padding:40px;justify-content:center;color:#64748b;font-size:.86rem}
.cp-spin{width:24px;height:24px;border:3px solid #bbf7d0;border-top-color:#047857;border-radius:50%;animation:cp-spin .8s linear infinite;flex-shrink:0}
@keyframes cp-spin{to{transform:rotate(360deg)}}

.cp-empty{text-align:center;padding:60px 20px;color:#64748b}
.cp-empty-icon{font-size:3.5rem;margin-bottom:16px}
.cp-empty-title{font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:8px}
.cp-empty-sub{font-size:.82rem;color:#94a3b8}

/* book modal */
.cp-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.cp-modal{background:#fff;border-radius:20px;padding:28px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.cp-modal-title{font-size:1.1rem;font-weight:800;color:#1e293b;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.cp-modal-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0fdf4;font-size:.82rem}
.cp-modal-row:last-of-type{border-bottom:none}
.cp-modal-key{color:#64748b;font-weight:500}
.cp-modal-val{color:#1e293b;font-weight:700}
.cp-modal-btns{display:flex;gap:10px;margin-top:20px}
.cp-modal-cancel{flex:1;background:#f0fdf4;border:1.5px solid #bbf7d0;color:#047857;border-radius:10px;padding:10px;font-weight:600;cursor:pointer;font-family:inherit;font-size:.82rem;transition:all .2s}
.cp-modal-confirm{flex:1;background:linear-gradient(135deg,#047857,#059669);color:#fff;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.82rem;box-shadow:0 4px 14px rgba(4,120,87,.35);transition:all .2s}
.cp-modal-confirm:hover{transform:translateY(-1px)}

@media(max-width:768px){
  .cp-hdr{padding:0 12px;min-height:64px}
  .cp-logo-img{height:50px}
  .cp-nav{position:relative;height:auto;min-height:56px;padding:10px 12px;flex-direction:column;align-items:stretch;gap:8px}
  .cp-nav-toggle{display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:.76rem;font-weight:700;border-radius:10px;padding:10px 12px;cursor:pointer;font-family:inherit}
  .cp-nav-toggle svg{width:18px;height:18px}
  .cp-nav-menu{display:none;position:absolute;top:calc(100% + 6px);left:12px;right:12px;z-index:520;flex-direction:column;align-items:stretch;gap:6px;padding:8px;background:linear-gradient(135deg,#064e3b,#047857);border:1px solid rgba(255,255,255,.18);border-radius:12px;box-shadow:0 12px 24px rgba(2,6,23,.35)}
  .cp-nav-menu.open{display:flex}
  .cp-ni{flex-direction:row;justify-content:flex-start;gap:10px;padding:10px 12px;border-radius:8px;font-size:.74rem}
  .cp-content{padding:14px 12px 30px}
  .cp-srow{padding:12px}
  .cp-card-main{gap:10px}
  .cp-fare-block{margin-left:0;width:100%}
}
@media(max-width:480px){
  .cp-card{padding:14px 12px}
  .cp-card-footer{flex-direction:column;align-items:stretch}
  .cp-book-btn{width:100%}
  .cp-modal{padding:18px 14px}
}
`;

const navItems = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "cabs", label: "Cabs" },
  { id: "carrental", label: "Car Rental" },
];

export default function CabsPage() {
  const navigate = useNavigate();
  const persona = localStorage.getItem("persona") || "";
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const soloTravelerGender = String(localStorage.getItem("soloTravelerGender") || "").toLowerCase();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState(() => { const d = new Date(); return d.toISOString().split("T")[0]; });
  const [time, setTime] = useState("10:00");
  const [cabType, setCabType] = useState("");
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [seniorAssistMode, setSeniorAssistMode] = useState(false);
  const [easyTransferOnly, setEasyTransferOnly] = useState(false);
  const travelerGender = persona === "solo"
    ? (soloTravelerGender === "female" || soloTravelerGender === "male"
      ? soloTravelerGender
      : ((storedUser.gender || "").toLowerCase() === "female" ? "female" : "male"))
    : ((storedUser.gender || "").toLowerCase() === "female" ? "female" : "male");

  const [loading, setLoading] = useState(false);
  const [cabs, setCabs] = useState([]);
  const [displayedCabs, setDisplayedCabs] = useState([]);
  const [safetyMode, setSafetyMode] = useState("normal");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [bookingCab, setBookingCab] = useState(null);
  const [booked, setBooked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let shouldAutoSearch = false;
    try {
      const smart = JSON.parse(localStorage.getItem("voyagehack.smartQuery") || "{}");
      const unified = JSON.parse(localStorage.getItem("voyagehack.unifiedSearch") || "{}");
      if (smart.destination && !pickup) {
        setPickup(smart.destination);
        setDrop(`${smart.destination} City Center`);
        shouldAutoSearch = true;
      }
      const cabPrefill = JSON.parse(localStorage.getItem("voyagehack.cab.prefill") || "{}");
      const prefBudget = Number(cabPrefill.budget || unified?.budget?.maxValue || smart.budget || 0);
      const prefSeniorAssist = Boolean(cabPrefill.seniorAssist || unified?.preferences?.seniorAssist || false);
      const prefEasyTransfer = Boolean(cabPrefill.easyTransferOnly || unified?.preferences?.easyTransferPref || false);
      if (prefBudget > 0) setBudgetLimit(prefBudget);
      if (prefSeniorAssist) setSeniorAssistMode(true);
      if (prefEasyTransfer) setEasyTransferOnly(true);
      if (cabPrefill.city && !pickup) {
        setPickup(cabPrefill.city);
        setDrop(`${cabPrefill.city} City Center`);
        shouldAutoSearch = true;
      }
    } catch {
      // ignore malformed storage
    }
    if (shouldAutoSearch) setTimeout(() => handleSearch(), 0);
  }, [pickup]);

  async function handleSearch() {
    if (!pickup || !drop) {
      setError(null);
      setNotice("Please add both pickup and drop locations to see available cabs.");
      return;
    }
    setNotice(null);
    setError(null);
    setLoading(true);
    setSearched(true);
    setCabs([]);
    try {
      const live = await fetchLiveCabSearch({
        city: pickup,
        budget: budgetLimit > 0 ? budgetLimit : 999999,
        persona,
        userGender: travelerGender,
        travelTime: time,
      });
      let results = (live.drivers || []).map((driver, idx) =>
        mapDriverToCab(driver, idx, { pickup, drop, time })
      );
      if (!results.length) {
        throw new Error("No verified cab drivers found for this city.");
      }
      if (budgetLimit > 0) {
        results = results.filter((cab) => Number(cab.fare || 0) <= budgetLimit);
      }
      if (easyTransferOnly) {
        const easyCabs = results.filter(isEasyTransferCab);
        if (easyCabs.length > 0) {
          results = easyCabs;
        } else {
          setNotice("Easy-transfer cabs are limited right now. Showing all available cabs.");
        }
      }
      setCabs(results);
      const safety = applyCabSafetyRules(results, { persona, travelerGender, time });
      setDisplayedCabs(safety.list);
      setSafetyMode(safety.mode || live.safetyMode || "normal");
      if (!safety.list.length && safety.mode?.startsWith("female_only_unavailable")) {
        setError("No female drivers are currently available for solo female travel on this route/time.");
      }
    } catch (e) {
      // Last-resort fallback so UX doesn't break if backend is down.
      let fallback = generateCabs(pickup, drop, date, time, cabType || null);
      if (budgetLimit > 0) {
        fallback = fallback.filter((cab) => Number(cab.fare || 0) <= budgetLimit);
      }
      if (easyTransferOnly) {
        const easyCabs = fallback.filter(isEasyTransferCab);
        if (easyCabs.length > 0) {
          fallback = easyCabs;
        } else {
          setNotice("Easy-transfer cabs are limited right now. Showing all available cabs.");
        }
      }
      setCabs(fallback);
      const safety = applyCabSafetyRules(fallback, { persona, travelerGender, time });
      setDisplayedCabs(safety.list);
      setSafetyMode(safety.mode);
      if (!safety.list.length && safety.mode?.startsWith("female_only_unavailable")) {
        setError("No female drivers are currently available for solo female travel on this route/time.");
      } else {
        setError(e?.message || "Live cab data unavailable, showing fallback results.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBook(cab) {
    setBookingCab(cab);
  }

  function confirmBook() {
    setBookingCab(null);
    setBooked(true);
    setTimeout(() => setBooked(false), 4000);
  }

  const visibleCabs = displayedCabs
    .filter((c) => (!cabType || c.type.id === cabType) && (!budgetLimit || c.fare <= budgetLimit))
    .sort((a, b) => a.fare - b.fare);

  return (
    <>
      <style>{css}</style>
      <div className="cp-wrap">
        <header className="cp-hdr">
          <div className="cp-logo" aria-label="tbo.com">
            <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com" className="cp-logo-img" />
          </div>
          <div className="cp-hdr-right">
            <button className="cp-back-btn" onClick={() => navigate("/searchsection")}>Home</button>
          </div>
        </header>


        <ServiceNav />

        
        <div className="cp-content">
          {error && <div className="cp-err"><span className="cp-err-txt">⚠ {error}</span><button className="cp-err-x" onClick={() => setError(null)}>✕</button></div>}
          {notice && (
            <div style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
              <span style={{fontSize:".82rem",color:"#1e40af",flex:1}}>ℹ {notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                style={{background:"#dbeafe",color:"#1e40af",border:"1px solid #93c5fd",borderRadius:6,padding:"4px 10px",fontSize:".7rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
              >
                OK
              </button>
            </div>
          )}

          {booked && (
            <div style={{background:"#dcfce7",border:"1.5px solid #6ee7b7",borderRadius:12,padding:"12px 18px",marginBottom:14,fontSize:".84rem",fontWeight:600,color:"#064e3b"}}>
              🎉 Cab booked successfully! Your driver will arrive shortly.
            </div>
          )}
          {seniorAssistMode && (
            <div style={{background:"#fffbeb",border:"1.5px solid #fcd34d",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:".78rem",fontWeight:600,color:"#92400e"}}>
              Senior Assist mode active{easyTransferOnly ? " · Prioritizing easy-transfer vehicles" : ""}.
            </div>
          )}

          {/* Search Box */}
          <div className="cp-sbox">
            <div className="cp-srow">
              <div className="cp-f">
                <div className="cp-lbl">PICKUP LOCATION</div>
                <div className="cp-fin">
                  <div className="cp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg></div>
                  <input className="cp-finput" placeholder="Enter pickup city or area" value={pickup} onChange={e => setPickup(e.target.value)} list="cp-cities" />
                  <datalist id="cp-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div className="cp-f">
                <div className="cp-lbl">DROP LOCATION</div>
                <div className="cp-fin">
                  <div className="cp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <input className="cp-finput" placeholder="Enter drop city or area" value={drop} onChange={e => setDrop(e.target.value)} list="cp-cities2" />
                  <datalist id="cp-cities2">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div className="cp-f dt">
                <div className="cp-lbl">DATE</div>
                <div className="cp-fin">
                  <div className="cp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <input type="date" className="cp-finput" value={date} min={new Date().toISOString().split("T")[0]} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
              <div className="cp-f tm">
                <div className="cp-lbl">TIME</div>
                <div className="cp-fin">
                  <div className="cp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div>
                  <input type="time" className="cp-finput" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <button className="cp-sbtn" onClick={handleSearch} disabled={loading}>
                {loading ? <><div className="cp-spin" />Searching...</> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Find Cabs</>}
              </button>
            </div>
            {/* Cab type filters */}
            {searched && (
              <div style={{padding:"0 18px 14px",display:"flex",gap:8,flexWrap:"wrap",borderTop:"1px solid #f0fdf4",paddingTop:12}}>
                <div className="cp-lbl" style={{alignSelf:"center",marginRight:4}}>FILTER:</div>
                <button className={`cp-chip${!cabType?" act":""}`} onClick={() => setCabType("")}>All</button>
                {CAB_TYPES.map(c => (
                  <button key={c.id} className={`cp-chip${cabType===c.id?" act":""}`} onClick={() => setCabType(cabType===c.id?"":c.id)}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!loading && searched && (
            <div style={{background:"#ecfeff",border:"1.5px solid #99f6e4",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:".74rem",color:"#134e4a"}}>
              {persona === "solo" && (
                <div style={{marginBottom:6,fontWeight:700}}>
                  Solo profile: {travelerGender === "female" ? "Female Solo" : "Male Solo"}
                </div>
              )}
              {safetyMode === "female_only" && "Safety mode applied: only female drivers shown for solo female traveller."}
              {safetyMode === "trusted_fallback_5star" && "Female drivers unavailable. Showing only 5-star drivers with 5+ years experience."}
              {safetyMode === "female_only_unavailable_night" && "No female drivers available right now (night window). Please try another time."}
              {safetyMode === "female_only_unavailable" && "No female drivers available right now. Please try again shortly."}
              {safetyMode === "normal" && "Showing available verified drivers."}
            </div>
          )}

          {loading && <div className="cp-loading"><div className="cp-spin" />Finding available cabs near {pickup}...</div>}

          {!loading && searched && (
            <div>
              <div className="cp-results-hdr">
                <div>
                  <div className="cp-results-title">{visibleCabs.length} cabs available</div>
                  <div className="cp-results-sub">{pickup} → {drop} · {date} at {time}</div>
                </div>
              </div>

              {visibleCabs.map(cab => (
                <div key={cab.id} className="cp-card">
                  <div className="cp-card-main">
                    <div className="cp-cab-icon">{cab.type.icon}</div>
                    <div className="cp-cab-info">
                      <div className="cp-cab-name">
                        {cab.type.name}
                        <span className="cp-cab-provider" style={{color:cab.provider.color}}>{cab.provider.logo} {cab.provider.name}</span>
                      </div>
                      <div className="cp-cab-desc">{cab.type.desc} · ⭐ {cab.type.rating}</div>
                      <div className="cp-cab-driver">🧑 {cab.driverName} ({cab.driverGender}) · ⭐ {cab.driverRating} · {cab.yearsExperience} yrs exp · {cab.carModel} · {cab.plateNo}</div>
                    </div>
                    <div className="cp-eta">
                      <div className="cp-eta-min">{cab.eta}m</div>
                      <div className="cp-eta-lbl">ETA</div>
                    </div>
                    <div className="cp-fare-block">
                      <div className="cp-fare">₹{cab.fare}</div>
                      <div className="cp-fare-sub">{cab.distKm} km · flat fare</div>
                      {cab.isSurge && <div className="cp-surge-badge">⚡ Surge pricing</div>}
                    </div>
                  </div>
                  <div className="cp-card-footer">
                    <div className="cp-tags">{cab.features.map(f => <span key={f} className="cp-tag">{f}</span>)}</div>
                    <button className="cp-book-btn" onClick={() => handleBook(cab)}>Book Now ₹{cab.fare}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searched && !loading && (
            <div className="cp-empty">
              <div className="cp-empty-icon">🚕</div>
              <div className="cp-empty-title">Book a Cab</div>
              <div className="cp-empty-sub">Enter your pickup and drop locations to find available cabs near you.</div>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {bookingCab && (
          <div className="cp-modal-bg" onClick={() => setBookingCab(null)}>
            <div className="cp-modal" onClick={e => e.stopPropagation()}>
              <div className="cp-modal-title">{bookingCab.type.icon} Confirm Booking</div>
              {[
                ["Vehicle", `${bookingCab.type.name} (${bookingCab.provider.name})`],
                ["Pickup", pickup],
                ["Drop", drop],
                ["Date & Time", `${date} at ${time}`],
                ["Driver", `${bookingCab.driverName} (${bookingCab.driverGender}) · ⭐ ${bookingCab.driverRating}`],
                ["Car", `${bookingCab.carModel} · ${bookingCab.plateNo}`],
                ["Distance", `~${bookingCab.distKm} km`],
                ["ETA", `${bookingCab.eta} minutes`],
                ["Total Fare", `₹${bookingCab.fare}`],
              ].map(([k,v]) => (
                <div key={k} className="cp-modal-row"><span className="cp-modal-key">{k}</span><span className="cp-modal-val">{v}</span></div>
              ))}
              <div className="cp-modal-btns">
                <button className="cp-modal-cancel" onClick={() => setBookingCab(null)}>Cancel</button>
                <button className="cp-modal-confirm" onClick={confirmBook}>✓ Confirm Booking</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
