/**
 * ai.js
 * Computer opponent: Minimax (negamax form) with Alpha-Beta pruning.
 *
 * Techniques used to make the search fast:
 *  1. Alpha-Beta pruning          skips branches that cannot change the result
 *  2. Move ordering (center first) makes pruning cut much earlier
 *  3. Iterative deepening         searches depth 1, 2, 3 ... inside a time budget
 *  4. Transposition table         remembers positions reached by another move order
 *     (positions are identified with Zobrist hashing)
 *
 * Public API:  C4.AI.chooseMove(board, levelName) -> { col, score, depth, nodes }
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});
  const { COLS, ROWS, CONNECT, LEVELS } = C4.CONFIG;

  const CELL_COUNT = COLS * ROWS;
  const WIN_SCORE = 1000000;
  const INFINITY_SCORE = WIN_SCORE * 10;
  const CENTER_COL = (COLS - 1) >> 1;

  // Transposition table entry types.
  const EXACT = 0, LOWER_BOUND = 1, UPPER_BOUND = 2;

  // Thrown internally when the time budget of a move is used up.
  const TIMEOUT = { timeout: true };

  const now = () =>
    (typeof performance !== 'undefined' ? performance.now() : Date.now());

  /* ---------- Precomputed tables (built once at load time) ---------- */

  // Columns ordered from the center outwards, plus the mirrored variant.
  // Alternating between the two keeps the AI from playing identical games.
  const ORDER_A = [];
  const ORDER_B = [];
  for (let i = 0; i < COLS; i++) {
    const offset = Math.ceil(i / 2) * (i % 2 === 0 ? 1 : -1);
    ORDER_A.push(CENTER_COL - offset);
    ORDER_B.push(CENTER_COL + offset);
  }

  // Every possible group of 4 aligned cells ("window") on the board: 69 in total.
  const WINDOWS = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const endRow = row + dr * (CONNECT - 1);
        const endCol = col + dc * (CONNECT - 1);
        if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue;
        const cellsInWindow = [];
        for (let k = 0; k < CONNECT; k++) {
          cellsInWindow.push((row + dr * k) * COLS + (col + dc * k));
        }
        WINDOWS.push(cellsInWindow);
      }
    }
  }

  // Zobrist keys: one random number per (player, cell).
  // Two tables give a 52 bit key, which still fits a JS number exactly.
  const ZOBRIST_HIGH = [null, new Uint32Array(CELL_COUNT), new Uint32Array(CELL_COUNT)];
  const ZOBRIST_LOW = [null, new Uint32Array(CELL_COUNT), new Uint32Array(CELL_COUNT)];
  for (let player = 1; player <= 2; player++) {
    for (let i = 0; i < CELL_COUNT; i++) {
      ZOBRIST_HIGH[player][i] = (Math.random() * 0x100000000) >>> 0;
      ZOBRIST_LOW[player][i] = (Math.random() * 0x100000) >>> 0;
    }
  }

  // Value of a window that holds N discs of one player and no enemy disc.
  const WINDOW_VALUE = [0, 1, 10, 50, 0];
  const CENTER_BONUS = 4;

  /* ---------- Static evaluation ---------- */

  /**
   * Scores a non terminal position from the point of view of `player`.
   * Positive = good for `player`. Only "open" windows count, because a
   * window that contains discs of both players can never become a line.
   */
  function evaluate(cells, player) {
    const opponent = 3 - player;
    let score = 0;

    for (let w = 0; w < WINDOWS.length; w++) {
      const win = WINDOWS[w];
      let mine = 0, theirs = 0;
      for (let k = 0; k < CONNECT; k++) {
        const value = cells[win[k]];
        if (value === player) mine++;
        else if (value === opponent) theirs++;
      }
      if (theirs === 0) score += WINDOW_VALUE[mine];
      else if (mine === 0) score -= WINDOW_VALUE[theirs];
    }

    // Discs in the center column take part in the most windows.
    for (let row = 0; row < ROWS; row++) {
      const value = cells[row * COLS + CENTER_COL];
      if (value === player) score += CENTER_BONUS;
      else if (value === opponent) score -= CENTER_BONUS;
    }
    return score;
  }

  /* ---------- Search ---------- */

  /**
   * Picks a move for the player to move on `liveBoard`.
   * @param {C4.Board} liveBoard  current game (it is NOT modified)
   * @param {'easy'|'medium'|'hard'} levelName
   * @param {object} [overrides]  optional level overrides, used by the tests
   */
  function chooseMove(liveBoard, levelName, overrides) {
    const level = Object.assign({}, LEVELS[levelName] || LEVELS.medium, overrides);
    const board = liveBoard.clone();
    const legalMoves = board.validMoves();
    if (legalMoves.length === 0) throw new Error('No legal move: board is full');

    // Easy level: sometimes play a random column on purpose.
    if (level.blunderRate > 0 && Math.random() < level.blunderRate) {
      const col = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return { col, score: 0, depth: 0, nodes: 0 };
    }

    const order = Math.random() < 0.5 ? ORDER_A : ORDER_B;
    const table = new Map(); // transposition table, fresh for every move
    const deadline = now() + level.timeLimitMs;
    let nodes = 0;

    // Hash of the current position, kept up to date move by move.
    let hashHigh = 0, hashLow = 0;
    for (let i = 0; i < CELL_COUNT; i++) {
      const owner = board.cells[i];
      if (owner !== 0) {
        hashHigh ^= ZOBRIST_HIGH[owner][i];
        hashLow ^= ZOBRIST_LOW[owner][i];
      }
    }

    /**
     * Negamax with Alpha-Beta. Returns the score for the side to move.
     * `ply` = number of moves already made below the root; wins found
     * sooner get a higher score, so the AI wins fast and loses slow.
     */
    function negamax(depth, alpha, beta, ply) {
      if ((++nodes & 2047) === 0 && now() > deadline) throw TIMEOUT;
      if (board.isFull()) return 0; // draw
      if (depth === 0) return evaluate(board.cells, board.currentPlayer);

      const alphaAtEntry = alpha;
      const key = hashHigh * 0x100000 + hashLow;
      const cached = table.get(key);
      let preferredMove = -1;

      if (cached !== undefined) {
        preferredMove = cached.move;
        if (cached.depth >= depth) {
          if (cached.flag === EXACT) return cached.score;
          if (cached.flag === LOWER_BOUND) { if (cached.score > alpha) alpha = cached.score; }
          else if (cached.score < beta) beta = cached.score;
          if (alpha >= beta) return cached.score;
        }
      }

      const player = board.currentPlayer;
      let bestScore = -INFINITY_SCORE;
      let bestMove = -1;

      // i = -1 tries the move remembered from a previous search first.
      for (let i = -1; i < COLS; i++) {
        const col = i === -1 ? preferredMove : order[i];
        if (col < 0 || (i >= 0 && col === preferredMove) || !board.canPlay(col)) continue;

        const row = board.play(col);
        const index = row * COLS + col;
        hashHigh ^= ZOBRIST_HIGH[player][index];
        hashLow ^= ZOBRIST_LOW[player][index];

        let score;
        try {
          score = board.hasWinAt(row, col)
            ? WIN_SCORE - (ply + 1)
            : -negamax(depth - 1, -beta, -alpha, ply + 1);
        } finally {
          // Always restore the position, even when the search times out.
          board.undo();
          hashHigh ^= ZOBRIST_HIGH[player][index];
          hashLow ^= ZOBRIST_LOW[player][index];
        }

        if (score > bestScore) { bestScore = score; bestMove = col; }
        if (score > alpha) alpha = score;
        if (alpha >= beta) break; // the opponent will never allow this branch
      }

      const flag = bestScore <= alphaAtEntry ? UPPER_BOUND
                 : bestScore >= beta ? LOWER_BOUND
                 : EXACT;
      table.set(key, { depth, score: bestScore, flag, move: bestMove });
      return bestScore;
    }

    // Iterative deepening: each finished depth gives a usable answer, and
    // its best move is searched first on the next, deeper pass.
    let best = { col: order.find((col) => board.canPlay(col)), score: 0, depth: 0 };
    const maxDepth = Math.min(level.maxDepth, CELL_COUNT - board.moveCount);

    for (let depth = 1; depth <= maxDepth; depth++) {
      try {
        const score = negamax(depth, -INFINITY_SCORE, INFINITY_SCORE, 0);
        const rootKey = hashHigh * 0x100000 + hashLow;
        best = { col: table.get(rootKey).move, score, depth };
      } catch (error) {
        if (error !== TIMEOUT) throw error;
        break; // out of time: keep the result of the last finished depth
      }
      // A forced win or loss was found: searching deeper cannot change it.
      if (Math.abs(best.score) >= WIN_SCORE - CELL_COUNT) break;
    }

    return { col: best.col, score: best.score, depth: best.depth, nodes };
  }

  C4.AI = { chooseMove, evaluate, WIN_SCORE };
})(typeof window !== 'undefined' ? window : globalThis);
