import { useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; overflow-x: hidden; }

  .tbo-wrap { font-family: 'Open Sans', sans-serif; color: #333; background: #fff; width: 100%; overflow-x: hidden; }

  /* ── NAVBAR ── */
  .tbo-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 5%;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    gap: 8px;
  }
  .tbo-logo-wrap { display: flex; flex-direction: column; line-height: 1; flex-shrink: 0; }
  .tbo-logo-text { display: flex; align-items: baseline; }
  .logo-tbo  { font-size: clamp(1.1rem, 2.5vw, 1.65rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; }
  .logo-dot  { color: #ff6600; font-size: clamp(1.1rem, 2.5vw, 1.65rem); font-weight: 800; }
  .logo-com  { font-size: clamp(1.1rem, 2.5vw, 1.65rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; }
  .logo-sub  { font-size: 0.46rem; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1px; }
  .tbo-nav-menu { display: flex; align-items: center; gap: 2px; list-style: none; flex-wrap: wrap; }
  .tbo-nav-menu li a { text-decoration: none; color: #444; font-size: clamp(0.68rem, 1.1vw, 0.82rem); font-weight: 500; padding: 5px 8px; border-radius: 3px; display: flex; align-items: center; gap: 2px; transition: color 0.15s; white-space: nowrap; }
  .tbo-nav-menu li a:hover, .tbo-nav-menu li a.active { color: #ff6600; }
  .tbo-nav-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .already-reg { font-size: 0.66rem; color: #888; white-space: nowrap; }
  .btn-book { background: #ff6600; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .btn-book:hover { background: #e05500; }

  /* ── SIDE CIRCLES ── */
  .side-circle-left  { position: fixed; left: -22px; top: 50%; transform: translateY(-50%); width: 44px; height: 120px; background: #003399; border-radius: 0 60px 60px 0; z-index: 10; }
  .side-circle-right { position: fixed; right: -22px; top: 40%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #ff6600; z-index: 10; }
  .side-circle-left2 { position: fixed; left: -22px; top: 75%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #003399; z-index: 10; }

  /* ── HERO ── */
  .tbo-hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: clamp(20px,4vw,48px) 5%; gap: clamp(16px,3vw,40px); max-width: 1200px; margin: 0 auto; width: 100%; }
  .hero-title { font-size: clamp(1.3rem, 3vw, 2rem); font-weight: 700; color: #222; line-height: 1.25; }
  .hero-title .red-dot { color: #ff3300; }
  .hero-body { font-size: clamp(0.7rem, 1.2vw, 0.82rem); color: #555; line-height: 1.65; margin-top: 12px; }
  .register-label { font-size: 0.74rem; color: #666; margin-top: 18px; margin-bottom: 10px; }
  .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
  .btn-become { background: #003399; color: #fff; border: none; padding: 9px 16px; border-radius: 4px; font-size: clamp(0.7rem,1.2vw,0.82rem); font-weight: 600; cursor: pointer; white-space: nowrap; }
  .btn-agent  { background: #ff6600; color: #fff; border: none; padding: 9px 16px; border-radius: 4px; font-size: clamp(0.7rem,1.2vw,0.82rem); font-weight: 600; cursor: pointer; white-space: nowrap; }
  .hero-video-wrap { border-radius: 10px; overflow: hidden; width: 100%; aspect-ratio: 16/11; background: #000; }
  .hero-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── NUMBERS ── */
  .tbo-numbers { text-align: center; padding: clamp(28px,5vw,56px) 5%; background: #f8f9fb; }
  .tbo-numbers h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; margin-bottom: 28px; }
  .stats-row { display: flex; justify-content: center; gap: clamp(20px,6vw,80px); flex-wrap: wrap; }
  .stat-num   { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 700; color: #0059b3; }
  .stat-label { font-size: clamp(0.68rem, 1.2vw, 0.82rem); color: #666; margin-top: 4px; }

  /* ── OUR BRANDS MARQUEE ── */
  .tbo-our-brands { padding: clamp(20px,4vw,48px) 0; text-align: center; background: #fff; }
  .tbo-our-brands h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; margin-bottom: 28px; }
  .brands-marquee-wrap { position: relative; width: 100%; overflow: hidden; }
  .brands-marquee-wrap::before,
  .brands-marquee-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none; }
  .brands-marquee-wrap::before { left: 0; background: linear-gradient(to right, #fff, transparent); }
  .brands-marquee-wrap::after  { right: 0; background: linear-gradient(to left,  #fff, transparent); }
  .brands-marquee-track { display: flex; align-items: center; gap: 56px; width: max-content; animation: marquee-scroll 22s linear infinite; }
  .brands-marquee-track:hover { animation-play-state: paused; }
  @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .brand-logo-img { height: clamp(28px,4vw,44px); width: auto; max-width: 130px; object-fit: contain; filter: grayscale(30%); opacity: 0.82; transition: filter 0.3s, opacity 0.3s, transform 0.3s; }
  .brand-logo-img:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.08); }

  /* ── VALUE ── */
  .tbo-value { padding: clamp(20px,4vw,48px) 5%; background: #f8f9fb; }
  .tbo-value h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; text-align: center; margin-bottom: 20px; }
  .value-tabs { display: flex; justify-content: center; gap: clamp(16px,4vw,60px); border-bottom: 1px solid #ddd; flex-wrap: wrap; }
  .value-tab { background: none; border: none; cursor: pointer; font-size: clamp(0.72rem,1.3vw,0.88rem); font-weight: 500; color: #777; padding: 8px 4px; position: relative; transition: color 0.2s; white-space: nowrap; }
  .value-tab.active { color: #ff6600; }
  .value-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #ff6600; }
  .value-tab-first { border: 1.5px solid #ff6600 !important; padding: 6px 18px !important; border-radius: 2px; margin-bottom: 4px; }
  .value-content-area { display: grid; grid-template-columns: auto 1fr; gap: clamp(16px,3vw,40px); align-items: flex-start; max-width: 900px; margin: 24px auto 0; width: 100%; }
  .value-blob-img { width: clamp(130px,20vw,220px); height: clamp(130px,20vw,220px); object-fit: cover; border-radius: 50% 40% 50% 40%; flex-shrink: 0; }
  .value-scroll-container { overflow: hidden; }
  .value-scroll-area { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 10px; }
  .value-scroll-area::-webkit-scrollbar { width: 4px; }
  .value-scroll-area::-webkit-scrollbar-track { background: #eee; border-radius: 4px; }
  .value-scroll-area::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
  .value-point { display: flex; gap: 10px; align-items: flex-start; }
  .vp-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff3300; margin-top: 5px; flex-shrink: 0; }
  .vp-title { font-weight: 700; font-size: clamp(0.76rem,1.3vw,0.88rem); color: #222; }
  .vp-desc  { font-size: clamp(0.68rem,1.1vw,0.78rem); color: #666; line-height: 1.55; margin-top: 3px; }

  /* ── PARTNER BRANDS ── */
  .tbo-partner-brands { padding: clamp(20px,4vw,48px) 5%; text-align: center; }
  .tbo-partner-brands h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; margin-bottom: 24px; }
  .partner-row { display: flex; justify-content: center; align-items: center; gap: clamp(16px,4vw,56px); flex-wrap: wrap; }
  .hilton-box { border: 1.5px solid #222; padding: 4px 12px; font-size: clamp(0.82rem,1.5vw,1rem); font-weight: 800; letter-spacing: 1px; color: #1c1c1c; white-space: nowrap; }
  .expedia-wrap { display: flex; flex-direction: column; align-items: flex-start; }
  .expedia-top { font-size: clamp(0.8rem,1.4vw,0.95rem); font-weight: 700; color: #1c1c1c; display: flex; align-items: center; gap: 5px; }
  .expedia-sub { font-size: 0.58rem; color: #666; letter-spacing: 0.5px; margin-left: 20px; }

  /* ── GROWTH STORIES SLIDER ── */
  .tbo-growth { padding: clamp(20px,4vw,48px) 0; text-align: center; }
  .tbo-growth h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; margin-bottom: 22px; }

  .slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .slider-viewport { overflow: hidden; width: var(--sv-width, calc(4 * 200px + 3 * 16px)); }
  .slider-track { display: flex; gap: 16px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); will-change: transform; }

  .growth-card { width: var(--card-w, 200px); flex-shrink: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.13); transition: transform 0.2s, box-shadow 0.2s; }
  .growth-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
  .gc-video-wrap { position: relative; height: clamp(110px,14vw,148px); overflow: hidden; background: #111; }
  .gc-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gc-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .gc-overlay:hover { background: rgba(0,0,0,0.32); }
  .gc-play { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.92); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; box-shadow: 0 2px 10px rgba(0,0,0,0.25); transition: transform 0.15s; }
  .gc-overlay:hover .gc-play { transform: scale(1.1); }
  .gc-info { padding: 10px 12px; color: #fff; }
  .gc-info.orange-info { background: #cc4400; }
  .gc-info.tan-info    { background: #996622; }
  .gc-info.green-info  { background: #335533; }
  .gc-info.blue-info   { background: #1a3d88; }
  .gc-name { font-size: clamp(0.68rem,1.2vw,0.8rem); font-weight: 600; }
  .gc-org  { font-size: clamp(0.58rem,1vw,0.68rem); opacity: 0.88; margin-top: 2px; }

  /* Shared arrow style */
  .slider-arrow, .awards-arrow {
    background: #fff; border: 1.5px solid #ddd; border-radius: 50%;
    width: 36px; height: 36px; min-width: 36px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    color: #444; margin: 0 8px;
    line-height: 1;
  }
  .slider-arrow:hover, .awards-arrow:hover { background: #ff6600; border-color: #ff6600; color: #fff; transform: scale(1.08); }
  .slider-arrow:disabled, .awards-arrow:disabled { opacity: 0.3; cursor: default; transform: none; }

  /* Shared dots */
  .growth-dots, .awards-dots { display: flex; justify-content: center; gap: 7px; margin-top: 16px; }
  .gdot, .adot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; cursor: pointer; border: none; padding: 0; transition: background 0.2s, transform 0.2s; }
  .gdot.active, .adot.active { background: #ff6600; transform: scale(1.25); }

  /* ── AWARDS ── */
  .tbo-awards { padding: clamp(20px,4vw,48px) 0; text-align: center; background: #f8f9fb; }
  .tbo-awards h2 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 700; color: #222; margin-bottom: 24px; }
  .awards-slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .awards-viewport { overflow: hidden; width: var(--av-width, calc(5 * 110px + 4 * 20px)); }
  .awards-track { display: flex; gap: 20px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); will-change: transform; }
  .award-item { flex-shrink: 0; width: var(--award-w, 110px); display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .award-img { width: 100%; max-width: 90px; aspect-ratio: 1; object-fit: contain; transition: transform 0.25s; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.12)); }
  .award-item:hover .award-img { transform: scale(1.1); }
  .award-label { font-size: clamp(0.52rem,0.9vw,0.62rem); color: #666; text-align: center; line-height: 1.4; }

  /* ── FOOTER ── */
  .tbo-footer { background: #003380; color: #ccc; padding: 18px 5% 14px; }
  .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .footer-links { display: flex; gap: 0; flex-wrap: wrap; align-items: center; }
  .footer-links a { color: #ccc; font-size: clamp(0.6rem,1vw,0.74rem); text-decoration: none; padding: 2px 6px; transition: color 0.2s; white-space: nowrap; }
  .footer-links a:hover { color: #fff; }
  .footer-sep { color: #556; }
  .footer-social { display: flex; gap: 8px; }
  .footer-si { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #fff; cursor: pointer; font-weight: 700; }
  .footer-copy { font-size: 0.66rem; color: #99a; text-align: center; margin-top: 10px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .side-circle-left, .side-circle-left2, .side-circle-right { display: none; }
    .tbo-hero { grid-template-columns: 1fr; }
    .hero-video-wrap { aspect-ratio: 16/9; max-height: 300px; }
    .value-content-area { grid-template-columns: 1fr; justify-items: center; }
    .value-blob-img { width: 160px; height: 160px; }
  }

  @media (max-width: 640px) {
    .tbo-nav-menu { display: none; }
    .stats-row { gap: 16px; }
    .footer-inner { flex-direction: column; align-items: flex-start; }
    .value-tabs { gap: 10px; }
  }
`;

const valueContent = {
  "Travel buyers": [
    { title: "Customer support", desc: "Benefit from round-the-clock customer support in your local language, ensuring seamless service and customer satisfaction, with over 500 account managers offering warm and dedicated assistance." },
    { title: "Earn reward points", desc: "With TBO+, earn reward points from your very first booking and access free learning opportunities on travel products with TBO Academy." },
    { title: "Leverage TBO to increase sales", desc: "With TBO+ reward program, you can increase bookings through exclusive promotions that will be marketed to travel agents." },
  ],
  "Travel suppliers": [
    { title: "Global distribution network", desc: "Instantly connect with over 159,000 travel buyers across 100+ countries and grow your reach without additional marketing spend." },
    { title: "Real-time inventory management", desc: "Manage live availability and pricing across all channels through our powerful, easy-to-use supplier portal." },
    { title: "Revenue analytics", desc: "Access detailed reports on booking trends, top-performing buyers, and revenue opportunities to optimize your strategy." },
  ],
  "Travelpreneurs": [
    { title: "Zero investment startup", desc: "Launch your own travel business with no upfront cost — use TBO's platform, supplier network, and tools from day one." },
    { title: "Training & mentorship", desc: "Get certified through TBO Academy and receive dedicated mentorship to accelerate your growth as a travel entrepreneur." },
    { title: "Earn from day one", desc: "Start earning commissions immediately on bookings while building expertise and a loyal client base." },
  ],
};

const stories = [
  { name: "Dinesh Poojary",       org: "Travel Agent",                            info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/Dinesh-Poojary.mp4" },
  { name: "Gautam Vij",           org: "KBS Tours and Travels, India",            info: "blue-info",   video: "https://www.tbo.com/img/testimonials/agent/Gautam-Vij.mp4" },
  { name: "Sebastian Sierra",     org: "Travel Agent",                            info: "green-info",  video: "https://www.tbo.com/img/testimonials/agent/Sebastian-Sierra.mp4" },
  { name: "Stuart Lee",           org: "Travel Agent",                            info: "tan-info",    video: "https://www.tbo.com/img/testimonials/agent/Stuart-Lee.mp4" },
  { name: "UAE Agent",            org: "UAE",                                     info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/UAEAgenta.mp4" },
  { name: "Mr. Kuljit Singh Hayer", org: "Universal Travels, Jalandhar, India",  info: "green-info",  video: "https://www.tbo.com/img/testimonials/agent/KuljitSingh.mp4" },
  { name: "Fortun Plumley",       org: "Travel Agent",                            info: "blue-info",   video: "https://www.tbo.com/img/testimonials/agent/Fortun-PlumLey.mp4" },
];

const awards = [
  { img: "https://www.tbo.com/img/awards/TWMGold_Award_2024.png",          label: "TWM Gold Award 2024" },
  { img: "https://www.tbo.com/img/awards/BDD_B2B_campaign.png",            label: "Best Data Driven B2B Campaign" },
  { img: "https://www.tbo.com/img/awards/BTDC_Y_2024.png",                 label: "Best Travel Distribution Company 2024" },
  { img: "https://www.tbo.com/img/awards/EoTYAward_2024.png",              label: "Entrepreneur of the Year Award 2024" },
  { img: "https://www.tbo.com/img/awards/OTM_of_the_year.png",             label: "OTM of the Year" },
  { img: "https://www.tbo.com/img/awards/MEB_B2B_Travel_Portal_2025.png",  label: "Middle East's Best B2B Travel Portal 2025" },
  { img: "https://www.tbo.com/img/awards/LAB_B2B_Travel_Provider_2025.png",label: "Latin America's Best B2B Travel Provider 2025" },
  { img: "https://www.tbo.com/img/awards/ttm.jpg",                         label: "TTM Award" },
];

const brandLogos = [
  { src: "https://www.tbo.com/img/logos/sabre-min.png",          alt: "Sabre" },
  { src: "https://www.tbo.com/img/brands/bookabed-min.png",      alt: "Bookabed" },
  { src: "https://www.tbo.com/img/brands/zamzamlogo-min.png",    alt: "Zamzam" },
  { src: "https://www.tbo.com/img/brands/jumbonline-min.png",    alt: "JumbOnline" },
  { src: "https://www.tbo.com/img/brands/paxes-min.png",         alt: "PAXES" },
  { src: "https://www.tbo.com/img/brands/zamzamlogo-min.png",    alt: "Zamzam 2" },
  { src: "https://www.tbo.com/img/brands/kizanlogo-min.png",     alt: "Kizan" },
  { src: "https://www.tbo.com/img/brands/tboacademy-min.png",    alt: "TBO Academy" },
  { src: "https://www.tbo.com/img/brands/classic-vacations.png", alt: "Classic Vacations" },
];

const footerLinks = ["Home","About Us","Careers","Privacy Policy","Terms and Conditions","Sanctions Policy","Investors","Media","Contact Us"];

/* ─── helpers to compute responsive slider sizes ─── */
function useSliderSizes() {
  const [sizes, setSizes] = useState({ cardW: 200, visibleCards: 4, awardW: 110, visibleAwards: 5 });

  useEffect(() => {
    function calc() {
      const W = window.innerWidth;
      let visibleCards, cardW, visibleAwards, awardW;

      if (W < 480)       { visibleCards = 1; cardW = Math.floor((W * 0.88));           visibleAwards = 2; awardW = Math.floor((W * 0.88 - 20) / 2); }
      else if (W < 640)  { visibleCards = 2; cardW = Math.floor((W * 0.88 - 16) / 2); visibleAwards = 3; awardW = Math.floor((W * 0.88 - 40) / 3); }
      else if (W < 900)  { visibleCards = 3; cardW = Math.floor((W * 0.88 - 32) / 3); visibleAwards = 4; awardW = Math.floor((W * 0.88 - 60) / 4); }
      else               { visibleCards = 4; cardW = Math.min(200, Math.floor((W * 0.80 - 48) / 4)); visibleAwards = 5; awardW = Math.min(110, Math.floor((W * 0.80 - 80) / 5)); }

      setSizes({ cardW, visibleCards, awardW, visibleAwards });
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return sizes;
}

export default function TBOHomepage() {
  const [activeTab,   setActiveTab]   = useState("Travel buyers");
  const [playingIdx,  setPlayingIdx]  = useState(null);
  const [slideIdx,    setSlideIdx]    = useState(0);
  const [isPaused,    setIsPaused]    = useState(false);
  const [awardIdx,    setAwardIdx]    = useState(0);
  const [awardPaused, setAwardPaused] = useState(false);

  const { cardW, visibleCards, awardW, visibleAwards } = useSliderSizes();
  const GAP = 16, AWARD_GAP = 20;

  const maxSlide = Math.max(0, stories.length - visibleCards);
  const maxAward = Math.max(0, awards.length - visibleAwards);

  const videoRefs = useState(() => stories.map(() => ({ current: null })))[0];

  const handlePlay = (i) => {
    if (playingIdx !== null && playingIdx !== i && videoRefs[playingIdx].current)
      videoRefs[playingIdx].current.pause();
    setPlayingIdx(i);
  };

  const goTo    = (idx) => setSlideIdx(Math.max(0, Math.min(idx, maxSlide)));
  const goAward = (idx) => setAwardIdx(Math.max(0, Math.min(idx, maxAward)));

  // clamp index when window resizes
  useEffect(() => { if (slideIdx > maxSlide) setSlideIdx(maxSlide); }, [maxSlide]);
  useEffect(() => { if (awardIdx > maxAward) setAwardIdx(maxAward); }, [maxAward]);

  // auto-slide stories
  useEffect(() => {
    if (isPaused || playingIdx !== null) return;
    const t = setInterval(() => setSlideIdx(p => p >= maxSlide ? 0 : p + 1), 3000);
    return () => clearInterval(t);
  }, [isPaused, playingIdx, maxSlide]);

  // auto-slide awards
  useEffect(() => {
    if (awardPaused) return;
    const t = setInterval(() => setAwardIdx(p => p >= maxAward ? 0 : p + 1), 2500);
    return () => clearInterval(t);
  }, [awardPaused, maxAward]);

  const svWidth  = visibleCards * cardW + (visibleCards - 1) * GAP;
  const avWidth  = visibleAwards * awardW + (visibleAwards - 1) * AWARD_GAP;

  return (
    <>
      <style>{css}</style>
      <div className="tbo-wrap">
        <div className="side-circle-left" />
        <div className="side-circle-left2" />
        <div className="side-circle-right" />

        {/* ── NAVBAR ── */}
        <nav className="tbo-nav">
          <div className="tbo-logo-wrap">
            <div className="tbo-logo-text">
              <span className="logo-tbo">tbo</span>
              <span className="logo-dot">.</span>
              <span className="logo-com">com</span>
            </div>
            <span className="logo-sub">TRAVEL SIMPLIFIED</span>
          </div>

          <ul className="tbo-nav-menu">
            {[{label:"Home",active:true},{label:"Products",arrow:true},{label:"Solutions",arrow:true},{label:"TBO Cares"},{label:"Careers"},{label:"About Us",arrow:true}].map(item => (
              <li key={item.label}>
                <a href="#" className={item.active ? "active" : ""}>
                  {item.label}{item.arrow && " ▾"}
                </a>
              </li>
            ))}
          </ul>

          <div className="tbo-nav-right">
            <span className="already-reg">Already Registered?</span>
            <button className="btn-book">Book Now</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="tbo-hero">
          <div>
            <h1 className="hero-title">Simplifying Travel<span className="red-dot">.</span><br />Enabling Growth</h1>
            <p className="hero-body">We are one of the leading global travel distribution platforms, simplifying the travel business for both suppliers and buyers. Our suppliers include hotels, airlines, cruises, car rentals, transfers, and rail services. Our buyers consist of retail and API buyers such as travel agencies, independent travel advisors, and enterprise buyers including tour operators, travel management companies, online travel companies, super-apps, and loyalty apps. As a publicly listed company on the NSE and BSE, we reinforce strategic vision and commitment to sustainable business practices.</p>
            <p className="hero-body">Our platform enables seamless transactions between these parties, connecting over 159,000 buyers with over 1 million suppliers across 100+ countries.</p>
            <p className="register-label">Register with us:</p>
            <div className="hero-btns">
              <button className="btn-become">Become TBO Partner</button>
              <button className="btn-agent">Agent Partner</button>
            </div>
          </div>

          <div className="hero-video-wrap">
            <video src="https://www.tbo.com/img/videos/The-World-of-TBO-Group.mp4?var=300420244" autoPlay muted loop playsInline />
          </div>
        </div>

        {/* ── TBO IN NUMBERS ── */}
        <section className="tbo-numbers">
          <h2>TBO in numbers</h2>
          <div className="stats-row">
            {[{num:"159K+",label:"Travel buyers"},{num:"1M+",label:"Hotels worldwide"},{num:"100+",label:"Countries"},{num:"55+",label:"Supported currencies"}].map(s => (
              <div key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR BRANDS MARQUEE ── */}
        <section className="tbo-our-brands">
          <h2>Our brands</h2>
          <div className="brands-marquee-wrap">
            {/* Duplicate the list for seamless infinite loop */}
            <div className="brands-marquee-track">
              {[...brandLogos, ...brandLogos].map((b, i) => (
                <img key={i} src={b.src} alt={b.alt} className="brand-logo-img" />
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW DO WE ADD VALUE ── */}
        <section className="tbo-value">
          <h2>How do we add value to..</h2>
          <div className="value-tabs">
            {Object.keys(valueContent).map((tab, i) => (
              <button key={tab} className={`value-tab ${activeTab===tab?"active":""} ${i===0&&activeTab===tab?"value-tab-first":""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="value-content-area">
            <img src="https://www.tbo.com/img/travelbuyers.webp" alt="Travel Buyers" className="value-blob-img" />
            <div className="value-scroll-container">
              <div className="value-scroll-area">
                {valueContent[activeTab].map(p => (
                  <div className="value-point" key={p.title}>
                    <div className="vp-dot" />
                    <div>
                      <div className="vp-title">{p.title}</div>
                      <div className="vp-desc">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BRANDS WE WORK WITH ── */}
        <section className="tbo-partner-brands">
          <h2>Brands we work with</h2>
          <div className="partner-row">
            <div className="expedia-wrap">
              <div className="expedia-top"><span style={{color:"#e05500"}}>⬡</span> expedia</div>
              <div className="expedia-sub">group</div>
            </div>
            <div className="hilton-box">Hilton</div>
            <div style={{fontWeight:700,fontSize:"clamp(0.85rem,1.5vw,1rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>Derby</span>Soft</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontWeight:600,fontSize:"0.95rem"}}><span>●</span> Roibos</div>
            <div style={{fontSize:"0.9rem",color:"#1c1c1c"}}><span style={{fontWeight:300}}>ibs</span><span style={{fontWeight:700}}>software</span></div>
          </div>
        </section>

        {/* ── GROWTH STORIES SLIDER ── */}
        <section className="tbo-growth">
          <h2>Growth Stories</h2>
          <div className="slider-wrapper" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <button className="slider-arrow" onClick={() => goTo(slideIdx-1)} disabled={slideIdx===0}>‹</button>
            <div className="slider-viewport" style={{width: svWidth}}>
              <div className="slider-track" style={{transform:`translateX(-${slideIdx*(cardW+GAP)}px)`}}>
                {stories.map((s,i) => (
                  <div className="growth-card" style={{width:cardW}} key={i}>
                    <div className="gc-video-wrap">
                      <video
                        ref={el => { videoRefs[i].current = el; }}
                        src={s.video} preload="metadata" playsInline
                        controls={playingIdx===i}
                        style={{width:"100%",height:"100%",objectFit:"cover",display:"block",background:"#111"}}
                        onPlay={() => handlePlay(i)}
                        onPause={() => { if(playingIdx===i) setPlayingIdx(null); }}
                      />
                      {playingIdx!==i && (
                        <div className="gc-overlay" onClick={() => { handlePlay(i); videoRefs[i].current?.play(); }}>
                          <div className="gc-play">▶</div>
                        </div>
                      )}
                    </div>
                    <div className={`gc-info ${s.info}`}>
                      <div className="gc-name">{s.name}</div>
                      <div className="gc-org">{s.org}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="slider-arrow" onClick={() => goTo(slideIdx+1)} disabled={slideIdx>=maxSlide}>›</button>
          </div>
          <div className="growth-dots">
            {Array.from({length:maxSlide+1}).map((_,i) => (
              <button key={i} className={`gdot ${slideIdx===i?"active":""}`} onClick={() => goTo(i)} />
            ))}
          </div>
        </section>

        {/* ── AWARDS ── */}
        <section className="tbo-awards">
          <h2>Awards</h2>
          <div className="awards-slider-wrapper" onMouseEnter={() => setAwardPaused(true)} onMouseLeave={() => setAwardPaused(false)}>
            <button className="awards-arrow" onClick={() => goAward(awardIdx-1)} disabled={awardIdx===0}>‹</button>
            <div className="awards-viewport" style={{width:avWidth}}>
              <div className="awards-track" style={{transform:`translateX(-${awardIdx*(awardW+AWARD_GAP)}px)`}}>
                {awards.map(a => (
                  <div className="award-item" style={{width:awardW}} key={a.label}>
                    <img src={a.img} alt={a.label} className="award-img" />
                    <div className="award-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="awards-arrow" onClick={() => goAward(awardIdx+1)} disabled={awardIdx>=maxAward}>›</button>
          </div>
          <div className="awards-dots">
            {Array.from({length:maxAward+1}).map((_,i) => (
              <button key={i} className={`adot ${awardIdx===i?"active":""}`} onClick={() => goAward(i)} />
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="tbo-footer">
          <div className="footer-inner">
            <div className="footer-links">
              {footerLinks.map((l,i) => (
                <span key={l} style={{display:"flex",alignItems:"center"}}>
                  <a href="#">{l}</a>
                  {i < footerLinks.length-1 && <span className="footer-sep">|</span>}
                </span>
              ))}
            </div>
            <div className="footer-social">
              {["in","f","📷","🐦"].map((icon,i) => <div key={i} className="footer-si">{icon}</div>)}
            </div>
          </div>
          <div className="footer-copy">© All rights reserved</div>
        </footer>
      </div>
    </>
  );
}