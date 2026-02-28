import SearchSectionTopNav from "../components/SearchSectionTopNav";

const css = `
  .pp-page-wrap {
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: 80px;
  }
  .pp-frame {
    width: 100%;
    height: calc(100vh - 80px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .pp-page-wrap { padding-top: 72px; }
    .pp-frame { height: calc(100vh - 72px); }
  }
  @media (max-width: 640px) {
    .pp-page-wrap { padding-top: 64px; }
    .pp-frame { height: calc(100vh - 64px); }
  }
`;

export default function PrivacyPolicyPage() {
  return (
    <div className="pp-page-wrap">
      <style>{css}</style>
      <SearchSectionTopNav />
      <iframe
        title="Privacy Policy"
        src="/privacy-policy.html"
        className="pp-frame"
      />
    </div>
  );
}
