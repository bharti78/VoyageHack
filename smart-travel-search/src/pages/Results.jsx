import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HomepageNavbar";

function money(v) {
  const value = Number(v || 0);
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function safetyModeLabel(mode) {
  if (mode === "female_only") return "Female-only drivers assigned";
  if (mode === "night_trusted_fallback") return "Night safety fallback: 4-5 star experienced drivers";
  if (mode === "fallback_no_female") return "Female driver unavailable, showing verified fallback";
  return "Standard verified driver allocation";
}

export default function Results() {
  const navigate = useNavigate();
  const [smartData] = useState(() => {
    try {
      const raw = localStorage.getItem("voyagehack.smartResults");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const error = smartData ? "" : "No smart search result available. Run a search first.";

  const hotels = useMemo(
    () => (Array.isArray(smartData?.realtime?.hotels?.items) ? smartData.realtime.hotels.items : []),
    [smartData]
  );
  const cabs = useMemo(
    () => (Array.isArray(smartData?.realtime?.cabs?.items) ? smartData.realtime.cabs.items : []),
    [smartData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm mb-5">
            {error}
          </div>
        )}

        {smartData && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
              <h1 className="text-2xl font-bold text-slate-900">Smart Trip Plan</h1>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Destination</div>
                  <div className="font-semibold text-slate-900">{smartData?.intent?.destination || "N/A"}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Trip Nights</div>
                  <div className="font-semibold text-slate-900">{smartData?.intent?.nights || 0}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Budget</div>
                  <div className="font-semibold text-slate-900">{money(smartData?.intent?.budget)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Cab Safety</div>
                  <div className="font-semibold text-slate-900">
                    {safetyModeLabel(smartData?.realtime?.cabs?.safetyMode)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">AI Budget Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="text-emerald-800">Flights</div>
                  <div className="font-bold text-emerald-900">{money(smartData?.budgetDistribution?.flights)}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="text-blue-800">Hotels</div>
                  <div className="font-bold text-blue-900">{money(smartData?.budgetDistribution?.hotels)}</div>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <div className="text-amber-800">Cab</div>
                  <div className="font-bold text-amber-900">{money(smartData?.budgetDistribution?.cabs)}</div>
                </div>
                <div className="rounded-xl bg-violet-50 p-3">
                  <div className="text-violet-800">Contingency</div>
                  <div className="font-bold text-violet-900">{money(smartData?.budgetDistribution?.contingency)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 xl:col-span-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Flights</h3>
                <p className="text-sm text-slate-600">
                  {smartData?.realtime?.flights?.source}
                </p>
                <p className="text-sm mt-3">
                  Recommended spend: <span className="font-semibold">{money(smartData?.realtime?.flights?.estimatedBudget)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/flights")}
                  className="mt-4 w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-700 transition"
                >
                  Open Flight Calendar
                </button>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 xl:col-span-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Hotels ({hotels.length})
                </h3>
                <div className="space-y-3 max-h-80 overflow-auto pr-1">
                  {hotels.length === 0 && <p className="text-sm text-slate-500">No hotels found in budget.</p>}
                  {hotels.slice(0, 8).map((h) => (
                    <div key={`${h._id || h.name}`} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{h.name}</p>
                      <p className="text-sm text-slate-600">{h.city}</p>
                      <p className="text-sm text-slate-800 mt-1">
                        Price: {money(h.price)} | Rating: {Number(h.rating || 0).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/hotels")}
                  className="mt-4 w-full rounded-xl bg-blue-700 text-white py-2.5 text-sm font-semibold hover:bg-blue-600 transition"
                >
                  Explore Hotels
                </button>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 xl:col-span-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Cabs ({cabs.length})
                </h3>
                <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 text-sm text-teal-800 mb-3">
                  {safetyModeLabel(smartData?.realtime?.cabs?.safetyMode)}
                </div>
                <div className="space-y-3 max-h-72 overflow-auto pr-1">
                  {cabs.length === 0 && <p className="text-sm text-slate-500">No verified drivers available.</p>}
                  {cabs.slice(0, 8).map((d) => (
                    <div key={`${d._id || d.name}`} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{d.name}</p>
                      <p className="text-sm text-slate-600">
                        {d.gender} | Rating {Number(d.rating || 0).toFixed(1)} | Exp {d.experienceYears || 0} yrs
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/cabs")}
                  className="mt-4 w-full rounded-xl bg-emerald-700 text-white py-2.5 text-sm font-semibold hover:bg-emerald-600 transition"
                >
                  Book Safe Cabs
                </button>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
