import SearchSectionTopNav from "../components/SearchSectionTopNav";

const css = `
  .tnc-page-wrap {
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: 80px;
  }
  .tnc-frame {
    width: 100%;
    height: calc(100vh - 80px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .tnc-page-wrap { padding-top: 72px; }
    .tnc-frame { height: calc(100vh - 72px); }
  }
  @media (max-width: 640px) {
    .tnc-page-wrap { padding-top: 64px; }
    .tnc-frame { height: calc(100vh - 64px); }
  }
`;

export default function TermsAndConditionsPage() {
  return (
    <div className="tnc-page-wrap">
      <style>{css}</style>
      <SearchSectionTopNav />
      <iframe
        title="Terms and Conditions"
        src="/terms-and-conditions.html"
        className="tnc-frame"
      />
    </div>
  );
}
