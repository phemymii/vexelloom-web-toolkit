# Web Media Diagnostics & Bitrate Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-10b981.svg)](#features)
[![Client-Side](https://img.shields.io/badge/Privacy-100%25_Client--Side-6366f1.svg)](#features)

A lightweight, zero-dependency static web application for **web performance engineers, front-end developers, and content creators** to inspect local media metadata, estimate Core Web Vitals (LCP) image payload impact, calculate safe video bitrates, and generate copyable CLI commands (`cwebp`, `avifenc`, `oxipng`, `ffmpeg`).

---

## Features

1. **Local File Metadata Inspector & Upload Cap Checker (`index.html`)**
   - Uses native Browser File, Image, and Video APIs to inspect exact byte size, resolution, megapixels, GCD aspect ratio, and bits-per-pixel (BPP) density without uploading files to any server.
   - Checks pass/fail status against common limits (20KB exam signatures, 50KB passport/visa photos, 100KB LCP/product cards, 200KB hero banners, 1MB ATS resume PDFs, and 8MB/25MB Discord video caps).
2. **Core Web Vitals (LCP) & Codec Estimator + CLI Generator (`index.html`)**
   - Estimates output weight, SSIM fidelity, and 4G/3G Largest Contentful Paint latency across **AVIF, WebP, MozJPEG, and PNG-24** from `Q40` to `Q100`.
   - Generates ready-to-copy `cwebp`, `avifenc`, `magick`, and `oxipng` commands.
3. **Video Bitrate Calculator & FFmpeg Command Generator (`index.html`)**
   - Computes target video bitrates (including a 6% MP4/WebM container muxing overhead buffer) for 8MB, 10MB, 16MB, 25MB, and 50MB caps and generates a copyable `ffmpeg` command.
4. **Aspect Ratio & Responsive Breakpoint Scaler (`index.html`)**
   - GCD-reduced aspect ratio math and locked-ratio target resolution calculator for responsive `srcset` workflows.
5. **2026 Codec Benchmarks & Portal Size Cheat Sheet (`benchmarks.html`, `cheatsheet.html`)**
   - Reference tables comparing JPEG vs WebP vs AVIF, GIF vs MP4 vs WebM, and 2026 social media & portal specifications.

---

## Quick Codec Reference (1920×1080 Corpus Average)

| Format | Avg 1080p Weight | Bits/Pixel | Mean SSIM | Alpha / HDR |
| :--- | :---: | :---: | :---: | :---: |
| **AVIF (AV1 Intra)** | 142 KB (-54%) | `0.56 bpp` | `0.981` | Alpha + 10/12-bit HDR |
| **WebP (VP8 Intra)** | 198 KB (-36%) | `0.78 bpp` | `0.974` | Alpha + Animation |
| **HEIC (HEVC)** | 175 KB (-43%) | `0.69 bpp` | `0.978` | Depth Map + 10-bit |
| **MozJPEG (4:2:0)** | 310 KB (Base) | `1.22 bpp` | `0.962` | None (8-bit) |
| **PNG-24 (Lossless)** | 1,420 KB (+358%) | `5.61 bpp` | `1.000` | Full 8/16-bit Alpha |

---

## Related Open-Web Resources & Companion Tools

- **Specifications & Docs**: [web.dev — Largest Contentful Paint](https://web.dev/articles/lcp), [MDN — Web Media Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types), [CanIUse AVIF](https://caniuse.com/avif)
- **CLI Encoders**: [FFmpeg](https://ffmpeg.org/), [libwebp](https://developers.google.com/speed/webp), [libavif](https://github.com/AOMediaCodec/libavif), [ImageMagick](https://imagemagick.org/)
- **Browser-Based WASM Utilities**: [Squoosh](https://squoosh.app/) (single-image inspection) and [Vexelloom](https://vexelloom.com/) (zero-upload batch [image conversion](https://vexelloom.com/image-converter), [video compression](https://vexelloom.com/compress-video), [PDF tools](https://vexelloom.com/pdf-tools), and [2026 codec benchmarks](https://vexelloom.com/guides))

---

## Running Locally or Deploying to GitHub Pages

No build step or Node.js runtime is required. Open `index.html` directly or serve with any static server:

```bash
python3 -m http.server 8080
```

To deploy to GitHub Pages, push to `main` and enable **Settings → Pages → Source: GitHub Actions** (using the included `.github/workflows/pages.yml`) or **Deploy from a branch (`main` / `/root`)**.

---

## License

MIT License — see [LICENSE](LICENSE).
