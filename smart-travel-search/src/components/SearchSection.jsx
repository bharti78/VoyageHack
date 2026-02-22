import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; overflow-x: hidden; }
  .tbo-wrap { font-family: 'DM Sans', sans-serif; color: #333; background: #fff; width: 100%; overflow-x: hidden; }

  /* ── TOP NAVBAR ── */
  .tbo-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 clamp(20px, 3%, 60px);
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 500;
    min-height: 80px;
    gap: 12px;
  }
  .tbo-nav.scrolled {
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }

  /* Logo */
  .tbo-logo-wrap { display: flex; align-items: center; flex-shrink: 0; padding-left: 60px; }
  .tbo-logo-img { height: 100px; width: auto; object-fit: contain; display: block; }

  /* Nav links */
  .tbo-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    margin-right: 16px;
  }
  .nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    color: #444;
    padding: 6px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .nav-link:hover { color: #ff6600; background: #fff5f0; }
  .nav-link.active { color: #ff6600; font-weight: 600; }
  .nav-link .chevron {
    display: inline-block;
    width: 0; height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4.5px solid currentColor;
    margin-top: 1px;
  }

  /* Nav right */
  .tbo-nav-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .already-reg { font-size: 0.82rem; color: #888; white-space: nowrap; }
  .already-reg .sign-in-btn {
    color: #003399;
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    text-decoration: none;
    padding: 0;
  }
  .already-reg .sign-in-btn:hover { text-decoration: underline; }
  .btn-book {
    background: #ff6600;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 24px;
    font-size: 1.0rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-book:hover { background: #e05500; transform: scale(1.03); }

  /* ── SEARCH BAR SECTION — below nav, above hero ── */
  .tbo-search-section {
    background: #fff;
    padding: 16px clamp(20px, 3%, 60px);
    border-bottom: 1px solid #f0f0f0;
  }

  /* ── EXPANDED TEXT SEARCH BAR ── */
  .expanded-search-bar {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 10px 0 22px;
    border: 2px solid #ff6600;
    border-radius: 50px;
    background: #fff;
    box-shadow: 0 6px 28px rgba(255,102,0,0.18);
    overflow: hidden;
    width: 50%;
    margin: 0 auto;
    animation: expandIn .28s cubic-bezier(.34,1.3,.64,1) both;
  }
  @keyframes expandIn {
    from { opacity: 0; transform: scaleX(0.95); }
    to   { opacity: 1; transform: scaleX(1); }
  }
  .expanded-search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.05rem;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    background: transparent;
    padding: 0 14px 0 0;
  }
  .expanded-search-input::placeholder { color: #aaa; font-size: 1rem; }

  .exp-icon-btn {
    width: 42px; height: 42px;
    border-radius: 50%;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    margin: 0 3px;
    color: #666;
    position: relative;
    flex-shrink: 0;
    transition: background .15s;
  }
  .exp-icon-btn svg { width: 19px; height: 19px; }
  .exp-icon-btn:hover { background: #ffe8d6; color: #ff6600; }

  .exp-close-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    margin-left: 4px;
    font-size: 1rem;
    color: #666;
    flex-shrink: 0;
    transition: background .15s;
  }
  .exp-close-btn:hover { background: #ddd; }

  @keyframes pulse-ring {
    0%  { transform: scale(1); opacity: .7; }
    100%{ transform: scale(1.6); opacity: 0; }
  }
  .voice-active .exp-icon-btn { background: #ffece6 !important; color: #ff3300 !important; }
  .voice-active .exp-icon-btn::before {
    content: '';
    position: absolute; inset: -4px;
    border-radius: 50%;
    border: 2px solid #ff3300;
    animation: pulse-ring 1s ease-out infinite;
  }

  .search-pill {
    display: flex;
    align-items: stretch;
    border: 1.5px solid #e4e4e4;
    border-radius: 50px;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.09);
    overflow: visible;
    position: relative;
    width: 100%;
    height: 60px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .search-pill:hover { box-shadow: 0 4px 22px rgba(0,0,0,0.13); }
  .search-pill.active { box-shadow: 0 6px 28px rgba(0,0,0,0.15); border-color: transparent; }

  .pill-section {
    flex: 1;
    padding: 0 20px;
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
    right: 0; top: 18%; bottom: 18%;
    width: 1px;
    background: #e0e0e0;
  }
  .pill-section:last-of-type::after { display: none; }
  .pill-section:hover { background: #f7f7f7; }
  .pill-section.open { background: #fff; border-radius: 50px; box-shadow: 0 0 0 2px #ff6600; z-index: 2; }

  .pill-label {
    font-size: 0.68rem;
    font-weight: 800;
    color: #111;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .pill-label-chevron {
    display: inline-block;
    width: 0; height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 4px solid #666;
  }
  .pill-value { font-size: 0.88rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top: 2px; }
  .pill-value.placeholder { color: #aaa; }

  /* Search buttons on right side of pill */
  .pill-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px 0 4px;
    flex-shrink: 0;
    margin-left: 40px;
  }

  .pill-icon-btn {
    background: #f5f5f5;
    border: none;
    cursor: pointer;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .pill-icon-btn:hover { background: #ffe0cc; color: #ff6600; }
  .pill-icon-btn svg { width: 18px; height: 18px; }

  .pill-search-btn {
    background: #ff6600;
    color: #fff;
    border: none;
    padding: 10px 26px;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .pill-search-btn:hover { background: #e05500; transform: scale(1.03); }

  /* ── DROPDOWNS ── */
  .dropdown-overlay { position: fixed; inset: 0; z-index: 400; }
  .dropdown-panel {
    position: absolute;
    top: calc(100% + 10px);
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    z-index: 600;
    animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
    overflow: hidden;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

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
  .cal-day.offer { color: #b71c1c; font-weight: 700; }
  .cal-day.offer::before {
    content: '';
    position: absolute;
    top: 5px;
    right: 5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e53935;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.85);
  }
  .cal-day.offer.best::before { background: #c62828; }
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
  .when-go-label { font-size: 0.84rem; font-weight: 700; color: #111; margin-bottom: 9px; }
  .month-cards-scroll { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; }
  .month-cards-scroll::-webkit-scrollbar { height: 3px; }
  .month-cards-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  .month-card { flex-shrink: 0; width: 78px; border-radius: 14px; border: 1.5px solid #e4e4e4; padding: 9px 5px; text-align: center; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans',sans-serif; }
  .month-card .mc-emoji { font-size: 1.25rem; }
  .month-card .mc-month { font-size: 0.74rem; font-weight: 600; color: #333; margin-top: 3px; }
  .month-card .mc-year { font-size: 0.6rem; color: #aaa; }
  .month-card.active { border-color: #111; background: #f8f8f8; }

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

  .dropdown-footer { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-top: 1px solid #f0f0f0; }
  .btn-clear { background: none; border: none; font-size: 0.78rem; font-weight: 600; text-decoration: underline; cursor: pointer; color: #555; font-family: 'DM Sans',sans-serif; }
  .btn-apply { background: linear-gradient(135deg,#ff6600,#ff3366); color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; box-shadow: 0 4px 14px rgba(255,80,50,0.4); transition: transform 0.15s; }
  .btn-apply:hover { transform: scale(1.04); }

  /* ── PRODUCTS DROPDOWN in nav ── */
  .products-nav-wrap { position: relative; }
  .products-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.07);
    z-index: 600;
    padding: 10px;
    min-width: 220px;
    animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .product-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 13px; cursor: pointer; transition: background 0.15s; }
  .product-item:hover { background: #fff5f0; }
  .product-item-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
  .product-item-icon.flights  { background: #fff0e6; }
  .product-item-icon.hotels   { background: #e8f0ff; }
  .product-item-icon.cabs     { background: #e8fff0; }
  .product-item-icon.carrental{ background: #fdf0ff; }
  .product-item-text { display: flex; flex-direction: column; }
  .product-item-name { font-size: 0.88rem; font-weight: 700; color: #111; }
  .product-item-desc { font-size: 0.68rem; color: #999; margin-top: 1px; }
  .product-item:hover .product-item-name { color: #ff6600; }

  /* Solutions dropdown */
  .solutions-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.16);
    z-index: 600;
    padding: 10px;
    min-width: 200px;
    animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .sol-item { padding: 10px 14px; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: #333; transition: background 0.15s; }
  .sol-item:hover { background: #fff5f0; color: #ff6600; }

  /* ── HERO ── */
  .tbo-hero-section {
    min-height: calc(100vh - 80px - 101px);
    display: flex;
    align-items: flex-start;
    background: #fff;
  }
  .tbo-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-start;
    padding: clamp(20px, 3vw, 40px) clamp(20px, 3%, 60px) clamp(40px, 5vw, 72px);
    gap: clamp(24px, 4vw, 72px);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .hero-text { display: flex; flex-direction: column; }

  .hero-title {
    font-size: clamp(2rem, 3.8vw, 3.4rem);
    font-weight: 800;
    color: #6f6e6e;
    line-height: 1.15;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: -0.5px;
  }
  .hero-title .red-dot { color: #ff3300; }

  .hero-body {
    font-size: clamp(0.88rem, 1.1vw, 1.02rem);
    color: #555;
    text-align: justify;
    text-justify: inter-word;
    line-height: 1.78;
    margin-top: 22px;
  }

  .register-label {
    font-size: 1rem;
    color: #2a2a2a;
    font-weight: 700;
    margin-top: 28px;
    margin-bottom: 14px;
  }

  .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-become, .btn-agent {
    border: none;
    padding: 13px 28px;
    border-radius: 28px;
    font-size: clamp(0.82rem, 1.0vw, 0.95rem);
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.22s ease;
  }
  .btn-become { background: #003399; color: #fff; }
  .btn-become:hover { background: #002277; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,51,153,0.3); }
  .btn-agent { background: #ff6600; color: #fff; }
  .btn-agent:hover { background: #e05500; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(255,102,0,0.35); }

  /* Hero image/video */
  .hero-media-wrap {
    border-radius: 24px;
    overflow: hidden;
    aspect-ratio: 4/3;
    background: #eee;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    position: relative;
    width: 100%;
    max-width: 600px;
    align-self: flex-start;
    margin-top: 4px;
  }
  .hero-media-wrap video,
  .hero-media-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hero-media-label {
    position: absolute;
    bottom: 18px;
    left: 18px;
    background: rgba(0,0,0,0.45);
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 10px;
    backdrop-filter: blur(6px);
  }

  /* ── NUMBERS ── */
  .tbo-numbers { text-align: center; padding: clamp(40px,5vw,80px) clamp(24px,4%,80px); background: #ffffff; }
  .tbo-numbers h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; margin-bottom: 40px; font-family: 'Playfair Display',serif; }
  .stats-row { display: flex; justify-content: center; gap: clamp(40px,8vw,140px); flex-wrap: wrap; }
  .stat-item { display: flex; flex-direction: column; align-items: center; }
  .stat-num { font-size: clamp(2rem,4.5vw,3.2rem); font-weight: 700; color: #0059b3; line-height: 1; font-family: 'Playfair Display',serif; }
  .stat-label { font-size: clamp(0.78rem,1.1vw,0.92rem); color: #666; margin-top: 8px; font-weight: 500; }

  /* BRANDS MARQUEE */
  .tbo-our-brands { padding: clamp(36px,5vw,64px) 0; text-align: center; background: #fff; }
  .tbo-our-brands h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; margin-bottom: 32px; font-family: 'Playfair Display',serif; }
  .brands-marquee-wrap { position: relative; width: 100%; overflow: hidden; }
  .brands-marquee-wrap::before,.brands-marquee-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 90px; z-index: 2; pointer-events: none; }
  .brands-marquee-wrap::before { left: 0; background: linear-gradient(to right,#fff,transparent); }
  .brands-marquee-wrap::after  { right: 0; background: linear-gradient(to left,#fff,transparent); }
  .brands-marquee-track { display: flex; align-items: center; gap: 64px; width: max-content; animation: marquee-scroll 22s linear infinite; padding: 6px 0; }
  .brands-marquee-track:hover { animation-play-state: paused; }
  @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .brand-logo-img { height: clamp(34px,4vw,56px); width: auto; max-width: 160px; object-fit: contain; filter: grayscale(30%); opacity: 0.8; transition: filter 0.3s, opacity 0.3s, transform 0.3s; }
  .brand-logo-img:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.1); }

  /* VALUE */
  .tbo-value { padding: clamp(40px,5vw,80px) clamp(24px,4%,80px); background: #ffffff; }
  .tbo-value h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 24px; font-family: 'Playfair Display',serif; }
  .value-tabs { display: flex; justify-content: center; gap: clamp(18px,4vw,60px); border-bottom: 2px solid #ddd; flex-wrap: wrap; }
  .value-tab { background: none; border: none; cursor: pointer; font-size: clamp(0.84rem,1.2vw,1rem); font-weight: 600; color: #777; padding: 9px 5px; position: relative; transition: color 0.2s; white-space: nowrap; font-family: 'DM Sans',sans-serif; }
  .value-tab.active { color: #ff6600; }
  .value-tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: #ff6600; border-radius: 2px 2px 0 0; }
  .value-content-area { display: grid; grid-template-columns: auto 1fr; gap: clamp(24px,4vw,64px); align-items: flex-start; max-width: 1300px; margin: 36px auto 0; width: 100%; }
  .value-blob-img { width: clamp(180px,24vw,340px); height: clamp(180px,24vw,340px); object-fit: cover; border-radius: 50% 40% 50% 40%; flex-shrink: 0; box-shadow: 0 6px 32px rgba(0,0,0,0.14); }
  .value-scroll-container { overflow: hidden; }
  .value-scroll-area { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; padding-right: 12px; }
  .value-scroll-area::-webkit-scrollbar { width: 4px; }
  .value-scroll-area::-webkit-scrollbar-track { background: #eee; border-radius: 4px; }
  .value-scroll-area::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
  .value-point { display: flex; gap: 14px; align-items: flex-start; }
  .vp-dot { width: 10px; height: 10px; border-radius: 50%; background: #ff3300; margin-top: 6px; flex-shrink: 0; }
  .vp-title { font-weight: 700; font-size: clamp(0.88rem,1.2vw,1.02rem); color: #1a1a1a; }
  .vp-desc  { font-size: clamp(0.78rem,1vw,0.88rem); color: #666; line-height: 1.68; margin-top: 5px; }

  /* PARTNER BRANDS */
  .tbo-partner-brands { padding: clamp(40px,5vw,80px) clamp(24px,4%,80px); text-align: center; }
  .tbo-partner-brands h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; margin-bottom: 32px; font-family: 'Playfair Display',serif; }
  .partner-row { display: flex; justify-content: center; align-items: center; gap: clamp(28px,5vw,80px); flex-wrap: wrap; }
  .hilton-box { border: 2px solid #1c1c1c; padding: 6px 18px; font-size: clamp(1rem,1.6vw,1.3rem); font-weight: 800; letter-spacing: 2px; color: #1c1c1c; white-space: nowrap; }
  .expedia-wrap { display: flex; flex-direction: column; align-items: flex-start; }
  .expedia-top { font-size: clamp(1rem,1.6vw,1.3rem); font-weight: 700; color: #1c1c1c; display: flex; align-items: center; gap: 6px; }
  .expedia-sub { font-size: 0.6rem; color: #666; letter-spacing: 0.6px; margin-left: 20px; }

  /* GROWTH STORIES */
  .tbo-growth { padding: clamp(40px,5vw,80px) 0; text-align: center; }
  .tbo-growth h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; margin-bottom: 28px; font-family: 'Playfair Display',serif; }
  .slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .slider-viewport { overflow: hidden; }
  .slider-track { display: flex; gap: 18px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .growth-card { flex-shrink: 0; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 16px rgba(0,0,0,0.14); transition: transform 0.2s, box-shadow 0.2s; }
  .growth-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.2); }
  .gc-video-wrap { position: relative; height: clamp(130px,16vw,190px); overflow: hidden; background: #111; }
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
  .gc-name { font-size: clamp(0.72rem,1.1vw,0.86rem); font-weight: 700; }
  .gc-org  { font-size: clamp(0.62rem,0.95vw,0.76rem); opacity: 0.88; margin-top: 2px; }
  .slider-arrow, .awards-arrow { background: #fff; border: 1.5px solid #ddd; border-radius: 50%; width: 40px; height: 40px; min-width: 40px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.2s; color: #444; margin: 0 9px; }
  .slider-arrow:hover, .awards-arrow:hover { background: #ff6600; border-color: #ff6600; color: #fff; transform: scale(1.1); }
  .slider-arrow:disabled, .awards-arrow:disabled { opacity: 0.28; cursor: default; transform: none; }
  .growth-dots, .awards-dots { display: flex; justify-content: center; gap: 7px; margin-top: 18px; }
  .gdot, .adot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; cursor: pointer; border: none; padding: 0; transition: all 0.2s; }
  .gdot.active, .adot.active { background: #ff6600; transform: scale(1.3); }

  /* AWARDS */
  .tbo-awards { padding: clamp(40px,5vw,80px) 0; text-align: center; background: #ffffff; }
  .tbo-awards h2 { font-size: clamp(1.3rem,2.6vw,2rem); font-weight: 700; color: #1a1a1a; margin-bottom: 32px; font-family: 'Playfair Display',serif; }
  .awards-slider-wrapper { display: flex; align-items: center; justify-content: center; }
  .awards-viewport { overflow: hidden; }
  .awards-track { display: flex; gap: 22px; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
  .award-item { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .award-img { width: 100%; max-width: 120px; aspect-ratio: 1; object-fit: contain; transition: transform 0.25s; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.13)); }
  .award-item:hover .award-img { transform: scale(1.12); }
  .award-label { font-size: clamp(0.58rem,0.9vw,0.72rem); color: #666; text-align: center; line-height: 1.45; }

  /* FOOTER */
  .tbo-footer { background: #003380; color: #ccc; padding: 22px clamp(24px,4%,80px) 16px; }
  .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .footer-links { display: flex; gap: 0; flex-wrap: wrap; align-items: center; }
  .footer-links a { color: #ccc; font-size: clamp(0.62rem,0.95vw,0.78rem); text-decoration: none; padding: 2px 8px; transition: color 0.2s; white-space: nowrap; }
  .footer-links a:hover { color: #fff; }
  .footer-sep { color: #556; }
  .footer-social { display: flex; gap: 8px; }
  .footer-si { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.74rem; color: #fff; cursor: pointer; font-weight: 700; transition: background 0.2s; }
  .footer-si:hover { background: rgba(255,255,255,0.28); }
  .footer-copy { font-size: 0.66rem; color: #99a; text-align: center; margin-top: 10px; }

  /* RESPONSIVE */
  @media (max-width: 992px) {
    .tbo-hero { grid-template-columns: 1fr; text-align: center; }
    .hero-btns { justify-content: center; }
    .hero-media-wrap { justify-self: center; max-width: 100%; }
    .value-content-area { grid-template-columns: 1fr; justify-items: center; }
    .value-blob-img { width: 220px; height: 220px; }
    .tbo-nav-links { display: none; }
  }
  @media (max-width: 640px) {
    .stats-row { gap: 22px; }
    .footer-inner { flex-direction: column; align-items: flex-start; }
    .value-tabs { gap: 10px; }
    .dropdown-panel { left: 8px !important; right: 8px; transform: none !important; }
    .when-dropdown, .where-dropdown, .who-dropdown, .budget-dropdown, .type-dropdown { width: 100%; }
    .flex-stay-options { flex-direction: column; }
  }
`;

/* ─── DATA ─── */
const destinations = [
  { city: "Dubai", country: "UAE", emoji: "\uD83C\uDFD9\uFE0F", recent: true, tags: ["city", "luxury", "shopping"] },
  { city: "Paris", country: "France", emoji: "\uD83D\uDDFC", recent: true, tags: ["city", "heritage", "romance"] },
  { city: "Bali", country: "Indonesia", emoji: "\uD83C\uDF34", tags: ["beach", "wellness", "adventure"] },
  { city: "New York", country: "USA", emoji: "\uD83D\uDDFD", tags: ["city", "shopping"] },
  { city: "Tokyo", country: "Japan", emoji: "\u26E9\uFE0F", tags: ["city", "heritage"] },
  { city: "London", country: "UK", emoji: "\uD83C\uDFA1", tags: ["city", "heritage"] },
  { city: "Bangkok", country: "Thailand", emoji: "\uD83C\uDFEF", tags: ["city", "wellness"] },
  { city: "Singapore", country: "Singapore", emoji: "\uD83E\uDD81", tags: ["city", "family"] },
  { city: "Sydney", country: "Australia", emoji: "\uD83E\uDD98", tags: ["city", "beach"] },
  { city: "Maldives", country: "Maldives", emoji: "\uD83C\uDFDD\uFE0F", tags: ["beach", "luxury"] },
  { city: "Istanbul", country: "Turkey", emoji: "\uD83D\uDD4C", tags: ["heritage", "city"] },
  { city: "Rome", country: "Italy", emoji: "\uD83C\uDFDB\uFE0F", tags: ["heritage", "city"] },
  { city: "Goa", country: "India", emoji: "\uD83C\uDFD6\uFE0F", tags: ["beach", "nightlife", "adventure"] },
  { city: "Kochi", country: "India", emoji: "\uD83C\uDF34", tags: ["beach", "wellness"] },
  { city: "Andaman", country: "India", emoji: "\uD83E\uDEB8", tags: ["beach", "adventure"] },
  { city: "Manali", country: "India", emoji: "\u26F0\uFE0F", tags: ["mountains", "adventure"] },
  { city: "Rishikesh", country: "India", emoji: "\uD83D\uDEF6\uFE0F", tags: ["mountains", "adventure", "wellness"] },
  { city: "Jaipur", country: "India", emoji: "\uD83C\uDFF0", tags: ["heritage", "city"] },
  { city: "Varanasi", country: "India", emoji: "\uD83D\uDD49\uFE0F", tags: ["religious", "heritage"] },
];
const THEME_ALIASES = {
  beach: ["beach", "sea", "island", "coast"],
  mountains: ["mountain", "hill", "trek", "snow"],
  city: ["city", "urban", "shopping"],
  heritage: ["heritage", "history", "fort", "culture"],
  religious: ["religious", "temple", "pilgrim", "spiritual"],
  adventure: ["adventure", "hiking", "rafting", "safari"],
  wellness: ["wellness", "relax", "yoga", "spa"],
};
const IMAGE_THEME_HINTS = {
  beach: ["beach", "sea", "island", "coast", "ocean", "sunset", "sand"],
  mountains: ["mountain", "hill", "snow", "trek", "forest"],
  city: ["city", "urban", "street", "skyline"],
  heritage: ["fort", "palace", "heritage", "temple"],
};
const FLIGHT_ROUTES = {
  goa: { from: { code: "DEL", city: "New Delhi" }, to: { code: "GOI", city: "Goa" } },
  mumbai: { from: { code: "DEL", city: "New Delhi" }, to: { code: "BOM", city: "Mumbai" } },
  delhi: { from: { code: "BOM", city: "Mumbai" }, to: { code: "DEL", city: "New Delhi" } },
  bangalore: { from: { code: "DEL", city: "New Delhi" }, to: { code: "BLR", city: "Bangalore" } },
  kochi: { from: { code: "DEL", city: "New Delhi" }, to: { code: "COK", city: "Kochi" } },
};
const TRAVEL_TYPES = [
  { id: "mountains", label: "Mountains", icon: "⛰️" },
  { id: "beach", label: "Beach", icon: "🏖️" },
  { id: "religious", label: "Religious", icon: "🕌" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "city", label: "City Tour", icon: "🌆" },
  { id: "wildlife", label: "Wildlife", icon: "🦁" },
  { id: "cruise", label: "Cruise", icon: "🛳️" },
  { id: "heritage", label: "Heritage", icon: "🏛️" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
];
const BUDGET_OPTIONS = [
  { id: "budget", label: "Budget", range: "Up to ₹30,000", icon: "🪙" },
  { id: "standard", label: "Standard", range: "₹30,000 – ₹80,000", icon: "💳" },
  { id: "premium", label: "Premium", range: "₹80,000 – ₹1,50,000", icon: "💎" },
  { id: "luxury", label: "Luxury", range: "₹1,50,000+", icon: "👑" },
];
const PRODUCTS = [
  { id: "flights", name: "Flights", desc: "Domestic & international", icon: "✈️", colorClass: "flights" },
  { id: "hotels", name: "Hotels", desc: "1M+ properties worldwide", icon: "🏨", colorClass: "hotels" },
  { id: "cabs", name: "Cabs", desc: "Airport & city transfers", icon: "🚕", colorClass: "cabs" },
  { id: "carrental", name: "Car Rental", desc: "Self-drive at your pace", icon: "🚗", colorClass: "carrental" },
];
const SOLUTIONS = ["Travel Buyers", "Travel Suppliers", "Travelpreneurs", "API Solutions"];
const MONTHS_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_EMOJIS = ["❄️","🌸","🌧️","🌷","☀️","🏖️","🌞","🌻","🍂","🎃","🍁","🎄"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function formatDate(d) { if (!d) return ""; return `${MONTHS_LIST[d.getMonth()]} ${d.getDate()}`; }
function addMonths(date, n) { const d = new Date(date); d.setMonth(d.getMonth() + n); return d; }
function normalizeText(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function getOfferScore(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  return ((y * 13 + m * 7 + d * 17) % 100);
}
function getOfferType(dateObj) {
  const score = getOfferScore(dateObj);
  if (score < 7) return "best";
  if (score < 18) return "offer";
  return null;
}

function Calendar({ year, month, startDate, endDate, hoverDate, onSelect, onHover, showPrev, showNext, onPrev, onNext }) {
  const days = getDaysInMonth(year, month), firstDay = getFirstDayOfMonth(year, month);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  function getClasses(d) {
    if (!d) return "cal-day disabled";
    const dt = new Date(year, month, d); dt.setHours(0, 0, 0, 0);
    if (dt < today) return "cal-day disabled";
    let cls = "cal-day";
    const offerType = getOfferType(dt);
    if (startDate && endDate) {
      const s = new Date(startDate); s.setHours(0,0,0,0);
      const e = new Date(endDate); e.setHours(0,0,0,0);
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
    if (offerType) cls += offerType === "best" ? " offer best" : " offer";
    return cls;
  }
  return (
    <div className="cal-month">
      <div className="cal-month-header">
        {showPrev ? <button className="cal-nav-btn" onClick={onPrev}>‹</button> : <div style={{width:27}}/>}
        <span className="cal-month-name">{MONTHS_LIST[month]} {year}</span>
        {showNext ? <button className="cal-nav-btn" onClick={onNext}>›</button> : <div style={{width:27}}/>}
      </div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={getClasses(d)}
            onClick={() => d && onSelect(new Date(year, month, d))}
            onMouseEnter={() => d && onHover && onHover(new Date(year, month, d))}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleSelector({ duration, onChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const R = 80, CX = 100, CY = 100, min = 1, max = 12;
  const angle = ((duration - min) / (max - min)) * 300 - 150;
  const rad = a => (a * Math.PI) / 180;
  const thumbX = CX + R * Math.cos(rad(angle - 90));
  const thumbY = CY + R * Math.sin(rad(angle - 90));
  const arcStart = rad(-90 - 150);
  const arcEnd = rad(angle - 90);
  const startX = CX + R * Math.cos(arcStart), startY = CY + R * Math.sin(arcStart);
  const endX = CX + R * Math.cos(arcEnd), endY = CY + R * Math.sin(arcEnd);
  const largeArc = angle + 150 > 180 ? 1 : 0;
  function getA(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const cX = e.touches ? e.touches[0].clientX : e.clientX, cY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(cY - cy, cX - cx) * (180 / Math.PI) + 90;
  }
  function handleMove(e) {
    if (!dragging.current) return;
    let a = getA(e); a = Math.max(-150, Math.min(150, a));
    onChange(Math.max(min, Math.min(max, Math.round(((a + 150) / 300) * (max - min) + min))));
  }
  return (
    <div className="circle-selector" onMouseMove={handleMove} onMouseUp={() => { dragging.current = false; }} onTouchMove={handleMove} onTouchEnd={() => { dragging.current = false; }}>
      <svg ref={svgRef} viewBox="0 0 200 200" className="circle-svg" width="185" height="185">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(2*Math.PI*R*300)/360} ${2*Math.PI*R}`}
          strokeDashoffset={`${(2*Math.PI*R*-30)/360}`} style={{transformOrigin:"100px 100px"}}/>
        {duration > min && <path d={`M ${startX} ${startY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`} fill="none" stroke="url(#grad)" strokeWidth="12" strokeLinecap="round"/>}
        <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff6600"/><stop offset="100%" stopColor="#ff3366"/></linearGradient></defs>
        <circle cx={thumbX} cy={thumbY} r="14" fill="url(#grad)" style={{cursor:"grab",filter:"drop-shadow(0 2px 6px rgba(255,80,50,0.5))"}}
          onMouseDown={() => { dragging.current = true; }} onTouchStart={() => { dragging.current = true; }}/>
        <text x={thumbX} y={thumbY} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="700">{duration}</text>
      </svg>
      <div className="circle-selector-label">
        <div className="circle-duration">{duration}</div>
        <div className="circle-unit">{duration === 1 ? "month" : "months"}</div>
      </div>
    </div>
  );
}

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
  { name: "Dinesh Poojary", org: "Travel Agent", info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/Dinesh-Poojary.mp4" },
  { name: "Gautam Vij", org: "KBS Tours and Travels, India", info: "blue-info", video: "https://www.tbo.com/img/testimonials/agent/Gautam-Vij.mp4" },
  { name: "Sebastian Sierra", org: "Travel Agent", info: "green-info", video: "https://www.tbo.com/img/testimonials/agent/Sebastian-Sierra.mp4" },
  { name: "Stuart Lee", org: "Travel Agent", info: "tan-info", video: "https://www.tbo.com/img/testimonials/agent/Stuart-Lee.mp4" },
  { name: "UAE Agent", org: "UAE", info: "orange-info", video: "https://www.tbo.com/img/testimonials/agent/UAEAgenta.mp4" },
  { name: "Mr. Kuljit Singh Hayer", org: "Universal Travels, India", info: "green-info", video: "https://www.tbo.com/img/testimonials/agent/KuljitSingh.mp4" },
  { name: "Fortun Plumley", org: "Travel Agent", info: "blue-info", video: "https://www.tbo.com/img/testimonials/agent/Fortun-PlumLey.mp4" },
];
const awards = [
  { img: "https://www.tbo.com/img/awards/TWMGold_Award_2024.png", label: "TWM Gold Award 2024" },
  { img: "https://www.tbo.com/img/awards/BDD_B2B_campaign.png", label: "Best Data Driven B2B Campaign" },
  { img: "https://www.tbo.com/img/awards/BTDC_Y_2024.png", label: "Best Travel Distribution Company 2024" },
  { img: "https://www.tbo.com/img/awards/EoTYAward_2024.png", label: "Entrepreneur of the Year 2024" },
  { img: "https://www.tbo.com/img/awards/OTM_of_the_year.png", label: "OTM of the Year" },
  { img: "https://www.tbo.com/img/awards/MEB_B2B_Travel_Portal_2025.png", label: "Middle East's Best B2B Travel Portal 2025" },
  { img: "https://www.tbo.com/img/awards/LAB_B2B_Travel_Provider_2025.png", label: "Latin America's Best B2B Travel Provider 2025" },
  { img: "https://www.tbo.com/img/awards/ttm.jpg", label: "TTM Award" },
];
const brandLogos = [
  { src: "https://www.tbo.com/img/logos/sabre-min.png", alt: "Sabre" },
  { src: "https://www.tbo.com/img/brands/bookabed-min.png", alt: "Bookabed" },
  { src: "https://www.tbo.com/img/brands/zamzamlogo-min.png", alt: "Zamzam" },
  { src: "https://www.tbo.com/img/brands/jumbonline-min.png", alt: "JumbOnline" },
  { src: "https://www.tbo.com/img/brands/paxes-min.png", alt: "PAXES" },
  { src: "https://www.tbo.com/img/brands/kizanlogo-min.png", alt: "Kizan" },
  { src: "https://www.tbo.com/img/brands/tboacademy-min.png", alt: "TBO Academy" },
  { src: "https://www.tbo.com/img/brands/classic-vacations.png", alt: "Classic Vacations" },
];
const footerLinks = ["Home","About Us","Careers","Privacy Policy","Terms and Conditions","Sanctions Policy","Investors","Media","Contact Us"];

function useSliderSizes() {
  const [sizes, setSizes] = useState({ cardW: 210, visibleCards: 4, awardW: 130, visibleAwards: 5 });
  useEffect(() => {
    function calc() {
      const W = window.innerWidth;
      let vc, cw, va, aw;
      if (W < 480) { vc = 1; cw = Math.floor(W * 0.86); va = 2; aw = Math.floor((W * 0.86 - 22) / 2); }
      else if (W < 640) { vc = 2; cw = Math.floor((W * 0.86 - 18) / 2); va = 3; aw = Math.floor((W * 0.86 - 44) / 3); }
      else if (W < 1000) { vc = 3; cw = Math.floor((W * 0.86 - 36) / 3); va = 4; aw = Math.floor((W * 0.86 - 66) / 4); }
      else { vc = 4; cw = Math.min(260, Math.floor((W * 0.82 - 54) / 4)); va = 5; aw = Math.min(150, Math.floor((W * 0.82 - 88) / 5)); }
      setSizes({ cardW: cw, visibleCards: vc, awardW: aw, visibleAwards: va });
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return sizes;
}

export default function TBOHomepage() {
  const { isLoggedIn, user, persona, requireAuth, setShowRegister, setShowLogin, logout } = useAuth();
  const navigate = useNavigate();

  // Search expanded
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Search
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
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
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetSlider, setBudgetSlider] = useState(50);

  // Nav dropdowns
  const [productsOpen, setProductsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const productsRef = useRef(null);
  const solutionsRef = useRef(null);

  // Sections
  const [activeTab, setActiveTab] = useState("Travel buyers");
  const [playingIdx, setPlayingIdx] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [awardIdx, setAwardIdx] = useState(0);
  const [awardPaused, setAwardPaused] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const searchRef = useRef(null);
  const videoRefs = useState(() => stories.map(() => ({ current: null })))[0];
  const { cardW, visibleCards, awardW, visibleAwards } = useSliderSizes();
  const GAP = 18, AWARD_GAP = 22;
  const maxSlide = Math.max(0, stories.length - visibleCards);
  const maxAward = Math.max(0, awards.length - visibleAwards);

  useEffect(() => {
    function onScroll() { setNavScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handle(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpenPanel(null);
        if (searchExpanded) {
          setSearchExpanded(false);
          setSearchQuery("");
          stopVoiceSearch();
        }
      }
      if (productsRef.current && !productsRef.current.contains(e.target)) setProductsOpen(false);
      if (solutionsRef.current && !solutionsRef.current.contains(e.target)) setSolutionsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [searchExpanded]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
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
    if (playingIdx !== null && playingIdx !== i && videoRefs[playingIdx].current) videoRefs[playingIdx].current.pause();
    setPlayingIdx(i);
  };

  const normalizedDestQuery = normalizeText(destQuery);
  const matchedTheme = Object.entries(THEME_ALIASES).find(([, keys]) =>
    keys.some((key) => normalizedDestQuery.includes(key))
  )?.[0];
  const filtered = normalizedDestQuery
    ? destinations.filter((d) => {
        const text = normalizeText(`${d.city} ${d.country}`);
        if (text.includes(normalizedDestQuery)) return true;
        if (matchedTheme && Array.isArray(d.tags) && d.tags.includes(matchedTheme)) return true;
        return false;
      })
    : destinations;
  const typeFiltered = selectedTypes.length
    ? filtered.filter((d) => Array.isArray(d.tags) && selectedTypes.some((t) => d.tags.includes(t)))
    : filtered;
  const recents = typeFiltered.filter(d => d.recent), others = typeFiltered.filter(d => !d.recent);

  function inferTheme(text) {
    const normalized = normalizeText(text);
    for (const [theme, keys] of Object.entries(THEME_ALIASES)) {
      if (keys.some((key) => normalized.includes(key))) return theme;
    }
    return null;
  }

  function inferDestination(text, fallbackTheme = null) {
    const normalized = normalizeText(text);
    const exact = destinations.find((d) => normalized.includes(normalizeText(d.city)));
    if (exact) return exact.city;
    if (fallbackTheme) {
      const themed = destinations.find((d) => Array.isArray(d.tags) && d.tags.includes(fallbackTheme));
      if (themed) return themed.city;
    }
    return "";
  }

  function inferGuestsFromText(text) {
    const normalized = normalizeText(text);
    const totalMatch = normalized.match(/(\d+)\s*(guest|people|person|traveller|traveler)/);
    const adultMatch = normalized.match(/(\d+)\s*adult/);
    const childMatch = normalized.match(/(\d+)\s*child/);
    const infantMatch = normalized.match(/(\d+)\s*infant/);
    const adults = adultMatch ? Number(adultMatch[1]) : (totalMatch ? Number(totalMatch[1]) : guests.adults);
    const children = childMatch ? Number(childMatch[1]) : guests.children;
    const infants = infantMatch ? Number(infantMatch[1]) : guests.infants;
    return {
      adults: Math.max(1, Math.min(16, Number.isFinite(adults) ? adults : 1)),
      children: Math.max(0, Math.min(16, Number.isFinite(children) ? children : 0)),
      infants: Math.max(0, Math.min(16, Number.isFinite(infants) ? infants : 0)),
      pets: guests.pets,
    };
  }

  function applyBudgetFromText(text) {
    const normalized = normalizeText(text);
    const lakhMatch = normalized.match(/(\d+(\.\d+)?)\s*lakh/);
    const kMatch = normalized.match(/(\d+)\s*k/);
    const plainMatch = normalized.match(/(?:under|below|max|budget)\s*(\d{4,7})/);
    let value = null;
    if (lakhMatch) value = Number(lakhMatch[1]) * 100000;
    else if (kMatch) value = Number(kMatch[1]) * 1000;
    else if (plainMatch) value = Number(plainMatch[1]);
    if (!value) return;

    const slider = Math.max(0, Math.min(100, Math.round(value / 5000)));
    setBudgetSlider(slider);
    if (value <= 30000) setSelectedBudget("budget");
    else if (value <= 80000) setSelectedBudget("standard");
    else if (value <= 150000) setSelectedBudget("premium");
    else setSelectedBudget("luxury");
  }

  function applyNaturalLanguageQuery(text) {
    const normalized = normalizeText(text);
    const theme = inferTheme(normalized);
    const inferredDestination = inferDestination(normalized, theme);
    if (inferredDestination) setDestination(inferredDestination);
    if (theme && TRAVEL_TYPES.some((t) => t.id === theme)) {
      setSelectedTypes((prev) => (prev.includes(theme) ? prev : [...prev, theme]));
    }
    const nextGuests = inferGuestsFromText(normalized);
    setGuests(nextGuests);
    applyBudgetFromText(normalized);
  }

  function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const spoken = event?.results?.[0]?.[0]?.transcript || "";
      setSearchQuery(spoken);
      applyNaturalLanguageQuery(spoken);
      setIsListening(false);
      handleRedirectClick(spoken);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
  }

  function stopVoiceSearch() {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }

  function handleImageSearchFile(file) {
    if (!file) return;
    const name = normalizeText(file.name);
    let matched = null;
    for (const [theme, keys] of Object.entries(IMAGE_THEME_HINTS)) {
      if (keys.some((k) => name.includes(k))) {
        matched = theme;
        break;
      }
    }
    if (!matched) matched = "beach";
    setSelectedTypes((prev) => (prev.includes(matched) ? prev : [...prev, matched]));
    const suggested = inferDestination(name, matched);
    if (suggested) setDestination(suggested);
    setSearchQuery(file.name.replace(/\.[^/.]+$/, ""));
    handleRedirectClick(file.name);
  }

  function handleDateSelect(date) {
    if (!startDate || (startDate && endDate)) { setStartDate(date); setEndDate(null); setHoverDate(null); }
    else { if (date < startDate) { setStartDate(date); setEndDate(null); } else setEndDate(date); }
  }
  function whenValue() {
    if (whenTab === "Dates" && startDate) {
      if (endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
      return formatDate(startDate);
    }
    if (whenTab === "Months") return `${formatDate(new Date())} – ${formatDate(addMonths(new Date(), monthsDuration))}`;
    if (whenTab === "Flexible" && stayType && selectedMonths.length > 0) return `${stayType} · ${selectedMonths.length} mo`;
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
  function typeValue() {
    if (!selectedTypes.length) return null;
    if (selectedTypes.length === 1) return TRAVEL_TYPES.find(t => t.id === selectedTypes[0])?.label;
    return `${selectedTypes.length} types`;
  }
  function budgetValue() { return selectedBudget ? BUDGET_OPTIONS.find(b => b.id === selectedBudget)?.label : null; }
  function toggleType(id) { setSelectedTypes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
  function toggleMonth(key) { setSelectedMonths(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]); }

  const nextM = { y: calMonth.m === 11 ? calMonth.y + 1 : calMonth.y, m: (calMonth.m + 1) % 12 };
  const futureMonths = Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i + 1);
    return { year: d.getFullYear(), month: d.getMonth(), emoji: MONTH_EMOJIS[d.getMonth()] };
  });

  function handleRedirectClick(spokenInput = "") {
    if (!requireAuth()) return;

    const normalizedSpoken = normalizeText(spokenInput || searchQuery);
    const spokenTheme = inferTheme(normalizedSpoken);
    const spokenDestination = inferDestination(normalizedSpoken, spokenTheme);
    const effectiveDestination = spokenDestination || destination || (selectedTypes.includes("beach") ? "Goa" : "");
    const nextGuests = spokenInput ? inferGuestsFromText(normalizedSpoken) : guests;

    if (spokenInput) {
      applyNaturalLanguageQuery(spokenInput);
    } else if (searchQuery) {
      applyNaturalLanguageQuery(searchQuery);
    }

    const payload = {
      source: spokenInput ? "voice" : "manual",
      query: spokenInput || searchQuery || "",
      destination: effectiveDestination,
      whenTab,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      selectedTypes,
      guests: nextGuests,
      budget: {
        selectedBudget,
        maxValue: Math.round(budgetSlider * 5000),
      },
    };
    localStorage.setItem("voyagehack.smartQuery", JSON.stringify(payload));
    localStorage.setItem("homepageSearch", JSON.stringify({
      destination: effectiveDestination || "Anywhere",
      startDate: payload.startDate,
      endDate: payload.endDate,
      adults: nextGuests.adults,
      children: nextGuests.children,
      infants: nextGuests.infants,
      budgetMax: payload.budget.maxValue,
      selectedTypes,
    }));

    if (effectiveDestination) {
      setDestination(effectiveDestination);
    }

    const destinationKey = normalizeText(effectiveDestination).split(" ")[0];
    const flightRoute = FLIGHT_ROUTES[destinationKey];
    if (flightRoute) {
      localStorage.setItem("voyagehack.flight.prefill", JSON.stringify({
        from: flightRoute.from,
        to: flightRoute.to,
        depDate: startDate ? startDate.toISOString() : null,
        retDate: endDate ? endDate.toISOString() : null,
        tripType: endDate ? "roundtrip" : "oneway",
        cabin: "Economy",
        pax: {
          adults: nextGuests.adults,
          children: nextGuests.children,
          infants: nextGuests.infants,
        },
      }));
    }

    const queryForService = normalizeText(`${spokenInput || ""} ${searchQuery || ""}`);
    const service =
      (queryForService.includes("flight") || queryForService.includes("air")) ? "flights" :
      (queryForService.includes("hotel") || queryForService.includes("stay")) ? "hotels" :
      (queryForService.includes("cab")) ? "cabs" :
      (queryForService.includes("car rental") || queryForService.includes("self drive")) ? "carrental" :
      null;
    const routeMap = { flights: "/flights", hotels: "/hotels", cabs: "/cabs", carrental: "/carrental" };
    if (service && routeMap[service]) {
      navigate(routeMap[service]);
      return;
    }
    if (flightRoute) {
      navigate("/flights");
      return;
    }
    navigate("/results");
  }
  function handleBookNow() {
    if (!requireAuth()) return;
    handleRedirectClick();
  }

  const svWidth = visibleCards * cardW + (visibleCards - 1) * GAP;
  const avWidth = visibleAwards * awardW + (visibleAwards - 1) * AWARD_GAP;

  return (
    <>
      <style>{css}</style>
      <div className="tbo-wrap">

        {/* ── NAVBAR ── */}
        <nav className={`tbo-nav${navScrolled ? " scrolled" : ""}`}>
          {/* Logo */}
          <div className="tbo-logo-wrap">
            <img src="https://www.tbo.com/img/LogoRamadan.gif" alt="tbo.com – Travel Simplified" className="tbo-logo-img" />
          </div>

          {/* Nav links */}
          <div className="tbo-nav-links">
            <button className="nav-link active">Home</button>

            {/* Products dropdown */}
            <div className="products-nav-wrap" ref={productsRef} style={{position:"relative"}}
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button
                className={`nav-link${productsOpen ? " active" : ""}`}
                onClick={() => setProductsOpen(o => !o)}
              >
                Products <span className="chevron" />
              </button>
              {productsOpen && (
                <>
                  {/* invisible bridge to prevent gap closing dropdown */}
                  <div style={{position:"absolute",top:"100%",left:0,right:0,height:14,zIndex:599}} />
                  <div className="products-dropdown" style={{top:"calc(100% + 14px)"}}>
                    {PRODUCTS.map(p => {
                      const routeMap = { flights: "/flights", hotels: "/hotels", cabs: "/cabs", carrental: "/carrental" };
                      return (
                        <div key={p.id} className="product-item" role="button"
                          onClick={() => { setProductsOpen(false); navigate(routeMap[p.id]); }}>
                          <div className={`product-item-icon ${p.colorClass}`}>{p.icon}</div>
                          <div className="product-item-text">
                            <div className="product-item-name">{p.name}</div>
                            <div className="product-item-desc">{p.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Solutions dropdown */}
            <div className="products-nav-wrap" ref={solutionsRef} style={{position:"relative"}}>
              <button
                className={`nav-link${solutionsOpen ? " active" : ""}`}
                onMouseEnter={() => setSolutionsOpen(true)}
                onMouseLeave={() => setSolutionsOpen(false)}
                onClick={() => setSolutionsOpen(o => !o)}
              >
                Solutions <span className="chevron" />
              </button>
              {solutionsOpen && (
                <div className="solutions-dropdown"
                  onMouseEnter={() => setSolutionsOpen(true)}
                  onMouseLeave={() => setSolutionsOpen(false)}>
                  {SOLUTIONS.map(s => (
                    <div key={s} className="sol-item" onClick={() => setSolutionsOpen(false)}>{s}</div>
                  ))}
                </div>
              )}
            </div>

            <button className="nav-link">TBO Cares</button>
            <button className="nav-link">Careers</button>
            <button className="nav-link">About Us</button>
            <button className="nav-link">Help</button>
          </div>

          {/* Nav right */}
          <div className="tbo-nav-right">
            {isLoggedIn ? (
              <>
                <span className="already-reg" style={{color:"#22c55e",fontWeight:600}}>
                  ✓ {user?.name ? user.name.split(" ")[0] : "Logged in"}{persona ? ` · ${persona}` : ""}
                </span>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn-book" onClick={handleBookNow}>Book Now</button>
                  <button className="btn-book" style={{background:"#e0e0e0",color:"#555"}} onClick={logout}>Logout</button>
                </div>
              </>
            ) : (
              <>
                <span className="already-reg">
                  Already Registred?{" "}
                  <button onClick={() => setShowLogin(true)} className="sign-in-btn">Sign in</button>
                </span>
                <button className="btn-book" onClick={() => setShowRegister(true)}>Book Now</button>
              </>
            )}
          </div>
        </nav>

        {/* ── SEARCH BAR — full width below nav ── */}
        <div className="tbo-search-section">
          <div ref={searchRef}>
            {openPanel && !searchExpanded && (
              <div className="dropdown-overlay" onClick={() => setOpenPanel(null)} />
            )}

            {/* ── EXPANDED TEXT SEARCH ── */}
            {searchExpanded ? (
              <div className="expanded-search-bar">
                <input
                  className="expanded-search-input"
                  placeholder="Search destinations, hotels, activities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleRedirectClick(); }}
                  autoFocus
                  aria-label="Search"
                />
                <div className={isListening ? "voice-active" : ""}>
                  <button className="exp-icon-btn" onClick={() => (isListening ? stopVoiceSearch() : startVoiceSearch())} title={isListening ? "Stop" : "Voice search"}>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0014 0"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="9" y1="23" x2="15" y2="23"/>
                    </svg>
                  </button>
                </div>
                <button className="exp-icon-btn" onClick={() => fileInputRef.current?.click()} title="Search by image">
                  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => { const f = e.target.files[0]; handleImageSearchFile(f); }}/>
                <button className="exp-close-btn" onClick={() => { setSearchExpanded(false); setSearchQuery(""); stopVoiceSearch(); }} aria-label="Close search">✕</button>
              </div>
            ) : (
              /* ── PILL SEARCH BAR ── */
              <div className={`search-pill ${openPanel ? "active" : ""}`}>
                {/* TYPE */}
                <div className={`pill-section ${openPanel === "type" ? "open" : ""}`} style={{maxWidth:140}}
                  onClick={() => setOpenPanel(openPanel === "type" ? null : "type")}>
                  <span className="pill-label">TYPE <span className="pill-label-chevron"/></span>
                  <span className={`pill-value ${!typeValue() ? "placeholder" : ""}`}>{typeValue() || "Any type"}</span>
                </div>

                {/* WHERE */}
                <div className={`pill-section ${openPanel === "where" ? "open" : ""}`} style={{maxWidth:165}}
                  onClick={() => setOpenPanel(openPanel === "where" ? null : "where")}>
                  <span className="pill-label">WHERE <span className="pill-label-chevron"/></span>
                  <span className={`pill-value ${!destination ? "placeholder" : ""}`}>{destination || "Destinati..."}</span>
                </div>

                {/* WHEN */}
                <div className={`pill-section ${openPanel === "when" ? "open" : ""}`} style={{maxWidth:155}}
                  onClick={() => setOpenPanel(openPanel === "when" ? null : "when")}>
                  <span className="pill-label">WHEN <span className="pill-label-chevron"/></span>
                  <span className={`pill-value ${!whenValue() ? "placeholder" : ""}`}>{whenValue() || "Add dates"}</span>
                </div>

                {/* WHO */}
                <div className={`pill-section ${openPanel === "who" ? "open" : ""}`} style={{maxWidth:145}}
                  onClick={() => setOpenPanel(openPanel === "who" ? null : "who")}>
                  <span className="pill-label">WHO <span className="pill-label-chevron"/></span>
                  <span className={`pill-value ${!whoValue() ? "placeholder" : ""}`}>{whoValue() || `${guests.adults} guest`}</span>
                </div>

                {/* BUDGET */}
                <div className={`pill-section ${openPanel === "budget" ? "open" : ""}`} style={{maxWidth:130}}
                  onClick={() => setOpenPanel(openPanel === "budget" ? null : "budget")}>
                  <span className="pill-label">BUDGET <span className="pill-label-chevron"/></span>
                  <span className={`pill-value ${!budgetValue() ? "placeholder" : ""}`}>{budgetValue() || "Any"}</span>
                </div>

                {/* Buttons */}
                <div className="pill-buttons">
                  {/* Search icon — expands to full text search */}
                  <button className="pill-icon-btn" onClick={() => { setOpenPanel(null); setSearchExpanded(true); }} aria-label="Text search" title="Search by typing">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </button>
                  {/* Orange Search button — triggers filter search */}
                  <button className="pill-search-btn" onClick={handleRedirectClick}>Search</button>
                </div>

                {/* Dropdowns */}
                {openPanel === "type" && (
                  <div className="dropdown-panel type-dropdown" style={{left:0}}>
                    <div className="type-dropdown-title">Travel Style</div>
                    <div className="type-grid">
                      {TRAVEL_TYPES.map(t => (
                        <div key={t.id} className={`type-card ${selectedTypes.includes(t.id) ? "active" : ""}`} onClick={() => toggleType(t.id)}>
                          <div className="type-card-icon">{t.icon}</div>
                          <div className="type-card-label">{t.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer" style={{marginTop:10}}>
                      <button className="btn-clear" onClick={() => setSelectedTypes([])}>Clear</button>
                      <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}
                {openPanel === "where" && (
                  <div className="dropdown-panel where-dropdown" style={{left:"10%"}}>
                    <input className="where-search-input" placeholder="Search destinations" value={destQuery} onChange={e => setDestQuery(e.target.value)} autoFocus/>
                    <div className="dest-list">
                      {!destQuery && recents.length > 0 && (<>
                        <div className="dest-section-label">Recent searches</div>
                        {recents.map(d => (
                          <div key={d.city} className="dest-item" onClick={() => { setDestination(d.city); setOpenPanel(null); setDestQuery(""); }}>
                            <div className="dest-thumb">{d.emoji}</div>
                            <div><div className="dest-city">{d.city}</div><div className="dest-country">{d.country}</div></div>
                          </div>
                        ))}
                      </>)}
                      <div className="dest-section-label">{destQuery ? "Results" : "Suggested"}</div>
                      {(destQuery ? filtered : others).map(d => (
                        <div key={d.city} className="dest-item" onClick={() => { setDestination(d.city); setOpenPanel(null); setDestQuery(""); }}>
                          <div className="dest-thumb">{d.emoji}</div>
                          <div><div className="dest-city">{d.city}</div><div className="dest-country">{d.country}</div></div>
                        </div>
                      ))}
                      {typeFiltered.length === 0 && <div style={{padding:"12px",color:"#aaa",fontSize:"0.8rem"}}>No results</div>}
                    </div>
                  </div>
                )}
                {openPanel === "when" && (
                  <div className="dropdown-panel when-dropdown" style={{left:"50%",transform:"translateX(-50%)"}}>
                    <div className="when-tabs">
                      {["Dates","Months","Flexible"].map(t => (
                        <button key={t} className={`when-tab ${whenTab === t ? "active" : ""}`} onClick={() => setWhenTab(t)}>{t}</button>
                      ))}
                    </div>
                    <div className="when-body">
                      {whenTab === "Dates" && (<>
                        <div className="cal-container">
                          <Calendar year={calMonth.y} month={calMonth.m} startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate ? setHoverDate : null}
                            showPrev onPrev={() => calMonth.m === 0 ? setCalMonth({y:calMonth.y-1,m:11}) : setCalMonth({y:calMonth.y,m:calMonth.m-1})}/>
                          <Calendar year={nextM.y} month={nextM.m} startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onSelect={handleDateSelect} onHover={!endDate ? setHoverDate : null}
                            showNext onNext={() => calMonth.m === 11 ? setCalMonth({y:calMonth.y+1,m:0}) : setCalMonth({y:calMonth.y,m:calMonth.m+1})}/>
                        </div>
                        <div className="flex-options">
                          {["Exact dates","±1 day","±2 days","±3 days","±7 days","±14 days"].map(f => (
                            <button key={f} className={`flex-chip ${flexDays === f ? "active" : ""}`} onClick={() => setFlexDays(f)}>{f}</button>
                          ))}
                        </div>
                      </>)}
                      {whenTab === "Months" && (
                        <div className="months-tab-body">
                          <CircleSelector duration={monthsDuration} onChange={setMonthsDuration}/>
                          <div className="months-range-display">
                            <div className="months-range-text">{formatDate(new Date())} – {formatDate(addMonths(new Date(), monthsDuration))}</div>
                            <div className="months-range-sub">{monthsDuration} month{monthsDuration !== 1 ? "s" : ""} trip</div>
                            <div className="months-hint">Drag the circle handle to adjust</div>
                          </div>
                        </div>
                      )}
                      {whenTab === "Flexible" && (<>
                        <div className="flex-stay-label">How long would you like to stay?</div>
                        <div className="flex-stay-options">
                          {[{name:"Weekend",icon:"🌙",desc:"2–3 nights"},{name:"Week",icon:"☀️",desc:"5–7 nights"},{name:"Month",icon:"📅",desc:"28–31 nights"}].map(s => (
                            <button key={s.name} className={`flex-stay-btn ${stayType === s.name ? "active" : ""}`} onClick={() => setStayType(s.name)}>
                              <span className="stay-icon">{s.icon}</span><span className="stay-name">{s.name}</span><span className="stay-desc">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                        <div className="when-go-label">When do you want to go?</div>
                        <div className="month-cards-scroll">
                          {futureMonths.map((m) => {
                            const key = `${m.year}-${m.month}`;
                            return (
                              <div key={key} className={`month-card ${selectedMonths.includes(key) ? "active" : ""}`} onClick={() => toggleMonth(key)}>
                                <div className="mc-emoji">{m.emoji}</div>
                                <div className="mc-month">{MONTHS_LIST[m.month]}</div>
                                <div className="mc-year">{m.year}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>)}
                    </div>
                    <div className="dropdown-footer">
                      <button className="btn-clear" onClick={() => { setStartDate(null); setEndDate(null); setHoverDate(null); setSelectedMonths([]); setStayType(null); }}>Clear</button>
                      <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}
                {openPanel === "who" && (
                  <div className="dropdown-panel who-dropdown" style={{right:"18%",left:"auto"}}>
                    <div style={{paddingBottom:4}}>
                      {[{key:"adults",label:"Adults",sub:"Ages 13+"},{key:"children",label:"Children",sub:"Ages 2–12"},{key:"infants",label:"Infants",sub:"Under 2"},{key:"pets",label:"Pets",sub:"Assistance animals"}].map(g => (
                        <div className="guest-row" key={g.key}>
                          <div><div className="guest-type">{g.label}</div><div className="guest-age">{g.sub}</div></div>
                          <div className="guest-counter">
                            <button className="guest-btn" disabled={guests[g.key] === 0 || (g.key === "adults" && guests[g.key] <= 1)}
                              onClick={() => setGuests(p => ({...p,[g.key]:Math.max(g.key==="adults"?1:0,p[g.key]-1)}))}>−</button>
                            <span className="guest-count">{guests[g.key]}</span>
                            <button className="guest-btn" disabled={guests[g.key] >= 16}
                              onClick={() => setGuests(p => ({...p,[g.key]:p[g.key]+1}))}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button className="btn-clear" onClick={() => setGuests({adults:1,children:0,infants:0,pets:0})}>Clear</button>
                      <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}
                {openPanel === "budget" && (
                  <div className="dropdown-panel budget-dropdown" style={{right:"5%",left:"auto"}}>
                    <div className="budget-title">Select Budget</div>
                    <div className="budget-options">
                      {BUDGET_OPTIONS.map(b => (
                        <div key={b.id} className={`budget-option ${selectedBudget === b.id ? "active" : ""}`} onClick={() => setSelectedBudget(selectedBudget === b.id ? null : b.id)}>
                          <span className="budget-option-icon">{b.icon}</span>
                          <div className="budget-option-info">
                            <div className="budget-option-label">{b.label}</div>
                            <div className="budget-option-range">{b.range}</div>
                          </div>
                          {selectedBudget === b.id && <div className="budget-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>}
                        </div>
                      ))}
                    </div>
                    <div className="budget-range-label">Or set custom max budget</div>
                    <input type="range" className="budget-slider" min="0" max="100" value={budgetSlider}
                      style={{"--val":budgetSlider+"%"}}
                      onChange={e => { setBudgetSlider(+e.target.value); e.target.style.setProperty("--val",e.target.value+"%"); }}/>
                    <div className="budget-range-values">
                      <span>₹0</span>
                      <span style={{color:"#ff6600",fontWeight:600}}>₹{Math.round(budgetSlider*5000).toLocaleString()}</span>
                      <span>₹5L+</span>
                    </div>
                    <div className="dropdown-footer" style={{marginTop:12}}>
                      <button className="btn-clear" onClick={() => { setSelectedBudget(null); setBudgetSlider(50); }}>Clear</button>
                      <button className="btn-apply" onClick={() => setOpenPanel(null)}>Apply</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="tbo-hero-section">
          <div className="tbo-hero">
            <div className="hero-text">
              <h1 className="hero-title">
                Simplifying Travel<span className="red-dot">.</span><br/>
                Enabling Growth
              </h1>
              <p className="hero-body">
                We are one of the leading global travel distribution platforms, simplifying the travel business for both suppliers and buyers. Our suppliers include hotels, airlines, cruises, car rentals, transfers, and rail services. Our buyers consist of retail and API buyers such as travel agencies, independent travel advisors, and enterprise buyers including tour operators, travel management companies, online travel companies, super-apps, and loyalty apps.
              </p>
              <p className="hero-body" style={{marginTop:14}}>
                Our platform enables seamless transactions, connecting over 159,000 buyers with over 1 million suppliers across 100+ countries.
              </p>
              <p className="register-label">Register with us:</p>
              <div className="hero-btns">
                <button className="btn-become">Become TBO Partner</button>
                <button className="btn-agent">Agent Partner</button>
              </div>
            </div>
            <div className="hero-media-wrap">
              <video src="https://www.tbo.com/img/videos/The-World-of-TBO-Group.mp4?var=300420244" autoPlay muted loop playsInline/>
            </div>
          </div>
        </section>

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

        {/* ── BRANDS MARQUEE ── */}
        <section className="tbo-our-brands">
          <h2>Our brands</h2>
          <div className="brands-marquee-wrap">
            <div className="brands-marquee-track">
              {[...brandLogos,...brandLogos].map((b,i) => <img key={i} src={b.src} alt={b.alt} className="brand-logo-img"/>)}
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
            <img src="https://www.tbo.com/img/travelbuyers.webp" alt="Travel Buyers" className="value-blob-img"/>
            <div className="value-scroll-container">
              <div className="value-scroll-area">
                {valueContent[activeTab].map(p => (
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
            <div className="expedia-wrap">
              <div className="expedia-top"><span style={{color:"#e05500"}}>⬡</span> expedia</div>
              <div className="expedia-sub">group</div>
            </div>
            <div className="hilton-box">Hilton</div>
            <div style={{fontWeight:700,fontSize:"clamp(1rem,1.6vw,1.3rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>Derby</span>Soft</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontWeight:600,fontSize:"clamp(1rem,1.6vw,1.2rem)"}}><span>●</span> Roibos</div>
            <div style={{fontSize:"clamp(1rem,1.6vw,1.2rem)",color:"#1c1c1c"}}><span style={{fontWeight:300}}>ibs</span><span style={{fontWeight:700}}>software</span></div>
          </div>
        </section>

        {/* ── GROWTH STORIES ── */}
        <section className="tbo-growth">
          <h2>Growth Stories</h2>
          <div className="slider-wrapper" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <button className="slider-arrow" onClick={() => setSlideIdx(Math.max(0,slideIdx-1))} disabled={slideIdx===0}>‹</button>
            <div className="slider-viewport" style={{width:svWidth}}>
              <div className="slider-track" style={{transform:`translateX(-${slideIdx*(cardW+GAP)}px)`}}>
                {stories.map((s,i) => (
                  <div className="growth-card" style={{width:cardW}} key={i}>
                    <div className="gc-video-wrap">
                      <video ref={el => { videoRefs[i].current = el; }} src={s.video} preload="metadata" playsInline
                        controls={playingIdx===i} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",background:"#111"}}
                        onPlay={() => handlePlay(i)} onPause={() => { if (playingIdx===i) setPlayingIdx(null); }}/>
                      {playingIdx!==i && (
                        <div className="gc-overlay" onClick={() => { handlePlay(i); videoRefs[i].current?.play(); }}>
                          <div className="gc-play">▶</div>
                        </div>
                      )}
                    </div>
                    <div className={`gc-info ${s.info}`}><div className="gc-name">{s.name}</div><div className="gc-org">{s.org}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <button className="slider-arrow" onClick={() => setSlideIdx(Math.min(maxSlide,slideIdx+1))} disabled={slideIdx>=maxSlide}>›</button>
          </div>
          <div className="growth-dots">
            {Array.from({length:maxSlide+1}).map((_,i) => <button key={i} className={`gdot ${slideIdx===i?"active":""}`} onClick={() => setSlideIdx(i)}/>)}
          </div>
        </section>

        {/* ── AWARDS ── */}
        <section className="tbo-awards">
          <h2>Awards</h2>
          <div className="awards-slider-wrapper" onMouseEnter={() => setAwardPaused(true)} onMouseLeave={() => setAwardPaused(false)}>
            <button className="awards-arrow" onClick={() => setAwardIdx(Math.max(0,awardIdx-1))} disabled={awardIdx===0}>‹</button>
            <div className="awards-viewport" style={{width:avWidth}}>
              <div className="awards-track" style={{transform:`translateX(-${awardIdx*(awardW+AWARD_GAP)}px)`}}>
                {awards.map(a => (
                  <div className="award-item" style={{width:awardW}} key={a.label}>
                    <img src={a.img} alt={a.label} className="award-img"/>
                    <div className="award-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="awards-arrow" onClick={() => setAwardIdx(Math.min(maxAward,awardIdx+1))} disabled={awardIdx>=maxAward}>›</button>
          </div>
          <div className="awards-dots">
            {Array.from({length:maxAward+1}).map((_,i) => <button key={i} className={`adot ${awardIdx===i?"active":""}`} onClick={() => setAwardIdx(i)}/>)}
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

