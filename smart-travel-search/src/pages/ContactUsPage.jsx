import SearchSectionTopNav from "../components/SearchSectionTopNav";

const css = `
  .cu-page-wrap {
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: 80px;
  }
  .cu-frame {
    width: 100%;
    height: calc(100vh - 80px);
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .cu-page-wrap { padding-top: 72px; }
    .cu-frame { height: calc(100vh - 72px); }
  }
  @media (max-width: 640px) {
    .cu-page-wrap { padding-top: 64px; }
    .cu-frame { height: calc(100vh - 64px); }
  }
`;

export default function ContactUsPage() {
  return (
    <div className="cu-page-wrap">
      <style>{css}</style>
      <SearchSectionTopNav />
      <iframe
        title="Contact Us"
        src="/contact-us.html"
        className="cu-frame"
      />
    </div>
  );
}
