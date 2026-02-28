import { useEffect, useRef, useState } from "react";
import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  .tc-wrap { min-height: 100vh; background: #fff; }
  .tc-hero {
    padding-top: 80px;
    background: #dfe4ee;
    position: relative;
    overflow: hidden;
  }
  .tc-hero::before,
  .tc-hero::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(191, 201, 218, 0.35);
    pointer-events: none;
  }
  .tc-hero::before {
    width: 240px;
    height: 240px;
    left: -36px;
    top: -52px;
  }
  .tc-hero::after {
    width: 122px;
    height: 122px;
    left: 52%;
    top: 58%;
    transform: translate(-50%, -50%);
  }
  .tc-hero-inner {
    max-width: 1240px;
    margin: 0 auto;
    min-height: 360px;
    padding: 24px 22px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 30px;
    position: relative;
    z-index: 1;
  }
  .tc-hero-title {
    margin: 0;
    color: #6b7280;
    font-size: clamp(2.3rem, 4.3vw, 3.8rem);
    font-weight: 700;
    line-height: 1.08;
  }
  .tc-hero-img-wrap {
    width: min(100%, 430px);
    height: 290px;
    border-radius: 52% 52% 30% 30% / 62% 62% 26% 26%;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  }
  .tc-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .tc-frame-wrap { padding-top: 0; }
  .tc-frame {
    width: 100%;
    min-height: 600px;
    border: 0;
    display: block;
    background: #fff;
    overflow: hidden;
  }
  @media (max-width: 960px) {
    .tc-hero { padding-top: 72px; }
    .tc-hero-inner {
      min-height: 310px;
      grid-template-columns: 1fr;
      padding: 18px 14px;
    }
    .tc-hero-img-wrap {
      width: min(100%, 350px);
      height: 230px;
      justify-self: center;
    }
    .tc-frame-wrap { padding-top: 0; }
    .tc-frame { min-height: 520px; }
  }
  @media (max-width: 640px) {
    .tc-hero { padding-top: 64px; }
    .tc-hero-inner {
      min-height: 270px;
      padding: 14px 10px;
      gap: 14px;
    }
    .tc-hero-title { font-size: clamp(1.9rem, 10vw, 2.4rem); }
    .tc-hero-img-wrap {
      width: min(100%, 290px);
      height: 180px;
    }
    .tc-frame-wrap { padding-top: 0; }
    .tc-frame { min-height: 480px; }
  }
`;

export default function TboCaresPage() {
  const [iframeKey] = useState(() => Date.now());
  const frameRef = useRef(null);
  const [frameHeight, setFrameHeight] = useState(1200);

  function syncFrameHeight() {
    try {
      const iframe = frameRef.current;
      const doc = iframe?.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.body?.scrollHeight || 0,
        doc.documentElement?.scrollHeight || 0
      );
      if (h > 0) setFrameHeight(h);
    } catch {
      // ignore
    }
  }

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
        ".innerheader",
      ];
      killSelectors.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => {
          el.style.display = "none";
        });
      });
      if (doc.body) doc.body.style.marginTop = "0";
      doc.querySelectorAll(".ft_links a, .site-footer a").forEach((a) => {
        a.setAttribute("target", "_top");
        a.setAttribute("rel", "noopener noreferrer");
      });
      syncFrameHeight();
      setTimeout(syncFrameHeight, 120);
    } catch {
      // Ignore if iframe content cannot be modified.
    }
  }

  useEffect(() => {
    const onResize = () => syncFrameHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="tc-wrap">
      <style>{css}</style>
      <SearchSectionTopNav active="tbocares" />

      <section className="tc-hero">
        <div className="tc-hero-inner">
          <h1 className="tc-hero-title">TBO Cares</h1>
          <div className="tc-hero-img-wrap">
            <img
              className="tc-hero-img"
              src="https://www.tbo.com/engagement/wp-content/uploads/2024/07/csr.jpg"
              alt="TBO Cares"
            />
          </div>
        </div>
      </section>

      <div className="tc-frame-wrap">
        <iframe
          ref={frameRef}
          key={iframeKey}
          title="TBO Cares"
          src="/tbo-cares.html"
          className="tc-frame"
          style={{ height: `${frameHeight}px` }}
          onLoad={onFrameLoad}
        />
      </div>
      <SearchSectionFooter />
    </div>
  );
}
