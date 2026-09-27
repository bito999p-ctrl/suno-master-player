// AetherMaster 5 analysis for the player. Two instances run side by side:
//  - tuner: holds a short excerpt of each recent song (6 x 4 s); tunes = calibrate + loudness
//    solve on that excerpt (~1-2 s), so the first sound and genre / target changes are quick.
//  - analyzer: full-song diagnosis (a few s); its result replaces the excerpt's quick diagnosis.
// The excerpt solve lands within ~0.3 LU of the whole-song answer; the source-loudness
// difference between excerpt and song is added back to the drive.
import { Session } from './engine/session.js';
import { diagnose } from './engine/analyze.js';
import { prescribe } from './engine/prescribe.js';
import { GENRES, guessGenre, genreDeltas } from './engine/genres.js';
import { applyDeltas } from './engine/spices.js';

const songs = new Map(); // key -> { E, diag, auto, exLufs, corr, full }
const KEEP = 4;

function tune(m) {
  const song = songs.get(m.key);
  if (!song) return self.postMessage({ type: 'error', key: m.key, message: 'not loaded' });
  const { E, diag, auto } = song;
  const p = structuredClone(auto.params);
  const g = GENRES.find((x) => x.id === m.genre);
  if (g) applyDeltas(p, genreDeltas(g, { diag, dec: auto.decisions, p }).deltas);
  if (m.target != null) p.targetLufs = m.target;
  // listener tone preference: one step = about 1.2 dB top shelf (+ a little air) / 1.5 dB low shelf
  const t = m.tone || {};
  if (t.bass || t.treble) applyDeltas(p, { bassDb: 1.5 * (t.bass | 0), highShelfDb: 1.2 * (t.treble | 0), airDb: 0.6 * (t.treble | 0) });
  const c = E.calibrate(p);
  c.driveDb = +(E.solveLoudness(c) + song.corr).toFixed(2);
  self.postMessage({ type: 'tuned', final: song.full, key: m.key, genre: m.genre, targetKey: m.targetKey, toneKey: m.toneKey, params: c,
    info: { guess: guessGenre(diag, auto.decisions), crestDb: diag.crestDb, lra: diag.lra, lufs: diag.lufs } });
}

self.onmessage = (e) => {
  const m = e.data;
  try {
    if (m.type === 'excerpt') { // tuner: new song, quick diagnosis on the excerpt
      const E = new Session(m.L, m.R, m.fs);
      const diag = E.analyze();
      songs.delete(m.key);
      songs.set(m.key, { E, diag, auto: E.auto(), exLufs: diag.lufs, corr: 0, full: !m.partial });
      while (songs.size > KEEP) songs.delete(songs.keys().next().value);
      self.postMessage({ type: 'ready', key: m.key });
    } else if (m.type === 'diag') { // tuner: full-song diagnosis arrived
      const song = songs.get(m.key);
      if (!song) return;
      song.diag = m.diag; song.auto = prescribe(m.diag); song.full = true;
      song.corr = Math.max(-2, Math.min(2, song.exLufs - m.diag.lufs));
    } else if (m.type === 'tune') {
      tune(m);
    } else if (m.type === 'diagnose') { // analyzer
      self.postMessage({ type: 'diag', key: m.key, diag: diagnose(m.L, m.R, m.fs) });
    }
  } catch (err) {
    self.postMessage({ type: 'error', key: m.key, message: String(err && err.stack || err) });
  }
};

