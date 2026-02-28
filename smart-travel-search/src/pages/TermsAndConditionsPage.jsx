import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  .tnc-page-wrap {
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: 80px;
  }
  .tnc-frame {
    width: 100%;
    height: calc(100vh - 80px - 92px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .tnc-page-wrap { padding-top: 72px; }
    .tnc-frame { height: calc(100vh - 72px - 92px); }
  }
  @media (max-width: 640px) {
    .tnc-page-wrap { padding-top: 64px; }
    .tnc-frame { height: calc(100vh - 64px - 92px); }
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
      <SearchSectionFooter />
    </div>
  );
}
