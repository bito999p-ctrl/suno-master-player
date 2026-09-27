// AetherPlayer 5 visuals: the UI takes its colours from the cover art and moves with the music.
//  - palette: dominant vivid hues of #track-artwork -> --c1..--c3 (+ --art-url, theme-color)
//  - motion: window.aetherAnalyser (tapped in player.js initAudio) -> --bass / --energy, plus
//    three canvases (halo around the artwork, flowing wave, spectrum bars with peak hold).
//  The loop only runs while audio plays and the tab is visible.

const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const audio = $('audio-player');
const art = $('track-artwork');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const aurora = document.querySelector('.aurora'), stage = document.querySelector('.workspace-player');

// ---------------------------------------------------------------- power
// lite  (phones / touch): 30 fps, lighter blur, only the stage reacts to the music
// saver (switch, or Android battery <= 20 % and not charging): no motion, no canvases
const liteQuery = matchMedia('(max-width: 768px), (pointer: coarse)');
const saverToggle = $('saver-toggle');
const SAVER_KEY = 'aether5_saver';
let lite = false, saver = false, batteryLow = false;
let saverManual = false;
try { saverManual = localStorage.getItem(SAVER_KEY) === '1'; } catch (e) {}
function syncPower() {
  lite = liteQuery.matches;
  saver = saverManual || batteryLow;
  document.body.classList.toggle('lite', lite);
  document.body.classList.toggle('saver', saver);
  if (saverToggle) saverToggle.checked = saver;
  if (saver || lite) aurora && (aurora.style.removeProperty('--bass'), aurora.style.removeProperty('--energy'));
  if (saver) stage && (stage.style.removeProperty('--bass'), stage.style.removeProperty('--energy'));
  kick();
}
liteQuery.addEventListener('change', syncPower);
if (saverToggle) saverToggle.addEventListener('change', () => {
  saverManual = saverToggle.checked;
  if (!saverManual) batteryLow = false; // turning it off overrides the low-battery auto mode for this session
  try { localStorage.setItem(SAVER_KEY, saverManual ? '1' : '0'); } catch (e) {}
  syncPower();
});
if (navigator.getBattery) {
  navigator.getBattery().then((b) => {
    let dismissed = false;
    const check = () => {
      const low = !b.charging && b.level <= 0.2;
      if (low && !dismissed) batteryLow = true;
      if (!low) { batteryLow = false; dismissed = false; }
      syncPower();
    };
    saverToggle && saverToggle.addEventListener('change', () => { if (!saverToggle.checked) dismissed = true; });
    b.addEventListener('levelchange', check);
    b.addEventListener('chargingchange', check);
    check();
  }).catch(() => {});
}

// ---------------------------------------------------------------- palette
const DEFAULT = [[139, 92, 246], [34, 211, 238], [244, 114, 182]];
let palette = DEFAULT.map((c) => c.slice());

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

function extractPalette(img) {
  const N = 40, c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, N, N);
  const px = ctx.getImageData(0, 0, N, N).data; // throws if the image is not CORS-clean
  const bins = Array.from({ length: 24 }, () => ({ w: 0, h: 0, s: 0, n: 0 }));
  let grey = 0;
  for (let i = 0; i < px.length; i += 4) {
    const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    if (l < 0.08 || l > 0.95) continue;
    const w = s * (1 - Math.abs(l - 0.5) * 1.4);
    if (s < 0.15) { grey++; continue; }
    const b = bins[Math.floor(h / 15) % 24];
    b.w += w; b.h += h; b.s += s; b.n++;
  }
  const picks = [];
  for (const b of bins.filter((b) => b.n).sort((a, b) => b.w - a.w)) {
    const h = b.h / b.n;
    if (picks.every((p) => Math.min(Math.abs(p - h), 360 - Math.abs(p - h)) > 34)) picks.push(h);
    if (picks.length === 3) break;
  }
  if (!picks.length) return DEFAULT.map((c) => c.slice()); // monochrome art: keep the house colours
  while (picks.length < 3) picks.push((picks[0] + 40 * picks.length) % 360); // analogous fill-ins
  return picks.map((h, i) => hslToRgb(h, 0.78 - i * 0.06, 0.62 + i * 0.03));
}

const css = (c) => `rgb(${c[0]} ${c[1]} ${c[2]})`;
function applyPalette(p) {
  palette = p;
  root.style.setProperty('--c1', css(p[0]));
  root.style.setProperty('--c2', css(p[1]));
  root.style.setProperty('--c3', css(p[2]));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#' + p[0].map((v) => Math.round(v * 0.18).toString(16).padStart(2, '0')).join('');
}

let lastSrc = '';
function onArtwork() {
  if (!art.naturalWidth || art.src === lastSrc) return;
  lastSrc = art.src;
  root.style.setProperty('--art-url', `url("${art.src.replace(/"/g, '%22')}")`);
  try { applyPalette(extractPalette(art)); } catch (e) { /* tainted canvas: keep current colours */ }
}
art.addEventListener('load', onArtwork);
if (art.complete) onArtwork();
new MutationObserver(() => {
  if (reduceMotion) return;
  art.classList.remove('swap');
  void art.offsetWidth;
  art.classList.add('swap');
}).observe(art, { attributes: true, attributeFilter: ['src'] });
art.addEventListener('animationend', () => art.classList.remove('swap'));

// ---------------------------------------------------------------- state classes
const toggle = $('enhancer-toggle');
const syncMastering = () => document.body.classList.toggle('mastering-on', !!(toggle && toggle.checked));
for (const t of [toggle, $('mobile-enhancer-toggle')]) t && t.addEventListener('change', () => setTimeout(syncMastering));
syncMastering();
setInterval(() => { if (!document.hidden) syncMastering(); }, 1500); // player.js may flip the toggle programmatically

// flash telemetry values when they change
new MutationObserver((muts) => {
  for (const m of muts) {
    const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
    if (!el || !el.classList.contains('val')) continue;
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
}).observe(document.querySelector('.workspace-utility'), { subtree: true, childList: true, characterData: true });

// ---------------------------------------------------------------- range fills
const ranges = [$('progress-bar'), $('volume-slider')].filter(Boolean);
function syncRanges() {
  for (const r of ranges) {
    const min = +r.min || 0, max = +r.max || 100;
    r.style.setProperty('--p', `${((+r.value - min) / (max - min || 1)) * 100}%`);
  }
}
for (const r of ranges) r.addEventListener('input', syncRanges);
for (const ev of ['timeupdate', 'loadedmetadata', 'seeked', 'emptied']) audio.addEventListener(ev, syncRanges);
syncRanges();

// ---------------------------------------------------------------- canvases
function fitCanvas(c) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (w && h && (c.width !== w || c.height !== h)) { c.width = w; c.height = h; }
  return w > 0 && h > 0;
}
const halo = $('viz-halo'), wave = $('viz-wave'), spec = $('viz-spectrum');
const visible = (el) => el && el.offsetParent !== null && el.getClientRects().length > 0;

let analyser = null, freq = null, time = null, binHz = 23.4;
function attach() {
  analyser = window.aetherAnalyser || null;
  if (!analyser) return;
  freq = new Uint8Array(analyser.frequencyBinCount);
  time = new Float32Array(analyser.fftSize);
  binHz = analyser.context.sampleRate / analyser.fftSize;
  kick();
}
window.addEventListener('aether:audio', attach);

// log-spaced band edges (in bins) for n bands between 35 Hz and 16 kHz
function bands(n) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(Math.max(1, Math.round((35 * Math.pow(16000 / 35, i / n)) / binHz)));
  return out;
}
let edgeCache = {};
function bandLevels(n) {
  const e = edgeCache[n] || (edgeCache[n] = bands(n)), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let k = e[i]; k <= Math.max(e[i], e[i + 1] - 1); k++) m = Math.max(m, freq[k] || 0);
    out[i] = m / 255;
  }
  return out;
}

let bass = 0, energy = 0, phase = 0;
const peaks = new Float32Array(48), peakVel = new Float32Array(48);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function drawHalo(levels) {
  if (!visible(halo) || !fitCanvas(halo)) return;
  const g = halo.getContext('2d'), W = halo.width, H = halo.height, cx = W / 2, cy = H / 2;
  g.clearRect(0, 0, W, H);
  const r0 = Math.min(W, H) * 0.35, len = Math.min(W, H) * 0.13, n = levels.length * 2;
  g.lineCap = 'round';
  g.lineWidth = Math.max(2, (Math.PI * 2 * r0 / n) * 0.42);
  for (let i = 0; i < n; i++) {
    const li = i < levels.length ? i : n - 1 - i; // mirrored ring
    const v = Math.pow(levels[li], 1.6);
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + phase * 0.15;
    const r1 = r0 + 4, r2 = r0 + 6 + v * len;
    const c = mix(palette[0], palette[1], li / levels.length);
    g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.25 + v * 0.75})`;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    g.stroke();
  }
}

function drawWave() {
  if (!visible(wave) || !fitCanvas(wave)) return;
  const g = wave.getContext('2d'), W = wave.width, H = wave.height, mid = H / 2;
  g.clearRect(0, 0, W, H);
  analyser.getFloatTimeDomainData(time);
  const P = 64, step = Math.floor(time.length / P), pts = [];
  for (let i = 0; i <= P; i++) {
    let m = 0;
    for (let k = i * step; k < Math.min(time.length, (i + 1) * step); k++) m = Math.max(m, Math.abs(time[k]));
    const env = Math.sin((i / P) * Math.PI); // taper the ends
    pts.push(Math.min(1, m * 1.4) * env);
  }
  const grad = g.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, css(palette[0])); grad.addColorStop(0.5, css(palette[1])); grad.addColorStop(1, css(palette[2]));
  for (const [amp, alpha, off] of [[1, 0.9, 0], [0.6, 0.35, 1.7]]) {
    g.beginPath();
    for (let i = 0; i <= P; i++) {
      const x = (i / P) * W, y = mid - pts[i] * mid * 0.9 * amp * (0.75 + 0.25 * Math.sin(phase * 2 + i * 0.35 + off));
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    for (let i = P; i >= 0; i--) {
      const x = (i / P) * W, y = mid + pts[i] * mid * 0.9 * amp * (0.75 + 0.25 * Math.cos(phase * 2 + i * 0.35 + off));
      g.lineTo(x, y);
    }
    g.closePath();
    g.globalAlpha = alpha * 0.55;
    g.fillStyle = grad;
    g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, mid - 0.5, W, 1);
}

function drawSpectrum(levels) {
  if (!visible(spec) || !fitCanvas(spec)) return;
  const g = spec.getContext('2d'), W = spec.width, H = spec.height, n = levels.length;
  g.clearRect(0, 0, W, H);
  const gap = Math.max(1, W / n * 0.28), bw = W / n - gap;
  const grad = g.createLinearGradient(0, H, 0, 0);
  grad.addColorStop(0, css(palette[0])); grad.addColorStop(0.6, css(palette[1])); grad.addColorStop(1, css(palette[2]));
  g.fillStyle = grad;
  for (let i = 0; i < n; i++) {
    const v = Math.pow(levels[i], 1.35), h = Math.max(2, v * H * 0.92), x = i * (bw + gap);
    g.globalAlpha = 0.85;
    roundRect(g, x, H - h, bw, h, Math.min(3, bw / 2));
    if (v >= peaks[i]) { peaks[i] = v; peakVel[i] = 0; }
    else { peakVel[i] += 0.0009; peaks[i] = Math.max(0, peaks[i] - peakVel[i]); }
    g.globalAlpha = 1;
    g.fillRect(x, H - peaks[i] * H * 0.92 - 3, bw, 2);
  }
  g.globalAlpha = 1;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, [r, r, 0, 0]); else g.rect(x, y, w, h);
  g.fill();
}

function setMotion() {
  for (const el of lite ? [stage] : [aurora, stage]) {
    if (!el) continue;
    el.style.setProperty('--bass', bass.toFixed(3));
    el.style.setProperty('--energy', energy.toFixed(3));
  }
}

// ---------------------------------------------------------------- loop
let raf = 0, lastT = 0;
const ease = (k, dt) => 1 - Math.pow(1 - k, dt / 16.7); // per-frame smoothing, frame-rate independent
function frame(t) {
  raf = 0;
  if (saver) return; // static UI; nothing to animate
  const playing = !audio.paused && !audio.ended;
  if (lite && t - lastT < 30) { raf = requestAnimationFrame(frame); return; } // ~30 fps on phones
  const dt = Math.min(100, lastT ? t - lastT : 16.7);
  lastT = t;
  if (analyser && playing) {
    analyser.getByteFrequencyData(freq);
    let b = 0, e = 0;
    const b0 = Math.round(40 / binHz), b1 = Math.round(150 / binHz), e1 = Math.round(8000 / binHz);
    for (let k = b0; k <= b1; k++) b += freq[k];
    for (let k = b0; k <= e1; k++) e += freq[k];
    b = Math.pow(b / ((b1 - b0 + 1) * 255), 2.2);
    e = Math.pow(e / ((e1 - b0 + 1) * 255), 1.2) * 1.6;
    bass += (b - bass) * ease(b > bass ? 0.55 : 0.12, dt); // fast attack, slow release
    energy += (Math.min(1, e) - energy) * ease(e > energy ? 0.3 : 0.06, dt);
  } else {
    bass *= 1 - ease(0.1, dt); energy *= 1 - ease(0.08, dt);
    if (freq) freq.fill(0);
  }
  phase += 0.016 * (dt / 16.7) * (1 + energy * 2);
  if (!reduceMotion) setMotion();
  if (analyser) {
    const levels = bandLevels(48);
    drawHalo(levels);
    drawWave();
    drawSpectrum(levels);
  }
  if ((playing || bass > 0.002 || energy > 0.002 || peaks.some((p) => p > 0.002)) && !document.hidden) raf = requestAnimationFrame(frame);
  else lastT = 0;
}
function kick() { if (!raf && !saver && !document.hidden) { lastT = 0; raf = requestAnimationFrame(frame); } }

function syncPlaying() {
  document.body.classList.toggle('playing', !audio.paused && !audio.ended);
  kick();
}
for (const ev of ['play', 'playing', 'pause', 'ended', 'emptied']) audio.addEventListener(ev, syncPlaying);
document.addEventListener('visibilitychange', kick);
addEventListener('resize', kick);
syncPlaying();
syncPower();
if (window.aetherAnalyser) attach();
