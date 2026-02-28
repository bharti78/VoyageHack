import { useNavigate } from "react-router-dom";
import SearchSectionTopNav from "../components/SearchSectionTopNav";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .bod-page {
    min-height: 100vh;
    background: #f6f7f9;
    color: #4b5563;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    padding-top: 80px;
  }

  .bod-nav {
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
  .bod-logo-wrap { display: flex; align-items: center; flex-shrink: 0; }
  .bod-logo { height: 72px; width: auto; object-fit: contain; display: block; }
  .bod-nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    margin-right: 14px;
  }
  .bod-nav-link {
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
  .bod-nav-link:hover { background: #fff5f0; color: #f97316; }
  .bod-nav-link.active { color: #f97316; }

  .bod-nav-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .bod-auth { font-size: 0.82rem; color: #4b5563; white-space: nowrap; }
  .bod-auth-btn {
    border: none;
    background: transparent;
    color: #003399;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
  }
  .bod-book {
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

  .bod-hero {
    background: #dfe4ee;
    position: relative;
    overflow: hidden;
    min-height: 390px;
  }
  .bod-hero::before,
  .bod-hero::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(191, 201, 218, 0.35);
    pointer-events: none;
  }
  .bod-hero::before {
    width: 240px;
    height: 240px;
    left: -30px;
    top: -50px;
  }
  .bod-hero::after {
    width: 130px;
    height: 130px;
    left: 58%;
    top: 52%;
    transform: translate(-50%, -50%);
  }
  .bod-hero-inner {
    max-width: 1240px;
    margin: 0 auto;
    padding: 20px clamp(16px, 3vw, 36px) 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    position: relative;
    z-index: 2;
  }
  .bod-title {
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 700;
    color: #6b7280;
    margin-top: 34px;
  }
  .bod-hero-image-wrap {
    width: min(100%, 320px);
    height: 235px;
    margin-top: 44px;
    border-radius: 52% 52% 30% 30% / 62% 62% 26% 26%;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
    flex-shrink: 0;
    background: #fff;
  }
  .bod-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .bod-body {
    max-width: 1360px;
    width: 100%;
    margin: 0 auto;
    padding: 16px clamp(12px, 2.4vw, 24px) 48px;
    color: #6b7280;
  }
  .bod-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    padding: 18px 16px 18px;
    min-height: 260px;
    margin-bottom: 12px;
  }
  .bod-card-title {
    font-size: 1.36rem;
    color: #6b7280;
    margin-bottom: 8px;
    line-height: 1.35;
  }
  .bod-card-title strong { font-weight: 800; color: #4b5563; }
  .bod-card-title .role { color: #6b7280; font-weight: 500; }
  .bod-accent {
    width: 46px;
    height: 3px;
    border-radius: 999px;
    background: #f97316;
    margin-bottom: 8px;
  }
  .bod-card p {
    font-size: 1.16rem;
    line-height: 1.58;
    color: #808893;
    margin: 0;
  }

  .bod-footer {
    margin-top: auto;
    background: #3b82d6;
    color: #fff;
    padding: 14px clamp(16px, 3vw, 36px) 10px;
  }
  .bod-footer-top {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }
  .bod-footer-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bod-footer-link { color: #fff; font-size: 0.84rem; text-decoration: none; }
  .bod-footer-sep { color: rgba(255,255,255,0.86); font-size: 0.84rem; }
  .bod-footer-social {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .bod-footer-copy {
    text-align: center;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.96);
    margin-top: 10px;
  }

  @media (max-width: 980px) {
    .bod-page { padding-top: 72px; }
    .bod-nav-links { display: none; }
    .bod-logo { height: 60px; }
    .bod-hero-inner { flex-direction: column; align-items: flex-start; }
    .bod-hero-image-wrap {
      width: min(100%, 330px);
      height: 230px;
      align-self: center;
    }
  }

  @media (max-width: 640px) {
    .bod-page { padding-top: 64px; }
    .bod-nav {
      min-height: 68px;
      padding: 8px 10px;
      gap: 10px;
    }
    .bod-logo { height: 52px; }
    .bod-auth { font-size: 0.72rem; }
    .bod-book { font-size: 0.8rem; padding: 8px 12px; }
    .bod-title { font-size: 2rem; }
    .bod-card-title { font-size: 1.14rem; }
    .bod-card p { font-size: 1.04rem; }
    .bod-footer-social { font-size: 1.3rem; }
    .bod-footer-link, .bod-footer-sep { font-size: 0.95rem; }
    .bod-footer-copy { font-size: 0.85rem; }
  }
`;

const directors = [
  {
    name: "Mr. Ravindra Dhariwal",
    role: "Chairman and Independent Director",
    text: "Mr. Ravindra Dhariwal is the Chairman and Independent Director of our Company. He holds a bachelor’s degree of technology in chemical engineering from Indian Institute of Technology, Kanpur and holds a post-graduate diploma in management from Indian Institute of Management, Calcutta. He is the chairperson of Sagacito Technologies Private Limited. He was the vice president of franchise for South East Asia at Pepsico International. He was appointed to our Board of Directors with effect from November 24, 2021. Mr. Dhariwal is also a Director on the Board of House of Kieraya Limited, Sagacito Technologies Private Limited, Sheela Foam Limited, IRB Infrastructure Developers Limited , Ebco Private Limited, Classic Vacations, LLC and Designated Partner in D and D Consulting LLP.",
  },
  {
    name: "Mr. Ankush Nijhawan",
    role: "Joint Managing Director",
    text: "Mr. Ankush Nijhawan is the Joint Managing Director of our Company. He holds a bachelor’s degree of science in business administration, with a major in marketing and a minor in psychology from Bryant University. He has experience in the travel industry and is one of the co-founders of TBO. He is the chairperson for FICCI’s Outbound Tourism Committee. He is a member of Young President’s Organization. He has appeared on CNBC-TV18’s show titled ‘Young Turks’. He has been named amongst the “40 Most Influential Indians under 40 2016-17” by URS Asia One. He has also been facilitated by the Economic Times as “The Game Changers of India” for his “revolutionary and unconventional contribution to Indian industry”. He was appointed to our Board of Directors with effect from March 12, 2007. Mr. Nijhawan is also a Director on the Board of LAP Travel Private Limited, Tek Travels DMCC and TBO Technology Consulting Shanghai Co. Ltd.",
  },
  {
    name: "Mr. Gaurav Bhatnagar",
    role: "Joint Managing Director",
    text: "Mr. Gaurav Bhatnagar is the Joint Managing Director and one of the Co-founders of the Company. He holds a bachelor’s degree of technology in computer science and engineering from the Indian Institute of Technology, Delhi and worked at Microsoft Corporation. He is one of the Vice Chairs of World Travel & Tourism Council (WTTC). He is also a co-founder of Tekriti Software Private Limited. He was appointed to our Board of Directors with effect from November 6, 2006 and has been associated with our Company since its inception. Mr. Bhatnagar is also a Director on the Board of Mediology Software Private Limited, YB Software Private Limited, Tek Travels DMCC and TBO Technology Consulting Shanghai Co. Ltd",
  },
  {
    name: "Ms. Anuranjita Kumar",
    role: "Independent Director",
    text: "Ms. Anuranjita Kumar is an Independent Director of our Company. She holds a bachelor’s degree of arts in psychology from Indraprastha College for Women, University of Delhi and has a post graduate diploma in personnel management and industrial relations from XLRI, Jamshedpur. She has previously been engaged with the Royal Bank of Scotland and is part of the council of advisors for the American India Foundation. She is also the co-founder and chief executive officer of WeAce. She was appointed to our Board of Directors with effect from November 24, 2021. Ms. Anuranjita is also a Director on the Board of ICRA Limited, Hero Fincorp Limited, Acme Solar Holdings Limited, Credila Financial Services Limited, NorthCap Services Private Limited, Northcap Services FZCO.",
  },
  {
    name: "Mr. Rahul Bhatnagar",
    role: "Independent Director",
    text: "Mr. Rahul Bhatnagar is an Independent Director of our Company. He holds a bachelor’s degree in arts from the University of Delhi and a master’s degree in business administration from Wharton School, University of Pennsylvania. He is also an associate member of the Institute of Chartered Accountants of India. He has been associated with Bharti Enterprises and Pepsico International. He was appointed to our Board of Directors with effect from November 24, 2021. Mr. Bhatnagar is also a Director on the Board of Sanofi India Limited, Whirlpool of India Limited, Rossell India Limited, Tasty Bite Eatables Limited, Tek Travels DMCC and Jumbonline Accommodations and Services, S.L.U.",
  },
  {
    name: "Mr. Bhaskar Pramanik",
    role: "Independent Director",
    text: "Mr. Bhaskar Pramanik is an Independent Director of our Company. He holds a bachelor’s degree in technology from the Indian Institute of Technology, Kanpur. He has experience in the technology industry. He is currently on the Indian advisory board of The Schulich School of Business, York University and the advisory council of Indian Institute of Technology, Palakkad and has served as director on the central board of State Bank of India. He has been previously engaged with Microsoft Corporation (India) Private Limited as chairman and area vice president and the National Radio and Electronics Company Limited as divisional manager – business systems division. He was appointed to our Board of Directors with effect from November 24, 2021. Mr. Pramanik is also a Director on the Board of Unity Small Finance Bank Limited, NAB Global Innovation Centre India Private Limited, Curebay Technologies Private Limited, Myytake Private Limited, Cordillera Hospitality Private Limited, Myy Sports Private Limited, and Partner in Altacura AI Absolute Return Fund LLP.",
  },
  {
    name: "Mr. Shantanu Rastogi",
    role: "Non-Executive (Nominee) Director",
    text: "Mr. Shantanu Rastogi is the Managing Director at General Atlantic, where he leads the firm's business in India. He serves on the boards of several prominent fintech, software, healthcare, and consumer businesses in India. He holds a B.Tech and M.Tech in Electrical Engineering from IIT Bombay and an MBA from the Wharton School of the University of Pennsylvania. Mr. Rastogi is also a Director on the Board of Cygnus Medicare Private Limited, General Atlantic Private Limited, KFIN Technologies Limited, TNC-The Nature Conservancy Centre, Acko Technology & Services Private Limited, ASG Hospital Private Limited, Nobroker Technologies Solutions Private Limited, Rubicon Research Private Limited, Sorting Hat Technologies Private Limited, 1 4 Snapmint Credit Advisory Private Limited, IIT Bombay Development and Relations Foundation, General Atlantic Service Company, L.P., General Atlantic, L.P. and IIT Bombay Society for Innovation & Entrepreneurship (SINE).",
  },
  {
    name: "Mr. Akshat Verma",
    role: "Chief Technology Officer and Whole-time Director",
    text: "Mr. Akshat Verma is the Chief Technology Officer and Whole-time Director of the Company. He has significant expertise in building scalable consumer–facing applications as well as deep tech systems in the space of Data science, cloud computing and distributed systems. He holds a bachelor’s degree in technology in computer science and engineering from the IIT, Kharagpur and a master’s degree in computer science and engineering from IIT, Delhi. He joined our Company on February, 2023. Previously, he has worked with IBM India Private Limited, MakeMyTrip (India) Private Limited, Bharti Airtel Limited and SplashLearn. Mr. Akshat is also a partner in PIRG Asset CVI LLP and Gripset Asset XXXVI LLP.",
  },
];

const footerLinks = [
  "Home",
  "About Us",
  "Careers",
  "Privacy Policy",
  "Terms and Conditions",
  "Sanctions Policy",
  "Investors",
  "Media",
  "Contact Us",
];

export default function BoardOfDirectorsPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="bod-page">
        <SearchSectionTopNav active="about" />

        <section className="bod-hero">
          <div className="bod-hero-inner">
            <h1 className="bod-title">Board of Directors</h1>
            <div className="bod-hero-image-wrap">
              <img
                className="bod-hero-image"
                src="https://www.tbo.com/img/director-img.jpg"
                alt="Board room chairs"
              />
            </div>
          </div>
        </section>

        <section className="bod-body">
          {directors.map((d) => (
            <article className="bod-card" key={d.name}>
              <h2 className="bod-card-title">
                <strong>{d.name}</strong>, <span className="role">{d.role}</span>
              </h2>
              <div className="bod-accent" />
              <p>{d.text}</p>
            </article>
          ))}
        </section>

        <footer className="bod-footer">
          <div className="bod-footer-top">
            <div className="bod-footer-links">
              {footerLinks.map((item, idx) => (
                <span key={item}>
                  <a
                    href="#"
                    className="bod-footer-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item === "Home") navigate("/searchsection");
                      if (item === "About Us") navigate("/aboutus");
                      if (item === "Careers") navigate("/careers");
                    }}
                  >
                    {item}
                  </a>
                  {idx < footerLinks.length - 1 && <span className="bod-footer-sep"> | </span>}
                </span>
              ))}
            </div>
            <div className="bod-footer-social">
              <span>in</span>
              <span>f</span>
              <span>◎</span>
              <span>▢</span>
            </div>
          </div>
          <div className="bod-footer-copy">© All rights reserved</div>
        </footer>
      </div>
    </>
  );
}
