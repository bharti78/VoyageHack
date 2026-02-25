/**
 * SmartSearchBar.jsx
 * ──────────────────
 * A natural-language search bar that:
 *   1. Shows debounced autocomplete suggestions (from backend /api/search/suggestions)
 *   2. On submit, calls /api/search/parse to extract structured filters
 *   3. Stores extracted filters in localStorage (voyagehack.smartQuery)
 *      so every result page (Flights, Hotels, Cabs, Cars) can auto-apply them
 *   4. Navigates to the most relevant result page (or /results for "all")
 *
 * Usage:
 *   <SmartSearchBar onParsed={(filters) => {}} />
 *
 * Other pages are completely unaffected – they keep working as before,
 * but if `voyagehack.smartQuery` is present they'll pre-fill their forms.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Backend base URL ──────────────────────────────────── */
const API = 'http://localhost:5000/api/search';

/* ── Storage key used by result pages ─────────────────── */
export const SMART_QUERY_KEY = 'voyagehack.smartQuery';

/* ── Inline styles (no extra CSS file needed) ──────────── */
const S = {
  wrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 680,
    margin: '0 auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 999,
    boxShadow: '0 4px 24px rgba(0,0,0,.12)',
    border: '1.5px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'box-shadow .2s',
  },
  rowFocused: {
    boxShadow: '0 6px 32px rgba(61,0,153,.18)',
    borderColor: '#a78bfa',
  },
  icon: {
    padding: '0 14px 0 18px',
    color: '#94a3b8',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.96rem',
    fontWeight: 500,
    color: '#1e293b',
    background: 'transparent',
    padding: '14px 8px',
    fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '0 8px',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #3d0099, #6600cc)',
    color: '#fff',
    border: 'none',
    borderRadius: '0 999px 999px 0',
    padding: '0 24px',
    height: '100%',
    minHeight: 48,
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
    transition: 'background .2s',
    fontFamily: 'inherit',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 12px 40px rgba(0,0,0,.14)',
    border: '1px solid #e8e0f5',
    zIndex: 500,
    overflow: 'hidden',
    animation: 'ssb-down .15s ease',
  },
  sectionLabel: {
    fontSize: '.64rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '.6px',
    padding: '10px 14px 4px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: '.86rem',
    color: '#334155',
    borderBottom: '1px solid #f8fafc',
    transition: 'background .12s',
  },
  itemHover: {
    background: '#f5f0ff',
    color: '#3d0099',
  },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: '#f0e8ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  badge: {
    fontSize: '.6rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 999,
    background: '#ede0ff',
    color: '#3d0099',
    marginLeft: 'auto',
  },
  loading: {
    padding: '12px 14px',
    fontSize: '.8rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  parsedBadge: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '10px 14px',
    borderTop: '1px solid #f0e8ff',
  },
  chip: {
    fontSize: '.68rem',
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 999,
    background: '#f0e8ff',
    color: '#3d0099',
  },
};

/* ── Keyframe animation injected once ─────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ssb-style')) {
  const el = document.createElement('style');
  el.id = 'ssb-style';
  el.textContent = `@keyframes ssb-down{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(el);
}

/* ── Intent → route map ───────────────────────────────── */
const INTENT_ROUTE = {
  flights:    '/flights',
  hotels:     '/hotels',
  cabs:       '/cabs',
  carrental:  '/carrental',
  all:        '/flights',   // default travel intent → always flights
};

function detectIntent(query) {
  const q = (query || '').toLowerCase();
  // Explicit non-flight services take priority
  if (/\b(hotel|hotels|stay|room|accommodation|lodge|resort)\b/.test(q)) return 'hotels';
  if (/\b(cab|cabs|taxi)\b/.test(q)) return 'cabs';
  if (/\b(car rental|self.?drive|rent.?a.?car)\b/.test(q)) return 'carrental';
  // Any route pattern "from X to Y" or explicit flight keywords → flights
  if (/\bfrom\b.+\bto\b/.test(q)) return 'flights';
  if (/\b(flight|flights|fly|flying|air|airline)\b/.test(q)) return 'flights';
  // Default: treat any travel query as a flight search
  return 'flights';
}

/* ── Suggestion type icons ────────────────────────────── */
function getIcon(type) {
  switch (type) {
    case 'city': return '🏙️';
    case 'query': return '🔍';
    default: return '✈️';
  }
}

/* ──────────────────────────────────────────────────────── */
/*  Main Component                                          */
/* ──────────────────────────────────────────────────────── */
export default function SmartSearchBar({
  placeholder = 'Try "trip from Jaipur to Goa for 4 days under 40000"',
  onParsed,       // optional callback with parsed filters
  className = '',
  style = {},
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null); // live parse preview
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const parseDebounceRef = useRef(null);

  /* ── Close dropdown on outside click ─────────────────── */
  useEffect(() => {
    function handleOut(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  /* ── Debounced autocomplete fetch (400 ms) ────────────── */
  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); setSuggLoading(false); return; }
    setSuggLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/suggestions?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggLoading(false);
      }
    }, 400);
  }, []);

  /* ── Debounced live parse preview (600 ms) ────────────── */
  const fetchParsePreview = useCallback((q) => {
    clearTimeout(parseDebounceRef.current);
    if (q.length < 4) { setParsedPreview(null); return; }
    parseDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          const { source, destination, duration, budget } = data.data;
          const chips = [];
          if (source) chips.push(`From: ${source}`);
          if (destination) chips.push(`To: ${destination}`);
          if (duration) chips.push(`${duration} days`);
          if (budget) chips.push(`₹${Number(budget).toLocaleString('en-IN')}`);
          setParsedPreview(chips.length ? chips : null);
        }
      } catch { /* ignore */ }
    }, 600);
  }, []);

  /* ── Handle input change ──────────────────────────────── */
  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setHoveredIdx(-1);
    fetchSuggestions(val);
    fetchParsePreview(val);
  }

  /* ── Select a suggestion ──────────────────────────────── */
  function selectSuggestion(text) {
    setQuery(text);
    setSuggestions([]);
    setFocused(false);
    fetchParsePreview(text);
  }

  /* ── Keyboard navigation ─────────────────────────────── */
  function handleKeyDown(e) {
    const max = suggestions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoveredIdx((i) => (i < max - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoveredIdx((i) => (i > 0 ? i - 1 : max - 1));
    } else if (e.key === 'Enter') {
      if (hoveredIdx >= 0 && suggestions[hoveredIdx]) {
        selectSuggestion(suggestions[hoveredIdx].text);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      setSuggestions([]);
    }
  }

  /* ── Main submit: parse → store → navigate ────────────── */
  async function handleSubmit() {
    const q = query.trim();
    if (!q) return;
    setSubmitting(true);
    setSuggestions([]);
    setFocused(false);

    try {
      // Call backend parse endpoint
      const res = await fetch(`${API}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = res.ok ? await res.json() : {};
      const parsed = data?.data || {};
      const defaultStartDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString();
      })();
      const defaultEndDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 10);
        return d.toISOString();
      })();
      const effectiveStartDate = parsed.startDate || defaultStartDate;
      const effectiveEndDate = parsed.endDate || defaultEndDate;

      // Build the smartQuery object that result pages read
      const smartQuery = {
        query: q,
        source: parsed.source || '',
        destination: parsed.destination || '',
        duration: parsed.duration || null,
        budget: parsed.budget || null,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        intentService: detectIntent(q),
        createdAt: Date.now(),
      };

      // Persist to localStorage – result pages read this key
      try {
        localStorage.setItem(SMART_QUERY_KEY, JSON.stringify(smartQuery));

        // Also write voyagehack.unifiedSearch for backwards compatibility
        // with components that use readUnified()
        const unified = {
          source: 'smart-search-bar',
          inputType: 'text',
          query: q,
          destination: parsed.destination || '',
          destinationObject: parsed.destination ? { city: parsed.destination } : {},
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          guests: { adults: 1, children: 0, infants: 0 },
          budget: { selectedBudget: null, maxValue: Number(parsed.budget || 0) },
          selectedTypes: [],
          intentService: smartQuery.intentService,
          fromCity: parsed.source || '',
          fromObj: parsed.source ? { city: parsed.source } : null,
          createdAt: Date.now(),
        };
        localStorage.setItem('voyagehack.unifiedSearch', JSON.stringify(unified));

        // Write flight-specific prefill with ALL keys FlightsPage reads:
        //   saved.from     → { city } object  (read first by fromCandidate)
        //   saved.to       → { city } object  (read first by toCandidate)
        //   saved.fromCity → string fallback
        //   saved.toCity   → string fallback
        //   saved.depDate  → ISO date string
        //   saved.budget   → number
        const depDate = effectiveStartDate;
        const retDate = effectiveEndDate;
        const flightPrefill = {
          from:     parsed.source      ? { city: parsed.source }      : undefined,
          to:       parsed.destination ? { city: parsed.destination }  : undefined,
          fromCity: parsed.source      || '',
          toCity:   parsed.destination || '',
          depDate,
          retDate,
          budget:   Number(parsed.budget || 0),
          tripType: 'oneway',
          cabin:    'Economy',
          pax:      { adults: 1, children: 0, infants: 0 },
        };
        localStorage.setItem('voyagehack.flight.prefill', JSON.stringify(flightPrefill));
        const hotelPrefill = {
          destination: parsed.destination || '',
          budget: Number(parsed.budget || 0),
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          adults: 1,
          children: 0,
        };
        localStorage.setItem('voyagehack.hotel.prefill', JSON.stringify(hotelPrefill));
      } catch { /* storage full – continue */ }

      // Notify parent if needed
      if (onParsed) onParsed(smartQuery);

      // Navigate to best-fit page
      const route = INTENT_ROUTE[smartQuery.intentService] || '/results';
      navigate(route);
    } catch (err) {
      console.error('SmartSearchBar parse error:', err);
      // Even on failure, navigate to /flights (default travel page)
      navigate('/flights');
    } finally {
      setSubmitting(false);
    }
  }

  const showDropdown = focused && (suggLoading || suggestions.length > 0 || parsedPreview);

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div ref={wrapRef} style={{ ...S.wrap, ...style }} className={className}>
      <div style={{ ...S.row, ...(focused ? S.rowFocused : {}) }}>
        {/* Search icon */}
        <div style={S.icon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          style={S.input}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          disabled={submitting}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button */}
        {query && (
          <button
            style={S.clearBtn}
            onClick={() => { setQuery(''); setSuggestions([]); setParsedPreview(null); inputRef.current?.focus(); }}
            title="Clear"
          >
            ×
          </button>
        )}

        {/* Submit button */}
        <button style={S.searchBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'ssb-spin 0.7s linear infinite' }} />
              Searching…
            </>
          ) : 'Search'}
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={S.dropdown}>
          {/* Loading state */}
          {suggLoading && (
            <div style={S.loading}>
              <span style={{ width: 14, height: 14, border: '2px solid #d4a0ff', borderTopColor: '#3d0099', borderRadius: '50%', display: 'inline-block', animation: 'ssb-spin 0.7s linear infinite' }} />
              Finding suggestions…
            </div>
          )}

          {/* City suggestions */}
          {!suggLoading && suggestions.filter(s => s.type === 'city').length > 0 && (
            <>
              <div style={S.sectionLabel}>Destinations</div>
              {suggestions.filter(s => s.type === 'city').map((s, i) => (
                <div
                  key={s.id}
                  style={{ ...S.item, ...(hoveredIdx === i ? S.itemHover : {}) }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(-1)}
                  onClick={() => selectSuggestion(s.text)}
                >
                  <div style={S.itemIcon}>{getIcon(s.type)}</div>
                  <span>{s.text}</span>
                  <span style={S.badge}>City</span>
                </div>
              ))}
            </>
          )}

          {/* Query suggestions */}
          {!suggLoading && suggestions.filter(s => s.type === 'query').length > 0 && (
            <>
              <div style={S.sectionLabel}>Suggested Searches</div>
              {suggestions.filter(s => s.type === 'query').map((s, i) => {
                const idx = suggestions.filter(x => x.type === 'city').length + i;
                return (
                  <div
                    key={s.id}
                    style={{ ...S.item, ...(hoveredIdx === idx ? S.itemHover : {}) }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(-1)}
                    onClick={() => selectSuggestion(s.text)}
                  >
                    <div style={S.itemIcon}>{getIcon(s.type)}</div>
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Live parse preview chips */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div style={S.parsedBadge}>
              <span style={{ ...S.chip, background: '#dcfce7', color: '#166534', marginRight: 4 }}>Understood:</span>
              {parsedPreview.map((chip, i) => (
                <span key={i} style={S.chip}>{chip}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spin animation injected inline */}
      <style>{`@keyframes ssb-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
