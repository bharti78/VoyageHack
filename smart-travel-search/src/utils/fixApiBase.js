const LIVE_API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const LOCAL_API_BASE = "http://localhost:5000";

if (typeof window !== "undefined" && typeof window.fetch === "function") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      if (typeof input === "string" && input.startsWith(LOCAL_API_BASE)) {
        return originalFetch(`${LIVE_API_BASE}${input.slice(LOCAL_API_BASE.length)}`, init);
      }
      if (input instanceof Request && input.url.startsWith(LOCAL_API_BASE)) {
        const nextUrl = `${LIVE_API_BASE}${input.url.slice(LOCAL_API_BASE.length)}`;
        const nextRequest = new Request(nextUrl, input);
        return originalFetch(nextRequest, init);
      }
    } catch {
      // Ignore rewrite failure and fall back to the original request.
    }
    return originalFetch(input, init);
  };
}

