# FileWork — PDF, Image & Utility Tools

> Free, private, browser-based file toolkit. No uploads. No login. Works offline.

## 📁 Files in this package

```
toolbox/
├── index.html        ← Main website page
├── style.css         ← All styles (dark theme, animations)
├── app.js            ← All tool logic (runs 100% in browser)
├── ads.js            ← AdSense configuration (edit to enable ads)
├── manifest.json     ← PWA manifest (install as app)
├── sw.js             ← Service Worker (offline support)
├── icon-192.png      ← App icon (192×192)
├── icon-512.png      ← App icon (512×512)
└── README.md         ← This file
```

---

## 🛠️ Tools Included

### PDF Tools (12)
| Tool | What it does |
|------|-------------|
| PDF OCR — Any Language | Auto-detects language, extracts text via OCR |
| PDF to Word | Extracts text into .docx format |
| PDF to Excel | Extracts tables to .xlsx with OCR fallback |
| PDF to Text | Plain text extraction with OCR fallback |
| Merge PDFs | Combines multiple PDFs into one |
| Split PDF | Splits by page or custom range |
| Compress PDF | Reduces file size, preserves quality |
| Rotate PDF | Rotates pages 90°/180°/270° |
| Watermark PDF | Adds text watermark on every page |
| Protect / Unlock PDF | Add or remove password protection |
| PDF to Images | Extracts every page as JPG or PNG |
| Images to PDF | Pack JPG/PNG/WebP into a PDF |

### Image Tools
| Tool | What it does |
|------|-------------|
| Convert Image | JPG/PNG/WebP/BMP conversion |
| Compress Image | Reduces file size |
| Resize Image | Custom pixel or percentage resize |
| Crop Image | Visual drag-to-crop |
| Rotate / Flip | 90°/180° rotate and flip |
| Watermark Image | Text watermark at any position |
| Grayscale / B&W | Color → grayscale → true black & white |
| Adjust Image | Brightness, contrast, saturation, blur |
| Merge Images | Stitch images vertically or horizontally |
| Strip EXIF | Remove metadata for privacy |
| Image to Base64 | Encode image for web use |
| Image OCR | Extract text from any image |

### Utility Tools
| Tool | What it does |
|------|-------------|
| Typing Master | 25 games to improve WPM and accuracy |
| Text Translator | Translate text in 100+ languages |
| Word Counter | Count words, characters, sentences |
| Color Picker | Pick and convert colors (HEX/RGB/HSL) |
| QR Code Generator | Generate QR codes instantly |
| Password Generator | Secure random password generator |

---

## ⚙️ Customization

### Change Colors
Edit CSS variables at the top of `style.css`:
```css
:root {
  --blue:    #1a1aff;   /* Primary accent color */
  --bg:      #08080f;   /* Page background */
  --bg2:     #0f0f1a;   /* Card background */
}
```

### Add Google Analytics
Add before `</head>` in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

---

## 🔒 Privacy
- **Zero server uploads** — All processing done in the browser
- **No cookies** — No tracking of any kind
- **No accounts** — Users are completely anonymous
- **Offline capable** — Works after first visit without internet

---

## 📦 Dependencies (loaded from CDN)
- [PDF-lib v1.17.1](https://pdf-lib.js.org/) — PDF creation & editing
- [PDF.js v3.11.174](https://mozilla.github.io/pdf.js/) — PDF rendering & text extraction
- [Tesseract.js v5](https://tesseract.projectnaptha.com/) — OCR engine (auto language detection)
- [SheetJS v0.20.1](https://sheetjs.com/) — Excel file generation

All CDN resources are cached by the Service Worker for offline use.

---

Made with ❤️ by FileWork
