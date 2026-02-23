import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceNav from "../components/ServiceNav";

const CITIES = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Goa", "Jaipur", "Chandigarh"];

const CARS = [
  { id: "swift", name: "Maruti Swift", icon: "🚗", category: "Hatchback", seats: 5, fuel: "Petrol", transmission: "Manual", ac: true, pricePerDay: 1200, img: "🟡", mileage: "23 km/l", rating: 4.4, features: ["Bluetooth", "USB Charging", "Power Windows"] },
  { id: "innova", name: "Toyota Innova", icon: "🚙", category: "SUV", seats: 7, fuel: "Diesel", transmission: "Manual", ac: true, pricePerDay: 2500, img: "⚪", mileage: "15 km/l", rating: 4.7, features: ["Push Start", "Rear Camera", "Cruise Control", "7 Seats"] },
  { id: "fortuner", name: "Toyota Fortuner", icon: "🚘", category: "Premium SUV", seats: 7, fuel: "Diesel", transmission: "Automatic", ac: true, pricePerDay: 4500, img: "⬛", mileage: "14 km/l", rating: 4.8, features: ["4WD", "Sunroof", "Leather Seats", "Navigation"] },
  { id: "dzire", name: "Maruti Dzire", icon: "🚗", category: "Sedan", seats: 5, fuel: "Petrol/CNG", transmission: "Manual", ac: true, pricePerDay: 1500, img: "🔵", mileage: "22 km/l", rating: 4.3, features: ["CNG Option", "Bluetooth", "Power Mirrors"] },
  { id: "xuv", name: "Mahindra XUV700", icon: "🚙", category: "Premium SUV", seats: 7, fuel: "Diesel", transmission: "Automatic", ac: true, pricePerDay: 3800, img: "🔴", mileage: "15 km/l", rating: 4.6, features: ["ADAS", "Panoramic Roof", "Wireless Charging", "AdrenoX System"] },
  { id: "creta", name: "Hyundai Creta", icon: "🚘", category: "Compact SUV", seats: 5, fuel: "Petrol", transmission: "Automatic", ac: true, pricePerDay: 2200, img: "🟤", mileage: "17 km/l", rating: 4.5, features: ["Smart key", "Sunroof", "Digital Cluster", "Connected Car"] },
  { id: "ertiga", name: "Maruti Ertiga", icon: "🚐", category: "MPV", seats: 7, fuel: "CNG", transmission: "Manual", ac: true, pricePerDay: 1800, img: "🟣", mileage: "26 km/l", rating: 4.4, features: ["CNG", "7 Seats", "Smart Infotainment"] },
  { id: "thar", name: "Mahindra Thar", icon: "🚗", category: "Off-road 4x4", seats: 4, fuel: "Diesel", transmission: "Manual", ac: true, pricePerDay: 3200, img: "🟢", mileage: "15 km/l", rating: 4.7, features: ["4WD", "Convertible", "Rock Crawl Mode", "Adventure Ready"] },
];

const RENTAL_COMPANIES = ["Zoomcar", "Drivezy", "Revv", "Myles", "ALD Automotive"];

function generateRentals(city, pickupDate, returnDate, category) {
  const days = Math.max(1, Math.round((new Date(returnDate) - new Date(pickupDate)) / 86400000));
  return CARS.filter(c => !category || c.category === category).flatMap(car => {
    const company = RENTAL_COMPANIES[Math.floor(Math.random() * RENTAL_COMPANIES.length)];
    const totalPrice = car.pricePerDay * days;
    const discount = [0, 0, 10, 0, 15, 0][Math.floor(Math.random() * 6)];
    const finalPrice = Math.round(totalPrice * (1 - discount/100));
    const deposited = Math.round(car.pricePerDay * 3);
    return [{
      id: `${car.id}-${company}-${Math.random().toString(36).slice(2,6)}`,
      car,
      company,
      days,
      totalPrice,
      discount,
      finalPrice,
      deposited,
      pickupCity: city,
      available: Math.random() > 0.1,
      fuelPolicy: Math.random() > 0.5 ? "Full-to-Full" : "Same-to-Same",
      kmIncluded: 200 + Math.floor(Math.random() / 0.1) * 50,
      extraKmCharge: Math.round(car.pricePerDay * 0.05),
    }];
  }).filter(r => r.available);
}

/* ── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cr-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#fdf4ff;min-height:100vh;display:flex;flex-direction:column}
.cr-hdr{background:linear-gradient(135deg,#3b0764 0%,#6d28d9 55%,#7c3aed 100%);display:flex;align-items:center;justify-content:space-between;padding:8px 28px;min-height:58px;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.28);flex-shrink:0}
.cr-logo-v{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:800;color:#fff}
.cr-logo-car{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:700;color:#ddd6fe}
.cr-hdr-right{display:flex;align-items:center;gap:12px;margin-left:auto}
.cr-back-btn{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:.75rem;font-weight:600;font-family:inherit;transition:background .2s}
.cr-back-btn:hover{background:rgba(255,255,255,.22)}
.cr-nav{background:linear-gradient(90deg,#3b0764,#6d28d9);display:flex;align-items:center;padding:0 28px;height:56px;gap:4px;box-shadow:0 3px 10px rgba(0,0,0,.2)}
.cr-nav-menu{display:flex;align-items:center;gap:4px;width:100%}
.cr-nav-toggle{display:none}
.cr-ni{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 14px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.6);font-size:.64rem;font-weight:600;letter-spacing:.3px;text-transform:uppercase;transition:all .2s;border:1px solid transparent;min-width:64px}
.cr-ni:hover{background:rgba(255,255,255,.1);color:#fff}
.cr-ni.act{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.25)}
.cr-ni.act span{color:#ddd6fe}

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

/* car card */
.cr-card{background:#fff;border-radius:16px;border:1.5px solid #e9d5ff;box-shadow:0 2px 10px rgba(109,40,217,.06);margin-bottom:14px;overflow:hidden;transition:all .2s}
.cr-card:hover{box-shadow:0 6px 24px rgba(109,40,217,.14);border-color:#c4b5fd;transform:translateY(-1px)}
.cr-card-top{padding:18px 20px;display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}
.cr-car-img{width:110px;height:80px;border-radius:12px;background:linear-gradient(135deg,#f3e8ff,#ede9fe);display:flex;align-items:center;justify-content:center;font-size:3rem;flex-shrink:0}
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
.cr-discount{font-size:.68rem;color:#22c55e;font-weight:700;margin-top:2px}
.cr-deposit{font-size:.66rem;color:#94a3b8;margin-top:1px}

.cr-card-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#faf5ff;border-top:1px solid #ede9fe;flex-wrap:wrap;gap:10px}
.cr-policy-tags{display:flex;gap:7px;flex-wrap:wrap}
.cr-ptag{font-size:.64rem;font-weight:600;background:#fff;border:1px solid #e9d5ff;color:#64748b;padding:3px 9px;border-radius:8px}
.cr-book-btn{background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border:none;border-radius:8px;padding:8px 24px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(109,40,217,.3);transition:all .2s;white-space:nowrap}
.cr-book-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(109,40,217,.4)}

/* loading */
.cr-loading{display:flex;align-items:center;gap:12px;padding:40px;justify-content:center;color:#64748b;font-size:.86rem}
.cr-spin{width:24px;height:24px;border:3px solid #e9d5ff;border-top-color:#7c3aed;border-radius:50%;animation:cr-spin .8s linear infinite}
@keyframes cr-spin{to{transform:rotate(360deg)}}

.cr-empty{text-align:center;padding:60px 20px}
.cr-empty-icon{font-size:3.5rem;margin-bottom:16px}
.cr-empty-title{font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:8px}
.cr-empty-sub{font-size:.82rem;color:#94a3b8}

/* modal */
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
  .cr-hdr{padding:8px 14px;min-height:56px}
  .cr-nav{position:relative;height:auto;min-height:56px;padding:10px 12px;flex-direction:column;align-items:stretch;gap:8px}
  .cr-nav-toggle{display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:.76rem;font-weight:700;border-radius:10px;padding:10px 12px;cursor:pointer;font-family:inherit}
  .cr-nav-toggle svg{width:18px;height:18px}
  .cr-nav-menu{display:none;position:absolute;top:calc(100% + 6px);left:12px;right:12px;z-index:520;flex-direction:column;align-items:stretch;gap:6px;padding:8px;background:linear-gradient(135deg,#3b0764,#6d28d9);border:1px solid rgba(255,255,255,.18);border-radius:12px;box-shadow:0 12px 24px rgba(2,6,23,.35)}
  .cr-nav-menu.open{display:flex}
  .cr-ni{flex-direction:row;justify-content:flex-start;gap:10px;padding:10px 12px;border-radius:8px;font-size:.74rem}
  .cr-content{padding:14px 12px 30px}
  .cr-card-top{gap:10px}
  .cr-price-block{text-align:left;width:100%}
  .cr-car-img{width:80px;height:60px;font-size:2.2rem}
}
`;

const CATEGORIES = ["All", "Hatchback", "Sedan", "Compact SUV", "SUV", "Premium SUV", "MPV", "Off-road 4x4"];

const navItems = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "cabs", label: "Cabs" },
  { id: "carrental", label: "Car Rental" },
];

export default function CarRentalPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [city, setCity] = useState("");
  const [pickup, setPickup] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("price");

  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [bookingRental, setBookingRental] = useState(null);
  const [booked, setBooked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let shouldAutoSearch = false;
    try {
      const smart = JSON.parse(localStorage.getItem("voyagehack.smartQuery") || "{}");
      const prefill = JSON.parse(localStorage.getItem("voyagehack.carrental.prefill") || "{}");
      const cityVal = prefill.city || smart.destination || "";
      if (cityVal) {
        setCity(cityVal);
        shouldAutoSearch = true;
      }
      if (prefill.pickupDate) {
        const d = new Date(prefill.pickupDate);
        if (!Number.isNaN(d.getTime())) setPickup(d.toISOString().split("T")[0]);
      }
      if (prefill.returnDate) {
        const d = new Date(prefill.returnDate);
        if (!Number.isNaN(d.getTime())) setReturnDate(d.toISOString().split("T")[0]);
      }
    } catch {
      // ignore malformed storage
    }
    if (shouldAutoSearch) setTimeout(() => handleSearch(), 0);
  }, []);

  function handleSearch() {
    if (!city) { setError("Please enter a city for car rental."); return; }
    if (new Date(returnDate) <= new Date(pickup)) { setError("Return date must be after pickup date."); return; }
    setError(null);
    setLoading(true);
    setSearched(true);
    setRentals([]);
    setTimeout(() => {
      const results = generateRentals(city, pickup, returnDate, category === "All" ? null : category);
      setRentals(results);
      setLoading(false);
    }, 1400);
  }

  function confirmBook() {
    setBookingRental(null);
    setBooked(true);
    setTimeout(() => setBooked(false), 4000);
  }

  const displayed = rentals
    .filter(r => category === "All" || r.car.category === category)
    .sort((a, b) => {
      if (sortBy === "price") return a.finalPrice - b.finalPrice;
      if (sortBy === "rating") return b.car.rating - a.car.rating;
      return 0;
    });

  return (
    <>
      <style>{css}</style>
      <div className="cr-wrap">
        <header className="cr-hdr">
          <div style={{display:"flex",alignItems:"center",gap:2}}>
            <span className="cr-logo-v">Voyage</span>
            <span className="cr-logo-car">Drive</span>
          </div>
          <div className="cr-hdr-right">
            <button className="cr-back-btn" onClick={() => navigate("/results")}>← Home</button>
          </div>
        </header>


        <ServiceNav />

        

        <div className="cr-content">
          {error && <div className="cr-err"><span className="cr-err-txt">⚠ {error}</span><button className="cr-err-x" onClick={() => setError(null)}>✕</button></div>}

          {booked && (
            <div style={{background:"#f3e8ff",border:"1.5px solid #c4b5fd",borderRadius:12,padding:"12px 18px",marginBottom:14,fontSize:".84rem",fontWeight:600,color:"#3b0764"}}>
              🎉 Car rental confirmed! Check your email for details and pickup instructions.
            </div>
          )}

          <div className="cr-sbox">
            <div className="cr-srow">
              <div className="cr-f">
                <div className="cr-lbl">PICKUP CITY</div>
                <div className="cr-fin">
                  <div className="cr-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg></div>
                  <input className="cr-finput" placeholder="Enter city (e.g. Mumbai)" value={city} onChange={e => setCity(e.target.value)} list="cr-cities" />
                  <datalist id="cr-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div className="cr-f dt">
                <div className="cr-lbl">PICKUP DATE</div>
                <div className="cr-fin">
                  <div className="cr-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <input type="date" className="cr-finput" value={pickup} min={today} onChange={e => setPickup(e.target.value)} />
                </div>
              </div>
              <div className="cr-f dt">
                <div className="cr-lbl">RETURN DATE</div>
                <div className="cr-fin">
                  <div className="cr-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <input type="date" className="cr-finput" value={returnDate} min={pickup || today} onChange={e => setReturnDate(e.target.value)} />
                </div>
              </div>
              <button className="cr-sbtn" onClick={handleSearch} disabled={loading}>
                {loading ? <><div className="cr-spin" />Searching...</> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search Cars</>}
              </button>
            </div>
            {searched && (
              <div className="cr-filters">
                <div className="cr-lbl" style={{alignSelf:"center",marginRight:4}}>CATEGORY:</div>
                {CATEGORIES.map(c => (
                  <button key={c} className={`cr-chip${category===c?" act":""}`} onClick={() => setCategory(c)}>{c}</button>
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
                    {pickup} → {returnDate} · {Math.max(1, Math.round((new Date(returnDate) - new Date(pickup)) / 86400000))} day{Math.max(1, Math.round((new Date(returnDate) - new Date(pickup)) / 86400000)) !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="cr-sort">
                  <button className={`cr-sort-btn${sortBy==="price"?" act":""}`} onClick={() => setSortBy("price")}>Cheapest</button>
                  <button className={`cr-sort-btn${sortBy==="rating"?" act":""}`} onClick={() => setSortBy("rating")}>Top Rated</button>
                </div>
              </div>

              {displayed.map(r => (
                <div key={r.id} className="cr-card">
                  <div className="cr-card-top">
                    <div className="cr-car-img">{r.car.icon}</div>
                    <div className="cr-car-info">
                      <div className="cr-car-name">
                        {r.car.name}
                        <span className="cr-car-company">{r.company}</span>
                      </div>
                      <div className="cr-car-cat">{r.car.category} · ⭐ {r.car.rating} · {r.car.seats} Seats</div>
                      <div className="cr-car-specs">
                        <span className="cr-spec">⛽ {r.car.fuel}</span>
                        <span className="cr-spec">⚙️ {r.car.transmission}</span>
                        {r.car.ac && <span className="cr-spec">❄️ AC</span>}
                        <span className="cr-spec">🏁 {r.car.mileage}</span>
                      </div>
                      <div className="cr-car-features">
                        {r.car.features.map(f => <span key={f} className="cr-feature">{f}</span>)}
                      </div>
                    </div>
                    <div className="cr-price-block">
                      <div className="cr-ppd">₹{r.car.pricePerDay.toLocaleString("en-IN")}/day</div>
                      <div className="cr-price">₹{r.finalPrice.toLocaleString("en-IN")}</div>
                      <div className="cr-price-days">for {r.days} day{r.days !== 1 ? "s" : ""} · all incl.</div>
                      {r.discount > 0 && <div className="cr-discount">🎉 {r.discount}% off applied</div>}
                      <div className="cr-deposit">Deposit: ₹{r.deposited.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="cr-card-footer">
                    <div className="cr-policy-tags">
                      <span className="cr-ptag">⛽ {r.fuelPolicy}</span>
                      <span className="cr-ptag">🛣️ {r.kmIncluded} km included</span>
                      <span className="cr-ptag">📍 {r.pickupCity}</span>
                      <span className="cr-ptag">+₹{r.extraKmCharge}/km extra</span>
                    </div>
                    <button className="cr-book-btn" onClick={() => setBookingRental(r)}>
                      Book Now · ₹{r.finalPrice.toLocaleString("en-IN")}
                    </button>
                  </div>
                </div>
              ))}

              {displayed.length === 0 && (
                <div className="cr-empty">
                  <div className="cr-empty-icon">🚗</div>
                  <div className="cr-empty-title">No cars found</div>
                  <div className="cr-empty-sub">Try a different city, category, or dates.</div>
                </div>
              )}
            </div>
          )}

          {!searched && !loading && (
            <div className="cr-empty">
              <div className="cr-empty-icon">🚗</div>
              <div className="cr-empty-title">Self-Drive Car Rental</div>
              <div className="cr-empty-sub">Choose a city and dates to find the best self-drive rental cars. Drive on your own terms.</div>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {bookingRental && (
          <div className="cr-modal-bg" onClick={() => setBookingRental(null)}>
            <div className="cr-modal" onClick={e => e.stopPropagation()}>
              <div className="cr-modal-title">🚗 Confirm Car Rental</div>
              {[
                ["Vehicle", `${bookingRental.car.name} (${bookingRental.car.category})`],
                ["Provider", bookingRental.company],
                ["Pickup City", bookingRental.pickupCity],
                ["Pickup Date", pickup],
                ["Return Date", returnDate],
                ["Duration", `${bookingRental.days} day${bookingRental.days !== 1 ? "s" : ""}`],
                ["Km Included", `${bookingRental.kmIncluded} km`],
                ["Fuel Policy", bookingRental.fuelPolicy],
                ["Security Deposit", `₹${bookingRental.deposited.toLocaleString("en-IN")} (refundable)`],
                ["Total Amount", `₹${bookingRental.finalPrice.toLocaleString("en-IN")}`],
              ].map(([k,v]) => (
                <div key={k} className="cr-modal-row"><span className="cr-modal-key">{k}</span><span className="cr-modal-val">{v}</span></div>
              ))}
              <div className="cr-modal-btns">
                <button className="cr-modal-cancel" onClick={() => setBookingRental(null)}>Cancel</button>
                <button className="cr-modal-confirm" onClick={confirmBook}>✓ Confirm Booking</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
