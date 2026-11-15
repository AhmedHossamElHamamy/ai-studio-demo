/**
 * i18n.js
 * All user facing text, in Arabic and English.
 * To add a language: add one more object with the same keys.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});

  const STRINGS = {
    ar: {
      dir: 'rtl',
      switchTo: 'EN',
      you: 'أنت',
      computer: 'الكمبيوتر',
      draws: 'تعادل',
      difficulty: 'مستوى الصعوبة',
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      firstMove: 'من يبدأ',
      newGame: 'لعبة جديدة',
      undo: 'تراجع',
      hint: 'اضغط على العمود لإسقاط القطعة، أو استخدم الأرقام من 1 إلى 7 والأسهم من لوحة المفاتيح',
      yourTurn: 'دورك، اختر عموداً',
      thinking: 'الكمبيوتر يفكر',
      youWin: 'مبروك، لقد فزت!',
      aiWins: 'فاز الكمبيوتر، حاول مرة أخرى',
      draw: 'تعادل، اللوحة امتلأت',
      column: 'العمود',
      sound: 'الصوت',
      language: 'تغيير اللغة',
    },
    en: {
      dir: 'ltr',
      switchTo: 'ع',
      you: 'You',
      computer: 'Computer',
      draws: 'Draws',
      difficulty: 'Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      firstMove: 'First move',
      newGame: 'New game',
      undo: 'Undo',
      hint: 'Click a column to drop a disc, or use keys 1 to 7 and the arrow keys',
      yourTurn: 'Your turn, pick a column',
      thinking: 'Computer is thinking',
      youWin: 'You win!',
      aiWins: 'Computer wins, try again',
      draw: 'Draw, the board is full',
      column: 'Column',
      sound: 'Sound',
      language: 'Change language',
    },
  };

  let current = 'ar';

  C4.I18n = {
    get lang() { return current; },
    setLang(lang) { if (STRINGS[lang]) current = lang; },
    /** Translates a key in the current language. */
    t(key) { return STRINGS[current][key] ?? key; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
