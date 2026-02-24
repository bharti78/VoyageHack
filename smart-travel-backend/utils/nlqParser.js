const KNOWN_CITIES = [
  "Mumbai",
  "New Delhi",
  "Delhi",
  "Goa",
  "Bangalore",
  "Bengaluru",
  "Kochi",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Jaipur",
  "Pune",
  "Ahmedabad",
  "Lucknow",
  "Varanasi",
  "Amritsar",
  "Srinagar",
  "Leh",
  "Manali",
  "Udaipur",
  "Rishikesh",
  "Kerala",
  "Dubai",
  "Singapore",
  "Bangkok",
  "London",
  "Paris",
];

function cleanToken(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function titleCase(text) {
  return cleanToken(text)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function parseBudget(query) {
  const text = String(query || "").toLowerCase();
  if (!text) return null;

  const lakh = text.match(/(?:under|below|within|around|upto|up to)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)\b/);
  if (lakh) return Math.round(Number(lakh[1]) * 100000);

  const thousand = text.match(/(?:under|below|within|around|upto|up to)?\s*(\d+(?:\.\d+)?)\s*k\b/);
  if (thousand) return Math.round(Number(thousand[1]) * 1000);

  const explicit = text.match(/(?:under|below|within|around|upto|up to|budget(?:\s*is)?|for)\s*(?:rs\.?|inr)?\s*(\d{3,8})\b/);
  if (explicit) return Number(explicit[1]);

  const plain = text.match(/\b(\d{4,8})\b/);
  if (plain) return Number(plain[1]);

  return null;
}

function parseDurationDays(query) {
  const text = String(query || "").toLowerCase();
  if (!text) return null;

  const dayMatch = text.match(/(\d+)\s*(?:day|days)\b/);
  if (dayMatch) return Math.max(1, Number(dayMatch[1]));

  const nightMatch = text.match(/(\d+)\s*(?:night|nights)\b/);
  if (nightMatch) return Math.max(1, Number(nightMatch[1]) + 1);

  if (/\bweekend\b/.test(text)) return 3;
  const week = text.match(/(\d+)\s*week(?:s)?\b/);
  if (week) return Math.max(1, Number(week[1]) * 7);
  if (/\bweek\b/.test(text)) return 7;

  return null;
}

function parseDateToken(token, now = new Date()) {
  const normalized = String(token || "").trim();
  if (!normalized) return null;

  const lower = normalized.toLowerCase();
  if (lower === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (lower === "tomorrow") return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (lower === "day after tomorrow") return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const d = new Date(`${normalized}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const slash = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const dd = Number(slash[1]);
    const mm = Number(slash[2]) - 1;
    const yy = Number(slash[3]) < 100 ? 2000 + Number(slash[3]) : Number(slash[3]);
    const d = new Date(yy, mm, dd);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  return null;
}

function findDates(query, now = new Date()) {
  const text = String(query || "");
  if (!text) return [];

  const matches = [];
  const patterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b(?:today|tomorrow|day after tomorrow)\b/gi,
    /\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{1,2}(?:,\s*\d{4})?\b/gi,
  ];

  for (const pattern of patterns) {
    const found = text.match(pattern) || [];
    for (const token of found) {
      const dt = parseDateToken(token, now);
      if (dt) matches.push(dt);
    }
  }

  return matches
    .sort((a, b) => a.getTime() - b.getTime())
    .filter((d, idx, arr) => idx === 0 || d.getTime() !== arr[idx - 1].getTime());
}

function parseSourceDestination(query) {
  const text = cleanToken(query);
  if (!text) return { source: "", destination: "" };

  const fromTo = text.match(/\bfrom\s+([a-zA-Z ]{2,40}?)\s+to\s+([a-zA-Z ]{2,40}?)(?=\s+(?:for|under|below|within|budget|on|starting|from|with)\b|[,.!?]|$)/i);
  if (fromTo) {
    return { source: titleCase(fromTo[1]), destination: titleCase(fromTo[2]) };
  }

  const toFrom = text.match(/\bto\s+([a-zA-Z ]{2,40}?)\s+from\s+([a-zA-Z ]{2,40}?)(?=\s+(?:for|under|below|within|budget|on|starting|with)\b|[,.!?]|$)/i);
  if (toFrom) {
    return { source: titleCase(toFrom[2]), destination: titleCase(toFrom[1]) };
  }

  const toOnly = text.match(/\bto\s+([a-zA-Z ]{2,40}?)(?=\s+(?:for|under|below|within|budget|on|starting|with|from)\b|[,.!?]|$)/i);
  const fromOnly = text.match(/\bfrom\s+([a-zA-Z ]{2,40}?)(?=\s+(?:to|for|under|below|within|budget|on|starting|with)\b|[,.!?]|$)/i);
  const inOnly = text.match(/\bin\s+([a-zA-Z ]{2,40}?)(?=\s+(?:for|under|below|within|budget|on|starting|with)\b|[,.!?]|$)/i);

  return {
    source: fromOnly ? titleCase(fromOnly[1]) : "",
    destination: toOnly ? titleCase(toOnly[1]) : (inOnly ? titleCase(inOnly[1]) : ""),
  };
}

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseNaturalQuery(rawQuery, options = {}) {
  const query = cleanToken(rawQuery);
  const now = options.now ? new Date(options.now) : new Date();
  const { source, destination } = parseSourceDestination(query);
  const duration = parseDurationDays(query);
  const budget = parseBudget(query);
  const dateTokens = findDates(query, now);

  let startDate = null;
  let endDate = null;
  if (dateTokens.length >= 2) {
    startDate = dateTokens[0];
    endDate = dateTokens[1];
  } else if (dateTokens.length === 1) {
    startDate = dateTokens[0];
    if (duration) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.max(1, duration - 1));
    }
  }

  return {
    query,
    source,
    destination,
    duration: duration || null,
    budget: budget || null,
    startDate: startDate ? formatYMD(startDate) : null,
    endDate: endDate ? formatYMD(endDate) : null,
  };
}

function buildSuggestions(rawQuery) {
  const query = cleanToken(rawQuery);
  if (query.length < 2) return [];
  const lower = query.toLowerCase();
  const parsed = parseNaturalQuery(query);

  const cityMatches = KNOWN_CITIES
    .filter((city) => city.toLowerCase().includes(lower))
    .slice(0, 5)
    .map((city) => ({ id: `city-${city.toLowerCase().replace(/\s+/g, "-")}`, text: city, type: "city" }));

  const templates = [];
  if (parsed.source && parsed.destination) {
    templates.push(`trip from ${parsed.source} to ${parsed.destination}`);
    templates.push(`flights from ${parsed.source} to ${parsed.destination}`);
    templates.push(`hotels in ${parsed.destination}`);
  } else if (parsed.destination) {
    templates.push(`trip to ${parsed.destination}`);
    templates.push(`hotels in ${parsed.destination} under 10000`);
  } else {
    templates.push(`trip from Mumbai to Goa for 4 days under 40000`);
    templates.push(`flights from Delhi to Jaipur`);
    templates.push(`hotels in Goa under 8000`);
  }

  if (parsed.duration) {
    templates.push(`${parsed.destination || "Goa"} trip for ${parsed.duration} days`);
  }
  if (parsed.budget) {
    templates.push(`${parsed.destination || "Goa"} under ${parsed.budget}`);
  }

  const templateSuggestions = [...new Set(templates)]
    .slice(0, 5)
    .map((text, idx) => ({ id: `template-${idx}`, text, type: "query" }));

  return [...cityMatches, ...templateSuggestions].slice(0, 8);
}

module.exports = {
  parseNaturalQuery,
  buildSuggestions,
};
