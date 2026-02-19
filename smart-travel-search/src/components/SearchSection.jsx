import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; overflow-x: hidden; }
  .tbo-wrap { font-family: 'DM Sans', sans-serif; color: #333; background: #fff; width: 100%; overflow-x: hidden; }

  /* ── NAVBAR ── */
  .tbo-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 3%;
    border-bottom: 1px solid #ebebeb; background: #fff;
    position: sticky; top: 0; z-index: 500;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    gap: 10px; min-height: 68px;
  }
  .tbo-logo-wrap { display: flex; flex-direction: column; line-height: 1; flex-shrink: 0; }
  .tbo-logo-text { display: flex; align-items: baseline; }
  .logo-tbo  { font-size: clamp(1.3rem,2.5vw,1.9rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; font-family: 'Playfair Display', serif; }
  .logo-dot  { color: #ff6600; font-size: clamp(1.3rem,2.5vw,1.9rem); font-weight: 800; }
  .logo-com  { font-size: clamp(1.3rem,2.5vw,1.9rem); font-weight: 800; color: #0059b3; letter-spacing: -1px; font-family: 'Playfair Display', serif; }
  .logo-sub  { font-size: 0.46rem; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .tbo-nav-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .already-reg { font-size: 0.66rem; color: #888; white-space: nowrap; }
  .btn-book { background: #ff6600; color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'DM Sans',sans-serif; transition: background 0.2s, transform 0.15s; }
  .btn-book:hover { background: #e05500; transform: scale(1.03); }

  /* ── SEARCH CONTAINER ── */
  .search-bar-container { flex: 1; max-width: 820px; min-width: 0; position: relative; }

  /* ── EXPANDED TEXT SEARCH ── */
  .expanded-search-bar {
    display: flex; align-items: center;
    border: 2px solid #ff6600; border-radius: 50px; background: #fff;
    box-shadow: 0 4px 24px rgba(255,102,0,0.18);
    overflow: hidden;
    animation: expandIn 0.28s cubic-bezier(0.34,1.3,0.64,1) both;
    padding: 0 6px 0 18px; height: 52px;
  }
  @keyframes expandIn {
    from { opacity: 0; transform: scaleX(0.7); }
    to   { opacity: 1; transform: scaleX(1); }
  }
  .expanded-search-input {
    flex: 1; border: none; outline: none; font-size: 0.92rem;
    font-family: 'DM Sans',sans-serif; color: #111; background: transparent; padding: 0 10px 0 0;
  }
  .expanded-search-input::placeholder { color: #aaa; }
  .exp-icon-btn {
    width: 36px; height: 36px; border-radius: 50%; border: none;
    background: #f5f5f5; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s; flex-shrink: 0; margin: 0 2px; color: #666; position: relative;
  }
  .exp-icon-btn:hover { background: #ffe8d6; color: #ff6600; }
  .exp-icon-btn svg { width: 17px; height: 17px; }
  .exp-close-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none;
    background: #f0f0f0; cursor: pointer; display: flex; align-items: center; justify-content: center;
    margin-left: 4px; color: #666; font-size: 1rem; flex-shrink: 0; transition: background 0.15s;
  }
  .exp-close-btn:hover { background: #ddd; }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .voice-active .exp-icon-btn { background: #ffece6 !important; color: #ff3300 !important; }
  .voice-active .exp-icon-btn::before {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    border: 2px solid #ff3300; animation: pulse-ring 1s ease-out infinite;
  }

  /* ── FILTER PILL ── */
  .search-pill {
    display: flex; align-items: stretch;
    border: 1.5px solid #e4e4e4; border-radius: 50px; background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    overflow: visible; cursor: pointer;
    transition: box-shadow 0.2s; position: relative;
  }
  .search-pill:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.13); }
  .search-pill.active { box-shadow: 0 6px 28px rgba(0,0,0,0.16); border-color: transparent; }

  .pill-section {
    flex: 1; padding: 0 12px;
    display: flex; flex-direction: column; justify-content: center;
    min-width: 0; cursor: pointer; border-radius: 50px;
    transition: background 0.15s; position: relative;
  }
  .pill-section::after {
    content: ''; position: absolute; right: 0; top: 20%; bottom: 20%;
    width: 1px; background: #e4e4e4;
  }
  .pill-section:last-of-type::after { display: none; }
  .pill-section:hover { background: #f5f5f5; }
  .pill-section.open { background: #fff; border-radius: 50px; box-shadow: 0 0 0 2px #ff6600; z-index: 2; }

  .pill-label { font-size: 0.58rem; font-weight: 700; color: #111; letter-spacing: 0.3px; text-transform: uppercase; white-space: nowrap; }
  .pill-value { font-size: 0.75rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top: 2px; }
  .pill-value.placeholder { color: #aaa; }

  /* Search icon btn — opens expanded search */
  .pill-search-icon-btn {
    background: linear-gradient(135deg, #ff6600, #ff3366);
    border: none; cursor: pointer;
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 5px 3px 5px 3px; flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 3px 12px rgba(255,80,50,0.4);
  }
  .pill-search-icon-btn:hover { transform: scale(1.1); box-shadow: 0 5px 18px rgba(255,80,50,0.55); }
  .pill-search-icon-btn svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; }

  /* Redirect arrow btn */
  .pill-redirect-btn {
    background: #ff6600; border: none; cursor: pointer;
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 5px 6px 5px 2px; flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
    box-shadow: 0 3px 12px rgba(255,102,0,0.45);
  }
  .pill-redirect-btn:hover { transform: scale(1.12); box-shadow: 0 6px 20px rgba(255,102,0,0.6); background: #e05500; }
  .pill-redirect-btn svg { width: 17px; height: 17px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

  /* ── DROPDOWNS ── */
  .dropdown-overlay { position: fixed; inset: 0; z-index: 400; }
  .dropdown-panel {
    position: absolute; top: calc(100% + 12px);
    background: #fff; border-radius: 24px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    z-index: 600;
    animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
    overflow: hidden;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* TYPE */
  .type-dropdown { width: 330px; padding: 18px; }
  .type-dropdown-title { font-size: 0.76rem; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
  .type-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
  .type-card {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 12px 6px; border-radius: 14px; border: 1.5px solid #e8e8e8;
    cursor: pointer; transition: all 0.18s; background: #fff;
  }
  .type-card:hover { border-color: #ffb380; background: #fff8f4; }
  .type-card.active { border-color: #ff6600; background: #fff3eb; box-shadow: 0 0 0 2px rgba(255,102,0,0.12); }
  .type-card-icon { font-size: 1.5rem; line-height: 1; }
  .type-card-label { font-size: 0.66rem; font-weight: 600; color: #333; text-align: center; }
  .type-card.active .type-card-label { color: #ff6600; }

  /* WHERE */
  .where-dropdown { width: 370px; padding: 16px; }
  .where-search-input {
    width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0;
    border-radius: 14px; font-size: 0.86rem; font-family: 'DM Sans',sans-serif;
    outline: none; background: #fafafa; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .where-search-input:focus { border-color: #ff6600; box-shadow: 0 0 0 3px rgba(255,102,0,0.1); background: #fff; }
  .dest-list { margin-top: 8px; display: flex; flex-direction: column; gap: 2px; }
  .dest-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 12px; cursor: pointer; transition: background 0.15s; }
  .dest-item:hover { background: #fff5f0; }
  .dest-thumb { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; background: linear-gradient(135deg,#f0f0f0,#e0e0e0); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; }
  .dest-city { font-size: 0.82rem; font-weight: 600; color: #111; }
  .dest-country { font-size: 0.7rem; color: #888; margin-top: 1px; }
  .dest-section-label { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #aaa; padding: 7px 10px 3px; }

  /* WHEN */
  .when-dropdown { width: 600px; }
  .when-tabs { display: flex; border-bottom: 1px solid #f0f0f0; padding: 14px 14px 0; gap: 4px; }
  .when-tab { padding: 7px 14px; border-radius: 24px; border: none; background: none; cursor: pointer; font-size: 0.78rem; font-weight: 500; color: #777; font-family: 'DM Sans',sans-serif; transition: all 0.2s; }
  .when-tab.active { background: #111; color: #fff; }
  .when-tab:hover:not(.active) { background: #f5f5f5; color: #333; }
  .when-body { padding: 16px; }
  .cal-container { display: flex; gap: 18px; }
  .cal-month { flex: 1; }
  .cal-month-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .cal-month-name { font-size: 0.84rem; font-weight: 700; color: #111; }
  .cal-nav-btn { background: none; border: 1.5px solid #e4e4e4; border-radius: 50%; width: 27px; height: 27px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; transition: all 0.15s; }
  .cal-nav-btn:hover { background: #f5f5f5; }
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
  .cal-dow { font-size: 0.6rem; font-weight: 700; text-align: center; color: #aaa; padding: 3px; text-transform: uppercase; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; font-size: 0.74rem; font-weight: 500; transition: all 0.15s; position: relative; }
  .cal-day:hover:not(.disabled):not(.selected) { background: #f5f5f5; }
  .cal-day.disabled { color: #ddd; cursor: default; }
  .cal-day.in-range { background: #fff0eb; border-radius: 0; color: #cc4400; }
  .cal-day.range-start { background: #ff6600 !important; color: #fff !important; border-radius: 50% 0 0 50%; }
  .cal-day.range-end { background: #ff6600 !important; color: #fff !important; border-radius: 0 50% 50% 0; }
  .cal-day.selected { background: #ff6600 !important; color: #fff !important; border-radius: 50% !important; }
  .cal-day.today::after { content:''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #ff6600; border-radius: 50%; }
  .cal-day.today.selected::after { background: rgba(255,255,255,0.7); }
  .flex-options { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
  .flex-chip { padding: 5px 11px; border-radius: 20px; border: 1.5px solid #e4e4e4; background: #fff; cursor: pointer; font-size: 0.7rem; font-weight: 500; font-family: 'DM Sans',sans-serif; transition: all 0.15s; color: #555; }
  .flex-chip.active { border-color: #111; background: #111; color: #fff; }
  .flex-chip:hover:not(.active) { border-color: #999; color: #333; }
  .months-tab-body { display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .circle-selector { position: relative; width: 185px; height: 185px; }
  .circle-svg { overflow: visible; }
  .circle-selector-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
  .circle-duration { font-size: 1.85rem; font-weight: 700; color: #111; line-height: 1; }
  .circle-unit { font-size: 0.68rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .months-range-display { text-align: center; }
  .months-range-text { font-size: 0.98rem; font-weight: 600; color: #111; }
  .months-range-sub { font-size: 0.74rem; color: #888; margin-top: 4px; }
  .months-hint { font-size: 0.7rem; color: #aaa; margin-top: 3px; }
  .flex-stay-label { font-size: 0.84rem; font-weight: 700; color: #111; margin-bottom: 9px; }
  .flex-stay-options { display: flex; gap: 8px; margin-bottom: 18px; }
  .flex-stay-btn { flex: 1; padding: 10px 5px; border-radius: 14px; border: 1.5px solid #e4e4e4; background: #fff; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.18s; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .flex-stay-btn .stay-icon { font-size: 1.2rem; }
  .flex-stay-btn .stay-name { font-size: 0.76rem; font-weight: 600; color: #333; }
  .flex-stay-btn .stay-desc { font-size: 0.61rem; color: #999; }
  .flex-stay-btn.active { border-color: #111; background: #f8f8f8; }
  .flex-stay-btn:hover:not(.active) { border-color: #bbb; }
  .when-go-label { font-size: 0.84rem; font-weight: 700; color: #111; margin-bottom: 9px; }
  .month-cards-scroll { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; }
  .month-cards-scroll::-webkit-scrollbar { height: 3px; }
  .month-cards-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  .month-card { flex-shrink: 0; width: 78px; border-radius: 14px; border: 1.5px solid #e4e4e4; padding: 9px 5px; text-align: center; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans',sans-serif; }
  .month-card .mc-emoji { font-size: 1.25rem; }
  .month-card .mc-month { font-size: 0.74rem; font-weight: 600; color: #333; margin-top: 3px; }
  .month-card .mc-year { font-size: 0.6rem; color: #aaa; }
  .month-card.active { border-color: #111; background: #f8f8f8; }
  .month-card:hover:not(.active) { border-color: #bbb; }

  /* WHO */
  .who-dropdown { width: 310px; padding: 16px; }
  .guest-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f5f5f5; }
  .guest-row:last-child { border-bottom: none; }
  .guest-type { font-size: 0.84rem; font-weight: 600; color: #111; }
  .guest-age  { font-size: 0.68rem; color: #aaa; margin-top: 1px; }
  .guest-counter { display: flex; align-items: center; gap: 9px; }
  .guest-btn { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #e0e0e0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; color: #555; transition: all 0.15s; line-height: 1; }
  .guest-btn:hover:not(:disabled) { border-color: #888; color: #111; background: #f8f8f8; }
  .guest-btn:disabled { opacity: 0.3; cursor: default; }
  .guest-count { font-size: 0.9rem; font-weight: 600; color: #111; min-width: 18px; text-align: center; }

  /* BUDGET */
  .budget-dropdown { width: 310px; padding: 16px; }
  .budget-title { font-size: 0.74rem; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
  .budget-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
  .budget-option { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 12px; border: 1.5px solid #e8e8e8; cursor: pointer; transition: all 0.15s; background: #fff; }
  .budget-option:hover { border-color: #ffb380; background: #fff8f4; }
  .budget-option.active { border-color: #ff6600; background: #fff3eb; }
  .budget-option-icon { font-size: 1.15rem; flex-shrink: 0; }
  .budget-option-info { flex: 1; }
  .budget-option-label { font-size: 0.8rem; font-weight: 600; color: #111; }
  .budget-option-range { font-size: 0.66rem; color: #888; margin-top: 1px; }
  .budget-option.active .budget-option-label { color: #ff6600; }
  .budget-check { width: 17px; height: 17px; border-radius: 50%; background: #ff6600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .budget-check svg { width: 9px; height: 9px; stroke: #fff; fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .budget-range-label { font-size: 0.74rem; font-weight: 600; color: #111; margin-bottom: 9px; }
  .budget-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px; border-radius: 4px; outline: none; cursor: pointer;
    background: linear-gradient(to right, #ff6600 0%, #ff6600 var(--val,50%), #e4e4e4 var(--val,50%), #e4e4e4 100%);
  }
  .budget-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
    background: #fff; border: 2.5px solid #ff6600;
    box-shadow: 0 2px 8px rgba(255,102,0,0.3); cursor: grab; transition: transform 0.15s;
  }
  .budget-slider::-webkit-slider-thumb:active { transform: scale(1.2); cursor: grabbing; }
  .budget-range-values { display: flex; justify-content: space-between; margin-top: 7px; font-size: 0.7rem; color: #888; }

  /* DROPDOWN FOOTER */
  .dropdown-footer { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-top: 1px solid #f0f0f0; }
  .btn-clear { background: none; border: none; font-size: 0.78rem; font-weight: 600; text-decoration: underline; cursor: pointer; color: #555; font-family: 'DM Sans',sans-serif; }
  .btn-apply { background: linear-gradient(135deg,#ff6600,#ff3366); color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; box-shadow: 0 4px 14px rgba(255,80,50,0.4); transition: transform 0.15s, box-shadow 0.2s; }
  .btn-apply:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(255,80,50,0.5); }

  /* SIDE CIRCLES */
  .side-circle-left  { position: fixed; left: -22px; top: 50%; transform: translateY(-50%); width: 44px; height: 120px; background: #003399; border-radius: 0 60px 60px 0; z-index: 10; }
  .side-circle-right { position: fixed; right: -22px; top: 40%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #ff6600; z-index: 10; }
  .side-circle-left2 { position: fixed; left: -22px; top: 75%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: #003399; z-index: 10; }

  /* HERO */
  .tbo-hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: clamp(24px,4vw,56px) 5%; gap: clamp(20px,3vw,48px); max-width: 1240px; margin: 0 auto; width: 100%; }
  .hero-title { font-size: clamp(1.4rem,3vw,2.4rem); font-weight: 700; color: #1a1a1a; line-height: 1.2; font-family: 'Playfair Display',serif; }
  .hero-title .red-dot { color: #ff3300; }
  .hero-body { font-size: clamp(0.78rem,1.2vw,0.9rem); color: #555; line-height: 1.72; margin-top: 16px; }
  .register-label { font-size: 0.78rem; color: #555; font-weight: 600; margin-top: 22px; margin-bottom: 12px; }
  .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
  .btn-become { background: #003399; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-size: clamp(0.75rem,1.1vw,0.88rem); font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'DM Sans',sans-serif; transition: background 0.2s; }
  .btn-become:hover { background: #002277; }
  .btn-agent { background: #ff6600; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-size: clamp(0.75rem,1.1vw,0.88rem); font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'DM Sans',sans-serif; transition: background 0.2s; }
  .btn-agent:hover { background: #e05500; }
  .hero-video-wrap { border-radius: 14px; overflow: hidden; width: 100%; aspect-ratio: 16/10; background: #000; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
  .hero-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* NUMBERS */
  .tbo-numbers { text-align: center; padding: clamp(36px,5vw,72px) 5%; background: #f8f9fb; }
  .tbo-numbers h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; margin-bottom: 36px; font-family: 'Playfair Display',serif; }
  .stats-row { display: flex; justify-content: center; gap: clamp(28px,7vw,96px); flex-wrap: wrap; }
  .stat-item { display: flex; flex-direction: column; align-items: center; }
  .stat-num { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 700; color: #0059b3; line-height: 1; font-family: 'Playfair Display',serif; }
  .stat-label { font-size: clamp(0.74rem,1.1vw,0.88rem); color: #666; margin-top: 7px; font-weight: 500; }

  /* BRANDS MARQUEE */
  .tbo-our-brands { padding: clamp(36px,5vw,64px) 0; text-align: center; background: #fff; }
  .tbo-our-brands h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; margin-bottom: 32px; font-family: 'Playfair Display',serif; }
  .brands-marquee-wrap { position: relative; width: 100%; overflow: hidden; }
  .brands-marquee-wrap::before,.brands-marquee-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 90px; z-index: 2; pointer-events: none; }
  .brands-marquee-wrap::before { left: 0; background: linear-gradient(to right,#fff,transparent); }
  .brands-marquee-wrap::after  { right: 0; background: linear-gradient(to left,#fff,transparent); }
  .brands-marquee-track { display: flex; align-items: center; gap: 64px; width: max-content; animation: marquee-scroll 22s linear infinite; padding: 6px 0; }
  .brands-marquee-track:hover { animation-play-state: paused; }
  @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .brand-logo-img { height: clamp(30px,4vw,50px); width: auto; max-width: 140px; object-fit: contain; filter: grayscale(30%); opacity: 0.8; transition: filter 0.3s, opacity 0.3s, transform 0.3s; }
  .brand-logo-img:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.1); }

  /* VALUE */
  .tbo-value { padding: clamp(36px,5vw,68px) 5%; background: #f8f9fb; }
  .tbo-value h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 24px; font-family: 'Playfair Display',serif; }
  .value-tabs { display: flex; justify-content: center; gap: clamp(18px,4vw,60px); border-bottom: 2px solid #ddd; flex-wrap: wrap; }
  .value-tab { background: none; border: none; cursor: pointer; font-size: clamp(0.8rem,1.2vw,0.95rem); font-weight: 600; color: #777; padding: 9px 5px; position: relative; transition: color 0.2s; white-space: nowrap; font-family: 'DM Sans',sans-serif; }
  .value-tab.active { color: #ff6600; }
  .value-tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: #ff6600; border-radius: 2px 2px 0 0; }
  .value-content-area { display: grid; grid-template-columns: auto 1fr; gap: clamp(20px,3vw,52px); align-items: flex-start; max-width: 940px; margin: 30px auto 0; width: 100%; }
  .value-blob-img { width: clamp(160px,21vw,260px); height: clamp(160px,21vw,260px); object-fit: cover; border-radius: 50% 40% 50% 40%; flex-shrink: 0; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
  .value-scroll-container { overflow: hidden; }
  .value-scroll-area { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-right: 12px; }
  .value-scroll-area::-webkit-scrollbar { width: 4px; }
  .value-scroll-area::-webkit-scrollbar-track { background: #eee; border-radius: 4px; }
  .value-scroll-area::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
  .value-point { display: flex; gap: 12px; align-items: flex-start; }
  .vp-dot { width: 9px; height: 9px; border-radius: 50%; background: #ff3300; margin-top: 6px; flex-shrink: 0; }
  .vp-title { font-weight: 700; font-size: clamp(0.84rem,1.2vw,0.96rem); color: #1a1a1a; }
  .vp-desc  { font-size: clamp(0.74rem,1vw,0.84rem); color: #666; line-height: 1.65; margin-top: 4px; }

  /* PARTNER BRANDS */
  .tbo-partner-brands { padding: clamp(36px,5vw,68px) 5%; text-align: center; }
  .tbo-partner-brands h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; margin-bottom: 28px; font-family: 'Playfair Display',serif; }
  .partner-row { display: flex; justify-content: center; align-items: center; gap: clamp(20px,4vw,64px); flex-wrap: wrap; }
  .hilton-box { border: 2px solid #1c1c1c; padding: 5px 15px; font-size: clamp(0.9rem,1.5vw,1.1rem); font-weight: 800; letter-spacing: 2px; color: #1c1c1c; white-space: nowrap; }
  .expedia-wrap { display: flex; flex-direction: column; align-items: flex-start; }
  .expedia-top { font-size: clamp(0.9rem,1.5vw,1.1rem); font-weight: 700; color: #1c1c1c; display: flex; align-items: center; gap: 6px; }
  .expedia-sub { font-size: 0.6rem; color: #666; letter-spacing: 0.6px; margin-left: 20px; }

  /* GROWTH STORIES */
  .tbo-growth { padding: clamp(36px,5vw,68px) 0; text-align: center; }
  .tbo-growth h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; margin-bottom: 24px; font-family: 'Playfair Display',serif; }
  .slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .slider-viewport { overflow: hidden; }
  .slider-track { display: flex; gap: 18px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .growth-card { flex-shrink: 0; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 16px rgba(0,0,0,0.14); transition: transform 0.2s, box-shadow 0.2s; }
  .growth-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.2); }
  .gc-video-wrap { position: relative; height: clamp(120px,15vw,165px); overflow: hidden; background: #111; }
  .gc-video-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gc-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .gc-overlay:hover { background: rgba(0,0,0,0.35); }
  .gc-play { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.94); display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.26); transition: transform 0.15s; }
  .gc-overlay:hover .gc-play { transform: scale(1.12); }
  .gc-info { padding: 11px 13px; color: #fff; }
  .gc-info.orange-info { background: #cc4400; }
  .gc-info.tan-info    { background: #996622; }
  .gc-info.green-info  { background: #335533; }
  .gc-info.blue-info   { background: #1a3d88; }
  .gc-name { font-size: clamp(0.72rem,1.1vw,0.84rem); font-weight: 700; }
  .gc-org  { font-size: clamp(0.62rem,0.95vw,0.74rem); opacity: 0.88; margin-top: 2px; }
  .slider-arrow, .awards-arrow { background: #fff; border: 1.5px solid #ddd; border-radius: 50%; width: 40px; height: 40px; min-width: 40px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.2s; color: #444; margin: 0 9px; }
  .slider-arrow:hover, .awards-arrow:hover { background: #ff6600; border-color: #ff6600; color: #fff; transform: scale(1.1); }
  .slider-arrow:disabled, .awards-arrow:disabled { opacity: 0.28; cursor: default; transform: none; }
  .growth-dots, .awards-dots { display: flex; justify-content: center; gap: 7px; margin-top: 18px; }
  .gdot, .adot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; cursor: pointer; border: none; padding: 0; transition: all 0.2s; }
  .gdot.active, .adot.active { background: #ff6600; transform: scale(1.3); }

  /* AWARDS */
  .tbo-awards { padding: clamp(36px,5vw,68px) 0; text-align: center; background: #f8f9fb; }
  .tbo-awards h2 { font-size: clamp(1.2rem,2.6vw,1.8rem); font-weight: 700; color: #1a1a1a; margin-bottom: 28px; font-family: 'Playfair Display',serif; }
  .awards-slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .awards-viewport { overflow: hidden; }
  .awards-track { display: flex; gap: 22px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .award-item { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .award-img { width: 100%; max-width: 100px; aspect-ratio: 1; object-fit: contain; transition: transform 0.25s; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.13)); }
  .award-item:hover .award-img { transform: scale(1.12); }
  .award-label { font-size: clamp(0.56rem,0.88vw,0.68rem); color: #666; text-align: center; line-height: 1.45; }

  /* FOOTER */
  .tbo-footer { background: #003380; color: #ccc; padding: 20px 5% 14px; }
  .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .footer-links { display: flex; gap: 0; flex-wrap: wrap; align-items: center; }
  .footer-links a { color: #ccc; font-size: clamp(0.6rem,0.95vw,0.75rem); text-decoration: none; padding: 2px 7px; transition: color 0.2s; white-space: nowrap; }
  .footer-links a:hover { color: #fff; }
  .footer-sep { color: #556; }
  .footer-social { display: flex; gap: 8px; }
  .footer-si { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.74rem; color: #fff; cursor: pointer; font-weight: 700; transition: background 0.2s; }
  .footer-si:hover { background: rgba(255,255,255,0.28); }
  .footer-copy { font-size: 0.66rem; color: #99a; text-align: center; margin-top: 10px; }

  /* RESPONSIVE */
  @media (max-width: 1000px) {
    .side-circle-left,.side-circle-left2,.side-circle-right { display: none; }
    .tbo-hero { grid-template-columns: 1fr; }
    .hero-video-wrap { aspect-ratio: 16/9; max-height: 320px; }
    .value-content-area { grid-template-columns: 1fr; justify-items: center; }
    .value-blob-img { width: 190px; height: 190px; }
    .search-bar-container { order: 3; width: 100%; max-width: 100%; }
    .tbo-nav { flex-wrap: wrap; min-height: auto; padding: 10px 4%; }
    .cal-container { flex-direction: column; }
    .when-dropdown { width: min(96vw,600px); }
    .where-dropdown { width: min(96vw,370px); }
    .who-dropdown,.budget-dropdown,.type-dropdown { width: min(96vw,310px); }
  }
  @media (max-width: 640px) {
    .stats-row { gap: 18px; }
    .footer-inner { flex-direction: column; align-items: flex-start; }
    .value-tabs { gap: 10px; }
    .dropdown-panel { left: 8px !important; right: 8px; transform: none !important; }
    .when-dropdown,.where-dropdown,.who-dropdown,.budget-dropdown,.type-dropdown { width: 100%; }
    .flex-stay-options { flex-direction: column; }
    .when-tabs { flex-wrap: wrap; }
    .type-grid { grid-template-columns: repeat(3,1fr); }
  }
`;

/* ─── DATA ─── */
const destinations = [
  { city:"Dubai",     country:"UAE",         emoji:"🏙️", recent:true },
  { city:"Paris",     country:"France",      emoji:"🗼", recent:true },
  { city:"Bali",      country:"Indonesia",   emoji:"🌴" },
  { city:"New York",  country:"USA",         emoji:"🗽" },
  { city:"Tokyo",     country:"Japan",       emoji:"⛩️" },
  { city:"London",    country:"UK",          emoji:"🎡" },
  { city:"Bangkok",   country:"Thailand",    emoji:"🏯" },
  { city:"Singapore", country:"Singapore",   emoji:"🦁" },
  { city:"Sydney",    country:"Australia",   emoji:"🦘" },
  { city:"Maldives",  country:"Maldives",    emoji:"🏝️" },
  { city:"Istanbul",  country:"Turkey",      emoji:"🕌" },
  { city:"Rome",      country:"Italy",       emoji:"🏛️" },
];

const TRAVEL_TYPES = [
  { id:"mountains", label:"Mountains", icon:"⛰️" },
  { id:"beach",     label:"Beach",     icon:"🏖️" },
  { id:"religious", label:"Religious", icon:"🕌" },
  { id:"adventure", label:"Adventure", icon:"🧗" },
  { id:"city",      label:"City Tour", icon:"🌆" },
  { id:"wildlife",  label:"Wildlife",  icon:"🦁" },
  { id:"cruise",    label:"Cruise",    icon:"🛳️" },
  { id:"heritage",  label:"Heritage",  icon:"🏛️" },
  { id:"wellness",  label:"Wellness",  icon:"🧘" },
];

const BUDGET_OPTIONS = [
  { id:"budget",   label:"Budget",   range:"Up to ₹30,000",         icon:"🪙" },
  { id:"standard", label:"Standard", range:"₹30,000 – ₹80,000",    icon:"💳" },
  { id:"premium",  label:"Premium",  range:"₹80,000 – ₹1,50,000",  icon:"💎" },
  { id:"luxury",   label:"Luxury",   range:"₹1,50,000+",            icon:"👑" },
];

const MONTHS_LIST  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_EMOJIS = ["❄️","🌸","🌧️","🌷","☀️","🏖️","🌞","🌻","🍂","🎃","🍁","🎄"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDayOfMonth(y,m){ return new Date(y,m,1).getDay(); }
function formatDate(d){ if(!d)return ""; return `${MONTHS_LIST[d.getMonth()]} ${d.getDate()}`; }
function addMonths(date,n){ const d=new Date(date); d.setMonth(d.getMonth()+n); return d; }

/* ─── CALENDAR ─── */
function Calendar({ year, month, startDate, endDate, hoverDate, onSelect, onHover, showPrev, showNext, onPrev, onNext }) {
  const days=getDaysInMonth(year,month), firstDay=getFirstDayOfMonth(year,month);
  const today=new Date(); today.setHours(0,0,0,0);
  const cells=[]; for(let i=0;i<firstDay;i++)cells.push(null); for(let d=1;d<=days;d++)cells.push(d);
  function getClasses(d){
    if(!d)return"cal-day disabled";
    const dt=new Date(year,month,d); dt.setHours(0,0,0,0);
    if(dt<today)return"cal-day disabled";
    let cls="cal-day";
    if(startDate&&endDate){
      const s=new Date(startDate);s.setHours(0,0,0,0);const e=new Date(endDate);e.setHours(0,0,0,0);
      if(dt.getTime()===s.getTime())cls+=" range-start selected";
      else if(dt.getTime()===e.getTime())cls+=" range-end selected";
      else if(dt>s&&dt<e)cls+=" in-range";
    } else if(startDate){
      const s=new Date(startDate);s.setHours(0,0,0,0);
      if(dt.getTime()===s.getTime())cls+=" selected";
      else if(hoverDate){const h=new Date(hoverDate);h.setHours(0,0,0,0);if(dt>s&&dt<=h)cls+=" in-range";else if(dt<s&&dt>=h)cls+=" in-range";}
    }
    if(dt.toDateString()===today.toDateString())cls+=" today";
    return cls;
  }
  return(
    <div className="cal-month">
      <div className="cal-month-header">
        {showPrev?<button className="cal-nav-btn" onClick={onPrev}>‹</button>:<div style={{width:27}}/>}
        <span className="cal-month-name">{MONTHS_LIST[month]} {year}</span>
        {showNext?<button className="cal-nav-btn" onClick={onNext}>›</button>:<div style={{width:27}}/>}
      </div>
      <div className="cal-grid">
        {DOW.map(d=><div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d,i)=>(
          <div key={i} className={getClasses(d)}
            onClick={()=>d&&onSelect(new Date(year,month,d))}
            onMouseEnter={()=>d&&onHover&&onHover(new Date(year,month,d))}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CIRCLE SELECTOR ─── */
function CircleSelector({ duration, onChange }) {
  const svgRef=useRef(null); const dragging=useRef(false);
  const R=80,CX=100,CY=100,min=1,max=12;
  const angle=((duration-min)/(max-min))*300-150;
  const rad=a=>(a*Math.PI)/180;
  const thumbX=CX+R*Math.cos(rad(angle-90)); const thumbY=CY+R*Math.sin(rad(angle-90));
  const arcStart=rad(-90-150); const arcEnd=rad(angle-90);
  const startX=CX+R*Math.cos(arcStart),startY=CY+R*Math.sin(arcStart);
  const endX=CX+R*Math.cos(arcEnd),endY=CY+R*Math.sin(arcEnd);
  const largeArc=(angle+150)>180?1:0;
  function getA(e){ const rect=svgRef.current.getBoundingClientRect(); const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2; const cX=e.touches?e.touches[0].clientX:e.clientX,cY=e.touches?e.touches[0].clientY:e.clientY; return Math.atan2(cY-cy,cX-cx)*(180/Math.PI)+90; }
  function handleMove(e){ if(!dragging.current)return; let a=getA(e); a=Math.max(-150,Math.min(150,a)); onChange(Math.max(min,Math.min(max,Math.round(((a+150)/300)*(max-min)+min)))); }
  return(
    <div className="circle-selector" onMouseMove={handleMove} onMouseUp={()=>{dragging.current=false;}} onTouchMove={handleMove} onTouchEnd={()=>{dragging.current=false;}}>
      <svg ref={svgRef} viewBox="0 0 200 200" className="circle-svg" width="185" height="185">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*R*300/360} ${2*Math.PI*R}`} strokeDashoffset={`${2*Math.PI*R*(-30)/360}`} style={{transformOrigin:'100px 100px'}}/>
        {duration>min&&<path d={`M ${startX} ${startY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`} fill="none" stroke="url(#grad)" strokeWidth="12" strokeLinecap="round"/>}
        <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff6600"/><stop offset="100%" stopColor="#ff3366"/></linearGradient></defs>
        <circle cx={thumbX} cy={thumbY} r="14" fill="url(#grad)" style={{cursor:'grab',filter:'drop-shadow(0 2px 6px rgba(255,80,50,0.5))'}}
          onMouseDown={()=>{dragging.current=true;}} onTouchStart={()=>{dragging.current=true;}}/>
        <text x={thumbX} y={thumbY} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="700">{duration}</text>
      </svg>
      <div className="circle-selector-label">
        <div className="circle-duration">{duration}</div>
        <div className="circle-unit">{duration===1?"month":"months"}</div>
      </div>
    </div>
  );
}

/* ─── PAGE DATA ─── */
const valueContent = {
  "Travel buyers":[
    {title:"Customer support",desc:"Benefit from round-the-clock customer support in your local language, ensuring seamless service and customer satisfaction, with over 500 account managers offering warm and dedicated assistance."},
    {title:"Earn reward points",desc:"With TBO+, earn reward points from your very first booking and access free learning opportunities on travel products with TBO Academy."},
    {title:"Leverage TBO to increase sales",desc:"With TBO+ reward program, you can increase bookings through exclusive promotions that will be marketed to travel agents."},
  ],
  "Travel suppliers":[
    {title:"Global distribution network",desc:"Instantly connect with over 159,000 travel buyers across 100+ countries and grow your reach without additional marketing spend."},
    {title:"Real-time inventory management",desc:"Manage live availability and pricing across all channels through our powerful, easy-to-use supplier portal."},
    {title:"Revenue analytics",desc:"Access detailed reports on booking trends, top-performing buyers, and revenue opportunities to optimize your strategy."},
  ],
  "Travelpreneurs":[
    {title:"Zero investment startup",desc:"Launch your own travel business with no upfront cost — use TBO's platform, supplier network, and tools from day one."},
    {title:"Training & mentorship",desc:"Get certified through TBO Academy and receive dedicated mentorship to accelerate your growth as a travel entrepreneur."},
    {title:"Earn from day one",desc:"Start earning commissions immediately on bookings while building expertise and a loyal client base."},
  ],
};
const stories=[
  {name:"Dinesh Poojary",      org:"Travel Agent",                 info:"orange-info",video:"https://www.tbo.com/img/testimonials/agent/Dinesh-Poojary.mp4"},
  {name:"Gautam Vij",          org:"KBS Tours and Travels, India", info:"blue-info",  video:"https://www.tbo.com/img/testimonials/agent/Gautam-Vij.mp4"},
  {name:"Sebastian Sierra",    org:"Travel Agent",                 info:"green-info", video:"https://www.tbo.com/img/testimonials/agent/Sebastian-Sierra.mp4"},
  {name:"Stuart Lee",          org:"Travel Agent",                 info:"tan-info",   video:"https://www.tbo.com/img/testimonials/agent/Stuart-Lee.mp4"},
  {name:"UAE Agent",           org:"UAE",                          info:"orange-info",video:"https://www.tbo.com/img/testimonials/agent/UAEAgenta.mp4"},
  {name:"Mr. Kuljit Singh Hayer",org:"Universal Travels, India",  info:"green-info", video:"https://www.tbo.com/img/testimonials/agent/KuljitSingh.mp4"},
  {name:"Fortun Plumley",      org:"Travel Agent",                 info:"blue-info",  video:"https://www.tbo.com/img/testimonials/agent/Fortun-PlumLey.mp4"},
];
const awards=[
  {img:"https://www.tbo.com/img/awards/TWMGold_Award_2024.png",          label:"TWM Gold Award 2024"},
  {img:"https://www.tbo.com/img/awards/BDD_B2B_campaign.png",            label:"Best Data Driven B2B Campaign"},
  {img:"https://www.tbo.com/img/awards/BTDC_Y_2024.png",                 label:"Best Travel Distribution Company 2024"},
  {img:"https://www.tbo.com/img/awards/EoTYAward_2024.png",              label:"Entrepreneur of the Year 2024"},
  {img:"https://www.tbo.com/img/awards/OTM_of_the_year.png",             label:"OTM of the Year"},
  {img:"https://www.tbo.com/img/awards/MEB_B2B_Travel_Portal_2025.png",  label:"Middle East's Best B2B Travel Portal 2025"},
  {img:"https://www.tbo.com/img/awards/LAB_B2B_Travel_Provider_2025.png",label:"Latin America's Best B2B Travel Provider 2025"},
  {img:"https://www.tbo.com/img/awards/ttm.jpg",                         label:"TTM Award"},
];
const brandLogos=[
  {src:"https://www.tbo.com/img/logos/sabre-min.png",          alt:"Sabre"},
  {src:"https://www.tbo.com/img/brands/bookabed-min.png",      alt:"Bookabed"},
  {src:"https://www.tbo.com/img/brands/zamzamlogo-min.png",    alt:"Zamzam"},
  {src:"https://www.tbo.com/img/brands/jumbonline-min.png",    alt:"JumbOnline"},
  {src:"https://www.tbo.com/img/brands/paxes-min.png",         alt:"PAXES"},
  {src:"https://www.tbo.com/img/brands/kizanlogo-min.png",     alt:"Kizan"},
  {src:"https://www.tbo.com/img/brands/tboacademy-min.png",    alt:"TBO Academy"},
  {src:"https://www.tbo.com/img/brands/classic-vacations.png", alt:"Classic Vacations"},
];
const footerLinks=["Home","About Us","Careers","Privacy Policy","Terms and Conditions","Sanctions Policy","Investors","Media","Contact Us"];

function useSliderSizes(){
  const [sizes,setSizes]=useState({cardW:210,visibleCards:4,awardW:120,visibleAwards:5});
  useEffect(()=>{
    function calc(){
      const W=window.innerWidth; let vc,cw,va,aw;
      if(W<480){vc=1;cw=Math.floor(W*0.86);va=2;aw=Math.floor((W*0.86-22)/2);}
      else if(W<640){vc=2;cw=Math.floor((W*0.86-18)/2);va=3;aw=Math.floor((W*0.86-44)/3);}
      else if(W<1000){vc=3;cw=Math.floor((W*0.86-36)/3);va=4;aw=Math.floor((W*0.86-66)/4);}
      else{vc=4;cw=Math.min(230,Math.floor((W*0.78-54)/4));va=5;aw=Math.min(130,Math.floor((W*0.78-88)/5));}
      setSizes({cardW:cw,visibleCards:vc,awardW:aw,visibleAwards:va});
    }
    calc(); window.addEventListener("resize",calc); return()=>window.removeEventListener("resize",calc);
  },[]);
  return sizes;
}

/* ─── MAIN ─── */
export default function TBOHomepage() {
  const { isLoggedIn, user, persona, requireAuth, setShowRegister, setShowLogin, logout } = useAuth();
  // Expanded search state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [isListening, setIsListening]       = useState(false);
  const fileInputRef = useRef(null);

  // Filter panels
  const [openPanel, setOpenPanel] = useState(null); // 'type'|'where'|'when'|'who'|'budget'

  // Type
  const [selectedTypes, setSelectedTypes] = useState([]);
  // Where
  const [destQuery, setDestQuery]     = useState("");
  const [destination, setDestination] = useState("");
  // When
  const [whenTab, setWhenTab]           = useState("Dates");
  const [calMonth, setCalMonth]         = useState({y:new Date().getFullYear(),m:new Date().getMonth()});
  const [startDate, setStartDate]       = useState(null);
  const [endDate, setEndDate]           = useState(null);
  const [hoverDate, setHoverDate]       = useState(null);
  const [flexDays, setFlexDays]         = useState("Exact");
  const [monthsDuration, setMonthsDuration] = useState(3);
  const [stayType, setStayType]         = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]);
  // Who
  const [guests, setGuests] = useState({adults:1,children:0,infants:0,pets:0});
  // Budget
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetSlider, setBudgetSlider]     = useState(50);

  // Page
  const [activeTab,setActiveTab]     = useState("Travel buyers");
  const [playingIdx,setPlayingIdx]   = useState(null);
  const [slideIdx,setSlideIdx]       = useState(0);
  const [isPaused,setIsPaused]       = useState(false);
  const [awardIdx,setAwardIdx]       = useState(0);
  const [awardPaused,setAwardPaused] = useState(false);

  const searchRef = useRef(null);
  const videoRefs = useState(()=>stories.map(()=>({current:null})))[0];
  const {cardW,visibleCards,awardW,visibleAwards} = useSliderSizes();
  const GAP=18, AWARD_GAP=22;
  const maxSlide=Math.max(0,stories.length-visibleCards);
  const maxAward=Math.max(0,awards.length-visibleAwards);

  useEffect(()=>{
    function handle(e){ if(searchRef.current&&!searchRef.current.contains(e.target)){ setOpenPanel(null); if(searchExpanded)setSearchExpanded(false); } }
    document.addEventListener("mousedown",handle);
    return()=>document.removeEventListener("mousedown",handle);
  },[searchExpanded]);

  useEffect(()=>{ if(isPaused||playingIdx!==null)return; const t=setInterval(()=>setSlideIdx(p=>p>=maxSlide?0:p+1),3000); return()=>clearInterval(t); },[isPaused,playingIdx,maxSlide]);
  useEffect(()=>{ if(awardPaused)return; const t=setInterval(()=>setAwardIdx(p=>p>=maxAward?0:p+1),2500); return()=>clearInterval(t); },[awardPaused,maxAward]);
  useEffect(()=>{ if(slideIdx>maxSlide)setSlideIdx(maxSlide); },[maxSlide]);
  useEffect(()=>{ if(awardIdx>maxAward)setAwardIdx(maxAward); },[maxAward]);

  const handlePlay=(i)=>{ if(playingIdx!==null&&playingIdx!==i&&videoRefs[playingIdx].current)videoRefs[playingIdx].current.pause(); setPlayingIdx(i); };

  const filtered=destQuery?destinations.filter(d=>d.city.toLowerCase().includes(destQuery.toLowerCase())||d.country.toLowerCase().includes(destQuery.toLowerCase())):destinations;
  const recents=filtered.filter(d=>d.recent), others=filtered.filter(d=>!d.recent);

  function handleDateSelect(date){
    if(!startDate||(startDate&&endDate)){setStartDate(date);setEndDate(null);setHoverDate(null);}
    else{if(date<startDate){setStartDate(date);setEndDate(null);}else setEndDate(date);}
  }

  function whenValue(){
    if(whenTab==="Dates"&&startDate){ if(endDate)return`${formatDate(startDate)} – ${formatDate(endDate)}`; return formatDate(startDate); }
    if(whenTab==="Months")return`${formatDate(new Date())} – ${formatDate(addMonths(new Date(),monthsDuration))}`;
    if(whenTab==="Flexible"&&stayType&&selectedMonths.length>0)return`${stayType} · ${selectedMonths.length} mo`;
    return null;
  }

  const totalGuests=guests.adults+guests.children;
  function whoValue(){ if(totalGuests===0)return null; let s=`${totalGuests} guest${totalGuests!==1?"s":""}`; if(guests.infants)s+=`, ${guests.infants} infant${guests.infants!==1?"s":""}`; if(guests.pets)s+=`, ${guests.pets} pet${guests.pets!==1?"s":""}`; return s; }
  function typeValue(){ if(!selectedTypes.length)return null; if(selectedTypes.length===1)return TRAVEL_TYPES.find(t=>t.id===selectedTypes[0])?.label; return`${selectedTypes.length} types`; }
  function budgetValue(){ return selectedBudget?BUDGET_OPTIONS.find(b=>b.id===selectedBudget)?.label:null; }
  function toggleType(id){ setSelectedTypes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]); }
  function toggleMonth(key){ setSelectedMonths(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]); }

  const nextM={y:calMonth.m===11?calMonth.y+1:calMonth.y, m:(calMonth.m+1)%12};
  const futureMonths=Array.from({length:12},(_,i)=>{ const d=addMonths(new Date(),i+1); return{year:d.getFullYear(),month:d.getMonth(),emoji:MONTH_EMOJIS[d.getMonth()]}; });

  function handleRedirectClick(){
    if (!requireAuth()) return;
    const params=new URLSearchParams();
    if(destination)params.set("where",destination);
    if(whenValue())params.set("when",whenValue());
    if(whoValue())params.set("guests",whoValue());
    if(typeValue())params.set("type",typeValue());
    if(budgetValue())params.set("budget",budgetValue());
    alert(`Search with filters:\n${decodeURIComponent(params.toString())}`);
  }

  function handleVoiceClick(){ setIsListening(l=>!l); }
  function handleBookNow(){ if (!requireAuth()) return; alert("Proceeding to booking..."); }
  function handleImageUpload(e){ const f=e.target.files[0]; if(f)console.log("Image for search:",f.name); }

  const svWidth=visibleCards*cardW+(visibleCards-1)*GAP;
  const avWidth=visibleAwards*awardW+(visibleAwards-1)*AWARD_GAP;

  return (
    <>
      <style>{css}</style>
      <div className="tbo-wrap">
        <div className="side-circle-left"/><div className="side-circle-left2"/><div className="side-circle-right"/>

        {/* ── NAVBAR ── */}
        <nav className="tbo-nav">
          <div className="tbo-logo-wrap">
            <div className="tbo-logo-text">
              <span className="logo-tbo">tbo</span><span className="logo-dot">.</span><span className="logo-com">com</span>
            </div>
            <span className="logo-sub">TRAVEL SIMPLIFIED</span>
          </div>

          {/* ── SEARCH AREA ── */}
          <div className="search-bar-container" ref={searchRef}>
            {openPanel && !searchExpanded && <div className="dropdown-overlay" onClick={()=>setOpenPanel(null)}/>}

            {searchExpanded ? (
              /* ── EXPANDED TEXT SEARCH BAR ── */
              <div className="expanded-search-bar">
                <input className="expanded-search-input" placeholder="Search destinations, hotels, activities..."
                  value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} autoFocus aria-label="Search"/>
                {/* Mic / Voice */}
                <div className={isListening?"voice-active":""}>
                  <button className="exp-icon-btn" onClick={handleVoiceClick} title={isListening?"Stop":"Voice search"} aria-label="Voice search">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="9" y1="23" x2="15" y2="23"/>
                    </svg>
                  </button>
                </div>
                {/* Image upload */}
                <button className="exp-icon-btn" onClick={()=>fileInputRef.current?.click()} title="Search by image" aria-label="Image search">
                  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
                {/* Close */}
                <button className="exp-close-btn" onClick={()=>{setSearchExpanded(false);setSearchQuery("");setIsListening(false);}} aria-label="Close search">✕</button>
              </div>
            ) : (
              /* ── FILTER PILL ── */
              <div className={`search-pill ${openPanel?"active":""}`}>

                {/* TYPE */}
                <div className={`pill-section ${openPanel==="type"?"open":""}`} style={{maxWidth:120}}
                  onClick={()=>setOpenPanel(openPanel==="type"?null:"type")} role="button" aria-label="Travel type">
                  <span className="pill-label">Type</span>
                  <span className={`pill-value ${!typeValue()?"placeholder":""}`}>{typeValue()||"Any type"}</span>
                </div>

                {/* WHERE */}
                <div className={`pill-section ${openPanel==="where"?"open":""}`} style={{maxWidth:155}}
                  onClick={()=>setOpenPanel(openPanel==="where"?null:"where")} role="button" aria-label="Where">
                  <span className="pill-label">Where</span>
                  <span className={`pill-value ${!destination?"placeholder":""}`}>{destination||"Destination"}</span>
                </div>

                {/* WHEN */}
                <div className={`pill-section ${openPanel==="when"?"open":""}`} style={{maxWidth:145}}
                  onClick={()=>setOpenPanel(openPanel==="when"?null:"when")} role="button" aria-label="When">
                  <span className="pill-label">When</span>
                  <span className={`pill-value ${!whenValue()?"placeholder":""}`}>{whenValue()||"Add dates"}</span>
                </div>

                {/* WHO */}
                <div className={`pill-section ${openPanel==="who"?"open":""}`} style={{maxWidth:135}}
                  onClick={()=>setOpenPanel(openPanel==="who"?null:"who")} role="button" aria-label="Who">
                  <span className="pill-label">Who</span>
                  <span className={`pill-value ${!whoValue()?"placeholder":""}`}>{whoValue()||"Guests"}</span>
                </div>

                {/* BUDGET */}
                <div className={`pill-section ${openPanel==="budget"?"open":""}`} style={{maxWidth:120}}
                  onClick={()=>setOpenPanel(openPanel==="budget"?null:"budget")} role="button" aria-label="Budget">
                  <span className="pill-label">Budget</span>
                  <span className={`pill-value ${!budgetValue()?"placeholder":""}`}>{budgetValue()||"Any"}</span>
                </div>

                {/* REDIRECT ARROW — go to results */}
                <button className="pill-redirect-btn" onClick={handleRedirectClick} aria-label="Go to search results" title="Search with filters">
                  <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>
                </button>

                {/* SEARCH ICON — opens text search */}
                <button className="pill-search-icon-btn" onClick={()=>{setOpenPanel(null);setSearchExpanded(true);}} aria-label="Text search" title="Search by typing">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>

                {/* ── TYPE DROPDOWN ── */}
                {openPanel==="type"&&(
                  <div className="dropdown-panel type-dropdown" style={{left:0}}>
                    <div className="type-dropdown-title">Travel Style</div>
                    <div className="type-grid">
                      {TRAVEL_TYPES.map(t=>(
                        <div key={t.id} className={`type-card ${selectedTypes.includes(t.id)?"active":""}`} onClick={()=>toggleType(t.id)}>
                          <div className="type-card-icon">{t.icon}</div>
                          <div className="type-card-label">{t.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer" style={{marginTop:10}}>
                      <button className="btn-clear" onClick={()=>setSelectedTypes([])}>Clear</button>
                      <button className="btn-apply" onClick={()=>setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}

                {/* ── WHERE DROPDOWN ── */}
                {openPanel==="where"&&(
                  <div className="dropdown-panel where-dropdown" style={{left:"15%"}}>
                    <input className="where-search-input" placeholder="Search destinations"
                      value={destQuery} onChange={e=>setDestQuery(e.target.value)} autoFocus aria-label="Destination"/>
                    <div className="dest-list">
                      {!destQuery&&recents.length>0&&(
                        <><div className="dest-section-label">Recent searches</div>
                        {recents.map(d=>(
                          <div key={d.city} className="dest-item" onClick={()=>{setDestination(d.city);setOpenPanel(null);setDestQuery("");}}>
                            <div className="dest-thumb">{d.emoji}</div>
                            <div><div className="dest-city">{d.city}</div><div className="dest-country">{d.country}</div></div>
                          </div>
                        ))}</>
                      )}
                      <div className="dest-section-label">{destQuery?"Results":"Suggested"}</div>
                      {(destQuery?filtered:others).map(d=>(
                        <div key={d.city} className="dest-item" onClick={()=>{setDestination(d.city);setOpenPanel(null);setDestQuery("");}}>
                          <div className="dest-thumb">{d.emoji}</div>
                          <div><div className="dest-city">{d.city}</div><div className="dest-country">{d.country}</div></div>
                        </div>
                      ))}
                      {filtered.length===0&&<div style={{padding:"12px",color:"#aaa",fontSize:"0.8rem"}}>No results</div>}
                    </div>
                  </div>
                )}

                {/* ── WHEN DROPDOWN ── */}
                {openPanel==="when"&&(
                  <div className="dropdown-panel when-dropdown" style={{left:"50%",transform:"translateX(-50%)"}}>
                    <div className="when-tabs">
                      {["Dates","Months","Flexible"].map(t=>(
                        <button key={t} className={`when-tab ${whenTab===t?"active":""}`} onClick={()=>setWhenTab(t)}>{t}</button>
                      ))}
                    </div>
                    <div className="when-body">
                      {whenTab==="Dates"&&(<>
                        <div className="cal-container">
                          <Calendar year={calMonth.y} month={calMonth.m} startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate?setHoverDate:null}
                            showPrev onPrev={()=>calMonth.m===0?setCalMonth({y:calMonth.y-1,m:11}):setCalMonth({y:calMonth.y,m:calMonth.m-1})}/>
                          <Calendar year={nextM.y} month={nextM.m} startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate?setHoverDate:null}
                            showNext onNext={()=>calMonth.m===11?setCalMonth({y:calMonth.y+1,m:0}):setCalMonth({y:calMonth.y,m:calMonth.m+1})}/>
                        </div>
                        <div className="flex-options">
                          {["Exact dates","±1 day","±2 days","±3 days","±7 days","±14 days"].map(f=>(
                            <button key={f} className={`flex-chip ${flexDays===f?"active":""}`} onClick={()=>setFlexDays(f)}>{f}</button>
                          ))}
                        </div>
                      </>)}
                      {whenTab==="Months"&&(
                        <div className="months-tab-body">
                          <CircleSelector duration={monthsDuration} onChange={setMonthsDuration}/>
                          <div className="months-range-display">
                            <div className="months-range-text">{formatDate(new Date())} – {formatDate(addMonths(new Date(),monthsDuration))}</div>
                            <div className="months-range-sub">{monthsDuration} month{monthsDuration!==1?"s":""} trip</div>
                            <div className="months-hint">Drag the circle handle to adjust</div>
                          </div>
                        </div>
                      )}
                      {whenTab==="Flexible"&&(<>
                        <div className="flex-stay-label">How long would you like to stay?</div>
                        <div className="flex-stay-options">
                          {[{name:"Weekend",icon:"🌙",desc:"2–3 nights"},{name:"Week",icon:"☀️",desc:"5–7 nights"},{name:"Month",icon:"📅",desc:"28–31 nights"}].map(s=>(
                            <button key={s.name} className={`flex-stay-btn ${stayType===s.name?"active":""}`} onClick={()=>setStayType(s.name)}>
                              <span className="stay-icon">{s.icon}</span><span className="stay-name">{s.name}</span><span className="stay-desc">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                        <div className="when-go-label">When do you want to go?</div>
                        <div className="month-cards-scroll">
                          {futureMonths.map((m,i)=>{ const key=`${m.year}-${m.month}`; return(
                            <div key={key} className={`month-card ${selectedMonths.includes(key)?"active":""}`} onClick={()=>toggleMonth(key)}>
                              <div className="mc-emoji">{m.emoji}</div>
                              <div className="mc-month">{MONTHS_LIST[m.month]}</div>
                              <div className="mc-year">{m.year}</div>
                            </div>
                          );})}
                        </div>
                      </>)}
                    </div>
                    <div className="dropdown-footer">
                      <button className="btn-clear" onClick={()=>{setStartDate(null);setEndDate(null);setHoverDate(null);setSelectedMonths([]);setStayType(null);}}>Clear</button>
                      <button className="btn-apply" onClick={()=>setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}

                {/* ── WHO DROPDOWN ── */}
                {openPanel==="who"&&(
                  <div className="dropdown-panel who-dropdown" style={{right:"17%",left:"auto"}}>
                    <div style={{paddingBottom:4}}>
                      {[{key:"adults",label:"Adults",sub:"Ages 13+"},{key:"children",label:"Children",sub:"Ages 2–12"},{key:"infants",label:"Infants",sub:"Under 2"},{key:"pets",label:"Pets",sub:"Assistance animals"}].map(g=>(
                        <div className="guest-row" key={g.key}>
                          <div><div className="guest-type">{g.label}</div><div className="guest-age">{g.sub}</div></div>
                          <div className="guest-counter">
                            <button className="guest-btn" disabled={guests[g.key]===0||(g.key==="adults"&&guests[g.key]<=1)}
                              onClick={()=>setGuests(p=>({...p,[g.key]:Math.max(g.key==="adults"?1:0,p[g.key]-1)}))}>−</button>
                            <span className="guest-count">{guests[g.key]}</span>
                            <button className="guest-btn" disabled={guests[g.key]>=16}
                              onClick={()=>setGuests(p=>({...p,[g.key]:p[g.key]+1}))}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button className="btn-clear" onClick={()=>setGuests({adults:1,children:0,infants:0,pets:0})}>Clear</button>
                      <button className="btn-apply" onClick={()=>setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}

                {/* ── BUDGET DROPDOWN ── */}
                {openPanel==="budget"&&(
                  <div className="dropdown-panel budget-dropdown" style={{right:"8%",left:"auto"}}>
                    <div className="budget-title">Select Budget</div>
                    <div className="budget-options">
                      {BUDGET_OPTIONS.map(b=>(
                        <div key={b.id} className={`budget-option ${selectedBudget===b.id?"active":""}`}
                          onClick={()=>setSelectedBudget(selectedBudget===b.id?null:b.id)}>
                          <span className="budget-option-icon">{b.icon}</span>
                          <div className="budget-option-info">
                            <div className="budget-option-label">{b.label}</div>
                            <div className="budget-option-range">{b.range}</div>
                          </div>
                          {selectedBudget===b.id&&<div className="budget-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>}
                        </div>
                      ))}
                    </div>
                    <div className="budget-range-label">Or set custom max budget</div>
                    <input type="range" className="budget-slider" min="0" max="100" value={budgetSlider}
                      style={{"--val":budgetSlider+"%"}}
                      onChange={e=>{setBudgetSlider(+e.target.value);e.target.style.setProperty("--val",e.target.value+"%");}}/>
                    <div className="budget-range-values">
                      <span>₹0</span>
                      <span style={{color:"#ff6600",fontWeight:600}}>₹{Math.round(budgetSlider*5000).toLocaleString()}</span>
                      <span>₹5L+</span>
                    </div>
                    <div className="dropdown-footer" style={{marginTop:12}}>
                      <button className="btn-clear" onClick={()=>{setSelectedBudget(null);setBudgetSlider(50);}}>Clear</button>
                      <button className="btn-apply" onClick={()=>setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="tbo-nav-right">
            {isLoggedIn ? (
              <>
                <span className="already-reg" style={{color:"#22c55e",fontWeight:600}}>
                  ✓ {user?.name ? user.name.split(" ")[0] : "Logged in"}
                  {persona ? ` · ${persona}` : ""}
                </span>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn-book" onClick={handleBookNow}>Book Now</button>
                  <button className="btn-book" style={{background:"#e0e0e0",color:"#555"}} onClick={logout}>Logout</button>
                </div>
              </>
            ) : (
              <>
                <span className="already-reg">
                  Already Registered?{" "}
                  <button onClick={() => setShowLogin(true)}
                    style={{color:"#ff6600",fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"inherit",textDecoration:"underline",padding:0}}>
                    Sign in
                  </button>
                </span>
                <button className="btn-book" onClick={() => setShowRegister(true)}>Book Now</button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="tbo-hero">
          <div>
            <h1 className="hero-title">Simplifying Travel<span className="red-dot">.</span><br/>Enabling Growth</h1>
            <p className="hero-body">We are one of the leading global travel distribution platforms, simplifying the travel business for both suppliers and buyers. Our suppliers include hotels, airlines, cruises, car rentals, transfers, and rail services. Our buyers consist of retail and API buyers such as travel agencies, independent travel advisors, and enterprise buyers including tour operators, travel management companies, online travel companies, super-apps, and loyalty apps.</p>
            <p className="hero-body" style={{marginTop:12}}>Our platform enables seamless transactions, connecting over 159,000 buyers with over 1 million suppliers across 100+ countries.</p>
            <p className="register-label">Register with us:</p>
            <div className="hero-btns">
              <button className="btn-become">Become TBO Partner</button>
              <button className="btn-agent">Agent Partner</button>
            </div>
          </div>
          <div className="hero-video-wrap">
            <video src="https://www.tbo.com/img/videos/The-World-of-TBO-Group.mp4?var=300420244" autoPlay muted loop playsInline/>
          </div>
        </div>

        {/* ── NUMBERS ── */}
        <section className="tbo-numbers">
          <h2>TBO in numbers</h2>
          <div className="stats-row">
            {[{num:"159K+",label:"Travel buyers"},{num:"1M+",label:"Hotels worldwide"},{num:"100+",label:"Countries"},{num:"55+",label:"Supported currencies"}].map(s=>(
              <div className="stat-item" key={s.label}><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
            ))}
          </div>
        </section>

        {/* ── BRANDS MARQUEE ── */}
        <section className="tbo-our-brands">
          <h2>Our brands</h2>
          <div className="brands-marquee-wrap">
            <div className="brands-marquee-track">
              {[...brandLogos,...brandLogos].map((b,i)=><img key={i} src={b.src} alt={b.alt} className="brand-logo-img"/>)}
            </div>
          </div>
        </section>

        {/* ── VALUE ── */}
        <section className="tbo-value">
          <h2>How do we add value to..</h2>
          <div className="value-tabs">
            {Object.keys(valueContent).map(tab=>(
              <button key={tab} className={`value-tab ${activeTab===tab?"active":""}`} onClick={()=>setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="value-content-area">
            <img src="https://www.tbo.com/img/travelbuyers.webp" alt="Travel Buyers" className="value-blob-img"/>
            <div className="value-scroll-container">
              <div className="value-scroll-area">
                {valueContent[activeTab].map(p=>(
                  <div className="value-point" key={p.title}>
                    <div className="vp-dot"/>
                    <div><div className="vp-title">{p.title}</div><div className="vp-desc">{p.desc}</div></div>
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
            <div className="expedia-wrap"><div className="expedia-top"><span style={{color:"#e05500"}}>⬡</span> expedia</div><div className="expedia-sub">group</div></div>
            <div className="hilton-box">Hilton</div>
            <div style={{fontWeight:700,fontSize:"clamp(0.9rem,1.5vw,1.1rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>Derby</span>Soft</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontWeight:600,fontSize:"clamp(0.9rem,1.5vw,1.05rem)"}}><span>●</span> Roibos</div>
            <div style={{fontSize:"clamp(0.9rem,1.5vw,1.05rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>ibs</span><span style={{fontWeight:700}}>software</span></div>
          </div>
        </section>

        {/* ── GROWTH STORIES ── */}
        <section className="tbo-growth">
          <h2>Growth Stories</h2>
          <div className="slider-wrapper" onMouseEnter={()=>setIsPaused(true)} onMouseLeave={()=>setIsPaused(false)}>
            <button className="slider-arrow" onClick={()=>setSlideIdx(Math.max(0,slideIdx-1))} disabled={slideIdx===0}>‹</button>
            <div className="slider-viewport" style={{width:svWidth}}>
              <div className="slider-track" style={{transform:`translateX(-${slideIdx*(cardW+GAP)}px)`}}>
                {stories.map((s,i)=>(
                  <div className="growth-card" style={{width:cardW}} key={i}>
                    <div className="gc-video-wrap">
                      <video ref={el=>{videoRefs[i].current=el;}} src={s.video} preload="metadata" playsInline
                        controls={playingIdx===i}
                        style={{width:"100%",height:"100%",objectFit:"cover",display:"block",background:"#111"}}
                        onPlay={()=>handlePlay(i)} onPause={()=>{if(playingIdx===i)setPlayingIdx(null);}}/>
                      {playingIdx!==i&&(
                        <div className="gc-overlay" onClick={()=>{handlePlay(i);videoRefs[i].current?.play();}}>
                          <div className="gc-play">▶</div>
                        </div>
                      )}
                    </div>
                    <div className={`gc-info ${s.info}`}><div className="gc-name">{s.name}</div><div className="gc-org">{s.org}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <button className="slider-arrow" onClick={()=>setSlideIdx(Math.min(maxSlide,slideIdx+1))} disabled={slideIdx>=maxSlide}>›</button>
          </div>
          <div className="growth-dots">
            {Array.from({length:maxSlide+1}).map((_,i)=>(
              <button key={i} className={`gdot ${slideIdx===i?"active":""}`} onClick={()=>setSlideIdx(i)}/>
            ))}
          </div>
        </section>

        {/* ── AWARDS ── */}
        <section className="tbo-awards">
          <h2>Awards</h2>
          <div className="awards-slider-wrapper" onMouseEnter={()=>setAwardPaused(true)} onMouseLeave={()=>setAwardPaused(false)}>
            <button className="awards-arrow" onClick={()=>setAwardIdx(Math.max(0,awardIdx-1))} disabled={awardIdx===0}>‹</button>
            <div className="awards-viewport" style={{width:avWidth}}>
              <div className="awards-track" style={{transform:`translateX(-${awardIdx*(awardW+AWARD_GAP)}px)`}}>
                {awards.map(a=>(
                  <div className="award-item" style={{width:awardW}} key={a.label}>
                    <img src={a.img} alt={a.label} className="award-img"/>
                    <div className="award-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="awards-arrow" onClick={()=>setAwardIdx(Math.min(maxAward,awardIdx+1))} disabled={awardIdx>=maxAward}>›</button>
          </div>
          <div className="awards-dots">
            {Array.from({length:maxAward+1}).map((_,i)=>(
              <button key={i} className={`adot ${awardIdx===i?"active":""}`} onClick={()=>setAwardIdx(i)}/>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="tbo-footer">
          <div className="footer-inner">
            <div className="footer-links">
              {footerLinks.map((l,i)=>(
                <span key={l} style={{display:"flex",alignItems:"center"}}>
                  <a href="#">{l}</a>
                  {i<footerLinks.length-1&&<span className="footer-sep">|</span>}
                </span>
              ))}
            </div>
            <div className="footer-social">
              {["in","f","📷","🐦"].map((icon,i)=><div key={i} className="footer-si">{icon}</div>)}
            </div>
          </div>
          <div className="footer-copy">© All rights reserved</div>
        </footer>
      </div>
    </>
  );
}