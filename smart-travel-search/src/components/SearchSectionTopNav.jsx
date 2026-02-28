import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SOLUTIONS = ["Travel Buyers", "Hotels", "Air", "Cruise"];

const css = `
  .tbo-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 clamp(20px, 3%, 60px);
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    min-height: 80px;
    gap: 12px;
  }
  .tbo-nav.scrolled {
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  .mobile-nav-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid #e4e4e4;
    border-radius: 10px;
    background: #fff;
    color: #555;
    cursor: pointer;
  }
  .mobile-nav-toggle svg { width: 18px; height: 18px; }
  .mobile-nav-menu {
    display: none;
    position: absolute;
    top: calc(100% + 8px);
    left: 10px;
    right: 10px;
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 14px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    padding: 8px;
    z-index: 700;
    flex-direction: column;
    gap: 6px;
  }
  .mobile-nav-menu.open { display: flex; }
  .mobile-nav-item {
    border: 1px solid #f0f0f0;
    background: #fff;
    border-radius: 10px;
    padding: 9px 10px;
    text-align: left;
    font-size: 0.82rem;
    font-weight: 600;
    color: #444;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .mobile-nav-item:hover { background: #fff5f0; color: #ff6600; border-color: #ffd8bf; }

  .tbo-logo-wrap { display: flex; align-items: center; flex-shrink: 0; padding-left: 60px; }
  .tbo-logo-img { height: 100px; width: auto; object-fit: contain; display: block; }

  .tbo-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    margin-right: 16px;
  }
  .nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    color: #444;
    padding: 6px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .nav-link:hover { color: #ff6600; background: #fff5f0; }
  .nav-link.active { color: #ff6600; font-weight: 600; }
  .nav-link .chevron {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4.5px solid currentColor;
    margin-top: 1px;
  }

  .tbo-nav-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
  }
  .already-reg { font-size: 0.82rem; color: #888; white-space: nowrap; }
  .already-reg .sign-in-btn {
    color: #003399;
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    text-decoration: none;
    padding: 0;
  }
  .already-reg .sign-in-btn:hover { text-decoration: underline; }
  .btn-book {
    background: #ff6600;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-book:hover { background: #e05500; transform: scale(1.03); }

  .products-nav-wrap { position: relative; }
  .solutions-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.16);
    z-index: 600;
    padding: 10px;
    min-width: 200px;
  }
  .sol-item {
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
    transition: background 0.15s;
  }
  .sol-item:hover { background: #fff5f0; color: #ff6600; }

  @media (max-width: 1100px) {
    .tbo-logo-wrap { padding-left: 0; }
    .tbo-logo-img { height: 76px; }
    .tbo-nav { min-height: 72px; }
    .tbo-nav-links { display: none; }
    .tbo-nav-right { margin-left: auto; }
    .mobile-nav-toggle { display: inline-flex; }
  }
  @media (max-width: 640px) {
    .tbo-nav {
      min-height: 64px;
      padding: 6px 10px;
      gap: 8px;
    }
    .tbo-logo-img { height: 58px; }
    .tbo-nav-right { align-items: flex-end; gap: 2px; }
    .already-reg { font-size: 0.7rem; }
    .btn-book {
      font-size: 0.78rem;
      padding: 8px 12px;
      border-radius: 11px;
    }
    .tbo-nav-right .already-reg,
    .tbo-nav-right .btn-book { display: none; }
  }
`;

export default function SearchSectionTopNav({ active = "home" }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, persona, requireAuth, setShowRegister, setShowLogin, logout } = useAuth();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const solutionsRef = useRef(null);
  const aboutRef = useRef(null);
  const solutionsCloseTimerRef = useRef(null);
  const aboutCloseTimerRef = useRef(null);

  useEffect(() => {
    function onScroll() { setNavScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handle(e) {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target)) setSolutionsOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
      if (!e.target.closest(".mobile-nav-toggle") && !e.target.closest(".mobile-nav-menu")) {
        setMobileNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    return () => {
      if (solutionsCloseTimerRef.current) clearTimeout(solutionsCloseTimerRef.current);
      if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    };
  }, []);

  function openSolutionsMenu() {
    if (solutionsCloseTimerRef.current) clearTimeout(solutionsCloseTimerRef.current);
    setSolutionsOpen(true);
  }
  function closeSolutionsMenuSoon() {
    if (solutionsCloseTimerRef.current) clearTimeout(solutionsCloseTimerRef.current);
    solutionsCloseTimerRef.current = setTimeout(() => setSolutionsOpen(false), 140);
  }
  function openAboutMenu() {
    if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    setAboutOpen(true);
  }
  function closeAboutMenuSoon() {
    if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    aboutCloseTimerRef.current = setTimeout(() => setAboutOpen(false), 140);
  }
  function handleBookNow() {
    if (!requireAuth()) return;
    navigate("/searchsection");
  }

  return (
    <>
      <style>{css}</style>
      <nav className={`tbo-nav${navScrolled ? " scrolled" : ""}`}>
        <div className="tbo-logo-wrap">
          <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com - Travel Simplified" className="tbo-logo-img" />
        </div>

        <div className="tbo-nav-links">
          <button className={`nav-link${active === "home" ? " active" : ""}`} onClick={() => navigate("/searchsection")}>Home</button>

          <div className="products-nav-wrap" ref={solutionsRef} style={{ position: "relative" }}>
            <div onMouseEnter={openSolutionsMenu} onMouseLeave={closeSolutionsMenuSoon}>
              <button className={`nav-link${active === "solutions" || solutionsOpen ? " active" : ""}`} onClick={() => setSolutionsOpen((o) => !o)}>
                Solutions <span className="chevron" />
              </button>
              {solutionsOpen && (
                <div className="solutions-dropdown">
                  {SOLUTIONS.map((s) => (
                    <div key={s} className="sol-item" onClick={() => setSolutionsOpen(false)}>{s}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button className={`nav-link${active === "tbocares" ? " active" : ""}`} onClick={() => navigate("/tbocares")}>TBO Cares</button>

          <div className="products-nav-wrap" ref={aboutRef} style={{ position: "relative" }}>
            <div onMouseEnter={openAboutMenu} onMouseLeave={closeAboutMenuSoon}>
              <button className={`nav-link${active === "about" || aboutOpen ? " active" : ""}`} onClick={() => setAboutOpen((o) => !o)}>
                About Us <span className="chevron" />
              </button>
              {aboutOpen && (
                <div className="solutions-dropdown">
                  <div className="sol-item" onClick={() => { setAboutOpen(false); navigate("/aboutus"); }}>About tbo.com</div>
                  <div className="sol-item" onClick={() => { setAboutOpen(false); navigate("/board-of-directors"); }}>Board of Directors</div>
                </div>
              )}
            </div>
          </div>

          <button className="nav-link">Help</button>
        </div>

        <div className="tbo-nav-right">
          {isLoggedIn ? (
            <>
              <span className="already-reg" style={{ color: "#22c55e", fontWeight: 600 }}>
                {user?.name ? user.name.split(" ")[0] : "Logged in"}{persona ? ` · ${persona}` : ""}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-book" onClick={handleBookNow}>Book Now</button>
                <button className="btn-book" style={{ background: "#e0e0e0", color: "#555" }} onClick={logout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <span className="already-reg">
                Already Registred? <button onClick={() => setShowLogin(true)} className="sign-in-btn">Sign in</button>
              </span>
              <button className="btn-book" onClick={() => setShowRegister(true)}>Book Now</button>
            </>
          )}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {mobileNavOpen ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        <div className={`mobile-nav-menu${mobileNavOpen ? " open" : ""}`}>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); navigate("/searchsection"); }}>Home</button>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); navigate("/search"); }}>Solutions</button>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); navigate("/tbocares"); }}>TBO Cares</button>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); navigate("/aboutus"); }}>About tbo.com</button>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); navigate("/board-of-directors"); }}>Board of Directors</button>
          <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); }}>Help</button>
          {isLoggedIn ? (
            <>
              <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); handleBookNow(); }}>Book Now</button>
              <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); logout(); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); setShowRegister(true); }}>Book Now</button>
              <button className="mobile-nav-item" onClick={() => { setMobileNavOpen(false); setShowLogin(true); }}>Sign in</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

