import { useNavigate } from "react-router-dom";

const css = `
  .ssf-footer { background: #003380; color: #ccc; padding: 22px clamp(24px,4%,80px) 16px; }
  .ssf-inner { display: flex; justify-content: flex-start; align-items: center; flex-wrap: wrap; gap: 10px; }
  .ssf-links { display: flex; gap: 0; flex-wrap: wrap; align-items: center; }
  .ssf-link-btn {
    color: #ccc;
    font-size: clamp(0.62rem,0.95vw,0.78rem);
    text-decoration: none;
    padding: 2px 8px;
    transition: color 0.2s;
    white-space: nowrap;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
  }
  .ssf-link-btn:hover { color: #fff; }
  .ssf-sep { color: #556; }
  .ssf-copy { font-size: 0.66rem; color: #99a; text-align: center; margin-top: 10px; }
`;

const links = [
  { label: "Home", route: "/searchsection" },
  { label: "About Us", route: "/aboutus" },
  { label: "Privacy Policy", route: "/privacy-policy" },
  { label: "Terms and Conditions", route: "/terms-and-conditions" },
  { label: "Sanctions Policy", route: "/sanctions-compliance-policy" },
  { label: "Contact Us", route: "/contact-us" },
];

export default function SearchSectionFooter() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <footer className="ssf-footer">
        <div className="ssf-inner">
          <div className="ssf-links">
            {links.map((l, i) => (
              <span key={l.label} style={{ display: "flex", alignItems: "center" }}>
                <button
                  className="ssf-link-btn"
                  onClick={() => {
                    if (l.route && l.route !== "#") navigate(l.route);
                  }}
                >
                  {l.label}
                </button>
                {i < links.length - 1 && <span className="ssf-sep">|</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="ssf-copy">© All rights reserved</div>
      </footer>
    </>
  );
}
