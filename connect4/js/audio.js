/**
 * audio.js
 * Small sound effects generated with the Web Audio API (no audio files).
 * The AudioContext is created on the first user action, as browsers require.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});

  let context = null;
  let enabled = true;

  function getContext() {
    if (!context) {
      const Ctor = global.AudioContext || global.webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  /** Plays one short tone that glides from `from` Hz to `to` Hz. */
  function tone(from, to, duration, delay = 0, type = 'sine', volume = 0.18) {
    if (!enabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(to, start + duration);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (error) {
      /* Sound is optional: never let it break the game. */
    }
  }

  C4.Audio = {
    setEnabled(value) { enabled = Boolean(value); },
    drop() { tone(220, 70, 0.14, 0, 'sine', 0.3); },
    click() { tone(660, 520, 0.05, 0, 'triangle', 0.08); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, i * 0.11, 'triangle')); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, f * 0.97, 0.28, i * 0.16, 'sine')); },
    draw() { [440, 440].forEach((f, i) => tone(f, f, 0.18, i * 0.2, 'sine')); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
