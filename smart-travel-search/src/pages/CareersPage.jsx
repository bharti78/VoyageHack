import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  .crp-page-wrap {
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: 80px;
  }
  .crp-frame {
    width: 100%;
    height: calc(100vh - 80px - 92px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .crp-page-wrap { padding-top: 72px; }
    .crp-frame { height: calc(100vh - 72px - 92px); }
  }
  @media (max-width: 640px) {
    .crp-page-wrap { padding-top: 64px; }
    .crp-frame { height: calc(100vh - 64px - 92px); }
  }
`;

export default function CareersPage() {
  return (
    <div className="crp-page-wrap">
      <style>{css}</style>
      <SearchSectionTopNav active="careers" />
      <iframe title="Careers" src="/careers.html" className="crp-frame" />
      <SearchSectionFooter />
    </div>
  );
}