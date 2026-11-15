/**
 * game.js
 * Game controller: connects the rules (board.js), the computer player
 * (ai.js) and the screen (ui.js), and owns the turn flow.
 */
(function (global) {
  'use strict';
  const C4 = global.C4;
  const { COLS, HUMAN, AI, AI_MIN_THINK_MS, STORAGE_KEY, LEVELS } = C4.CONFIG;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const $ = (id) => document.getElementById(id);

  /* ---------- Saved settings and scores ---------- */

  const DEFAULTS = {
    level: 'medium',
    first: 'human',
    lang: 'ar',
    sound: true,
    scores: { human: 0, ai: 0, draws: 0 },
  };

  function loadSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const merged = { ...DEFAULTS, ...saved, scores: { ...DEFAULTS.scores, ...saved.scores } };
      if (!LEVELS[merged.level]) merged.level = DEFAULTS.level;
      return merged;
    } catch (error) {
      return { ...DEFAULTS, scores: { ...DEFAULTS.scores } }; // storage blocked or corrupted
    }
  }

  function save(settings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
    catch (error) { /* private mode: the game still works, nothing is kept */ }
  }

  /* ---------- Controller ---------- */

  class Game {
    constructor() {
      this.settings = loadSaved();
      this.ui = new C4.UI();
      this.board = new C4.Board();
      this.busy = false;     // true while a disc is falling or the AI is thinking
      this.over = false;
      this.gameId = 0;       // changes on every new game; cancels stale async work

      C4.I18n.setLang(this.settings.lang);
      C4.Audio.setEnabled(this.settings.sound);
      this.ui.applyLanguage();
      this.ui.setSound(this.settings.sound);
      this.ui.setSegment('seg-level', this.settings.level);
      this.ui.setSegment('seg-first', this.settings.first);
      this.ui.setScores(this.settings.scores);

      this.bindEvents();
      this.newGame();
    }

    bindEvents() {
      const columns = $('columns');

      columns.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) this.humanMove(Number(button.dataset.col));
      });

      // Landing preview follows the mouse and the keyboard focus.
      const preview = (event) => {
        const button = event.target.closest('button');
        if (button) this.previewColumn(Number(button.dataset.col));
      };
      columns.addEventListener('pointerover', preview);
      columns.addEventListener('focusin', preview);
      columns.addEventListener('pointerleave', () => this.ui.hideGhost());
      columns.addEventListener('focusout', () => this.ui.hideGhost());

      $('btn-new').addEventListener('click', () => { C4.Audio.click(); this.newGame(); });
      $('btn-undo').addEventListener('click', () => { C4.Audio.click(); this.undo(); });

      $('btn-sound').addEventListener('click', () => {
        this.settings.sound = !this.settings.sound;
        C4.Audio.setEnabled(this.settings.sound);
        this.ui.setSound(this.settings.sound);
        C4.Audio.click();
        save(this.settings);
      });

      $('btn-lang').addEventListener('click', () => {
        this.settings.lang = this.settings.lang === 'ar' ? 'en' : 'ar';
        C4.I18n.setLang(this.settings.lang);
        this.ui.applyLanguage();
        save(this.settings);
      });

      this.bindSegment('seg-level', 'level', () => {});
      // Changing who starts applies now if the game has not really begun.
      this.bindSegment('seg-first', 'first', () => {
        const humanMoves = this.countHumanMoves();
        if (humanMoves === 0 || this.over) this.newGame();
      });

      document.addEventListener('keydown', (event) => this.onKey(event));
    }

    bindSegment(groupId, settingKey, onChange) {
      $(groupId).addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button || this.settings[settingKey] === button.dataset.value) return;
        this.settings[settingKey] = button.dataset.value;
        this.ui.setSegment(groupId, button.dataset.value);
        C4.Audio.click();
        save(this.settings);
        onChange();
      });
    }

    /** Keyboard: digits 1..7 play a column, arrows move between columns. */
    onKey(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (/^[1-7]$/.test(event.key)) {
        this.humanMove(Number(event.key) - 1);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const buttons = this.ui.columnButtons;
        const focused = buttons.indexOf(document.activeElement);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        const start = focused === -1 ? (COLS >> 1) - step : focused;
        // Skip full columns.
        for (let i = 1; i <= COLS; i++) {
          const col = (start + step * i + COLS * 2) % COLS;
          if (!buttons[col].disabled) { buttons[col].focus(); break; }
        }
        event.preventDefault();
      }
    }

    /* ----- Turn flow ----- */

    newGame() {
      this.gameId++;
      this.over = false;
      this.busy = false;
      this.board = new C4.Board(this.settings.first === 'human' ? HUMAN : AI);
      this.ui.clearBoard();
      this.ui.setGameOver(false);
      this.nextTurn();
    }

    /** Hands the turn to whoever is to move. */
    nextTurn() {
      const player = this.board.currentPlayer;
      this.ui.setActivePlayer(player);
      this.refreshUndo();
      if (player === HUMAN) {
        this.ui.setStatus('yourTurn');
        this.ui.setPlayable(true, this.board);
      } else {
        this.aiMove();
      }
    }

    async humanMove(col) {
      if (this.busy || this.over || this.board.currentPlayer !== HUMAN) return;
      if (!this.board.canPlay(col)) return;
      const gameId = this.gameId;
      const finished = await this.place(col);
      if (gameId === this.gameId && !finished) this.nextTurn();
    }

    async aiMove() {
      const gameId = this.gameId;
      this.busy = true;
      this.ui.setPlayable(false, this.board);
      this.ui.setStatus('thinking', 'thinking');
      this.refreshUndo();

      // Let the browser paint the "thinking" state before the search runs.
      const startedAt = performance.now();
      await wait(60);
      if (gameId !== this.gameId) return;

      const { col } = C4.AI.chooseMove(this.board, this.settings.level);

      const remaining = AI_MIN_THINK_MS - (performance.now() - startedAt);
      if (remaining > 0) await wait(remaining);
      if (gameId !== this.gameId) return;

      const finished = await this.place(col);
      if (gameId === this.gameId && !finished) this.nextTurn();
    }

    /**
     * Plays one move on the board and on screen.
     * @returns {Promise<boolean>} true when this move ended the game
     */
    async place(col) {
      const gameId = this.gameId;
      const player = this.board.currentPlayer;
      this.busy = true;
      this.ui.setPlayable(false, this.board);

      const row = this.board.play(col);
      await this.ui.dropDisc(row, col, player);
      if (gameId !== this.gameId) return true; // a new game started meanwhile
      this.busy = false;

      const line = this.board.findWinningLine(row, col);
      if (line) { this.finish(player, line); return true; }
      if (this.board.isFull()) { this.finish(0, null); return true; }
      return false;
    }

    /** @param {0|1|2} winner 0 means draw */
    finish(winner, line) {
      this.over = true;
      this.ui.setPlayable(false, this.board);
      this.ui.setActivePlayer(0);
      this.ui.setGameOver(true);

      if (winner === HUMAN) {
        this.settings.scores.human++;
        this.ui.setStatus('youWin', 'win');
        this.ui.celebrate();
        C4.Audio.win();
      } else if (winner === AI) {
        this.settings.scores.ai++;
        this.ui.setStatus('aiWins', 'lose');
        C4.Audio.lose();
      } else {
        this.settings.scores.draws++;
        this.ui.setStatus('draw');
        C4.Audio.draw();
      }
      if (line) this.ui.showWin(line);
      this.ui.setScores(this.settings.scores);
      this.refreshUndo();
      save(this.settings);
    }

    /* ----- Undo ----- */

    countHumanMoves() {
      const total = this.board.moveCount;
      return this.board.firstPlayer === HUMAN ? Math.ceil(total / 2) : Math.floor(total / 2);
    }

    refreshUndo() {
      this.ui.setUndoEnabled(!this.busy && this.countHumanMoves() > 0);
    }

    /** Takes back moves until the player's last move is removed. */
    undo() {
      if (this.busy || this.countHumanMoves() === 0) return;

      if (this.over) {
        // The finished game no longer counts in the score.
        const last = this.board.history.length - 1;
        const lastCol = this.board.history[last];
        const lastRow = this.board.heights[lastCol] - 1;
        const line = this.board.findWinningLine(lastRow, lastCol);
        const lastPlayer = 3 - this.board.currentPlayer;
        const key = !line ? 'draws' : lastPlayer === HUMAN ? 'human' : 'ai';
        this.settings.scores[key] = Math.max(0, this.settings.scores[key] - 1);
        this.ui.setScores(this.settings.scores);
        save(this.settings);
      }

      let removedHumanMove = false;
      while (!removedHumanMove && this.board.moveCount > 0) {
        const { row, col } = this.board.undo();
        this.ui.removeDisc(row, col);
        removedHumanMove = this.board.currentPlayer === HUMAN;
      }

      this.over = false;
      this.ui.clearWin();
      this.ui.setGameOver(false);
      this.nextTurn();
    }

    /* ----- Landing preview ----- */

    previewColumn(col) {
      if (this.busy || this.over || !this.board.canPlay(col)) { this.ui.hideGhost(); return; }
      this.ui.showGhost(this.board.heights[col], col);
    }
  }

  document.addEventListener('DOMContentLoaded', () => { C4.game = new Game(); });
})(window);
