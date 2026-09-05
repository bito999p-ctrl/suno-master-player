/**
 * AetherPlayer - Complete Clean Rebuilt Frontend Controller
 * Version: 4.2.2
 */

import { AetherEnhancer, analyzeAudioResonances, GENRE_PRESETS } from './audio-engine.js?v=4.2.2';

// Global Icon Render Helper (Ultra-Thin 1.25px)
window.renderLucideIcons = function() {
  if (typeof window !== 'undefined' && window.lucide) {
    window.lucide.createIcons({
      attrs: {
        'stroke-width': 1.25
      }
    });
  }
};

// ============================================================================
// State Management
// ============================================================================
let audioCtx = null;
let enhancer = null;
let sourceNode = null;
let masterGainNode = null;

let tracks = [];
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'all'; // 'all', 'one', 'none'
let currentSource = { type: null, url: '', name: '', cover: '' };
let userProfileData = null;

// Audio Analysis Cache & State
const analysisCache = new Map();
let isAnalyzingCurrentTrack = false;
let activeAbortController = null;
let currentAudioBuffer = null;
let currentAnalysisResult = null;
let isUserDraggingProgress = false;
let isEnhancerEnabled = false;
let currentPreset = 'auto';

// ============================================================================
// DOM Element References
// ============================================================================
const landingScreen = document.getElementById('landing-screen');
const playerWorkspace = document.getElementById('player-workspace');
const landingInput = document.getElementById('landing-input');
const landingBtn = document.getElementById('landing-btn');
const landingBtnText = document.getElementById('landing-btn-text');
const landingBtnLoader = document.getElementById('landing-btn-loader');
const backToLandingBtn = document.getElementById('back-to-landing-btn');
const headerLogoBtn = document.getElementById('header-logo-btn');
const shareBtn = document.getElementById('share-btn');
const audioPlayer = document.getElementById('audio-player');

// History & Dropdown
const historyToggleBtn = document.getElementById('history-toggle-btn');
const headerHistoryDropdown = document.getElementById('header-history-dropdown');
const dropTabHistory = document.getElementById('drop-tab-history');
const dropTabFavorites = document.getElementById('drop-tab-favorites');
const dropContentHistory = document.getElementById('drop-content-history');
const dropContentFavorites = document.getElementById('drop-content-favorites');
const landingTabHistoryBtn = document.getElementById('landing-tab-history-btn');
const landingTabFavoritesBtn = document.getElementById('landing-tab-favorites-btn');
const historyContainer = document.getElementById('history-container');
const favoritesContainer = document.getElementById('favorites-container');

// Sidebar Info
const sidebarBackBtn = document.getElementById('sidebar-back-btn');
const sidebarToPlayerBtn = document.getElementById('sidebar-to-player-btn');
const sourceCover = document.getElementById('source-cover');
const sourceName = document.getElementById('source-name');
const sourceType = document.getElementById('source-type');
const sourceLikeBtn = document.getElementById('source-like-btn');
const playlistsSection = document.getElementById('playlists-section');
const playlistsList = document.getElementById('playlists-list');
const tracksCountEl = document.getElementById('tracks-count');
const tracksList = document.getElementById('tracks-list');

// Player Center
const trackArtwork = document.getElementById('track-artwork');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const likeBtn = document.getElementById('like-btn');
const sunoLink = document.getElementById('suno-link');
const aiAnalyzingIndicator = document.getElementById('ai-analyzing-indicator');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const volumeSlider = document.getElementById('volume-slider');
const presetSelect = document.getElementById('preset-select');
const mobilePresetSelect = document.getElementById('mobile-preset-select');
const enhancerToggle = document.getElementById('enhancer-toggle');
const mobileEnhancerToggle = document.getElementById('mobile-enhancer-toggle');

// Sheets & Overlays
const openLyricsBtn = document.getElementById('open-lyrics-btn');
const closeLyricsBtn = document.getElementById('close-lyrics-btn');
const playerLyricsOverlay = document.getElementById('player-lyrics-overlay');
const mobileLyricsText = document.getElementById('mobile-lyrics-text');
const openPlaylistBtn = document.getElementById('open-playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');
const playerPlaylistOverlay = document.getElementById('player-playlist-overlay');
const mobileOverlayTracksList = document.getElementById('mobile-overlay-tracks-list');
const overlayTracksCount = document.getElementById('overlay-tracks-count');
const closePlayerBtn = document.getElementById('close-player-btn');

// Utility Section
const tabEnhancerBtn = document.getElementById('tab-enhancer-btn');
const tabLyricsBtn = document.getElementById('tab-lyrics-btn');
const tabEnhancer = document.getElementById('tab-enhancer');
const tabLyrics = document.getElementById('tab-lyrics');
const lyricsText = document.getElementById('lyrics-text');

// AI HUD Telemetry
const aiStatusEl = document.getElementById('ai-status');
const hudDynamicsDesc = document.getElementById('hud-dynamics-desc');
const hudStereoDesc = document.getElementById('hud-stereo-desc');
const hudGenreDesc = document.getElementById('hud-genre-desc');
const hudEqLow = document.getElementById('hud-eq-low');
const hudEqHigh = document.getElementById('hud-eq-high');
const hudWidth = document.getElementById('hud-width');
const hudHiss = document.getElementById('hud-hiss');
const hudCompThresh = document.getElementById('hud-comp-thresh');
const hudCompRatio = document.getElementById('hud-comp-ratio');
const hudLimiterBoost = document.getElementById('hud-limiter-boost');
const hudSatDrive = document.getElementById('hud-sat-drive');
const hudDeesser = document.getElementById('hud-deesser');
const hudRumble = document.getElementById('hud-rumble');

// Mobile Workspace & Mini-Player
const workspaceSidebar = document.querySelector('.workspace-sidebar');
const workspacePlayer = document.querySelector('.workspace-player');
const workspaceUtility = document.querySelector('.workspace-utility');
const miniPlayer = document.getElementById('mini-player');
const miniProgressFill = document.getElementById('mini-progress-fill');
const miniArtwork = document.getElementById('mini-artwork');
const miniTitle = document.getElementById('mini-title');
const miniArtist = document.getElementById('mini-artist');
const miniLikeBtn = document.getElementById('mini-like-btn');
const miniPlayBtn = document.getElementById('mini-play-btn');
const miniPlayIcon = document.getElementById('mini-play-icon');
const miniNextBtn = document.getElementById('mini-next-btn');
const mobileNavBar = document.getElementById('mobile-nav-bar');
const navBtnLibrary = document.getElementById('nav-btn-library');
const navBtnPlayer = document.getElementById('nav-btn-player');
const navBtnUtility = document.getElementById('nav-btn-utility');

// ============================================================================
// Utilities & Helpers
// ============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getNormalizedArtist(name) {
  if (!name) return (currentSource && currentSource.name) || 'Suno Artist';
  const lower = name.trim().toLowerCase();
  const INVALID = ['studio', 'studio plan', 'upload', 'custom', 'v1', 'v2', 'v3', 'v3.5', 'v4', 'v4.0', 'chirp', 'suno', 'suno ai', 'ai', 'undefined', 'null', 'unknown'];
  if (INVALID.includes(lower) || lower.startsWith('v3.') || lower.startsWith('v4.') || /^[uv][0-9]/i.test(lower)) {
    return (currentSource && currentSource.name && currentSource.name !== 'Suno Catalog' && currentSource.name !== 'Suno Playlist' ? currentSource.name : 'Bito');
  }
  if (lower.includes('bito999') || lower === 'bito') {
    return 'Bito';
  }
  return name;
}

function canonicalizeSunoUrl(val) {
  if (!val || typeof val !== 'string') return '';
  let str = val.trim();
  if (str.startsWith('@')) return `https://suno.com/${str}`;
  if (/^[a-f0-9\-]{36}$/i.test(str)) return `https://suno.com/playlist/${str}`;
  if (!str.startsWith('http://') && !str.startsWith('https://') && !str.includes('/') && !str.includes('.')) {
    return `https://suno.com/@${str}`;
  }
  return str;
}

function getDisplaySubtitle(idOrUrl, type, item) {
  if (type === 'track') {
    return getNormalizedArtist(item ? item.artist_name : '');
  }
  if (type === 'user' || type === 'profile') {
    const str = idOrUrl || '';
    const match = str.match(/suno\.com\/@([a-zA-Z0-9_\-]+)/i);
    if (match) return `@${match[1]}`;
    if (str.startsWith('@')) return str;
    return `@${str}`;
  }
  const str = idOrUrl || '';
  if (str.startsWith('http')) {
    const match = str.match(/playlist\/([a-f0-9\-]{36})/i);
    if (match) return match[1];
  }
  return str;
}

// ============================================================================
// Audio Engine & DSP Management
// ============================================================================
function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (!enhancer && audioCtx) {
    enhancer = new AetherEnhancer(audioCtx);
    sourceNode = audioCtx.createMediaElementSource(audioPlayer);
    masterGainNode = audioCtx.createGain();

    sourceNode.connect(enhancer.inputNode);
    enhancer.outputNode.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);

    // Initial state: Set bypass matching toggle
    enhancer.setBypass(!isEnhancerEnabled);
  }
}

function updateVolume() {
  if (audioPlayer && volumeSlider) {
    const val = parseFloat(volumeSlider.value) / 100;
    audioPlayer.volume = val;
  }
}

function setMasteringPreset(presetKey) {
  currentPreset = presetKey;
  if (presetSelect) presetSelect.value = presetKey;
  if (mobilePresetSelect) mobilePresetSelect.value = presetKey;
  localStorage.setItem('aether_preset_v2', presetKey);

  if (isEnhancerEnabled) {
    applyPresetDSP();
  }
}

function applyPresetDSP() {
  if (!enhancer) return;
  const basePreset = GENRE_PRESETS[currentPreset] || GENRE_PRESETS.auto;

  if (currentAnalysisResult && currentPreset === 'auto') {
    enhancer.setMasteringParams(currentAnalysisResult.suggestedParams, currentAnalysisResult.notches);
    updateAiHudUI(currentAnalysisResult);
  } else {
    enhancer.setMasteringParams(basePreset, currentAnalysisResult ? currentAnalysisResult.notches : []);
    updateAiHudUI({ suggestedParams: basePreset, notches: [] });
  }
}

async function runAnalysisForTrack(track, forceApply = false) {
  if (!track || !track.audio_url) return;
  if (analysisCache.has(track.audio_url)) {
    const cached = analysisCache.get(track.audio_url);
    currentAnalysisResult = cached;
    if (isEnhancerEnabled || forceApply) {
      applyPresetDSP();
      updateAiStatus('active');
    }
    if (aiAnalyzingIndicator) aiAnalyzingIndicator.classList.add('hidden');
    return;
  }

  // If enhancer is disabled and not forced, do not block or run heavy analysis
  if (!isEnhancerEnabled && !forceApply) {
    return;
  }

  isAnalyzingCurrentTrack = true;
  if (aiAnalyzingIndicator) aiAnalyzingIndicator.classList.remove('hidden');
  updateAiStatus('loading');

  try {
    const controller = new AbortController();
    activeAbortController = controller;

    const res = await fetch(track.audio_url, { signal: controller.signal });
    const arrayBuffer = await res.arrayBuffer();
    
    if (!audioCtx) initAudio();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    currentAudioBuffer = decodedBuffer;

    const analysis = await analyzeAudioResonances(decodedBuffer, currentPreset);
    analysisCache.set(track.audio_url, analysis);
    currentAnalysisResult = analysis;

    if (isEnhancerEnabled) {
      applyPresetDSP();
      updateAiStatus('active');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('[AI Mastering] Analysis warning:', err);
    }
    updateAiStatus(isEnhancerEnabled ? 'active' : 'idle');
  } finally {
    isAnalyzingCurrentTrack = false;
    if (aiAnalyzingIndicator) aiAnalyzingIndicator.classList.add('hidden');
  }
}

function updateAiStatus(status) {
  if (!aiStatusEl) return;
  aiStatusEl.className = 'status-badge';
  if (status === 'active') {
    aiStatusEl.textContent = 'ACTIVE';
    aiStatusEl.classList.add('active');
  } else if (status === 'loading') {
    aiStatusEl.textContent = 'ANALYZING...';
    aiStatusEl.classList.add('loading');
  } else {
    aiStatusEl.textContent = 'STANDBY / BYPASS';
    aiStatusEl.classList.add('idle');
  }
}

function updateAiHudUI(result) {
  const sug = result ? result.suggestedParams : (GENRE_PRESETS[currentPreset] || GENRE_PRESETS.auto);
  if (!sug) return;

  if (hudEqLow) hudEqLow.textContent = `${sug.eqLowGain > 0 ? '+' : ''}${(sug.eqLowGain || 0).toFixed(1)} dB`;
  if (hudEqHigh) hudEqHigh.textContent = `${sug.eqHighGain > 0 ? '+' : ''}${(sug.eqHighGain || 0).toFixed(1)} dB`;
  if (hudWidth) hudWidth.textContent = `${(sug.stereoWidth || 1.15).toFixed(2)}x`;
  
  const hissAmount = sug.hissReductionAmount || 0;
  if (hudHiss) hudHiss.textContent = hissAmount > 0 ? `${hissAmount}%` : 'OFF';

  if (hudCompThresh) hudCompThresh.textContent = `${(sug.compThreshold || -8).toFixed(1)} dB`;
  if (hudCompRatio) hudCompRatio.textContent = `${(sug.compRatio || 1.35).toFixed(2)}:1`;
  if (hudLimiterBoost) hudLimiterBoost.textContent = `+${(sug.limiterBoost || 3.5).toFixed(1)} dB`;

  if (hudSatDrive) {
    hudSatDrive.textContent = sug.satEnabled && sug.satDrive > 0 ? `${sug.satType ? sug.satType.toUpperCase() : 'TUBE'} (${sug.satDrive})` : 'OFF';
  }
  if (hudDeesser) {
    hudDeesser.textContent = sug.deesserAmount > 0 ? `${sug.deesserAmount}%` : 'OFF';
  }
  if (hudRumble) {
    hudRumble.textContent = sug.rumbleCutEnabled ? 'ACTIVE (90Hz)' : 'BYPASS (18Hz)';
  }

  if (hudDynamicsDesc) hudDynamicsDesc.textContent = result && result.crestDesc ? result.crestDesc : 'Normal (Balanced)';
  if (hudStereoDesc) hudStereoDesc.textContent = result && result.correlationDesc ? result.correlationDesc : 'Balanced Stereo';
  if (hudGenreDesc) hudGenreDesc.textContent = currentPreset.toUpperCase();
}

function handleEnhancerToggleChange(isActive) {
  isEnhancerEnabled = isActive;
  localStorage.setItem('aether_enhancer_enabled', isActive ? '1' : '0');

  if (enhancerToggle) enhancerToggle.checked = isActive;
  if (mobileEnhancerToggle) mobileEnhancerToggle.checked = isActive;

  initAudio();
  if (enhancer) {
    enhancer.setBypass(!isActive);
  }

  if (isActive) {
    const track = tracks[currentTrackIndex];
    if (track) {
      runAnalysisForTrack(track, true);
    } else {
      updateAiStatus('active');
    }
  } else {
    updateAiStatus('idle');
  }
}

// ============================================================================
// MediaSession & Background Playback
// ============================================================================
function updateMediaSession(track) {
  if ('mediaSession' in navigator && window.MediaMetadata && track) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: getNormalizedArtist(track.artist_name),
      album: 'AetherPlayer',
      artwork: [
        { src: track.image_url, sizes: '512x512', type: 'image/png' }
      ]
    });
  }
}

function setupMediaSessionActions() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioPlayer && isFinite(details.seekTime)) {
          audioPlayer.currentTime = details.seekTime;
        }
      });
    } catch (e) {}
  }
}

// ============================================================================
// Playback Control & Track Selection
// ============================================================================
function selectTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentTrackIndex = index;
  const track = tracks[index];

  initAudio();

  // Reset audio source
  audioPlayer.src = track.audio_url;
  audioPlayer.load();

  // Update UI Elements
  if (trackTitle) trackTitle.textContent = track.title || 'Untitled Track';
  if (trackArtist) trackArtist.textContent = getNormalizedArtist(track.artist_name);
  if (trackArtwork) trackArtwork.src = track.image_url || 'https://cdn1.suno.ai/image_large_00000000-0000-0000-0000-000000000000.png';

  if (sunoLink) {
    sunoLink.href = `https://suno.com/song/${track.id}`;
    sunoLink.classList.remove('hidden');
  }

  // Mini-player UI
  if (miniTitle) miniTitle.textContent = track.title || 'Untitled Track';
  if (miniArtist) miniArtist.textContent = getNormalizedArtist(track.artist_name);
  if (miniArtwork) miniArtwork.src = track.image_url || 'https://cdn1.suno.ai/image_large_00000000-0000-0000-0000-000000000000.png';

  // Lyrics
  const lyricsContent = track.prompt || track.lyrics || track.description || track.tags || '歌詞またはプロンプト情報はありません。';
  if (lyricsText) lyricsText.textContent = lyricsContent;
  if (mobileLyricsText) mobileLyricsText.textContent = lyricsContent;

  // Like buttons
  updateLikeButtonState(track.id);

  // Active track styling
  document.querySelectorAll('.track-item').forEach((el, idx) => {
    el.classList.toggle('active', idx === index);
  });

  // MediaSession
  updateMediaSession(track);

  // Start Playback
  audioPlayer.play().then(() => {
    isPlaying = true;
    updatePlayStateUI();
  }).catch(e => {
    console.warn('[Playback] Play failed or pending user interaction:', e.message);
    isPlaying = false;
    updatePlayStateUI();
  });

  // On-demand Mastering Analysis
  if (isEnhancerEnabled) {
    runAnalysisForTrack(track);
  }

  window.renderLucideIcons();
}

function togglePlay() {
  if (tracks.length === 0) return;
  initAudio();

  if (currentTrackIndex === -1) {
    selectTrack(0);
    return;
  }

  if (isPlaying) {
    audioPlayer.pause();
  } else {
    audioPlayer.play().catch(e => console.warn('[Audio] Play error:', e));
  }
}

function playNext() {
  if (tracks.length === 0) return;
  if (isShuffle) {
    const rand = Math.floor(Math.random() * tracks.length);
    selectTrack(rand);
  } else {
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= tracks.length) nextIdx = 0;
    selectTrack(nextIdx);
  }
}

function playPrev() {
  if (tracks.length === 0) return;
  let prevIdx = currentTrackIndex - 1;
  if (prevIdx < 0) prevIdx = tracks.length - 1;
  selectTrack(prevIdx);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  if (repeatMode === 'all') {
    repeatMode = 'one';
    if (repeatBtn) {
      repeatBtn.classList.add('active');
      repeatBtn.innerHTML = '<i data-lucide="repeat-1"></i>';
    }
  } else if (repeatMode === 'one') {
    repeatMode = 'none';
    if (repeatBtn) {
      repeatBtn.classList.remove('active');
      repeatBtn.innerHTML = '<i data-lucide="repeat"></i>';
      repeatBtn.style.opacity = '0.4';
    }
  } else {
    repeatMode = 'all';
    if (repeatBtn) {
      repeatBtn.classList.add('active');
      repeatBtn.innerHTML = '<i data-lucide="repeat"></i>';
      repeatBtn.style.opacity = '1';
    }
  }
  window.renderLucideIcons();
}

function updatePlayStateUI() {
  if (playPauseBtn) {
    playPauseBtn.innerHTML = isPlaying 
      ? '<i data-lucide="pause" id="play-pause-icon"></i>' 
      : '<i data-lucide="play" id="play-pause-icon"></i>';
  }
  if (miniPlayBtn) {
    miniPlayBtn.innerHTML = isPlaying 
      ? '<i data-lucide="pause" id="mini-play-icon"></i>' 
      : '<i data-lucide="play" id="mini-play-icon"></i>';
  }
  window.renderLucideIcons();
}

// ============================================================================
// Import Suno URL & Screen Navigation
// ============================================================================
async function importSunoUrl(urlStr, isSubRequest = false) {
  if (!urlStr || !urlStr.trim()) return;
  const targetUrl = canonicalizeSunoUrl(urlStr.trim());

  if (!isSubRequest) userProfileData = null;

  if (landingBtnText) landingBtnText.classList.add('hidden');
  if (landingBtnLoader) landingBtnLoader.classList.remove('hidden');
  if (landingBtn) landingBtn.disabled = true;

  try {
    const res = await fetch(`/api/suno?url=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) {
      const errTxt = await res.text();
      alert(`データの取得に失敗しました (Status: ${res.status}):\n${errTxt.slice(0, 120)}`);
      return;
    }

    const data = await res.json();
    if (data.error) {
      alert(`インポート失敗: ${data.error}`);
      return;
    }

    if (!isSubRequest && data.type === 'profile') {
      userProfileData = data;
      userProfileData.url = targetUrl;
    }

    tracks = data.tracks || [];
    currentTrackIndex = -1;
    isPlaying = false;
    audioPlayer.pause();

    currentSource = {
      type: data.type,
      url: targetUrl,
      name: data.name || (data.type === 'profile' ? 'Artist Profile' : 'Suno Playlist'),
      cover: tracks.length > 0 && tracks[0].image_url ? tracks[0].image_url : ''
    };

    // Save to Recent History
    saveToHistory(data.type, targetUrl, currentSource.name);

    // Update Sidebar details
    if (sourceName) sourceName.textContent = currentSource.name;
    if (sourceType) sourceType.textContent = data.type === 'profile' ? 'Artist Profile' : (data.type === 'song' ? 'Song' : 'Playlist');
    if (sourceCover) sourceCover.src = currentSource.cover || 'https://cdn1.suno.ai/image_large_00000000-0000-0000-0000-000000000000.png';
    if (tracksCountEl) tracksCountEl.textContent = tracks.length;
    if (overlayTracksCount) overlayTracksCount.textContent = tracks.length;

    updateSourceLikeButtonState();

    // Render Playlists Section (for profile imports)
    if (data.playlists && data.playlists.length > 0) {
      if (playlistsSection) playlistsSection.classList.remove('hidden');
      if (playlistsList) {
        playlistsList.innerHTML = data.playlists.map(pl => `
          <div class="playlist-chip-btn" data-url="${escapeHtml(pl.url || pl.id)}">
            <span><i data-lucide="folder"></i> ${escapeHtml(pl.name)}</span>
            <i data-lucide="chevron-right"></i>
          </div>
        `).join('');

        playlistsList.querySelectorAll('.playlist-chip-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const plUrl = btn.getAttribute('data-url');
            importSunoUrl(plUrl, true);
          });
        });
      }
    } else {
      if (playlistsSection) playlistsSection.classList.add('hidden');
    }

    // Render Tracks List in Sidebar & Slide-up Sheet
    renderTracksList();

    // Switch View from Landing to Player
    showPlayerWorkspace();

    // Auto-select first track
    if (tracks.length > 0) {
      selectTrack(0);
    }
  } catch (err) {
    console.error('Import error:', err);
    alert(`通信エラーが発生しました: ${err.message}`);
  } finally {
    if (landingBtnText) landingBtnText.classList.remove('hidden');
    if (landingBtnLoader) landingBtnLoader.classList.add('hidden');
    if (landingBtn) landingBtn.disabled = false;
  }
}

function renderTracksList() {
  if (tracks.length === 0) {
    if (tracksList) tracksList.innerHTML = '<div class="empty-list">曲がありません</div>';
    if (mobileOverlayTracksList) mobileOverlayTracksList.innerHTML = '<div class="empty-list">曲がありません</div>';
    return;
  }

  const listHtml = tracks.map((t, idx) => `
    <div class="track-item ${idx === currentTrackIndex ? 'active' : ''}" data-index="${idx}">
      <span class="track-item-idx">${idx + 1}</span>
      <img src="${escapeHtml(t.image_url || 'https://cdn1.suno.ai/image_large_00000000-0000-0000-0000-000000000000.png')}" class="track-item-cover" alt="Art">
      <div class="track-item-info">
        <span class="track-item-title">${escapeHtml(t.title || 'Untitled')}</span>
        <span class="track-item-artist">${escapeHtml(getNormalizedArtist(t.artist_name))}</span>
      </div>
    </div>
  `).join('');

  if (tracksList) {
    tracksList.innerHTML = listHtml;
    tracksList.querySelectorAll('.track-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        selectTrack(idx);
        if (window.innerWidth <= 768) {
          switchMobileTab('player');
        }
      });
    });
  }

  if (mobileOverlayTracksList) {
    mobileOverlayTracksList.innerHTML = listHtml;
    mobileOverlayTracksList.querySelectorAll('.track-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        selectTrack(idx);
        if (playerPlaylistOverlay) playerPlaylistOverlay.classList.remove('active-playlist');
      });
    });
  }

  window.renderLucideIcons();
}

function showLandingScreen() {
  if (landingScreen) landingScreen.classList.remove('hidden');
  if (playerWorkspace) playerWorkspace.classList.add('hidden');
  if (miniPlayer) miniPlayer.classList.add('hidden');
  if (mobileNavBar) mobileNavBar.classList.add('hidden');
  renderHistoryUI();
  renderFavoritesUI();
  window.renderLucideIcons();
}

function showPlayerWorkspace() {
  if (landingScreen) landingScreen.classList.add('hidden');
  if (playerWorkspace) playerWorkspace.classList.remove('hidden');
  handleResponsiveLayout();
  window.renderLucideIcons();
}

// ============================================================================
// Mobile Tab & Sheet Interactions
// ============================================================================
function switchMobileTab(tabName) {
  if (window.innerWidth > 768) return;

  if (workspaceSidebar) workspaceSidebar.classList.remove('active-tab');
  if (workspacePlayer) workspacePlayer.classList.remove('active-tab');
  if (workspaceUtility) workspaceUtility.classList.remove('active-tab');

  if (navBtnLibrary) navBtnLibrary.classList.remove('active');
  if (navBtnPlayer) navBtnPlayer.classList.remove('active');
  if (navBtnUtility) navBtnUtility.classList.remove('active');

  if (tabName === 'library') {
    if (workspaceSidebar) workspaceSidebar.classList.add('active-tab');
    if (navBtnLibrary) navBtnLibrary.classList.add('active');
    if (miniPlayer && tracks.length > 0) miniPlayer.classList.remove('hidden');
  } else if (tabName === 'player') {
    if (workspacePlayer) workspacePlayer.classList.add('active-tab');
    if (navBtnPlayer) navBtnPlayer.classList.add('active');
    if (miniPlayer) miniPlayer.classList.add('hidden');
  } else if (tabName === 'utility') {
    if (workspaceUtility) workspaceUtility.classList.add('active-tab');
    if (navBtnUtility) navBtnUtility.classList.add('active');
    if (miniPlayer && tracks.length > 0) miniPlayer.classList.remove('hidden');
  }
}

function switchUtilityTab(tabName) {
  if (tabName === 'enhancer') {
    if (tabEnhancerBtn) tabEnhancerBtn.classList.add('active');
    if (tabLyricsBtn) tabLyricsBtn.classList.remove('active');
    if (tabEnhancer) tabEnhancer.classList.remove('hidden');
    if (tabLyrics) tabLyrics.classList.add('hidden');
  } else {
    if (tabEnhancerBtn) tabEnhancerBtn.classList.remove('active');
    if (tabLyricsBtn) tabLyricsBtn.classList.add('active');
    if (tabEnhancer) tabEnhancer.classList.add('hidden');
    if (tabLyrics) tabLyrics.classList.remove('hidden');
  }
}

function switchLandingTab(tabName) {
  if (tabName === 'history') {
    if (landingTabHistoryBtn) landingTabHistoryBtn.classList.add('active');
    if (landingTabFavoritesBtn) landingTabFavoritesBtn.classList.remove('active');
    if (historyContainer) historyContainer.classList.remove('hidden');
    if (favoritesContainer) favoritesContainer.classList.add('hidden');
  } else {
    if (landingTabHistoryBtn) landingTabHistoryBtn.classList.remove('active');
    if (landingTabFavoritesBtn) landingTabFavoritesBtn.classList.add('active');
    if (historyContainer) historyContainer.classList.add('hidden');
    if (favoritesContainer) favoritesContainer.classList.remove('hidden');
  }
}

function switchDropdownTab(tabName) {
  if (tabName === 'history') {
    if (dropTabHistory) dropTabHistory.classList.add('active');
    if (dropTabFavorites) dropTabFavorites.classList.remove('active');
    if (dropContentHistory) dropContentHistory.classList.remove('hidden');
    if (dropContentFavorites) dropContentFavorites.classList.add('hidden');
  } else {
    if (dropTabHistory) dropTabHistory.classList.remove('active');
    if (dropTabFavorites) dropTabFavorites.classList.add('active');
    if (dropContentHistory) dropContentHistory.classList.add('hidden');
    if (dropContentFavorites) dropContentFavorites.classList.remove('hidden');
  }
}

function handleResponsiveLayout() {
  const isMobile = window.innerWidth <= 768;
  const isPlayerOpen = landingScreen && landingScreen.classList.contains('hidden');

  if (isMobile) {
    if (mobileNavBar) mobileNavBar.classList.toggle('hidden', !isPlayerOpen);
    if (isPlayerOpen) {
      const activeBtn = document.querySelector('.mobile-nav-bar .nav-btn.active');
      const currentTab = activeBtn ? activeBtn.id.replace('nav-btn-', '') : 'player';
      switchMobileTab(currentTab);
    }
  } else {
    if (mobileNavBar) mobileNavBar.classList.add('hidden');
    if (miniPlayer) miniPlayer.classList.add('hidden');
    if (workspaceSidebar) workspaceSidebar.classList.remove('active-tab');
    if (workspacePlayer) workspacePlayer.classList.remove('active-tab');
    if (workspaceUtility) workspaceUtility.classList.remove('active-tab');
  }
}

// ============================================================================
// History & Favorites LocalStorage Management
// ============================================================================
let historyData = { users: [], playlists: [], tracks: [] };
let favoritesData = { users: [], playlists: [], tracks: [] };

function loadStorageData() {
  try {
    const savedH = localStorage.getItem('suno_player_history_v2');
    if (savedH) historyData = JSON.parse(savedH);
  } catch (e) {
    historyData = { users: [], playlists: [], tracks: [] };
  }
  try {
    const savedF = localStorage.getItem('suno_player_favorites_v2');
    if (savedF) favoritesData = JSON.parse(savedF);
  } catch (e) {
    favoritesData = { users: [], playlists: [], tracks: [] };
  }

  if (!historyData || typeof historyData !== 'object') historyData = { users: [], playlists: [], tracks: [] };
  if (!Array.isArray(historyData.users)) historyData.users = [];
  if (!Array.isArray(historyData.playlists)) historyData.playlists = [];
  if (!Array.isArray(historyData.tracks)) historyData.tracks = [];

  if (!favoritesData || typeof favoritesData !== 'object') favoritesData = { users: [], playlists: [], tracks: [] };
  if (!Array.isArray(favoritesData.users)) favoritesData.users = [];
  if (!Array.isArray(favoritesData.playlists)) favoritesData.playlists = [];
  if (!Array.isArray(favoritesData.tracks)) favoritesData.tracks = [];
}

function saveToHistory(type, idOrUrl, name) {
  loadStorageData();
  const canonical = canonicalizeSunoUrl(idOrUrl);
  let targetList = type === 'profile' || type === 'user' ? historyData.users : (type === 'playlist' ? historyData.playlists : historyData.tracks);

  // Remove existing duplicate
  targetList = targetList.filter(item => item && (item.url !== canonical && item.id !== canonical));
  targetList.unshift({
    id: canonical,
    url: canonical,
    name: name || canonical,
    timestamp: Date.now()
  });

  if (targetList.length > 20) targetList.pop();

  if (type === 'profile' || type === 'user') historyData.users = targetList;
  else if (type === 'playlist') historyData.playlists = targetList;
  else historyData.tracks = targetList;

  try {
    localStorage.setItem('suno_player_history_v2', JSON.stringify(historyData));
  } catch (e) {}

  renderHistoryUI();
}

function toggleTrackLike() {
  if (currentTrackIndex === -1 || !tracks[currentTrackIndex]) return;
  const track = tracks[currentTrackIndex];
  loadStorageData();

  const idx = favoritesData.tracks.findIndex(t => t && t.id === track.id);
  if (idx === -1) {
    favoritesData.tracks.unshift({
      id: track.id,
      title: track.title,
      artist_name: getNormalizedArtist(track.artist_name),
      image_url: track.image_url,
      url: `https://suno.com/song/${track.id}`
    });
  } else {
    favoritesData.tracks.splice(idx, 1);
  }

  try {
    localStorage.setItem('suno_player_favorites_v2', JSON.stringify(favoritesData));
  } catch (e) {}

  updateLikeButtonState(track.id);
  renderFavoritesUI();
}

function toggleSourceLike() {
  if (!currentSource.url) return;
  loadStorageData();

  const isUser = currentSource.type === 'profile' || currentSource.type === 'user';
  let targetList = isUser ? favoritesData.users : favoritesData.playlists;

  const idx = targetList.findIndex(item => item && (item.url === currentSource.url || item.id === currentSource.url));
  if (idx === -1) {
    targetList.unshift({
      id: currentSource.url,
      url: currentSource.url,
      name: currentSource.name
    });
  } else {
    targetList.splice(idx, 1);
  }

  if (isUser) favoritesData.users = targetList;
  else favoritesData.playlists = targetList;

  try {
    localStorage.setItem('suno_player_favorites_v2', JSON.stringify(favoritesData));
  } catch (e) {}

  updateSourceLikeButtonState();
  renderFavoritesUI();
}

function updateLikeButtonState(trackId) {
  loadStorageData();
  const isLiked = favoritesData.tracks.some(t => t && t.id === trackId);
  if (likeBtn) likeBtn.classList.toggle('liked', isLiked);
  if (miniLikeBtn) miniLikeBtn.classList.toggle('liked', isLiked);
}

function updateSourceLikeButtonState() {
  if (!currentSource.url) {
    if (sourceLikeBtn) sourceLikeBtn.classList.add('hidden');
    return;
  }
  if (sourceLikeBtn) sourceLikeBtn.classList.remove('hidden');

  loadStorageData();
  const isUser = currentSource.type === 'profile' || currentSource.type === 'user';
  const targetList = isUser ? favoritesData.users : favoritesData.playlists;
  const isLiked = targetList.some(item => item && (item.url === currentSource.url || item.id === currentSource.url));

  if (sourceLikeBtn) sourceLikeBtn.classList.toggle('liked', isLiked);
}

function renderHistoryUI() {
  loadStorageData();
  const renderList = (items, type) => {
    if (!items || items.length === 0) return '<div class="empty-history">履歴がありません</div>';
    return items.map(item => `
      <div class="history-item" data-url="${escapeHtml(item.url || item.id)}">
        <span class="history-item-title">${escapeHtml(item.name || item.title || item.url)}</span>
        <span class="history-item-sub">${escapeHtml(getDisplaySubtitle(item.url || item.id, type, item))}</span>
      </div>
    `).join('');
  };

  const usersEl = document.getElementById('history-users-list');
  const playlistsEl = document.getElementById('history-playlists-list');
  const tracksEl = document.getElementById('history-tracks-list');
  const dropUsersEl = document.getElementById('dropdown-history-users-list');
  const dropPlaylistsEl = document.getElementById('dropdown-history-playlists-list');
  const dropTracksEl = document.getElementById('dropdown-history-tracks-list');

  if (usersEl) usersEl.innerHTML = renderList(historyData.users, 'user');
  if (playlistsEl) playlistsEl.innerHTML = renderList(historyData.playlists, 'playlist');
  if (tracksEl) tracksEl.innerHTML = renderList(historyData.tracks, 'track');

  if (dropUsersEl) dropUsersEl.innerHTML = renderList(historyData.users, 'user');
  if (dropPlaylistsEl) dropPlaylistsEl.innerHTML = renderList(historyData.playlists, 'playlist');
  if (dropTracksEl) dropTracksEl.innerHTML = renderList(historyData.tracks, 'track');

  document.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-url');
      if (landingInput) landingInput.value = url;
      if (headerHistoryDropdown) headerHistoryDropdown.classList.add('hidden');
      importSunoUrl(url);
    });
  });
}

function renderFavoritesUI() {
  loadStorageData();
  const renderList = (items, type) => {
    if (!items || items.length === 0) return '<div class="empty-history">お気に入りがありません</div>';
    return items.map(item => `
      <div class="favorite-item" data-url="${escapeHtml(item.url || item.id)}">
        <span class="favorite-item-title">${escapeHtml(item.name || item.title || item.url)}</span>
        <span class="favorite-item-sub">${escapeHtml(getDisplaySubtitle(item.url || item.id, type, item))}</span>
      </div>
    `).join('');
  };

  const usersEl = document.getElementById('favorites-users-list');
  const playlistsEl = document.getElementById('favorites-playlists-list');
  const tracksEl = document.getElementById('favorites-tracks-list');
  const dropUsersEl = document.getElementById('dropdown-favorites-users-list');
  const dropPlaylistsEl = document.getElementById('dropdown-favorites-playlists-list');
  const dropTracksEl = document.getElementById('dropdown-favorites-tracks-list');

  if (usersEl) usersEl.innerHTML = renderList(favoritesData.users, 'user');
  if (playlistsEl) playlistsEl.innerHTML = renderList(favoritesData.playlists, 'playlist');
  if (tracksEl) tracksEl.innerHTML = renderList(favoritesData.tracks, 'track');

  if (dropUsersEl) dropUsersEl.innerHTML = renderList(favoritesData.users, 'user');
  if (dropPlaylistsEl) dropPlaylistsEl.innerHTML = renderList(favoritesData.playlists, 'playlist');
  if (dropTracksEl) dropTracksEl.innerHTML = renderList(favoritesData.tracks, 'track');

  document.querySelectorAll('.favorite-item').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-url');
      if (landingInput) landingInput.value = url;
      if (headerHistoryDropdown) headerHistoryDropdown.classList.add('hidden');
      importSunoUrl(url);
    });
  });
}

// ============================================================================
// Event Listeners & Initialization
// ============================================================================
function initEventListeners() {
  // Landing Import Actions
  if (landingBtn) {
    landingBtn.addEventListener('click', () => {
      if (landingInput) importSunoUrl(landingInput.value);
    });
  }
  if (landingInput) {
    landingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') importSunoUrl(landingInput.value);
    });
  }

  // Quick Sample Chips
  document.querySelectorAll('.quick-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleUrl = btn.getAttribute('data-url');
      if (landingInput) landingInput.value = sampleUrl;
      importSunoUrl(sampleUrl);
    });
  });

  // Landing Tabs
  if (landingTabHistoryBtn) landingTabHistoryBtn.addEventListener('click', () => switchLandingTab('history'));
  if (landingTabFavoritesBtn) landingTabFavoritesBtn.addEventListener('click', () => switchLandingTab('favorites'));

  // Header Dropdown Trigger
  if (historyToggleBtn && headerHistoryDropdown) {
    historyToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      headerHistoryDropdown.classList.toggle('hidden');
      if (!headerHistoryDropdown.classList.contains('hidden')) {
        renderHistoryUI();
        renderFavoritesUI();
      }
    });
  }
  if (dropTabHistory) dropTabHistory.addEventListener('click', () => switchDropdownTab('history'));
  if (dropTabFavorites) dropTabFavorites.addEventListener('click', () => switchDropdownTab('favorites'));

  document.addEventListener('click', (e) => {
    if (headerHistoryDropdown && !headerHistoryDropdown.contains(e.target) && e.target !== historyToggleBtn) {
      headerHistoryDropdown.classList.add('hidden');
    }
  });

  // Navigation Buttons
  if (backToLandingBtn) backToLandingBtn.addEventListener('click', showLandingScreen);
  if (headerLogoBtn) headerLogoBtn.addEventListener('click', showLandingScreen);
  if (sidebarBackBtn) sidebarBackBtn.addEventListener('click', showLandingScreen);
  if (sidebarToPlayerBtn) sidebarToPlayerBtn.addEventListener('click', () => switchMobileTab('player'));
  if (closePlayerBtn) closePlayerBtn.addEventListener('click', () => switchMobileTab('library'));

  // Share Button
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.clipboard && currentSource.url) {
        navigator.clipboard.writeText(currentSource.url);
        alert('共有リンクをクリップボードにコピーしました！');
      }
    });
  }

  // Like Buttons
  if (likeBtn) likeBtn.addEventListener('click', toggleTrackLike);
  if (miniLikeBtn) miniLikeBtn.addEventListener('click', toggleTrackLike);
  if (sourceLikeBtn) sourceLikeBtn.addEventListener('click', toggleSourceLike);

  // Playback Controls
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
  if (miniPlayBtn) miniPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  if (nextBtn) nextBtn.addEventListener('click', playNext);
  if (miniNextBtn) miniNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playNext();
  });
  if (prevBtn) prevBtn.addEventListener('click', playPrev);
  if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
  if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

  // Progress Bar
  if (progressBar) {
    progressBar.addEventListener('input', () => {
      isUserDraggingProgress = true;
      if (audioPlayer && audioPlayer.duration) {
        const dragTime = (progressBar.value / 100) * audioPlayer.duration;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(dragTime);
      }
    });
    progressBar.addEventListener('change', () => {
      if (audioPlayer && audioPlayer.duration) {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
      }
      isUserDraggingProgress = false;
    });
  }

  // Volume Slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateVolume);
  }

  // Audio Player Events
  if (audioPlayer) {
    audioPlayer.addEventListener('timeupdate', () => {
      if (!isUserDraggingProgress && audioPlayer.duration) {
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (progressBar) progressBar.value = pct;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        if (miniProgressFill) miniProgressFill.style.width = `${pct}%`;
      }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
      if (durationTimeEl) durationTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('play', () => {
      isPlaying = true;
      updatePlayStateUI();
    });

    audioPlayer.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayStateUI();
    });

    audioPlayer.addEventListener('ended', () => {
      if (repeatMode === 'one') {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      } else if (repeatMode === 'all' || isShuffle) {
        playNext();
      } else {
        if (currentTrackIndex < tracks.length - 1) playNext();
        else isPlaying = false;
      }
      updatePlayStateUI();
    });
  }

  // Enhancer Toggle & Presets
  if (enhancerToggle) {
    enhancerToggle.addEventListener('change', () => handleEnhancerToggleChange(enhancerToggle.checked));
  }
  if (mobileEnhancerToggle) {
    mobileEnhancerToggle.addEventListener('change', () => handleEnhancerToggleChange(mobileEnhancerToggle.checked));
  }
  if (presetSelect) {
    presetSelect.addEventListener('change', () => setMasteringPreset(presetSelect.value));
  }
  if (mobilePresetSelect) {
    mobilePresetSelect.addEventListener('change', () => setMasteringPreset(mobilePresetSelect.value));
  }

  // Sheet Overlays
  if (openLyricsBtn && playerLyricsOverlay) {
    openLyricsBtn.addEventListener('click', () => playerLyricsOverlay.classList.add('active-lyrics'));
  }
  if (closeLyricsBtn && playerLyricsOverlay) {
    closeLyricsBtn.addEventListener('click', () => playerLyricsOverlay.classList.remove('active-lyrics'));
  }
  if (openPlaylistBtn && playerPlaylistOverlay) {
    openPlaylistBtn.addEventListener('click', () => playerPlaylistOverlay.classList.add('active-playlist'));
  }
  if (closePlaylistBtn && playerPlaylistOverlay) {
    closePlaylistBtn.addEventListener('click', () => playerPlaylistOverlay.classList.remove('active-playlist'));
  }

  // Utility Tabs
  if (tabEnhancerBtn) tabEnhancerBtn.addEventListener('click', () => switchUtilityTab('enhancer'));
  if (tabLyricsBtn) tabLyricsBtn.addEventListener('click', () => switchUtilityTab('lyrics'));

  // Mobile Bottom Navigation
  if (navBtnLibrary) navBtnLibrary.addEventListener('click', () => switchMobileTab('library'));
  if (navBtnPlayer) navBtnPlayer.addEventListener('click', () => switchMobileTab('player'));
  if (navBtnUtility) navBtnUtility.addEventListener('click', () => switchMobileTab('utility'));

  // Mini-player Click opens Player View
  if (miniPlayer) {
    miniPlayer.addEventListener('click', () => switchMobileTab('player'));
  }

  // Window Resize
  window.addEventListener('resize', handleResponsiveLayout);

  // Setup MediaSession handlers
  setupMediaSessionActions();
}

// ============================================================================
// Initial Startup
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  const savedEnabled = localStorage.getItem('aether_enhancer_enabled');
  isEnhancerEnabled = savedEnabled === '1';
  if (enhancerToggle) enhancerToggle.checked = isEnhancerEnabled;
  if (mobileEnhancerToggle) mobileEnhancerToggle.checked = isEnhancerEnabled;

  const savedPreset = localStorage.getItem('aether_preset_v2') || 'auto';
  setMasteringPreset(savedPreset);

  initEventListeners();
  loadStorageData();
  renderHistoryUI();
  renderFavoritesUI();
  updateAiStatus(isEnhancerEnabled ? 'active' : 'idle');
  window.renderLucideIcons();

  // Check URL parameters for direct import (?url=... or ?suno=...)
  const params = new URLSearchParams(window.location.search);
  const targetParam = params.get('url') || params.get('suno');
  if (targetParam) {
    if (landingInput) landingInput.value = targetParam;
    importSunoUrl(targetParam);
  }
});
