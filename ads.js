/* ═══════════════════════════════════════════════════════════════
   FILEWORK — ADS.JS  |  AdSense Configuration
   ═══════════════════════════════════════════════════════════════

   HOW TO ACTIVATE ADSENSE (Step by Step):
   ─────────────────────────────────────────
   STEP 1: Apply at https://adsense.google.com
           Wait for approval (usually 1-7 days)

   STEP 2: Get your Publisher ID from AdSense Dashboard
           It looks like: ca-pub-1234567890123456
           Paste it in PUBLISHER_ID below

   STEP 3: Create Ad Units in AdSense → Ads → By ad unit
           Create one unit per slot. Each gives you a Slot ID
           (a 10-digit number like 1234567890)
           Paste each Slot ID in SLOTS below

   STEP 4: Save this file. Ads will appear automatically!

   STEP 5: Set SHOW_ADS = true

   AD SIZES:
     TOP_BANNER    → 728×90  (leaderboard, top of page)
     MID_RECT      → 336×280 (medium rectangle, between tools)
     PRE_RESULT    → 468×60  (banner, shown BEFORE download button)
     BOTTOM_BANNER → 728×90  (leaderboard, footer)
   ═══════════════════════════════════════════════════════════════ */

window.ADS = {
  SHOW_ADS: false,                            // ← Set true after configuring below

  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXXX',   // ← Paste your Publisher ID here

  SLOTS: {
    TOP_BANNER:    'XXXXXXXXXX',  // ← 728×90  Top of page
    MID_RECT:      'XXXXXXXXXX',  // ← 336×280 Between tool sections
    PRE_RESULT:    'XXXXXXXXXX',  // ← 468×60  Before download button (modal)
    BOTTOM_BANNER: 'XXXXXXXXXX',  // ← 728×90  Footer area
  },

  /* Auto-injected styles for ad containers */
  PLACEHOLDER_STYLE: `background:var(--bg3);border:1px dashed var(--border2);
    border-radius:8px;padding:10px 18px;display:inline-flex;align-items:center;
    gap:12px;color:var(--text3);font-size:.72rem;font-family:var(--mono)`,
};

/* ── AUTO INIT ── */
(function(){
  const cfg = window.ADS;
  if (!cfg.SHOW_ADS) return showPlaceholders();
  if (cfg.PUBLISHER_ID.includes('X')) return showPlaceholders();

  // Inject AdSense script
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.PUBLISHER_ID}`;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
  s.onload = () => initAllSlots();
})();

function initAllSlots(){
  renderAd('ad-top',    'TOP_BANNER',    'horizontal');
  renderAd('ad-mid',    'MID_RECT',      'rectangle');
  renderAd('ad-bottom', 'BOTTOM_BANNER', 'horizontal');
}

function renderAd(containerId, slotKey, format){
  const el = document.getElementById(containerId); if(!el) return;
  const cfg = window.ADS;
  const sid = cfg.SLOTS[slotKey];
  if(!sid || sid.includes('X')){ showPlaceholder(el, slotKey); return; }
  el.innerHTML = `<ins class="adsbygoogle" style="display:block"
    data-ad-client="${cfg.PUBLISHER_ID}" data-ad-slot="${sid}"
    data-ad-format="${format}" data-full-width-responsive="true"></ins>`;
  try{ (window.adsbygoogle = window.adsbygoogle||[]).push({}); }catch(e){}
}

/* Show pre-result ad inside modal before download */
window.showPreResultAd = function(){
  const el = document.getElementById('ad-pre-result'); if(!el) return;
  const cfg = window.ADS;
  if(!cfg.SHOW_ADS || cfg.PUBLISHER_ID.includes('X')){ showPlaceholder(el,'PRE_RESULT'); return; }
  el.innerHTML = `<ins class="adsbygoogle" style="display:block"
    data-ad-client="${cfg.PUBLISHER_ID}" data-ad-slot="${cfg.SLOTS.PRE_RESULT}"
    data-ad-format="horizontal" data-full-width-responsive="true"></ins>`;
  try{ (window.adsbygoogle = window.adsbygoogle||[]).push({}); }catch(e){}
};

function showPlaceholders(){
  ['ad-top','ad-mid','ad-bottom'].forEach(id=>{
    const el=document.getElementById(id); if(el) showPlaceholder(el, id);
  });
}

function showPlaceholder(el, label){
  el.innerHTML=`<div style="${window.ADS.PLACEHOLDER_STYLE}">
    <span>📢</span>
    <span>Ad Slot: <b style="color:var(--blue-lt)">${label}</b>
    — Configure in <b style="color:var(--blue-lt)">ads.js</b></span>
  </div>`;
}
