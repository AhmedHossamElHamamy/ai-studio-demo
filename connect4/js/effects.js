/**
 * effects.js
 * Confetti burst shown when the player wins. Drawn on a full screen canvas.
 */
(function (global) {
  'use strict';
  const C4 = (global.C4 = global.C4 || {});

  const COLORS = ['#ff4d6d', '#ffc83d', '#4a6bff', '#7dffb0', '#ffffff'];
  const PIECES = 140;
  const DURATION_MS = 2800;

  let frameId = 0;

  function stop(canvas) {
    cancelAnimationFrame(frameId);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  function burst(canvas) {
    if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop(canvas);

    const ratio = global.devicePixelRatio || 1;
    const width = (canvas.width = global.innerWidth * ratio);
    const height = (canvas.height = global.innerHeight * ratio);
    const ctx = canvas.getContext('2d');

    // Every piece starts near the top center and flies outwards.
    const pieces = Array.from({ length: PIECES }, () => ({
      x: width / 2 + (Math.random() - 0.5) * width * 0.3,
      y: height * 0.25,
      vx: (Math.random() - 0.5) * 14 * ratio,
      vy: (Math.random() * -12 - 4) * ratio,
      size: (5 + Math.random() * 6) * ratio,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
    }));

    const startedAt = performance.now();
    function frame(time) {
      const progress = (time - startedAt) / DURATION_MS;
      ctx.clearRect(0, 0, width, height);
      if (progress >= 1) return;

      ctx.globalAlpha = Math.min(1, (1 - progress) * 2); // fade out at the end
      for (const p of pieces) {
        p.vy += 0.35 * ratio; // gravity
        p.vx *= 0.99;         // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
  }

  C4.Effects = { burst, stop };
})(typeof window !== 'undefined' ? window : globalThis);
