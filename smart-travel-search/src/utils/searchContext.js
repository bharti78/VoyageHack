/**
 * searchContext.js
 * Utilities for reading and writing the unified search context
 * shared across all result pages (Flights, Hotels, Cabs, Car Rentals).
 */

const SEARCH_KEY = "voyagehack.unifiedSearch";
const RESULTS_KEY = "voyagehack.unifiedResults";
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Store the unified search context */
export function storeSearchContext(ctx) {
  try {
    localStorage.setItem(SEARCH_KEY, JSON.stringify({ ...ctx, _ts: Date.now() }));
  } catch { /* ignore */ }
}

/** Read the unified search context */
export function readSearchContext() {
  try {
    const raw = localStorage.getItem(SEARCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Store fetched results from backend */
export function storeUnifiedResults(data) {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify({ ...data, _ts: Date.now() }));
  } catch { /* ignore */ }
}

/** Read cached results */
export function readUnifiedResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 10 minutes
    if (Date.now() - (data._ts || 0) > 10 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}

/**
 * Execute a unified search against the backend.
 * Returns the full response object or throws on error.
 */
export async function executeUnifiedSearch(params) {
  const res = await fetch(`${API_ORIGIN}/api/unified-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Non-JSON response: ${text.slice(0, 200)}`); }
  if (json.error) throw new Error(json.error);
  return json;
}

/** Format a Date object as YYYY-MM-DD */
export function fmtYMD(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Build search params from homepage unified search object */
export function buildSearchParams(unified) {
  if (!unified) return {};
  return {
    query: unified.query || "",
    fromCity: unified.fromCity || "",
    toCity: unified.destination || "",
    startDate: unified.startDate,
    endDate: unified.endDate,
    adults: unified.guests?.adults || 1,
    children: unified.guests?.children || 0,
    infants: unified.guests?.infants || 0,
    budget: unified.budget?.maxValue || 0,
    persona: "",
    userGender: "",
  };
}
