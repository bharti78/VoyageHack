import { useState } from "react";
import SearchSectionTopNav from "../components/SearchSectionTopNav";

const css = `
  .tc-wrap { min-height: 100vh; background: #fff; }
  .tc-frame-wrap { padding-top: 80px; }
  .tc-frame {
    width: 100%;
    height: calc(100vh - 80px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 960px) {
    .tc-frame-wrap { padding-top: 72px; }
    .tc-frame { height: calc(100vh - 72px); }
  }
  @media (max-width: 640px) {
    .tc-frame-wrap { padding-top: 64px; }
    .tc-frame { height: calc(100vh - 64px); }
  }
`;

export default function TboCaresPage() {
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
      <SearchSectionTopNav active="tbocares" />

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
