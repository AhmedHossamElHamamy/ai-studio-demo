/**
 * Automated tests for the game rules and the AI.
 * Run with:  node tests/run-tests.js
 */
'use strict';
require('../js/config.js');
require('../js/board.js');
require('../js/ai.js');
const { Board, AI, CONFIG } = globalThis.C4;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok    ${name}`); }
  catch (error) { failed++; console.log(`  FAIL  ${name}\n        ${error.message}`); }
}
function assert(condition, message) { if (!condition) throw new Error(message || 'assertion failed'); }

/** Plays a list of columns and returns the board plus the last cell. */
function playAll(columns, first = 1) {
  const board = new Board(first);
  let last = null;
  for (const col of columns) last = { row: board.play(col), col };
  return { board, last };
}

/** Plays a full game between two move pickers. Returns 1, 2 or 0 (draw). */
function playGame(pickers, first) {
  const board = new Board(first);
  while (true) {
    const player = board.currentPlayer;
    const col = pickers[player](board);
    assert(board.canPlay(col), `player ${player} chose illegal column ${col}`);
    const row = board.play(col);
    if (board.hasWinAt(row, col)) return player;
    if (board.isFull()) return 0;
  }
}
const randomPicker = (board) => {
  const moves = board.validMoves();
  return moves[Math.floor(Math.random() * moves.length)];
};
const aiPicker = (level, overrides) => (board) => AI.chooseMove(board, level, overrides).col;

console.log('\nRules');
test('new board is empty and player 1 starts', () => {
  const board = new Board();
  assert(board.moveCount === 0 && board.currentPlayer === 1 && board.validMoves().length === 7);
});
test('discs stack from the bottom and turns alternate', () => {
  const board = new Board();
  assert(board.play(3) === 0); assert(board.currentPlayer === 2);
  assert(board.play(3) === 1); assert(board.currentPlayer === 1);
});
test('the chosen first player is respected', () => {
  assert(new Board(2).currentPlayer === 2);
});
test('a full column rejects more discs', () => {
  const { board } = playAll([0, 0, 0, 0, 0, 0]);
  assert(!board.canPlay(0)); assert(!board.validMoves().includes(0));
  let threw = false; try { board.play(0); } catch (e) { threw = true; }
  assert(threw, 'play() must throw on a full column');
});
test('horizontal win', () => {
  const { board, last } = playAll([0, 0, 1, 1, 2, 2, 3]);
  assert(board.hasWinAt(last.row, last.col));
  assert(board.findWinningLine(last.row, last.col).length === 4);
});
test('vertical win', () => {
  const { board, last } = playAll([0, 1, 0, 1, 0, 1, 0]);
  assert(board.hasWinAt(last.row, last.col));
});
test('diagonal win rising to the right', () => {
  const { board, last } = playAll([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);
  assert(board.hasWinAt(last.row, last.col));
  const line = board.findWinningLine(last.row, last.col);
  assert(line.every((cell, i) => cell.row === i && cell.col === i), 'cells should be (0,0)..(3,3)');
});
test('diagonal win rising to the left', () => {
  const { board, last } = playAll([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3]);
  assert(board.hasWinAt(last.row, last.col));
});
test('win detected when the last disc lands in the middle of the line', () => {
  const { board, last } = playAll([0, 0, 1, 1, 3, 3, 2]);
  assert(board.hasWinAt(last.row, last.col));
});
test('three in a row is not a win', () => {
  const { board, last } = playAll([0, 0, 1, 1, 2]);
  assert(!board.hasWinAt(last.row, last.col) && board.findWinningLine(last.row, last.col) === null);
});
test('a full board without a line is a draw', () => {
  // Column pattern that fills the grid with no four in a row.
  const order = [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 2, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3, 2,
                 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 6, 6, 6, 6, 6, 6];
  const board = new Board();
  for (const col of order) {
    const row = board.play(col);
    assert(!board.hasWinAt(row, col), `unexpected win at column ${col}`);
  }
  assert(board.isFull() && board.validMoves().length === 0);
});
test('undo restores the previous position', () => {
  const { board } = playAll([3, 3, 4]);
  const cleared = board.undo();
  assert(cleared.row === 0 && cleared.col === 4);
  assert(board.moveCount === 2 && board.currentPlayer === 1 && board.heights[4] === 0);
  assert(new Board().undo() === null);
});
test('clone is independent', () => {
  const { board } = playAll([3]);
  const copy = board.clone(); copy.play(3);
  assert(board.moveCount === 1 && copy.moveCount === 2);
});

console.log('\nAI');
for (const level of ['medium', 'hard']) {
  test(`${level}: takes an immediate win`, () => {
    const { board } = playAll([0, 6, 1, 6, 2, 5]); // player 1 can win at column 3
    assert(AI.chooseMove(board, level).col === 3);
  });
  test(`${level}: blocks an immediate threat`, () => {
    const { board } = playAll([0, 6, 1, 6, 2]); // player 2 must block column 3
    assert(AI.chooseMove(board, level).col === 3);
  });
  test(`${level}: blocks a vertical threat`, () => {
    const { board } = playAll([2, 5, 2, 6, 2]);
    assert(AI.chooseMove(board, level).col === 2);
  });
  test(`${level}: prefers winning over blocking`, () => {
    const { board } = playAll([0, 6, 0, 6, 0, 6]); // both have three; player 1 to move
    assert(AI.chooseMove(board, level).col === 0);
  });
}
test('hard: opens in the center column', () => {
  assert(AI.chooseMove(new Board(), 'hard', { timeLimitMs: 300 }).col === 3);
});
test('hard: finds a forced win two moves ahead (double threat)', () => {
  // Player 1 has discs on columns 2 and 3 of the bottom row with both sides open.
  const { board } = playAll([2, 2, 3, 3]);
  const col = AI.chooseMove(board, 'hard', { timeLimitMs: 500 }).col;
  assert(col === 1 || col === 4, `expected 1 or 4, got ${col}`);
});
test('hard: respects its time budget', () => {
  const { board } = playAll([3, 3, 2, 4]);
  const start = Date.now();
  AI.chooseMove(board, 'hard');
  const elapsed = Date.now() - start;
  assert(elapsed < CONFIG.LEVELS.hard.timeLimitMs + 250, `took ${elapsed} ms`);
});
test('AI does not modify the live board', () => {
  const { board } = playAll([3, 2, 4]);
  const before = Array.from(board.cells).join('');
  AI.chooseMove(board, 'hard', { timeLimitMs: 200 });
  assert(Array.from(board.cells).join('') === before && board.moveCount === 3);
});
test('every level always returns a legal move (60 random positions)', () => {
  for (let i = 0; i < 60; i++) {
    const board = new Board(1 + (i % 2));
    const moves = Math.floor(Math.random() * 38);
    for (let m = 0; m < moves; m++) {
      const col = randomPicker(board);
      const row = board.play(col);
      if (board.hasWinAt(row, col)) { board.undo(); break; }
    }
    if (board.isFull()) continue;
    for (const level of ['easy', 'medium', 'hard']) {
      const col = AI.chooseMove(board, level, { timeLimitMs: 40 }).col;
      assert(board.canPlay(col), `${level} chose illegal column ${col}`);
    }
  }
});

console.log('\nStrength (full games)');
test('hard never loses to a random player (30 games)', () => {
  let wins = 0;
  for (let i = 0; i < 30; i++) {
    const result = playGame({ 1: aiPicker('hard', { timeLimitMs: 60 }), 2: randomPicker }, 1 + (i % 2));
    assert(result !== 2, 'hard lost to random play');
    if (result === 1) wins++;
  }
  console.log(`        hard won ${wins}/30`);
  assert(wins >= 29);
});
test('medium beats a random player (30 games)', () => {
  let wins = 0;
  for (let i = 0; i < 30; i++) {
    if (playGame({ 1: aiPicker('medium'), 2: randomPicker }, 1 + (i % 2)) === 1) wins++;
  }
  console.log(`        medium won ${wins}/30`);
  assert(wins >= 27);
});
test('difficulty order holds: hard > medium > easy (20 games each)', () => {
  let hardOverMedium = 0, mediumOverEasy = 0;
  for (let i = 0; i < 20; i++) {
    const first = 1 + (i % 2);
    const a = playGame({ 1: aiPicker('hard', { timeLimitMs: 120 }), 2: aiPicker('medium') }, first);
    if (a === 1) hardOverMedium++; else if (a === 2) hardOverMedium--;
    const b = playGame({ 1: aiPicker('medium'), 2: aiPicker('easy') }, first);
    if (b === 1) mediumOverEasy++; else if (b === 2) mediumOverEasy--;
  }
  console.log(`        net wins: hard vs medium ${hardOverMedium}, medium vs easy ${mediumOverEasy}`);
  assert(hardOverMedium > 0 && mediumOverEasy > 0);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
