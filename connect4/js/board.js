/**
 * board.js
 * Pure game rules. No DOM, no AI: this file only knows the grid.
 *
 * Cell layout: index = row * COLS + col, where row 0 is the BOTTOM row.
 * Cell values: 0 = empty, 1 or 2 = the player who owns the disc.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});
  const { COLS, ROWS, CONNECT } = C4.CONFIG;

  // The four line directions as [rowStep, colStep].
  const DIRECTIONS = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal rising to the right
    [1, -1], // diagonal rising to the left
  ];

  class Board {
    /** @param {1|2} firstPlayer the player who makes the first move */
    constructor(firstPlayer = 1) {
      this.cells = new Int8Array(COLS * ROWS);
      this.heights = new Int8Array(COLS); // discs currently in each column
      this.history = [];                  // columns played, in order
      this.firstPlayer = firstPlayer;
    }

    /** Player whose turn it is. */
    get currentPlayer() {
      const firstToMove = this.history.length % 2 === 0;
      return firstToMove ? this.firstPlayer : 3 - this.firstPlayer;
    }

    get moveCount() {
      return this.history.length;
    }

    canPlay(col) {
      return col >= 0 && col < COLS && this.heights[col] < ROWS;
    }

    isFull() {
      return this.history.length === COLS * ROWS;
    }

    /** Columns that still accept a disc. */
    validMoves() {
      const moves = [];
      for (let col = 0; col < COLS; col++) {
        if (this.heights[col] < ROWS) moves.push(col);
      }
      return moves;
    }

    /**
     * Drops a disc of the current player into a column.
     * @returns {number} the row where the disc landed
     */
    play(col) {
      if (!this.canPlay(col)) throw new Error(`Illegal move: column ${col}`);
      const row = this.heights[col];
      this.cells[row * COLS + col] = this.currentPlayer;
      this.heights[col]++;
      this.history.push(col);
      return row;
    }

    /**
     * Takes back the last move.
     * @returns {{row:number, col:number}|null} the cell that was cleared
     */
    undo() {
      if (this.history.length === 0) return null;
      const col = this.history.pop();
      const row = --this.heights[col];
      this.cells[row * COLS + col] = 0;
      return { row, col };
    }

    /** Fast check used by the AI: does the disc at (row, col) complete a line? */
    hasWinAt(row, col) {
      const cells = this.cells;
      const player = cells[row * COLS + col];
      if (player === 0) return false;

      for (let d = 0; d < 4; d++) {
        const dr = DIRECTIONS[d][0];
        const dc = DIRECTIONS[d][1];
        let count = 1;

        // Walk forward, then backward, counting discs of the same player.
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[r * COLS + c] === player) {
          count++; r += dr; c += dc;
        }
        r = row - dr; c = col - dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[r * COLS + c] === player) {
          count++; r -= dr; c -= dc;
        }
        if (count >= CONNECT) return true;
      }
      return false;
    }

    /**
     * Returns the full winning line through (row, col) for the UI,
     * ordered from one end to the other, or null when there is none.
     * @returns {Array<{row:number, col:number}>|null}
     */
    findWinningLine(row, col) {
      const cells = this.cells;
      const player = cells[row * COLS + col];
      if (player === 0) return null;

      for (const [dr, dc] of DIRECTIONS) {
        const line = [{ row, col }];
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[r * COLS + c] === player) {
          line.push({ row: r, col: c }); r += dr; c += dc;
        }
        r = row - dr; c = col - dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[r * COLS + c] === player) {
          line.unshift({ row: r, col: c }); r -= dr; c -= dc;
        }
        if (line.length >= CONNECT) return line;
      }
      return null;
    }

    /** Independent copy, so the AI can search without touching the live game. */
    clone() {
      const copy = new Board(this.firstPlayer);
      copy.cells.set(this.cells);
      copy.heights.set(this.heights);
      copy.history = this.history.slice();
      return copy;
    }
  }

  C4.Board = Board;
})(typeof window !== 'undefined' ? window : globalThis);
