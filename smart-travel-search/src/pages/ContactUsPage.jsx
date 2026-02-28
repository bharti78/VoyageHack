import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  .cu-page-wrap {
    min-height: 100dvh;
    background: #f3f3f3;
    padding-top: 80px;
    overflow-x: hidden;
  }
  .cu-frame {
    width: 100%;
    height: calc(100dvh - 80px - 92px);
    min-height: 360px;
    border: 0;
    display: block;
    background: #fff;
  }
  @media (max-width: 1100px) {
    .cu-page-wrap { padding-top: 72px; }
    .cu-frame { height: calc(100dvh - 72px - 92px); }
  }
  @media (max-width: 640px) {
    .cu-page-wrap { padding-top: 64px; }
    .cu-frame { height: calc(100dvh - 64px - 92px); min-height: 420px; }
  }
  @supports not (height: 100dvh) {
    .cu-page-wrap { min-height: 100vh; }
    .cu-frame { height: calc(100vh - 80px - 92px); }
    @media (max-width: 1100px) { .cu-frame { height: calc(100vh - 72px - 92px); } }
    @media (max-width: 640px) { .cu-frame { height: calc(100vh - 64px - 92px); } }
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
      <SearchSectionFooter />
    </div>
  );
}
