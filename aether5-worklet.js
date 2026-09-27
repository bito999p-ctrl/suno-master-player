// AetherMaster 5 realtime chain for the player: processes the <audio> element stream.
// Dry (pass-through) until the current track's params arrive or when the enhancer is off;
// switching crossfades over ~40 ms so it never clicks.
import { MasterChain } from './engine/chain.js';

class AetherStream extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chain = new MasterChain(sampleRate);
    this.ready = false; this.enabled = false;
    this.mix = 0; // 0 dry .. 1 wet
    this.step = 1 / (0.04 * sampleRate);
    this.bl = new Float64Array(128); this.br = new Float64Array(128);
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'params') {
        if (m.params) { this.chain.setParams(m.params); if (!this.ready) this.chain.reset(); }
        this.ready = !!m.params;
      } else if (m.type === 'enable') this.enabled = m.on;
    };
  }
  process(inputs, outputs) {
    const inp = inputs[0], out = outputs[0];
    const oL = out[0], oR = out[1] || out[0], n = oL.length;
    if (!inp.length) { oL.fill(0); if (oR !== oL) oR.fill(0); return true; }
    const iL = inp[0], iR = inp[1] || inp[0];
    const target = this.enabled && this.ready ? 1 : 0;
    if (target === 0 && this.mix === 0) {
      oL.set(iL); if (oR !== oL) oR.set(iR);
      return true;
    }
    if (this.mix === 0) this.chain.reset(); // fresh state when fading in
    const { bl, br } = this;
    if (bl.length < n) { this.bl = new Float64Array(n); this.br = new Float64Array(n); return this.process(inputs, outputs); }
    for (let i = 0; i < n; i++) { bl[i] = iL[i]; br[i] = iR[i]; }
    this.chain.process(bl, br, n);
    for (let i = 0; i < n; i++) {
      if (this.mix !== target) this.mix = target > this.mix ? Math.min(1, this.mix + this.step) : Math.max(0, this.mix - this.step);
      const w = this.mix, d = 1 - w;
      oL[i] = w * bl[i] + d * iL[i];
      if (oR !== oL) oR[i] = w * br[i] + d * iR[i];
    }
    return true;
  }
}
registerProcessor('aether5-stream', AetherStream);
