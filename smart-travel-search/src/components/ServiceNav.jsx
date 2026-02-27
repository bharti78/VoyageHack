/**
 * ServiceNav.jsx
 * A consistent service navigation bar shown on all result pages.
 * Shows icons for Flights, Hotels, Cabs, Car Rentals.
 * Highlights the current active page.
 */
import { useNavigate, useLocation } from "react-router-dom";

const SERVICE_NAV_CSS = `
  .service-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .service-nav-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 4px;
    white-space: nowrap;
  }
  .service-nav-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .service-nav-btn:hover {
    border-color: #6d28d9;
    background: #f5f3ff;
    color: #6d28d9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(109,40,217,0.12);
  }
  .service-nav-btn.active {
    background: #6d28d9;
    color: #fff;
    border-color: #6d28d9;
    box-shadow: 0 3px 10px rgba(109,40,217,0.3);
  }
  .service-nav-btn .sn-icon {
    font-size: 1rem;
    line-height: 1;
  }
  .service-nav-divider {
    width: 1px;
    height: 20px;
    background: #e2e8f0;
    margin: 0 4px;
    flex-shrink: 0;
  }
  .service-nav-context {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  .service-nav-context-badge {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 0.65rem;
    font-weight: 700;
  }
  @media (max-width: 640px) {
    .service-nav {
      padding: 8px 12px;
      gap: 6px;
    }
    .service-nav-btn {
      padding: 6px 10px;
      font-size: 0.72rem;
    }
    .service-nav-label { display: none; }
    .service-nav-context { display: none; }
  }
`;

const SERVICES = [
  { id: "flights", path: "/flights", label: "Flights", icon: "✈️" },
  { id: "hotels", path: "/hotels", label: "Hotels", icon: "🏨" },
  { id: "cabs", path: "/cabs", label: "Cabs", icon: "🚕" },
  { id: "carrental", path: "/carrental", label: "Car Rental", icon: "🚗" },
];

function safeReadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write issues.
  }
}

function buildIsoDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function persistContextForRoute(path, ctx) {
  if (!ctx || typeof ctx !== "object") return;

  const unifiedExisting = safeReadJSON("voyagehack.unifiedSearch");
  const hotelExisting = safeReadJSON("voyagehack.hotel.prefill");

  const destination = String(ctx.destination || unifiedExisting.destination || "").trim();
  const fromCity = String(ctx.fromCity || unifiedExisting.fromCity || "").trim();
  const startDate = buildIsoDate(ctx.startDate || unifiedExisting.startDate);
  const endDate = buildIsoDate(ctx.endDate || unifiedExisting.endDate);
  const adults = Number(ctx?.guests?.adults ?? unifiedExisting?.guests?.adults ?? 1);
  const children = Number(ctx?.guests?.children ?? unifiedExisting?.guests?.children ?? 0);
  const infants = Number(ctx?.guests?.infants ?? unifiedExisting?.guests?.infants ?? 0);
  const budgetMax = Number(ctx?.budget?.maxValue ?? unifiedExisting?.budget?.maxValue ?? 0);

  const unifiedNext = {
    ...unifiedExisting,
    destination: destination || unifiedExisting.destination || "",
    fromCity: fromCity || unifiedExisting.fromCity || "",
    startDate: startDate || unifiedExisting.startDate || "",
    endDate: endDate || unifiedExisting.endDate || "",
    guests: {
      ...(unifiedExisting.guests || {}),
      adults: Number.isFinite(adults) ? Math.max(1, adults) : 1,
      children: Number.isFinite(children) ? Math.max(0, children) : 0,
      infants: Number.isFinite(infants) ? Math.max(0, infants) : 0,
    },
    budget: {
      ...(unifiedExisting.budget || {}),
      maxValue: Number.isFinite(budgetMax) ? Math.max(0, budgetMax) : 0,
    },
  };

  safeWriteJSON("voyagehack.unifiedSearch", unifiedNext);

  if (path === "/hotels" && destination) {
    const hotelNext = {
      ...hotelExisting,
      destination,
      startDate: startDate || hotelExisting.startDate || "",
      endDate: endDate || hotelExisting.endDate || "",
      adults: Number.isFinite(adults) ? Math.max(1, adults) : 1,
      children: Number.isFinite(children) ? Math.max(0, children) : 0,
      budget: Number.isFinite(budgetMax) ? Math.max(0, budgetMax) : 0,
    };
    safeWriteJSON("voyagehack.hotel.prefill", hotelNext);
  }
}

export default function ServiceNav({ searchContext }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Read from localStorage if not passed
  let ctx = searchContext;
  if (!ctx) {
    try {
      const raw = localStorage.getItem("voyagehack.unifiedSearch");
      ctx = raw ? JSON.parse(raw) : null;
    } catch { ctx = null; }
  }

  const destination = ctx?.destination || "";
  const fromCity = ctx?.fromCity || "";
  const query = ctx?.query || "";
  const contextLabel = fromCity && destination
    ? `${fromCity} → ${destination}`
    : destination
    ? destination
    : query
    ? query.slice(0, 40)
    : "";

  return (
    <>
      <style>{SERVICE_NAV_CSS}</style>
      <nav className="service-nav">
        <span className="service-nav-label">Explore:</span>
        {SERVICES.map((svc) => {
          const isActive = location.pathname === svc.path;
          return (
            <button
              key={svc.id}
              type="button"
              className={`service-nav-btn${isActive ? " active" : ""}`}
              onClick={() => {
                if (isActive) return;
                persistContextForRoute(svc.path, ctx);
                navigate(svc.path);
              }}
            >
              <span className="sn-icon">{svc.icon}</span>
              {svc.label}
            </button>
          );
        })}
        {contextLabel && (
          <>
            <div className="service-nav-divider" />
            <span className="service-nav-context">
              <span className="service-nav-context-badge">Search</span>
              {contextLabel}
            </span>
          </>
        )}
      </nav>
    </>
  );
}
