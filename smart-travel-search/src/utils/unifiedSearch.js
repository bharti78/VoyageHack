/**
 * unifiedSearch.js
 * Central utility for creating, storing, and reading the unified search object.
 * ALL search entry points (filter, voice, image, text) must call buildAndStore()
 * before navigating to /results.
 */

const KEY = "voyagehack.unifiedSearch";

/** Detect the primary intent service from a free-text query */
export function detectIntentService(query = "") {
  const q = String(query).toLowerCase();
  if (q.includes("flight") || q.includes("fly") || q.includes("air")) return "flights";
  if (q.includes("hotel") || q.includes("stay") || q.includes("room")) return "hotels";
  if (q.includes("cab") || q.includes("taxi")) return "cabs";
  if (q.includes("car rental") || q.includes("self drive") || q.includes("rent a car")) return "carrental";
  return "all";
}

/**
 * Build a structured unified search object from any input source and persist it.
 *
 * @param {Object} params
 * @param {"filter"|"text"|"voice"|"image"|"chat"} params.inputType
 * @param {string}  params.query            - raw user query (text/voice) or filename (image)
 * @param {string}  params.destination      - city / place name
 * @param {Object}  params.destinationObject - { city, country, … }
 * @param {string|Date|null} params.startDate
 * @param {string|Date|null} params.endDate
 * @param {Object}  params.guests           - { adults, children, infants }
 * @param {Object}  params.budget           - { selectedBudget: string|null, maxValue: number }
 * @param {string[]} params.selectedTypes   - ["hotels","flights",…]
 * @param {string}  params.intentService    - override auto-detected intent
 * @param {string}  params.uploadedImage    - base64 for image searches
 * @param {Object}  params.intent           - parsed AI intent object
 * @param {string}  params.source           - originating page/component
 * @returns {Object} the unified search object
 */
export function buildAndStore(params = {}) {
  const {
    inputType = "filter",
    query = "",
    destination = "",
    destinationObject = {},
    startDate = null,
    endDate = null,
    guests = { adults: 1, children: 0, infants: 0 },
    budget = { selectedBudget: null, maxValue: 0 },
    selectedTypes = [],
    intentService,
    uploadedImage = "",
    intent = {},
    source = "unknown",
  } = params;

  const unified = {
    source,
    inputType,
    query,
    destination: destination || destinationObject?.city || query || "Goa",
    destinationObject,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    guests: {
      adults: Math.max(1, Number(guests.adults ?? 1)),
      children: Math.max(0, Number(guests.children ?? 0)),
      infants: Math.max(0, Number(guests.infants ?? 0)),
    },
    budget: {
      selectedBudget: budget.selectedBudget ?? null,
      maxValue: Number(budget.maxValue ?? 0),
    },
    selectedTypes,
    intentService: intentService ?? detectIntentService(query),
    uploadedImage,
    intent,
    createdAt: Date.now(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(unified));
  } catch {
    // storage might be full – ignore
  }

  return unified;
}

/** Read the current unified search object from storage */
export function readUnified() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Merge a partial update into the stored unified search object and re-save */
export function mergeAndStore(partial = {}) {
  const current = readUnified() ?? {};
  return buildAndStore({ ...current, ...partial });
}
