import { useState, useEffect, useRef, useCallback } from "react";

/* ─── FONTS & BASE CSS ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; overflow-x: hidden; }

  .tbo-wrap { font-family: 'DM Sans', sans-serif; color: #333; background: #fff; width: 100%; overflow-x: hidden; }

  /* ── NAVBAR ── */
  .tbo-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 5%;
    border-bottom: 1px solid #ebebeb;
    background: #fff;
    position: sticky; top: 0; z-index: 500;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    gap: 12px;
    min-height: 72px;
  }
  .tbo-logo-wrap { display: flex; flex-direction: column; line-height: 1; flex-shrink: 0; }
  .tbo-logo-text { display: flex; align-items: baseline; }
  .logo-tbo  { font-size: clamp(1.5rem, 2.8vw, 2.1rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; font-family: 'Playfair Display', serif; }
  .logo-dot  { color: #ff6600; font-size: clamp(1.5rem, 2.8vw, 2.1rem); font-weight: 800; }
  .logo-com  { font-size: clamp(1.5rem, 2.8vw, 2.1rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; font-family: 'Playfair Display', serif; }
  .logo-sub  { font-size: 0.5rem; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .tbo-nav-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .already-reg { font-size: 0.72rem; color: #888; white-space: nowrap; }
  .btn-book { background: #ff6600; color: #fff; border: none; padding: 9px 22px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: background 0.2s, transform 0.15s; }
  .btn-book:hover { background: #e05500; transform: scale(1.03); }

  /* ── SEARCH BAR CONTAINER ── */
  .search-bar-container {
    flex: 1;
    max-width: 640px;
    min-width: 0;
    position: relative;
  }
  .search-pill {
    display: flex;
    align-items: stretch;
    border: 1.5px solid #e4e4e4;
    border-radius: 50px;
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    overflow: visible;
    cursor: pointer;
    transition: box-shadow 0.2s;
    position: relative;
  }
  .search-pill:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.13); }
  .search-pill.active { box-shadow: 0 6px 28px rgba(0,0,0,0.16); border-color: transparent; }

  .pill-section {
    flex: 1;
    padding: 0 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    cursor: pointer;
    border-radius: 50px;
    transition: background 0.15s;
    position: relative;
  }
  .pill-section::after {
    content: '';
    position: absolute;
    right: 0; top: 20%; bottom: 20%;
    width: 1px;
    background: #e4e4e4;
  }
  .pill-section:last-of-type::after { display: none; }
  .pill-section:hover { background: #f5f5f5; }
  .pill-section.open { background: #fff; border-radius: 50px; box-shadow: 0 0 0 2px #ff6600; z-index: 2; }

  .pill-label { font-size: 0.65rem; font-weight: 700; color: #111; letter-spacing: 0.3px; text-transform: uppercase; white-space: nowrap; }
  .pill-value { font-size: 0.85rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top: 2px; }
  .pill-value.placeholder { color: #aaa; }

  .pill-search-btn {
    background: linear-gradient(135deg, #ff6600, #ff3366);
    border: none; cursor: pointer;
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 5px 6px 5px 4px;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 3px 12px rgba(255,80,50,0.4);
  }
  .pill-search-btn:hover { transform: scale(1.1); box-shadow: 0 5px 18px rgba(255,80,50,0.55); }
  .pill-search-btn svg { width: 18px; height: 18px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; }

  /* ── DROPDOWNS ── */
  .dropdown-overlay {
    position: fixed; inset: 0; z-index: 400;
  }
  .dropdown-panel {
    position: absolute;
    top: calc(100% + 14px);
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    z-index: 600;
    animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
    overflow: hidden;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.97); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
  }

  /* WHERE DROPDOWN */
  .where-dropdown { width: 420px; padding: 16px; }
  .where-search-input {
    width: 100%; padding: 12px 16px; border: 1.5px solid #e0e0e0;
    border-radius: 14px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
    outline: none; background: #fafafa; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .where-search-input:focus { border-color: #ff6600; box-shadow: 0 0 0 3px rgba(255,102,0,0.1); background: #fff; }
  .dest-list { margin-top: 10px; display: flex; flex-direction: column; gap: 2px; }
  .dest-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 12px; cursor: pointer;
    transition: background 0.15s;
  }
  .dest-item:hover { background: #fff5f0; }
  .dest-thumb {
    width: 44px; height: 44px; border-radius: 10px; object-fit: cover; flex-shrink: 0;
    background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  }
  .dest-info { flex: 1; min-width: 0; }
  .dest-city { font-size: 0.85rem; font-weight: 600; color: #111; }
  .dest-country { font-size: 0.72rem; color: #888; margin-top: 1px; }
  .dest-section-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #aaa; padding: 10px 12px 4px; }

  /* WHEN DROPDOWN */
  .when-dropdown { width: 660px; }
  .when-tabs { display: flex; border-bottom: 1px solid #f0f0f0; padding: 16px 16px 0; gap: 4px; }
  .when-tab {
    padding: 8px 18px; border-radius: 24px; border: none;
    background: none; cursor: pointer; font-size: 0.82rem; font-weight: 500;
    color: #777; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .when-tab.active { background: #111; color: #fff; }
  .when-tab:hover:not(.active) { background: #f5f5f5; color: #333; }
  .when-body { padding: 20px; }

  /* Calendar */
  .cal-container { display: flex; gap: 24px; }
  .cal-month { flex: 1; }
  .cal-month-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .cal-month-name { font-size: 0.88rem; font-weight: 700; color: #111; }
  .cal-nav-btn { background: none; border: 1.5px solid #e4e4e4; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-size: 0.9rem; }
  .cal-nav-btn:hover { background: #f5f5f5; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .cal-dow { font-size: 0.65rem; font-weight: 700; text-align: center; color: #aaa; padding: 4px; text-transform: uppercase; }
  .cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; cursor: pointer; font-size: 0.78rem; font-weight: 500;
    transition: all 0.15s; position: relative;
  }
  .cal-day:hover:not(.disabled):not(.selected) { background: #f5f5f5; }
  .cal-day.disabled { color: #ddd; cursor: default; }
  .cal-day.in-range { background: #fff0eb; border-radius: 0; color: #cc4400; }
  .cal-day.range-start { background: #ff6600 !important; color: #fff !important; border-radius: 50% 0 0 50%; }
  .cal-day.range-end { background: #ff6600 !important; color: #fff !important; border-radius: 0 50% 50% 0; }
  .cal-day.selected { background: #ff6600 !important; color: #fff !important; border-radius: 50% !important; }
  .cal-day.today::after { content:''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #ff6600; border-radius: 50%; }
  .cal-day.today.selected::after { background: rgba(255,255,255,0.7); }

  .flex-options { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
  .flex-chip {
    padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e4e4e4;
    background: #fff; cursor: pointer; font-size: 0.75rem; font-weight: 500;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s; color: #555;
  }
  .flex-chip.active { border-color: #111; background: #111; color: #fff; }
  .flex-chip:hover:not(.active) { border-color: #999; color: #333; }

  /* Months tab */
  .months-tab-body { display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .circle-selector { position: relative; width: 200px; height: 200px; }
  .circle-svg { overflow: visible; }
  .circle-selector-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
  .circle-duration { font-size: 2rem; font-weight: 700; color: #111; line-height: 1; }
  .circle-unit { font-size: 0.72rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .months-range-display { text-align: center; }
  .months-range-text { font-size: 1.1rem; font-weight: 600; color: #111; }
  .months-range-sub { font-size: 0.78rem; color: #888; margin-top: 4px; }
  .months-hint { font-size: 0.75rem; color: #aaa; margin-top: 4px; }

  /* Flexible tab */
  .flex-stay-label { font-size: 0.88rem; font-weight: 700; color: #111; margin-bottom: 10px; }
  .flex-stay-options { display: flex; gap: 10px; margin-bottom: 22px; }
  .flex-stay-btn {
    flex: 1; padding: 12px 8px; border-radius: 14px; border: 1.5px solid #e4e4e4;
    background: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.18s; display: flex; flex-direction: column; align-items: center; gap: 3px;
  }
  .flex-stay-btn .stay-icon { font-size: 1.3rem; }
  .flex-stay-btn .stay-name { font-size: 0.8rem; font-weight: 600; color: #333; }
  .flex-stay-btn .stay-desc { font-size: 0.66rem; color: #999; }
  .flex-stay-btn.active { border-color: #111; background: #f8f8f8; }
  .flex-stay-btn:hover:not(.active) { border-color: #bbb; }
  .when-go-label { font-size: 0.88rem; font-weight: 700; color: #111; margin-bottom: 10px; }
  .month-cards-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
  .month-cards-scroll::-webkit-scrollbar { height: 3px; }
  .month-cards-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  .month-card {
    flex-shrink: 0; width: 90px; border-radius: 14px; border: 1.5px solid #e4e4e4;
    padding: 12px 8px; text-align: center; cursor: pointer;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .month-card .mc-emoji { font-size: 1.4rem; }
  .month-card .mc-month { font-size: 0.8rem; font-weight: 600; color: #333; margin-top: 4px; }
  .month-card .mc-year { font-size: 0.65rem; color: #aaa; }
  .month-card.active { border-color: #111; background: #f8f8f8; }
  .month-card:hover:not(.active) { border-color: #bbb; }

  /* WHO DROPDOWN */
  .who-dropdown { width: 340px; padding: 20px; }
  .guest-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
  .guest-row:last-child { border-bottom: none; }
  .guest-info {}
  .guest-type { font-size: 0.88rem; font-weight: 600; color: #111; }
  .guest-age  { font-size: 0.72rem; color: #aaa; margin-top: 1px; }
  .guest-counter { display: flex; align-items: center; gap: 10px; }
  .guest-btn {
    width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid #e0e0e0;
    background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: #555; transition: all 0.15s; line-height: 1;
  }
  .guest-btn:hover:not(:disabled) { border-color: #888; color: #111; background: #f8f8f8; }
  .guest-btn:disabled { opacity: 0.3; cursor: default; }
  .guest-count { font-size: 0.95rem; font-weight: 600; color: #111; min-width: 20px; text-align: center; }

  /* ── DROPDOWN FOOTER ── */
  .dropdown-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 20px; border-top: 1px solid #f0f0f0;
  }
  .btn-clear { background: none; border: none; font-size: 0.82rem; font-weight: 600; text-decoration: underline; cursor: pointer; color: #555; font-family: 'DM Sans', sans-serif; }
  .btn-apply {
    background: linear-gradient(135deg, #ff6600, #ff3366);
    color: #fff; border: none; padding: 10px 22px; border-radius: 20px;
    font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 14px rgba(255,80,50,0.4); transition: transform 0.15s, box-shadow 0.2s;
  }
  .btn-apply:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(255,80,50,0.5); }

  /* ── SIDE CIRCLES ── */
  .side-circle-left  { position: fixed; left: -22px; top: 50%; transform: translateY(-50%); width: 44px; height: 120px; background: #003399; border-radius: 0 60px 60px 0; z-index: 10; }
  .side-circle-right { position: fixed; right: -22px; top: 40%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #ff6600; z-index: 10; }
  .side-circle-left2 { position: fixed; left: -22px; top: 75%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #003399; z-index: 10; }

  /* ── HERO ── */
  .tbo-hero {
    display: grid; grid-template-columns: 1fr 1fr; align-items: center;
    padding: clamp(32px, 5vw, 64px) 6%;
    gap: clamp(24px, 4vw, 56px);
    max-width: 1280px; margin: 0 auto; width: 100%;
  }
  .hero-title {
    font-size: clamp(1.6rem, 3.2vw, 2.6rem);
    font-weight: 700; color: #1a1a1a; line-height: 1.2;
    font-family: 'Playfair Display', serif;
  }
  .hero-title .red-dot { color: #ff3300; }
  .hero-body {
    font-size: clamp(0.82rem, 1.2vw, 0.95rem);
    color: #555; line-height: 1.75; margin-top: 18px;
  }
  .register-label { font-size: 0.82rem; color: #555; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
  .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-become {
    background: #003399; color: #fff; border: none; padding: 12px 22px;
    border-radius: 20px; font-size: clamp(0.78rem, 1.1vw, 0.9rem); font-weight: 600;
    cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: background 0.2s;
  }
  .btn-become:hover { background: #002277; }
  .btn-agent {
    background: #ff6600; color: #fff; border: none; padding: 12px 22px;
    border-radius: 20px; font-size: clamp(0.78rem, 1.1vw, 0.9rem); font-weight: 600;
    cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: background 0.2s;
  }
  .btn-agent:hover { background: #e05500; }
  .hero-video-wrap {
    border-radius: 14px; overflow: hidden; width: 100%; aspect-ratio: 16/10;
    background: #000; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  }
  .hero-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── NUMBERS ── */
  .tbo-numbers {
    text-align: center; padding: clamp(40px, 6vw, 80px) 6%;
    background: #f8f9fb;
  }
  .tbo-numbers h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; margin-bottom: 40px;
    font-family: 'Playfair Display', serif;
  }
  .stats-row { display: flex; justify-content: center; gap: clamp(32px, 8vw, 100px); flex-wrap: wrap; }
  .stat-item { display: flex; flex-direction: column; align-items: center; }
  .stat-num {
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 700; color: #0059b3; line-height: 1;
    font-family: 'Playfair Display', serif;
  }
  .stat-label { font-size: clamp(0.78rem, 1.2vw, 0.92rem); color: #666; margin-top: 8px; font-weight: 500; }

  /* ── OUR BRANDS MARQUEE ── */
  .tbo-our-brands {
    padding: clamp(40px, 5vw, 70px) 0;
    text-align: center; background: #fff;
  }
  .tbo-our-brands h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; margin-bottom: 36px;
    font-family: 'Playfair Display', serif;
  }
  .brands-marquee-wrap { position: relative; width: 100%; overflow: hidden; }
  .brands-marquee-wrap::before,
  .brands-marquee-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none; }
  .brands-marquee-wrap::before { left: 0; background: linear-gradient(to right, #fff, transparent); }
  .brands-marquee-wrap::after  { right: 0; background: linear-gradient(to left, #fff, transparent); }
  .brands-marquee-track {
    display: flex; align-items: center; gap: 72px;
    width: max-content; animation: marquee-scroll 24s linear infinite; padding: 8px 0;
  }
  .brands-marquee-track:hover { animation-play-state: paused; }
  @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .brand-logo-img {
    height: clamp(36px, 5vw, 58px); width: auto; max-width: 160px;
    object-fit: contain; filter: grayscale(30%); opacity: 0.8;
    transition: filter 0.3s, opacity 0.3s, transform 0.3s;
  }
  .brand-logo-img:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.1); }

  /* ── VALUE ── */
  .tbo-value { padding: clamp(40px, 5vw, 72px) 6%; background: #f8f9fb; }
  .tbo-value h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 28px;
    font-family: 'Playfair Display', serif;
  }
  .value-tabs {
    display: flex; justify-content: center; gap: clamp(20px, 4vw, 64px);
    border-bottom: 2px solid #ddd; flex-wrap: wrap;
  }
  .value-tab {
    background: none; border: none; cursor: pointer;
    font-size: clamp(0.82rem, 1.3vw, 1rem);
    font-weight: 600; color: #777; padding: 10px 6px;
    position: relative; transition: color 0.2s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .value-tab.active { color: #ff6600; }
  .value-tab.active::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 3px; background: #ff6600; border-radius: 2px 2px 0 0;
  }
  .value-content-area {
    display: grid; grid-template-columns: auto 1fr;
    gap: clamp(24px, 4vw, 56px); align-items: flex-start;
    max-width: 960px; margin: 36px auto 0; width: 100%;
  }
  .value-blob-img {
    width: clamp(180px, 22vw, 280px); height: clamp(180px, 22vw, 280px);
    object-fit: cover; border-radius: 50% 40% 50% 40%; flex-shrink: 0;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  }
  .value-scroll-container { overflow: hidden; }
  .value-scroll-area {
    max-height: 300px; overflow-y: auto; display: flex; flex-direction: column;
    gap: 22px; padding-right: 12px;
  }
  .value-scroll-area::-webkit-scrollbar { width: 4px; }
  .value-scroll-area::-webkit-scrollbar-track { background: #eee; border-radius: 4px; }
  .value-scroll-area::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
  .value-point { display: flex; gap: 14px; align-items: flex-start; }
  .vp-dot { width: 10px; height: 10px; border-radius: 50%; background: #ff3300; margin-top: 6px; flex-shrink: 0; }
  .vp-title { font-weight: 700; font-size: clamp(0.88rem, 1.3vw, 1rem); color: #1a1a1a; }
  .vp-desc  { font-size: clamp(0.78rem, 1.1vw, 0.88rem); color: #666; line-height: 1.65; margin-top: 5px; }

  /* ── PARTNER BRANDS ── */
  .tbo-partner-brands { padding: clamp(40px, 5vw, 72px) 6%; text-align: center; }
  .tbo-partner-brands h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; margin-bottom: 32px;
    font-family: 'Playfair Display', serif;
  }
  .partner-row {
    display: flex; justify-content: center; align-items: center;
    gap: clamp(24px, 5vw, 72px); flex-wrap: wrap;
  }
  .hilton-box {
    border: 2px solid #1c1c1c; padding: 6px 18px;
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    font-weight: 800; letter-spacing: 2px; color: #1c1c1c; white-space: nowrap;
  }
  .expedia-wrap { display: flex; flex-direction: column; align-items: flex-start; }
  .expedia-top {
    font-size: clamp(1rem, 1.6vw, 1.2rem);
    font-weight: 700; color: #1c1c1c; display: flex; align-items: center; gap: 6px;
  }
  .expedia-sub { font-size: 0.62rem; color: #666; letter-spacing: 0.8px; margin-left: 22px; }

  /* ── GROWTH STORIES ── */
  .tbo-growth { padding: clamp(40px, 5vw, 72px) 0; text-align: center; }
  .tbo-growth h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; margin-bottom: 28px;
    font-family: 'Playfair Display', serif;
  }
  .slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .slider-viewport { overflow: hidden; }
  .slider-track { display: flex; gap: 20px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .growth-card {
    flex-shrink: 0; border-radius: 10px; overflow: hidden;
    box-shadow: 0 3px 16px rgba(0,0,0,0.14); transition: transform 0.2s, box-shadow 0.2s;
  }
  .growth-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.2); }
  .gc-video-wrap { position: relative; height: clamp(130px, 16vw, 176px); overflow: hidden; background: #111; }
  .gc-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gc-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .gc-overlay:hover { background: rgba(0,0,0,0.35); }
  .gc-play {
    width: 46px; height: 46px; border-radius: 50%;
    background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.28); transition: transform 0.15s;
  }
  .gc-overlay:hover .gc-play { transform: scale(1.12); }
  .gc-info { padding: 13px 15px; color: #fff; }
  .gc-info.orange-info { background: #cc4400; }
  .gc-info.tan-info    { background: #996622; }
  .gc-info.green-info  { background: #335533; }
  .gc-info.blue-info   { background: #1a3d88; }
  .gc-name { font-size: clamp(0.78rem, 1.2vw, 0.9rem); font-weight: 700; }
  .gc-org  { font-size: clamp(0.68rem, 1vw, 0.78rem); opacity: 0.88; margin-top: 3px; }

  .slider-arrow, .awards-arrow {
    background: #fff; border: 1.5px solid #ddd; border-radius: 50%;
    width: 42px; height: 42px; min-width: 42px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.12);
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    color: #444; margin: 0 10px; line-height: 1;
  }
  .slider-arrow:hover, .awards-arrow:hover { background: #ff6600; border-color: #ff6600; color: #fff; transform: scale(1.1); }
  .slider-arrow:disabled, .awards-arrow:disabled { opacity: 0.28; cursor: default; transform: none; }
  .growth-dots, .awards-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
  .gdot, .adot { width: 9px; height: 9px; border-radius: 50%; background: #ddd; cursor: pointer; border: none; padding: 0; transition: background 0.2s, transform 0.2s; }
  .gdot.active, .adot.active { background: #ff6600; transform: scale(1.3); }

  /* ── AWARDS ── */
  .tbo-awards { padding: clamp(40px, 5vw, 72px) 0; text-align: center; background: #f8f9fb; }
  .tbo-awards h2 {
    font-size: clamp(1.3rem, 2.8vw, 1.9rem);
    font-weight: 700; color: #1a1a1a; margin-bottom: 32px;
    font-family: 'Playfair Display', serif;
  }
  .awards-slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .awards-viewport { overflow: hidden; }
  .awards-track { display: flex; gap: 24px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .award-item { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .award-img {
    width: 100%; max-width: 110px; aspect-ratio: 1; object-fit: contain;
    transition: transform 0.25s; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.14));
  }
  .award-item:hover .award-img { transform: scale(1.12); }
  .award-label { font-size: clamp(0.6rem, 0.9vw, 0.72rem); color: #666; text-align: center; line-height: 1.5; }

  /* ── FOOTER ── */
  .tbo-footer { background: #003380; color: #ccc; padding: 22px 6% 16px; }
  .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-links { display: flex; gap: 0; flex-wrap: wrap; align-items: center; }
  .footer-links a { color: #ccc; font-size: clamp(0.65rem, 1vw, 0.78rem); text-decoration: none; padding: 3px 8px; transition: color 0.2s; white-space: nowrap; }
  .footer-links a:hover { color: #fff; }
  .footer-sep { color: #556; }
  .footer-social { display: flex; gap: 10px; }
  .footer-si { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; color: #fff; cursor: pointer; font-weight: 700; transition: background 0.2s; }
  .footer-si:hover { background: rgba(255,255,255,0.28); }
  .footer-copy { font-size: 0.68rem; color: #99a; text-align: center; margin-top: 12px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .side-circle-left, .side-circle-left2, .side-circle-right { display: none; }
    .tbo-hero { grid-template-columns: 1fr; }
    .hero-video-wrap { aspect-ratio: 16/9; max-height: 340px; }
    .value-content-area { grid-template-columns: 1fr; justify-items: center; }
    .value-blob-img { width: 200px; height: 200px; }
    .search-bar-container { order: 3; width: 100%; max-width: 100%; }
    .tbo-nav { flex-wrap: wrap; min-height: auto; padding: 12px 5%; }
    .cal-container { flex-direction: column; }
    .when-dropdown { width: min(95vw, 660px); }
    .where-dropdown { width: min(95vw, 420px); }
    .who-dropdown { width: min(95vw, 340px); }
  }
  @media (max-width: 640px) {
    .stats-row { gap: 20px; }
    .footer-inner { flex-direction: column; align-items: flex-start; }
    .value-tabs { gap: 12px; }
    .dropdown-panel { left: 10px; right: 10px; transform: none; }
    .when-dropdown, .where-dropdown, .who-dropdown { width: 100%; }
    .flex-stay-options { flex-direction: column; }
    .when-tabs { flex-wrap: wrap; }
  }
`;

/* ─── DATA ─── */
const destinations = [
  { city: "Dubai", country: "UAE", emoji: "🏙️", recent: true },
  { city: "Paris", country: "France", emoji: "🗼", recent: true },
  { city: "Bali", country: "Indonesia", emoji: "🌴" },
  { city: "New York", country: "USA", emoji: "🗽" },
  { city: "Tokyo", country: "Japan", emoji: "⛩️" },
  { city: "London", country: "UK", emoji: "🎡" },
  { city: "Bangkok", country: "Thailand", emoji: "🏯" },
  { city: "Singapore", country: "Singapore", emoji: "🦁" },
  { city: "Sydney", country: "Australia", emoji: "🦘" },
  { city: "Maldives", country: "Maldives", emoji: "🏝️" },
  { city: "Istanbul", country: "Turkey", emoji: "🕌" },
  { city: "Rome", country: "Italy", emoji: "🏛️" },
];

const MONTHS_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_EMOJIS = ["❄️","🌸","🌧️","🌷","☀️","🏖️","🌞","🌻","🍂","🎃","🍁","🎄"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

/* ─── HELPERS ─── */
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function formatDate(d) {
  if (!d) return "";
  return `${MONTHS_LIST[d.getMonth()]} ${d.getDate()}`;
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/* ─── CALENDAR COMPONENT ─── */
function Calendar({ year, month, startDate, endDate, hoverDate, onSelect, onHover, showPrev, showNext, onPrev, onNext }) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date(); today.setHours(0,0,0,0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  function getClasses(d) {
    if (!d) return "cal-day disabled";
    const dt = new Date(year, month, d);
    dt.setHours(0,0,0,0);
    const isPast = dt < today;
    let cls = "cal-day";
    if (isPast) return cls + " disabled";
    if (startDate && endDate) {
      const s = new Date(startDate); s.setHours(0,0,0,0);
      const e = new Date(endDate);   e.setHours(0,0,0,0);
      if (dt.getTime() === s.getTime()) cls += " range-start selected";
      else if (dt.getTime() === e.getTime()) cls += " range-end selected";
      else if (dt > s && dt < e) cls += " in-range";
    } else if (startDate) {
      const s = new Date(startDate); s.setHours(0,0,0,0);
      if (dt.getTime() === s.getTime()) cls += " selected";
      else if (hoverDate) {
        const h = new Date(hoverDate); h.setHours(0,0,0,0);
        if (dt > s && dt <= h) cls += " in-range";
        else if (dt < s && dt >= h) cls += " in-range";
      }
    }
    if (dt.toDateString() === today.toDateString()) cls += " today";
    return cls;
  }

  return (
    <div className="cal-month">
      <div className="cal-month-header">
        {showPrev ? <button className="cal-nav-btn" onClick={onPrev}>‹</button> : <div style={{width:30}} />}
        <span className="cal-month-name">{MONTHS_LIST[month]} {year}</span>
        {showNext ? <button className="cal-nav-btn" onClick={onNext}>›</button> : <div style={{width:30}} />}
      </div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={getClasses(d)}
            onClick={() => d && onSelect(new Date(year, month, d))}
            onMouseEnter={() => d && onHover && onHover(new Date(year, month, d))}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CIRCLE MONTH SELECTOR ─── */
function CircleSelector({ duration, onChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const R = 80, CX = 100, CY = 100;
  const min = 1, max = 12;
  const angle = ((duration - min) / (max - min)) * 300 - 150;
  const rad = (a) => (a * Math.PI) / 180;
  const thumbX = CX + R * Math.cos(rad(angle - 90));
  const thumbY = CY + R * Math.sin(rad(angle - 90));

  const arcStart = rad(-90 - 150);
  const arcEnd   = rad(angle - 90);
  const startX = CX + R * Math.cos(arcStart);
  const startY = CY + R * Math.sin(arcStart);
  const endX   = CX + R * Math.cos(arcEnd);
  const endY   = CY + R * Math.sin(arcEnd);
  const largeArc = (angle + 150) > 180 ? 1 : 0;

  function getAngleFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
  }

  function handleMove(e) {
    if (!dragging.current) return;
    let a = getAngleFromEvent(e);
    if (a < -150) a = -150;
    if (a > 150) a = 150;
    const val = Math.round(((a + 150) / 300) * (max - min) + min);
    onChange(Math.max(min, Math.min(max, val)));
  }

  return (
    <div className="circle-selector"
      onMouseMove={handleMove} onMouseUp={() => { dragging.current = false; }}
      onTouchMove={handleMove} onTouchEnd={() => { dragging.current = false; }}
    >
      <svg ref={svgRef} viewBox="0 0 200 200" className="circle-svg" width="200" height="200">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * R * 300 / 360} ${2 * Math.PI * R}`}
          strokeDashoffset={`${2 * Math.PI * R * (-30) / 360}`}
          style={{transform:`rotate(0deg)`,transformOrigin:'100px 100px'}}
        />
        {duration > min && (
          <path d={`M ${startX} ${startY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none" stroke="url(#grad)" strokeWidth="12" strokeLinecap="round" />
        )}
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff6600" />
            <stop offset="100%" stopColor="#ff3366" />
          </linearGradient>
        </defs>
        <circle cx={thumbX} cy={thumbY} r="14" fill="url(#grad)"
          style={{cursor:'grab',filter:'drop-shadow(0 2px 6px rgba(255,80,50,0.5))'}}
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
        />
        <text x={thumbX} y={thumbY} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="700">{duration}</text>
      </svg>
      <div className="circle-selector-label">
        <div className="circle-duration">{duration}</div>
        <div className="circle-unit">{duration === 1 ? "month" : "months"}</div>
      </div>
    </div>
  );
}

/* ─── VALUE & STORIES DATA ─── */
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
  { name: "Dinesh Poojary",       org: "Travel Agent",                           info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/Dinesh-Poojary.mp4" },
  { name: "Gautam Vij",           org: "KBS Tours and Travels, India",           info: "blue-info",   video: "https://www.tbo.com/img/testimonials/agent/Gautam-Vij.mp4" },
  { name: "Sebastian Sierra",     org: "Travel Agent",                           info: "green-info",  video: "https://www.tbo.com/img/testimonials/agent/Sebastian-Sierra.mp4" },
  { name: "Stuart Lee",           org: "Travel Agent",                           info: "tan-info",    video: "https://www.tbo.com/img/testimonials/agent/Stuart-Lee.mp4" },
  { name: "UAE Agent",            org: "UAE",                                    info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/UAEAgenta.mp4" },
  { name: "Mr. Kuljit Singh Hayer", org: "Universal Travels, India",            info: "green-info",  video: "https://www.tbo.com/img/testimonials/agent/KuljitSingh.mp4" },
  { name: "Fortun Plumley",       org: "Travel Agent",                           info: "blue-info",   video: "https://www.tbo.com/img/testimonials/agent/Fortun-PlumLey.mp4" },
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
  { src: "https://www.tbo.com/img/brands/kizanlogo-min.png",     alt: "Kizan" },
  { src: "https://www.tbo.com/img/brands/tboacademy-min.png",    alt: "TBO Academy" },
  { src: "https://www.tbo.com/img/brands/classic-vacations.png", alt: "Classic Vacations" },
];

const footerLinks = ["Home","About Us","Careers","Privacy Policy","Terms and Conditions","Sanctions Policy","Investors","Media","Contact Us"];

function useSliderSizes() {
  const [sizes, setSizes] = useState({ cardW: 220, visibleCards: 4, awardW: 130, visibleAwards: 5 });
  useEffect(() => {
    function calc() {
      const W = window.innerWidth;
      let visibleCards, cardW, visibleAwards, awardW;
      if (W < 480)      { visibleCards = 1; cardW = Math.floor(W * 0.86);                 visibleAwards = 2; awardW = Math.floor((W * 0.86 - 24) / 2); }
      else if (W < 640) { visibleCards = 2; cardW = Math.floor((W * 0.86 - 20) / 2);     visibleAwards = 3; awardW = Math.floor((W * 0.86 - 48) / 3); }
      else if (W < 900) { visibleCards = 3; cardW = Math.floor((W * 0.86 - 40) / 3);     visibleAwards = 4; awardW = Math.floor((W * 0.86 - 72) / 4); }
      else              { visibleCards = 4; cardW = Math.min(240, Math.floor((W * 0.78 - 60) / 4)); visibleAwards = 5; awardW = Math.min(140, Math.floor((W * 0.78 - 96) / 5)); }
      setSizes({ cardW, visibleCards, awardW, visibleAwards });
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return sizes;
}

/* ─── MAIN COMPONENT ─── */
export default function TBOHomepage() {
  /* Search state */
  const [openPanel, setOpenPanel] = useState(null);
  const [destQuery, setDestQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [whenTab, setWhenTab] = useState("Dates");
  const [calMonth, setCalMonth] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [flexDays, setFlexDays] = useState("Exact");
  const [monthsDuration, setMonthsDuration] = useState(3);
  const [stayType, setStayType] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });

  /* Page state */
  const [activeTab, setActiveTab]   = useState("Travel buyers");
  const [playingIdx, setPlayingIdx] = useState(null);
  const [slideIdx, setSlideIdx]     = useState(0);
  const [isPaused, setIsPaused]     = useState(false);
  const [awardIdx, setAwardIdx]     = useState(0);
  const [awardPaused, setAwardPaused] = useState(false);

  const searchRef = useRef(null);
  const videoRefs = useState(() => stories.map(() => ({ current: null })))[0];
  const { cardW, visibleCards, awardW, visibleAwards } = useSliderSizes();
  const GAP = 20, AWARD_GAP = 24;
  const maxSlide = Math.max(0, stories.length - visibleCards);
  const maxAward = Math.max(0, awards.length - visibleAwards);

  useEffect(() => {
    function handle(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpenPanel(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (isPaused || playingIdx !== null) return;
    const t = setInterval(() => setSlideIdx(p => p >= maxSlide ? 0 : p + 1), 3000);
    return () => clearInterval(t);
  }, [isPaused, playingIdx, maxSlide]);

  useEffect(() => {
    if (awardPaused) return;
    const t = setInterval(() => setAwardIdx(p => p >= maxAward ? 0 : p + 1), 2500);
    return () => clearInterval(t);
  }, [awardPaused, maxAward]);

  useEffect(() => { if (slideIdx > maxSlide) setSlideIdx(maxSlide); }, [maxSlide]);
  useEffect(() => { if (awardIdx > maxAward) setAwardIdx(maxAward); }, [maxAward]);

  const handlePlay = (i) => {
    if (playingIdx !== null && playingIdx !== i && videoRefs[playingIdx].current)
      videoRefs[playingIdx].current.pause();
    setPlayingIdx(i);
  };

  const filtered = destQuery
    ? destinations.filter(d => d.city.toLowerCase().includes(destQuery.toLowerCase()) || d.country.toLowerCase().includes(destQuery.toLowerCase()))
    : destinations;

  const recents = filtered.filter(d => d.recent);
  const others  = filtered.filter(d => !d.recent);

  function handleDateSelect(date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date); setEndDate(null); setHoverDate(null);
    } else {
      if (date < startDate) { setStartDate(date); setEndDate(null); }
      else { setEndDate(date); }
    }
  }

  function whenValue() {
    if (whenTab === "Dates" && startDate) {
      if (endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
      return formatDate(startDate);
    }
    if (whenTab === "Months") {
      const now = new Date();
      const endM = addMonths(now, monthsDuration);
      return `${formatDate(now)} – ${formatDate(endM)}`;
    }
    if (whenTab === "Flexible" && stayType && selectedMonths.length > 0) {
      return `${stayType} · ${selectedMonths.length} month${selectedMonths.length > 1 ? "s" : ""}`;
    }
    return null;
  }

  const totalGuests = guests.adults + guests.children;
  function whoValue() {
    if (totalGuests === 0) return null;
    let s = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
    if (guests.infants) s += `, ${guests.infants} infant${guests.infants !== 1 ? "s" : ""}`;
    if (guests.pets) s += `, ${guests.pets} pet${guests.pets !== 1 ? "s" : ""}`;
    return s;
  }

  const nextM = { y: calMonth.m === 11 ? calMonth.y + 1 : calMonth.y, m: (calMonth.m + 1) % 12 };

  const futureMonths = Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i + 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: `${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`, emoji: MONTH_EMOJIS[d.getMonth()] };
  });

  function toggleMonth(key) {
    setSelectedMonths(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  const svWidth = visibleCards * cardW + (visibleCards - 1) * GAP;
  const avWidth = visibleAwards * awardW + (visibleAwards - 1) * AWARD_GAP;

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

          {/* ── AIRBNB-STYLE SEARCH BAR ── */}
          <div className="search-bar-container" ref={searchRef}>
            {openPanel && <div className="dropdown-overlay" onClick={() => setOpenPanel(null)} />}

            <div className={`search-pill ${openPanel ? "active" : ""}`}>
              {/* WHERE */}
              <div
                className={`pill-section ${openPanel === "where" ? "open" : ""}`}
                style={{ maxWidth: 180 }}
                onClick={() => setOpenPanel(openPanel === "where" ? null : "where")}
                role="button" aria-label="Where" aria-expanded={openPanel === "where"}
              >
                <span className="pill-label">Where</span>
                <span className={`pill-value ${!destination ? "placeholder" : ""}`}>
                  {destination || "Search destinations"}
                </span>
              </div>

              {/* WHEN */}
              <div
                className={`pill-section ${openPanel === "when" ? "open" : ""}`}
                style={{ maxWidth: 180 }}
                onClick={() => setOpenPanel(openPanel === "when" ? null : "when")}
                role="button" aria-label="When" aria-expanded={openPanel === "when"}
              >
                <span className="pill-label">When</span>
                <span className={`pill-value ${!whenValue() ? "placeholder" : ""}`}>
                  {whenValue() || "Add dates"}
                </span>
              </div>

              {/* WHO */}
              <div
                className={`pill-section ${openPanel === "who" ? "open" : ""}`}
                style={{ maxWidth: 160 }}
                onClick={() => setOpenPanel(openPanel === "who" ? null : "who")}
                role="button" aria-label="Who" aria-expanded={openPanel === "who"}
              >
                <span className="pill-label">Who</span>
                <span className={`pill-value ${!whoValue() ? "placeholder" : ""}`}>
                  {whoValue() || "Add guests"}
                </span>
              </div>

              {/* SEARCH BUTTON */}
              <button className="pill-search-btn" aria-label="Search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>

              {/* ── WHERE DROPDOWN ── */}
              {openPanel === "where" && (
                <div className="dropdown-panel where-dropdown" style={{ left: 0, transform: "none" }}>
                  <input
                    className="where-search-input"
                    placeholder="Search destinations"
                    value={destQuery}
                    onChange={e => setDestQuery(e.target.value)}
                    autoFocus
                    aria-label="Type a destination"
                  />
                  <div className="dest-list">
                    {!destQuery && recents.length > 0 && (
                      <>
                        <div className="dest-section-label">Recent searches</div>
                        {recents.map(d => (
                          <div key={d.city} className="dest-item" onClick={() => { setDestination(d.city); setOpenPanel(null); setDestQuery(""); }}>
                            <div className="dest-thumb">{d.emoji}</div>
                            <div className="dest-info">
                              <div className="dest-city">{d.city}</div>
                              <div className="dest-country">{d.country}</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="dest-section-label">{destQuery ? "Results" : "Suggested destinations"}</div>
                    {(destQuery ? filtered : others).map(d => (
                      <div key={d.city} className="dest-item" onClick={() => { setDestination(d.city); setOpenPanel(null); setDestQuery(""); }}>
                        <div className="dest-thumb">{d.emoji}</div>
                        <div className="dest-info">
                          <div className="dest-city">{d.city}</div>
                          <div className="dest-country">{d.country}</div>
                        </div>
                      </div>
                    ))}
                    {filtered.length === 0 && <div style={{padding:"12px",color:"#aaa",fontSize:"0.82rem"}}>No destinations found</div>}
                  </div>
                </div>
              )}

              {/* ── WHEN DROPDOWN ── */}
              {openPanel === "when" && (
                <div className="dropdown-panel when-dropdown" style={{ left: "50%", transform: "translateX(-50%)" }}>
                  <div className="when-tabs">
                    {["Dates", "Months", "Flexible"].map(t => (
                      <button key={t} className={`when-tab ${whenTab === t ? "active" : ""}`} onClick={() => setWhenTab(t)}>{t}</button>
                    ))}
                  </div>

                  <div className="when-body">
                    {whenTab === "Dates" && (
                      <>
                        <div className="cal-container">
                          <Calendar year={calMonth.y} month={calMonth.m}
                            startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate ? setHoverDate : null}
                            showPrev onPrev={() => {
                              if (calMonth.m === 0) setCalMonth({y: calMonth.y-1, m: 11});
                              else setCalMonth({y: calMonth.y, m: calMonth.m-1});
                            }}
                          />
                          <Calendar year={nextM.y} month={nextM.m}
                            startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate ? setHoverDate : null}
                            showNext onNext={() => {
                              if (calMonth.m === 11) setCalMonth({y: calMonth.y+1, m: 0});
                              else setCalMonth({y: calMonth.y, m: calMonth.m+1});
                            }}
                          />
                        </div>
                        <div className="flex-options">
                          {["Exact dates", "±1 day", "±2 days", "±3 days", "±7 days", "±14 days"].map(f => (
                            <button key={f} className={`flex-chip ${flexDays === f ? "active" : ""}`} onClick={() => setFlexDays(f)}>{f}</button>
                          ))}
                        </div>
                      </>
                    )}

                    {whenTab === "Months" && (
                      <div className="months-tab-body">
                        <CircleSelector duration={monthsDuration} onChange={setMonthsDuration} />
                        <div className="months-range-display">
                          <div className="months-range-text">
                            {formatDate(new Date())} – {formatDate(addMonths(new Date(), monthsDuration))}
                          </div>
                          <div className="months-range-sub">{monthsDuration} month{monthsDuration !== 1 ? "s" : ""} trip</div>
                          <div className="months-hint">Drag the circle handle to adjust</div>
                        </div>
                      </div>
                    )}

                    {whenTab === "Flexible" && (
                      <>
                        <div className="flex-stay-label">How long would you like to stay?</div>
                        <div className="flex-stay-options">
                          {[{name:"Weekend",icon:"🌙",desc:"2–3 nights"},{name:"Week",icon:"☀️",desc:"5–7 nights"},{name:"Month",icon:"📅",desc:"28–31 nights"}].map(s => (
                            <button key={s.name} className={`flex-stay-btn ${stayType === s.name ? "active" : ""}`} onClick={() => setStayType(s.name)}>
                              <span className="stay-icon">{s.icon}</span>
                              <span className="stay-name">{s.name}</span>
                              <span className="stay-desc">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                        <div className="when-go-label">When do you want to go?</div>
                        <div className="month-cards-scroll">
                          {futureMonths.map(m => {
                            const key = `${m.year}-${m.month}`;
                            return (
                              <div key={key} className={`month-card ${selectedMonths.includes(key) ? "active" : ""}`}
                                onClick={() => toggleMonth(key)}>
                                <div className="mc-emoji">{m.emoji}</div>
                                <div className="mc-month">{MONTHS_LIST[m.month]}</div>
                                <div className="mc-year">{m.year}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="dropdown-footer">
                    <button className="btn-clear" onClick={() => { setStartDate(null); setEndDate(null); setHoverDate(null); setSelectedMonths([]); setStayType(null); }}>Clear</button>
                    <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                  </div>
                </div>
              )}

              {/* ── WHO DROPDOWN ── */}
              {openPanel === "who" && (
                <div className="dropdown-panel who-dropdown" style={{ right: 0, left: "auto", transform: "none" }}>
                  <div style={{padding:"0 0 4px"}}>
                    {[
                      { key: "adults",   label: "Adults",   sub: "Ages 13+" },
                      { key: "children", label: "Children", sub: "Ages 2–12" },
                      { key: "infants",  label: "Infants",  sub: "Under 2" },
                      { key: "pets",     label: "Pets",     sub: "Assistance animals" },
                    ].map(g => (
                      <div className="guest-row" key={g.key}>
                        <div className="guest-info">
                          <div className="guest-type">{g.label}</div>
                          <div className="guest-age">{g.sub}</div>
                        </div>
                        <div className="guest-counter">
                          <button className="guest-btn" disabled={guests[g.key] === 0 || (g.key === "adults" && guests[g.key] <= 1)}
                            onClick={() => setGuests(prev => ({...prev, [g.key]: Math.max(g.key === "adults" ? 1 : 0, prev[g.key] - 1)}))}
                            aria-label={`Remove ${g.label}`}>−</button>
                          <span className="guest-count">{guests[g.key]}</span>
                          <button className="guest-btn" disabled={guests[g.key] >= 16}
                            onClick={() => setGuests(prev => ({...prev, [g.key]: prev[g.key] + 1}))}
                            aria-label={`Add ${g.label}`}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button className="btn-clear" onClick={() => setGuests({ adults: 1, children: 0, infants: 0, pets: 0 })}>Clear</button>
                    <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tbo-nav-right">
            <span className="already-reg">Already Registered?</span>
            <button className="btn-book">Book Now</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="tbo-hero">
          <div>
            <h1 className="hero-title">Simplifying Travel<span className="red-dot">.</span><br />Enabling Growth</h1>
            <p className="hero-body">We are one of the leading global travel distribution platforms, simplifying the travel business for both suppliers and buyers. Our suppliers include hotels, airlines, cruises, car rentals, transfers, and rail services. Our buyers consist of retail and API buyers such as travel agencies, independent travel advisors, and enterprise buyers including tour operators, travel management companies, online travel companies, super-apps, and loyalty apps.</p>
            <p className="hero-body" style={{marginTop:12}}>Our platform enables seamless transactions, connecting over 159,000 buyers with over 1 million suppliers across 100+ countries.</p>
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

        {/* ── NUMBERS ── */}
        <section className="tbo-numbers">
          <h2>TBO in numbers</h2>
          <div className="stats-row">
            {[{num:"159K+",label:"Travel buyers"},{num:"1M+",label:"Hotels worldwide"},{num:"100+",label:"Countries"},{num:"55+",label:"Supported currencies"}].map(s => (
              <div className="stat-item" key={s.label}>
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
            <div className="brands-marquee-track">
              {[...brandLogos, ...brandLogos].map((b, i) => (
                <img key={i} src={b.src} alt={b.alt} className="brand-logo-img" />
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUE ── */}
        <section className="tbo-value">
          <h2>How do we add value to..</h2>
          <div className="value-tabs">
            {Object.keys(valueContent).map(tab => (
              <button key={tab} className={`value-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
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

        {/* ── PARTNER BRANDS ── */}
        <section className="tbo-partner-brands">
          <h2>Brands we work with</h2>
          <div className="partner-row">
            <div className="expedia-wrap">
              <div className="expedia-top"><span style={{color:"#e05500"}}>⬡</span> expedia</div>
              <div className="expedia-sub">group</div>
            </div>
            <div className="hilton-box">Hilton</div>
            <div style={{fontWeight:700,fontSize:"clamp(0.95rem,1.5vw,1.15rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>Derby</span>Soft</div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:"clamp(0.95rem,1.5vw,1.1rem)"}}><span>●</span> Roibos</div>
            <div style={{fontSize:"clamp(0.95rem,1.5vw,1.1rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>ibs</span><span style={{fontWeight:700}}>software</span></div>
          </div>
        </section>

        {/* ── GROWTH STORIES ── */}
        <section className="tbo-growth">
          <h2>Growth Stories</h2>
          <div className="slider-wrapper" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <button className="slider-arrow" onClick={() => setSlideIdx(Math.max(0, slideIdx-1))} disabled={slideIdx === 0}>‹</button>
            <div className="slider-viewport" style={{width: svWidth}}>
              <div className="slider-track" style={{transform:`translateX(-${slideIdx*(cardW+GAP)}px)`}}>
                {stories.map((s, i) => (
                  <div className="growth-card" style={{width: cardW}} key={i}>
                    <div className="gc-video-wrap">
                      <video
                        ref={el => { videoRefs[i].current = el; }}
                        src={s.video} preload="metadata" playsInline
                        controls={playingIdx === i}
                        style={{width:"100%",height:"100%",objectFit:"cover",display:"block",background:"#111"}}
                        onPlay={() => handlePlay(i)}
                        onPause={() => { if (playingIdx === i) setPlayingIdx(null); }}
                      />
                      {playingIdx !== i && (
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
            <button className="slider-arrow" onClick={() => setSlideIdx(Math.min(maxSlide, slideIdx+1))} disabled={slideIdx >= maxSlide}>›</button>
          </div>
          <div className="growth-dots">
            {Array.from({length: maxSlide+1}).map((_, i) => (
              <button key={i} className={`gdot ${slideIdx === i ? "active" : ""}`} onClick={() => setSlideIdx(i)} />
            ))}
          </div>
        </section>

        {/* ── AWARDS ── */}
        <section className="tbo-awards">
          <h2>Awards</h2>
          <div className="awards-slider-wrapper" onMouseEnter={() => setAwardPaused(true)} onMouseLeave={() => setAwardPaused(false)}>
            <button className="awards-arrow" onClick={() => setAwardIdx(Math.max(0, awardIdx-1))} disabled={awardIdx === 0}>‹</button>
            <div className="awards-viewport" style={{width: avWidth}}>
              <div className="awards-track" style={{transform:`translateX(-${awardIdx*(awardW+AWARD_GAP)}px)`}}>
                {awards.map(a => (
                  <div className="award-item" style={{width: awardW}} key={a.label}>
                    <img src={a.img} alt={a.label} className="award-img" />
                    <div className="award-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="awards-arrow" onClick={() => setAwardIdx(Math.min(maxAward, awardIdx+1))} disabled={awardIdx >= maxAward}>›</button>
          </div>
          <div className="awards-dots">
            {Array.from({length: maxAward+1}).map((_, i) => (
              <button key={i} className={`adot ${awardIdx === i ? "active" : ""}`} onClick={() => setAwardIdx(i)} />
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="tbo-footer">
          <div className="footer-inner">
            <div className="footer-links">
              {footerLinks.map((l, i) => (
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