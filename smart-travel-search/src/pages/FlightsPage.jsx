import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ServiceNav from "../components/ServiceNav";

const API_BASE = "http://localhost:5000/api/flights";

async function apiPost(endpoint, payload) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Non-JSON: ${text.slice(0, 200)}`); }
  if (json.error) throw new Error(json.error);
  return json;
}

/* ── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.fp-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#eef2f7;min-height:100vh;display:flex;flex-direction:column}

/* header */
.fp-hdr{background:linear-gradient(135deg,#1a0050 0%,#3d0099 55%,#6600cc 100%);display:flex;align-items:center;justify-content:space-between;padding:8px 28px;min-height:58px;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.28);flex-shrink:0}
.fp-logo{display:flex;align-items:center;gap:2px}
.fp-logo-v{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:800;color:#fff}
.fp-logo-fly{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:700;color:#d4a0ff}
.fp-hdr-right{display:flex;align-items:center;gap:12px;flex-shrink:0;margin-left:auto}
.fp-back-btn{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:.75rem;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:6px;transition:background .2s}
.fp-back-btn:hover{background:rgba(255,255,255,.22)}



/* content */
.fp-content{flex:1;padding:20px 28px 40px;display:flex;flex-direction:column;gap:0}

/* error */
.fp-err{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:13px 16px;display:flex;align-items:flex-start;gap:10px;margin-bottom:14px}
.fp-err-txt{font-size:.8rem;color:#7f1d1d;line-height:1.55;flex:1}
.fp-err-x{background:#e53e3e;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;font-family:inherit}

/* search box */
.fp-sbox{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(61,0,153,.09),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(61,0,153,.08);margin-bottom:20px}
.fp-srow1{display:flex;align-items:flex-end;padding:18px 18px 14px;gap:10px;border-bottom:1px solid #f0f4f8;flex-wrap:wrap}
.fp-srow2{display:flex;align-items:flex-end;padding:12px 18px 16px;gap:10px;flex-wrap:wrap}

/* trip type tabs */
.fp-trip-tabs{display:flex;gap:6px;padding:14px 18px 0;flex-wrap:wrap}
.fp-tt{padding:6px 16px;border-radius:20px;border:1.5px solid #e2e8f0;background:#f7f8fc;cursor:pointer;font-size:.74rem;font-weight:600;color:#64748b;font-family:inherit;transition:all .2s}
.fp-tt.act{background:#3d0099;color:#fff;border-color:#3d0099}

/* field */
.fp-f{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.fp-f.city{flex:2;min-width:180px}
.fp-f.dt{flex:0 0 155px}
.fp-f.pax{flex:0 0 195px}
.fp-lbl{font-size:.58rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;padding-left:2px}
.fp-fin{display:flex;align-items:center;gap:8px;background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:10px;padding:9px 12px;transition:all .2s;cursor:pointer;min-height:46px}
.fp-fin:hover{border-color:#3d0099;background:#f5f0ff}
.fp-fin:focus-within{border-color:#3d0099;box-shadow:0 0 0 3px rgba(61,0,153,.08);background:#fff}
.fp-fic{color:#3d0099;flex-shrink:0}
.fp-fic svg{width:17px;height:17px}
.fp-finput{border:none;outline:none;background:transparent;font-size:.86rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.fp-finput::placeholder{color:#a0aec0;font-weight:400}
.fp-fval{font-size:.86rem;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fp-fval.ph{color:#a0aec0;font-weight:400}
.fp-swap{background:#f0e8ff;border:1.5px solid #d4a0ff;color:#3d0099;border-radius:50%;width:34px;height:34px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all .2s;margin-top:20px;align-self:flex-end;margin-bottom:2px}
.fp-swap:hover{background:#3d0099;color:#fff;transform:rotate(180deg)}

/* search btn */
.fp-sbtn{flex-shrink:0;background:linear-gradient(135deg,#3d0099,#6600cc);color:#fff;border:none;border-radius:12px;padding:0 26px;height:46px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(61,0,153,.35);white-space:nowrap}
.fp-sbtn:hover:not(:disabled){background:linear-gradient(135deg,#2a0066,#3d0099);transform:translateY(-1px);box-shadow:0 6px 20px rgba(61,0,153,.45)}
.fp-sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.fp-sbtn svg{width:16px;height:16px}

/* dropdown */
.fp-drop{position:absolute;top:calc(100% + 6px);left:0;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.14);z-index:400;animation:fdDown .18s ease both;overflow:hidden;min-width:250px;max-width:min(92vw,340px)}
.fp-drop.right{left:auto;right:0}
@keyframes fdDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.fp-drop-item{padding:10px 14px;font-size:.82rem;color:#334155;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f8fafc}
.fp-drop-item:last-child{border-bottom:none}
.fp-drop-item:hover{background:#f5f0ff;color:#3d0099}
.fp-drop-code{font-weight:700;color:#3d0099;min-width:38px}
.fp-drop-name{flex:1}

/* calendar */
.fp-cal{padding:15px;min-width:290px}
.fp-cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.fp-cal-nav{background:#f0f4f8;border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:#334155;transition:background .15s}
.fp-cal-nav:hover{background:#ede0ff;color:#3d0099}
.fp-cal-mon{font-size:.82rem;font-weight:700;color:#1e293b}
.fp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.fp-dow{font-size:.56rem;font-weight:700;text-align:center;color:#94a3b8;padding:3px;text-transform:uppercase}
.fp-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:.72rem;font-weight:500;color:#334155;transition:all .13s}
.fp-day:hover:not(.dis){background:#ede0ff;color:#3d0099}
.fp-day.dis{color:#d1d5db;cursor:default}
.fp-day.sel{background:#3d0099 !important;color:#fff !important;font-weight:700}

/* pax dropdown */
.fp-pax-drop{padding:15px;min-width:230px}
.fp-pax-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f5f5f5}
.fp-pax-row:last-child{border-bottom:none}
.fp-pax-info{display:flex;flex-direction:column}
.fp-pax-lbl{font-size:.82rem;font-weight:600;color:#1e293b}
.fp-pax-sub{font-size:.65rem;color:#94a3b8}
.fp-pax-ctrl{display:flex;align-items:center;gap:9px}
.fp-pax-btn{width:28px;height:28px;border-radius:50%;border:1.5px solid #e0e0e0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#555;transition:all .15s;line-height:1}
.fp-pax-btn:hover:not(:disabled){border-color:#3d0099;color:#3d0099}
.fp-pax-btn:disabled{opacity:.3;cursor:default}
.fp-pax-count{font-size:.9rem;font-weight:600;color:#1e293b;min-width:18px;text-align:center}

/* results */
.fp-results{display:flex;flex-direction:column;gap:0}
.fp-results-hdr{display:flex;align-items:center;justify-content:space-between;padding:0 0 12px;flex-wrap:wrap;gap:8px}
.fp-results-title{font-size:1rem;font-weight:700;color:#1e293b}
.fp-results-sub{font-size:.75rem;color:#64748b;margin-top:2px}
.fp-sort{display:flex;gap:6px;flex-wrap:wrap}
.fp-sort-btn{padding:5px 12px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:.7rem;font-weight:600;color:#64748b;font-family:inherit;transition:all .2s}
.fp-sort-btn.act{background:#3d0099;color:#fff;border-color:#3d0099}

/* flight card */
.fp-card{background:#fff;border-radius:16px;border:1.5px solid #e8e0f5;box-shadow:0 2px 10px rgba(61,0,153,.06);padding:18px 20px;margin-bottom:12px;transition:all .2s;display:flex;flex-direction:column;gap:12px}
.fp-card:hover{box-shadow:0 6px 24px rgba(61,0,153,.13);border-color:#c4a0ff;transform:translateY(-1px)}
.fp-card-main{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.fp-airline-logo{width:46px;height:46px;border-radius:10px;background:linear-gradient(135deg,#f5f0ff,#ede0ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
.fp-airline-info{flex:0 0 140px}
.fp-airline-name{font-size:.82rem;font-weight:700;color:#1e293b}
.fp-flight-no{font-size:.68rem;color:#94a3b8;margin-top:2px}
.fp-route{display:flex;align-items:center;flex:1;gap:10px;min-width:0}
.fp-city-block{text-align:center;flex:0 0 80px}
.fp-city-time{font-size:1.25rem;font-weight:800;color:#1e293b}
.fp-city-code{font-size:.68rem;color:#64748b;font-weight:600}
.fp-city-date{font-size:.62rem;color:#94a3b8;margin-top:1px}
.fp-route-middle{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
.fp-duration{font-size:.7rem;color:#64748b;font-weight:600}
.fp-route-line{width:100%;height:2px;background:linear-gradient(90deg,#3d0099,#d4a0ff);border-radius:2px;position:relative}
.fp-route-line::before,.fp-route-line::after{content:'';position:absolute;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#3d0099}
.fp-route-line::before{left:0}
.fp-route-line::after{right:0}
.fp-stops{font-size:.65rem;color:#94a3b8}
.fp-stops.non{color:#22c55e;font-weight:600}
.fp-price-block{margin-left:auto;text-align:right;flex-shrink:0}
.fp-price{font-size:1.4rem;font-weight:800;color:#3d0099}
.fp-price-sub{font-size:.66rem;color:#94a3b8;margin-top:1px}
.fp-price-old{font-size:.72rem;color:#94a3b8;text-decoration:line-through;margin-top:2px}
.fp-card-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.fp-tags{display:flex;gap:6px;flex-wrap:wrap}
.fp-tag{padding:3px 9px;border-radius:12px;font-size:.62rem;font-weight:600;background:#f0e8ff;color:#3d0099}
.fp-tag.green{background:#dcfce7;color:#166534}
.fp-tag.orange{background:#fff7ed;color:#c2410c}
.fp-card-btns{display:flex;gap:8px;flex-shrink:0}
.fp-detail-btn{background:#f5f0ff;border:1.5px solid #d4a0ff;color:#3d0099;border-radius:8px;padding:7px 14px;font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
.fp-detail-btn:hover{background:#ede0ff}
.fp-book-btn{background:linear-gradient(135deg,#3d0099,#6600cc);color:#fff;border:none;border-radius:8px;padding:7px 18px;font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(61,0,153,.3);transition:all .2s}
.fp-book-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(61,0,153,.4)}

/* skeleton */
.fp-skeleton{background:linear-gradient(90deg,#f0e8ff 25%,#ede0ff 50%,#f0e8ff 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;height:20px}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* empty */
.fp-empty{text-align:center;padding:60px 20px;color:#64748b}
.fp-empty-icon{font-size:3.5rem;margin-bottom:16px}
.fp-empty-title{font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:8px}
.fp-empty-sub{font-size:.82rem;color:#94a3b8}

/* loading */
.fp-loading{display:flex;align-items:center;gap:12px;padding:24px;justify-content:center;color:#64748b;font-size:.86rem}
.fp-spin{width:24px;height:24px;border:3px solid #ede0ff;border-top-color:#3d0099;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

/* detail expand */
.fp-detail-panel{border-top:1px solid #f0e8ff;padding-top:12px;animation:fdDown .2s ease}
.fp-seg{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed #f0e8ff}
.fp-seg:last-child{border-bottom:none}
.fp-seg-line{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;padding-top:4px}
.fp-seg-dot{width:10px;height:10px;border-radius:50%;background:#3d0099;border:2px solid #fff;box-shadow:0 0 0 2px #3d0099}
.fp-seg-bar{width:2px;flex:1;min-height:30px;background:#d4a0ff}
.fp-seg-info{flex:1}
.fp-seg-time{font-size:.88rem;font-weight:700;color:#1e293b}
.fp-seg-airport{font-size:.72rem;color:#64748b;margin-top:2px}
.fp-seg-dur{font-size:.68rem;color:#3d0099;font-weight:600;margin:4px 0}
.fp-seg-flight{font-size:.66rem;color:#94a3b8}
.fp-layover{background:#fff7ed;border-radius:8px;padding:6px 12px;font-size:.68rem;color:#c2410c;font-weight:600;margin:4px 0;text-align:center}

/* fare summary */
.fp-fare-summary{background:#f8f4ff;border-radius:12px;padding:14px;margin-top:8px}
.fp-fare-row{display:flex;justify-content:space-between;font-size:.76rem;padding:4px 0;color:#475569}
.fp-fare-row.total{font-weight:700;color:#1e293b;border-top:1px solid #d4a0ff;padding-top:8px;margin-top:4px;font-size:.84rem}

/* responsive */
@media(max-width:768px){
  .fp-hdr{padding:8px 14px;min-height:56px}
  .fp-nav{position:relative;height:auto;min-height:56px;padding:10px 12px;flex-direction:column;align-items:stretch;gap:8px}
  .fp-nav-toggle{display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:.76rem;font-weight:700;border-radius:10px;padding:10px 12px;cursor:pointer;font-family:inherit}
  .fp-nav-toggle svg{width:18px;height:18px}
  .fp-nav-menu{display:none;position:absolute;top:calc(100% + 6px);left:12px;right:12px;z-index:520;flex-direction:column;align-items:stretch;gap:6px;padding:8px;background:linear-gradient(135deg,#1a0050,#3d0099);border:1px solid rgba(255,255,255,.18);border-radius:12px;box-shadow:0 12px 24px rgba(2,6,23,.35)}
  .fp-nav-menu.open{display:flex}
  .fp-ni{flex-direction:row;justify-content:flex-start;gap:10px;padding:10px 12px;border-radius:8px;font-size:.74rem}
  .fp-ni svg{width:16px;height:16px}
  .fp-content{padding:14px 12px 30px}
  .fp-srow1,.fp-srow2{padding:12px}
  .fp-card-main{gap:10px}
  .fp-route{flex-wrap:wrap}
  .fp-city-block{flex:0 0 70px}
  .fp-price-block{margin-left:0;text-align:left;width:100%}
  .fp-card-actions{flex-direction:column;align-items:stretch}
  .fp-card-btns{justify-content:stretch}
  .fp-book-btn,.fp-detail-btn{flex:1;text-align:center}
}
@media(max-width:480px){
  .fp-card{padding:14px}
  .fp-airline-info{flex:0 0 110px}
  .fp-trip-tabs{padding:10px 12px 0}
}
`;

const AIRPORTS = [
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi Intl", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl", country: "India" },
  { code: "BLR", city: "Bangalore", name: "Kempegowda Intl", country: "India" },
  { code: "MAA", city: "Chennai", name: "Chennai Intl", country: "India" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl", country: "India" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl", country: "India" },
  { code: "COK", city: "Kochi", name: "Cochin Intl", country: "India" },
  { code: "PNQ", city: "Pune", name: "Pune Airport", country: "India" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE" },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK" },
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand" },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malaysia" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France" },
];

const AIRLINES = {
  "6E": { name: "IndiGo", emoji: "✈️" },
  "AI": { name: "Air India", emoji: "🛩️" },
  "UK": { name: "Vistara", emoji: "✈️" },
  "SG": { name: "SpiceJet", emoji: "🔴" },
  "EK": { name: "Emirates", emoji: "✈️" },
  "9W": { name: "Jet Airways", emoji: "✈️" },
  "G8": { name: "GoAir", emoji: "🟢" },
  "QR": { name: "Qatar Airways", emoji: "🔵" },
  "EY": { name: "Etihad", emoji: "✈️" },
  "SQ": { name: "Singapore Airlines", emoji: "🟡" },
};

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDateStr(d) {
  if (!d) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function pad(n) { return String(n).padStart(2, "0"); }

function FlightCalendar({ value, onChange, onClose }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return (
    <div className="fp-cal">
      <div className="fp-cal-hdr">
        <button className="fp-cal-nav" onClick={() => setView(v => v.m === 0 ? {y: v.y-1, m:11} : {y:v.y, m:v.m-1})}>‹</button>
        <span className="fp-cal-mon">{MONTHS[view.m]} {view.y}</span>
        <button className="fp-cal-nav" onClick={() => setView(v => v.m === 11 ? {y: v.y+1, m:0} : {y:v.y, m:v.m+1})}>›</button>
      </div>
      <div className="fp-cal-grid">
        {DOW.map(d => <div key={d} className="fp-dow">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dt = new Date(view.y, view.m, d); dt.setHours(0,0,0,0);
          const isSel = value && dt.toDateString() === value.toDateString();
          const isDis = dt < today;
          return (
            <div key={i} className={`fp-day${isSel ? " sel" : ""}${isDis ? " dis" : ""}`}
              onClick={() => { if (!isDis) { onChange(dt); onClose(); } }}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaxDropdown({ pax, onChange, onClose }) {
  const rows = [
    { key: "adults", label: "Adults", sub: "12+ years", min: 1 },
    { key: "children", label: "Children", sub: "2–11 years", min: 0 },
    { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
  ];
  return (
    <div className="fp-pax-drop">
      {rows.map(r => (
        <div key={r.key} className="fp-pax-row">
          <div className="fp-pax-info">
            <div className="fp-pax-lbl">{r.label}</div>
            <div className="fp-pax-sub">{r.sub}</div>
          </div>
          <div className="fp-pax-ctrl">
            <button className="fp-pax-btn" disabled={pax[r.key] <= r.min}
              onClick={() => onChange({...pax, [r.key]: pax[r.key] - 1})}>−</button>
            <span className="fp-pax-count">{pax[r.key]}</span>
            <button className="fp-pax-btn" disabled={pax[r.key] >= 9}
              onClick={() => onChange({...pax, [r.key]: pax[r.key] + 1})}>+</button>
          </div>
        </div>
      ))}
      <div style={{display:"flex", justifyContent:"flex-end", marginTop:10}}>
        <button style={{background:"#3d0099",color:"#fff",border:"none",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontWeight:600,fontFamily:"inherit",fontSize:".76rem"}} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function parseFlightResults(data) {
  try {
    const raw = data?.Response?.Results ?? data?.Results ?? [];
    const outer = Array.isArray(raw) ? raw : [raw];
    const flattened = outer.flatMap((item) => (Array.isArray(item) ? item : [item]));
    return flattened
      .filter((item) => item && typeof item === "object" && (item.Segments || item.Fare))
      .slice(0, 60);
  } catch { return []; }
}

function formatMinutes(min) {
  if (!min) return "";
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getFlightInfo(r) {
  const seg = r?.Segments?.[0]?.[0] ?? r?.Segments?.[0] ?? {};
  const origin = seg.Origin?.Airport?.AirportCode ?? r?.Origin ?? "—";
  const dest = seg.Destination?.Airport?.AirportCode ?? r?.Destination ?? "—";
  const dep = seg.Origin?.DepTime ?? "";
  const arr = seg.Destination?.ArrTime ?? "";
  const code = seg.Airline?.AirlineCode ?? r?.AirlineCode ?? "";
  const flightNum = seg.Airline?.FlightNumber ?? "";
  const cabinClass = seg.CabinBaggage ?? seg.Baggage ?? "";
  const stops = (r?.Segments?.[0]?.length ?? 1) - 1;
  const duration = seg.Duration ?? r?.Duration ?? 0;
  const fare = r?.Fare?.PublishedFare ?? r?.Fare?.OfferedFare ?? r?.TotalFare ?? 0;
  const baseFare = r?.Fare?.BaseFare ?? 0;
  const tax = r?.Fare?.Tax ?? 0;
  const allSegs = r?.Segments?.[0] ?? (r?.Segments ?? []);
  return { origin, dest, dep, arr, code, flightNum, stops, duration, fare, baseFare, tax, cabinClass, allSegs, raw: r };
}

function FlightCard({ flight, pax }) {
  const [expanded, setExpanded] = useState(false);
  const info = getFlightInfo(flight);
  const airline = AIRLINES[info.code] || { name: info.code || "Airline", emoji: "✈️" };
  const depTime = info.dep ? new Date(info.dep).toTimeString().slice(0,5) : "—";
  const arrTime = info.arr ? new Date(info.arr).toTimeString().slice(0,5) : "—";
  const depDate = info.dep ? formatDateStr(new Date(info.dep)) : "";
  const arrDate = info.arr ? formatDateStr(new Date(info.arr)) : "";
  const price = Number(info.fare).toFixed(0);
  const totalPax = (pax?.adults || 1) + (pax?.children || 0);
  const totalPrice = (Number(info.fare) * totalPax).toFixed(0);

  return (
    <div className="fp-card">
      <div className="fp-card-main">
        <div className="fp-airline-logo">{airline.emoji}</div>
        <div className="fp-airline-info">
          <div className="fp-airline-name">{airline.name}</div>
          <div className="fp-flight-no">{info.code}{info.flightNum} · {info.cabinClass || "Economy"}</div>
        </div>
        <div className="fp-route">
          <div className="fp-city-block">
            <div className="fp-city-time">{depTime}</div>
            <div className="fp-city-code">{info.origin}</div>
            <div className="fp-city-date">{depDate}</div>
          </div>
          <div className="fp-route-middle">
            <div className="fp-duration">{formatMinutes(info.duration)}</div>
            <div className="fp-route-line" />
            <div className={`fp-stops${info.stops === 0 ? " non" : ""}`}>
              {info.stops === 0 ? "Non-stop" : `${info.stops} stop${info.stops > 1 ? "s" : ""}`}
            </div>
          </div>
          <div className="fp-city-block">
            <div className="fp-city-time">{arrTime}</div>
            <div className="fp-city-code">{info.dest}</div>
            <div className="fp-city-date">{arrDate}</div>
          </div>
        </div>
        <div className="fp-price-block">
          <div className="fp-price">₹{Number(price).toLocaleString("en-IN")}</div>
          <div className="fp-price-sub">per person · all incl.</div>
          {totalPax > 1 && <div className="fp-price-old">Total ₹{Number(totalPrice).toLocaleString("en-IN")}</div>}
        </div>
      </div>
      <div className="fp-card-actions">
        <div className="fp-tags">
          {info.stops === 0 && <span className="fp-tag green">✓ Non-stop</span>}
          {info.cabinClass && <span className="fp-tag">{info.cabinClass}</span>}
          <span className="fp-tag orange">Refundable</span>
        </div>
        <div className="fp-card-btns">
          <button className="fp-detail-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? "Hide Details" : "Flight Details"}
          </button>
          <button className="fp-book-btn">Book Now</button>
        </div>
      </div>
      {expanded && (
        <div className="fp-detail-panel">
          <div style={{fontSize:".74rem",fontWeight:700,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>Flight Details</div>
          {(Array.isArray(info.allSegs) ? info.allSegs : [info.allSegs]).map((seg, i) => {
            const s = seg?.Origin?.Airport;
            const e = seg?.Destination?.Airport;
            const d1 = seg?.Origin?.DepTime ? new Date(seg.Origin.DepTime) : null;
            const d2 = seg?.Destination?.ArrTime ? new Date(seg.Destination.ArrTime) : null;
            return (
              <div key={i} className="fp-seg">
                <div className="fp-seg-line">
                  <div className="fp-seg-dot" />
                  <div className="fp-seg-bar" />
                  <div className="fp-seg-dot" />
                </div>
                <div className="fp-seg-info">
                  <div className="fp-seg-time">{d1 ? d1.toTimeString().slice(0,5) : "—"} · {s?.AirportCode ?? "—"}</div>
                  <div className="fp-seg-airport">{s?.AirportName ?? ""} {s?.CityName ? `· ${s.CityName}` : ""}</div>
                  <div className="fp-seg-dur">✈ {formatMinutes(seg?.Duration)} flight · {seg?.Airline?.AirlineCode}{seg?.Airline?.FlightNumber}</div>
                  <div className="fp-seg-time">{d2 ? d2.toTimeString().slice(0,5) : "—"} · {e?.AirportCode ?? "—"}</div>
                  <div className="fp-seg-airport">{e?.AirportName ?? ""} {e?.CityName ? `· ${e.CityName}` : ""}</div>
                </div>
              </div>
            );
          })}
          <div className="fp-fare-summary">
            <div style={{fontSize:".74rem",fontWeight:700,color:"#1e293b",marginBottom:8}}>Fare Breakdown</div>
            <div className="fp-fare-row"><span>Base Fare (×{totalPax})</span><span>₹{(Number(info.baseFare)*totalPax).toLocaleString("en-IN")}</span></div>
            <div className="fp-fare-row"><span>Taxes & Fees</span><span>₹{(Number(info.tax)*totalPax).toLocaleString("en-IN")}</span></div>
            <div className="fp-fare-row total"><span>Total Amount</span><span>₹{Number(totalPrice).toLocaleString("en-IN")}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightsPage() {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState({ code: "DEL", city: "New Delhi" });
  const [to, setTo] = useState({ code: "BOM", city: "Mumbai" });
  const [depDate, setDepDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; });
  const [retDate, setRetDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d; });
  const [pax, setPax] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState("Economy");

  const [openPanel, setOpenPanel] = useState(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");

  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);
  const [calendarFares, setCalendarFares] = useState([]);
  const [cheapestMonths, setCheapestMonths] = useState([]);
  const [calendarFlexDays, setCalendarFlexDays] = useState(3);
  const [autoSearchPending, setAutoSearchPending] = useState(false);
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(() => {
    try { return localStorage.getItem("voyagehack.flightPriceAlert") === "1"; } catch { return false; }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpenPanel(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("voyagehack.flight.prefill") || "{}");
      if (saved.from?.code && saved.to?.code) {
        setFrom(saved.from);
        setTo(saved.to);
        setAutoSearchPending(true);
      }
      if (saved.depDate) {
        const dep = new Date(saved.depDate);
        if (!Number.isNaN(dep.getTime())) setDepDate(dep);
      }
      if (saved.retDate) {
        const ret = new Date(saved.retDate);
        if (!Number.isNaN(ret.getTime())) setRetDate(ret);
      }
      if (saved.tripType) setTripType(saved.tripType);
      if (saved.cabin) setCabin(saved.cabin);
      if (saved.pax) setPax({
        adults: Number(saved.pax.adults || 1),
        children: Number(saved.pax.children || 0),
        infants: Number(saved.pax.infants || 0),
      });
    } catch {
      // Ignore malformed local storage payloads.
    }
  }, []);

  useEffect(() => {
    if (!autoSearchPending) return;
    setAutoSearchPending(false);
    handleSearch();
  }, [autoSearchPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFrom = (fromQuery
    ? AIRPORTS.filter(a => a.code.toLowerCase().includes(fromQuery.toLowerCase()) || a.city.toLowerCase().includes(fromQuery.toLowerCase()))
    : AIRPORTS).slice(0, 8);

  const filteredTo = (toQuery
    ? AIRPORTS.filter(a => a.code.toLowerCase().includes(toQuery.toLowerCase()) || a.city.toLowerCase().includes(toQuery.toLowerCase()))
    : AIRPORTS).slice(0, 8);

  function swapCities() {
    setFrom(to);
    setTo(from);
  }

  function fmtDate(d) {
    if (!d) return "";
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function paxLabel() {
    const total = pax.adults + pax.children + (pax.infants || 0);
    return `${total} Traveller${total !== 1 ? "s" : ""}, ${cabin}`;
  }

  async function handleSearch() {
    if (!from.code || !to.code || !depDate) { setError("Please fill in all required fields."); return; }
    setError(null);
    setLoading(true);
    setSearched(true);
    setFlights([]);
    try {
      const payload = {
        EndUserIp: "122.160.30.1",
        TokenId: "", // filled by backend after auth
        AdultCount: String(pax.adults),
        ChildCount: String(pax.children),
        InfantCount: String(pax.infants || 0),
        DirectFlight: "false",
        OneStopFlight: "false",
        JourneyType: tripType === "oneway" ? "1" : tripType === "roundtrip" ? "2" : "3",
        PreferredAirlines: null,
        Segments: [
          {
            Origin: from.code,
            Destination: to.code,
            FlightCabinClass: cabin === "Economy" ? "1" : cabin === "Business" ? "3" : cabin === "First" ? "4" : "2",
            PreferredDepartureTime: `${fmtDate(depDate)}T00:00:00`,
            PreferredArrivalTime: `${fmtDate(depDate)}T00:00:00`,
          },
          ...(tripType === "roundtrip" && retDate ? [{
            Origin: to.code,
            Destination: from.code,
            FlightCabinClass: cabin === "Economy" ? "1" : "3",
            PreferredDepartureTime: `${fmtDate(retDate)}T00:00:00`,
            PreferredArrivalTime: `${fmtDate(retDate)}T00:00:00`,
          }] : []),
        ],
        Sources: null,
      };
      const data = await apiPost("search", payload);
      const providerStatus = Number(data?.Response?.ResponseStatus);
      const providerError = data?.Response?.Error?.ErrorMessage;
      if (providerStatus === 2) {
        throw new Error(providerError || "No flights found for this route and date. Try different dates or airports.");
      }
      const results = parseFlightResults(data);
      if (results.length === 0) {
        throw new Error(providerError || "No flights found for this route and date. Try different dates or airports.");
      }
      setFlights(results);
    } catch (e) {
      setError(e.message || "Failed to search flights. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendarFares() {
    if (!from.code || !to.code || !depDate) {
      setError("Select origin, destination and departure date before checking calendar fare.");
      return;
    }
    setError(null);
    setCalendarLoading(true);
    try {
      const data = await apiPost("calendar-fares", {
        Origin: from.code,
        Destination: to.code,
        StartDate: fmtDate(depDate),
        Days: 14,
        FlexDays: calendarFlexDays,
        EndDate: tripType === "roundtrip" && retDate ? fmtDate(retDate) : null,
        IncludeRoundTrip: tripType === "roundtrip",
        IncludeMonthView: true,
        FlightCabinClass: cabin === "Economy" ? "1" : cabin === "Business" ? "3" : cabin === "First" ? "4" : "2",
        AdultCount: String(pax.adults),
        ChildCount: String(pax.children),
        InfantCount: String(pax.infants || 0),
        JourneyType: tripType === "roundtrip" ? "2" : "1",
      });
      setCalendarFares(Array.isArray(data.fares) ? data.fares : []);
      setCheapestMonths(Array.isArray(data.cheapestMonthView) ? data.cheapestMonthView : []);
    } catch (e) {
      setError(e.message || "Failed to fetch calendar fares.");
      setCalendarFares([]);
      setCheapestMonths([]);
    } finally {
      setCalendarLoading(false);
    }
  }

  const sortedFlights = [...flights].sort((a, b) => {
    const ia = getFlightInfo(a), ib = getFlightInfo(b);
    if (sortBy === "price") return Number(ia.fare) - Number(ib.fare);
    if (sortBy === "duration") return Number(ia.duration) - Number(ib.duration);
    if (sortBy === "departure") {
      const ta = ia.dep ? new Date(ia.dep).getTime() : 0;
      const tb = ib.dep ? new Date(ib.dep).getTime() : 0;
      return ta - tb;
    }
    return 0;
  });

  const navItems = [
    { id: "flights", label: "Flights", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg> },
    { id: "hotels", label: "Hotels", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
    { id: "cabs", label: "Cabs", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { id: "carrental", label: "Car Rental", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="fp-wrap">
        {/* Header */}
        <header className="fp-hdr">
          <div className="fp-logo">
            <span className="fp-logo-v">Voyage</span>
            <span className="fp-logo-fly">Fly</span>
          </div>
          <div className="fp-hdr-right">
            <button className="fp-back-btn" onClick={() => navigate("/results")}>
              ← Home
            </button>
          </div>
        </header>

        <ServiceNav />


        {/* Content */}
        <div className="fp-content" ref={panelRef}>
          {error && (
            <div className="fp-err">
              <span className="fp-err-txt">⚠ {error}</span>
              <button className="fp-err-x" onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {/* Search Box */}
          <div className="fp-sbox">
            {/* Trip type */}
            <div className="fp-trip-tabs">
              {["oneway","roundtrip","multicity"].map(t => (
                <button key={t} className={`fp-tt${tripType === t ? " act" : ""}`}
                  onClick={() => setTripType(t)}>
                  {t === "oneway" ? "One Way" : t === "roundtrip" ? "Round Trip" : "Multi-City"}
                </button>
              ))}
            </div>

            <div className="fp-srow1">
              {/* From */}
              <div className="fp-f city" style={{position:"relative"}}>
                <div className="fp-lbl">FROM</div>
                <div className="fp-fin" onClick={() => setOpenPanel(openPanel === "from" ? null : "from")}>
                  <div className="fp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="fp-fval" style={{fontSize:"1.1rem",fontWeight:800}}>{from.code}</div>
                    <div className="fp-fval" style={{fontSize:".72rem",color:"#64748b"}}>{from.city}</div>
                  </div>
                </div>
                {openPanel === "from" && (
                  <div className="fp-drop" style={{minWidth:280}}>
                    <div style={{padding:"10px 12px 6px"}}>
                      <input style={{width:"100%",border:"1.5px solid #d4a0ff",borderRadius:8,padding:"7px 10px",fontSize:".82rem",fontFamily:"inherit",outline:"none"}}
                        placeholder="Search city or airport..." value={fromQuery} onChange={e => setFromQuery(e.target.value)} autoFocus />
                    </div>
                    {filteredFrom.map(a => (
                      <div key={a.code} className="fp-drop-item" onClick={() => { setFrom({code:a.code,city:a.city}); setOpenPanel(null); setFromQuery(""); }}>
                        <span className="fp-drop-code">{a.code}</span>
                        <div className="fp-drop-name">
                          <div style={{fontWeight:600,fontSize:".8rem"}}>{a.city}</div>
                          <div style={{fontSize:".66rem",color:"#94a3b8"}}>{a.name} · {a.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap */}
              <button className="fp-swap" onClick={swapCities} title="Swap cities">⇄</button>

              {/* To */}
              <div className="fp-f city" style={{position:"relative"}}>
                <div className="fp-lbl">TO</div>
                <div className="fp-fin" onClick={() => setOpenPanel(openPanel === "to" ? null : "to")}>
                  <div className="fp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="fp-fval" style={{fontSize:"1.1rem",fontWeight:800}}>{to.code}</div>
                    <div className="fp-fval" style={{fontSize:".72rem",color:"#64748b"}}>{to.city}</div>
                  </div>
                </div>
                {openPanel === "to" && (
                  <div className="fp-drop" style={{minWidth:280}}>
                    <div style={{padding:"10px 12px 6px"}}>
                      <input style={{width:"100%",border:"1.5px solid #d4a0ff",borderRadius:8,padding:"7px 10px",fontSize:".82rem",fontFamily:"inherit",outline:"none"}}
                        placeholder="Search city or airport..." value={toQuery} onChange={e => setToQuery(e.target.value)} autoFocus />
                    </div>
                    {filteredTo.map(a => (
                      <div key={a.code} className="fp-drop-item" onClick={() => { setTo({code:a.code,city:a.city}); setOpenPanel(null); setToQuery(""); }}>
                        <span className="fp-drop-code">{a.code}</span>
                        <div className="fp-drop-name">
                          <div style={{fontWeight:600,fontSize:".8rem"}}>{a.city}</div>
                          <div style={{fontSize:".66rem",color:"#94a3b8"}}>{a.name} · {a.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Departure date */}
              <div className="fp-f dt" style={{position:"relative"}}>
                <div className="fp-lbl">DEPARTURE</div>
                <div className="fp-fin" onClick={() => setOpenPanel(openPanel === "dep" ? null : "dep")}>
                  <div className="fp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <div>
                    <div className={`fp-fval${!depDate?" ph":""}`} style={{fontSize:".84rem",fontWeight:700}}>{depDate ? `${MONTHS[depDate.getMonth()]} ${depDate.getDate()}` : "Select"}</div>
                    <div style={{fontSize:".64rem",color:"#94a3b8"}}>{depDate ? depDate.getFullYear() : ""}</div>
                  </div>
                </div>
                {openPanel === "dep" && (
                  <div className="fp-drop right"><FlightCalendar value={depDate} onChange={setDepDate} onClose={() => setOpenPanel(null)} /></div>
                )}
              </div>

              {/* Return date (roundtrip) */}
              {tripType === "roundtrip" && (
                <div className="fp-f dt" style={{position:"relative"}}>
                  <div className="fp-lbl">RETURN</div>
                  <div className="fp-fin" onClick={() => setOpenPanel(openPanel === "ret" ? null : "ret")}>
                    <div className="fp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                    <div>
                      <div className={`fp-fval${!retDate?" ph":""}`} style={{fontSize:".84rem",fontWeight:700}}>{retDate ? `${MONTHS[retDate.getMonth()]} ${retDate.getDate()}` : "Select"}</div>
                      <div style={{fontSize:".64rem",color:"#94a3b8"}}>{retDate ? retDate.getFullYear() : ""}</div>
                    </div>
                  </div>
                  {openPanel === "ret" && (
                    <div className="fp-drop right"><FlightCalendar value={retDate} onChange={setRetDate} onClose={() => setOpenPanel(null)} /></div>
                  )}
                </div>
              )}
            </div>

            <div className="fp-srow2">
              {/* Passengers */}
              <div className="fp-f pax" style={{position:"relative"}}>
                <div className="fp-lbl">TRAVELLERS & CLASS</div>
                <div className="fp-fin" onClick={() => setOpenPanel(openPanel === "pax" ? null : "pax")}>
                  <div className="fp-fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
                  <span className={`fp-fval${!pax ? " ph" : ""}`}>{paxLabel()}</span>
                </div>
                {openPanel === "pax" && (
                  <div className="fp-drop">
                    <PaxDropdown pax={pax} onChange={setPax} onClose={() => setOpenPanel(null)} />
                    <div style={{borderTop:"1px solid #f0e8ff",padding:"10px 14px"}}>
                      <div style={{fontSize:".72rem",fontWeight:700,color:"#64748b",marginBottom:8}}>CABIN CLASS</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {["Economy","Premium Economy","Business","First Class"].map(c => (
                          <button key={c} onClick={() => setCabin(c)} style={{padding:"5px 11px",borderRadius:16,border:`1.5px solid ${cabin===c?"#3d0099":"#e2e8f0"}`,background:cabin===c?"#3d0099":"#fff",color:cabin===c?"#fff":"#64748b",fontSize:".68rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className="fp-sbtn" onClick={handleSearch} disabled={loading}>
                {loading ? <><div className="fp-spin" />Searching...</> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search Flights</>}
              </button>
              <button className="fp-sbtn" onClick={loadCalendarFares} disabled={calendarLoading} style={{background:"linear-gradient(135deg,#0f766e,#0d9488)"}}>
                {calendarLoading ? <><div className="fp-spin" />Loading...</> : "Calendar Fare"}
              </button>
              <button
                className="fp-sbtn"
                type="button"
                onClick={() => setCalendarFlexDays(3)}
                style={{background:calendarFlexDays === 3 ? "linear-gradient(135deg,#0f766e,#0d9488)" : "linear-gradient(135deg,#64748b,#475569)"}}
              >
                Â±3 Days
              </button>
              <button
                className="fp-sbtn"
                type="button"
                onClick={() => setCalendarFlexDays(7)}
                style={{background:calendarFlexDays === 7 ? "linear-gradient(135deg,#0f766e,#0d9488)" : "linear-gradient(135deg,#64748b,#475569)"}}
              >
                Â±7 Days
              </button>
            </div>
          </div>

          {calendarFares.length > 0 && (
            <div className="fp-sbox" style={{padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
                <div style={{fontSize:".9rem",fontWeight:700,color:"#1e293b"}}>
                  14-Day Calendar Fare: {from.code} → {to.code}
                </div>
                <div style={{fontSize:".68rem",color:"#64748b"}}>
                  Green = cheaper, Yellow = medium, Red = expensive
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !priceAlertEnabled;
                    setPriceAlertEnabled(next);
                    try { localStorage.setItem("voyagehack.flightPriceAlert", next ? "1" : "0"); } catch { void 0; }
                  }}
                  style={{
                    border:`1px solid ${priceAlertEnabled ? "#16a34a" : "#cbd5e1"}`,
                    background:priceAlertEnabled ? "#16a34a" : "#fff",
                    color:priceAlertEnabled ? "#fff" : "#334155",
                    borderRadius:999,
                    fontSize:".64rem",
                    fontWeight:700,
                    padding:"4px 10px",
                    cursor:"pointer",
                  }}
                >
                  {priceAlertEnabled ? "Price Alert On" : "Enable Price Alert"}
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                {calendarFares.map((f) => {
                  const bg = f.level === "low" ? "#dcfce7" : f.level === "mid" ? "#fef9c3" : f.level === "high" ? "#fee2e2" : "#f8fafc";
                  const bd = f.level === "low" ? "#86efac" : f.level === "mid" ? "#fde047" : f.level === "high" ? "#fca5a5" : "#e2e8f0";
                  return (
                    <button
                      key={f.date}
                      type="button"
                      onClick={() => { const d = new Date(f.date); if (!Number.isNaN(d.getTime())) setDepDate(d); }}
                      title={
                        f?.detail
                          ? `${f.detail.airlineName || f.detail.airlineCode || "Airline"} | Stops: ${f.detail.stops || 0} | Duration: ${f.detail.durationMinutes || 0} mins`
                          : "No detail available"
                      }
                      style={{textAlign:"left",background:bg,border:`1.5px solid ${bd}`,borderRadius:10,padding:"9px 10px",cursor:"pointer",fontFamily:"inherit"}}
                    >
                      <div style={{fontSize:".68rem",color:"#475569",fontWeight:600}}>{f.date}</div>
                      <div style={{fontSize:".88rem",fontWeight:800,color:"#1e293b",marginTop:2}}>
                        {Number.isFinite(f.minFare) ? `₹${Math.round(f.minFare).toLocaleString("en-IN")}` : "N/A"}
                      </div>
                      {f.isLowest && <div style={{fontSize:".6rem",fontWeight:700,color:"#166534",marginTop:3}}>Lowest Fare</div>}
                      {f.roundTrip && Number.isFinite(f.roundTrip.fare) && (
                        <div style={{fontSize:".6rem",fontWeight:700,color:"#0f766e",marginTop:3}}>
                          RT: â‚¹{Math.round(f.roundTrip.fare).toLocaleString("en-IN")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {cheapestMonths.length > 0 && (
            <div className="fp-sbox" style={{padding:"12px 16px"}}>
              <div style={{fontSize:".78rem",fontWeight:700,color:"#334155",marginBottom:8}}>Cheapest Month View</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
                {cheapestMonths.map((m) => (
                  <div key={m.month} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:"8px 10px",background:"#f8fafc"}}>
                    <div style={{fontSize:".68rem",fontWeight:700,color:"#334155"}}>{m.month}</div>
                    <div style={{fontSize:".8rem",fontWeight:800,color:"#0f172a",marginTop:2}}>â‚¹{Math.round(m.lowestFare || 0).toLocaleString("en-IN")}</div>
                    <div style={{fontSize:".58rem",color:"#64748b",marginTop:2}}>Date: {m.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {loading && (
            <div className="fp-loading">
              <div className="fp-spin" />
              Searching for the best flights on your route...
            </div>
          )}

          {!loading && searched && (
            <div className="fp-results">
              <div className="fp-results-hdr">
                <div>
                  <div className="fp-results-title">
                    {from.city} → {to.city} · {sortedFlights.length} flights found
                  </div>
                  <div className="fp-results-sub">{formatDateStr(depDate)} · {pax.adults + pax.children} traveller{pax.adults + pax.children > 1 ? "s" : ""}</div>
                </div>
                <div className="fp-sort">
                  <span style={{fontSize:".72rem",fontWeight:600,color:"#64748b",alignSelf:"center"}}>Sort:</span>
                  {[{id:"price",label:"Cheapest"},{id:"duration",label:"Fastest"},{id:"departure",label:"Earliest"}].map(s => (
                    <button key={s.id} className={`fp-sort-btn${sortBy===s.id?" act":""}`} onClick={() => setSortBy(s.id)}>{s.label}</button>
                  ))}
                </div>
              </div>

              {sortedFlights.length > 0 ? sortedFlights.map((f, i) => (
                <FlightCard key={i} flight={f} pax={pax} />
              )) : (
                <div className="fp-empty">
                  <div className="fp-empty-icon">✈️</div>
                  <div className="fp-empty-title">No flights found</div>
                  <div className="fp-empty-sub">Try different dates, airports, or filters</div>
                </div>
              )}
            </div>
          )}

          {!searched && !loading && (
            <div className="fp-empty">
              <div className="fp-empty-icon">✈️</div>
              <div className="fp-empty-title">Search for Flights</div>
              <div className="fp-empty-sub">Enter your route and travel dates to find the best deals on flights worldwide.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
