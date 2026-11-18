// Web Media Diagnostics & Bitrate Workbench — 100% Client-Side Vanilla JS

(function () {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // =========================================================================
  // 1. LIVE LOCAL FILE INSPECTOR & PORTAL COMPLIANCE CHECKER
  // =========================================================================
  var dropzone = document.getElementById('file-dropzone');
  var fileInput = document.getElementById('file-input');

  var PORTAL_RULES = [
    { name: 'Exam Signature & ID Portal (≤ 20 KB)', maxBytes: 20 * 1024, types: ['image'] },
    { name: 'Passport & Visa Headshot Portal (≤ 50 KB)', maxBytes: 50 * 1024, types: ['image'] },
    { name: 'Core Web Vitals LCP / Product Card (≤ 100 KB)', maxBytes: 100 * 1024, types: ['image'] },
    { name: 'Blog Hero Banner Budget (≤ 200 KB)', maxBytes: 200 * 1024, types: ['image'] },
    { name: 'ATS Job Application Resume PDF (≤ 1 MB)', maxBytes: 1024 * 1024, types: ['pdf', 'image'] },
    { name: 'Visa, Transcript & Tax Document PDF (≤ 2 MB)', maxBytes: 2 * 1024 * 1024, types: ['pdf'] },
    { name: 'Discord Free Tier Attachment Cap (≤ 8 MB)', maxBytes: 8 * 1024 * 1024, types: ['video', 'image', 'pdf'] },
    { name: 'Discord 25MB / Email Attachment (≤ 25 MB)', maxBytes: 25 * 1024 * 1024, types: ['video'] }
  ];

  function renderInspection(meta) {
    var elName = document.getElementById('insp-name');
    var elSize = document.getElementById('insp-size');
    var elMime = document.getElementById('insp-mime');
    var elDim = document.getElementById('insp-dim');
    var elRatio = document.getElementById('insp-ratio');
    var elBpp = document.getElementById('insp-bpp');
    var complianceContainer = document.getElementById('compliance-results');

    if (!elName) return;

    elName.textContent = meta.name;
    elSize.textContent = formatBytes(meta.size) + ' (' + meta.size.toLocaleString() + ' B)';
    elMime.textContent = meta.mime || 'application/octet-stream';

    if (meta.width && meta.height) {
      var g = gcd(meta.width, meta.height);
      var rw = meta.width / g;
      var rh = meta.height / g;
      var mp = ((meta.width * meta.height) / 1000000).toFixed(2);
      var bpp = ((meta.size * 8) / (meta.width * meta.height)).toFixed(2);
      elDim.textContent = meta.width + ' × ' + meta.height + ' px (' + mp + ' MP)';
      elRatio.textContent = rw + ':' + rh + ' (' + (meta.width / meta.height).toFixed(2) + ')';
      elBpp.textContent = bpp + ' bits/pixel';
    } else {
      elDim.textContent = meta.pages ? meta.pages + ' pages (Document)' : 'N/A (Container stream)';
      elRatio.textContent = meta.duration ? meta.duration + 's duration' : 'Standard';
      elBpp.textContent = meta.bitrate ? meta.bitrate.toLocaleString() + ' kbps' : 'N/A';
    }

    var relevant = PORTAL_RULES.filter(function (rule) {
      return rule.types.indexOf(meta.category) !== -1;
    });

    complianceContainer.innerHTML = '';
    relevant.forEach(function (rule) {
      var passes = meta.size <= rule.maxBytes;
      var row = document.createElement('div');
      row.className = 'compliance-item';

      var left = document.createElement('div');
      left.innerHTML =
        '<strong>' +
        rule.name +
        '</strong><div style="font-size:0.78rem;color:var(--text-secondary)">Limit: ' +
        formatBytes(rule.maxBytes) +
        ' · File: ' +
        formatBytes(meta.size) +
        '</div>';

      var right = document.createElement('div');
      if (passes) {
        right.innerHTML = '<span class="badge badge-pass">PASS ✓</span>';
      } else {
        var overPct = Math.round(((meta.size - rule.maxBytes) / meta.size) * 100);
        right.innerHTML = '<span class="badge badge-fail">Reduce by ' + overPct + '%</span>';
      }

      row.appendChild(left);
      row.appendChild(right);
      complianceContainer.appendChild(row);
    });
  }

  function inspectRealFile(file) {
    var mime = file.type || '';
    var category = 'image';
    if (mime.indexOf('video') !== -1 || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name)) {
      category = 'video';
    } else if (mime.indexOf('pdf') !== -1 || /\.pdf$/i.test(file.name)) {
      category = 'pdf';
    }

    if (category === 'image') {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        renderInspection({
          name: file.name,
          size: file.size,
          mime: mime || 'image/unknown',
          width: img.naturalWidth,
          height: img.naturalHeight,
          category: 'image'
        });
        URL.revokeObjectURL(url);
      };
      img.onerror = function () {
        renderInspection({
          name: file.name,
          size: file.size,
          mime: mime || 'image/heic',
          category: 'image'
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (category === 'video') {
      var vid = document.createElement('video');
      var vurl = URL.createObjectURL(file);
      vid.preload = 'metadata';
      vid.onloadedmetadata = function () {
        var dur = Math.max(1, Math.round(vid.duration || 15));
        var kbps = Math.round((file.size * 8) / 1000 / dur);
        renderInspection({
          name: file.name,
          size: file.size,
          mime: mime || 'video/mp4',
          width: vid.videoWidth || 1920,
          height: vid.videoHeight || 1080,
          duration: dur,
          bitrate: kbps,
          category: 'video'
        });
        URL.revokeObjectURL(vurl);
      };
      vid.onerror = function () {
        renderInspection({
          name: file.name,
          size: file.size,
          mime: mime || 'video/quicktime',
          category: 'video'
        });
        URL.revokeObjectURL(vurl);
      };
      vid.src = vurl;
    } else {
      renderInspection({
        name: file.name,
        size: file.size,
        mime: mime || 'application/pdf',
        category: 'pdf'
      });
    }
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', function () {
      fileInput.click();
    });
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        inspectRealFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) {
        inspectRealFile(e.target.files[0]);
      }
    });
  }

  var samplePresets = {
    'sample-photo': {
      name: 'IMG_4821_iPhone16Pro.HEIC',
      size: 3845120,
      mime: 'image/heic',
      width: 4032,
      height: 3024,
      category: 'image'
    },
    'sample-discord': {
      name: 'gameplay_clip_1080p60.mp4',
      size: 42991616,
      mime: 'video/mp4',
      width: 1920,
      height: 1080,
      duration: 34,
      bitrate: 10115,
      category: 'video'
    },
    'sample-resume': {
      name: 'Design_Resume_2026.pdf',
      size: 2785280,
      mime: 'application/pdf',
      pages: 2,
      category: 'pdf'
    },
    'sample-passport': {
      name: 'Passport_Headshot_600dpi.jpg',
      size: 312320,
      mime: 'image/jpeg',
      width: 1200,
      height: 1200,
      category: 'image'
    }
  };

  Object.keys(samplePresets).forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        renderInspection(samplePresets[id]);
      });
    }
  });

  renderInspection(samplePresets['sample-photo']);

  // =========================================================================
  // 2. CORE WEB VITALS (LCP) & CODEC COMPRESSION SIMULATOR + CLI GENERATOR
  // =========================================================================
  var calcWidth = document.getElementById('calc-width');
  var calcHeight = document.getElementById('calc-height');
  var calcCodec = document.getElementById('calc-codec');
  var calcQuality = document.getElementById('calc-quality');
  var calcQualityVal = document.getElementById('calc-quality-val');

  var CODEC_FACTORS = {
    bmp: { bppBase: 24.0, ssim: '1.000 (Uncompressed)' },
    png: { bppBase: 5.6, ssim: '1.000 (Lossless)' },
    jpeg: { bppBase: 1.22, ssim: '0.962 (MozJPEG DCT)' },
    webp: { bppBase: 0.78, ssim: '0.974 (VP8 Intra)' },
    avif: { bppBase: 0.56, ssim: '0.981 (AV1 10-bit)' }
  };

  function updateCodecCalculator() {
    if (!calcWidth || !calcHeight || !calcCodec || !calcQuality) return;

    var w = Math.max(16, parseInt(calcWidth.value, 10) || 1920);
    var h = Math.max(16, parseInt(calcHeight.value, 10) || 1080);
    var codec = calcCodec.value;
    var q = parseInt(calcQuality.value, 10) || 80;
    if (calcQualityVal) calcQualityVal.textContent = 'Q' + q;

    var pixels = w * h;
    var baselineBytes = Math.round((pixels * 3.1) / 8);
    var qFactor = Math.pow(q / 80, 1.85);
    var info = CODEC_FACTORS[codec] || CODEC_FACTORS.webp;
    var effectiveBpp = codec === 'png' || codec === 'bmp' ? info.bppBase : info.bppBase * qFactor;
    var estimatedBytes = Math.max(1024, Math.round((pixels * effectiveBpp) / 8));
    var savingsPct = Math.max(0, Math.min(98, Math.round((1 - estimatedBytes / baselineBytes) * 100)));

    var lcp4gMs = Math.round(((estimatedBytes * 8) / (9 * 1000 * 1000)) * 1000 + 320);
    var lcpSlowMs = Math.round(((estimatedBytes * 8) / (3 * 1000 * 1000)) * 1000 + 550);

    var outSize = document.getElementById('out-est-size');
    var outSavings = document.getElementById('out-est-savings');
    var outLcp = document.getElementById('out-est-lcp');
    var outSsim = document.getElementById('out-est-ssim');
    var outCli = document.getElementById('out-img-cli');

    if (outSize) outSize.textContent = formatBytes(estimatedBytes);
    if (outSavings) outSavings.textContent = savingsPct + '% smaller vs raw JPEG/PNG';
    if (outLcp) {
      outLcp.textContent = lcp4gMs + ' ms (4G) / ' + lcpSlowMs + ' ms (3G)';
      outLcp.style.color = lcp4gMs <= 1200 ? 'var(--emerald)' : lcp4gMs <= 2500 ? 'var(--amber)' : 'var(--rose)';
    }
    if (outSsim) outSsim.textContent = info.ssim;

    if (outCli) {
      if (codec === 'webp') {
        outCli.textContent = 'cwebp -q ' + q + ' -resize ' + w + ' ' + h + ' input.png -o output.webp';
      } else if (codec === 'avif') {
        var cq = Math.max(0, Math.min(63, Math.round((100 - q) * 0.63)));
        outCli.textContent = 'avifenc --min 0 --max 63 -a end-usage=q -a cq-level=' + cq + ' input.png output.avif';
      } else if (codec === 'jpeg') {
        outCli.textContent = 'magick input.png -resize ' + w + 'x' + h + ' -quality ' + q + ' -strip output.jpg';
      } else if (codec === 'png') {
        outCli.textContent = 'oxipng -o 4 --strip safe input.png --out output.png';
      } else {
        outCli.textContent = 'magick input.png -resize ' + w + 'x' + h + ' output.bmp';
      }
    }
  }

  [calcWidth, calcHeight, calcCodec, calcQuality].forEach(function (el) {
    if (el) el.addEventListener('input', updateCodecCalculator);
  });
  updateCodecCalculator();

  // =========================================================================
  // 3. VIDEO BITRATE BUDGET CALCULATOR + FFMPEG COMMAND GENERATOR
  // =========================================================================
  var vidDuration = document.getElementById('vid-duration');
  var vidTargetMb = document.getElementById('vid-target-mb');
  var vidAudioKbps = document.getElementById('vid-audio-kbps');

  function updateVideoCalculator() {
    if (!vidDuration || !vidTargetMb || !vidAudioKbps) return;
    var dur = Math.max(1, parseFloat(vidDuration.value) || 30);
    var capMb = parseFloat(vidTargetMb.value) || 8;
    var audioKbps = parseInt(vidAudioKbps.value, 10) || 128;

    var safeTotalKbits = capMb * 1024 * 8 * 0.94;
    var totalKbps = Math.floor(safeTotalKbits / dur);
    var videoKbps = Math.max(120, totalKbps - audioKbps);

    var recRes = '1920×1080 (1080p60)';
    var scaleFilter = 'scale=-2:1080';
    if (videoKbps < 800) {
      recRes = '854×480 (480p30)';
      scaleFilter = 'scale=-2:480';
    } else if (videoKbps < 2200) {
      recRes = '1280×720 (720p30)';
      scaleFilter = 'scale=-2:720';
    } else if (videoKbps < 4200) {
      recRes = '1920×1080 (1080p30)';
      scaleFilter = 'scale=-2:1080';
    }

    var elVidKbps = document.getElementById('out-vid-kbps');
    var elVidRes = document.getElementById('out-vid-res');
    var elFfmpeg = document.getElementById('out-ffmpeg-cli');

    if (elVidKbps) elVidKbps.textContent = videoKbps.toLocaleString() + ' kbps';
    if (elVidRes) elVidRes.textContent = recRes;
    if (elFfmpeg) {
      elFfmpeg.textContent =
        'ffmpeg -i input.mp4 -c:v libx264 -b:v ' +
        videoKbps +
        'k -maxrate ' +
        Math.round(videoKbps * 1.1) +
        'k -bufsize ' +
        videoKbps * 2 +
        'k -vf "' +
        scaleFilter +
        '" -c:a aac -b:a ' +
        audioKbps +
        'k -movflags +faststart output_' +
        capMb +
        'mb.mp4';
    }
  }

  [vidDuration, vidTargetMb, vidAudioKbps].forEach(function (el) {
    if (el) el.addEventListener('input', updateVideoCalculator);
  });
  updateVideoCalculator();

  // =========================================================================
  // 4. ASPECT RATIO & RESOLUTION SCALER
  // =========================================================================
  var arW1 = document.getElementById('ar-w1');
  var arH1 = document.getElementById('ar-h1');
  var arW2 = document.getElementById('ar-w2');

  function updateAspectCalculator() {
    if (!arW1 || !arH1 || !arW2) return;
    var w1 = Math.max(1, parseInt(arW1.value, 10) || 1920);
    var h1 = Math.max(1, parseInt(arH1.value, 10) || 1080);
    var w2 = Math.max(1, parseInt(arW2.value, 10) || 1080);

    var g = gcd(w1, h1);
    var h2 = Math.round((w2 * h1) / w1);
    var mp = ((w2 * h2) / 1000000).toFixed(2);

    var elRatio = document.getElementById('out-ar-ratio');
    var elTarget = document.getElementById('out-ar-target');
    if (elRatio) elRatio.textContent = w1 / g + ':' + h1 / g + ' (' + (w1 / h1).toFixed(3) + ')';
    if (elTarget) elTarget.textContent = w2 + ' × ' + h2 + ' px (' + mp + ' MP)';
  }

  [arW1, arH1, arW2].forEach(function (el) {
    if (el) el.addEventListener('input', updateAspectCalculator);
  });
  updateAspectCalculator();

  // Copy buttons for CLI snippets
  document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-copy-target');
      var el = document.getElementById(targetId);
      if (el && navigator.clipboard) {
        navigator.clipboard.writeText(el.textContent).then(function () {
          var prev = btn.textContent;
          btn.textContent = 'Copied ✓';
          setTimeout(function () {
            btn.textContent = prev;
          }, 1500);
        });
      }
    });
  });
})();
