/**
 * config.js
 * Central place for every tunable value of the game.
 * Change numbers here; no other file needs to be touched.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});

  C4.CONFIG = Object.freeze({
    COLS: 7,
    ROWS: 6,
    CONNECT: 4, // discs in a row needed to win

    HUMAN: 1, // player ids stored inside the board cells
    AI: 2,

    /**
     * Difficulty levels.
     *  maxDepth     how many plies (half moves) the search may look ahead
     *  timeLimitMs  hard time budget for one AI move (Infinity = no budget)
     *  blunderRate  probability of playing a random legal move instead
     */
    LEVELS: Object.freeze({
      easy:   Object.freeze({ maxDepth: 2,  timeLimitMs: Infinity, blunderRate: 0.3 }),
      medium: Object.freeze({ maxDepth: 4,  timeLimitMs: Infinity, blunderRate: 0 }),
      hard:   Object.freeze({ maxDepth: 42, timeLimitMs: 800,      blunderRate: 0 }),
    }),

    // Minimum time the "thinking" state stays visible, so moves feel natural.
    AI_MIN_THINK_MS: 550,

    STORAGE_KEY: 'connect4:v1',
  });
})(typeof window !== 'undefined' ? window : globalThis);
