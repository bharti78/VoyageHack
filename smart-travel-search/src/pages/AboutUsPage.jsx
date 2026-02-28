import SearchSectionTopNav from "../components/SearchSectionTopNav";
import SearchSectionFooter from "../components/SearchSectionFooter";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .abt-page {
    min-height: 100vh;
    background: #ffffff;
    color: #4b5563;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    padding-top: 80px;
  }

  .abt-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #fff;
    border-bottom: 1px solid #eceff3;
    min-height: 84px;
    padding: 0 clamp(14px, 3vw, 64px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .abt-logo-wrap { display: flex; align-items: center; flex-shrink: 0; }
  .abt-logo { height: 72px; width: auto; object-fit: contain; display: block; }
  .abt-nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    margin-right: 14px;
  }
  .abt-nav-link {
    border: none;
    background: transparent;
    padding: 6px 10px;
    font-size: 0.92rem;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    border-radius: 8px;
    line-height: 1;
  }
  .abt-nav-link:hover { background: #fff5f0; color: #f97316; }
  .abt-nav-link.active { color: #f97316; }

  .abt-nav-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .abt-auth {
    font-size: 0.82rem;
    color: #4b5563;
    white-space: nowrap;
  }
  .abt-auth-btn {
    border: none;
    background: transparent;
    color: #003399;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
  }
  .abt-book {
    border: none;
    background: #f97316;
    color: #fff;
    border-radius: 999px;
    padding: 9px 18px;
    font-size: 0.96rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    line-height: 1;
  }

  .abt-hero {
    background: #dfe4ee;
    position: relative;
    overflow: hidden;
    min-height: 350px;
  }
  .abt-hero::before,
  .abt-hero::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(191, 201, 218, 0.35);
    pointer-events: none;
  }
  .abt-hero::before {
    width: 240px;
    height: 240px;
    left: -30px;
    top: -50px;
  }
  .abt-hero::after {
    width: 130px;
    height: 130px;
    left: 52%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .abt-hero-inner {
    max-width: 1240px;
    margin: 0 auto;
    padding: 30px clamp(16px, 3vw, 36px) 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    position: relative;
    z-index: 2;
  }
  .abt-title {
    font-size: clamp(2rem, 4vw, 3.6rem);
    font-weight: 700;
    color: #6b7280;
  }
  .abt-hero-image-wrap {
    width: min(100%, 360px);
    height: 320px;
    border-radius: 52% 52% 30% 30% / 62% 62% 26% 26%;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
    flex-shrink: 0;
    background: #fff;
  }
  .abt-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .abt-body {
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    padding: 24px clamp(16px, 3vw, 36px) 60px;
    color: #6b7280;
  }
  .abt-body p {
    font-size: clamp(1.02rem, 1.35vw, 1.08rem);
    line-height: 1.55;
    margin-bottom: 20px;
    letter-spacing: 0.1px;
  }

  @media (max-width: 980px) {
    .abt-page { padding-top: 72px; }
    .abt-nav-links { display: none; }
    .abt-logo { height: 60px; }
    .abt-hero-inner { flex-direction: column; align-items: flex-start; }
    .abt-hero-image-wrap {
      width: min(100%, 330px);
      height: 280px;
      align-self: center;
    }
  }

  @media (max-width: 640px) {
    .abt-page { padding-top: 64px; }
    .abt-nav {
      min-height: 68px;
      padding: 8px 10px;
      gap: 10px;
    }
    .abt-logo { height: 52px; }
    .abt-auth { font-size: 0.72rem; }
    .abt-book {
      font-size: 0.8rem;
      padding: 8px 12px;
    }
    .abt-title { font-size: 2.1rem; }
    .abt-body p {
      font-size: 1.03rem;
      line-height: 1.62;
    }
  }
`;


export default function AboutUsPage() {

  return (
    <>
      <style>{css}</style>
      <div className="abt-page">
        <SearchSectionTopNav active="about" />

        <section className="abt-hero">
          <div className="abt-hero-inner">
            <h1 className="abt-title">About Us</h1>
            <div className="abt-hero-image-wrap">
              <img
                className="abt-hero-image"
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
                alt="Team discussion"
              />
            </div>
          </div>
        </section>

        <section className="abt-body">
          <p>
            Welcome to TBO, your global partner in simplifying travel solutions for businesses worldwide. Since our establishment in 2006, TBO has evolved from a single-product air ticketing company into a leading global travel distribution platform. Our proprietary technology seamlessly connects travel buyers and suppliers, ensuring streamlined transactions across the diverse landscape of global travel.
          </p>
          <p>
            TBO is proudly listed on the NSE (National Stock Exchange) and BSE (Bombay Stock Exchange), underscoring our commitment to transparency and growth in the global market.
          </p>
          <p>
            At TBO, we offer a comprehensive range of travel solutions including air travel, hotels, rail, holiday packages, car rentals, transfers, sightseeing, cruise, and cargo. Leveraging data analytics, artificial intelligence, and machine learning, our proprietary platform enhances visibility and sales of relevant travel products based on specific search parameters.
          </p>
          <p>
            Driven by a technology-first approach, TBO continues to pioneer innovations in the travel industry. Our modular architecture supports the integration of new travel products and enables expansion into new geographies. Trusted by a vast network of travel ecosystems globally, TBO&apos;s travel APIs facilitate seamless connectivity and enhance efficiency across the travel sector. Join TBO and experience travel made easy and simple through innovative technology and unparalleled service.
          </p>
        </section>
        <SearchSectionFooter />
      </div>
    </>
  );
}
