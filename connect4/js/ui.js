/**
 * ui.js
 * Everything that touches the DOM: drawing discs, animations, labels.
 * It holds no game rules; game.js tells it what to show.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});
  const { COLS, ROWS, HUMAN } = C4.CONFIG;
  const { t } = C4.I18n;

  const $ = (id) => document.getElementById(id);
  const reducedMotion = () =>
    global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class UI {
    constructor() {
      this.board = $('board');
      this.discLayer = $('discs');
      this.columnLayer = $('columns');
      this.winLine = $('win-line');
      this.status = $('status');
      this.confetti = $('confetti');
      this.discs = new Map(); // "row,col" -> disc element
      this.columnButtons = [];
      this.buildBoard();
    }

    /** Creates the static parts of the board once. */
    buildBoard() {
      const front = $('board-front');
      for (let i = 0; i < COLS * ROWS; i++) front.appendChild(document.createElement('span'));

      for (let col = 0; col < COLS; col++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.col = col;
        this.columnLayer.appendChild(button);
        this.columnButtons.push(button);
      }

      this.ghost = document.createElement('div');
      this.ghost.className = 'disc ghost p1';
      this.discLayer.appendChild(this.ghost);
    }

    /* ----- Discs ----- */

    /**
     * Adds a disc and animates its fall with a small bounce.
     * @returns {Promise<void>} resolves when the disc has landed
     */
    dropDisc(row, col, player) {
      const disc = document.createElement('div');
      disc.className = `disc p${player}`;
      disc.style.setProperty('--row', row);
      disc.style.setProperty('--col', col);
      this.discLayer.appendChild(disc);
      this.discs.set(`${row},${col}`, disc);

      if (reducedMotion() || !disc.animate) return Promise.resolve();

      // Distance is in % of the disc size: start just above the top edge.
      const fall = (ROWS - row) * 100;
      const bounce = Math.min(22, 6 + (ROWS - row) * 3);
      const animation = disc.animate(
        [
          { transform: `translateY(-${fall}%)`, easing: 'cubic-bezier(0.5, 0, 1, 0.6)' },
          { transform: 'translateY(0)', offset: 0.62, easing: 'ease-out' },
          { transform: `translateY(-${bounce}%)`, offset: 0.78, easing: 'ease-in' },
          { transform: 'translateY(0)', offset: 0.9, easing: 'ease-out' },
          { transform: `translateY(-${bounce / 4}%)`, offset: 0.95, easing: 'ease-in' },
          { transform: 'translateY(0)' },
        ],
        { duration: 300 + (ROWS - row) * 65 }
      );
      // The landing sound plays at the first impact, not at the end.
      setTimeout(() => C4.Audio.drop(), animation.effect.getTiming().duration * 0.62);
      return animation.finished.catch(() => {});
    }

    removeDisc(row, col) {
      const key = `${row},${col}`;
      const disc = this.discs.get(key);
      if (disc) { disc.remove(); this.discs.delete(key); }
    }

    clearBoard() {
      this.discs.forEach((disc) => disc.remove());
      this.discs.clear();
      this.clearWin();
      this.hideGhost();
    }

    /** Shows a faint disc in the cell where the player's disc would land. */
    showGhost(row, col) {
      this.ghost.style.setProperty('--row', row);
      this.ghost.style.setProperty('--col', col);
      this.ghost.className = `disc ghost p${HUMAN} show`;
    }

    hideGhost() { this.ghost.classList.remove('show'); }

    /* ----- Win highlight ----- */

    showWin(line) {
      this.board.classList.add('has-winner');
      for (const { row, col } of line) this.discs.get(`${row},${col}`)?.classList.add('win');

      // Line through the centers of the first and last winning cells.
      const first = line[0], last = line[line.length - 1];
      const el = this.winLine.querySelector('line');
      el.setAttribute('x1', first.col + 0.5);
      el.setAttribute('y1', ROWS - first.row - 0.5);
      el.setAttribute('x2', last.col + 0.5);
      el.setAttribute('y2', ROWS - last.row - 0.5);
      this.winLine.classList.add('show');
    }

    clearWin() {
      this.board.classList.remove('has-winner');
      this.winLine.classList.remove('show');
      this.discs.forEach((disc) => disc.classList.remove('win'));
      C4.Effects.stop(this.confetti);
    }

    celebrate() { C4.Effects.burst(this.confetti); }

    /* ----- State indicators ----- */

    /** Enables the columns the player may click right now. */
    setPlayable(playable, board) {
      this.board.classList.toggle('playable', playable);
      this.columnButtons.forEach((button, col) => {
        button.disabled = !playable || !board.canPlay(col);
      });
      if (!playable) this.hideGhost();
    }

    setActivePlayer(player) {
      $('card-human').classList.toggle('active', player === HUMAN);
      $('card-ai').classList.toggle('active', player !== HUMAN && player !== 0);
    }

    /** @param {string} key i18n key  @param {''|'win'|'lose'|'thinking'} tone */
    setStatus(key, tone = '') {
      this.statusKey = key;
      this.statusTone = tone;
      this.status.className = `status ${tone === 'thinking' ? '' : tone}`.trim();
      this.status.textContent = t(key);
      if (tone === 'thinking') {
        const dots = document.createElement('span');
        dots.className = 'dots';
        this.status.appendChild(dots);
      }
    }

    setScores(scores) {
      $('score-human').textContent = scores.human;
      $('score-ai').textContent = scores.ai;
      $('score-draws').textContent = scores.draws;
    }

    setGameOver(over) { document.body.classList.toggle('game-over', over); }
    setUndoEnabled(enabled) { $('btn-undo').disabled = !enabled; }

    /** Marks the selected option inside a segmented control. */
    setSegment(groupId, value) {
      $(groupId).querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-checked', String(button.dataset.value === value));
      });
    }

    setSound(on) { $('btn-sound').setAttribute('aria-pressed', String(on)); }

    /** Re-renders every translatable label (called on language change). */
    applyLanguage() {
      document.documentElement.lang = C4.I18n.lang;
      document.documentElement.dir = t('dir');
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
      });
      $('btn-lang').textContent = t('switchTo');
      $('btn-lang').setAttribute('aria-label', t('language'));
      $('btn-sound').setAttribute('aria-label', t('sound'));
      this.columnButtons.forEach((button, col) => {
        button.setAttribute('aria-label', `${t('column')} ${col + 1}`);
      });
      if (this.statusKey) this.setStatus(this.statusKey, this.statusTone);
    }
  }

  C4.UI = UI;
})(typeof window !== 'undefined' ? window : globalThis);
