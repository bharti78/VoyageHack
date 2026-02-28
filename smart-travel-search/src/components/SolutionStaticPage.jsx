import { useNavigate } from "react-router-dom";
import SearchSectionTopNav from "./SearchSectionTopNav";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .sp-page {
    min-height: 100vh;
    background: #f5f5f6;
    font-family: 'DM Sans', sans-serif;
    color: #6b7280;
    padding-top: 80px;
    display: flex;
    flex-direction: column;
  }
  .sp-hero {
    background: #dfe4ee;
    position: relative;
    overflow: hidden;
  }
  .sp-hero::before,
  .sp-hero::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(191, 201, 218, 0.35);
    pointer-events: none;
  }
  .sp-hero::before {
    width: 240px;
    height: 240px;
    left: -30px;
    top: -60px;
  }
  .sp-hero::after {
    width: 120px;
    height: 120px;
    left: 53%;
    top: 62%;
    transform: translate(-50%, -50%);
  }
  .sp-hero-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 24px clamp(16px, 3vw, 24px) 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 28px;
    position: relative;
    z-index: 2;
  }
  .sp-title {
    color: #6b7280;
    font-size: clamp(2.35rem, 4.4vw, 3.7rem);
    font-weight: 700;
    line-height: 1.1;
    margin: 0 0 20px;
    white-space: pre-line;
  }
  .sp-lead {
    max-width: 620px;
    font-size: 1.12rem;
    line-height: 1.62;
    color: #1f2937;
    margin: 0;
    white-space: pre-line;
    text-align: justify;
  }
  .sp-hero-image-wrap {
    width: min(100%, 305px);
    height: 292px;
    border-radius: 52% 52% 30% 30% / 62% 62% 26% 26%;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  }
  .sp-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .sp-body {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 22px clamp(16px, 3vw, 24px) 40px;
  }
  .sp-body p {
    margin: 0 0 20px;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #7b8391;
    white-space: pre-line;
  }
  .sp-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 16px;
  }
  .sp-chip {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    padding: 14px 16px;
    font-size: 1.14rem;
    color: #727b88;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-height: 66px;
    line-height: 1.38;
  }
  .sp-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #f97316;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .sp-chip strong { color: #5e6672; font-weight: 700; }

  .sp-brands {
    margin-top: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: stretch;
  }
  .sp-brand-card {
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
    min-height: 150px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 14px;
  }
  .sp-brand-logo {
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 0.2px;
    line-height: 1;
  }
  .sp-brand-logo .gold { color: #d4a74f; }
  .sp-brand-logo .blue { color: #2f5ea8; }
  .sp-brand-sub {
    margin-top: 10px;
    color: #6b7280;
    font-size: 1.1rem;
  }
  .sp-cta-wrap {
    text-align: center;
    margin-top: 34px;
  }
  .sp-cta {
    border: 0;
    background: #f97316;
    color: #fff;
    border-radius: 999px;
    font-size: 1.06rem;
    font-weight: 700;
    padding: 10px 30px;
    cursor: pointer;
    font-family: inherit;
  }

  .sp-footer {
    margin-top: auto;
    background: #3b82d6;
    color: #fff;
    padding: 14px clamp(16px, 3vw, 36px) 10px;
  }
  .sp-footer-top {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }
  .sp-footer-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .sp-footer-link { color: #fff; font-size: 0.84rem; text-decoration: none; }
  .sp-footer-sep { color: rgba(255,255,255,0.86); font-size: 0.9rem; }
  .sp-footer-social {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .sp-footer-copy {
    text-align: center;
    font-size: 0.9rem;
    color: rgba(255,255,255,0.96);
    margin-top: 10px;
  }

  @media (max-width: 1100px) {
    .sp-page { padding-top: 72px; }
  }
  @media (max-width: 900px) {
    .sp-hero-inner { grid-template-columns: 1fr; }
    .sp-hero-image-wrap { justify-self: center; }
    .sp-grid,
    .sp-brands { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .sp-page { padding-top: 64px; }
    .sp-title { margin-bottom: 12px; }
    .sp-lead,
    .sp-body p { font-size: 1rem; }
    .sp-chip { font-size: 1rem; }
    .sp-cta { font-size: 1rem; }
  }
`;

const footerLinks = [
  "Home",
  "About Us",
  "Careers",
  "Privacy Policy",
  "Terms and Conditions",
  "Sanctions Policy",
  "Investors",
  "Media",
  "Contact Us",
];

export default function SolutionStaticPage({
  title,
  lead,
  heroImage,
  paragraphs = [],
  bullets = [],
  ctaLabel = "",
  brands = null,
  leadMaxWidth = 620,
}) {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="sp-page">
        <SearchSectionTopNav active="solutions" />

        <section className="sp-hero">
          <div className="sp-hero-inner">
            <div>
              <h1 className="sp-title">{title}</h1>
              <p className="sp-lead" style={{ maxWidth: leadMaxWidth }}>{lead}</p>
            </div>
            <div className="sp-hero-image-wrap">
              <img className="sp-hero-image" src={heroImage} alt={title} />
            </div>
          </div>
        </section>

        <section className="sp-body">
          {paragraphs.map((text, idx) => <p key={idx}>{text}</p>)}

          {!!bullets.length && (
            <div className="sp-grid">
              {bullets.map((item, idx) => (
                <div className="sp-chip" key={idx}>
                  <span className="sp-dot" />
                  <span>
                    {item.bold ? <><strong>{item.bold}</strong>{item.text ? ` - ${item.text}` : ""}</> : item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!!brands?.length && (
            <div className="sp-brands">
              {brands.map((b) => (
                <div className="sp-brand-card" key={b.sub}>
                  <div className="sp-brand-logo">{b.logo}</div>
                  <div className="sp-brand-sub">{b.sub}</div>
                </div>
              ))}
            </div>
          )}

          {!!ctaLabel && (
            <div className="sp-cta-wrap">
              <button className="sp-cta">{ctaLabel}</button>
            </div>
          )}
        </section>

        <footer className="sp-footer">
          <div className="sp-footer-top">
            <div className="sp-footer-links">
              {footerLinks.map((item, idx) => (
                <span key={item}>
                  <a
                    href="#"
                    className="sp-footer-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item === "Home") navigate("/searchsection");
                      if (item === "About Us") navigate("/aboutus");
                      if (item === "Careers") navigate("/careers");
                    }}
                  >
                    {item}
                  </a>
                  {idx < footerLinks.length - 1 && <span className="sp-footer-sep"> | </span>}
                </span>
              ))}
            </div>
            <div className="sp-footer-social">
              <span>in</span>
              <span>f</span>
              <span>◎</span>
              <span>▢</span>
            </div>
          </div>
          <div className="sp-footer-copy">© All rights reserved</div>
        </footer>
      </div>
    </>
  );
}
