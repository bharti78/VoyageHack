import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const css = `
  .tc-wrap { min-height: 100vh; background: #fff; }
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
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .nav-link:hover { color: #ff6600; background: #fff5f0; }
  .nav-link.active { color: #ff6600; font-weight: 600; }
  .tbo-nav-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .already-reg { font-size: 0.82rem; color: #888; white-space: nowrap; }
  .already-reg .sign-in-btn {
    color: #003399;
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
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
  }
  .btn-book.secondary { background: #e0e0e0; color: #555; }
  .tc-frame-wrap { padding-top: 80px; }
  .tc-frame {
    width: 100%;
    height: calc(100vh - 80px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 960px) {
    .tbo-logo-wrap { padding-left: 0; }
    .tbo-logo-img { height: 76px; }
    .tbo-nav-links { display: none; }
    .tbo-nav { min-height: 72px; }
    .tc-frame-wrap { padding-top: 72px; }
    .tc-frame { height: calc(100vh - 72px); }
  }
  @media (max-width: 640px) {
    .tbo-nav-right .already-reg,
    .tbo-nav-right .btn-book { display: none; }
    .tbo-logo-img { height: 58px; }
    .tbo-nav { min-height: 64px; }
    .tc-frame-wrap { padding-top: 64px; }
    .tc-frame { height: calc(100vh - 64px); }
  }
`;

export default function TboCaresPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, persona, setShowRegister, setShowLogin, logout } = useAuth();
  const [iframeKey] = useState(() => Date.now());

  function onFrameLoad(e) {
    try {
      const doc = e.currentTarget.contentDocument;
      if (!doc) return;
      const killSelectors = [
        "header",
        ".site-header",
        "#masthead",
        ".navbar",
        ".headroom",
      ];
      killSelectors.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => {
          el.style.display = "none";
        });
      });
      if (doc.body) doc.body.style.marginTop = "0";
    } catch {
      // Ignore if iframe content cannot be modified.
    }
  }

  return (
    <div className="tc-wrap">
      <style>{css}</style>
      <nav className="tbo-nav">
        <div className="tbo-logo-wrap">
          <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com - Travel Simplified" className="tbo-logo-img" />
        </div>

        <div className="tbo-nav-links">
          <button className="nav-link" onClick={() => navigate("/")}>Home</button>
          <button className="nav-link" onClick={() => navigate("/search")}>Solutions</button>
          <button className="nav-link active">TBO Cares</button>
          <button className="nav-link">Careers</button>
          <button className="nav-link">About Us</button>
          <button className="nav-link">Help</button>
        </div>

        <div className="tbo-nav-right">
          {isLoggedIn ? (
            <>
              <span className="already-reg" style={{ color: "#22c55e", fontWeight: 600 }}>
                {user?.name ? user.name.split(" ")[0] : "Logged in"}{persona ? ` - ${persona}` : ""}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-book" onClick={() => navigate("/")}>Book Now</button>
                <button className="btn-book secondary" onClick={logout}>Logout</button>
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
        </div>
      </nav>

      <div className="tc-frame-wrap">
        <iframe
          key={iframeKey}
          title="TBO Cares"
          src="/tbo-cares.html"
          className="tc-frame"
          onLoad={onFrameLoad}
        />
      </div>
    </div>
  );
}
