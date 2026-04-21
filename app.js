/* ════════════════════════════════════════
   FILEWORK v4 — APP.JS
   Auto-OCR · 25 Typing Games · All Tools
   ════════════════════════════════════════ */

/* ── PDF.js ── */
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
const CMAP  = 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/';
const SFONTS= 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/';
async function loadPDF(data){
  return pdfjsLib.getDocument({data,cMapUrl:CMAP,cMapPacked:true,standardFontDataUrl:SFONTS,useSystemFonts:true,verbosity:0}).promise;
}

/* ── SHORTCUTS ── */
const $ = id => document.getElementById(id);
const fmtSz = b => b<1024?b+'B':b<1048576?(b/1024).toFixed(1)+'KB':(b/1048576).toFixed(2)+'MB';
const rdAB  = f => new Promise((r,e)=>{const fr=new FileReader();fr.onload=ev=>r(ev.target.result);fr.onerror=e;fr.readAsArrayBuffer(f);});
const rdDU  = f => new Promise((r,e)=>{const fr=new FileReader();fr.onload=ev=>r(ev.target.result);fr.onerror=e;fr.readAsDataURL(f);});
const ldImg = s => new Promise((r,e)=>{const i=new Image();i.onload=()=>r(i);i.onerror=e;i.src=s;});
const toBlob= (c,t,q)=>new Promise(r=>c.toBlob(r,t,q));

/* ── UI HELPERS ── */
function SS(id,msg,type=''){const e=$('st-'+id);if(e){e.textContent=msg;e.className='smsg '+type;}}
function SP(id,pct,ocr=false){const pb=$('pb-'+id),pf=$('pf-'+id);if(!pb||!pf)return;pb.style.display='block';ocr?pb.classList.add('ocr'):pb.classList.remove('ocr');pf.style.width=pct+'%';}
function HP(id){const e=$('pb-'+id);if(e)e.style.display='none';}
function AD(area,blob,name){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;a.className='dbtn';
  a.innerHTML=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${name}`;
  const el=$(area);if(el)el.appendChild(a);
  // show pre-result ad on first download
  const w=$('pre-result-ad-wrap');
  if(w&&w.style.display==='none'){w.style.display='block';if(typeof showPreResultAd==='function')showPreResultAd();}
}

/* ── PAGE ROUTING ── */
const PAGES=['install','contact'];
function showPage(p,anchor){
  const mc=$('main-content');
  const ip=$('install-page-content');
  const cp=$('contact-page-content');
  // Hide all sub-pages
  if(ip) ip.style.display='none';
  if(cp) cp.style.display='none';
  if(p==='install'){
    if(mc) mc.style.display='none';
    if(ip) ip.style.display='block';
    window.scrollTo({top:0,behavior:'smooth'});
  } else if(p==='contact'){
    if(mc) mc.style.display='none';
    if(cp) cp.style.display='block';
    window.scrollTo({top:0,behavior:'smooth'});
  } else {
    if(mc) mc.style.display='';
    if(anchor){
      setTimeout(()=>{
        const el=document.getElementById(anchor);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      },30);
    }
  }
}
function initRouter(){
  const params=new URLSearchParams(location.search);
  const p=params.get('page')||'';
  const hash=location.hash.replace('#','');
  showPage(p, hash);

  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href]');
    if(!a) return;
    const href=a.getAttribute('href');
    if(!href||href.startsWith('http')||href.startsWith('mailto')||href.startsWith('data:')) return;

    e.preventDefault();

    // Pure hash link e.g. #pdf-sec #faq
    if(href.startsWith('#')){
      const anchor=href.slice(1);
      history.pushState({},'',location.pathname+'#'+anchor);
      showPage('',anchor);
      return;
    }

    // URL with ?page= param
    const url=new URL(href, location.href);
    if(url.origin!==location.origin) return;
    const pg=url.searchParams.get('page')||'';
    const anc=url.hash.replace('#','');
    history.pushState({},'',url.pathname+(pg?'?page='+pg:'')+(anc?'#'+anc:''));
    showPage(pg,anc);
  });
}
window.addEventListener('popstate',()=>{
  const p=new URLSearchParams(location.search).get('page')||'';
  const hash=location.hash.replace('#','');
  showPage(p,hash);
});
initRouter();

/* ── FAQ ── */
document.querySelectorAll('.fq').forEach(b=>{
  b.addEventListener('click',()=>{
    const o=b.classList.contains('open');
    document.querySelectorAll('.fq.open').forEach(x=>{x.classList.remove('open');x.nextElementSibling.classList.remove('open');});
    if(!o){b.classList.add('open');b.nextElementSibling.classList.add('open');}
  });
});

/* ── PWA ── */
let dp;const ib=$('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;if(ib)ib.style.display='block';});
if(ib)ib.addEventListener('click',async()=>{if(!dp)return;dp.prompt();const{outcome}=await dp.userChoice;if(outcome==='accepted')ib.style.display='none';dp=null;});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

/* ── INSTALL PAGE FUNCTIONS ── */
async function triggerPWAInstall(){
  const btn=$('pwaInstallBtn');
  if(dp){
    dp.prompt();
    const{outcome}=await dp.userChoice;
    if(outcome==='accepted'){if(btn)btn.textContent='✓ Installed!';}
    dp=null;
  } else {
    // Already installed or not supported
    const ns=$('pwa-not-supported');
    if(ns) ns.style.display='block';
    if(btn) btn.style.display='none';
  }
}

function showHomepageInstructions(){
  const el=$('homepage-instructions');
  if(!el) return;
  const isOpen = el.style.display==='block';
  el.style.display = isOpen ? 'none' : 'block';
  // Fill in the current URL
  const url = window.location.origin + window.location.pathname;
  ['site-url-chrome','site-url-edge'].forEach(id=>{
    const c=$( id); if(c) c.textContent=url;
  });
}

function showShortcutInstructions(){
  const el=$('shortcut-instructions');
  if(!el) return;
  el.style.display = el.style.display==='block' ? 'none' : 'block';
}

function copyURL(){
  const url = window.location.origin + window.location.pathname;
  navigator.clipboard.writeText(url).then(()=>{
    // Show brief feedback on all copy buttons
    document.querySelectorAll('.copy-url-btn').forEach(b=>{
      b.textContent='✓ Copied!';
      setTimeout(()=>b.textContent='📋 Copy URL',2000);
    });
  }).catch(()=>{
    prompt('Copy this URL:', url);
  });
}

/* ── MODAL ── */
const modal=$('modal'),mcontent=$('mcontent');
const FS={};
function O(tool){
  mcontent.innerHTML=TH(tool);
  const w=$('pre-result-ad-wrap');if(w)w.style.display='none';
  modal.classList.add('open');document.body.style.overflow='hidden';
  setTimeout(()=>initTool(tool),30);
}
function CM(){modal.classList.remove('open');document.body.style.overflow='';setTimeout(()=>{mcontent.innerHTML='';},300);}
modal.addEventListener('click',e=>{if(e.target===modal)CM();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')CM();});

/* ── FILE HANDLING ── */
function DZ(id,acc='*',multi=false){
  return `<div class="dz" id="${id}" onclick="TF('${id}','${acc}',${multi})">
    <div class="dz-ic">📂</div><p>Drop here or <strong>click to browse</strong></p>
    <p class="dz-hint">${acc}${multi?' · Multiple files':''}</p></div>`;
}
function TF(dz,acc,multi){const i=document.createElement('input');i.type='file';i.accept=acc;i.multiple=multi;i.onchange=e=>HF(dz,Array.from(e.target.files));i.click();}
function HF(dz,files){const id=dz.replace('-dz','');if(!FS[id])FS[id]=[];files.forEach(f=>FS[id].push(f));RFL(id);if(id==='img-crop'&&FS[id].length)loadCropPrev();}
function RFL(id){const el=$(id+'-files');if(!el)return;el.innerHTML=(FS[id]||[]).map((f,i)=>`<div class="fitem-row"><span>${f.type.includes('pdf')?'📄':'🖼️'}</span><span class="fi-nm">${f.name}</span><span class="fi-sz">${fmtSz(f.size)}</span><button class="fi-rm" onclick="RF('${id}',${i})">✕</button></div>`).join('');}
function RF(id,i){if(FS[id])FS[id].splice(i,1);RFL(id);}
function SDD(dz){const el=$(dz);if(!el||el._dd)return;el._dd=true;el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over');});el.addEventListener('dragleave',()=>el.classList.remove('over'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');HF(dz,Array.from(e.dataTransfer.files));});}
function initTool(t){
  document.querySelectorAll('.dz').forEach(d=>{if(d.id)SDD(d.id);});
  document.querySelectorAll('input[type=range]').forEach(r=>{const ve=$(r.id+'val');if(!ve)return;const ip=parseFloat(r.max)<=1;const u=()=>{ve.textContent=ip?Math.round(r.value*100)+'%':r.value;};u();r.addEventListener('input',u);});
  if(t==='typing-master')initTypingMaster();
  if(t==='keyboard-mouse-test')initKbMouse();
  if(t==='text-translator')initTranslator();
}

/* ════════════════════════════════════════
   AUTO LANGUAGE DETECTION
   ════════════════════════════════════════ */

/* Script detection by Unicode range */
function detectScript(text){
  const s=text.replace(/\s/g,'');if(!s)return null;
  const checks=[
    [/[\u0900-\u097F]/,  'hin'], // Devanagari (Hindi/Marathi)
    [/[\u0980-\u09FF]/,  'ben'], // Bengali
    [/[\u0C00-\u0C7F]/,  'tel'], // Telugu
    [/[\u0B80-\u0BFF]/,  'tam'], // Tamil
    [/[\u0600-\u06FF]/,  'ara'], // Arabic/Urdu
    [/[\u4E00-\u9FFF]/,  'chi_sim'], // Chinese
    [/[\u3040-\u309F\u30A0-\u30FF]/,'jpn'], // Japanese
    [/[\uAC00-\uD7AF]/,  'kor'], // Korean
    [/[\u0400-\u04FF]/,  'rus'], // Cyrillic
    [/[\u0370-\u03FF]/,  'ell'], // Greek
    [/[\u0E00-\u0E7F]/,  'tha'], // Thai
    [/[\u0700-\u074F]/,  'syr'], // Syriac
  ];
  for(const [re,lang] of checks){
    const m=(s.match(re)||[]).length;
    if(m/s.length > 0.05) return lang;
  }
  return 'eng';
}

/* Auto-detect language from PDF text content */
async function autoDetectLang(pdf){
  let sample='';
  const pages=Math.min(3,pdf.numPages);
  for(let p=1;p<=pages&&sample.length<300;p++){
    const page=await pdf.getPage(p);
    const c=await page.getTextContent();
    sample+=c.items.map(i=>i.str).join(' ');
  }
  const detected=detectScript(sample);
  return detected||'eng';
}

/* Auto-detect from image via small OCR sample */
async function autoDetectLangFromImg(dataUrl){
  try{
    const worker=await Tesseract.createWorker('eng',1,{logger:()=>{}});
    const r=await worker.recognize(dataUrl);
    await worker.terminate();
    return detectScript(r.data.text)||'eng';
  }catch{return 'eng';}
}

const LANG_NAMES={
  'hin':'Hindi','ara':'Arabic','chi_sim':'Chinese (Simplified)','chi_tra':'Chinese (Traditional)',
  'jpn':'Japanese','kor':'Korean','urd':'Urdu','tam':'Tamil','ben':'Bengali',
  'tel':'Telugu','mar':'Marathi','eng':'English','fra':'French','deu':'German',
  'spa':'Spanish','rus':'Russian','tha':'Thai','ell':'Greek','por':'Portuguese'
};

/* ════════════════════════════════════════
   OCR WORKER
   ════════════════════════════════════════ */
let ocrW=null;
async function getWorker(lang){
  if(ocrW){try{await ocrW.terminate();}catch{}ocrW=null;}
  ocrW=await Tesseract.createWorker(lang,1,{
    workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    langPath:'https://tessdata.projectnaptha.com/4.0.0',
    corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
    logger:m=>{
      if(m.status==='recognizing text'){
        SP('pdf-ocr-text',Math.round(m.progress*88),true);
        SP('img-ocr',Math.round(m.progress*88),true);
        SP('pdf-to-excel',Math.round(m.progress*88),true);
        SP('pdf-to-word',Math.round(m.progress*80),true);
        SP('pdf-to-txt',Math.round(m.progress*80),true);
      }
    }
  });
  return ocrW;
}

async function ocrPage(page, scale=2.5){
  const vp=page.getViewport({scale});
  const c=document.createElement('canvas');
  c.width=vp.width;c.height=vp.height;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
  await page.render({canvasContext:ctx,viewport:vp}).promise;
  return c.toDataURL('image/png');
}

/* ════════════════════════════════════════
   TOOL HTML TEMPLATES
   ════════════════════════════════════════ */
function TH(tool){
  const T={

'pdf-ocr-text':`
<div class="mtitle">PDF OCR — Auto Language</div>
<div class="msub">Language auto-detected from script. Supports Hindi, Arabic, Chinese, Japanese, Urdu and 100+ more. <span class="on">⚠ Downloads ~20MB language data on first use (cached)</span></div>
${DZ('pdf-ocr-text-dz','.pdf')}
<div class="flist" id="pdf-ocr-text-files"></div>
<div class="orow"><div class="og"><label>Override Language (optional)</label>
<select id="ocr-lang-override"><option value="auto">Auto-Detect (recommended)</option>
<option value="hin">Hindi</option><option value="ara">Arabic</option><option value="chi_sim">Chinese Simplified</option>
<option value="chi_tra">Chinese Traditional</option><option value="jpn">Japanese</option><option value="kor">Korean</option>
<option value="urd">Urdu</option><option value="tam">Tamil</option><option value="ben">Bengali</option>
<option value="tel">Telugu</option><option value="eng">English</option><option value="fra">French</option>
<option value="deu">German</option><option value="spa">Spanish</option><option value="rus">Russian</option>
<option value="tha">Thai</option></select></div>
<div class="og"><label>Page Scale</label>
<select id="ocr-scale"><option value="2.5">2.5x (Fast)</option><option value="3">3x (Better)</option><option value="4">4x (Best)</option></select></div>
<div class="og"><label>Output</label>
<select id="ocr-out"><option value="file">Text File (.txt)</option><option value="screen">Show on Screen</option></select></div></div>
<div class="pb" id="pb-pdf-ocr-text"><div class="pf" id="pf-pdf-ocr-text"></div></div>
<div class="smsg" id="st-pdf-ocr-text"></div>
<button class="btn util" onclick="runPdfOcr()">Start OCR Extraction</button>
<div class="ocrbox" id="ocr-box"></div>
<div class="dla" id="dl-pdf-ocr-text"></div>`,

'pdf-to-word':`
<div class="mtitle">PDF to Word</div>
<div class="msub">Auto-detects document language via OCR, outputs text in the same language and style <span class="ln">✓ Any language</span></div>
${DZ('pdf-to-word-dz','.pdf')}
<div class="flist" id="pdf-to-word-files"></div>
<div class="pb" id="pb-pdf-to-word"><div class="pf" id="pf-pdf-to-word"></div></div>
<div class="smsg" id="st-pdf-to-word"></div>
<button class="btn" onclick="runPdfToWord()">Convert to Word (.rtf)</button>
<div class="dla" id="dl-pdf-to-word"></div>`,

'pdf-to-txt':`
<div class="mtitle">PDF to Text</div>
<div class="msub">Extracts embedded text. Auto-detects language via OCR for best results <span class="ln">✓ Unicode</span></div>
${DZ('pdf-to-txt-dz','.pdf')}
<div class="flist" id="pdf-to-txt-files"></div>
<div class="orow"><div class="og"><label>Page Separator</label><select id="pt-sep"><option value="line">── Page N ──</option><option value="blank">Blank line</option><option value="none">None</option></select></div></div>
<div class="pb" id="pb-pdf-to-txt"><div class="pf" id="pf-pdf-to-txt"></div></div>
<div class="smsg" id="st-pdf-to-txt"></div>
<button class="btn" onclick="runPdfToTxt()">Extract Text</button>
<div class="dla" id="dl-pdf-to-txt"></div>`,

'pdf-to-excel':`
<div class="mtitle">PDF to Excel</div>
<div class="msub">Extract tables and data. Auto-OCR for scanned PDFs in any language</div>
${DZ('pdf-to-excel-dz','.pdf')}
<div class="flist" id="pdf-to-excel-files"></div>
<div class="orow"><div class="og"><label>Mode</label><select id="pxl-mode"><option value="auto">Auto (try text, fallback OCR)</option><option value="text">Text only (fast)</option><option value="ocr">OCR mode (scanned PDF)</option></select></div></div>
<div class="pb" id="pb-pdf-to-excel"><div class="pf" id="pf-pdf-to-excel"></div></div>
<div class="smsg" id="st-pdf-to-excel"></div>
<div class="tblprev" id="excel-prev"></div>
<button class="btn" onclick="runPdfToExcel()" style="margin-top:10px">Extract to Excel (.xlsx)</button>
<div class="dla" id="dl-pdf-to-excel"></div>`,

'pdf-to-jpg':`
<div class="mtitle">PDF to Images</div>
<div class="msub">Renders every page as image <span class="ln">✓ All languages render correctly</span></div>
${DZ('pdf-to-jpg-dz','.pdf')}
<div class="flist" id="pdf-to-jpg-files"></div>
<div class="orow"><div class="og"><label>Format</label><select id="pj-fmt"><option value="jpeg">JPG</option><option value="png">PNG</option></select></div>
<div class="og"><label>Quality</label><input type="range" id="pj-quality" min="0.3" max="1" step="0.05" value="0.9"><div class="rv" id="pj-qualityval">90%</div></div>
<div class="og"><label>Scale/DPI</label><select id="pj-sc"><option value="2">2x</option><option value="3">3x</option><option value="1.5">1.5x</option></select></div></div>
<div class="pb" id="pb-pdf-to-jpg"><div class="pf" id="pf-pdf-to-jpg"></div></div>
<div class="smsg" id="st-pdf-to-jpg"></div>
<button class="btn" onclick="runPdfToJpg()">Extract Images</button>
<div class="dla" id="dl-pdf-to-jpg"></div>`,

'merge-pdf':`<div class="mtitle">Merge PDFs</div><div class="msub">Combine multiple PDFs in listed order</div>${DZ('merge-pdf-dz','.pdf',true)}<div class="flist" id="merge-pdf-files"></div><div class="pb" id="pb-merge-pdf"><div class="pf" id="pf-merge-pdf"></div></div><div class="smsg" id="st-merge-pdf"></div><button class="btn" onclick="runMergePdf()">Merge PDFs</button><div class="dla" id="dl-merge-pdf"></div>`,

'split-pdf':`<div class="mtitle">Split PDF</div><div class="msub">Extract pages or custom ranges</div>${DZ('split-pdf-dz','.pdf')}<div class="flist" id="split-pdf-files"></div><div class="orow"><div class="og"><label>Mode</label><select id="sp-mode"><option value="all">Every page</option></select></div><div class="og"><label>Ranges (e.g. 1-3, 5)</label><input type="text" id="sp-range" placeholder="1-3, 5, 7-9"><p class="prh">Overrides mode when filled</p></div></div><div class="pb" id="pb-split-pdf"><div class="pf" id="pf-split-pdf"></div></div><div class="smsg" id="st-split-pdf"></div><button class="btn" onclick="runSplitPdf()">Split PDF</button><div class="dla" id="dl-split-pdf"></div>`,

'compress-pdf':`<div class="mtitle">Compress PDF</div><div class="msub">Re-save with optimized object streams</div>${DZ('compress-pdf-dz','.pdf')}<div class="flist" id="compress-pdf-files"></div><div class="pb" id="pb-compress-pdf"><div class="pf" id="pf-compress-pdf"></div></div><div class="smsg" id="st-compress-pdf"></div><button class="btn" onclick="runCompressPdf()">Compress</button><div class="dla" id="dl-compress-pdf"></div>`,

'rotate-pdf':`<div class="mtitle">Rotate PDF</div><div class="msub">Rotate all pages by a set angle</div>${DZ('rotate-pdf-dz','.pdf')}<div class="flist" id="rotate-pdf-files"></div><div class="orow"><div class="og"><label>Angle</label><select id="rp-a"><option value="90">90° Clockwise</option><option value="180">180°</option><option value="270">90° CCW</option></select></div></div><div class="pb" id="pb-rotate-pdf"><div class="pf" id="pf-rotate-pdf"></div></div><div class="smsg" id="st-rotate-pdf"></div><button class="btn" onclick="runRotatePdf()">Rotate</button><div class="dla" id="dl-rotate-pdf"></div>`,

'watermark-pdf':`<div class="mtitle">Watermark PDF</div><div class="msub">Diagonal text watermark on every page</div>${DZ('watermark-pdf-dz','.pdf')}<div class="flist" id="watermark-pdf-files"></div><div class="orow"><div class="og"><label>Text</label><input type="text" id="wp-t" value="CONFIDENTIAL"></div><div class="og"><label>Opacity</label><input type="range" id="wp-op" min="0.05" max="0.5" step="0.05" value="0.2"><div class="rv" id="wp-opval">20%</div></div></div><div class="pb" id="pb-watermark-pdf"><div class="pf" id="pf-watermark-pdf"></div></div><div class="smsg" id="st-watermark-pdf"></div><button class="btn" onclick="runWatermarkPdf()">Add Watermark</button><div class="dla" id="dl-watermark-pdf"></div>`,

'protect-pdf':`<div class="mtitle">Protect / Unlock PDF</div><div class="msub">Add protection watermark or remove restrictions</div>${DZ('protect-pdf-dz','.pdf')}<div class="flist" id="protect-pdf-files"></div><div class="orow"><div class="og"><label>Action</label><select id="pp-a"><option value="protect">Add Protection</option><option value="unlock">Remove Restrictions</option></select></div><div class="og"><label>Watermark Text</label><input type="text" id="pp-t" value="PROTECTED"></div></div><div class="smsg" id="st-protect-pdf"></div><button class="btn" onclick="runProtect()">Apply</button><div class="dla" id="dl-protect-pdf"></div>`,

'img-to-pdf':`<div class="mtitle">Images to PDF</div><div class="msub">Pack images into a PDF file</div>${DZ('img-to-pdf-dz','.jpg,.jpeg,.png,.webp,.bmp',true)}<div class="flist" id="img-to-pdf-files"></div><div class="orow"><div class="og"><label>Page Size</label><select id="itp-s"><option value="A4">A4</option><option value="Letter">Letter</option><option value="fit">Fit to Image</option></select></div></div><div class="pb" id="pb-img-to-pdf"><div class="pf" id="pf-img-to-pdf"></div></div><div class="smsg" id="st-img-to-pdf"></div><button class="btn" onclick="runI2P('img-to-pdf')">Create PDF</button><div class="dla" id="dl-img-to-pdf"></div>`,
'img-to-pdf2':`<div class="mtitle">Image to PDF</div><div class="msub">Pack one or many images into a PDF</div>${DZ('img-to-pdf2-dz','image/*',true)}<div class="flist" id="img-to-pdf2-files"></div><div class="orow"><div class="og"><label>Page Size</label><select id="itp2-s"><option value="A4">A4</option><option value="Letter">Letter</option><option value="fit">Fit</option></select></div></div><div class="pb" id="pb-img-to-pdf2"><div class="pf" id="pf-img-to-pdf2"></div></div><div class="smsg" id="st-img-to-pdf2"></div><button class="btn util" onclick="runI2P('img-to-pdf2')">Create PDF</button><div class="dla" id="dl-img-to-pdf2"></div>`,

/* ── IMAGE TOOLS ── */
'img-ocr':`
<div class="mtitle">Image OCR — Auto Language</div>
<div class="msub">Auto-detects script from image and applies correct OCR language <span class="on">⚠ Downloads language data on first use</span></div>
${DZ('img-ocr-dz','image/*',true)}
<div class="flist" id="img-ocr-files"></div>
<div class="orow"><div class="og"><label>Override Language</label><select id="img-ocr-lang"><option value="auto">Auto-Detect</option><option value="hin">Hindi</option><option value="ara">Arabic</option><option value="chi_sim">Chinese</option><option value="jpn">Japanese</option><option value="kor">Korean</option><option value="urd">Urdu</option><option value="tam">Tamil</option><option value="ben">Bengali</option><option value="eng">English</option><option value="fra">French</option><option value="rus">Russian</option></select></div></div>
<div class="pb" id="pb-img-ocr"><div class="pf" id="pf-img-ocr"></div></div>
<div class="smsg" id="st-img-ocr"></div>
<button class="btn img" onclick="runImgOcr()">Extract Text from Image</button>
<div class="ocrbox" id="img-ocr-box"></div>
<div class="dla" id="dl-img-ocr"></div>`,

'img-convert':`<div class="mtitle">Convert Image</div><div class="msub">JPG ↔ PNG ↔ WebP ↔ BMP</div>${DZ('img-convert-dz','image/*',true)}<div class="flist" id="img-convert-files"></div><div class="orow"><div class="og"><label>Format</label><select id="ic-fmt"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option><option value="bmp">BMP</option></select></div><div class="og"><label>Quality</label><input type="range" id="ic-q" min="0.3" max="1" step="0.05" value="0.9"><div class="rv" id="ic-qval">90%</div></div></div><div class="pb" id="pb-img-convert"><div class="pf" id="pf-img-convert"></div></div><div class="smsg" id="st-img-convert"></div><button class="btn img" onclick="runImgConvert()">Convert</button><div class="dla" id="dl-img-convert"></div>`,

'img-compress':`<div class="mtitle">Compress Image</div><div class="msub">Reduce file size, keep quality</div>${DZ('img-compress-dz','image/*',true)}<div class="flist" id="img-compress-files"></div><div class="orow"><div class="og"><label>Quality</label><input type="range" id="icp-q" min="0.1" max="0.95" step="0.05" value="0.65"><div class="rv" id="icp-qval">65%</div></div></div><div class="pb" id="pb-img-compress"><div class="pf" id="pf-img-compress"></div></div><div class="smsg" id="st-img-compress"></div><button class="btn img" onclick="runImgCompress()">Compress</button><div class="dla" id="dl-img-compress"></div>`,

'img-resize':`
<div class="mtitle">Resize Image</div>
<div class="msub">Resize by pixels, physical size, resolution (DPI), or percentage</div>
${DZ('img-resize-dz','image/*')}
<div class="flist" id="img-resize-files"></div>
<div class="resize-tabs" id="resize-tabs">
  <button class="rtab active" onclick="setResizeMode(this,'px')">By Pixels</button>
  <button class="rtab" onclick="setResizeMode(this,'pct')">By Percentage</button>
  <button class="rtab" onclick="setResizeMode(this,'size')">By Size (cm/in)</button>
  <button class="rtab" onclick="setResizeMode(this,'dpi')">By Resolution (DPI)</button>
</div>
<div id="resize-px" class="orow">
  <div class="og"><label>Width (px)</label><input type="number" id="ir-w" placeholder="800"></div>
  <div class="og"><label>Height (px)</label><input type="number" id="ir-h" placeholder="600"></div>
  <div class="og"><label>Aspect Ratio</label><select id="ir-ar"><option value="free">Free</option><option value="lock">Lock ratio</option></select></div>
</div>
<div id="resize-pct" class="orow" style="display:none">
  <div class="og"><label>Width %</label><input type="number" id="ir-wp" value="50"></div>
  <div class="og"><label>Height %</label><input type="number" id="ir-hp" value="50"></div>
</div>
<div id="resize-size" class="orow" style="display:none">
  <div class="og"><label>Width</label><input type="number" id="ir-ws" placeholder="10"></div>
  <div class="og"><label>Height</label><input type="number" id="ir-hs" placeholder="8"></div>
  <div class="og"><label>Unit</label><select id="ir-unit"><option value="cm">cm</option><option value="in">inch</option><option value="mm">mm</option></select></div>
  <div class="og"><label>DPI</label><input type="number" id="ir-dpi-s" value="96"></div>
</div>
<div id="resize-dpi" class="orow" style="display:none">
  <div class="og"><label>Target DPI</label><select id="ir-dpi"><option value="72">72 DPI (Screen)</option><option value="96">96 DPI (Web)</option><option value="150">150 DPI (Print draft)</option><option value="300">300 DPI (Print quality)</option><option value="600">600 DPI (High res)</option></select></div>
  <div class="og"><label>Current DPI</label><input type="number" id="ir-dpi-cur" value="96"></div>
</div>
<div class="smsg" id="st-img-resize"></div>
<button class="btn img" onclick="runImgResize()">Resize Image</button>
<div class="dla" id="dl-img-resize"></div>`,

'img-crop':`<div class="mtitle">Crop Image</div><div class="msub">Drag on preview to select area</div>${DZ('img-crop-dz','image/*')}<div class="flist" id="img-crop-files"></div><canvas id="cropCanvas" style="max-width:100%;border-radius:8px;border:1px solid var(--border2);display:none;margin-bottom:8px"></canvas><div class="orow" id="crop-xy" style="display:none"><div class="og"><label>X</label><input type="number" id="cr-x" value="0"></div><div class="og"><label>Y</label><input type="number" id="cr-y" value="0"></div><div class="og"><label>W</label><input type="number" id="cr-w" value="100"></div><div class="og"><label>H</label><input type="number" id="cr-h" value="100"></div></div><div class="smsg" id="st-img-crop"></div><button class="btn img" onclick="runImgCrop()">Crop &amp; Download</button><div class="dla" id="dl-img-crop"></div>`,

'img-rotate':`<div class="mtitle">Rotate / Flip</div><div class="msub">Rotate or mirror images</div>${DZ('img-rotate-dz','image/*',true)}<div class="flist" id="img-rotate-files"></div><div class="orow"><div class="og"><label>Operation</label><select id="irp-op"><option value="r90">Rotate 90° CW</option><option value="r180">Rotate 180°</option><option value="r270">Rotate 90° CCW</option><option value="fh">Flip Horizontal</option><option value="fv">Flip Vertical</option></select></div></div><div class="pb" id="pb-img-rotate"><div class="pf" id="pf-img-rotate"></div></div><div class="smsg" id="st-img-rotate"></div><button class="btn img" onclick="runImgRotate()">Apply</button><div class="dla" id="dl-img-rotate"></div>`,

'img-watermark':`<div class="mtitle">Watermark Image</div><div class="msub">Text watermark at any position</div>${DZ('img-watermark-dz','image/*',true)}<div class="flist" id="img-watermark-files"></div><div class="orow"><div class="og"><label>Text</label><input type="text" id="iw-t" value="FileWork"></div><div class="og"><label>Position</label><select id="iw-p"><option value="br">Bottom Right</option><option value="bl">Bottom Left</option><option value="tr">Top Right</option><option value="tl">Top Left</option><option value="center">Center</option></select></div><div class="og"><label>Opacity</label><input type="range" id="iw-op" min="0.1" max="1" step="0.05" value="0.5"><div class="rv" id="iw-opval">50%</div></div></div><div class="pb" id="pb-img-watermark"><div class="pf" id="pf-img-watermark"></div></div><div class="smsg" id="st-img-watermark"></div><button class="btn img" onclick="runImgWatermark()">Add Watermark</button><div class="dla" id="dl-img-watermark"></div>`,

'img-grayscale':`<div class="mtitle">Grayscale / B&amp;W</div><div class="msub">Convert color to gray or black &amp; white</div>${DZ('img-grayscale-dz','image/*',true)}<div class="flist" id="img-grayscale-files"></div><div class="orow"><div class="og"><label>Mode</label><select id="ig-m"><option value="gray">Grayscale</option><option value="bw">Black &amp; White</option></select></div></div><div class="pb" id="pb-img-grayscale"><div class="pf" id="pf-img-grayscale"></div></div><div class="smsg" id="st-img-grayscale"></div><button class="btn img" onclick="runImgGrayscale()">Convert</button><div class="dla" id="dl-img-grayscale"></div>`,

'img-brightness':`<div class="mtitle">Adjust Image</div><div class="msub">Brightness, contrast, saturation, blur</div>${DZ('img-brightness-dz','image/*',true)}<div class="flist" id="img-brightness-files"></div><div class="orow"><div class="og"><label>Brightness</label><input type="range" id="ab-br" min="-100" max="100" value="0"><div class="rv" id="ab-brval">0</div></div><div class="og"><label>Contrast</label><input type="range" id="ab-co" min="-100" max="100" value="0"><div class="rv" id="ab-coval">0</div></div></div><div class="orow"><div class="og"><label>Saturation</label><input type="range" id="ab-sa" min="-100" max="100" value="0"><div class="rv" id="ab-saval">0</div></div><div class="og"><label>Blur (px)</label><input type="range" id="ab-bl" min="0" max="20" value="0"><div class="rv" id="ab-blval">0</div></div></div><div class="pb" id="pb-img-brightness"><div class="pf" id="pf-img-brightness"></div></div><div class="smsg" id="st-img-brightness"></div><button class="btn img" onclick="runImgAdjust()">Apply</button><div class="dla" id="dl-img-brightness"></div>`,

'img-merge':`<div class="mtitle">Merge Images</div><div class="msub">Stitch multiple images into one</div>${DZ('img-merge-dz','image/*',true)}<div class="flist" id="img-merge-files"></div><div class="orow"><div class="og"><label>Direction</label><select id="im-d"><option value="v">Vertical</option><option value="h">Horizontal</option></select></div></div><div class="pb" id="pb-img-merge"><div class="pf" id="pf-img-merge"></div></div><div class="smsg" id="st-img-merge"></div><button class="btn img" onclick="runImgMerge()">Merge</button><div class="dla" id="dl-img-merge"></div>`,

'img-metadata':`<div class="mtitle">Strip EXIF Data</div><div class="msub">Remove all metadata for privacy</div>${DZ('img-metadata-dz','image/*',true)}<div class="flist" id="img-metadata-files"></div><div class="pb" id="pb-img-metadata"><div class="pf" id="pf-img-metadata"></div></div><div class="smsg" id="st-img-metadata"></div><button class="btn img" onclick="runImgStrip()">Strip &amp; Download</button><div class="dla" id="dl-img-metadata"></div>`,

'img-base64':`<div class="mtitle">Image to Base64</div><div class="msub">Encode for web/CSS use</div>${DZ('img-base64-dz','image/*')}<div class="flist" id="img-base64-files"></div><div class="smsg" id="st-img-base64"></div><button class="btn img" onclick="runImgB64()">Encode</button><div class="dla" id="dl-img-base64"></div>`,

/* ── TRANSLATOR ── */
'text-translator':`
<div class="mtitle">Text Translator</div>
<div class="msub">100+ languages via Google Translate — your text is sent to Google for translation</div>
<div class="orow" style="margin-bottom:10px">
<div class="og"><label>From</label><select id="tr-f">${LO()}</select></div>
<div style="display:flex;align-items:flex-end;padding-bottom:4px">
<button onclick="swapLangs()" style="background:var(--bg3);border:1px solid var(--border2);color:var(--text2);padding:7px 12px;border-radius:7px;cursor:pointer;font-size:.95rem" title="Swap">⇄</button>
</div>
<div class="og"><label>To</label><select id="tr-t">${LO('hi')}</select></div>
</div>
<div class="tr-grid">
<div class="tr-box"><label style="font-size:.67rem;color:var(--text3);font-family:var(--mono);text-transform:uppercase">Source</label>
<textarea class="tr-ta" id="tr-in" placeholder="Type or paste text…" oninput="autoTr()"></textarea></div>
<div class="tr-box"><label style="font-size:.67rem;color:var(--text3);font-family:var(--mono);text-transform:uppercase">Translation</label>
<textarea class="tr-ta" id="tr-out" readonly placeholder="Translation appears here…"></textarea></div>
</div>
<div class="tr-note">Translation uses Google Translate's public endpoint. Text is sent to Google's servers.</div>
<div class="smsg" id="st-text-translator"></div>
<div style="display:flex;gap:7px;margin-top:9px">
<button class="btn util" style="flex:1" onclick="doTr()">Translate</button>
<button class="btn ghost sm" onclick="copyTr()">📋 Copy</button>
</div>`,

/* ── KEYBOARD MOUSE ── */
'keyboard-mouse-test':`
<div class="mtitle">Keyboard &amp; Mouse Tester</div>
<div class="msub">Press any key or click mouse buttons — they light up instantly</div>
<div class="kbwrap" id="kb-vis"></div>
<div class="klog" id="klog">Press any key to begin…</div>
<div class="mbtest" id="mbt">
<div class="mbtn" id="mb-L">Left Click<br>🖱️</div>
<div class="mbtn" id="mb-M">Middle<br>🖱️</div>
<div class="mbtn" id="mb-R">Right Click<br>🖱️</div>
<div class="mscroll" id="mscr">Scroll: 0</div>
</div>
<button class="btn util sm" onclick="resetKb()" style="margin-top:10px;width:auto">🔄 Reset All</button>`,

/* ── TYPING MASTER ── */
'typing-master': buildTypingMasterHTML(),
  };
  return T[tool]||`<div class="mtitle">${tool}</div><p style="color:var(--text2);margin-top:12px">Coming soon!</p>`;
}

/* ════════════════════════════════════════
   TYPING MASTER HTML
   ════════════════════════════════════════ */
function buildTypingMasterHTML(){
  const games=[
    ['Speed Test','Classic WPM test — type the text as fast as you can'],
    ['Accuracy Mode','Slow down, focus on zero errors'],
    ['Dino Runner','Type words to make dino jump over obstacles!'],
    ['Word Rain','Catch falling words before they hit the ground'],
    ['Bubble Pop','Pop bubbles by typing the word inside'],
    ['Word Scramble','Unscramble letters to form the correct word'],
    ['Speed Burst','Short 15-second high-intensity sprint'],
    ['Word Match','Match typed word to correct meaning'],
    ['Sentence Builder','Build sentences word by word'],
    ['Ghost Writer','Copy text with cursor — beat the ghost!'],
    ['Code Typer','Type code snippets — master syntax keys'],
    ['Number Pad','Practice 0-9 and numpad symbols'],
    ['Caps Lock','Type everything in UPPERCASE correctly'],
    ['Reverse Type','Type the word backwards'],
    ['Blind Type','Screen goes blank — type from memory!'],
    ['Rhythm Type','Type in sync with a beat'],
    ['Word Chain','Each word starts where the last ended'],
    ['Sentence Race','Race against time to finish sentences'],
    ['Punctuation Pro','Master commas, periods and special chars'],
    ['Symbol Master','Type !@#$%^&*() without looking'],
    ['Memory Type','Memorize, then type hidden text'],
    ['Speed Ladder','Each round gets 10% faster'],
    ['Endurance Mode','5-minute non-stop marathon'],
    ['Multi-Language','Type words in multiple languages'],
    ['Marathon','The ultimate 10-minute endurance test'],
  ];
  const gameTabs=games.map((g,i)=>`<button class="tm-tab game-tab" onclick="loadGame(${i})" title="${g[1]}">${g[0]}</button>`).join('');
  return `
<div class="mtitle">⌨ Typing Master</div>
<div class="msub">25 games + full tutorial · Build speed, accuracy and consistency</div>
<div class="tm-tabs" id="tm-main-tabs">
  <button class="tm-tab active" onclick="setTMSection('tutorial')">📚 Tutorial</button>
  <button class="tm-tab" onclick="setTMSection('test')">⚡ Speed Test</button>
  <button class="tm-tab" onclick="setTMSection('games')">🎮 25 Games</button>
</div>

<!-- TUTORIAL -->
<div class="tm-content active" id="tms-tutorial">
  <div class="tut-section">
    <h4>🖐 Home Row — The Foundation</h4>
    <div class="tut-tip">Place fingers on home row. Never look at the keyboard.</div>
    <div class="tut-keys">
      ${['A','S','D','F','G','H','J','K','L',';'].map((k,i)=>`<span class="tut-key${[3,4,5,6].includes(i)?' hl':''}">${k}</span>`).join('')}
    </div>
    <div class="tut-tip">Left hand: <b>A S D F</b> (pinky, ring, middle, index). Right hand: <b>J K L ;</b> — both thumbs on Space.</div>
  </div>
  <div class="tut-section">
    <h4>⬆ Top Row</h4>
    <div class="tut-keys">${'QWERTYUIOP'.split('').map(k=>`<span class="tut-key">${k}</span>`).join('')}</div>
    <div class="tut-tip">Reach from home row. Return fingers immediately after each key.</div>
  </div>
  <div class="tut-section">
    <h4>⬇ Bottom Row</h4>
    <div class="tut-keys">${'ZXCVBNM,.'.split('').map(k=>`<span class="tut-key">${k}</span>`).join('')}</div>
  </div>
  <div class="tut-section">
    <h4>💡 Pro Tips</h4>
    <div class="tut-tip">✓ Eyes on screen, never on keyboard · ✓ Maintain rhythm over speed · ✓ Sit upright, wrists neutral</div>
    <div class="tut-tip">✓ Practice 15 min/day consistently · ✓ Fix errors immediately, don't skip · ✓ Use all 10 fingers</div>
  </div>
  <button class="btn util" onclick="setTMSection('test')">Start Speed Test →</button>
</div>

<!-- SPEED TEST -->
<div class="tm-content" id="tms-test">
  <div class="tm-tabs" style="margin-bottom:10px">
    <button class="tm-tab active" onclick="setDiff(this,'easy')">Easy</button>
    <button class="tm-tab" onclick="setDiff(this,'medium')">Medium</button>
    <button class="tm-tab" onclick="setDiff(this,'hard')">Hard</button>
    <button class="tm-tab" onclick="setDiff(this,'code')">Code</button>
    <button class="tm-tab" onclick="setDiff(this,'numbers')">Numbers</button>
  </div>
  <div class="tyarea" id="ty-target"></div>
  <input type="text" class="tyinp" id="ty-input" placeholder="Start typing here…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
  <div class="tystats">
    <div class="tsbox"><div class="tsval" id="ts-wpm">0</div><div class="tslbl">WPM</div></div>
    <div class="tsbox"><div class="tsval" id="ts-acc">—</div><div class="tslbl">Accuracy</div></div>
    <div class="tsbox"><div class="tsval" id="ts-time">60</div><div class="tslbl">Seconds</div></div>
    <div class="tsbox"><div class="tsval" id="ts-streak">0</div><div class="tslbl">Streak</div></div>
  </div>
  <div style="display:flex;gap:7px;margin-top:10px">
    <button class="btn util" style="flex:1" onclick="resetTyping()">🔄 New Text</button>
    <button class="btn" onclick="toggleTimer()" id="tm-timer-btn">▶ Start</button>
  </div>
</div>

<!-- GAMES -->
<div class="tm-content" id="tms-games">
  <div class="tm-tabs" style="flex-wrap:wrap;gap:4px">${gameTabs}</div>
  <div class="game-area" id="game-area">
    <div class="game-title" id="game-title">Select a game above ↑</div>
    <div id="game-body" style="color:var(--text2);font-size:.82rem">Click any of the 25 games to start!</div>
  </div>
  <div id="game-input-area"></div>
</div>`;
}

/* ════════════════════════════════════════
   TYPING MASTER LOGIC
   ════════════════════════════════════════ */
const TX={
  easy:['the quick brown fox jumps over the lazy dog near the river bank on a cold winter morning',
        'she sells sea shells by the sea shore and the shells she sells are surely sea shells',
        'how much wood would a woodchuck chuck if a woodchuck could chuck wood all day long',
        'all the world is a stage and all the men and women are merely players in the story'],
  medium:['technology is best when it brings people together and makes their lives easier and better',
          'the internet has transformed the way we communicate collaborate and create new possibilities',
          'artificial intelligence is changing every industry from healthcare to education and finance',
          'persistence is the most powerful force on earth it can move mountains and change destinies'],
  hard:['the juxtaposition of quintessential characteristics exemplifies extraordinary philosophical contemplation',
        'cryptography utilizes sophisticated mathematical algorithms to ensure cybersecurity and data protection',
        'neuroscience investigates psychological phenomena through biochemical electrochemical neurological frameworks',
        'entrepreneurship requires perseverance resilience creativity and willingness to embrace uncertainty'],
  code:['const result = arr.filter(x => x > 0).map(x => x * 2).reduce((a,b) => a+b, 0);',
        'async function fetchData(url) { const res = await fetch(url); return res.json(); }',
        'class EventEmitter { constructor() { this.ev={}; } on(e,fn) { (this.ev[e]||=[]).push(fn); } }',
        'function quickSort(arr) { if(arr.length<=1) return arr; const p=arr[0]; return [...quickSort(arr.slice(1).filter(x=>x<=p)),p,...quickSort(arr.slice(1).filter(x=>x>p))]; }'],
  numbers:['1234 5678 9012 3456 7890 1234 5678 9012 3456 7890',
           '3.14159 2.71828 1.61803 0.57721 1.41421 1.73205',
           '(123) 456-7890 ext. 001 · 98% · $1,234.56 · #42',
           '192.168.1.1 · 2024-01-15 · 08:30:00 · 100% · v2.4.1'],
};
let TS={active:false,start:null,timer:null,text:'',diff:'easy',typed:0,correct:0,streak:0};

function setTMSection(s){
  document.querySelectorAll('#tm-main-tabs .tm-tab').forEach((t,i)=>{
    t.classList.toggle('active',['tutorial','test','games'][i]===s);
  });
  ['tutorial','test','games'].forEach(id=>{
    const el=$('tms-'+id);if(el)el.classList.toggle('active',id===s);
  });
  if(s==='test')resetTyping();
}
function setDiff(btn,d){
  btn.parentElement.querySelectorAll('.tm-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');TS.diff=d;resetTyping();
}
function resetTyping(){
  clearInterval(TS.timer);
  const arr=TX[TS.diff];
  TS.text=arr[Math.floor(Math.random()*arr.length)];
  TS.active=false;TS.start=null;TS.typed=0;TS.correct=0;TS.streak=0;
  renderTarget('');
  const inp=$('ty-input');if(inp){inp.value='';inp.disabled=false;}
  ['ts-wpm','ts-acc','ts-time','ts-streak'].forEach((id,i)=>{ const e=$(id);if(e)e.textContent=i===2?'60':i===1?'—':'0'; });
  const btn=$('tm-timer-btn');if(btn)btn.textContent='▶ Start';
}
function renderTarget(typed){
  const tgt=$('ty-target');if(!tgt)return;
  let h='';
  for(let i=0;i<TS.text.length;i++){
    const ch=TS.text[i];
    if(i<typed.length) h+=`<span class="${typed[i]===ch?'cor':'wrg'}">${ch}</span>`;
    else if(i===typed.length) h+=`<span class="cur">${ch}</span>`;
    else h+=`<span>${ch}</span>`;
  }
  tgt.innerHTML=h;
}
function toggleTimer(){
  if(!TS.active){
    TS.active=true;TS.start=Date.now();
    let s=60;const btn=$('tm-timer-btn');if(btn)btn.textContent='⏹ Stop';
    TS.timer=setInterval(()=>{
      s--;const e=$('ts-time');if(e)e.textContent=s;
      if(s<=0){clearInterval(TS.timer);endTyping();}
    },1000);
    const inp=$('ty-input');if(inp)inp.focus();
  }else{clearInterval(TS.timer);endTyping();}
}
function endTyping(){
  TS.active=false;const inp=$('ty-input');if(inp)inp.disabled=true;
  const btn=$('tm-timer-btn');if(btn)btn.textContent='▶ Start';
  updateStats(true);
}
function updateStats(final=false){
  if(!TS.start)return;
  const min=(Date.now()-TS.start)/60000;
  const wpm=min>0?Math.round(TS.correct/5/min):0;
  const acc=TS.typed>0?Math.round(TS.correct/TS.typed*100):0;
  const w=$('ts-wpm');if(w)w.textContent=wpm;
  const a=$('ts-acc');if(a)a.textContent=acc+(final?'%':'');
  const sk=$('ts-streak');if(sk)sk.textContent=TS.streak;
}
function initTypingMaster(){
  setTMSection('tutorial');
  resetTyping();
  const inp=$('ty-input');if(!inp)return;
  inp.addEventListener('input',()=>{
    if(!TS.active)return;
    const v=inp.value;
    TS.typed=v.length;TS.correct=0;
    for(let i=0;i<v.length;i++) if(v[i]===TS.text[i]){TS.correct++;if(i===v.length-1)TS.streak++;}else{TS.streak=0;}
    renderTarget(v);updateStats();
    if(v.length>=TS.text.length){clearInterval(TS.timer);endTyping();}
  });
}

/* ── 25 GAMES ── */
let gameTimer=null;
const WORDBANK=['apple','brave','cloud','dance','earth','flame','grace','heart','ivory','jewel',
  'knight','lemon','magic','noble','ocean','pearl','queen','river','storm','tiger',
  'ultra','vivid','water','xenon','youth','zebra','amber','bliss','crisp','delta',
  'eagle','frost','glow','haste','ideal','joust','karma','lunar','mango','nerve',
  'orbit','pizza','quest','radar','solar','thorn','umbra','vapor','whirl','xylem'];
const SENTENCES=['The quick fox jumps.','She runs every morning.','Code never lies.','Type with rhythm.',
  'Practice makes perfect.','Eyes on the screen!','Keep your fingers curved.','Speed comes with accuracy.'];

function loadGame(idx){
  if(gameTimer){clearInterval(gameTimer);clearTimeout(gameTimer);gameTimer=null;}
  const games=[
    gSpeedBurst,gAccuracyMode,gDinoRunner,gWordRain,gBubblePop,gWordScramble,gSpeedBurst,gWordMatch,
    gSentenceBuilder,gGhostWriter,gCodeTyper,gNumberPad,gCapsLock,gReverse,gBlindType,
    gRhythm,gWordChain,gSentenceRace,gPunctuation,gSymbolMaster,gMemoryType,
    gSpeedLadder,gEndurance,gMultiLang,gMarathon
  ];
  const g=games[idx%games.length];
  if(g)g();
}

function gameArea(){return $('game-area');}
function gameInput(){return $('game-input-area');}
function setGameTitle(t){const e=$('game-title');if(e)e.textContent=t;}

function gSpeedBurst(){
  setGameTitle('⚡ Speed Burst — 15 seconds!');
  let score=0,time=15,active=false;
  const words=WORDBANK.sort(()=>Math.random()-.5).slice(0,50);let wi=0;
  gameArea().innerHTML=`<div style="font-size:1.6rem;font-weight:800;color:var(--blue-lt);text-align:center;padding:20px;font-family:var(--mono)" id="gb-word">${words[0]}</div><div style="text-align:center;font-family:var(--mono);font-size:.75rem;color:var(--text3)" id="gb-score">Score: 0 | Time: 15</div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type word and press Enter…" autocomplete="off" autocorrect="off"><br><button class="btn util sm" style="margin-top:7px" onclick="startGame15()" id="gb-start">▶ Start</button>`;
  window.startGame15=()=>{
    active=true;$('gb-start').style.display='none';$('gi').focus();
    gameTimer=setInterval(()=>{time--;if($('gb-score'))$('gb-score').textContent=`Score: ${score} | Time: ${time}`;if(time<=0){clearInterval(gameTimer);active=false;if($('gb-word'))$('gb-word').innerHTML=`🎉 Score: <span style="color:var(--teal)">${score}</span> words!`;}},1000);
  };
  const gi=$('gi');if(gi)gi.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&active){const v=gi.value.trim();if(v===words[wi]){score++;wi++;if(wi>=words.length)wi=0;if($('gb-word'))$('gb-word').textContent=words[wi];}gi.value='';e.preventDefault();}
  });
}

function gWordRain(){
  setGameTitle('🌧 Word Rain — Type falling words!');
  let score=0,misses=0,active=true;
  const area=gameArea();
  area.innerHTML=`<div class="word-rain-area" id="rain-area"></div><div style="font-family:var(--mono);font-size:.72rem;color:var(--text3);margin-top:5px" id="rain-stats">Score: 0 | Misses: 0/5</div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the falling words!" autocomplete="off" autocorrect="off"><button class="btn ghost sm" style="margin-top:6px" onclick="stopRain()">⏹ Stop</button>`;
  window.stopRain=()=>{active=false;if(gameTimer)clearInterval(gameTimer);};
  const ra=$('rain-area');const falling={};let nextId=0;
  function spawnWord(){
    if(!active||!ra)return;
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    const id='rw'+nextId++;
    const el=document.createElement('div');
    el.className='rain-word';el.id=id;el.textContent=w;el.dataset.word=w;
    el.style.left=Math.random()*80+'%';el.style.top='0px';
    ra.appendChild(el);falling[id]={el,w,y:0,speed:0.5+Math.random()*0.8};
  }
  function tick(){
    if(!active)return;
    Object.keys(falling).forEach(id=>{
      const f=falling[id];if(!f.el.parentNode)return;
      f.y+=f.speed;f.el.style.top=f.y+'px';
      if(f.y>170){f.el.remove();delete falling[id];misses++;
        if($('rain-stats'))$('rain-stats').textContent=`Score: ${score} | Misses: ${misses}/5`;
        if(misses>=5){active=false;ra.innerHTML=`<div style="text-align:center;padding:40px;font-size:1.1rem;font-weight:700;color:var(--teal)">Game Over! Score: ${score}</div>`;}}
    });
  }
  gameTimer=setInterval(()=>{tick();if(Math.random()<0.05)spawnWord();},50);spawnWord();
  const gi=$('gi');if(gi)gi.addEventListener('input',()=>{
    const v=gi.value.trim();
    const match=Object.keys(falling).find(id=>falling[id].w===v);
    if(match){falling[match].el.remove();delete falling[match];score++;
      if($('rain-stats'))$('rain-stats').textContent=`Score: ${score} | Misses: ${misses}/5`;
      gi.value='';}
  });
}

function gDinoRunner(){
  setGameTitle('🦕 Dino Runner — Type to jump!');
  const canvas=document.createElement('canvas');
  canvas.id='dino-canvas';canvas.width=Math.min(600,window.innerWidth-40)||560;canvas.height=120;canvas.style.cssText='max-width:100%;border-radius:8px;display:block;margin:0 auto';
  gameArea().innerHTML='';gameArea().appendChild(canvas);
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the word to jump!" autocomplete="off" autocorrect="off" style="margin-top:8px">`;
  const ctx=canvas.getContext('2d');
  let dino={x:60,y:80,vy:0,jumping:false},obstacles=[],score=0,active=true,speed=3;
  let curWord=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
  function spawnObs(){obstacles.push({x:610,w:20,h:30+Math.random()*25});}
  function jump(){if(!dino.jumping){dino.vy=-12;dino.jumping=true;}}
  const gi=$('gi');
  if(gi)gi.addEventListener('input',()=>{
    if(gi.value.trim()===curWord){jump();gi.value='';curWord=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];}
  });
  function draw(){
    ctx.fillStyle='#13131f';ctx.fillRect(0,0,600,120);
    // ground
    ctx.fillStyle='#2a2a40';ctx.fillRect(0,98,600,4);
    // word prompt
    ctx.fillStyle='#f59e0b';ctx.font='bold 14px monospace';ctx.fillText('Type: '+curWord,10,18);
    ctx.fillStyle='#4a4a6a';ctx.font='12px monospace';ctx.fillText('Score: '+score,500,18);
    // dino
    ctx.fillStyle='#1a1aff';
    dino.vy+=0.8;dino.y+=dino.vy;
    if(dino.y>=80){dino.y=80;dino.vy=0;dino.jumping=false;}
    ctx.fillRect(dino.x,dino.y,30,22);
    ctx.fillStyle='#00d4aa';ctx.fillRect(dino.x+20,dino.y+4,8,8);// eye
    // obstacles
    obstacles.forEach(o=>{ o.x-=speed; ctx.fillStyle='#ef4444'; ctx.fillRect(o.x,102-o.h,o.w,o.h); });
    obstacles=obstacles.filter(o=>o.x>-30);
    // collision
    obstacles.forEach(o=>{
      if(dino.x+26>o.x&&dino.x<o.x+o.w&&dino.y+22>102-o.h){active=false;}
    });
    score++;speed=3+score/600;
    if(Math.random()<0.015)spawnObs();
    if(active)requestAnimationFrame(draw);
    else{ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,600,120);ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.fillText('Game Over! Score: '+Math.floor(score/10),150,65);}
  }
  requestAnimationFrame(draw);
}

function gBubblePop(){
  setGameTitle('🫧 Bubble Pop — Type word in bubble!');
  let score=0,active=true;
  gameArea().innerHTML=`<div class="bubble-area" id="ba"></div><div style="font-family:var(--mono);font-size:.72rem;color:var(--text3);margin-top:5px" id="bscore">Score: 0</div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the word in a bubble…" autocomplete="off" autocorrect="off">`;
  const ba=$('ba');const bubbles={};let bid=0;
  const colors=['#1a1aff','#00d4aa','#f59e0b','#a855f7','#ef4444'];
  function spawn(){
    if(!active||!ba)return;
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    const id='b'+bid++;const size=50+w.length*8;
    const el=document.createElement('div');
    el.className='bubble';el.id=id;el.dataset.w=w;el.textContent=w;
    el.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*(280-size)}px;bottom:-${size}px;background:${colors[Math.floor(Math.random()*colors.length)]}33;border:2px solid ${colors[Math.floor(Math.random()*colors.length)]};color:var(--text);font-size:${Math.max(10,14-w.length)}px;animation-duration:${5+Math.random()*4}s`;
    ba.appendChild(el);bubbles[id]={el,w};
    el.addEventListener('animationend',()=>{el.remove();delete bubbles[id];});
  }
  gameTimer=setInterval(()=>{if(active&&Math.random()<0.06)spawn();},200);
  const gi=$('gi');if(gi)gi.addEventListener('input',()=>{
    const v=gi.value.trim();
    const m=Object.keys(bubbles).find(id=>bubbles[id].w===v);
    if(m){bubbles[m].el.style.transform='scale(2)';bubbles[m].el.style.opacity='0';setTimeout(()=>{try{bubbles[m].el.remove();}catch{}delete bubbles[m];},200);score++;if($('bscore'))$('bscore').textContent='Score: '+score;gi.value='';}
  });
}

function gWordScramble(){
  setGameTitle('🔀 Word Scramble — Unscramble the word!');
  let score=0,skips=3;
  function newWord(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    const sc=w.split('').sort(()=>Math.random()-.5).join('');
    gameArea().innerHTML=`<div style="font-size:1.8rem;font-weight:800;letter-spacing:.15em;text-align:center;color:var(--amber);padding:18px;font-family:var(--mono)">${sc.toUpperCase()}</div><div style="text-align:center;font-family:var(--mono);font-size:.72rem;color:var(--text3)">Score: ${score} | Skips: ${skips}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type unscrambled word…" autocomplete="off" autocorrect="off"><div style="display:flex;gap:7px;margin-top:6px"><button class="btn ghost sm" onclick="window._wsSkip&&window._wsSkip()">⏭ Skip (${skips})</button></div>`;
    window._wsSkip=()=>{if(skips>0){skips--;newWord();}};
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim().toLowerCase()===w){score++;newWord();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  newWord();
}

function gWordMatch(){
  setGameTitle('🎯 Word Match — Type the matching word!');
  const pairs=[['fast','swift'],['big','large'],['happy','joyful'],['cold','chilly'],['smart','clever'],
    ['brave','bold'],['tired','weary'],['kind','gentle'],['dark','gloomy'],['clean','neat']];
  let score=0,qi=0;
  function next(){
    if(qi>=pairs.length){gameArea().innerHTML=`<div style="text-align:center;padding:30px;font-size:1.1rem;font-weight:700;color:var(--teal)">🎉 Completed! Score: ${score}/${pairs.length}</div>`;gameInput().innerHTML='';return;}
    const [q,a]=pairs[qi];const wrongs=WORDBANK.filter(w=>w!==a).sort(()=>Math.random()-.5).slice(0,3);
    const opts=[a,...wrongs].sort(()=>Math.random()-.5);
    gameArea().innerHTML=`<div class="wm-word">${q.toUpperCase()}</div><div class="wm-choices">${opts.map(o=>`<button class="wm-btn" onclick="window._wma('${o}','${a}')">${o}</button>`).join('')}</div><div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:8px">Score: ${score} | Q: ${qi+1}/${pairs.length}</div>`;
    gameInput().innerHTML='';
    window._wma=(chosen,correct)=>{
      document.querySelectorAll('.wm-btn').forEach(b=>{b.classList.toggle('correct',b.textContent===correct);b.classList.toggle('wrong',b.textContent===chosen&&chosen!==correct);b.disabled=true;});
      if(chosen===correct)score++;qi++;setTimeout(next,700);
    };
  }
  next();
}

function gCodeTyper(){
  setGameTitle('💻 Code Typer — Master the keyboard!');
  const snippets=['const x = 42;','let arr = [];','if (x > 0) {','return null;','async () => {}','arr.push(x);','x += 1;','const fn = () => x*2;'];
  let si=0,score=0;
  function next(){
    if(si>=snippets.length)si=0;
    const code=snippets[si++];
    gameArea().innerHTML=`<div style="font-family:var(--mono);font-size:1rem;color:var(--blue-lt);background:var(--bg4);padding:14px;border-radius:7px;letter-spacing:.05em">${code}</div><div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:6px">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the code exactly…" autocomplete="off" autocorrect="off" spellcheck="false" style="font-family:var(--mono)">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value===code){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},500);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gNumberPad(){
  setGameTitle('🔢 Number Pad — Type numbers fast!');
  let score=0;
  function next(){
    const n=Array.from({length:8},()=>Math.floor(Math.random()*10)).join(' ');
    gameArea().innerHTML=`<div style="font-size:2rem;font-weight:800;letter-spacing:.2em;text-align:center;padding:20px;font-family:var(--mono);color:var(--text)">${n}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the numbers…" autocomplete="off" autocorrect="off" spellcheck="false" style="font-family:var(--mono)">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.replace(/\s/g,'')==n.replace(/\s/g,'')){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gCapsLock(){
  setGameTitle('🔠 Caps Lock — Type in UPPERCASE!');
  let score=0;
  function next(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)].toUpperCase();
    gameArea().innerHTML=`<div style="font-size:1.6rem;font-weight:800;text-align:center;padding:18px;font-family:var(--mono);color:var(--text)">${w}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type in UPPERCASE…" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===w){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gReverse(){
  setGameTitle('🔁 Reverse Type — Type the word backwards!');
  let score=0;
  function next(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    const rev=w.split('').reverse().join('');
    gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:16px;font-family:var(--mono);color:var(--text)">${w}</div><div style="font-size:.75rem;font-family:var(--mono);text-align:center;color:var(--text3)">Type backwards | Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type it backwards…" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===rev){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gBlindType(){
  setGameTitle('🙈 Blind Type — Type without seeing!');
  let score=0;
  function next(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:16px;font-family:var(--mono);color:var(--text)">${w}</div><div style="font-size:.75rem;font-family:var(--mono);text-align:center;color:var(--text3)">Memorize it! Score: ${score}</div>`;
    gameInput().innerHTML='';
    setTimeout(()=>{
      gameArea().querySelector('div').textContent='????????';
      gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Now type from memory…" autocomplete="off" autocorrect="off" style="-webkit-text-security:disc">`;
      const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){gi.style.webkitTextSecurity='';if(gi.value.trim()===w){score++;next();}else{gi.style.borderColor='var(--red)';gi.value='';gi.placeholder='Wrong! Was: '+w;setTimeout(()=>next(),1200);}e.preventDefault();}});}
    },2000);
  }
  next();
}

function gRhythm(){
  setGameTitle('🥁 Rhythm Type — Type to the beat!');
  let beat=0,score=0,active=true;
  const words=WORDBANK.slice(0,20);let wi=0;
  gameArea().innerHTML=`<div id="rb" style="text-align:center;padding:10px;font-family:var(--mono)">
    <div id="rbeat" style="font-size:3rem;transition:transform .1s">🥁</div>
    <div id="rword" style="font-size:1.4rem;font-weight:800;color:var(--blue-lt);margin-top:8px">${words[0]}</div>
    <div id="rscore" style="font-size:.7rem;color:var(--text3);margin-top:4px">Score: 0</div>
  </div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type on the beat…" autocomplete="off" autocorrect="off">`;
  let interval=600;
  gameTimer=setInterval(()=>{
    if(!active)return;beat++;
    const rb=$('rbeat');if(rb){rb.style.transform='scale(1.4)';setTimeout(()=>{if(rb)rb.style.transform='scale(1)';},100);}
  },interval);
  const gi=$('gi');if(gi)gi.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&active){if(gi.value.trim()===words[wi]){score++;wi=(wi+1)%words.length;if($('rword'))$('rword').textContent=words[wi];if($('rscore'))$('rscore').textContent='Score: '+score;}gi.value='';e.preventDefault();}
  });
}

function gWordChain(){
  setGameTitle('🔗 Word Chain — Start where last ended!');
  let score=0,lastChar='a';
  const validWords=WORDBANK.filter(w=>w.length>2);
  function next(){
    const options=validWords.filter(w=>w[0]===lastChar);
    if(!options.length){gameArea().innerHTML=`<div style="text-align:center;padding:30px;font-size:1.1rem;color:var(--teal)">Chain complete! Score: ${score}</div>`;gameInput().innerHTML='';return;}
    gameArea().innerHTML=`<div style="text-align:center;padding:10px">
      <div style="font-family:var(--mono);font-size:.75rem;color:var(--text3)">Word must start with: <span style="color:var(--blue-lt);font-size:1.2rem;font-weight:800">${lastChar.toUpperCase()}</span></div>
      <div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:5px">Score: ${score}</div>
    </div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type word starting with '${lastChar}'…" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){const v=gi.value.trim().toLowerCase();if(v[0]===lastChar&&validWords.includes(v)){score++;lastChar=v[v.length-1];next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gSentenceRace(){
  setGameTitle('🏁 Sentence Race — Complete before time!');
  let score=0,si=0;
  function next(){
    const s=SENTENCES[si%SENTENCES.length];si++;
    let t=10;
    gameArea().innerHTML=`<div style="font-size:.95rem;padding:14px;background:var(--bg4);border-radius:7px;font-family:var(--mono)">${s}</div><div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:5px" id="sr-info">Time: ${t}s | Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the sentence…" autocomplete="off" autocorrect="off">`;
    const interval=setInterval(()=>{t--;const el=$('sr-info');if(el)el.textContent=`Time: ${t}s | Score: ${score}`;if(t<=0){clearInterval(interval);const gi=$('gi');if(gi){gi.disabled=true;gi.style.borderColor='var(--red)';}setTimeout(next,1000);}},1000);
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){clearInterval(interval);if(gi.value.trim()===s.replace(/[.,!?]/g,'').trim()||gi.value.trim()===s){score++;}gi.value='';next();e.preventDefault();}});}
  }
  next();
}

function gPunctuation(){
  setGameTitle('., Punctuation Pro — Master special chars!');
  const phrases=['Hello, World!','It\'s a test.','Are you ready?','Type: 1, 2, 3.','Wait... what?'];
  let score=0,pi=0;
  function next(){
    const p=phrases[pi%phrases.length];pi++;
    gameArea().innerHTML=`<div style="font-size:1.1rem;font-family:var(--mono);text-align:center;padding:16px;color:var(--text)">${p}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Score: ${score} — Include punctuation!</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type exactly with punctuation…" autocomplete="off" autocorrect="off" spellcheck="false">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value===p){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},500);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gSymbolMaster(){
  setGameTitle('! Symbol Master — Type special characters!');
  const sym=['!@#$','%^&*','()+_','{}|"','<>?~'];let score=0,si=0;
  function next(){
    const s=sym[si%sym.length];si++;
    gameArea().innerHTML=`<div style="font-size:2.5rem;font-weight:800;letter-spacing:.3em;text-align:center;padding:18px;font-family:var(--mono);color:var(--amber)">${s}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type the symbols exactly…" autocomplete="off" autocorrect="off" spellcheck="false" style="font-family:var(--mono)">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('input',()=>{if(gi.value===s){score++;next();}});}
  }
  next();
}

function gMemoryType(){
  setGameTitle('🧠 Memory Type — Memorize then type!');
  let score=0;
  function next(){
    const count=3+Math.min(score,4);
    const words=WORDBANK.sort(()=>Math.random()-.5).slice(0,count);
    gameArea().innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:14px">${words.map(w=>`<span style="background:var(--bg4);border:1px solid var(--border2);padding:5px 12px;border-radius:6px;font-family:var(--mono);font-size:.85rem;color:var(--teal)">${w}</span>`).join('')}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Memorize! Score: ${score}</div>`;
    gameInput().innerHTML='';
    setTimeout(()=>{
      gameArea().innerHTML=`<div style="text-align:center;padding:22px;font-size:1rem;color:var(--text2)">Words hidden! Type them separated by spaces.</div>`;
      gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="word1 word2 word3…" autocomplete="off" autocorrect="off">`;
      const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){const typed=gi.value.trim().split(' ').map(w=>w.toLowerCase());const correct=words.every(w=>typed.includes(w))&&typed.every(w=>words.includes(w));if(correct){score++;}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},500);}gi.value='';next();e.preventDefault();}});}
    },2500);
  }
  next();
}

function gSpeedLadder(){
  setGameTitle('🪜 Speed Ladder — Each level gets faster!');
  let level=1,score=0;
  const totalTime=()=>Math.max(1500,4000-level*300);
  function next(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    let t=totalTime()/1000,ti;
    gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:14px;font-family:var(--mono);color:var(--text)">${w}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)" id="sl-info">Level ${level} | Time: ${t.toFixed(1)}s | Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type fast!" autocomplete="off" autocorrect="off">`;
    const it=setInterval(()=>{t-=0.1;const e=$('sl-info');if(e)e.textContent=`Level ${level} | Time: ${Math.max(0,t).toFixed(1)}s | Score: ${score}`;if(t<=0){clearInterval(it);gameArea().innerHTML=`<div style="text-align:center;padding:28px;font-size:1.1rem;color:var(--teal)">Time's up! Final Score: ${score}</div>`;gameInput().innerHTML='';}}
    ,100);
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){clearInterval(it);if(gi.value.trim()===w){score++;level++;}gi.value='';next();e.preventDefault();}});}
  }
  next();
}

function gEndurance(){
  setGameTitle('💪 Endurance Mode — 5-minute marathon!');
  let score=0,time=300,wi=0;
  const words=WORDBANK.sort(()=>Math.random()-.5);
  gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:14px;font-family:var(--mono);color:var(--text)" id="end-word">${words[0]}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)" id="end-info">Score: 0 | Time: 5:00</div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type word and press Enter…" autocomplete="off" autocorrect="off">`;
  gameTimer=setInterval(()=>{time--;const m=Math.floor(time/60);const s=time%60;const e=$('end-info');if(e)e.textContent=`Score: ${score} | Time: ${m}:${s<10?'0'+s:s}`;if(time<=0){clearInterval(gameTimer);if($('end-word'))$('end-word').innerHTML=`🏆 Done! Score: <span style="color:var(--teal)">${score}</span>`;const gi=$('gi');if(gi)gi.disabled=true;}},1000);
  const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===words[wi%words.length]){score++;wi++;if($('end-word'))$('end-word').textContent=words[wi%words.length];}gi.value='';e.preventDefault();}});}
}

function gMultiLang(){
  setGameTitle('🌐 Multi-Language — Type in different scripts!');
  const mw=[['नमस्ते','Namaste'],['धन्यवाद','Thank you'],['शुभकामना','Good luck'],['hello','Hello'],['world','World']];
  let score=0,mi=0;
  function next(){
    const [w,hint]=mw[mi%mw.length];mi++;
    gameArea().innerHTML=`<div style="font-size:1.8rem;font-weight:800;text-align:center;padding:16px;color:var(--text);unicode-bidi:plaintext">${w}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)">Transliteration: ${hint} | Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type in the shown script…" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===w||gi.value.trim().toLowerCase()===hint.toLowerCase()){score++;next();}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},400);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gMarathon(){
  setGameTitle('🏃 Marathon — 10-minute ultimate test!');
  let score=0,time=600,wi=0;
  const words=[...WORDBANK,...WORDBANK,...WORDBANK].sort(()=>Math.random()-.5);
  gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:14px;font-family:var(--mono);color:var(--text)" id="mar-w">${words[0]}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:var(--text3)" id="mar-i">Score: 0 | Time: 10:00</div>`;
  gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="10-minute marathon!" autocomplete="off" autocorrect="off">`;
  gameTimer=setInterval(()=>{time--;const m=Math.floor(time/60);const s=time%60;const e=$('mar-i');if(e)e.textContent=`Score: ${score} | Time: ${m}:${s<10?'0'+s:s}`;if(time<=0){clearInterval(gameTimer);if($('mar-w'))$('mar-w').innerHTML=`🏅 Marathon done! Score: <span style="color:var(--teal)">${score}</span>`;const gi=$('gi');if(gi)gi.disabled=true;}},1000);
  const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===words[wi%words.length]){score++;wi++;if($('mar-w'))$('mar-w').textContent=words[wi%words.length];}gi.value='';e.preventDefault();}});}
}

function gSentenceBuilder(){
  setGameTitle('🏗 Sentence Builder — Build word by word!');
  let score=0;
  function next(){
    const s=SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
    const words=s.replace(/[.,!?]/g,'').split(' ');
    let wi=0;
    gameArea().innerHTML=`<div style="font-family:var(--mono);font-size:.82rem;color:var(--text2);padding:10px;background:var(--bg4);border-radius:6px;min-height:40px" id="sb-built"></div><div style="font-family:var(--mono);font-size:.75rem;color:var(--blue-lt);margin-top:6px" id="sb-next">Next word: <strong>${words[0]}</strong></div><div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:3px">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type: ${words[0]}" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim().toLowerCase()===words[wi].toLowerCase()){wi++;const built=$('sb-built');if(built)built.textContent=words.slice(0,wi).join(' ');if(wi>=words.length){score++;setTimeout(next,600);}else{const nx=$('sb-next');if(nx)nx.innerHTML=`Next word: <strong>${words[wi]}</strong>`;gi.placeholder='Type: '+words[wi];}}else{gi.style.borderColor='var(--red)';setTimeout(()=>{if(gi)gi.style.borderColor='';},300);}gi.value='';e.preventDefault();}});}
  }
  next();
}

function gGhostWriter(){
  setGameTitle('👻 Ghost Writer — Copy the cursor!');
  let score=0;
  function next(){
    const txt=TX.easy[Math.floor(Math.random()*TX.easy.length)];
    const words=txt.split(' ').slice(0,8).join(' ');
    gameArea().innerHTML=`<div style="font-family:var(--mono);font-size:.9rem;line-height:1.8;padding:12px;background:var(--bg4);border-radius:7px">${words.split('').map(c=>`<span class="ghost-ch" style="color:var(--text3)">${c}</span>`).join('')}</div><div style="font-family:var(--mono);font-size:.7rem;color:var(--text3);margin-top:5px">Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type it!" autocomplete="off" autocorrect="off" spellcheck="false">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('input',()=>{
      const v=gi.value;const spans=document.querySelectorAll('.ghost-ch');
      spans.forEach((s,i)=>{s.style.color=i<v.length?(v[i]===words[i]?'var(--teal)':'var(--red)'):'var(--text3)';});
      if(v.length>=words.length){score++;setTimeout(next,600);}
    });}
  }
  next();
}

function gAccuracyMode(){
  setGameTitle('🎯 Accuracy Mode — Zero errors goal!');
  let score=0,errors=0;
  function next(){
    const w=WORDBANK[Math.floor(Math.random()*WORDBANK.length)];
    gameArea().innerHTML=`<div style="font-size:1.5rem;font-weight:800;text-align:center;padding:16px;font-family:var(--mono);color:var(--text)">${w}</div><div style="text-align:center;font-family:var(--mono);font-size:.7rem;color:${errors===0?'var(--teal)':'var(--red)'}">Errors: ${errors} | Score: ${score}</div>`;
    gameInput().innerHTML=`<input type="text" class="tyinp" id="gi" placeholder="Type exactly…" autocomplete="off" autocorrect="off">`;
    const gi=$('gi');if(gi){gi.focus();gi.addEventListener('keydown',e=>{if(e.key==='Enter'){if(gi.value.trim()===w){score++;}else{errors++;}gi.value='';next();e.preventDefault();}});}
  }
  next();
}

/* Resize mode switch */
let _rmode='px';
function setResizeMode(btn,mode){
  _rmode=mode;
  document.querySelectorAll('.rtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['px','pct','size','dpi'].forEach(m=>{ const el=$('resize-'+m);if(el)el.style.display=m===mode?'flex':'none'; });
}

/* ════════════════════════════════════════
   PDF TOOLS
   ════════════════════════════════════════ */

async function runPdfOcr(){
  const files=FS['pdf-ocr-text'];
  if(!files?.length){SS('pdf-ocr-text','Please select a PDF.','er');return;}
  let lang=$('ocr-lang-override')?.value||'auto';
  const scale=parseFloat($('ocr-scale')?.value||'2.5');
  const out=$('ocr-out')?.value||'file';
  SS('pdf-ocr-text','Loading PDF…','info');SP('pdf-ocr-text',3,true);
  try{
    const ab=await rdAB(files[0]);
    const pdf=await loadPDF(ab);
    // Auto-detect language
    if(lang==='auto'){
      SS('pdf-ocr-text','Detecting language…','info');
      lang=await autoDetectLang(pdf);
      SS('pdf-ocr-text',`Detected: ${LANG_NAMES[lang]||lang} — loading OCR…`,'info');
    } else {
      SS('pdf-ocr-text',`Using ${LANG_NAMES[lang]||lang} — loading OCR…`,'info');
    }
    const worker=await getWorker(lang);
    let fullText=`[FileWork OCR — Language: ${LANG_NAMES[lang]||lang}]\n\n`;
    for(let p=1;p<=pdf.numPages;p++){
      SS('pdf-ocr-text',`OCR page ${p}/${pdf.numPages} (${LANG_NAMES[lang]||lang})…`,'info');
      const page=await pdf.getPage(p);
      const du=await ocrPage(page,scale);
      const res=await worker.recognize(du);
      fullText+=`\n── Page ${p} ──\n${res.data.text.normalize('NFC')}\n`;
    }
    SP('pdf-ocr-text',100,true);
    if(out==='screen'){const box=$('ocr-box');if(box){box.textContent=fullText;box.style.display='block';}}
    const blob=new Blob(['\ufeff'+fullText],{type:'text/plain;charset=utf-8'});
    AD('dl-pdf-ocr-text',blob,files[0].name.replace(/\.pdf$/i,`_ocr_${lang}.txt`));
    SS('pdf-ocr-text',`✓ Done! ${pdf.numPages} pages · Language: ${LANG_NAMES[lang]||lang}`,'ok');
  }catch(e){SS('pdf-ocr-text','✗ '+e.message,'er');}
  HP('pdf-ocr-text');
}

async function runPdfToWord(){
  const files=FS['pdf-to-word'];
  if(!files?.length){SS('pdf-to-word','Please select a PDF.','er');return;}
  SS('pdf-to-word','Analyzing document language…','info');SP('pdf-to-word',3);
  try{
    const ab=await rdAB(files[0]);
    const pdf=await loadPDF(ab);
    // Try embedded text first
    let sample='';
    for(let p=1;p<=Math.min(2,pdf.numPages);p++){
      const pg=await pdf.getPage(p);const c=await pg.getTextContent();
      sample+=c.items.map(i=>i.str).join(' ');
    }
    const hasText=sample.trim().length>50;
    let fullText='';
    if(hasText){
      // Use embedded text extraction
      const detectedLang=detectScript(sample);
      SS('pdf-to-word',`Embedded text found (${LANG_NAMES[detectedLang]||'English'}) — extracting…`,'info');
      for(let p=1;p<=pdf.numPages;p++){
        SP('pdf-to-word',5+(p/pdf.numPages)*85);
        const page=await pdf.getPage(p);
        const content=await page.getTextContent({includeMarkedContent:false});
        fullText+=`\n── Page ${p} ──\n`;
        const sorted=content.items.sort((a,b)=>(a.transform?-a.transform[5]:0)-(b.transform?-b.transform[5]:0));
        let lastY=null,line='';
        for(const item of sorted){if(!item.str)continue;const y=item.transform?Math.round(item.transform[5]):0;if(lastY!==null&&Math.abs(y-lastY)>3){fullText+=line.normalize('NFC')+'\n';line='';}lastY=y;line+=item.str;}
        if(line)fullText+=line.normalize('NFC')+'\n';
      }
    } else {
      // OCR mode
      const lang=await autoDetectLang(pdf)||'eng';
      SS('pdf-to-word',`Scanned PDF detected — OCR (${LANG_NAMES[lang]||lang})…`,'info');
      const worker=await getWorker(lang);
      for(let p=1;p<=pdf.numPages;p++){
        SS('pdf-to-word',`OCR page ${p}/${pdf.numPages}…`,'info');
        const page=await pdf.getPage(p);
        const du=await ocrPage(page,2.5);
        const res=await worker.recognize(du);
        fullText+=`\n── Page ${p} ──\n${res.data.text.normalize('NFC')}\n`;
      }
    }
    // Build RTF
    function toRtf(s){let o='';for(const c of s){const n=c.codePointAt(0);if(n<128){o+=c==='\\'?'\\\\':c==='{'?'\\{':c==='}'?'\\}':c==='\n'?'\\par\n':c;}else if(n<32768){o+=`\\u${n}?`;}else{o+=`\\u${n-65536}?`;}}return o;}
    const rtf=`{\\rtf1\\ansi\\ansicpg65001\\deff0{\\fonttbl{\\f0\\froman\\fcharset0 Arial Unicode MS;}}\\f0\\fs24 ${toRtf(fullText)}}`;
    AD('dl-pdf-to-word',new Blob([rtf],{type:'application/rtf'}),files[0].name.replace(/\.pdf$/i,'.rtf'));
    SS('pdf-to-word',`✓ Converted! (${hasText?'embedded text':'OCR mode'})`,'ok');
  }catch(e){SS('pdf-to-word','✗ '+e.message,'er');}
  HP('pdf-to-word');
}

async function runPdfToTxt(){
  const files=FS['pdf-to-txt'];
  if(!files?.length){SS('pdf-to-txt','Please select a PDF.','er');return;}
  const sep=$('pt-sep')?.value||'line';
  SS('pdf-to-txt','Extracting text…');SP('pdf-to-txt',5);
  try{
    const ab=await rdAB(files[0]);const pdf=await loadPDF(ab);let out='';
    for(let p=1;p<=pdf.numPages;p++){
      SP('pdf-to-txt',5+(p/pdf.numPages)*88);
      const page=await pdf.getPage(p);
      const content=await page.getTextContent({includeMarkedContent:false});
      if(sep==='line')out+=`\n── Page ${p} ──\n`;else if(sep==='blank')out+='\n\n';
      const sorted=content.items.sort((a,b)=>(a.transform?-a.transform[5]:0)-(b.transform?-b.transform[5]:0));
      let lastY=null,line='';
      for(const item of sorted){if(!item.str)continue;const y=item.transform?Math.round(item.transform[5]):0;if(lastY!==null&&Math.abs(y-lastY)>3){out+=line.normalize('NFC')+'\n';line='';}lastY=y;line+=item.str;}
      if(line)out+=line.normalize('NFC')+'\n';
    }
    AD('dl-pdf-to-txt',new Blob(['\ufeff'+out],{type:'text/plain;charset=utf-8'}),files[0].name.replace(/\.pdf$/i,'.txt'));
    SS('pdf-to-txt',`✓ ${pdf.numPages} pages extracted. For scanned PDFs use PDF OCR tool.`,'ok');
  }catch(e){SS('pdf-to-txt','✗ '+e.message,'er');}
  HP('pdf-to-txt');
}

async function runPdfToExcel(){
  const files=FS['pdf-to-excel'];
  if(!files?.length){SS('pdf-to-excel','Please select a PDF.','er');return;}
  const mode=$('pxl-mode')?.value||'auto';
  SS('pdf-to-excel','Processing…');SP('pdf-to-excel',5);
  try{
    const ab=await rdAB(files[0]);const pdf=await loadPDF(ab);
    const allRows=[];let usedOcr=false;
    for(let p=1;p<=pdf.numPages;p++){
      SP('pdf-to-excel',5+(p/pdf.numPages)*80);
      const page=await pdf.getPage(p);
      const content=await page.getTextContent({includeMarkedContent:false});
      const hasText=content.items.length>5;
      if(mode==='ocr'||(mode==='auto'&&!hasText)){
        usedOcr=true;
        const lang=await autoDetectLang(pdf)||'eng';
        SS('pdf-to-excel',`OCR page ${p} (${LANG_NAMES[lang]||lang})…`,'info');
        const worker=await getWorker(lang);
        const du=await ocrPage(page,2);
        const res=await worker.recognize(du);
        res.data.text.split('\n').filter(l=>l.trim()).forEach(line=>{
          const cells=line.split(/\s{2,}|\t/).map(c=>c.trim()).filter(Boolean);
          if(cells.length)allRows.push(cells);
        });
      } else {
        const byY={};
        content.items.forEach(item=>{if(!item.str?.trim())return;const y=Math.round(item.transform[5]/5)*5;if(!byY[y])byY[y]=[];byY[y].push({x:item.transform[4],str:item.str});});
        Object.keys(byY).sort((a,b)=>b-a).forEach(y=>{
          const row=byY[y].sort((a,b)=>a.x-b.x).map(i=>i.str.normalize('NFC'));
          if(row.join('').trim())allRows.push(row);
        });
      }
    }
    // Preview
    const prev=$('excel-prev');
    if(prev&&allRows.length){const mc=Math.max(...allRows.map(r=>r.length));prev.innerHTML=`<table><thead><tr>${Array.from({length:mc},(_,i)=>`<th>Col ${i+1}</th>`).join('')}</tr></thead><tbody>${allRows.slice(0,25).map(r=>`<tr>${Array.from({length:mc},(_,i)=>`<td>${r[i]||''}</td>`).join('')}</tr>`).join('')}</tbody></table>${allRows.length>25?`<p style="font-size:.68rem;color:var(--text3);padding:5px;font-family:var(--mono)">${allRows.length-25} more rows in file…</p>`:''}`;}    const ws=XLSX.utils.aoa_to_sheet(allRows);
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Sheet1');
    const buf=XLSX.write(wb,{type:'array',bookType:'xlsx'});
    AD('dl-pdf-to-excel',new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),files[0].name.replace(/\.pdf$/i,'.xlsx'));
    SS('pdf-to-excel',`✓ ${allRows.length} rows extracted${usedOcr?' (OCR)':''}!`,'ok');
  }catch(e){SS('pdf-to-excel','✗ '+e.message,'er');}
  HP('pdf-to-excel');
}

async function runPdfToJpg(){
  const files=FS['pdf-to-jpg'];if(!files?.length){SS('pdf-to-jpg','Please select a PDF.','er');return;}
  const fmt=$('pj-fmt')?.value||'jpeg';const q=parseFloat($('pj-quality')?.value||'.9');const sc=parseFloat($('pj-sc')?.value||'2');
  SS('pdf-to-jpg','Rendering…');SP('pdf-to-jpg',2);
  try{
    const ab=await rdAB(files[0]);const pdf=await loadPDF(ab);
    for(let i=1;i<=pdf.numPages;i++){
      SP('pdf-to-jpg',2+(i/pdf.numPages)*93);
      const page=await pdf.getPage(i);const vp=page.getViewport({scale:sc});
      const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
      const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,vp.width,vp.height);
      await page.render({canvasContext:ctx,viewport:vp}).promise;
      AD('dl-pdf-to-jpg',await toBlob(c,'image/'+fmt,q),`page-${String(i).padStart(3,'0')}.${fmt==='jpeg'?'jpg':'png'}`);
    }
    SS('pdf-to-jpg',`✓ ${pdf.numPages} images!`,'ok');
  }catch(e){SS('pdf-to-jpg','✗ '+e.message,'er');}HP('pdf-to-jpg');
}

async function runMergePdf(){
  const files=FS['merge-pdf'];if(!files||files.length<2){SS('merge-pdf','Select ≥2 PDFs.','er');return;}
  SS('merge-pdf','Merging…');SP('merge-pdf',5);
  try{const{PDFDocument:P}=PDFLib;const out=await P.create();
    for(let i=0;i<files.length;i++){SP('merge-pdf',5+(i/files.length)*90);const ab=await rdAB(files[i]);const src=await P.load(ab,{ignoreEncryption:true});const pp=await out.copyPages(src,src.getPageIndices());pp.forEach(p=>out.addPage(p));}
    AD('dl-merge-pdf',new Blob([await out.save()],{type:'application/pdf'}),'merged.pdf');
    SS('merge-pdf',`✓ ${files.length} PDFs merged!`,'ok');
  }catch(e){SS('merge-pdf','✗ '+e.message,'er');}HP('merge-pdf');
}

async function runSplitPdf(){
  const files=FS['split-pdf'];if(!files?.length){SS('split-pdf','Please select a PDF.','er');return;}
  const rs=$('sp-range')?.value.trim();SS('split-pdf','Splitting…');SP('split-pdf',5);
  try{const{PDFDocument:P}=PDFLib;const ab=await rdAB(files[0]);const src=await P.load(ab,{ignoreEncryption:true});const total=src.getPageCount();
    const groups=rs?parseRng(rs,total):Array.from({length:total},(_,i)=>[i]);
    for(let g=0;g<groups.length;g++){SP('split-pdf',5+(g/groups.length)*92);const nd=await P.create();const pp=await nd.copyPages(src,groups[g]);pp.forEach(p=>nd.addPage(p));AD('dl-split-pdf',new Blob([await nd.save()],{type:'application/pdf'}),`p${groups[g].map(n=>n+1).join('-')}.pdf`);}
    SS('split-pdf',`✓ ${groups.length} files!`,'ok');
  }catch(e){SS('split-pdf','✗ '+e.message,'er');}HP('split-pdf');
}
function parseRng(s,t){const g=[];s.split(',').forEach(p=>{p=p.trim();if(p.includes('-')){const[a,b]=p.split('-').map(n=>parseInt(n.trim())-1);const pp=[];for(let i=a;i<=Math.min(b,t-1);i++)pp.push(i);if(pp.length)g.push(pp);}else{const n=parseInt(p)-1;if(n>=0&&n<t)g.push([n]);}});return g;}

async function runCompressPdf(){
  const files=FS['compress-pdf'];if(!files?.length){SS('compress-pdf','Please select a PDF.','er');return;}
  SS('compress-pdf','Optimizing…');SP('compress-pdf',20);
  try{const{PDFDocument:P}=PDFLib;const ab=await rdAB(files[0]);const pdf=await P.load(ab,{ignoreEncryption:true});SP('compress-pdf',75);const bytes=await pdf.save({useObjectStreams:true});const blob=new Blob([bytes],{type:'application/pdf'});AD('dl-compress-pdf',blob,'compressed_'+files[0].name);SS('compress-pdf',`✓ ${fmtSz(blob.size)} (was ${fmtSz(files[0].size)})`,'ok');}catch(e){SS('compress-pdf','✗ '+e.message,'er');}HP('compress-pdf');
}

async function runRotatePdf(){
  const files=FS['rotate-pdf'];if(!files?.length){SS('rotate-pdf','Please select a PDF.','er');return;}
  const a=parseInt($('rp-a')?.value||'90');SS('rotate-pdf','Rotating…');SP('rotate-pdf',15);
  try{const{PDFDocument:P,degrees}=PDFLib;const ab=await rdAB(files[0]);const pdf=await P.load(ab,{ignoreEncryption:true});pdf.getPages().forEach(p=>p.setRotation(degrees(a)));AD('dl-rotate-pdf',new Blob([await pdf.save()],{type:'application/pdf'}),'rotated_'+files[0].name);SS('rotate-pdf',`✓ Rotated ${a}°!`,'ok');}catch(e){SS('rotate-pdf','✗ '+e.message,'er');}HP('rotate-pdf');
}

async function runWatermarkPdf(){
  const files=FS['watermark-pdf'];if(!files?.length){SS('watermark-pdf','Please select a PDF.','er');return;}
  const text=$('wp-t')?.value||'FileWork';const op=parseFloat($('wp-op')?.value||'.2');
  SS('watermark-pdf','Adding watermark…');SP('watermark-pdf',5);
  try{const{PDFDocument:P,rgb,StandardFonts,degrees}=PDFLib;const ab=await rdAB(files[0]);const pdf=await P.load(ab,{ignoreEncryption:true});const font=await pdf.embedFont(StandardFonts.HelveticaBold);const pages=pdf.getPages();
    for(let i=0;i<pages.length;i++){SP('watermark-pdf',5+(i/pages.length)*90);const page=pages[i];const{width,height}=page.getSize();const fs=Math.min(width,height)*.11;const tw=font.widthOfTextAtSize(text,fs);page.drawText(text,{x:(width-tw)/2,y:(height-fs)/2,size:fs,font,color:rgb(.4,.4,.4),opacity:op,rotate:degrees(45)});}
    AD('dl-watermark-pdf',new Blob([await pdf.save()],{type:'application/pdf'}),'watermarked_'+files[0].name);SS('watermark-pdf',`✓ Added to ${pages.length} pages!`,'ok');
  }catch(e){SS('watermark-pdf','✗ '+e.message,'er');}HP('watermark-pdf');
}

async function runProtect(){
  const files=FS['protect-pdf'];if(!files?.length){SS('protect-pdf','Please select a PDF.','er');return;}
  const action=$('pp-a')?.value||'protect';const text=$('pp-t')?.value||'PROTECTED';
  try{const{PDFDocument:P,rgb,StandardFonts,degrees}=PDFLib;const ab=await rdAB(files[0]);const pdf=await P.load(ab,{ignoreEncryption:true});
    if(action==='protect'){const font=await pdf.embedFont(StandardFonts.HelveticaBold);pdf.getPages().forEach(p=>{const{width,height}=p.getSize();const fs=Math.min(width,height)*.09;const tw=font.widthOfTextAtSize(text,fs);p.drawText(text,{x:(width-tw)/2,y:(height-fs)/2,size:fs,font,color:rgb(.8,.1,.1),opacity:.18,rotate:degrees(45)});});}
    AD('dl-protect-pdf',new Blob([await pdf.save()],{type:'application/pdf'}),(action==='protect'?'protected_':'unlocked_')+files[0].name);SS('protect-pdf',`✓ ${action==='protect'?'Protected!':'Unlocked!'}`,'ok');
  }catch(e){SS('protect-pdf','✗ '+e.message,'er');}
}

async function runI2P(toolId){
  const files=FS[toolId];if(!files?.length){SS(toolId,'Please select images.','er');return;}
  const sz=$(toolId==='img-to-pdf'?'itp-s':'itp2-s')?.value||'A4';
  SS(toolId,'Creating PDF…');SP(toolId,5);
  const A4=[595.28,841.89],LT=[612,792];
  try{const{PDFDocument:P}=PDFLib;const pdf=await P.create();
    for(let i=0;i<files.length;i++){SP(toolId,5+(i/files.length)*90);const du=await rdDU(files[i]);const img=await ldImg(du);const ab=await rdAB(files[i]);
      let emb;try{emb=files[i].type==='image/png'?await pdf.embedPng(ab):await pdf.embedJpg(ab);}catch{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);const jab=await new Promise(r=>c.toBlob(b=>b.arrayBuffer().then(r),'image/jpeg',.9));emb=await pdf.embedJpg(jab);}
      const pg=sz==='fit'?[emb.width,emb.height]:(sz==='A4'?A4:LT);const page=pdf.addPage(pg);const{width,height}=page.getSize();const m=sz==='fit'?0:20;const s=Math.min((width-m*2)/emb.width,(height-m*2)/emb.height);const w=emb.width*s,h=emb.height*s;page.drawImage(emb,{x:(width-w)/2,y:(height-h)/2,width:w,height:h});}
    AD('dl-'+toolId,new Blob([await pdf.save()],{type:'application/pdf'}),'images.pdf');SS(toolId,`✓ ${files.length} page(s)!`,'ok');
  }catch(e){SS(toolId,'✗ '+e.message,'er');}HP(toolId);
}

/* ════════════════════════════════════════
   IMAGE TOOLS
   ════════════════════════════════════════ */

async function runImgOcr(){
  const files=FS['img-ocr'];if(!files?.length){SS('img-ocr','Please select an image.','er');return;}
  let lang=$('img-ocr-lang')?.value||'auto';
  SS('img-ocr','Loading image…','info');SP('img-ocr',5,true);
  try{
    if(lang==='auto'){
      SS('img-ocr','Auto-detecting language…','info');
      const du=await rdDU(files[0]);
      lang=await autoDetectLangFromImg(du)||'eng';
      SS('img-ocr',`Detected: ${LANG_NAMES[lang]||lang} — running OCR…`,'info');
    }
    const worker=await getWorker(lang);
    let allText='';
    for(const f of files){const du=await rdDU(f);const res=await worker.recognize(du);allText+=res.data.text.normalize('NFC')+'\n\n';}
    const box=$('img-ocr-box');if(box){box.textContent=allText;box.style.display='block';}
    AD('dl-img-ocr',new Blob(['\ufeff'+allText],{type:'text/plain;charset=utf-8'}),`ocr_${lang}.txt`);
    SS('img-ocr',`✓ Done! Language: ${LANG_NAMES[lang]||lang}`,'ok');
  }catch(e){SS('img-ocr','✗ '+e.message,'er');}
  HP('img-ocr');
}

async function procImgs(id,fn){
  const files=FS[id];if(!files?.length){SS(id,'Please select images.','er');return;}
  SP(id,5);const dla=$(id.includes('img')?'dl-'+id:'dl-'+id);if(dla)dla.innerHTML='';
  let n=0;
  for(let i=0;i<files.length;i++){SP(id,5+(i/files.length)*90);try{const du=await rdDU(files[i]);const img=await ldImg(du);await fn(img,files[i],i);n++;}catch(e){SS(id,'✗ '+files[i].name+': '+e.message,'er');}}
  SP(id,100);if(n>0)SS(id,`✓ ${n} image${n>1?'s':''} processed!`,'ok');HP(id);
}

async function runImgConvert(){const fmt=$('ic-fmt')?.value||'jpeg';const q=parseFloat($('ic-q')?.value||'.9');await procImgs('img-convert',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);AD('dl-img-convert',await toBlob(c,'image/'+fmt,q),f.name.replace(/\.[^.]+$/,fmt==='jpeg'?'.jpg':'.'+fmt));});}

async function runImgCompress(){const q=parseFloat($('icp-q')?.value||'.65');await procImgs('img-compress',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);AD('dl-img-compress',await toBlob(c,'image/jpeg',q),'compressed_'+f.name.replace(/\.[^.]+$/,'.jpg'));});}

async function runImgResize(){
  const files=FS['img-resize'];if(!files?.length){SS('img-resize','Please select an image.','er');return;}
  const mode=_rmode||'px';
  const du=await rdDU(files[0]);const img=await ldImg(du);
  const c=document.createElement('canvas');
  let tw=img.width,th=img.height;
  if(mode==='px'){
    const w=parseFloat($('ir-w')?.value||'0'),h=parseFloat($('ir-h')?.value||'0');
    const ar=$('ir-ar')?.value==='lock';
    if(w&&h){tw=w;th=h;}else if(w&&ar){tw=w;th=Math.round(img.height*(w/img.width));}else if(h&&ar){th=h;tw=Math.round(img.width*(h/img.height));}else{tw=w||img.width;th=h||img.height;}
  } else if(mode==='pct'){
    const wp=parseFloat($('ir-wp')?.value||'100'),hp=parseFloat($('ir-hp')?.value||'100');
    tw=Math.round(img.width*(wp/100));th=Math.round(img.height*(hp/100));
  } else if(mode==='size'){
    const ws=parseFloat($('ir-ws')?.value||'10'),hs=parseFloat($('ir-hs')?.value||'8');
    const unit=$('ir-unit')?.value||'cm';const dpi=parseFloat($('ir-dpi-s')?.value||'96');
    const PPI={'cm':dpi/2.54,'in':dpi,'mm':dpi/25.4};const ppi=PPI[unit]||dpi;
    tw=Math.round(ws*ppi);th=Math.round(hs*ppi);
  } else if(mode==='dpi'){
    const tDpi=parseFloat($('ir-dpi')?.value||'96');const cDpi=parseFloat($('ir-dpi-cur')?.value||'96');
    const ratio=tDpi/cDpi;tw=Math.round(img.width*ratio);th=Math.round(img.height*ratio);
  }
  c.width=Math.max(1,tw);c.height=Math.max(1,th);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  AD('dl-img-resize',await toBlob(c,'image/png',1),'resized_'+files[0].name.replace(/\.[^.]+$/,'.png'));
  SS('img-resize',`✓ Resized to ${c.width}×${c.height}px (${mode} mode)!`,'ok');
}

let _ci=null,_cs=null;
async function loadCropPrev(){const files=FS['img-crop'];if(!files?.length)return;const du=await rdDU(files[0]);_ci=await ldImg(du);const canvas=$('cropCanvas');if(!canvas)return;canvas.style.display='block';const sc=Math.min(1,580/_ci.width);canvas.width=_ci.width*sc;canvas.height=_ci.height*sc;canvas._sc=sc;const ctx=canvas.getContext('2d');ctx.drawImage(_ci,0,0,canvas.width,canvas.height);$('crop-xy').style.display='flex';$('cr-w').value=_ci.width;$('cr-h').value=_ci.height;canvas.onmousedown=e=>{const r=canvas.getBoundingClientRect();_cs={x:e.clientX-r.left,y:e.clientY-r.top};};canvas.onmousemove=e=>{if(!_cs)return;const r=canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;const cr={x:Math.min(_cs.x,x),y:Math.min(_cs.y,y),w:Math.abs(x-_cs.x),h:Math.abs(y-_cs.y)};ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(_ci,0,0,canvas.width,canvas.height);ctx.strokeStyle='#4040ff';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(cr.x,cr.y,cr.w,cr.h);ctx.fillStyle='rgba(26,26,255,.1)';ctx.fillRect(cr.x,cr.y,cr.w,cr.h);const s=canvas._sc||1;$('cr-x').value=Math.round(cr.x/s);$('cr-y').value=Math.round(cr.y/s);$('cr-w').value=Math.round(cr.w/s);$('cr-h').value=Math.round(cr.h/s);};canvas.onmouseup=()=>_cs=null;}

async function runImgCrop(){const files=FS['img-crop'];if(!files?.length){SS('img-crop','Please select an image.','er');return;}const x=parseInt($('cr-x')?.value)||0,y=parseInt($('cr-y')?.value)||0,w=parseInt($('cr-w')?.value)||100,h=parseInt($('cr-h')?.value)||100;const du=await rdDU(files[0]);const img=await ldImg(du);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,x,y,w,h,0,0,w,h);AD('dl-img-crop',await toBlob(c,'image/png',1),'cropped_'+files[0].name.replace(/\.[^.]+$/,'.png'));SS('img-crop',`✓ Cropped to ${w}×${h}px!`,'ok');}
async function runImgRotate(){const op=$('irp-op')?.value||'r90';await procImgs('img-rotate',async(img,f)=>{const c=document.createElement('canvas');const ctx=c.getContext('2d');if(op==='r90'||op==='r270'){c.width=img.height;c.height=img.width;}else{c.width=img.width;c.height=img.height;}if(op==='r90'){ctx.translate(c.width,0);ctx.rotate(Math.PI/2);}else if(op==='r180'){ctx.translate(c.width,c.height);ctx.rotate(Math.PI);}else if(op==='r270'){ctx.translate(0,c.height);ctx.rotate(-Math.PI/2);}else if(op==='fh'){ctx.translate(c.width,0);ctx.scale(-1,1);}else if(op==='fv'){ctx.translate(0,c.height);ctx.scale(1,-1);}ctx.drawImage(img,0,0);AD('dl-img-rotate',await toBlob(c,'image/png',1),op+'_'+f.name.replace(/\.[^.]+$/,'.png'));});}
async function runImgWatermark(){const text=$('iw-t')?.value||'FileWork';const pos=$('iw-p')?.value||'br';const op=parseFloat($('iw-op')?.value||'.5');await procImgs('img-watermark',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const fs=Math.max(18,img.width*.04);ctx.font=`bold ${fs}px Arial`;ctx.globalAlpha=op;ctx.fillStyle='white';ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=2;const tw=ctx.measureText(text).width;const mg=14;let x,y;if(pos==='br'){x=img.width-tw-mg;y=img.height-mg;}else if(pos==='bl'){x=mg;y=img.height-mg;}else if(pos==='tr'){x=img.width-tw-mg;y=fs+mg;}else if(pos==='tl'){x=mg;y=fs+mg;}else{x=(img.width-tw)/2;y=(img.height+fs)/2;}ctx.strokeText(text,x,y);ctx.fillText(text,x,y);ctx.globalAlpha=1;AD('dl-img-watermark',await toBlob(c,'image/jpeg',.92),'wm_'+f.name.replace(/\.[^.]+$/,'.jpg'));});}
async function runImgGrayscale(){const mode=$('ig-m')?.value||'gray';await procImgs('img-grayscale',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const g=.299*d.data[i]+.587*d.data[i+1]+.114*d.data[i+2];const v=mode==='bw'?(g>128?255:0):g;d.data[i]=d.data[i+1]=d.data[i+2]=v;}ctx.putImageData(d,0,0);AD('dl-img-grayscale',await toBlob(c,'image/png',1),'bw_'+f.name.replace(/\.[^.]+$/,'.png'));});}
async function runImgAdjust(){const br=parseInt($('ab-br')?.value||'0'),co=parseInt($('ab-co')?.value||'0'),sa=parseInt($('ab-sa')?.value||'0'),bl=parseInt($('ab-bl')?.value||'0');await procImgs('img-brightness',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.filter=`brightness(${1+br/100}) contrast(${1+co/100}) saturate(${1+sa/100}) blur(${bl}px)`;ctx.drawImage(img,0,0);ctx.filter='none';AD('dl-img-brightness',await toBlob(c,'image/jpeg',.92),'adjusted_'+f.name.replace(/\.[^.]+$/,'.jpg'));});}
async function runImgMerge(){const files=FS['img-merge'];if(!files||files.length<2){SS('img-merge','Select ≥2 images.','er');return;}const d=$('im-d')?.value||'v';SS('img-merge','Stitching…');SP('img-merge',10);const imgs=[];for(const f of files){const du=await rdDU(f);imgs.push(await ldImg(du));}const c=document.createElement('canvas');if(d==='v'){c.width=Math.max(...imgs.map(i=>i.width));c.height=imgs.reduce((a,i)=>a+i.height,0);let y=0;const ctx=c.getContext('2d');imgs.forEach(img=>{ctx.drawImage(img,0,y);y+=img.height;});}else{c.width=imgs.reduce((a,i)=>a+i.width,0);c.height=Math.max(...imgs.map(i=>i.height));let x=0;const ctx=c.getContext('2d');imgs.forEach(img=>{ctx.drawImage(img,x,0);x+=img.width;});}AD('dl-img-merge',await toBlob(c,'image/png',1),'merged.png');SS('img-merge',`✓ ${imgs.length} merged!`,'ok');HP('img-merge');}
async function runImgStrip(){await procImgs('img-metadata',async(img,f)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);AD('dl-img-metadata',await toBlob(c,'image/jpeg',.95),'clean_'+f.name.replace(/\.[^.]+$/,'.jpg'));});}
async function runImgB64(){const files=FS['img-base64'];if(!files?.length){SS('img-base64','Please select an image.','er');return;}const du=await rdDU(files[0]);const area=$('dl-img-base64');if(!area)return;area.innerHTML=`<div style="margin-top:10px;width:100%"><label style="font-size:.67rem;color:var(--text3);font-family:var(--mono);text-transform:uppercase">Base64 Data URL</label><textarea readonly id="b64o" style="width:100%;height:95px;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);padding:9px;border-radius:7px;font-family:var(--mono);font-size:.62rem;margin-top:5px;resize:none;display:block">${du}</textarea><button class="dbtn" style="margin-top:5px" onclick="navigator.clipboard.writeText($('b64o').value).then(()=>this.textContent='✓ Copied!')">📋 Copy</button></div>`;SS('img-base64','✓ Encoded!','ok');}

/* ── TRANSLATOR ── */
function LO(sel='auto'){const L=[['auto','Auto-detect'],['en','English'],['hi','Hindi'],['ar','Arabic'],['zh-CN','Chinese (Simplified)'],['zh-TW','Chinese (Traditional)'],['ja','Japanese'],['ko','Korean'],['ur','Urdu'],['ta','Tamil'],['bn','Bengali'],['te','Telugu'],['mr','Marathi'],['gu','Gujarati'],['pa','Punjabi'],['fr','French'],['de','German'],['es','Spanish'],['it','Italian'],['pt','Portuguese'],['ru','Russian'],['nl','Dutch'],['tr','Turkish'],['pl','Polish'],['sv','Swedish'],['th','Thai'],['vi','Vietnamese'],['id','Indonesian'],['ms','Malay'],['fa','Persian'],['he','Hebrew'],['uk','Ukrainian']];return L.map(([v,n])=>`<option value="${v}"${v===sel?' selected':''}>${n}</option>`).join('');}
let trTimer=null;
function autoTr(){clearTimeout(trTimer);trTimer=setTimeout(doTr,800);}
async function doTr(){const txt=$('tr-in')?.value?.trim();if(!txt)return;const fr=$('tr-f')?.value||'auto';const to=$('tr-t')?.value||'hi';SS('text-translator','Translating…');try{const url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fr}&tl=${to}&dt=t&q=${encodeURIComponent(txt)}`;const res=await fetch(url);const data=await res.json();const tr=data[0].map(s=>s[0]).join('');const out=$('tr-out');if(out){out.value=tr;out.style.direction=['ar','he','ur','fa','yi'].includes(to)?'rtl':'ltr';}SS('text-translator','✓ Done!','ok');}catch(e){SS('text-translator','✗ Error — check internet.','er');}}
function swapLangs(){const f=$('tr-f'),t=$('tr-t'),i=$('tr-in'),o=$('tr-out');if(!f||!t)return;const tmp=f.value;f.value=t.value;t.value=tmp;const tmpT=i.value;i.value=o.value;o.value=tmpT;}
function copyTr(){const o=$('tr-out');if(o)navigator.clipboard.writeText(o.value).then(()=>SS('text-translator','✓ Copied!','ok'));}
function initTranslator(){}

/* ── KEYBOARD TESTER ── */
const KL=[
  [['`','~'],['1','!'],['2','@'],['3','#'],['4','$'],['5','%'],['6','^'],['7','&'],['8','*'],['9','('],['0',')'],['−','_'],['=','+'],['Back','w4']],
  [['Tab','w2'],['Q'],['W'],['E'],['R'],['T'],['Y'],['U'],['I'],['O'],['P'],['['],[']]'],['\\','w2']],
  [['Caps','w3'],['A'],['S'],['D'],['F'],['G'],['H'],['J'],['K'],['L'],[';'],["'"],['Enter','w3']],
  [['Shift','w4'],['Z'],['X'],['C'],['V'],['B'],['N'],['M'],[','],['.'],['/'],['Shift','w4']],
  [['Ctrl','w2'],['Alt'],['Space','w6'],['Alt'],['Ctrl','w2']],
];
let kbListeners={};
function initKbMouse(){
  const vis=$('kb-vis');if(!vis)return;
  vis.innerHTML=KL.map(row=>`<div class="kbrow">${row.map(k=>{const[lbl,cls]=k;const w=/^w/.test(cls)?cls:'';const id='kk-'+lbl.replace(/[^a-zA-Z0-9]/g,'_');return `<div class="kkey ${w}" id="${id}">${lbl}</div>`;}).join('')}</div>`).join('');
  const kd=e=>{e.preventDefault();const k=e.key||'';const id='kk-'+k.replace(/[^a-zA-Z0-9]/g,'_');const el=$(id)||document.querySelector(`.kkey[data-k="${k.toLowerCase()}"]`);if(el)el.classList.add('lit');const log=$('klog');if(log){log.innerHTML+=`<span style="color:var(--blue-lt)">${k}</span> `;log.scrollTop=log.scrollHeight;}};
  const ku=e=>{const k=e.key||'';const id='kk-'+k.replace(/[^a-zA-Z0-9]/g,'_');const el=$(id);if(el)el.classList.remove('lit');};
  const md=e=>{const map={0:'L',1:'M',2:'R'};const btn=$('mb-'+map[e.button]);if(btn){btn.classList.add('lit');setTimeout(()=>btn.classList.remove('lit'),300);}};
  let sc=0;const sw=e=>{sc+=Math.round(e.deltaY);const el=$('mscr');if(el)el.textContent='Scroll: '+sc;};
  const cx=e=>e.preventDefault();
  document.addEventListener('keydown',kd,true);document.addEventListener('keyup',ku,true);document.addEventListener('mousedown',md,true);document.addEventListener('wheel',sw,true);document.addEventListener('contextmenu',cx,true);
  kbListeners={kd,ku,md,sw,cx};
  // Cleanup on modal close
  const origCM=window.CM;
  window.CM=function(){document.removeEventListener('keydown',kbListeners.kd,true);document.removeEventListener('keyup',kbListeners.ku,true);document.removeEventListener('mousedown',kbListeners.md,true);document.removeEventListener('wheel',kbListeners.sw,true);document.removeEventListener('contextmenu',kbListeners.cx,true);window.CM=origCM;origCM();};
}
function resetKb(){document.querySelectorAll('.kkey').forEach(k=>k.classList.remove('lit'));const l=$('klog');if(l)l.innerHTML='Press any key to begin…';const s=$('mscr');if(s)s.textContent='Scroll: 0';}
