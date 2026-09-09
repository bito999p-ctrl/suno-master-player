/**
 * AetherEnhancer - Web Audio API Mastering Engine
 * Automatically synced from audio-mastering-tool/app.js.
 */

// Global mock state required by analyzeAudioResonances
const baseLoudnessTarget = 'genre';
const params = { limiterBoost: 3.5, clipperDrive: 1.5 };

export const GENRE_PRESETS = {
  auto: {
    satEnabled: true, satType: 'tube', satDrive: 12, satMix: 10, satLpfFreq: 12000,
    eqLowGain: 0.0, eqLowFreq: 90, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 9000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.0, compRatio: 1.35, compAttack: 0.04, compRelease: 0.20,
    stereoWidth: 1.15, clipperDrive: 1.5, limiterBoost: 3.5, sideHighPassFreq: 110
  },
  pops: {
    satEnabled: true, satType: 'tube', satDrive: 15, satMix: 10, satLpfFreq: 12000,
    eqLowGain: 1.0, eqLowFreq: 80, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: 0.0, eqHighFreq: 12000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.0, compRatio: 1.35, compAttack: 0.035, compRelease: 0.16,
    stereoWidth: 1.15, clipperDrive: 1.8, limiterBoost: 3.5, sideHighPassFreq: 110
  },
  rnb: {
    satEnabled: true, satType: 'tape', satDrive: 15, satMix: 12, satLpfFreq: 10000,
    eqLowGain: 1.2, eqLowFreq: 75, eqLowQ: 0.55,
    eqLowMidGain: -0.6, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -0.8, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.4, eqHighFreq: 10000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.0, compRatio: 1.35, compAttack: 0.04, compRelease: 0.20,
    stereoWidth: 1.25, clipperDrive: 1.2, limiterBoost: 3.2, sideHighPassFreq: 110
  },
  rock: {
    satEnabled: true, satType: 'tape', satDrive: 18, satMix: 12, satLpfFreq: 12000,
    eqLowGain: 1.0, eqLowFreq: 80, eqLowQ: 0.55,
    eqLowMidGain: 0.6, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -0.4, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.6, eqHighFreq: 12000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -7.5, compRatio: 1.35, compAttack: 0.05, compRelease: 0.15,
    stereoWidth: 1.15, clipperDrive: 2.5, limiterBoost: 4.0, sideHighPassFreq: 110
  },
  metal: {
    satEnabled: true, satType: 'tape', satDrive: 25, satMix: 14, satLpfFreq: 12000,
    eqLowGain: 1.0, eqLowFreq: 70, eqLowQ: 0.55,
    eqLowMidGain: -1.2, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -1.5, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.5, eqHighFreq: 8500, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -7.5, compRatio: 1.40, compAttack: 0.02, compRelease: 0.10,
    stereoWidth: 1.28, clipperDrive: 3.0, limiterBoost: 3.8, sideHighPassFreq: 120
  },
  edm: {
    satEnabled: true, satType: 'tape', satDrive: 18, satMix: 20, satLpfFreq: 16000,
    eqLowGain: 1.8, eqLowFreq: 65, eqLowQ: 0.55,
    eqLowMidGain: -0.8, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -0.5, eqMidFreq: 800, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.4, eqHighFreq: 14000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -7.0, compRatio: 1.35, compAttack: 0.05, compRelease: 0.20,
    stereoWidth: 1.30, clipperDrive: 3.5, limiterBoost: 4.5, sideHighPassFreq: 150
  },
  hiphop: {
    satEnabled: true, satType: 'tape', satDrive: 15, satMix: 14, satLpfFreq: 12000,
    eqLowGain: 1.8, eqLowFreq: 65, eqLowQ: 0.55,
    eqLowMidGain: -0.5, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -0.8, eqMidFreq: 350, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.5, eqHighFreq: 10000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.0, compRatio: 1.40, compAttack: 0.035, compRelease: 0.15,
    stereoWidth: 1.20, clipperDrive: 2.5, limiterBoost: 3.6, sideHighPassFreq: 150
  },
  lofi: {
    satEnabled: true, satType: 'tape', satDrive: 45, satMix: 30, satLpfFreq: 16000,
    eqLowGain: 2.0, eqLowFreq: 100, eqLowQ: 0.55,
    eqLowMidGain: -0.5, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.8, eqMidFreq: 1200, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -4.5, eqHighFreq: 7000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -10.0, compRatio: 1.5, compAttack: 0.06, compRelease: 0.30,
    stereoWidth: 0.92, clipperDrive: 1.0, limiterBoost: 2.8, sideHighPassFreq: 110
  },
  hardcore: {
    satEnabled: true, satType: 'hardcore', satDrive: 22, satMix: 16, satLpfFreq: 12000,
    eqLowGain: 1.5, eqLowFreq: 80, eqLowQ: 0.55,
    eqLowMidGain: -0.8, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: -1.2, eqMidFreq: 800, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 12000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.5, compRatio: 1.45, compAttack: 0.015, compRelease: 0.10,
    stereoWidth: 1.30, clipperDrive: 3.2, limiterBoost: 4.2, sideHighPassFreq: 150
  },
  ambient: {
    satEnabled: true, satType: 'tube', satDrive: 8, satMix: 6, satLpfFreq: 12000,
    eqLowGain: 2.0, eqLowFreq: 80, eqLowQ: 0.50,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 12000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -6.0, compRatio: 1.2, compAttack: 0.12, compRelease: 0.40,
    stereoWidth: 1.55, clipperDrive: 0.0, limiterBoost: 2.0, sideHighPassFreq: 90
  },
  podcast: {
    satEnabled: true, satType: 'tube', satDrive: 5, satMix: 5, satLpfFreq: 8000,
    eqLowGain: -2.0, eqLowFreq: 120, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.8, eqMidFreq: 1600, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 8000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -10.0, compRatio: 1.3, compAttack: 0.02, compRelease: 0.15,
    stereoWidth: 1.00, clipperDrive: 0.8, limiterBoost: 2.5, sideHighPassFreq: 150
  },
  classic: {
    satEnabled: false, satType: 'tube', satDrive: 0, satMix: 0, satLpfFreq: 10000,
    eqLowGain: 0.5, eqLowFreq: 100, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 10000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -4.0, compRatio: 1.15, compAttack: 0.15, compRelease: 0.50,
    stereoWidth: 1.30, clipperDrive: 0.0, limiterBoost: 1.5, sideHighPassFreq: 90
  },
  jazz: {
    satEnabled: true, satType: 'tube', satDrive: 6, satMix: 5, satLpfFreq: 12000,
    eqLowGain: 0.8, eqLowFreq: 80, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 14000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -7.5, compRatio: 1.20, compAttack: 0.06, compRelease: 0.25,
    stereoWidth: 1.15, clipperDrive: 0.5, limiterBoost: 2.2, sideHighPassFreq: 90
  },
  acoustic: {
    satEnabled: true, satType: 'tube', satDrive: 8, satMix: 8, satLpfFreq: 12000,
    eqLowGain: 1.0, eqLowFreq: 120, eqLowQ: 0.55,
    eqLowMidGain: 0.8, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.4, eqMidFreq: 2000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.2, eqHighFreq: 11000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -7.5, compRatio: 1.25, compAttack: 0.045, compRelease: 0.22,
    stereoWidth: 1.25, clipperDrive: 0.5, limiterBoost: 2.5, sideHighPassFreq: 90
  },
  custom: {
    satEnabled: true, satType: 'tube', satDrive: 12, satMix: 10, satLpfFreq: 12000,
    eqLowGain: 0.0, eqLowFreq: 90, eqLowQ: 0.55,
    eqLowMidGain: 0.0, eqLowMidFreq: 200, eqLowMidQ: 0.55,
    eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 0.70,
    eqMidHighGain: 0.0, eqMidHighFreq: 4500, eqMidHighQ: 0.70,
    eqHighGain: -0.3, eqHighFreq: 9000, eqHighQ: 0.50,
    compEnabled: true, compThreshold: -8.0, compRatio: 1.35, compAttack: 0.04, compRelease: 0.20,
    stereoWidth: 1.15, clipperDrive: 1.5, limiterBoost: 3.5, sideHighPassFreq: 110
  }
}

export const GENRE_TARGETS = {
  auto: { low: 2.6, high: 0.16, presence: 0.40 },
  pops: { low: 2.4, high: 0.16, presence: 0.39 },
  rnb: { low: 2.8, high: 0.15, presence: 0.38 },
  rock: { low: 2.6, high: 0.14, presence: 0.40 },
  metal: { low: 2.7, high: 0.16, presence: 0.40 },
  edm: { low: 3.1, high: 0.18, presence: 0.38 },
  hiphop: { low: 3.0, high: 0.14, presence: 0.36 },
  lofi: { low: 2.7, high: 0.12, presence: 0.35 },
  hardcore: { low: 2.8, high: 0.18, presence: 0.40 },
  ambient: { low: 2.5, high: 0.18, presence: 0.40 },
  podcast: { low: 1.6, high: 0.13, presence: 0.42 },
  classic: { low: 2.2, high: 0.13, presence: 0.38 },
  jazz: { low: 2.4, high: 0.14, presence: 0.39 },
  acoustic: { low: 2.2, high: 0.14, presence: 0.39 },
  custom: { low: 2.6, high: 0.16, presence: 0.40 }
}

export const LOUDNESS_TARGETS = {
  genre: { boost: null, clipper: null },     // Genre Default (follows selected preset)
  streaming: { boost: 4.0, clipper: 1.2 },  // Standard Streaming -14 LUFS target
  club: { boost: 7.0, clipper: 2.5 },       // Standard Club -9 LUFS target
  loud: { boost: 10.0, clipper: 3.5 },      // Standard Heavy -7 LUFS target
  pure: { boost: 0.0, clipper: 0.0 }        // High Dynamic Range -18 LUFS target
}

export function generateMasteringClipCurve(driveDb = 0.0) {
  const n_samples = 65536; // high resolution for mastering precision
  const curve = new Float32Array(n_samples);
  if (!driveDb || driveDb <= 0.05) {
    // Pure 100% bit-transparent bypass
    for (let i = 0; i < n_samples; ++i) {
      curve[i] = (i * 2) / (n_samples - 1) - 1;
    }
    return curve;
  }
  // Knee threshold dynamically scales with clipperDrive (0dB: 1.0 -> 6dB: 0.65)
  const T = Math.max(0.60, 1.0 - (driveDb / 6.0) * 0.35);
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / (n_samples - 1) - 1;
    const absX = Math.abs(x);
    if (absX <= T) {
      curve[i] = x;
    } else {
      const sign = Math.sign(x);
      const u = (absX - T) / (1.0 - T);
      // C1 continuous Hermite cubic saturation: slope reaches exactly 0.0 with smooth horizontal tangent reaching 1.0 at x = 1.0 (zero crackle, bit transparent)
      const y = T + (1.0 - T) * (u + u * u - u * u * u);
      curve[i] = sign * y;
    }
  }
  return curve;
}

export function generateSoftClipCurve() {
  const n_samples = 65536;
  const curve = new Float32Array(n_samples);
  const threshold = 0.85; // Linear up to 0.85 (-1.4 dBFS) to preserve bit transparency
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / (n_samples - 1) - 1;
    const absX = Math.abs(x);
    if (absX <= threshold) {
      curve[i] = x;
    } else {
      const sign = Math.sign(x);
      const u = (absX - threshold) / (1.0 - threshold);
      // C1 continuous Hermite cubic saturation knee: seamless slope match at threshold, horizontal tangent reaching exactly 1.0 at 1.0
      const y = threshold + (1.0 - threshold) * (u + u * u - u * u * u);
      curve[i] = sign * y;
    }
  }
  return curve;
}

export function generateSaturatorCurve(type, drive) {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  
  if (type === 'tube') {
    // Asymmetric triode tube saturation (musical 2nd-order even harmonics for 3D analog warmth)
    const k = 0.6 + (drive / 100) * 3.4; // range 0.6 to 4.0 (audiophile mastering grade)
    const offset = 0.06; // subtle tube triode grid bias for musical 2nd harmonic
    const dcCenter = Math.tanh(k * offset);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      const x_off = x + offset;
      const y = Math.tanh(k * x_off);
      // Subtract DC offset to keep zero-crossing perfectly centered
      curve[i] = y - dcCenter;
    }
    
    // 範囲[-1.0, 1.0]に正規化し、デジタルクリッピングノイズを防ぐ
    let maxVal = 0;
    for (let i = 0; i < n_samples; ++i) {
      const absVal = Math.abs(curve[i]);
      if (absVal > maxVal) maxVal = absVal;
    }
    if (maxVal > 0) {
      for (let i = 0; i < n_samples; ++i) {
        curve[i] /= maxVal;
      }
    }
  } else if (type === 'tape') {
    // Symmetric soft clipping (analog tape odd harmonics)
    const k = 0.5 + (drive / 100) * 5.5; // range 0.5 to 6.0
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
  } else if (type === 'hardcore') {
    // Aggressive Solid-State Console Drive (Punchy odd harmonics with smooth analog saturation, zero digital hard clamp)
    const k = 0.8 + (drive / 100) * 4.5; // range 0.8 to 5.3
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      // Symmetric BJT solid-state transfer curve: smooth saturation without flat square-wave fuzz
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
  } else {
    // Linear (Bypass)
    for (let i = 0; i < n_samples; ++i) {
      curve[i] = (i * 2) / n_samples - 1;
    }
  }
  return curve;
}

function fft(re, im) {
  const n = re.length;
  if (n <= 1) return;
  
  const reEven = new Float32Array(n / 2);
  const imEven = new Float32Array(n / 2);
  const reOdd = new Float32Array(n / 2);
  const imOdd = new Float32Array(n / 2);
  
  for (let i = 0; i < n / 2; i++) {
    reEven[i] = re[2 * i];
    imEven[i] = im[2 * i];
    reOdd[i] = re[2 * i + 1];
    imOdd[i] = im[2 * i + 1];
  }
  
  fft(reEven, imEven);
  fft(reOdd, imOdd);
  
  for (let k = 0; k < n / 2; k++) {
    const t = (k / n) * 2 * Math.PI;
    const wr = Math.cos(t);
    const wi = -Math.sin(t);
    
    const reT = reOdd[k] * wr - imOdd[k] * wi;
    const imT = reOdd[k] * wi + imOdd[k] * wr;
    
    re[k] = reEven[k] + reT;
    im[k] = imEven[k] + imT;
    re[k + n / 2] = reEven[k] - reT;
    im[k + n / 2] = imEven[k] - imT;
  }
}

export function analyzeAudioResonances(buffer, userPresetKey) {
  const fftSize = 2048;
  const numSlices = 32; // サンプリング精度を高めるため、32箇所を走査
  const sampleRate = buffer.sampleRate;
  const chL = buffer.getChannelData(0);
  const chR = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : chL;
  
  const avgSpectrum = new Float32Array(fftSize / 2);
  const re = new Float32Array(fftSize);
  const im = new Float32Array(fftSize);
  
  // 1. サンプリングポイントの算出（前後10%はブレや静音部回避のため避ける）
  const slicePoints = [];
  const startOffset = Math.floor(buffer.length * 0.1);
  const endOffset = Math.floor(buffer.length * 0.9);
  const range = endOffset - startOffset;
  for (let i = 0; i < numSlices; i++) {
    slicePoints.push(startOffset + Math.floor(range * (i / (numSlices - 1))));
  }
  
  // 1. 第一パス：各スライスのRMSを算出して最大RMS値を特定し、無音しきい値を決定
  const sliceRMSList = [];
  let maxRmsVal = 0.001;
  
  for (const startIdx of slicePoints) {
    let sliceSumSq = 0.0;
    for (let j = 0; j < fftSize; j++) {
      const idx = startIdx + j;
      if (idx >= buffer.length) break;
      const l = chL[idx];
      const r = chR[idx];
      const mid = (l + r) * 0.5;
      sliceSumSq += mid * mid;
    }
    const sliceRMS = Math.sqrt(sliceSumSq / fftSize);
    sliceRMSList.push(sliceRMS);
    if (sliceRMS > maxRmsVal) {
      maxRmsVal = sliceRMS;
    }
  }

  // 無音判定のしきい値（最大音量の2%）
  const silenceThreshold = maxRmsVal * 0.02;

  // 2. 第二パス：アクティブな（無音でない）スライスのみを対象にFFT解析と累積平均スペクトラムの計算を実行
  let activeSliceCount = 0;
  const sliceSpectrums = [];
  let totalEnergyL2 = 0;
  let totalEnergyR2 = 0;
  let totalDotProduct = 0;
  let maxAbsSample = 0.0;
  let sumRMS2 = 0.0;

  for (let i = 0; i < slicePoints.length; i++) {
    const startIdx = slicePoints[i];
    const sliceRMS = sliceRMSList[i];
    
    // このスライスがアクティブかどうか
    const isActive = (sliceRMS >= silenceThreshold);
    
    let sliceMax = 0.0;
    let sliceSumSq = 0.0;
    let sliceDotProduct = 0;
    let sliceSumL2 = 0;
    let sliceSumR2 = 0;

    // サンプルデータの集計（統計とFFT用）
    for (let j = 0; j < fftSize; j++) {
      const idx = startIdx + j;
      if (idx >= buffer.length) break;

      const l = chL[idx];
      const r = chR[idx];
      const mid = (l + r) * 0.5;

      re[j] = mid;
      im[j] = 0;

      const absL = Math.abs(l);
      const absR = Math.abs(r);
      if (absL > sliceMax) sliceMax = absL;
      if (absR > sliceMax) sliceMax = absR;
      
      sliceSumSq += mid * mid;
      sliceDotProduct += l * r;
      sliceSumL2 += l * l;
      sliceSumR2 += r * r;
    }

    if (sliceMax > maxAbsSample) maxAbsSample = sliceMax;
    sumRMS2 += sliceRMS * sliceRMS;
    totalDotProduct += sliceDotProduct;
    totalEnergyL2 += sliceSumL2;
    totalEnergyR2 += sliceSumR2;

    const spec = new Float32Array(fftSize / 2);
    
    // アクティブなスライスのみFFTを実行し、平均スペクトラムに累積
    if (isActive) {
      for (let j = 0; j < fftSize; j++) {
        const windowVal = 0.5 * (1 - Math.cos((2 * Math.PI * j) / (fftSize - 1)));
        re[j] *= windowVal;
      }
      fft(re, im);
      const normFactor = fftSize / 2;
      for (let j = 0; j < fftSize / 2; j++) {
        const mag = Math.sqrt(re[j] * re[j] + im[j] * im[j]) / normFactor;
        avgSpectrum[j] += mag; // 後でactiveSliceCountで除算
        spec[j] = mag;
      }
      activeSliceCount++;
    } else {
      // 無音スライスの場合はスペクトラムを0にする
      spec.fill(0);
    }
    sliceSpectrums.push(spec);
  }

  // 平均スペクトラムの正規化（アクティブなスライス数で平均化）
  if (activeSliceCount > 0) {
    for (let j = 0; j < fftSize / 2; j++) {
      avgSpectrum[j] /= activeSliceCount;
    }
  } else {
    // 万が一すべてが無音だった場合は全体の平均にする
    for (let j = 0; j < fftSize / 2; j++) {
      avgSpectrum[j] /= numSlices;
    }
  }

  // クレストファクター (dB)
  const avgRMS = Math.sqrt(sumRMS2 / numSlices);
  const crestRatio = maxAbsSample / (avgRMS + 1e-6);
  const crestFactorDb = Math.max(0.0, 20 * Math.log10(crestRatio));

  // ステレオ相関値 (-1.0 〜 +1.0)
  let avgCorrelation = 1.0;
  if (totalEnergyL2 > 0 && totalEnergyR2 > 0) {
    avgCorrelation = totalDotProduct / Math.sqrt(totalEnergyL2 * totalEnergyR2);
    avgCorrelation = Math.max(-1.0, Math.min(1.0, avgCorrelation));
  }

  // 2. 周波数帯域別エネルギーの集計（音楽音響工学に基づいた4バンド分割）
  // Bass (低域基礎): 20Hz - 160Hz
  // Low-Mids (基音・温かみ・厚み): 160Hz - 800Hz
  // High-Mids (母音・倍音・存在感): 800Hz - 5,000Hz (聴覚感度が最も高いエリア)
  // Treble (空気感・煌びやかさ): 5,000Hz - 20,000Hz
  const binSub = Math.floor((20 * fftSize) / sampleRate);
  const binBassEnd = Math.floor((160 * fftSize) / sampleRate);
  const binMidStart = binBassEnd + 1;
  const binMidEnd = Math.floor((800 * fftSize) / sampleRate);
  const binHighMidStart = binMidEnd + 1;
  const binHighMidEnd = Math.floor((5000 * fftSize) / sampleRate);
  const binAirStart = binHighMidEnd + 1;
  const binAirEnd = Math.min(fftSize / 2 - 1, Math.floor((20000 * fftSize) / sampleRate));

  let bassSum = 0;
  for (let j = binSub; j <= binBassEnd; j++) bassSum += avgSpectrum[j];
  const energyBass = bassSum / (binBassEnd - binSub + 1);

  let lowMidSum = 0;
  for (let j = binMidStart; j <= binMidEnd; j++) lowMidSum += avgSpectrum[j];
  const energyLowMid = lowMidSum / (binMidEnd - binMidStart + 1);

  let highMidSum = 0;
  for (let j = binHighMidStart; j <= binHighMidEnd; j++) highMidSum += avgSpectrum[j];
  const energyHighMid = highMidSum / (binHighMidEnd - binHighMidStart + 1);

  let trebleSum = 0;
  for (let j = binAirStart; j <= binAirEnd; j++) trebleSum += avgSpectrum[j];
  const energyTreble = trebleSum / (binAirEnd - binAirStart + 1);

  // 実際のエネルギー比率 (中低域/ローミッドを基準とする)
  const actualLowMidRatio = energyBass / (energyLowMid + 1e-6);
  // 高域（Treble）のエネルギー比率は、低中域（Low-Mid）ではなく中高域（High-Mid / プレゼンス）と比較することで、
  // Suno音源特有の「中域の過圧縮（デコボコした密度）」による影響を排除し、純粋な高域のシャリシャリ感のみを精密測定します。
  const actualHighMidRatio = energyTreble / (energyHighMid + 1e-6);
  const actualPresenceRatio = energyHighMid / (energyLowMid + 1e-6);

  let minRmsIdx = 0;
  let minRmsVal = 1.0;
  let foundValidBlock = false;
  // (silenceThresholdは既に上部で算出されています)

  for (let i = 0; i < sliceRMSList.length; i++) {
    if (sliceRMSList[i] >= silenceThreshold) {
      if (sliceRMSList[i] < minRmsVal) {
        minRmsVal = sliceRMSList[i];
        minRmsIdx = i;
        foundValidBlock = true;
      }
    }
  }

  // 万が一すべての区間が閾値以下になった場合は、従来の絶対最小の区間を使用
  if (!foundValidBlock) {
    minRmsVal = 1.0;
    for (let i = 0; i < sliceRMSList.length; i++) {
      if (sliceRMSList[i] < minRmsVal) {
        minRmsVal = sliceRMSList[i];
        minRmsIdx = i;
      }
    }
  }

  // Hiss estimation (amplitude average between 8kHz and 15kHz in the quietest block)
  const binHissStart = Math.floor((8000 * fftSize) / sampleRate);
  const binHissEnd = Math.floor((15000 * fftSize) / sampleRate);
  let hissSum = 0;
  for (let j = binHissStart; j <= binHissEnd; j++) {
    hissSum += sliceSpectrums[minRmsIdx][j];
  }
  const hissNoiseFloor = hissSum / (binHissEnd - binHissStart + 1);
  const hissNoiseFloorDb = 20 * Math.log10(hissNoiseFloor + 1e-6) + 26.0; // Added FFT bin bandwidth gain correction factor (+26dB) to align bin average with broadband level

  // Rumble estimation (amplitude average between 15Hz and 35Hz in the quietest block)
  // マスタリング音響工学基準: 50Hzのキック帯域を巻き込まず、真の超低周波インフラサウンド（15Hz〜35Hz）のみをスキャン
  const binRumbleStart = Math.max(1, Math.floor((15 * fftSize) / sampleRate));
  const binRumbleEnd = Math.floor((35 * fftSize) / sampleRate);
  let rumbleSum = 0;
  for (let j = binRumbleStart; j <= binRumbleEnd; j++) {
    rumbleSum += sliceSpectrums[minRmsIdx][j];
  }
  const rumbleNoiseFloor = rumbleSum / (binRumbleEnd - binRumbleStart + 1);
  const rumbleNoiseFloorDb = 20 * Math.log10(rumbleNoiseFloor + 1e-6) + 26.0; // Added FFT bin bandwidth gain correction factor (+26dB) to align bin average with broadband level

  // Suggested values:
  // 1. RUMBLE CUT: 真の超低周波ノイズ（空調・マイク吹かれ・DCオフセット）が -58dBFS を超える場合のみ 32Hz HPF を発動
  let sugRumbleCut = false;
  if (rumbleNoiseFloorDb > -58.0 && minRmsVal < 0.08) {
    sugRumbleCut = true;
  }

  // 2. HISS REDUCER: モニター環境で知覚可能な高域サー音（-72dBFS超過）が存在する場合のみ発動（アコースティック等の通常余韻を誤検知しない設計）
  let sugHissAmount = 0;
  if (hissNoiseFloorDb > -72.0 && minRmsVal < 0.05) {
    const excessDb = hissNoiseFloorDb + 72.0; // 例: -66dB -> +6dB
    sugHissAmount = Math.round(Math.min(50, 15 + excessDb * 3.5));
  }

  // 歌の音域のカーン域共鳴音（1000Hz-4000Hz）および高域の鋭いピーク（4000Hz-12000Hz）をマルチスキャンして自動補正ノッチを構築
  const filteredPeaks = [];
  const scanMinBin = Math.floor((1000 * fftSize) / sampleRate);
  const scanMaxBin = Math.min(fftSize / 2 - 1, Math.floor((12000 * fftSize) / sampleRate));
  const rawResonancePeaks = [];

  for (let j = scanMinBin; j < scanMaxBin; j++) {
    const val = avgSpectrum[j];
    const peakFreq = Math.round((j * sampleRate) / fftSize);
    
    if (val > avgSpectrum[j - 1] && val > avgSpectrum[j + 1]) {
      const localBins = [
        avgSpectrum[j - 4], avgSpectrum[j - 3], avgSpectrum[j - 2],
        avgSpectrum[j + 2], avgSpectrum[j + 3], avgSpectrum[j + 4]
      ];
      const localFloor = localBins.reduce((sum, v) => sum + v, 0) / localBins.length;
      const ratio = val / (localFloor + 1e-9);

      // Mid range (1kHz-4kHz) vs High range (4kHz-12kHz) detection thresholds
      const isMidRange = (peakFreq >= 1000 && peakFreq < 4000);
      const thresholdMultiplier = isMidRange ? 1.25 : 1.15; // Mid is slightly more robust, high is sensitive
      
      if (ratio > thresholdMultiplier) {
        let cutDb = 0;
        let targetQ = 10.0;
        
        if (isMidRange) {
          // Mid range (vocals, "ka-n" resonance): apply gentle notch (-1.0dB to -2.8dB max) to avoid hollow vocals
          cutDb = -Math.min(2.8, 1.0 + (ratio - thresholdMultiplier) * 5.0);
          targetQ = 10.0; // musical Q for voice resonance removal
        } else {
          // High range (whistles, sibilance): apply surgical notch (-1.5dB to -4.5dB max)
          cutDb = -Math.min(4.5, 1.5 + (ratio - thresholdMultiplier) * 7.0);
          targetQ = 15.0; // very narrow Q for high frequency whistle notch
        }

        rawResonancePeaks.push({
          freq: peakFreq,
          cut: Math.round(cutDb * 10) / 10,
          q: targetQ,
          score: ratio,
          isBroad: isMidRange
        });
      }
    }
  }

  // Sort peaks by prominence score descending
  rawResonancePeaks.sort((a, b) => b.score - a.score);

  // Select top 8 peaks that are at least 350Hz apart to avoid clustering
  for (const peak of rawResonancePeaks) {
    if (filteredPeaks.length >= 8) break;
    const tooClose = filteredPeaks.some(p => Math.abs(p.freq - peak.freq) < 350);
    if (!tooClose) {
      filteredPeaks.push(peak);
    }
  }
  // 3. DE-ESSER: 音声工学・音響医学基準のボーカル・シビランス帯域 (4,500Hz 〜 8,500Hz) をスキャン
  let sibilanceDynamicFreq = 0;
  const sibilanceMinBin = Math.floor((4500 * fftSize) / sampleRate);
  const sibilanceMaxBin = Math.min(fftSize / 2 - 1, Math.floor((8500 * fftSize) / sampleRate));
  const rawSibilancePeaks = [];
  
  for (let j = sibilanceMinBin; j <= sibilanceMaxBin; j++) {
    const val = avgSpectrum[j];
    const peakFreq = Math.round((j * sampleRate) / fftSize);
    if (val > avgSpectrum[j - 1] && val > avgSpectrum[j + 1]) {
      const localBins = [
        avgSpectrum[j - 3], avgSpectrum[j - 2],
        avgSpectrum[j + 2], avgSpectrum[j + 3]
      ];
      const localFloor = localBins.reduce((sum, v) => sum + v, 0) / localBins.length;
      const ratio = val / (localFloor + 1e-9);
      // シビランス検知閾値: 周囲の倍音床面に対して +1.5dB (ratio > 1.18) 以上の鋭い突起
      if (ratio > 1.18) {
        rawSibilancePeaks.push({ freq: peakFreq, score: ratio });
      }
    }
  }
  if (rawSibilancePeaks.length > 0) {
    rawSibilancePeaks.sort((a, b) => b.score - a.score);
    sibilanceDynamicFreq = rawSibilancePeaks[0].freq;
  }

  // 決定木型ジャンル自動検出 (2パス実効解析による周波数バランス比率分類)
  let detectedGenre = 'pops';
  if (actualLowMidRatio > 3.2) {
    // 重低音が強烈な電子音楽・クラブ系
    if (actualHighMidRatio > 0.09 || actualPresenceRatio > 0.38) {
      detectedGenre = 'edm';
    } else {
      detectedGenre = 'hiphop';
    }
  } else if (actualPresenceRatio > 0.42) {
    // 中高域（1.5kHz-5kHzのギター壁・ボーカル）が際立つ激しい音楽
    if (actualHighMidRatio > 0.12 || actualLowMidRatio > 3.0) {
      detectedGenre = 'metal';
    } else {
      detectedGenre = 'rock';
    }
  } else if (crestFactorDb >= 12.8) {
    // ダイナミックレンジが広く圧縮感のない音楽
    if (actualLowMidRatio >= 2.2 && actualLowMidRatio <= 3.0) {
      detectedGenre = 'jazz';
    } else if (actualLowMidRatio < 2.2 && actualHighMidRatio < 0.03) {
      detectedGenre = 'classic';
    } else {
      detectedGenre = 'acoustic';
    }
  } else if (actualLowMidRatio < 2.0 && actualHighMidRatio < 0.10) {
    detectedGenre = 'podcast';
  } else {
    detectedGenre = 'pops';
  }

  const genreSelect = document.getElementById('preset-select');
  const userGenreKey = userPresetKey || (genreSelect ? genreSelect.value : 'auto');
  const genreKey = (userGenreKey === 'auto' || userGenreKey === 'custom') ? 'auto' : userGenreKey;
  // AI AUTO解析時は、検出されたジャンル専用のターゲットとベースプリセットを使用することで、
  // ジャンル本来の強み（EDMなら重低音、クラシックなら控えめで自然な音響など）を損なわずに精密補正します。
  const basePresetKey = (genreKey === 'auto') ? detectedGenre : genreKey;
  const basePreset = GENRE_PRESETS[basePresetKey] || GENRE_PRESETS.auto;
  const target = GENRE_TARGETS[basePresetKey] || GENRE_TARGETS.auto;

  // EDM, HIPHOP, HARDCORE などの重低音（サブベース）を重視するジャンルの場合、
  // 80Hz以下の帯域を急峻にカットする Rumble Cut はサブベースをごそっと削り取ってしまうため、AI自動解析によるONを禁止します。
  const isSubBassGenre = (detectedGenre === 'edm' || detectedGenre === 'hiphop' || detectedGenre === 'hardcore' ||
                          genreKey === 'edm' || genreKey === 'hiphop' || genreKey === 'hardcore');
  if (isSubBassGenre) {
    sugRumbleCut = false;
  }

  const lowDiffDb = 20 * Math.log10(actualLowMidRatio / target.low);
  const highDiffDb = 20 * Math.log10(actualHighMidRatio / target.high);
  const targetPresence = target.presence || 0.42;
  const presenceDiffDb = 20 * Math.log10(actualPresenceRatio / targetPresence);

  // クラシックやアコースティックなどの生楽器主体のダイナミックな楽曲は、
  // アレンジャーや録音エンジニアが意図的に調整した繊細な帯域バランスを破壊しないよう、
  // AIによる自動イコライジング（補正値）の適用強度を25%以下に大幅に抑制（スケールダウン）します。
  // また、クレストファクター（強弱差）が大きい楽曲全体も適用度を50%に抑え、不要な歪みやビビリ音の発生を未然に防止します。
  const isGentleGenre = (detectedGenre === 'classic' || detectedGenre === 'acoustic' || basePresetKey === 'classic' || basePresetKey === 'acoustic');
  const spectralCorrectionScale = isGentleGenre ? 0.25 : (crestFactorDb > 12.0 ? 0.50 : 1.0);

  // 5. HIGH EQ (高域・エアバンド補正: 14000Hz) の先行計算（スペクトル傾斜リンク用）
  const eqHighAdjustment = -highDiffDb * 1.25 * spectralCorrectionScale;
  const eqHighGainTemp = Math.max(-4.5, Math.min(4.0, Math.round((basePreset.eqHighGain + eqHighAdjustment) * 10) / 10));

  // 高域をカットした際、聴感上の低域のブワつき（ぼわーん感）を防ぐため、
  // HIGH EQの減衰量に連動してLOW/LOW-MIDを自動的かつ微量に引き締める「スペクトル・傾斜リンク補正」を適用します。
  let tiltCompensation = 0.0;
  if (eqHighGainTemp < 0.0) {
    tiltCompensation = eqHighGainTemp * 0.12; // 例: -1.2dBカットのとき、-0.14dBの低音引き締め（中間値へマイルド化）
  }

  // =========================================================================
  // ACADEMIC SPECTRAL FREQUENCY OPTIMIZATION FOR 5-BAND EQ
  // =========================================================================
  // 1. 周波数重心 (Spectral Centroid) 算出関数
  const getSpectralCentroid = (minHz, maxHz) => {
    const bStart = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
    const bEnd = Math.min(fftSize / 2 - 1, Math.floor((maxHz * fftSize) / sampleRate));
    let weightedSum = 0;
    let energySum = 0;
    for (let b = bStart; b <= bEnd; b++) {
      const f = (b * sampleRate) / fftSize;
      const mag = avgSpectrum[b];
      weightedSum += f * mag;
      energySum += mag;
    }
    return energySum > 0 ? (weightedSum / energySum) : ((minHz + maxHz) / 2);
  };

  // 2. 局所共鳴ピーク (Prominent Spectral Peak) 探索関数
  const getProminentPeakFreq = (minHz, maxHz, fallbackHz) => {
    const bStart = Math.max(2, Math.floor((minHz * fftSize) / sampleRate));
    const bEnd = Math.min(fftSize / 2 - 2, Math.floor((maxHz * fftSize) / sampleRate));
    let bestFreq = fallbackHz;
    let maxProminence = 1.05; // 最低でも5%の局所突起が必要
    for (let b = bStart; b <= bEnd; b++) {
      const mag = avgSpectrum[b];
      if (mag > avgSpectrum[b - 1] && mag > avgSpectrum[b + 1]) {
        const floor = (avgSpectrum[b - 2] + avgSpectrum[b + 2]) * 0.5 + 1e-9;
        const prom = mag / floor;
        if (prom > maxProminence) {
          maxProminence = prom;
          bestFreq = Math.round((b * sampleRate) / fftSize);
        }
      }
    }
    return bestFreq;
  };

  // 3. 最大エネルギー周波数 (Max Energy Frequency) 探索関数
  const getMaxEnergyFreq = (minHz, maxHz, fallbackHz) => {
    const bStart = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
    const bEnd = Math.min(fftSize / 2 - 1, Math.floor((maxHz * fftSize) / sampleRate));
    let bestFreq = fallbackHz;
    let maxEnergy = -1;
    for (let b = bStart; b <= bEnd; b++) {
      if (avgSpectrum[b] > maxEnergy) {
        maxEnergy = avgSpectrum[b];
        bestFreq = Math.round((b * sampleRate) / fftSize);
      }
    }
    return bestFreq;
  };

  // 1. LOW EQ (低域シェルフ: 50Hz〜130Hz)
  // ターゲットからのズレを100%反転して補正値とします（最大+4.0dB〜-4.0dB）
  const eqLowAdjustment = -lowDiffDb * spectralCorrectionScale;
  // Spotify基準のタイトな低音に極限まで肉薄させるため、自動算出値に対してわずか -0.3dB の微調整用カットバイアスおよび傾斜リンク補正を適用します
  const eqLowGain = Math.max(-4.0, Math.min(4.0, Math.round((basePreset.eqLowGain + eqLowAdjustment - 0.3 + tiltCompensation) * 10) / 10));

  // 40Hz〜160Hz区間のスペクトルエネルギー重心および最大ピークを解析
  const lowCentroid = getSpectralCentroid(40, 160);
  const lowPeak = getMaxEnergyFreq(40, 130, 80);
  let suggestedEqLowFreq;
  if (lowDiffDb < -0.8) {
    // 低域不足（ブースト時）：キックの胴鳴りとベース土台を豊かに持ち上げるため、重心やや下（60〜85Hz）に配置
    const targetHz = lowCentroid * 0.4 + lowPeak * 0.6;
    suggestedEqLowFreq = Math.max(60, Math.min(85, Math.round(targetHz / 5) * 5));
  } else if (lowDiffDb > 0.8) {
    // 低域過剰（カット時）：50Hz付近のサブベースを削らず、不要な100Hz前後のブーミー感を落とすため高め（95〜125Hz）に配置
    const targetHz = Math.max(95, lowCentroid * 1.12);
    suggestedEqLowFreq = Math.max(95, Math.min(125, Math.round(targetHz / 5) * 5));
  } else {
    // 概ねバランス良好：重心周波数をベースに75〜105Hzで自然にチューニング
    suggestedEqLowFreq = Math.max(75, Math.min(105, Math.round(lowCentroid / 5) * 5));
  }

  // 2. LOW-MID EQ (中低域ピーク: 180Hz〜360Hz)
  // 低域全体の過不足に対して50%の割合で追従し、ふくよかさ・スッキリ感を調整します（最大+2.0dB〜-2.0dB）。傾斜リンク補正も加味します。
  const eqLowMidAdjustment = -lowDiffDb * 0.5 * spectralCorrectionScale;
  const eqLowMidGain = Math.max(-2.0, Math.min(2.0, Math.round((basePreset.eqLowMidGain + eqLowMidAdjustment + tiltCompensation) * 10) / 10));

  // 180Hz〜360Hzの「こもり・箱鳴り・帯域重複」の共鳴ピークをスキャン
  const lowMidPeak = getProminentPeakFreq(180, 360, 0);
  const lowMidCentroid = getSpectralCentroid(180, 360);
  let suggestedEqLowMidFreq;
  if (lowMidPeak >= 180 && lowMidPeak <= 360) {
    suggestedEqLowMidFreq = Math.round(lowMidPeak / 5) * 5;
  } else {
    suggestedEqLowMidFreq = Math.max(190, Math.min(340, Math.round(lowMidCentroid / 5) * 5));
  }

  // 3. MID EQ (中域ピーク: 700Hz〜1600Hz)
  // 箱鳴りやラジオ感を防ぐため、追従感度を 0.5 → 0.75 に高め、カットバイアスも -0.8 → -1.5dB へ強めてすっきりさせます
  const eqMidAdjustment = (-presenceDiffDb * 0.75 - 1.5) * spectralCorrectionScale; 
  const eqMidGain = Math.max(-4.5, Math.min(0.5, Math.round((basePreset.eqMidGain + eqMidAdjustment) * 10) / 10));

  // 700Hz〜1600Hzの中域母音フォルマント・鼻声・缶鳴りピークをスキャン
  const midPeak = getProminentPeakFreq(700, 1600, 0);
  const midCentroid = getSpectralCentroid(700, 1600);
  let suggestedEqMidFreq;
  if (midPeak >= 700 && midPeak <= 1600) {
    suggestedEqMidFreq = Math.round(midPeak / 25) * 25;
  } else {
    suggestedEqMidFreq = Math.max(750, Math.min(1500, Math.round(midCentroid / 25) * 25));
  }

  // 4. MID-HIGH EQ (中高域ピーク: 2500Hz〜5500Hz)
  // 等ラウドネス曲線（ISO 226）に基づき、聴覚感度が急峻に高まる3k〜5kHz帯の過剰な持ち上げ（聴覚疲労・音割れの原因）を完全リセット。
  // 原則としてフラット（0.0dB）を基準とし、ターゲット偏差に対する微細なティルト補正（±1.5dB以内、感度0.35）にとどめます。
  const eqMidHighAdjustment = -presenceDiffDb * 0.35 * spectralCorrectionScale;
  const eqMidHighGain = Math.max(-1.5, Math.min(1.5, Math.round((basePreset.eqMidHighGain + eqMidHighAdjustment) * 10) / 10));

  // 2500Hz〜5500Hzの外耳道共鳴・耳障りな摩擦音（Presence/Harshness）ピークをスキャン
  let harshPeak = 0;
  const harshRes = filteredPeaks.find(p => p.freq >= 2500 && p.freq <= 5500);
  if (harshRes) {
    harshPeak = harshRes.freq;
  } else {
    harshPeak = getProminentPeakFreq(2500, 5500, 0);
  }
  const midHighCentroid = getSpectralCentroid(2500, 5500);
  let suggestedEqMidHighFreq;
  if (harshPeak >= 2500 && harshPeak <= 5500) {
    suggestedEqMidHighFreq = Math.round(harshPeak / 50) * 50;
  } else {
    suggestedEqMidHighFreq = Math.max(2800, Math.min(5000, Math.round(midHighCentroid / 50) * 50));
  }

  // 5. HIGH EQ (高域・エアバンド補正: 14000Hz)
  // ターゲットからのズレを100%反転して直接補正。曇った音源は明るく、うるさい音源は暖かく整えます（最大+3.5dB〜-4.5dB）
  // 1. 入力ゲインステージングの先行計算（ピークレベルを -6.0dBFS に整えヘッドルームを確保）
  const originalPeakDb = 20 * Math.log10(maxAbsSample + 1e-6);
  const suggestedInputGainDb = Math.max(-12.0, Math.min(12.0, -6.0 - originalPeakDb));

  // 2. ダイナミクス補正 (音楽理論・ダイナミックレンジ基準によるクレストファクター分析 ＆ 目標ラウドネス自動追従)
  let compThreshold = basePreset.compThreshold;
  let compRatio = basePreset.compRatio;
  let crestDesc = "Normal (Balanced)";

  // ピーク正規化後の信号の平均音量（RMS dBFS）
  const avgRmsDb = 20 * Math.log10(avgRMS + 1e-6);
  const rmsAfterGainDb = avgRmsDb + suggestedInputGainDb;

  // ジャンル別目標平均音量（RMS dB FS。-14LUFSターゲットに準拠）
  const genreTargetRmsDb = {
    auto: -14.5,
    pops: -14.0,     // Pops/J-POP: 標準ストリーミング (-14 LUFS相当)
    rnb: -13.5,
    rock: -13.0,
    metal: -12.5,    // Metal: 迫力ある音圧壁 (-12.5 dB)
    edm: -11.5,      // EDM: クラブ向け最大音圧 (-11.5 dB)
    hiphop: -12.5,
    lofi: -15.5,
    hardcore: -11.2, // Hardcore: 限界の押し込み (-11.2 dB)
    ambient: -17.5,
    podcast: -15.0,
    classic: -19.5,
    jazz: -16.0,
    acoustic: -16.5,
    custom: -14.5
  };
  const targetRmsDb = genreTargetRmsDb[genreKey] || genreTargetRmsDb.auto;

  // 目標ラウドネスまでに不足しているゲイン量（dB）
  let requiredBoost = targetRmsDb - rmsAfterGainDb;

  // クレストファクター（ダイナミックレンジの広さ）に応じたコンプレッションと音圧補正
  const genreTargetCrest = {
    auto: 10.5, pops: 11.0, rnb: 10.0, rock: 11.0, metal: 9.5, edm: 8.5,
    hiphop: 9.0, lofi: 12.0, hardcore: 8.0, ambient: 13.5, podcast: 10.5,
    classic: 14.5, jazz: 12.5, acoustic: 13.0, custom: 10.5
  };
  const targetCrest = genreTargetCrest[genreKey] || genreTargetCrest.auto;
  const crestDiff = crestFactorDb - targetCrest;

  if (crestDiff > 0.0) {
    // 音源がダイナミック（強弱が広い）-> コンプのしきい値を下げ、リミッターのブースト量を増やしてダイナミクスを制御
    const compressionFactor = Math.min(6.0, crestDiff * 0.45);
    const ratioFactor = Math.min(0.3, crestDiff * 0.06);
    compThreshold = Math.max(-14.0, basePreset.compThreshold - compressionFactor);
    compRatio = Math.min(1.8, basePreset.compRatio + ratioFactor);
    crestDesc = "High (Highly Dynamic)";
    
    // 強弱が広いものはリミッターで叩く余地を増やすためにブーストを加算
    requiredBoost += Math.min(1.5, crestDiff * 0.35);
  } else {
    // 音源がすでに強く圧縮されている -> 二重圧縮を防ぐため、コンプレッサーを逃がす
    const releaseFactor = Math.min(4.0, -crestDiff * 0.5);
    const ratioFactor = Math.min(0.2, -crestDiff * 0.05);
    compThreshold = Math.min(-5.0, basePreset.compThreshold + releaseFactor);
    compRatio = Math.max(1.15, basePreset.compRatio - ratioFactor);
    crestDesc = "Low (Highly Compressed)";
    
    // すでにダイナミクスがないためリミッターでの歪みを防ぐようブーストを減衰
    requiredBoost += Math.max(-2.5, crestDiff * 0.5);
  }

  // 音量低下を防止するための最低限のリミッターブースト（出力ピークが少なくとも-1.0dBFSに達するように補償）
  const baselineLimiterBoost = -1.0 - (suggestedInputGainDb + originalPeakDb);
  let limiterBoost = Math.max(baselineLimiterBoost, requiredBoost);

  // 低域飽和による歪み・ビビリ防止（低域が基準ターゲットより著しく大きい場合、マキシマイザーブーストを自動制限）
  if (lowDiffDb > 1.0) {
    const bassOverloadPenalty = Math.min(1.5, (lowDiffDb - 1.0) * 0.75);
    limiterBoost = Math.max(baselineLimiterBoost - 1.0, limiterBoost - bassOverloadPenalty);
  }

  // 温和なアコースティック・クラシック系ジャンルでは、リミッターによる強烈な圧縮歪みやビビリ音を防ぎ、
  // 原音の広いダイナミクスを保護するために、マキシマイザーブースト（limiterBoost）の最大上限値を控えめに制限します。
  let maxAllowedLimiterBoost = 10.0;
  if (detectedGenre === 'classic' || basePresetKey === 'classic') {
    maxAllowedLimiterBoost = 3.5;
  } else if (detectedGenre === 'acoustic' || basePresetKey === 'acoustic') {
    maxAllowedLimiterBoost = 4.5;
  } else if (detectedGenre === 'jazz' || detectedGenre === 'ambient' || detectedGenre === 'podcast' ||
             basePresetKey === 'jazz' || basePresetKey === 'ambient' || basePresetKey === 'podcast') {
    maxAllowedLimiterBoost = 5.5;
  }

  // どんなに静かな音源でも上限+10.0dB（温和なジャンルでは個別の最大上限）、元の音が大きい音源でも最小+1.0dB（のり効果）の範囲で調整
  limiterBoost = Math.max(1.0, Math.min(maxAllowedLimiterBoost, Math.round(limiterBoost * 10) / 10));

  // GUI表示および音圧制御用のラウドネス目標キーの取得
  const loudnessKey = typeof baseLoudnessTarget !== 'undefined' ? baseLoudnessTarget : (document.getElementById('loudness-select')?.value || 'genre');

  // 3. プレ・クリッパー＆リミッター・オーケストレーション（Crest Factor & Loudness Target に基づく統合音圧制御）
  let suggestedClipperDrive = basePreset.clipperDrive !== undefined ? basePreset.clipperDrive : 1.5;
  
  if (crestFactorDb > 11.5) {
    // トランジェントのトゲ（ドラムピーク）が大きいダイナミックな楽曲:
    // リミッターのポンピング（不自然な息継ぎ歪み）を防ぐため、クリッパーで過渡ピークを自然に 2〜3dB トリミング
    const clipperAdaptation = Math.min(2.0, (crestFactorDb - 11.5) * 0.5);
    suggestedClipperDrive = Math.min(5.0, suggestedClipperDrive + clipperAdaptation);
  } else if (crestFactorDb < 8.5) {
    // 既に強く圧縮されている楽曲: 余計なサチュレーション歪みを避けるため、クリッパーのドライブを控えめに緩和
    const clipperReduction = Math.min(1.5, (8.5 - crestFactorDb) * 0.5);
    suggestedClipperDrive = Math.max(0.0, suggestedClipperDrive - clipperReduction);
  }
  
  // ラウドネス目標に応じたクリッパーの最適補正
  if (loudnessKey === 'club') {
    suggestedClipperDrive = Math.max(suggestedClipperDrive, 2.5);
  } else if (loudnessKey === 'loud') {
    suggestedClipperDrive = Math.max(suggestedClipperDrive, 3.5);
  } else if (loudnessKey === 'streaming') {
    suggestedClipperDrive = Math.min(suggestedClipperDrive, 1.5);
  } else if (loudnessKey === 'pure') {
    suggestedClipperDrive = 0.0;
  }
  suggestedClipperDrive = Math.round(suggestedClipperDrive * 10) / 10;

  // GUI表示用のラウドネス説明テキストの構築
  let baseLoudnessDesc = "STREAMING (-14 LUFS)";
  if (loudnessKey === 'genre') {
    const genreName = genreKey.toUpperCase();
    baseLoudnessDesc = `GENRE DEFAULT (${genreName})`;
  } else if (LOUDNESS_TARGETS[loudnessKey]) {
    const targetNames = {
      streaming: "STREAMING (-14 LUFS)",
      club: "CLUB/MODERN (-9 LUFS)",
      loud: "LOUD (-7 LUFS)",
      pure: "PURE (-18 LUFS)"
    };
    baseLoudnessDesc = targetNames[loudnessKey] || `TARGET (${loudnessKey})`;
  } else {
    baseLoudnessDesc = "CUSTOM";
  }
  
  const isElectronicGenre = (detectedGenre === 'edm' || detectedGenre === 'hardcore' || detectedGenre === 'metal' ||
                             genreKey === 'edm' || genreKey === 'hardcore' || genreKey === 'metal');
  
  // 先行計算した eqHighGainTemp を本採用します
  let eqHighGain = eqHighGainTemp;

  // サ行（シビランス）検知時の高域クランプを少し緩和（超高音の曇りを防ぐため、2.2dB〜2.6dBまで許容）
  if (sibilanceDynamicFreq > 0) {
    const sibilanceClampLimit = isElectronicGenre ? 2.6 : 2.2; // 2.2〜2.6dB までは高域ブーストを許容して抜けを確保
    eqHighGain = Math.min(sibilanceClampLimit, eqHighGain);
  }

  // ステレオ幅の補正 (位相相関に基づいた連続的スケーリング)
  let stereoWidth = basePreset.stereoWidth;
  let corrDesc = "Balanced";
  
  if (avgCorrelation > 0.82) {
    // 位相がほぼセンターに集まっている（モノラルに近い）-> 音源の広がり不足に応じて自動拡張
    const expansion = Math.min(0.25, (avgCorrelation - 0.82) * 1.5);
    stereoWidth = Math.min(1.4, basePreset.stereoWidth + expansion);
    corrDesc = "Mono-leaning (Expanded)";
  } else if (avgCorrelation < 0.72) {
    // ライブ音源やリバーブで既に左右に広がりすぎている -> コムフィルターや歪みを防ぐため、1.0（等倍）以下にクランプする
    const reduction = Math.min(0.2, (0.72 - avgCorrelation) * 0.8);
    stereoWidth = Math.max(0.85, Math.min(1.0, basePreset.stereoWidth - 0.2 - reduction));
    corrDesc = "Wide/Phasey (Clamped)";
  } else {
    corrDesc = "Balanced Stereo";
  }

  // サチュレーター微調整 (高域の量に応じて歪みの強さを補正)
  let satDrive = basePreset.satDrive;
  let satMix = basePreset.satMix;
  if (highDiffDb > 1.5) {
    // 元々高域がかなり明るい（またはうるさい）曲の場合、サチュレーションを抑えて金属的なキツさを防ぐ
    satDrive = Math.max(1, basePreset.satDrive - 5);
    satMix = Math.max(0, basePreset.satMix - 8);
  } else if (highDiffDb < -1.5) {
    // 高域がこもっている曲の場合、サチュレーターのブレンド率とドライブを少し上げて倍音を付加する
    satDrive = Math.min(100, basePreset.satDrive + 5);
    satMix = Math.min(100, basePreset.satMix + 5);
  }

  // High Shelf Frequency Dynamic Calculation
  const bin4k = Math.floor((4000 * fftSize) / sampleRate);
  const bin9k = Math.floor((9000 * fftSize) / sampleRate);
  const bin18k = Math.floor((18000 * fftSize) / sampleRate);

  let brillianceSum = 0;
  for (let j = bin4k; j <= bin9k; j++) brillianceSum += avgSpectrum[j];
  const brillianceEnergy = brillianceSum / (bin9k - bin4k + 1);

  let airSum = 0;
  for (let j = bin9k + 1; j <= bin18k; j++) airSum += avgSpectrum[j];
  const airEnergy = airSum / (bin18k - bin9k);

  const airToBrillianceRatio = airEnergy / (brillianceEnergy + 1e-6);

  // Calculate the high-frequency crossover frequency dynamically based on the treble roll-off slope (airToBrillianceRatio)
  // ボーカルのサ行や高域のきつい金属音（6kHz〜9kHz）をブーストするのを防ぐため、クロスオーバー下限周波数を10,500Hzに引き上げ（10.5kHz〜14kHzのエアバンド域のみを処理）
  const normalizedRatio = Math.max(0.08, Math.min(0.38, airToBrillianceRatio));
  let suggestedEqHighFreq = 10500 + ((normalizedRatio - 0.08) / 0.30) * 3500;
  if (sibilanceDynamicFreq > 0) {
    const deesserUpperLimit = Math.min(16000, Math.max(9500, sibilanceDynamicFreq + 1500));
    suggestedEqHighFreq = Math.max(suggestedEqHighFreq, deesserUpperLimit + 500);
  }
  suggestedEqHighFreq = Math.round(suggestedEqHighFreq / 100) * 100;
  suggestedEqHighFreq = Math.max(10000, Math.min(15000, suggestedEqHighFreq));

  // 4. Stereo Bass phase cancellation safeguard (ビビリ音・歪み防止)
  let finalEqLowGain = eqLowGain;
  let finalLimiterBoost = limiterBoost;
  let finalSideHPF = basePreset.sideHighPassFreq || 110;
  
  if (avgCorrelation < 0.72) {
    // 左右の位相ズレが大きい（広いL/R Bass / 深いリバーブ等）場合、
    // モノラル加算時の相関キャンセリングによるAI過剰EQブーストと、L/R個別ピークのソフトクリッパー限界突破（ビビリ音）を防ぐための補正
    
    // 1. 低域EQブーストを厳格に制限（位相ズレがある場合は低域ブースト上限を最大+1.0dB、深刻な場合は+0.0dBに固定）
    const maxLowBoost = avgCorrelation < 0.60 ? 0.0 : 1.0;
    finalEqLowGain = Math.min(maxLowBoost, finalEqLowGain);
    
    // 2. マキシマイザーの押し込み量（Limiter Boost）に位相相関ペナルティを適用
    const phasePenalty = (0.75 - avgCorrelation) * 4.0; // ズレが大きいほどマキシマイザーを緩和（最大2.0dB以上引き下げ）
    finalLimiterBoost = Math.max(1.5, finalLimiterBoost - phasePenalty);
    
    // 3. Sideチャンネルのハイパス周波数を引き上げ（低域をセンターモノラルに集約し、L/R独立クリップを根本防止）
    finalSideHPF = Math.max(160, finalSideHPF);
  }
  
  finalLimiterBoost = Math.round(finalLimiterBoost * 10) / 10;

  let suggestedDeesserAmount = 0; // デフォルトは 0 (無効)
  let deesserStartFreq = 6500;
  let deesserEndFreq = 8500;

  if (sibilanceDynamicFreq > 0 && rawSibilancePeaks.length > 0) {
    const maxScore = rawSibilancePeaks[0].score; // e.g. 1.18 to 1.60
    const prominenceDb = 20 * Math.log10(maxScore); // e.g. 1.5dB to 4.0dB
    // 音響工学的リダクション量計算: 突出エネルギーに応じて 20%〜60% (-3.0dB〜-9.0dBの動的減衰) を算出
    suggestedDeesserAmount = Math.round(Math.max(20, Math.min(60, 20 + (prominenceDb - 1.5) * 16.0)));

    // 検出されたシビランス周波数を中心に、Start/Endを帯域幅約 1,800Hz で最適アライメント
    deesserStartFreq = Math.max(4000, Math.round((sibilanceDynamicFreq - 900) / 50) * 50);
    deesserEndFreq = Math.min(10500, Math.max(deesserStartFreq + 500, Math.round((sibilanceDynamicFreq + 900) / 50) * 50));
  }

  // アカデミック物理計算に基づくノイズクリーナー最終適用値（固定キャップ・経験則を全廃）
  const finalHissAmount = sugHissAmount;
  const finalDeesserAmount = suggestedDeesserAmount;

  // AI Dynamic Q-value calculation based on the correction gains
  let finalEqLowQ = basePreset.eqLowQ || 0.70;
  const absLowGain = Math.abs(finalEqLowGain);
  if (absLowGain > 2.0) {
    // Narrow the Q slightly for deep boosts/cuts to avoid bloating adjacent low-mids (up to 0.85)
    finalEqLowQ = Math.min(0.85, 0.70 + (absLowGain - 2.0) * 0.05);
  } else if (absLowGain < 1.0) {
    // Widen the Q for transparent minor corrections (down to 0.55)
    finalEqLowQ = Math.max(0.55, 0.70 - (1.0 - absLowGain) * 0.15);
  }
  finalEqLowQ = Math.round(finalEqLowQ * 100) / 100;

  let finalEqHighQ = basePreset.eqHighQ || 0.70;
  const absHighGain = Math.abs(eqHighGain);
  if (absHighGain > 1.2) {
    // Narrow the Q slightly for deep boosts/cuts to protect critical vocal presence frequencies (up to 0.80)
    finalEqHighQ = Math.min(0.80, 0.70 + (absHighGain - 1.2) * 0.05);
  } else if (absHighGain < 0.6) {
    // Widen the Q for broad, airy high-end shine (down to 0.55)
    finalEqHighQ = Math.max(0.55, 0.70 - (0.6 - absHighGain) * 0.25);
  }
  finalEqHighQ = Math.round(finalEqHighQ * 100) / 100;

  return {
    detected: filteredPeaks.length > 0,
    notches: filteredPeaks,
    crestFactor: crestFactorDb,
    crestDesc: crestDesc,
    correlation: avgCorrelation,
    correlationDesc: corrDesc,
    bassDiff: lowDiffDb,
    trebleDiff: highDiffDb,
    rumbleNoiseFloorDb: rumbleNoiseFloorDb,
    hissNoiseFloorDb: hissNoiseFloorDb,
    baseLoudnessDesc: baseLoudnessDesc,
    detectedGenre: detectedGenre,
    suggestedParams: {
      inputGainDb: Math.round(suggestedInputGainDb * 10) / 10,
      satEnabled: basePreset.satEnabled,
      satType: basePreset.satType,
      satDrive: satDrive,
      satMix: satMix,
      satLpfFreq: basePreset.satLpfFreq || 4500,
      eqLowGain: finalEqLowGain,
      eqLowFreq: suggestedEqLowFreq,
      eqLowQ: finalEqLowQ,
      eqLowMidGain: eqLowMidGain,
      eqLowMidFreq: suggestedEqLowMidFreq,
      eqLowMidQ: basePreset.eqLowMidQ || 0.60,
      eqMidGain: eqMidGain,
      eqMidFreq: suggestedEqMidFreq,
      eqMidQ: basePreset.eqMidQ || 1.0,
      eqMidHighGain: eqMidHighGain,
      eqMidHighFreq: suggestedEqMidHighFreq,
      eqMidHighQ: basePreset.eqMidHighQ || 1.0,
      eqHighGain: eqHighGain,
      eqHighFreq: suggestedEqHighFreq,
      eqHighQ: finalEqHighQ,
      compEnabled: basePreset.compEnabled,
      compThreshold: compThreshold,
      compRatio: compRatio,
      compAttack: basePreset.compAttack,
      compRelease: basePreset.compRelease,
      stereoWidth: stereoWidth,
      sideHighPassFreq: finalSideHPF,
      clipperDrive: suggestedClipperDrive,
      limiterBoost: finalLimiterBoost,
      rumbleCutEnabled: sugRumbleCut,
      hissReductionAmount: finalHissAmount,
      hissReductionMaxCut: -16.0,
      hissReductionFreq: 9000,
      sibilanceDynamicFreq: sibilanceDynamicFreq,
      deesserAmount: finalDeesserAmount,
      deesserFreq: deesserStartFreq,
      deesserMaxFreq: deesserEndFreq
    },
    // 中間解析値のデバッグ用出力
    crestFactorDb: crestFactorDb,
    actualLowMidRatio: actualLowMidRatio,
    actualHighMidRatio: actualHighMidRatio,
    actualPresenceRatio: actualPresenceRatio,
    avgCorrelation: avgCorrelation
  };
}

export class AetherEnhancer {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.isBypassed = false;

    // Create bypass crossfade nodes
    this.inputNode = this.ctx.createGain();
    this.outputNode = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    // Setup bypass routing
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    // Initial state: Enhancer active (dry=0, wet=1)
    this.dryGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.wetGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Build the Enhancer Chain
    this._buildChain();
  }

  _buildChain() {
    const context = this.ctx;

    // 1. Input Gain node
    this.inputGainNode = context.createGain();
    this.inputGainNode.gain.setValueAtTime(1.0, context.currentTime);

    // 2. Rumble Filter (HPF)
    this.rumbleFilter = context.createBiquadFilter();
    this.rumbleFilter.type = 'highpass';
    this.rumbleFilter.frequency.setValueAtTime(18.0, context.currentTime);
    this.rumbleFilter.Q.setValueAtTime(0.707, context.currentTime);

    // 3. Dynamic Hiss Filter (VCF High Shelf - Lower bound)
    this.hissFilter = context.createBiquadFilter();
    this.hissFilter.type = 'highshelf';
    this.hissFilter.frequency.setValueAtTime(9000.0, context.currentTime);
    this.hissFilter.Q.setValueAtTime(0.707, context.currentTime);

    // 3b. Hiss Air Filter (VCF High Shelf - Upper bound to preserve air band)
    this.hissAirFilter = context.createBiquadFilter();
    this.hissAirFilter.type = 'highshelf';
    this.hissAirFilter.frequency.setValueAtTime(16000.0, context.currentTime);
    this.hissAirFilter.Q.setValueAtTime(0.707, context.currentTime);

    // 3c. Sidechain Envelope Follower for Hiss Filter
    this.sidechainHpf = context.createBiquadFilter();
    this.sidechainHpf.type = 'highpass';
    this.sidechainHpf.frequency.setValueAtTime(6000.0, context.currentTime);
    this.sidechainHpf.Q.setValueAtTime(0.707, context.currentTime);

    this.sidechainGainNode = context.createGain();
    this.sidechainGainNode.gain.setValueAtTime(10.0, context.currentTime);

    this.rectifier = context.createWaveShaper();
    this.rectifier.curve = this._generateAbsoluteValCurve();

    this.envelopeSmoother = context.createBiquadFilter();
    this.envelopeSmoother.type = 'lowpass';
    this.envelopeSmoother.frequency.setValueAtTime(2.0, context.currentTime);
    this.envelopeSmoother.Q.setValueAtTime(0.707, context.currentTime);

    this.hissEnvelopeGain = context.createGain();
    this.hissEnvelopeGain.gain.setValueAtTime(0.0, context.currentTime);

    this.hissAirEnvelopeGain = context.createGain();
    this.hissAirEnvelopeGain.gain.setValueAtTime(0.0, context.currentTime);

    // Hiss sidechain connections
    this.rumbleFilter.connect(this.sidechainHpf);
    this.sidechainHpf.connect(this.sidechainGainNode);
    this.sidechainGainNode.connect(this.rectifier);
    this.rectifier.connect(this.envelopeSmoother);
    this.envelopeSmoother.connect(this.hissEnvelopeGain);
    this.envelopeSmoother.connect(this.hissAirEnvelopeGain);

    this.hissEnvelopeGain.connect(this.hissFilter.gain);
    this.hissAirEnvelopeGain.connect(this.hissAirFilter.gain);

    // 4. Parallel Saturator Stage (Audiophile Grade with sub-bass HPF)
    this.satDryGain = context.createGain();
    this.satWetGain = context.createGain();
    this.waveShaper = context.createWaveShaper();
    this.satSumNode = context.createGain();

    this.satHpf = context.createBiquadFilter();
    this.satHpf.type = 'highpass';
    this.satHpf.frequency.setValueAtTime(220.0, context.currentTime);
    this.satHpf.Q.setValueAtTime(0.707, context.currentTime);

    this.satLpf = context.createBiquadFilter();
    this.satLpf.type = 'lowpass';
    this.satLpf.frequency.setValueAtTime(12000.0, context.currentTime);
    this.satLpf.Q.setValueAtTime(0.5, context.currentTime);

    // Hook up saturator path
    this.inputGainNode.connect(this.rumbleFilter);
    this.rumbleFilter.connect(this.hissFilter);
    this.hissFilter.connect(this.hissAirFilter);

    this.hissAirFilter.connect(this.satDryGain);
    this.hissAirFilter.connect(this.satHpf);
    this.satHpf.connect(this.waveShaper);
    this.waveShaper.connect(this.satLpf);
    this.satLpf.connect(this.satWetGain);

    this.satDryGain.connect(this.satSumNode);
    this.satWetGain.connect(this.satSumNode);

    // 5. 5-band EQ + kick Peaking + air Shelf
    this.eqLow = context.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.setValueAtTime(90.0, context.currentTime);
    this.eqLow.gain.setValueAtTime(0.0, context.currentTime);
    this.eqLow.Q.setValueAtTime(0.55, context.currentTime);

    this.eqLowMid = context.createBiquadFilter();
    this.eqLowMid.type = 'peaking';
    this.eqLowMid.frequency.setValueAtTime(200.0, context.currentTime);
    this.eqLowMid.gain.setValueAtTime(0.0, context.currentTime);
    this.eqLowMid.Q.setValueAtTime(0.55, context.currentTime);

    this.kickPeaking = context.createBiquadFilter();
    this.kickPeaking.type = 'peaking';
    this.kickPeaking.Q.setValueAtTime(2.0, context.currentTime);
    this.kickPeaking.frequency.setValueAtTime(55, context.currentTime);
    this.kickPeaking.gain.setValueAtTime(0.0, context.currentTime);

    this.eqMid = context.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.setValueAtTime(1000.0, context.currentTime);
    this.eqMid.gain.setValueAtTime(0.0, context.currentTime);
    this.eqMid.Q.setValueAtTime(0.70, context.currentTime);

    this.eqMidHigh = context.createBiquadFilter();
    this.eqMidHigh.type = 'peaking';
    this.eqMidHigh.frequency.setValueAtTime(4500.0, context.currentTime);
    this.eqMidHigh.gain.setValueAtTime(0.0, context.currentTime);
    this.eqMidHigh.Q.setValueAtTime(0.70, context.currentTime);

    this.eqHigh = context.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.setValueAtTime(9000.0, context.currentTime);
    this.eqHigh.gain.setValueAtTime(-0.3, context.currentTime);
    this.eqHigh.Q.setValueAtTime(0.50, context.currentTime);

    this.airShelf = context.createBiquadFilter();
    this.airShelf.type = 'highshelf';
    this.airShelf.frequency.setValueAtTime(15000.0, context.currentTime);
    this.airShelf.gain.setValueAtTime(0.0, context.currentTime);
    this.airShelf.Q.setValueAtTime(0.707, context.currentTime);

    this.sibilanceNotch = context.createBiquadFilter();
    this.sibilanceNotch.type = 'peaking';
    this.sibilanceNotch.frequency.setValueAtTime(7500.0, context.currentTime);
    this.sibilanceNotch.Q.setValueAtTime(2.2, context.currentTime);
    this.sibilanceNotch.gain.setValueAtTime(0.0, context.currentTime);

    this.sibilanceNotchDynamicGain = context.createGain();
    this.sibilanceNotchDynamicGain.gain.setValueAtTime(0.0, context.currentTime);
    this.sibilanceNotchDynamicGain.connect(this.sibilanceNotch.gain);

    // 8-band corrective notches
    for (let i = 0; i < 8; i++) {
      this[`eqCorrective${i+1}`] = context.createBiquadFilter();
      this[`eqCorrective${i+1}`].type = 'peaking';
      this[`eqCorrective${i+1}`].frequency.setValueAtTime(1000.0, context.currentTime);
      this[`eqCorrective${i+1}`].Q.setValueAtTime(15.0, context.currentTime);
      this[`eqCorrective${i+1}`].gain.setValueAtTime(0.0, context.currentTime);
    }

    // Connect EQ chain
    this.satSumNode.connect(this.eqLow);
    this.eqLow.connect(this.eqLowMid);
    this.eqLowMid.connect(this.kickPeaking);
    this.kickPeaking.connect(this.eqMid);
    this.eqMid.connect(this.eqMidHigh);
    this.eqMidHigh.connect(this.eqHigh);
    this.eqHigh.connect(this.airShelf);
    this.airShelf.connect(this.sibilanceNotch);

    this.sibilanceNotch.connect(this.eqCorrective1);
    this.eqCorrective1.connect(this.eqCorrective2);
    this.eqCorrective2.connect(this.eqCorrective3);
    this.eqCorrective3.connect(this.eqCorrective4);
    this.eqCorrective4.connect(this.eqCorrective5);
    this.eqCorrective5.connect(this.eqCorrective6);
    this.eqCorrective6.connect(this.eqCorrective7);
    this.eqCorrective7.connect(this.eqCorrective8);

    // 6. Glue Compressor
    this.compressor = context.createDynamicsCompressor();
    this.compressor.knee.setValueAtTime(18.0, context.currentTime);
    this.compressor.threshold.setValueAtTime(-8.0, context.currentTime);
    this.compressor.ratio.setValueAtTime(1.35, context.currentTime);
    this.compressor.attack.setValueAtTime(0.04, context.currentTime);
    this.compressor.release.setValueAtTime(0.20, context.currentTime);

    this.eqCorrective8.connect(this.compressor);

    // 7. Stereo Splitter/Imager (M/S Matrix)
    this.splitter = context.createChannelSplitter(2);
    this.midSum = context.createGain();
    this.sideDiff = context.createGain();

    this.leftToMid = context.createGain(); this.leftToMid.gain.setValueAtTime(0.5, context.currentTime);
    this.rightToMid = context.createGain(); this.rightToMid.gain.setValueAtTime(0.5, context.currentTime);
    this.leftToSide = context.createGain(); this.leftToSide.gain.setValueAtTime(0.5, context.currentTime);
    this.rightToSide = context.createGain(); this.rightToSide.gain.setValueAtTime(-0.5, context.currentTime);

    this.compressor.connect(this.splitter);

    this.splitter.connect(this.leftToMid, 0);
    this.splitter.connect(this.rightToMid, 1);
    this.leftToMid.connect(this.midSum);
    this.rightToMid.connect(this.midSum);

    this.splitter.connect(this.leftToSide, 0);
    this.splitter.connect(this.rightToSide, 1);
    this.leftToSide.connect(this.sideDiff);
    this.rightToSide.connect(this.sideDiff);

    this.midGain = context.createGain();
    this.sideGain = context.createGain();

    this.sideHighPass = context.createBiquadFilter();
    this.sideHighPass.type = 'highpass';
    this.sideHighPass.frequency.setValueAtTime(110.0, context.currentTime);
    this.sideHighPass.Q.setValueAtTime(0.707, context.currentTime);

    this.midGain.gain.setValueAtTime(1.0, context.currentTime);
    this.sideGain.gain.setValueAtTime(1.15, context.currentTime);

    this.midSum.connect(this.midGain);
    this.sideDiff.connect(this.sideHighPass);
    this.sideHighPass.connect(this.sideGain);

    this.leftSum = context.createGain();
    this.rightDiff = context.createGain();
    this.sideInverter = context.createGain();
    this.sideInverter.gain.setValueAtTime(-1.0, context.currentTime);

    this.midGain.connect(this.leftSum);
    this.sideGain.connect(this.leftSum);

    this.midGain.connect(this.rightDiff);
    this.sideGain.connect(this.sideInverter);
    this.sideInverter.connect(this.rightDiff);

    this.merger = context.createChannelMerger(2);
    this.leftSum.connect(this.merger, 0, 0);
    this.rightDiff.connect(this.merger, 0, 1);

    // 8. Pre-Limiter Mastering Soft Clipper (NEW in v6.0.0)
    this.preClipper = context.createWaveShaper();
    this.preClipper.curve = generateMasteringClipCurve(1.5);
    this.preClipper.oversample = '2x';

    // 9. Maximizer Gain Stage (Loudness Boost to Target)
    this.limiterGain = context.createGain();
    this.limiterGain.gain.setValueAtTime(Math.pow(10, 3.5 / 20.0), context.currentTime);

    // M/S Merger -> Pre-Clipper -> Maximizer Boost -> Limiter
    this.merger.connect(this.preClipper);
    this.preClipper.connect(this.limiterGain);

    // 10. Brickwall Limiter (DynamicsCompressorNode)
    this.limiter = context.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1.0, context.currentTime);
    this.limiter.ratio.setValueAtTime(20.0, context.currentTime);
    this.limiter.attack.setValueAtTime(0.0015, context.currentTime);
    this.limiter.release.setValueAtTime(0.12, context.currentTime);
    this.limiter.knee.setValueAtTime(4.0, context.currentTime);

    this.limiterGain.connect(this.limiter);

    // 11. Safety Soft Clipper (Hermite Curve WaveShaper)
    this.safetyClipper = context.createWaveShaper();
    this.safetyClipper.curve = generateSoftClipCurve();
    this.safetyClipper.oversample = '2x';

    this.limiter.connect(this.safetyClipper);

    // 12. Ceiling Gain Node (-1.0dBFS true peak margin)
    this.ceilingGain = context.createGain();
    this.ceilingGain.gain.setValueAtTime(Math.pow(10, -1.0 / 20), context.currentTime);

    this.safetyClipper.connect(this.ceilingGain);

    // Connect mastering chain to bypass crossfade structure
    this.inputNode.connect(this.inputGainNode);
    this.ceilingGain.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);
  }

  setMasteringParams(params, notches, hissAmount = 0) {
    if (!params) return;
    const t = this.ctx.currentTime;

    // 1. Input Gain Stage
    if (params.inputGainDb !== undefined) {
      this.inputGainNode.gain.setTargetAtTime(Math.pow(10, params.inputGainDb / 20.0), t, 0.05);
    }

    // 2. Rumble Filter
    const rumbleCut = params.rumbleCutEnabled !== undefined ? params.rumbleCutEnabled : false;
    this.rumbleFilter.frequency.setTargetAtTime(rumbleCut ? 90.0 : 18.0, t, 0.05);

    // 3. Dynamic Hiss Cleaner
    const amount = (params.hissReductionAmount !== undefined ? params.hissReductionAmount : hissAmount) / 100.0;
    const baseGain = (params.hissReductionMaxCut !== undefined ? params.hissReductionMaxCut : -16.0) * amount;
    this.hissFilter.gain.setTargetAtTime(baseGain, t, 0.05);
    this.hissAirFilter.gain.setTargetAtTime(-baseGain, t, 0.05);
    this.hissFilter.frequency.setTargetAtTime(params.hissReductionFreq || 9000.0, t, 0.05);
    this.hissAirFilter.frequency.setTargetAtTime(params.hissReductionMaxFreq || 16000.0, t, 0.05);

    const maxEnvGain = -baseGain;
    this.hissEnvelopeGain.gain.setTargetAtTime(maxEnvGain, t, 0.05);
    this.hissAirEnvelopeGain.gain.setTargetAtTime(-maxEnvGain, t, 0.05);

    // 4. Parallel Saturation (Audiophile Tube / Tape / Hardcore with 220Hz HPF)
    const blend = params.satEnabled ? (params.satMix / 100.0) : 0.0;
    this.satDryGain.gain.setTargetAtTime(1.0 - blend, t, 0.05);
    this.satWetGain.gain.setTargetAtTime(blend, t, 0.05);
    this.waveShaper.curve = generateSaturatorCurve(params.satType || 'tube', params.satDrive || 12);
    this.satLpf.frequency.setTargetAtTime(params.satLpfFreq || 12000.0, t, 0.05);

    // 5. 5-band EQ + kick Peaking + air Shelf (Academic Reference: eqMidHigh is neutral flat 0.0dB)
    this.eqLow.frequency.setTargetAtTime(params.eqLowFreq || 90.0, t, 0.05);
    this.eqLow.gain.setTargetAtTime(params.eqLowGain !== undefined ? params.eqLowGain : 0.0, t, 0.05);
    this.eqLow.Q.setTargetAtTime(params.eqLowQ || 0.55, t, 0.05);

    this.eqLowMid.frequency.setTargetAtTime(params.eqLowMidFreq || 200.0, t, 0.05);
    this.eqLowMid.gain.setTargetAtTime(params.eqLowMidGain !== undefined ? params.eqLowMidGain : 0.0, t, 0.05);
    this.eqLowMid.Q.setTargetAtTime(params.eqLowMidQ || 0.55, t, 0.05);

    this.kickPeaking.gain.setTargetAtTime(params.kickPeakingGain || 0.0, t, 0.05);

    this.eqMid.frequency.setTargetAtTime(params.eqMidFreq || 1000.0, t, 0.05);
    this.eqMid.gain.setTargetAtTime(params.eqMidGain !== undefined ? params.eqMidGain : 0.0, t, 0.05);
    this.eqMid.Q.setTargetAtTime(params.eqMidQ || 0.70, t, 0.05);

    this.eqMidHigh.frequency.setTargetAtTime(params.eqMidHighFreq || 4500.0, t, 0.05);
    this.eqMidHigh.gain.setTargetAtTime(params.eqMidHighGain !== undefined ? params.eqMidHighGain : 0.0, t, 0.05);
    this.eqMidHigh.Q.setTargetAtTime(params.eqMidHighQ || 0.70, t, 0.05);

    this.eqHigh.frequency.setTargetAtTime(params.eqHighFreq || 9000.0, t, 0.05);
    this.eqHigh.gain.setTargetAtTime(params.eqHighGain !== undefined ? params.eqHighGain : -0.3, t, 0.05);
    this.eqHigh.Q.setTargetAtTime(params.eqHighQ || 0.50, t, 0.05);

    if (this.airShelf) {
      this.airShelf.gain.setTargetAtTime(params.airShelfGain || 0.0, t, 0.05);
    }

    // De-esser Dynamic Notch
    if (this.sibilanceNotch && this.sibilanceNotchDynamicGain) {
      const deesserAmt = params.deesserAmount || 0;
      const deesserMax = params.deesserMaxCut !== undefined ? params.deesserMaxCut : -15.0;
      const dynamicCut = deesserMax * (deesserAmt / 100.0);

      const fStart = params.deesserFreq || params.sibilanceDynamicFreq || 7500;
      const fEnd = params.deesserMaxFreq || 9500;
      const fEndValid = fEnd > fStart ? fEnd : fStart + 1000;
      const deesserCenterFreq = Math.sqrt(fStart * fEndValid);
      const deesserQ = deesserCenterFreq / (fEndValid - fStart);

      this.sibilanceNotch.frequency.setTargetAtTime(deesserCenterFreq, t, 0.05);
      this.sibilanceNotch.Q.setTargetAtTime(deesserQ, t, 0.05);
      this.sibilanceNotchDynamicGain.gain.setTargetAtTime(dynamicCut, t, 0.05);
    }

    // 6. Corrective Notch Filters
    this.setCorrectiveNotches(notches, hissAmount);

    // 7. Glue Compressor
    if (params.compEnabled) {
      this.compressor.threshold.setTargetAtTime(params.compThreshold !== undefined ? params.compThreshold : -8.0, t, 0.05);
      this.compressor.ratio.setTargetAtTime(params.compRatio !== undefined ? params.compRatio : 1.35, t, 0.05);
      if (params.compAttack) this.compressor.attack.setTargetAtTime(params.compAttack, t, 0.05);
      if (params.compRelease) this.compressor.release.setTargetAtTime(params.compRelease, t, 0.05);
    } else {
      this.compressor.threshold.setTargetAtTime(0.0, t, 0.05);
      this.compressor.ratio.setTargetAtTime(1.0, t, 0.05);
    }

    // 8. Stereo Width
    this.sideGain.gain.setTargetAtTime(params.stereoWidth !== undefined ? params.stereoWidth : 1.15, t, 0.05);
    if (params.sideHighPassFreq) {
      this.sideHighPass.frequency.setTargetAtTime(params.sideHighPassFreq, t, 0.05);
    }

    // 9. Pre-Limiter Mastering Soft Clipper (NEW in v6.0.0)
    const clipperDrive = params.clipperDrive !== undefined ? params.clipperDrive : 1.5;
    if (this.preClipper) {
      this.preClipper.curve = generateMasteringClipCurve(clipperDrive);
    }

    // 10. Maximizer Gain Stage
    const boostDb = params.limiterBoost !== undefined ? params.limiterBoost : 3.5;
    const linearBoost = Math.pow(10, boostDb / 20.0);
    this.limiterGain.gain.setTargetAtTime(linearBoost, t, 0.05);

    // 11. Brickwall Limiter Dynamic Time Constants
    if (this.limiter) {
      const isGentle = (params.compRelease >= 0.22 && params.compAttack >= 0.04) || (params.limiterBoost <= 2.5);
      const targetAttack = isGentle ? 0.005 : 0.001;
      const targetRelease = isGentle ? 0.25 : 0.12;
      const targetKnee = isGentle ? 12.0 : 4.0;

      this.limiter.attack.setTargetAtTime(targetAttack, t, 0.02);
      this.limiter.release.setTargetAtTime(targetRelease, t, 0.02);
      this.limiter.knee.setTargetAtTime(targetKnee, t, 0.02);
    }
  }

  setCorrectiveNotches(notches, hissAmount = 0) {
    const t = this.ctx.currentTime;
    const setupHissFactor = 1.0;

    for (let i = 0; i < 8; i++) {
      const filter = this[`eqCorrective${i+1}`];
      if (notches && notches[i]) {
        filter.frequency.setTargetAtTime(notches[i].freq, t, 0.05);
        filter.gain.setTargetAtTime(notches[i].cut * setupHissFactor, t, 0.05);
        filter.Q.setTargetAtTime(notches[i].q || 15.0, t, 0.05);
      } else {
        filter.gain.setTargetAtTime(0.0, t, 0.05);
      }
    }
  }

  setBypass(active) {
    const t = this.ctx.currentTime;
    this.isBypassed = active;
    if (active) {
      this.dryGain.gain.setTargetAtTime(1.0, t, 0.08);
      this.wetGain.gain.setTargetAtTime(0.0, t, 0.08);
    } else {
      this.dryGain.gain.setTargetAtTime(0.0, t, 0.08);
      this.wetGain.gain.setTargetAtTime(1.0, t, 0.08);
    }
  }

  _generateAbsoluteValCurve() {
    const n_samples = 1024;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / (n_samples - 1) - 1;
      curve[i] = Math.abs(x);
    }
    return curve;
  }
}