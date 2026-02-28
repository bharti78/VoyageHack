import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  .spol-page-wrap {
    min-height: 100dvh;
    background: #f3f3f3;
    padding-top: 80px;
    overflow-x: hidden;
  }
  .spol-frame {
    width: 100%;
    height: calc(100dvh - 80px - 92px);
    min-height: 360px;
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .spol-page-wrap { padding-top: 72px; }
    .spol-frame { height: calc(100dvh - 72px - 92px); }
  }
  @media (max-width: 640px) {
    .spol-page-wrap { padding-top: 64px; }
    .spol-frame { height: calc(100dvh - 64px - 92px); min-height: 420px; }
  }
  @supports not (height: 100dvh) {
    .spol-page-wrap { min-height: 100vh; }
    .spol-frame { height: calc(100vh - 80px - 92px); }
    @media (max-width: 1100px) { .spol-frame { height: calc(100vh - 72px - 92px); } }
    @media (max-width: 640px) { .spol-frame { height: calc(100vh - 64px - 92px); } }
  }
`;

export default function SanctionsPolicyPage() {
  return (
    <div className="spol-page-wrap">
      <style>{css}</style>
      <SearchSectionTopNav />
      <iframe
        title="Sanctions Policy"
        src="/sanctions-compliance-policy.html"
        className="spol-frame"
      />
      <SearchSectionFooter />
    </div>
  );
}

