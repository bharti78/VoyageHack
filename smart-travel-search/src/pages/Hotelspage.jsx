import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════
   BACKEND PROXY  ─  all TBO calls go through here
   ═══════════════════════════════════════════════ */
const API_BASE = "http://localhost:5000/api/hotels";

async function apiPost(endpoint, payload) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Non-JSON response: ${text.slice(0,200)}`); }
  if (json.error) throw new Error(json.error);
  if (json.Status?.Code && json.Status.Code !== 200 && json.Status.Code !== "01") {
    const desc = json.Status?.Description;
    if (desc && !desc.toLowerCase().includes("success")) throw new Error(desc);
  }
  return json;
}

/* ═══════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Sora:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.hp-wrap{font-family:'Plus Jakarta Sans',sans-serif;background:#eef2f7;min-height:100vh;display:flex;flex-direction:column}

/* ── header ── */
.hp-hdr{background:linear-gradient(135deg,#0b3d6e 0%,#0f5298 55%,#1565c0 100%);display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:58px;gap:16px;box-shadow:0 2px 12px rgba(0,0,0,.28);flex-shrink:0}
.hp-logo{display:flex;align-items:baseline;gap:1px;text-decoration:none}
.hp-logo-tbo{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:700;color:#fff}
.hp-logo-hol{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:700;color:#ffd740}
.hp-logo-dot{color:#ffd740;font-size:1.2rem;font-weight:700}
.hp-logo-com{font-size:.7rem;color:rgba(255,255,255,.55);align-self:flex-end;margin-bottom:1px}
.hp-banner{background:linear-gradient(90deg,#e53935,#ff6f00);border-radius:20px;padding:5px 16px;font-size:.7rem;font-weight:700;color:#fff;letter-spacing:.4px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px rgba(229,57,53,.5);display:flex;align-items:center;gap:6px;transition:transform .2s}
.hp-banner:hover{transform:scale(1.04)}
.hp-pulse{width:7px;height:7px;border-radius:50%;background:#fff;animation:blink 1.2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hp-hdr-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
.hp-quot-btn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:5px 12px;color:#fff;font-size:.7rem;font-weight:600;cursor:pointer;position:relative;white-space:nowrap;font-family:inherit}
.hp-badge{background:#e53935;color:#fff;font-size:.6rem;font-weight:800;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:absolute;top:-6px;right:-6px;border:1.5px solid #0f5298}
.hp-hdivider{width:1px;height:24px;background:rgba(255,255,255,.2)}
.hp-uname{color:#fff;font-size:.72rem;font-weight:600}
.hp-uedit{color:rgba(255,255,255,.5);font-size:.62rem;cursor:pointer}
.hp-logout{background:rgba(229,57,53,.2);border:1px solid rgba(229,57,53,.5);color:#ff8a80;font-size:.7rem;font-weight:600;padding:5px 11px;border-radius:6px;cursor:pointer;font-family:inherit;transition:all .2s}
.hp-logout:hover{background:#e53935;color:#fff}

/* ── sub-nav ── */
.hp-nav{background:linear-gradient(90deg,#0b3d6e,#0f5298);display:flex;align-items:center;padding:0 28px;height:60px;gap:4px;box-shadow:0 3px 10px rgba(0,0,0,.2);flex-shrink:0}
.hp-ni{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 16px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.6);font-size:.66rem;font-weight:600;letter-spacing:.3px;text-transform:uppercase;transition:all .2s;border:1px solid transparent;min-width:68px}
.hp-ni:hover{background:rgba(255,255,255,.1);color:#fff}
.hp-ni.act{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.25)}
.hp-ni.act span{color:#ffd740}
.hp-ni svg{width:19px;height:19px}
.hp-back-btn{margin-left:auto;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;padding:5px 13px;border-radius:8px;cursor:pointer;font-size:.7rem;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;transition:background .2s}
.hp-back-btn:hover{background:rgba(255,255,255,.2)}

/* ── content ── */
.hp-content{flex:1;padding:20px 28px 40px;display:flex;flex-direction:column;gap:0;overflow:auto}
.hp-bc{font-size:.73rem;color:#64748b;margin-bottom:14px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.hp-bc .act{color:#0f5298;font-weight:600}
.hp-bc-sep{color:#cbd5e1}

/* ── error ── */
.hp-err{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:13px 16px;display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;animation:fadeIn .2s ease}
.hp-err-txt{font-size:.8rem;color:#7f1d1d;line-height:1.55;flex:1}
.hp-err-x{background:#e53e3e;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;font-family:inherit}

/* ── search box ── */
.hp-sbox{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(15,82,152,.09),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(15,82,152,.08)}
.hp-srow1{display:flex;align-items:flex-end;padding:18px 18px 14px;gap:10px;border-bottom:1px solid #f0f4f8;flex-wrap:wrap}
.hp-srow2{display:flex;align-items:flex-end;padding:12px 18px 16px;gap:10px;flex-wrap:wrap}

/* field */
.hp-f{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.hp-f.city{flex:2;min-width:200px}
.hp-f.dt{flex:0 0 158px}
.hp-f.rm{flex:0 0 212px}
.hp-ff{flex:1;min-width:130px;display:flex;flex-direction:column;gap:4px}
.hp-lbl{font-size:.58rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;padding-left:2px}
.hp-fin{display:flex;align-items:center;gap:8px;background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:10px;padding:9px 12px;transition:all .2s;cursor:pointer;min-height:46px}
.hp-fin:hover{border-color:#0f5298;background:#f0f7ff}
.hp-fin:focus-within{border-color:#0f5298;box-shadow:0 0 0 3px rgba(15,82,152,.08);background:#fff}
.hp-fic{color:#0f5298;flex-shrink:0}
.hp-fic svg{width:17px;height:17px}
.hp-finput{border:none;outline:none;background:transparent;font-size:.86rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.hp-finput::placeholder{color:#a0aec0;font-weight:400}
.hp-fval{font-size:.86rem;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hp-fval.ph{color:#a0aec0;font-weight:400}
.hp-fsub{font-size:.62rem;color:#94a3b8;margin-top:1px}

.hp-ffin{display:flex;align-items:center;gap:7px;background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:8px;padding:7px 10px;cursor:pointer;transition:all .2s;min-height:38px}
.hp-ffin:hover{border-color:#0f5298;background:#f0f7ff}
.hp-ffin:focus-within{border-color:#0f5298;background:#fff}
.hp-ffic{color:#64748b;flex-shrink:0}
.hp-ffic svg{width:14px;height:14px}
.hp-ffval{font-size:.76rem;color:#475569;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.hp-ffval.ph{color:#a0aec0;font-weight:400}
.hp-ffin input{border:none;outline:none;background:transparent;font-size:.76rem;font-weight:500;color:#1e293b;font-family:inherit;width:100%}
.hp-ffin input::placeholder{color:#a0aec0}
.hp-chev svg{width:12px;height:12px;color:#94a3b8}

/* search btn */
.hp-sbtn{flex-shrink:0;background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:12px;padding:0 26px;height:46px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(15,82,152,.35);white-space:nowrap}
.hp-sbtn:hover:not(:disabled){background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,82,152,.45)}
.hp-sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.hp-sbtn svg{width:16px;height:16px}

/* dropdown */
.hp-drop{position:absolute;top:calc(100% + 6px);left:0;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.05);z-index:400;animation:fadeDown .18s ease both;overflow:hidden}
@keyframes fadeDown{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}

/* calendar */
.hp-cal{padding:15px;min-width:275px}
.hp-cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.hp-cal-nav{background:#f0f4f8;border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:#334155;transition:background .15s}
.hp-cal-nav:hover{background:#dbeafe;color:#0f5298}
.hp-cal-mon{font-size:.82rem;font-weight:700;color:#1e293b}
.hp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.hp-dow{font-size:.56rem;font-weight:700;text-align:center;color:#94a3b8;padding:3px;text-transform:uppercase}
.hp-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:.72rem;font-weight:500;color:#334155;transition:all .13s;position:relative}
.hp-day:hover:not(.dis){background:#e8f0fe;color:#0f5298}
.hp-day.dis{color:#d1d5db;cursor:default}
.hp-day.sel{background:#0f5298 !important;color:#fff !important;font-weight:700}
.hp-day.tod::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#0f5298}
.hp-day.tod.sel::after{background:rgba(255,255,255,.7)}

/* rooms dropdown */
.hp-rm-drop{padding:15px;min-width:255px}
.hp-rm-ttl{font-size:.68rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:11px}
.hp-rm-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.hp-rm-lbl{font-size:.8rem;font-weight:600;color:#1e293b}
.hp-rm-sub{font-size:.62rem;color:#94a3b8;margin-top:1px}
.hp-ctr{display:flex;align-items:center;gap:7px}
.hp-ctr-btn{width:27px;height:27px;border-radius:7px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#334155;transition:all .15s;line-height:1}
.hp-ctr-btn:hover:not(:disabled){border-color:#0f5298;color:#0f5298;background:#e8f0fe}
.hp-ctr-btn:disabled{opacity:.3;cursor:default}
.hp-ctr-val{font-size:.88rem;font-weight:700;color:#1e293b;min-width:18px;text-align:center}
.hp-rm-apply{width:100%;margin-top:3px;background:#0f5298;color:#fff;border:none;border-radius:8px;padding:9px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit}

/* simple list dropdown */
.hp-slist{padding:7px;min-width:175px;max-height:260px;overflow-y:auto}
.hp-sitem{padding:8px 11px;border-radius:7px;cursor:pointer;font-size:.78rem;color:#334155;font-weight:500;display:flex;align-items:center;gap:7px;transition:background .14s}
.hp-sitem:hover{background:#f0f7ff;color:#0f5298}
.hp-sitem.act{background:#dbeafe;color:#0f5298;font-weight:700}

/* ── loading ── */
.hp-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;padding:60px 20px}
.hp-spin{width:38px;height:38px;border:3px solid #e2e8f0;border-top-color:#0f5298;border-radius:50%;animation:spin .75s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.hp-load-txt{font-size:.84rem;color:#64748b;font-weight:500;text-align:center}

/* ── results ── */
.hp-res-bar{display:flex;align-items:center;justify-content:space-between;margin:16px 0 11px;flex-wrap:wrap;gap:8px}
.hp-res-ct{font-size:.88rem;font-weight:700;color:#1e293b}
.hp-res-ct span{color:#0f5298}
.hp-sort-wrap{display:flex;align-items:center;gap:7px}
.hp-sort-lbl{font-size:.72rem;color:#64748b}
.hp-sort-sel{border:1.5px solid #e2e8f0;border-radius:8px;padding:5px 9px;font-size:.76rem;font-family:inherit;color:#334155;background:#fff;cursor:pointer;outline:none}

/* hotel card */
.hp-hcard{background:#fff;border-radius:14px;border:1.5px solid #e8f0fb;box-shadow:0 2px 12px rgba(15,82,152,.06);margin-bottom:11px;overflow:hidden;transition:all .2s}
.hp-hcard:hover{box-shadow:0 6px 24px rgba(15,82,152,.14);border-color:#bfdbfe;transform:translateY(-1px)}
.hp-hcard-inner{display:grid;grid-template-columns:190px 1fr 185px;gap:0}
.hp-himg{width:190px;height:145px;object-fit:cover;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;font-size:2.4rem;flex-shrink:0}
.hp-hbody{padding:13px 15px;display:flex;flex-direction:column;gap:5px;min-width:0}
.hp-hname{font-size:.97rem;font-weight:700;color:#1e293b;line-height:1.3}
.hp-hstars{color:#f59e0b;font-size:.72rem;letter-spacing:1px}
.hp-haddr{font-size:.71rem;color:#64748b;display:flex;align-items:center;gap:4px}
.hp-haddr svg{width:11px;height:11px;flex-shrink:0}
.hp-htags{display:flex;gap:5px;flex-wrap:wrap;margin-top:3px}
.hp-htag{background:#f0f9ff;color:#0369a1;font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid #bae6fd}
.hp-havail{font-size:.68rem;color:#16a34a;font-weight:600;margin-top:auto}
.hp-hprice{padding:13px 15px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;border-left:1px solid #f0f4f8}
.hp-plbl{font-size:.62rem;color:#94a3b8;text-transform:uppercase;font-weight:600}
.hp-pval{font-size:1.45rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;line-height:1}
.hp-pcur{font-size:.74rem;font-weight:500;color:#64748b;margin-top:1px}
.hp-pper{font-size:.62rem;color:#94a3b8}
.hp-rbadge{font-size:.6rem;padding:2px 8px;border-radius:20px;font-weight:700}
.hp-rbadge.ref{background:#dcfce7;color:#15803d}
.hp-rbadge.nref{background:#fef9c3;color:#a16207}
.hp-selrm-btn{background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 3px 10px rgba(15,82,152,.3);width:100%}
.hp-selrm-btn:hover{background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px)}

/* ── modal overlay ── */
.hp-modal-bg{position:fixed;inset:0;background:rgba(11,61,110,.5);z-index:800;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)}
.hp-modal{background:#fff;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.25);width:100%;max-width:780px;max-height:92vh;overflow-y:auto;animation:modalIn .24s cubic-bezier(.34,1.56,.64,1)}
@keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(14px)}to{opacity:1;transform:none}}
.hp-mhdr{padding:18px 22px 14px;border-bottom:1px solid #f0f4f8;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.hp-mttl{font-size:1.05rem;font-weight:700;color:#1e293b}
.hp-msub{font-size:.72rem;color:#64748b;margin-top:2px}
.hp-mclose{width:30px;height:30px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:1rem;transition:all .15s;flex-shrink:0}
.hp-mclose:hover{background:#fee2e2;border-color:#fca5a5;color:#e53e3e}
.hp-mbody{padding:18px 22px}
.hp-mftr{padding:14px 22px;border-top:1px solid #f0f4f8;display:flex;align-items:center;justify-content:flex-end;gap:10px}

/* rate cards */
.hp-rcard{border:1.5px solid #e2e8f0;border-radius:12px;padding:13px 15px;margin-bottom:9px;cursor:pointer;transition:all .18s}
.hp-rcard:hover{border-color:#93c5fd;background:#f8fbff}
.hp-rcard.sel{border-color:#0f5298;background:#eff6ff;box-shadow:0 0 0 3px rgba(15,82,152,.1)}
.hp-rcard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.hp-rname{font-size:.86rem;font-weight:700;color:#1e293b}
.hp-rprice{font-size:1.18rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;white-space:nowrap}
.hp-rcur{font-size:.67rem;color:#64748b}
.hp-rtags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.hp-rtag{font-size:.6rem;font-weight:600;padding:2px 7px;border-radius:20px}
.hp-rtag.g{background:#dcfce7;color:#15803d}
.hp-rtag.b{background:#dbeafe;color:#1d4ed8}
.hp-rtag.o{background:#fff7ed;color:#c2410c}
.hp-rcancel{font-size:.66rem;color:#64748b;margin-top:5px}

/* guest form */
.hp-fsec{margin-bottom:18px}
.hp-fsec-ttl{font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:11px;padding-bottom:7px;border-bottom:1px solid #f0f4f8}
.hp-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.hp-ffield{display:flex;flex-direction:column;gap:3px}
.hp-flbl{font-size:.64rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
.hp-finp{border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 11px;font-size:.82rem;font-family:inherit;color:#1e293b;outline:none;transition:border-color .2s;background:#fafcff}
.hp-finp:focus{border-color:#0f5298;box-shadow:0 0 0 3px rgba(15,82,152,.07);background:#fff}
.hp-fsel{border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 11px;font-size:.82rem;font-family:inherit;color:#1e293b;outline:none;background:#fafcff;cursor:pointer}
.hp-fsel:focus{border-color:#0f5298}

/* summary box */
.hp-sumbox{background:#f7fafd;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px}
.hp-sumttl{font-size:.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:9px}
.hp-sumrow{display:flex;justify-content:space-between;align-items:center;font-size:.78rem;color:#475569;margin-bottom:5px}
.hp-sumrow.tot{font-weight:700;color:#1e293b;font-size:.88rem;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:3px}
.hp-sumval{font-weight:600;color:#1e293b;text-align:right;max-width:190px;font-size:.78rem}

/* buttons */
.hp-btn-pri{background:linear-gradient(135deg,#0f5298,#1565c0);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:7px;box-shadow:0 3px 10px rgba(15,82,152,.3)}
.hp-btn-pri:hover:not(:disabled){background:linear-gradient(135deg,#0b3d6e,#0f5298);transform:translateY(-1px)}
.hp-btn-pri:disabled{opacity:.55;cursor:not-allowed;transform:none}
.hp-btn-out{background:#fff;color:#0f5298;border:1.5px solid #bfdbfe;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:7px}
.hp-btn-out:hover{background:#eff6ff}
.hp-btn-red{background:#fee2e2;color:#c53030;border:1.5px solid #fca5a5;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
.hp-btn-red:hover:not(:disabled){background:#e53e3e;color:#fff;border-color:#e53e3e}
.hp-btn-red:disabled{opacity:.5;cursor:not-allowed}

/* confirm page */
.hp-confirm{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(15,82,152,.09);padding:32px 28px;text-align:center;margin-top:14px}
.hp-ck-icon{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 22px rgba(34,197,94,.35)}
.hp-ck-icon svg{width:32px;height:32px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round}
.hp-ck-ttl{font-size:1.28rem;font-weight:800;color:#1e293b;margin-bottom:5px;font-family:'Sora',sans-serif}
.hp-ck-sub{font-size:.82rem;color:#64748b;margin-bottom:20px}
.hp-ref-box{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:11px 20px;display:inline-flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:22px}
.hp-ref-lbl{font-size:.62rem;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.5px}
.hp-ref-val{font-size:1.35rem;font-weight:800;color:#0f5298;font-family:'Sora',sans-serif;letter-spacing:2px}
.hp-ck-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;text-align:left;margin-bottom:22px;max-width:600px;margin-left:auto;margin-right:auto}
.hp-ck-item{background:#f7fafd;border-radius:10px;padding:11px 13px}
.hp-ck-lbl{font-size:.62rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.hp-ck-val{font-size:.84rem;font-weight:600;color:#1e293b}
.hp-ck-acts{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}

/* booking detail table */
.hp-dtbl{width:100%;border-collapse:collapse;margin-top:10px;font-size:.78rem}
.hp-dtbl th{background:#f0f7ff;padding:8px 12px;font-size:.67rem;font-weight:700;color:#475569;text-align:left;text-transform:uppercase;letter-spacing:.4px}
.hp-dtbl td{padding:9px 12px;color:#334155;border-bottom:1px solid #f0f4f8;vertical-align:top;word-break:break-word}
.hp-dtbl tr:hover td{background:#f8fbff}

/* quick stats */
.hp-stats{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
.hp-stat{background:#fff;border-radius:12px;padding:15px 17px;display:flex;align-items:flex-start;gap:11px;box-shadow:0 2px 10px rgba(15,82,152,.07);border:1px solid rgba(15,82,152,.07);cursor:pointer;transition:all .2s}
.hp-stat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(15,82,152,.13)}
.hp-stat-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hp-stat-ic.bl{background:#e8f0fe;color:#0f5298}
.hp-stat-ic.or{background:#fff3e0;color:#e65100}
.hp-stat-ic.gr{background:#e8f5e9;color:#2e7d32}
.hp-stat-ic svg{width:18px;height:18px}
.hp-stat-ttl{font-size:.8rem;font-weight:700;color:#1e293b;margin-bottom:2px}
.hp-stat-desc{font-size:.67rem;color:#64748b}
.hp-stat-n{font-size:1.28rem;font-weight:800;font-family:'Sora',sans-serif;line-height:1;margin-top:5px;color:#0f5298}

@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.fade{animation:fadeIn .22s ease}

/* city autocomplete */
.hp-city-dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.05);z-index:400;animation:fadeDown .18s ease both;max-height:260px;overflow-y:auto;padding:5px}
.hp-city-item{padding:9px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:background .14s}
.hp-city-item:hover{background:#f0f7ff}
.hp-city-item .name{font-size:.82rem;font-weight:600;color:#1e293b}
.hp-city-item .code{font-size:.62rem;color:#94a3b8;font-weight:500;flex-shrink:0}
.hp-city-sel{display:flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:.62rem;font-weight:700;padding:2px 8px;border-radius:20px;flex-shrink:0;white-space:nowrap}
.hp-city-loading{padding:14px;text-align:center;font-size:.78rem;color:#94a3b8}

@media(max-width:900px){
  .hp-hcard-inner{grid-template-columns:140px 1fr}
  .hp-hprice{grid-column:1/-1;border-left:none;border-top:1px solid #f0f4f8;flex-direction:row;align-items:center}
  .hp-stats{grid-template-columns:1fr 1fr}
  .hp-ck-grid{grid-template-columns:1fr}
  .hp-fgrid{grid-template-columns:1fr}
}
@media(max-width:640px){
  .hp-banner{display:none}
  .hp-content{padding:12px 14px 32px}
  .hp-hcard-inner{grid-template-columns:1fr}
  .hp-himg{width:100%;height:130px;border-radius:0}
  .hp-stats{grid-template-columns:1fr}
}
`;

/* ═══════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const NAT = [
  {code:"IN",label:"Indian"},{code:"US",label:"American"},{code:"GB",label:"British"},
  {code:"AU",label:"Australian"},{code:"AE",label:"UAE"},{code:"CA",label:"Canadian"},
  {code:"DE",label:"German"},{code:"FR",label:"French"},{code:"SG",label:"Singaporean"},
  {code:"MY",label:"Malaysian"},{code:"NZ",label:"New Zealander"},{code:"ZA",label:"South African"},
];
const DEST_COUNTRIES = [
  {code:"IN",label:"India"},{code:"AE",label:"UAE"},{code:"TH",label:"Thailand"},
  {code:"SG",label:"Singapore"},{code:"MY",label:"Malaysia"},{code:"ID",label:"Indonesia"},
  {code:"GB",label:"United Kingdom"},{code:"US",label:"United States"},{code:"AU",label:"Australia"},
  {code:"FR",label:"France"},{code:"DE",label:"Germany"},{code:"CA",label:"Canada"},
  {code:"NZ",label:"New Zealand"},{code:"LK",label:"Sri Lanka"},{code:"NP",label:"Nepal"},
];
const STAR_OPTS = [
  {label:"All Stars",val:null},
  {label:"5 Star",val:[5]},
  {label:"4 Star or More",val:[4,5]},
  {label:"3 Star or More",val:[3,4,5]},
  {label:"2 Star",val:[2]},
];

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function fmtDisp(d){ if(!d) return null; return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`; }
function fmtApi(d){ if(!d) return ""; const m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0"); return `${d.getFullYear()}-${m}-${dd}`; }
function nights(a,b){ if(!a||!b) return 0; return Math.round((b-a)/864e5); }
function stars(n){ n=Math.max(0,Math.min(5,n||0)); return "★".repeat(n)+"☆".repeat(5-n); }

/* ═══════════════════════════════════════════════
   MINI CALENDAR
   ═══════════════════════════════════════════════ */
function MiniCal({value, onChange, onClose, minDate}){
  const today=new Date(); today.setHours(0,0,0,0);
  const init=value||today;
  const [v,setV]=useState({y:init.getFullYear(),m:init.getMonth()});
  const days=new Date(v.y,v.m+1,0).getDate();
  const first=new Date(v.y,v.m,1).getDay();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  function pick(d){
    if(!d) return;
    const dt=new Date(v.y,v.m,d); dt.setHours(0,0,0,0);
    if(dt<(minDate||today)) return;
    onChange(dt); onClose();
  }
  function cls(d){
    if(!d) return "hp-day dis";
    const dt=new Date(v.y,v.m,d); dt.setHours(0,0,0,0);
    let c="hp-day";
    if(dt<(minDate||today)) c+=" dis";
    else {
      if(value && dt.toDateString()===value.toDateString()) c+=" sel";
      if(dt.toDateString()===today.toDateString()) c+=" tod";
    }
    return c;
  }
  return (
    <div className="hp-cal">
      <div className="hp-cal-hdr">
        <button className="hp-cal-nav" onClick={()=>setV(v=>v.m===0?{y:v.y-1,m:11}:{y:v.y,m:v.m-1})}>‹</button>
        <span className="hp-cal-mon">{MONTHS[v.m]} {v.y}</span>
        <button className="hp-cal-nav" onClick={()=>setV(v=>v.m===11?{y:v.y+1,m:0}:{y:v.y,m:v.m+1})}>›</button>
      </div>
      <div className="hp-cal-grid">
        {DOW.map(d=><div key={d} className="hp-dow">{d}</div>)}
        {cells.map((d,i)=><div key={i} className={cls(d)} onClick={()=>pick(d)}>{d}</div>)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function HotelsPage({onBack}){

  /* ── search form state ── */
  const [cityQuery,setCityQuery]   = useState("");
  const [cityId,setCityId]         = useState("");
  const [cityName,setCityName]     = useState("");
  const [allCities,setAllCities]   = useState([]);
  const [cityLoading,setCityLoading] = useState(false);
  const [showCityDD,setShowCityDD] = useState(false);
  const [destCountry,setDestCountry] = useState("IN");
  const [hotelCodes,setHotelCodes] = useState("");
  const [showHotelCodes,setShowHotelCodes] = useState(false);
  const [checkIn,setCI]    = useState(null);
  const [checkOut,setCO]   = useState(null);
  const [roomCfg,setRC]    = useState({count:1,adults:2,children:0});
  const [nat,setNat]       = useState("IN");
  const [starF,setStarF]   = useState(null);
  const [budget,setBudget] = useState("");
  const [drop,setDrop]     = useState(null);

  /* ── api / page state ── */
  const [page,setPage]       = useState("home");   // home | results | prebook | confirm | detail
  const [loading,setLoading] = useState(false);
  const [apiErr,setApiErr]   = useState("");

  /* ── results ── */
  const [searchId,setSearchId] = useState("");
  const [hotels,setHotels]     = useState([]);
  const [sortBy,setSortBy]     = useState("price_asc");

  /* ── prebook / booking ── */
  const [selHotel,setSelHotel]   = useState(null);
  const [prebookRes,setPrebookRes] = useState(null);
  const [selRateIdx,setSelRateIdx] = useState(0);
  const [guest,setGuest] = useState({title:"Mr",first:"",last:"",email:"",phone:"",addr:"",city2:"",country:"IN"});

  /* ── post-booking ── */
  const [bookingRef,setBookingRef]     = useState("");
  const [bookingDetail,setBookingDetail] = useState(null);
  const [cancelMsg,setCancelMsg]         = useState("");

  const boxRef = useRef(null);
  const cityDDRef = useRef(null);

  /* fetch city list when destination country changes */
  useEffect(()=>{
    let cancelled = false;
    setCityLoading(true);
    setCityId(""); setCityName(""); setCityQuery("");
    (async ()=>{
      try {
        const data = await apiPost("cities",{countryCode:destCountry});
        if(!cancelled) setAllCities(data.cities||[]);
      } catch(e){ console.error("City list fetch failed:",e); }
      finally { if(!cancelled) setCityLoading(false); }
    })();
    return ()=>{ cancelled=true; };
  },[destCountry]);

  /* close dropdowns on outside click */
  useEffect(()=>{
    const h=e=>{
      if(boxRef.current&&!boxRef.current.contains(e.target)) setDrop(null);
      if(cityDDRef.current&&!cityDDRef.current.contains(e.target)) setShowCityDD(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const tog = name => setDrop(o=>o===name?null:name);

  /* client-side city filtering */
  const filteredCities = cityQuery.trim()
    ? allCities.filter(c=>c.CityName?.toLowerCase().includes(cityQuery.toLowerCase())).slice(0,20)
    : [];

  /* ── derived ── */
  const nt = nights(checkIn,checkOut);
  const roomLbl = `${roomCfg.count} Room${roomCfg.count>1?"s":""} (${roomCfg.adults} Adult${roomCfg.adults>1?"s":""},  ${roomCfg.children} Child${roomCfg.children!==1?"ren":""})`;
  const starLbl = STAR_OPTS.find(s=>JSON.stringify(s.val)===JSON.stringify(starF))?.label||"All Stars";
  const natLbl  = NAT.find(n=>n.code===nat)?.label||nat;

  /* ══════════════════════
     SEARCH
     ══════════════════════ */
  async function doSearch(){
    if(!cityId){ setApiErr("Please select a city from the suggestions."); return; }
    if(!checkIn||!checkOut){ setApiErr("Please select check-in and check-out dates."); return; }
    setApiErr(""); setLoading(true); setHotels([]); setPage("results");
    try{
      const body={
        CheckIn   : fmtApi(checkIn),
        CheckOut  : fmtApi(checkOut),
        HotelCodes: hotelCodes,
        GuestNationality: nat,
        PaxRooms  : Array.from({length:roomCfg.count},()=>({
          Adults      : roomCfg.adults,
          Children    : roomCfg.children,
          ChildrenAges: roomCfg.children>0?Array(roomCfg.children).fill(8):[],
        })),
        ResponseTime       : 23,
        IsDetailedResponse : true,
        Filters: {
          Refundable: false,
          NoOfRooms : roomCfg.count,
          ...(starF?{StarRating:starF}:{}),
          ...(budget?{MaxPrice:parseFloat(budget)}:{}),
        },
        CityId      : cityId,
        CountryCode : destCountry,
      };
      const data = await apiPost("search", body);
      setSearchId(data.SearchId||"");
      const list = data.Hotels||data.HotelResult||[];
      setHotels(list);
      if(list.length===0) setApiErr("No hotels found. Try a different city, dates, or relax the filters.");
    }catch(e){
      setApiErr(`Search failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     PREBOOK
     ══════════════════════ */
  async function doPrebook(hotel){
    setSelHotel(hotel); setPrebookRes(null); setSelRateIdx(0);
    setApiErr(""); setLoading(true); setPage("prebook");
    try{
      const bcode = hotel.Rooms?.[0]?.BookingCode || hotel.BookingCode || "";
      const data  = await apiPost("prebook",{
        SearchId   : searchId,
        HotelCode  : hotel.HotelCode,
        BookingCode: bcode,
      });
      setPrebookRes(data);
    }catch(e){
      setApiErr(`PreBook failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     BOOK
     ══════════════════════ */
  async function doBook(){
    if(!guest.first||!guest.last||!guest.email||!guest.phone){
      setApiErr("Please fill in all required guest fields (First Name, Last Name, Email, Phone)."); return;
    }
    setApiErr(""); setLoading(true);

    /* pick chosen rate's booking code */
    const rates    = prebookRes?.HotelResult?.Rooms || selHotel?.Rooms || [];
    const rate     = rates[selRateIdx] || rates[0] || selHotel || {};
    const bcode    = prebookRes?.BookingCode || rate.BookingCode || selHotel?.BookingCode || "";

    const roomsPayload = [{
      RoomIndex   : rate.RoomIndex||1,
      RoomTypeCode: rate.RoomTypeCode||"",
      RoomTypeName: rate.RoomTypeName||"Standard",
      RatePlanCode: rate.RatePlanCode||"",
      BookingCode : rate.BookingCode||bcode,
      Guests      : {
        Adults  :[{Title:guest.title,FirstName:guest.first,LastName:guest.last}],
        Children:[],
      },
    }];

    try{
      const data = await apiPost("book",{
        BookingCode      : bcode,
        ClientReferenceId: `TBO_${Date.now()}`,
        BookingType      : "Voucher",
        Rooms            : roomsPayload,
        CustomerDetails  : [{
          CustomerNames:[{Title:guest.title,FirstName:guest.first,LastName:guest.last,Type:"1"}],
          EmailId      : guest.email,
          PhoneNumber  : guest.phone,
          BillingDetails:{
            Address   : guest.addr||"NA",
            City      : guest.city2||"NA",
            PostalCode: "000000",
            countryCode: guest.country||"IN",
          },
        }],
      });
      const ref = data.BookingRefNo||data.ConfirmationNumber||data.BookingId||`REF${Date.now()}`;
      setBookingRef(ref);
      setPage("confirm");
    }catch(e){
      setApiErr(`Booking failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     BOOKING DETAIL
     ══════════════════════ */
  async function doDetail(){
    setApiErr(""); setLoading(true);
    try{
      const data = await apiPost("detail",{BookingRefNo:bookingRef});
      setBookingDetail(data.BookingDetail||data);
      setPage("detail");
    }catch(e){
      setApiErr(`Could not fetch booking detail: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     CANCEL
     ══════════════════════ */
  async function doCancel(){
    if(!window.confirm("Are you sure you want to cancel this booking? This action may be irreversible.")) return;
    setApiErr(""); setLoading(true); setCancelMsg("");
    try{
      const data = await apiPost("cancel",{BookingRefNo:bookingRef,RequestType:"4"});
      const ok   = data.Status?.Code==="01"
                || String(data.Status?.Description||"").toLowerCase().includes("success")
                || String(data.Status?.Description||"").toLowerCase().includes("cancel");
      if(ok){
        setCancelMsg("✅ Booking cancelled successfully.");
        setTimeout(()=>{ setPage("home"); setBookingRef(""); setBookingDetail(null); setCancelMsg(""); },3000);
      } else {
        setApiErr(`Cancellation response: ${data.Status?.Description||JSON.stringify(data)}`);
      }
    }catch(e){
      setApiErr(`Cancellation failed: ${e.message}`);
    }finally{ setLoading(false); }
  }

  /* ══════════════════════
     SORT results
     ══════════════════════ */
  const sorted = [...hotels].sort((a,b)=>{
    const pa = a.Price?.OfferedPrice||0, pb = b.Price?.OfferedPrice||0;
    if(sortBy==="price_asc")  return pa-pb;
    if(sortBy==="price_desc") return pb-pa;
    if(sortBy==="stars")      return (b.HotelRating||0)-(a.HotelRating||0);
    if(sortBy==="name")       return (a.HotelName||"").localeCompare(b.HotelName||"");
    return 0;
  });

  /* ══════════════════════
     PREBOOK rate list
     ══════════════════════ */
  const rateList = prebookRes?.HotelResult?.Rooms || selHotel?.Rooms || [];
  const pickedRate = rateList[selRateIdx] || rateList[0] || selHotel || {};
  const totalPrice = pickedRate?.Price?.OfferedPrice || selHotel?.Price?.OfferedPrice || 0;

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="hp-wrap">

        {/* ── HEADER ── */}
        <header className="hp-hdr">
          <div className="hp-logo">
            <span className="hp-logo-tbo">tbo</span>
            <span className="hp-logo-hol">holidays</span>
            <span className="hp-logo-dot">.</span>
            <span className="hp-logo-com">com</span>
          </div>

          <div className="hp-banner">
            <div className="hp-pulse"/>&nbsp;🏆 TBO BOOK N WIN BONANZA – Click Here
          </div>

          <div className="hp-hdr-right">
            <button className="hp-quot-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              </svg>
              My Quotations
              <span className="hp-badge">2</span>
            </button>
            <div className="hp-hdivider"/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
              <span className="hp-uname">Agent User</span>
              <span className="hp-uedit">✏ Edit Profile</span>
            </div>
            <button className="hp-logout">Logout</button>
          </div>
        </header>

        {/* ── SUB-NAV ── */}
        <nav className="hp-nav">
          {[
            {lbl:"Hotels",act:true,ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
            {lbl:"Queues",ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>},
            {lbl:"Accounts",ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>},
            {lbl:"Reports",ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
            {lbl:"Admin",ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 4.93"/><path d="M19.07 19.07A10 10 0 0 0 4.93 19.07"/></svg>},
          ].map(item=>(
            <div key={item.lbl} className={`hp-ni${item.act?" act":""}`}>
              {item.ic}<span>{item.lbl}</span>
            </div>
          ))}
          {onBack && <button className="hp-back-btn" onClick={onBack}>← Back to TBO</button>}
        </nav>

        {/* ── CONTENT ── */}
        <div className="hp-content">

          {/* breadcrumb */}
          <div className="hp-bc">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="act" style={{cursor:"pointer"}} onClick={()=>setPage("home")}>Hotels</span>
            {page==="results"  && <><span className="hp-bc-sep">›</span><span className="act">Search Results</span></>}
            {page==="prebook"  && <><span className="hp-bc-sep">›</span><span style={{cursor:"pointer"}} onClick={()=>setPage("results")}>Results</span><span className="hp-bc-sep">›</span><span className="act">Select Rate</span></>}
            {page==="confirm"  && <><span className="hp-bc-sep">›</span><span className="act">Confirmation</span></>}
            {page==="detail"   && <><span className="hp-bc-sep">›</span><span style={{cursor:"pointer"}} onClick={()=>setPage("confirm")}>Confirmation</span><span className="hp-bc-sep">›</span><span className="act">Booking Detail</span></>}
          </div>

          {/* error banner */}
          {apiErr && (
            <div className="hp-err">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="hp-err-txt">{apiErr}</div>
              <button className="hp-err-x" onClick={()=>setApiErr("")}>✕</button>
            </div>
          )}

          {/* cancel success msg */}
          {cancelMsg && (
            <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:".82rem",color:"#14532d",fontWeight:600}}>
              {cancelMsg}
            </div>
          )}

          {/* ══════════════════════════════
              SEARCH FORM (shown on home + results)
              ══════════════════════════════ */}
          {(page==="home"||page==="results") && (
            <div className="hp-sbox" ref={boxRef}>
              {/* row 1 */}
              <div className="hp-srow1">

                {/* city with autocomplete */}
                <div className="hp-f city" style={{position:"relative"}} ref={cityDDRef}>
                  <div className="hp-lbl">City Name</div>
                  <div className="hp-fin">
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <input className="hp-finput"
                      placeholder={cityLoading?"Loading cities…":"Type city name…"}
                      value={cityQuery}
                      onChange={e=>{setCityQuery(e.target.value);setCityId("");setCityName("");setShowCityDD(true);}}
                      onFocus={()=>cityQuery.trim()&&filteredCities.length>0&&setShowCityDD(true)}
                      onKeyDown={e=>e.key==="Enter"&&(cityId?doSearch():filteredCities.length===1&&(setCityId(filteredCities[0].CityId),setCityName(filteredCities[0].CityName),setCityQuery(filteredCities[0].CityName),setShowCityDD(false)))}
                    />
                    {cityId && <span className="hp-city-sel">✓ {cityName}</span>}
                  </div>
                  {showCityDD && cityQuery.trim() && (
                    <div className="hp-city-dd">
                      {filteredCities.length>0 ? filteredCities.map(c=>(
                        <div key={c.CityId} className="hp-city-item" onClick={()=>{
                          setCityId(c.CityId);
                          setCityName(c.CityName);
                          setCityQuery(c.CityName);
                          setShowCityDD(false);
                        }}>
                          <span className="name">{c.CityName}</span>
                          <span className="code">ID: {c.CityId}</span>
                        </div>
                      )) : (
                        <div className="hp-city-loading">
                          {cityLoading ? "Loading…" : "No cities found. Try a different spelling."}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* hotel codes - optional field for specific hotel search */}
                <div className="hp-f" style={{flex:1,minWidth:200}}>
                  <div className="hp-lbl">Hotel Codes (Optional)</div>
                  <div className="hp-fin">
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <input 
                      className="hp-finput"
                      placeholder="Enter hotel codes (comma separated)"
                      value={hotelCodes}
                      onChange={e=>setHotelCodes(e.target.value)}
                    />
                  </div>
                  {hotelCodes && <span className="hp-city-sel">🏨 {hotelCodes.split(',').length} hotel{hotelCodes.split(',').length>1?'s':''}</span>}
                </div>

                {/* check-in */}
                <div className="hp-f dt" style={{position:"relative"}}>
                  <div className="hp-lbl">Check-In</div>
                  <div className="hp-fin" onClick={()=>tog("ci")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <div className={`hp-fval${!checkIn?" ph":""}`}>{checkIn?fmtDisp(checkIn):"Select date"}</div>
                      {checkIn&&<div className="hp-fsub">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][checkIn.getDay()]}</div>}
                    </div>
                  </div>
                  {drop==="ci" && <div className="hp-drop"><MiniCal value={checkIn} onChange={d=>{setCI(d);if(checkOut&&d>=checkOut)setCO(null);}} onClose={()=>setDrop(null)}/></div>}
                </div>

                {/* check-out */}
                <div className="hp-f dt" style={{position:"relative"}}>
                  <div className="hp-lbl">Check-Out</div>
                  <div className="hp-fin" onClick={()=>tog("co")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <div className={`hp-fval${!checkOut?" ph":""}`}>{checkOut?fmtDisp(checkOut):"Select date"}</div>
                      {checkIn&&checkOut&&<div className="hp-fsub">{nt} night{nt!==1?"s":""}</div>}
                    </div>
                  </div>
                  {drop==="co" && <div className="hp-drop"><MiniCal value={checkOut} onChange={d=>{setCO(d);setDrop(null);}} onClose={()=>setDrop(null)} minDate={checkIn||new Date()}/></div>}
                </div>

                {/* rooms */}
                <div className="hp-f rm" style={{position:"relative"}}>
                  <div className="hp-lbl">Rooms & Guests</div>
                  <div className="hp-fin" onClick={()=>tog("rm")}>
                    <span className="hp-fic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </span>
                    <div className="hp-fval">{roomLbl}</div>
                    <svg style={{marginLeft:"auto",flexShrink:0}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {drop==="rm" && (
                    <div className="hp-drop" style={{minWidth:255}}>
                      <div className="hp-rm-drop">
                        <div className="hp-rm-ttl">Rooms & Guests</div>
                        {[{k:"count",lbl:"Rooms",min:1,max:8},{k:"adults",lbl:"Adults",sub:"per room",min:1,max:6},{k:"children",lbl:"Children",sub:"per room",min:0,max:4}].map(g=>(
                          <div className="hp-rm-row" key={g.k}>
                            <div><div className="hp-rm-lbl">{g.lbl}</div>{g.sub&&<div className="hp-rm-sub">{g.sub}</div>}</div>
                            <div className="hp-ctr">
                              <button className="hp-ctr-btn" disabled={roomCfg[g.k]<=g.min} onClick={()=>setRC(r=>({...r,[g.k]:r[g.k]-1}))}>−</button>
                              <span className="hp-ctr-val">{roomCfg[g.k]}</span>
                              <button className="hp-ctr-btn" disabled={roomCfg[g.k]>=g.max} onClick={()=>setRC(r=>({...r,[g.k]:r[g.k]+1}))}>+</button>
                            </div>
                          </div>
                        ))}
                        <button className="hp-rm-apply" onClick={()=>setDrop(null)}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* search btn */}
                <button className="hp-sbtn" onClick={doSearch} disabled={loading}>
                  {loading
                    ? <><div className="hp-spin" style={{width:16,height:16,borderWidth:2}}/>Searching…</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Search</>}
                </button>
              </div>

              {/* row 2 – filters */}
              <div className="hp-srow2">

                {/* destination country */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Destination Country</div>
                  <div className="hp-ffin" onClick={()=>tog("dcountry")}>
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <span className="hp-ffval">{DEST_COUNTRIES.find(c=>c.code===destCountry)?.label||destCountry}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="dcountry" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {DEST_COUNTRIES.map(c=>(
                          <div key={c.code} className={`hp-sitem${destCountry===c.code?" act":""}`} onClick={()=>{setDestCountry(c.code);setDrop(null);}}>
                            {destCountry===c.code&&<span>✓</span>}{c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* nationality */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Nationality</div>
                  <div className="hp-ffin" onClick={()=>tog("nat")}>
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <span className="hp-ffval">{natLbl}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="nat" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {NAT.map(n=>(
                          <div key={n.code} className={`hp-sitem${nat===n.code?" act":""}`} onClick={()=>{setNat(n.code);setDrop(null);}}>
                            {nat===n.code&&<span>✓</span>}{n.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* star rating */}
                <div className="hp-ff" style={{position:"relative"}}>
                  <div className="hp-lbl">Star Rating</div>
                  <div className="hp-ffin" onClick={()=>tog("star")}>
                    <span className="hp-ffic" style={{color:"#f59e0b"}}>
                      <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                    <span className="hp-ffval">{starLbl}</span>
                    <span className="hp-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  {drop==="star" && (
                    <div className="hp-drop">
                      <div className="hp-slist">
                        {STAR_OPTS.map(s=>(
                          <div key={s.label} className={`hp-sitem${JSON.stringify(starF)===JSON.stringify(s.val)?" act":""}`}
                            onClick={()=>{setStarF(s.val);setDrop(null);}}>
                            {s.val&&<span style={{color:"#f59e0b"}}>{"★".repeat(s.val[0])}</span>}
                            {s.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* budget */}
                <div className="hp-ff">
                  <div className="hp-lbl">Max Budget / Night</div>
                  <div className="hp-ffin">
                    <span className="hp-ffic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                    <input type="number" min="0" placeholder="e.g. 5000" value={budget} onChange={e=>setBudget(e.target.value)}/>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════
              LOADING
              ══════════════════════════════ */}
          {loading && (
            <div className="hp-loader">
              <div className="hp-spin"/>
              <div className="hp-load-txt">
                {page==="results" && "Searching hotels across our global network…"}
                {page==="prebook" && "Fetching latest rate details & room options…"}
                {(page==="confirm"||page==="detail") && "Processing your request, please wait…"}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              RESULTS
              ══════════════════════════════ */}
          {page==="results" && !loading && (
            <div className="fade">
              <div className="hp-res-bar">
                <div className="hp-res-ct">
                  {hotels.length>0
                    ? <><span>{hotels.length}</span> hotel{hotels.length!==1?"s":""} found{checkIn&&checkOut?` · ${fmtDisp(checkIn)} → ${fmtDisp(checkOut)} · ${nt} night${nt!==1?"s":""}`:""}</>
                    : "No hotels found for your search criteria"}
                </div>
                {hotels.length>0 && (
                  <div className="hp-sort-wrap">
                    <span className="hp-sort-lbl">Sort by:</span>
                    <select className="hp-sort-sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="stars">Star Rating</option>
                      <option value="name">Name A – Z</option>
                    </select>
                  </div>
                )}
              </div>

              {sorted.map((h,idx)=>{
                const price = h.Price?.OfferedPrice || h.Price?.PublishedPrice || 0;
                const cur   = h.Price?.CurrencyCode || "INR";
                const img   = h.HotelPicture || h.ImagePath || null;
                const ref   = h.IsRefundable ?? true;
                const stRaw = h.HotelRating  || h.StarRating || 0;
                const facilities = h.HotelFacilities?.slice(0,4) || [];
                return (
                  <div key={h.HotelCode||idx} className="hp-hcard">
                    <div className="hp-hcard-inner">
                      {/* image */}
                      <div className="hp-himg">
                        {img
                          ? <img src={img} alt={h.HotelName} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span>🏨</span>}
                      </div>
                      {/* body */}
                      <div className="hp-hbody">
                        <div className="hp-hname">{h.HotelName||"Hotel"}</div>
                        {stRaw>0 && <div className="hp-hstars">{stars(stRaw)}</div>}
                        <div className="hp-haddr">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {h.HotelAddress||h.Address||"Address not provided"}
                        </div>
                        {facilities.length>0 && (
                          <div className="hp-htags">
                            {facilities.map((f,i)=><span key={i} className="hp-htag">{f}</span>)}
                          </div>
                        )}
                        {h.Rooms?.length>0 && <div className="hp-havail">✓ {h.Rooms.length} room option{h.Rooms.length>1?"s":""} available</div>}
                      </div>
                      {/* price */}
                      <div className="hp-hprice">
                        <div>
                          <div className="hp-plbl">Starting from</div>
                          <div className="hp-pval">{price>0?Math.round(price).toLocaleString():"—"}</div>
                          <div className="hp-pcur">{cur}</div>
                          {nt>0&&price>0&&<div className="hp-pper">≈ {Math.round(price/nt).toLocaleString()} / night</div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                          <span className={`hp-rbadge ${ref?"ref":"nref"}`}>{ref?"✓ Refundable":"Non-Refundable"}</span>
                          <button className="hp-selrm-btn" onClick={()=>doPrebook(h)}>Select Room →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════
              PRE-BOOK / RATE SELECT
              ══════════════════════════════ */}
          {page==="prebook" && !loading && selHotel && (
            <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start"}}>

              {/* ─ LEFT COLUMN ─ */}
              <div>
                <button onClick={()=>setPage("results")} style={{marginBottom:13,background:"none",border:"none",color:"#0f5298",cursor:"pointer",fontWeight:600,fontSize:".8rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  ← Back to results
                </button>

                {/* hotel header card */}
                <div className="hp-sbox" style={{padding:"16px 18px",marginBottom:13}}>
                  <div style={{fontWeight:700,fontSize:"1rem",color:"#1e293b",marginBottom:3}}>{selHotel.HotelName}</div>
                  {selHotel.HotelRating>0&&<div style={{color:"#f59e0b",fontSize:".72rem",marginBottom:6}}>{stars(selHotel.HotelRating)}</div>}
                  <div style={{fontSize:".73rem",color:"#64748b"}}>
                    {fmtDisp(checkIn)} → {fmtDisp(checkOut)} &nbsp;·&nbsp; {nt} night{nt!==1?"s":""} &nbsp;·&nbsp; {roomLbl}
                  </div>
                </div>

                {/* rate list */}
                <div className="hp-sbox" style={{padding:"16px 18px",marginBottom:13}}>
                  <div style={{fontWeight:700,fontSize:".72rem",color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:11}}>Available Rates</div>
                  {rateList.length===0 && (
                    <div style={{fontSize:".82rem",color:"#64748b",padding:"10px 0"}}>No rate breakdown available from PreBook response. Proceeding with base rate.</div>
                  )}
                  {(rateList.length?rateList:[selHotel]).map((r,idx)=>(
                    <div key={idx} className={`hp-rcard${selRateIdx===idx?" sel":""}`} onClick={()=>setSelRateIdx(idx)}>
                      <div className="hp-rcard-top">
                        <div style={{flex:1}}>
                          <div className="hp-rname">{r.RoomTypeName||r.Name||"Standard Room"}</div>
                          <div className="hp-rtags">
                            {r.IsRefundable&&<span className="hp-rtag b">Refundable</span>}
                            {r.IsRefundable===false&&<span className="hp-rtag o">Non-Refundable</span>}
                            {r.MealType&&<span className="hp-rtag g">{r.MealType}</span>}
                            {r.Inclusion?.map((inc,i)=><span key={i} className="hp-rtag g">{inc}</span>)}
                          </div>
                          {r.CancellationPolicies?.length>0&&<div className="hp-rcancel">Cancel policy: {r.CancellationPolicies[0]}</div>}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div className="hp-rcur">{r.Price?.CurrencyCode||"INR"}</div>
                          <div className="hp-rprice">{Math.round(r.Price?.OfferedPrice||r.Price?.PublishedPrice||selHotel?.Price?.OfferedPrice||0).toLocaleString()}</div>
                          <div style={{fontSize:".6rem",color:"#94a3b8"}}>total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* guest form */}
                <div className="hp-sbox" style={{padding:"16px 18px"}}>
                  <div className="hp-fsec-ttl">Primary Guest Details</div>
                  <div className="hp-fgrid">
                    <div className="hp-ffield">
                      <label className="hp-flbl">Title *</label>
                      <select className="hp-fsel" value={guest.title} onChange={e=>setGuest(g=>({...g,title:e.target.value}))}>
                        {["Mr","Mrs","Ms","Dr","Prof"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">First Name *</label>
                      <input className="hp-finp" placeholder="First name" value={guest.first} onChange={e=>setGuest(g=>({...g,first:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Last Name *</label>
                      <input className="hp-finp" placeholder="Last name" value={guest.last} onChange={e=>setGuest(g=>({...g,last:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Email *</label>
                      <input className="hp-finp" type="email" placeholder="email@example.com" value={guest.email} onChange={e=>setGuest(g=>({...g,email:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Phone *</label>
                      <input className="hp-finp" type="tel" placeholder="+91 9876543210" value={guest.phone} onChange={e=>setGuest(g=>({...g,phone:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">Country</label>
                      <select className="hp-fsel" value={guest.country} onChange={e=>setGuest(g=>({...g,country:e.target.value}))}>
                        {NAT.map(n=><option key={n.code} value={n.code}>{n.label}</option>)}
                      </select>
                    </div>
                    <div className="hp-ffield" style={{gridColumn:"1/-1"}}>
                      <label className="hp-flbl">Address</label>
                      <input className="hp-finp" placeholder="Street address" value={guest.addr} onChange={e=>setGuest(g=>({...g,addr:e.target.value}))}/>
                    </div>
                    <div className="hp-ffield">
                      <label className="hp-flbl">City</label>
                      <input className="hp-finp" placeholder="City" value={guest.city2} onChange={e=>setGuest(g=>({...g,city2:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ RIGHT COLUMN – SUMMARY ─ */}
              <div style={{position:"sticky",top:18}}>
                <div className="hp-sbox" style={{padding:"16px 18px"}}>
                  <div className="hp-sumttl">Booking Summary</div>
                  <div className="hp-sumbox">
                    {[
                      ["Hotel",selHotel.HotelName],
                      ["Check-In",fmtDisp(checkIn)],
                      ["Check-Out",fmtDisp(checkOut)],
                      ["Nights",nt],
                      ["Rooms",roomCfg.count],
                      ["Adults",roomCfg.adults],
                      ["Rate",rateList[selRateIdx]?.RoomTypeName||"Standard"],
                    ].map(([k,v])=>(
                      <div className="hp-sumrow" key={k}>
                        <span>{k}</span>
                        <span className="hp-sumval">{v}</span>
                      </div>
                    ))}
                    <div className="hp-sumrow tot">
                      <span>Total</span>
                      <span style={{color:"#0f5298",fontSize:"1.05rem"}}>{totalPrice>0?`${Math.round(totalPrice).toLocaleString()} INR`:"—"}</span>
                    </div>
                  </div>

                  <button
                    className="hp-btn-pri"
                    style={{width:"100%",justifyContent:"center",fontSize:".88rem",padding:"11px 0"}}
                    onClick={doBook}
                    disabled={loading||!guest.first||!guest.last||!guest.email||!guest.phone}
                  >
                    {loading
                      ? <><div className="hp-spin" style={{width:15,height:15,borderWidth:2}}/>Booking…</>
                      : "✓ Confirm Booking"}
                  </button>
                  <div style={{fontSize:".62rem",color:"#94a3b8",textAlign:"center",marginTop:7}}>🔒 Secured booking via TBO</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              CONFIRMATION
              ══════════════════════════════ */}
          {page==="confirm" && bookingRef && (
            <div className="fade">
              <div className="hp-confirm">
                <div className="hp-ck-icon">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="hp-ck-ttl">Booking Confirmed! 🎉</div>
                <div className="hp-ck-sub">Your hotel reservation has been successfully placed via TBO.</div>
                <div className="hp-ref-box">
                  <div className="hp-ref-lbl">Booking Reference No.</div>
                  <div className="hp-ref-val">{bookingRef}</div>
                </div>

                <div className="hp-ck-grid">
                  {[
                    ["Hotel",selHotel?.HotelName],
                    ["Guest",`${guest.title} ${guest.first} ${guest.last}`],
                    ["Email",guest.email],
                    ["Phone",guest.phone],
                    ["Check-In",fmtDisp(checkIn)],
                    ["Check-Out",fmtDisp(checkOut)],
                    ["Duration",`${nt} night${nt!==1?"s":""}`],
                    ["Rooms",roomCfg.count],
                  ].map(([k,v])=>(
                    <div className="hp-ck-item" key={k}>
                      <div className="hp-ck-lbl">{k}</div>
                      <div className="hp-ck-val">{v||"—"}</div>
                    </div>
                  ))}
                </div>

                <div className="hp-ck-acts">
                  <button className="hp-btn-pri" onClick={doDetail} disabled={loading}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {loading?"Loading…":"View Booking Detail"}
                  </button>
                  <button className="hp-btn-out" onClick={()=>{setPage("home");setHotels([]);}}>
                    Search More Hotels
                  </button>
                  <button className="hp-btn-red" onClick={doCancel} disabled={loading}>
                    {loading?"Processing…":"Cancel Booking"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              BOOKING DETAIL
              ══════════════════════════════ */}
          {page==="detail" && (
            <div className="fade">
              <button onClick={()=>setPage("confirm")} style={{marginBottom:13,background:"none",border:"none",color:"#0f5298",cursor:"pointer",fontWeight:600,fontSize:".8rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                ← Back
              </button>
              <div className="hp-sbox" style={{padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
                  <div>
                    <div style={{fontSize:"1.02rem",fontWeight:700,color:"#1e293b"}}>Booking Details</div>
                    <div style={{fontSize:".73rem",color:"#64748b",marginTop:3}}>
                      Reference: <strong style={{color:"#0f5298"}}>{bookingRef}</strong>
                    </div>
                  </div>
                  <button className="hp-btn-red" onClick={doCancel} disabled={loading}>
                    {loading?"Processing…":"Cancel This Booking"}
                  </button>
                </div>

                {bookingDetail ? (
                  <table className="hp-dtbl">
                    <thead><tr><th style={{width:200}}>Field</th><th>Value</th></tr></thead>
                    <tbody>
                      {Object.entries(bookingDetail).map(([k,v])=>(
                        <tr key={k}>
                          <td style={{fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>{k}</td>
                          <td>{typeof v==="object"&&v!==null?JSON.stringify(v,null,2):String(v??"—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{textAlign:"center",padding:"28px 0",color:"#94a3b8",fontSize:".84rem"}}>
                    No detail data returned from API.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              HOME DASHBOARD STATS
              ══════════════════════════════ */}
          {page==="home" && (
            <div className="hp-stats fade">
              {[
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,cls:"bl",t:"Active Bookings",d:"Currently active reservations",n:"12"},
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,cls:"or",t:"Pending",d:"Awaiting client confirmation",n:"5",nc:"#e65100"},
                {ic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,cls:"gr",t:"Completed",d:"Successful bookings this month",n:"38",nc:"#2e7d32"},
              ].map(c=>(
                <div key={c.t} className="hp-stat">
                  <div className={`hp-stat-ic ${c.cls}`}>{c.ic}</div>
                  <div>
                    <div className="hp-stat-ttl">{c.t}</div>
                    <div className="hp-stat-desc">{c.d}</div>
                    <div className="hp-stat-n" style={c.nc?{color:c.nc}:{}}>{c.n}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>{/* end content */}
      </div>
    </>
  );
}