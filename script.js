/* ═══════════════════════════════════════════════════════════════════
   NOUR & OMAR — 1ST ANNIVERSARY WEBSITE
   script.js  ·  Vanilla JavaScript — No external libraries
   ═══════════════════════════════════════════════════════════════════

   TABLE OF CONTENTS
   ─────────────────
   01. Wedding Date Counter (live "time elapsed" clock)
   02. Card Flip Logic    (3D flip on click / tap / keyboard)
   03. Floating Particles (ambient background atmosphere)
   04. Mini-Game: "Catch Omar's Heart"
       4a. Constants & Game-State
       4b. Asset / Sprite Definitions
       4c. Basket (player)
       4d. Falling Items
       4e. Particle Effects (in-game)
       4f. Draw Functions
       4g. Game Loop
       4h. Input Handling (keyboard + touch)
       4i. Overlay / HUD helpers
       4j. Win Modal & Canvas Confetti
       4k. Bootstrap
   ═══════════════════════════════════════════════════════════════════ */

'use strict';


/* ══════════════════════════════════════════════════════════════════
   01 · WEDDING DATE COUNTER
   ══════════════════════════════════════════════════════════════════
   ✏️  CUSTOMISE: Change WEDDING_DATE to your real wedding date/time.
   Format: new Date(YYYY, Month[0-indexed], Day, Hour, Minute, Second)
   ══════════════════════════════════════════════════════════════════ */

const WEDDING_DATE = new Date(2025, 5, 15, 18, 0, 0); // June 15 2025 at 18:00

/**
 * Calculates the elapsed time between WEDDING_DATE and now,
 * broken down into months, days, hours, minutes, seconds.
 * Months are calculated as whole calendar months elapsed.
 */
function getElapsedTime() {
  const now   = new Date();
  const start = new Date(WEDDING_DATE);

  let months  = (now.getFullYear()  - start.getFullYear()) * 12
               + (now.getMonth()    - start.getMonth());

  // Build the date that is exactly `months` months after start
  const afterMonths = new Date(start);
  afterMonths.setMonth(afterMonths.getMonth() + months);

  // If we haven't quite reached that day-of-month yet this month, step back one
  if (afterMonths > now) {
    months -= 1;
    afterMonths.setMonth(afterMonths.getMonth() - 1);
  }

  // Remaining milliseconds after whole months are subtracted
  let remaining = now - afterMonths; // ms

  const MS_IN_DAY    = 1000 * 60 * 60 * 24;
  const MS_IN_HOUR   = 1000 * 60 * 60;
  const MS_IN_MINUTE = 1000 * 60;
  const MS_IN_SECOND = 1000;

  const days    = Math.floor(remaining / MS_IN_DAY);    remaining %= MS_IN_DAY;
  const hours   = Math.floor(remaining / MS_IN_HOUR);   remaining %= MS_IN_HOUR;
  const minutes = Math.floor(remaining / MS_IN_MINUTE); remaining %= MS_IN_MINUTE;
  const seconds = Math.floor(remaining / MS_IN_SECOND);

  return { months, days, hours, minutes, seconds };
}

/** Pads a number to at least 2 digits. */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Applies a brief CSS "tick" animation class to trigger the pop effect. */
function animateTick(el) {
  el.classList.remove('tick');
  // Force reflow so removing and re-adding the class works
  void el.offsetWidth;
  el.classList.add('tick');
}

/**
 * Updates the on-page counter elements and schedules itself
 * to run again after ~1 second.
 */
function startWeddingCounter() {
  const elMonths  = document.getElementById('cnt-months');
  const elDays    = document.getElementById('cnt-days');
  const elHours   = document.getElementById('cnt-hours');
  const elMinutes = document.getElementById('cnt-minutes');
  const elSeconds = document.getElementById('cnt-seconds');

  // Guard: counter elements must exist
  if (!elSeconds) return;

  let prevSeconds = null;

  function tick() {
    const t = getElapsedTime();

    // Only animate the seconds element every tick, others only when changed
    if (prevSeconds !== t.seconds) {
      elSeconds.textContent = pad(t.seconds);
      animateTick(elSeconds);
      prevSeconds = t.seconds;
    }

    elMonths.textContent  = pad(t.months);
    elDays.textContent    = pad(t.days);
    elHours.textContent   = pad(t.hours);
    elMinutes.textContent = pad(t.minutes);

    setTimeout(tick, 1000);
  }

  tick();
}


/* ══════════════════════════════════════════════════════════════════
   02 · CARD FLIP LOGIC
   ══════════════════════════════════════════════════════════════════ */

function initCardFlips() {
  const cards = document.querySelectorAll('.flip-card');

  cards.forEach(card => {
    // Mouse / touch click
    card.addEventListener('click', () => toggleCard(card));

    // Keyboard accessibility — flip on Enter or Space
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
}

function toggleCard(card) {
  card.classList.toggle('is-flipped');
  // Update aria so screen readers know the card has been revealed
  const isFlipped = card.classList.contains('is-flipped');
  card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
}


/* ══════════════════════════════════════════════════════════════════
   03 · FLOATING PARTICLES (ambient background atmosphere)
   ══════════════════════════════════════════════════════════════════
   Spawns emoji particles in the fixed #particles-container.
   They drift upwards via CSS @keyframes float-up.
   ══════════════════════════════════════════════════════════════════ */

const PARTICLE_SYMBOLS = ['✨', '💛', '❤️', '⭐', '🌟', '💍', '◆'];

function spawnParticle() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const p = document.createElement('span');
  p.className      = 'particle';
  p.textContent    = PARTICLE_SYMBOLS[Math.floor(Math.random() * PARTICLE_SYMBOLS.length)];
  p.style.left     = `${Math.random() * 100}%`;
  p.style.fontSize = `${0.7 + Math.random() * 0.8}rem`;

  const duration = 12 + Math.random() * 16; // 12–28 s
  const delay    = Math.random() * 4;        // 0–4 s stagger
  p.style.animationDuration = `${duration}s`;
  p.style.animationDelay    = `${delay}s`;

  container.appendChild(p);

  // Remove from DOM after animation completes to avoid memory leaks
  setTimeout(() => p.remove(), (duration + delay) * 1000);
}

function startParticles() {
  // Initial burst
  for (let i = 0; i < 18; i++) spawnParticle();

  // Continuous trickle
  setInterval(spawnParticle, 2200);
}


/* ══════════════════════════════════════════════════════════════════
   04 · MINI-GAME: "CATCH OMAR'S HEART"
   ══════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────
   4a · CONSTANTS & GAME STATE
   ──────────────────────────────────────────────────────────────── */

const CANVAS_W     = 480;
const CANVAS_H     = 520;
const WIN_SCORE    = 150;   // ✏️  CUSTOMISE: points needed to trigger the win modal
const BASKET_W     = 68;
const BASKET_H     = 44;
const BASKET_SPEED = 6;     // pixels per frame (desktop keyboard speed)

/** All item type definitions — emoji, points value, is it harmful */
const ITEM_TYPES = [
  { emoji: '❤️',  points: +10, label: 'Heart',       harmful: false },
  { emoji: '🍲',  points: +20, label: 'Koshary',     harmful: false },
  { emoji: '🍵',  points: +15, label: 'Mint Tea',    harmful: false },
  { emoji: '🚧',  points: -15, label: 'Traffic Sign', harmful: true },
];

/** Weights for random item selection (higher = more frequent). */
const ITEM_WEIGHTS = [40, 20, 20, 20]; // hearts more common

/** Game state object — reset on every new game. */
let G = {};

function freshGameState() {
  return {
    running:     false,
    over:        false,
    score:       0,
    highScore:   G.highScore || 0,
    level:       1,
    frame:       0,
    basket:      { x: CANVAS_W / 2 - BASKET_W / 2, y: CANVAS_H - BASKET_H - 12 },
    items:       [],    // falling objects
    particles:   [],    // visual pop particles
    keys:        { left: false, right: false },
    touchLeft:   false,
    touchRight:  false,
    won:         false,
  };
}


/* ────────────────────────────────────────────────────────────────
   4b · WEIGHTED RANDOM ITEM PICKER
   ──────────────────────────────────────────────────────────────── */

function pickItemType() {
  const totalWeight = ITEM_WEIGHTS.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < ITEM_TYPES.length; i++) {
    rand -= ITEM_WEIGHTS[i];
    if (rand <= 0) return ITEM_TYPES[i];
  }
  return ITEM_TYPES[0];
}


/* ────────────────────────────────────────────────────────────────
   4c · BASKET (player character)
   ──────────────────────────────────────────────────────────────── */

function updateBasket() {
  const b = G.basket;
  const moving = G.keys.left || G.keys.right || G.touchLeft || G.touchRight;
  if (!moving) return;

  if (G.keys.left  || G.touchLeft)  b.x -= BASKET_SPEED;
  if (G.keys.right || G.touchRight) b.x += BASKET_SPEED;

  // Clamp to canvas width
  b.x = Math.max(0, Math.min(CANVAS_W - BASKET_W, b.x));
}

function drawBasket(ctx) {
  const b = G.basket;
  const cx = b.x + BASKET_W / 2;
  const cy = b.y + BASKET_H / 2;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(212,175,55,0.5)';
  ctx.shadowBlur  = 18;

  // Basket body — rounded trapezoid using path
  ctx.fillStyle = 'rgba(26,35,85,0.85)';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(b.x + 6,            b.y);
  ctx.lineTo(b.x + BASKET_W - 6, b.y);
  ctx.lineTo(b.x + BASKET_W,     b.y + BASKET_H);
  ctx.lineTo(b.x,                 b.y + BASKET_H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rim highlight
  ctx.strokeStyle = '#F0D060';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + 4, b.y + 3);
  ctx.lineTo(b.x + BASKET_W - 4, b.y + 3);
  ctx.stroke();

  // Heart label on the basket
  ctx.shadowBlur = 0;
  ctx.font = '20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💛', cx, cy + 2);

  ctx.restore();
}


/* ────────────────────────────────────────────────────────────────
   4d · FALLING ITEMS
   ──────────────────────────────────────────────────────────────── */

/** Spawn rate decreases (more items) as level increases. */
function spawnInterval() {
  return Math.max(28, 58 - G.level * 6);
}

/** Fall speed increases with level. */
function itemFallSpeed() {
  return 2.2 + G.level * 0.55 + Math.random() * 1.2;
}

function spawnItem() {
  const type = pickItemType();
  const size = 34;
  G.items.push({
    type,
    x:     Math.random() * (CANVAS_W - size),
    y:     -size - Math.random() * 40,
    size,
    speed: itemFallSpeed(),
    wobble: Math.random() * Math.PI * 2, // phase for horizontal drift
    wobbleAmp: type.harmful ? 0 : (0.3 + Math.random() * 0.7),
  });
}

function updateItems() {
  for (let i = G.items.length - 1; i >= 0; i--) {
    const item = G.items[i];

    // Gentle sine-wave drift (not for obstacles)
    item.y += item.speed;
    item.x += Math.sin(item.wobble + G.frame * 0.035) * item.wobbleAmp;

    // ── Collision with basket ──
    const b = G.basket;
    if (
      item.y + item.size > b.y &&
      item.y < b.y + BASKET_H &&
      item.x + item.size > b.x + 4 &&
      item.x < b.x + BASKET_W - 4
    ) {
      catchItem(item, i);
      continue;
    }

    // Remove items that fall off the bottom
    if (item.y > CANVAS_H + 10) {
      G.items.splice(i, 1);
    }
  }
}

function catchItem(item, index) {
  const delta = item.type.points;

  // Update score (floor at 0 so it can't go negative)
  G.score = Math.max(0, G.score + delta);
  updateHUD();

  // Spawn a visual pop particle at the catch point
  spawnPopParticle(
    item.x + item.size / 2,
    item.y,
    item.type.emoji,
    delta > 0 ? '#D4AF37' : '#e05555',
    delta
  );

  G.items.splice(index, 1);

  // Check win condition
  if (!G.won && G.score >= WIN_SCORE) {
    triggerWin();
  }
}

function drawItems(ctx) {
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const item of G.items) {
    ctx.save();
    // Slight rotation on harmful items for visual flair
    if (item.type.harmful) {
      const angle = Math.sin(G.frame * 0.04 + item.wobble) * 0.18;
      ctx.translate(item.x + item.size / 2, item.y + item.size / 2);
      ctx.rotate(angle);
      ctx.fillText(item.type.emoji, 0, 0);
    } else {
      ctx.fillText(item.type.emoji, item.x + item.size / 2, item.y + item.size / 2);
    }
    ctx.restore();
  }
}


/* ────────────────────────────────────────────────────────────────
   4e · POP PARTICLES (in-game visual feedback)
   ──────────────────────────────────────────────────────────────── */

function spawnPopParticle(x, y, emoji, colour, delta) {
  const label = (delta > 0 ? '+' : '') + delta;
  G.particles.push({
    x, y,
    emoji,
    label,
    colour,
    vy:    -2.5,
    life:  1.0,    // 1.0 → 0.0 (alpha)
    decay: 0.028,
  });
}

function updateParticles() {
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const p = G.particles[i];
    p.y    += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) G.particles.splice(i, 1);
  }
}

function drawParticles(ctx) {
  for (const p of G.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);

    // Emoji
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, p.x, p.y);

    // Score delta label
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.fillStyle = p.colour;
    ctx.fillText(p.label, p.x + 18, p.y - 8);

    ctx.restore();
  }
}


/* ────────────────────────────────────────────────────────────────
   4f · BACKGROUND DRAW (starry night Egyptian skyline feel)
   ──────────────────────────────────────────────────────────────── */

// Pre-calculate star positions (stable across frames)
const STARS = Array.from({ length: 60 }, () => ({
  x:    Math.random() * CANVAS_W,
  y:    Math.random() * CANVAS_H * 0.7,
  r:    0.5 + Math.random() * 1.2,
  a:    0.3 + Math.random() * 0.7,
  phase: Math.random() * Math.PI * 2,
}));

function drawBackground(ctx, frame) {
  // Gradient sky
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0,   '#07091A');
  sky.addColorStop(0.6, '#0D1628');
  sky.addColorStop(1,   '#0B0E1A');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Twinkling stars
  for (const s of STARS) {
    const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.03 + s.phase);
    ctx.save();
    ctx.globalAlpha = s.a * twinkle;
    ctx.fillStyle = '#F5EDD8';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Ground bar
  ctx.fillStyle = 'rgba(26,35,85,0.6)';
  ctx.fillRect(0, CANVAS_H - 8, CANVAS_W, 8);

  // Subtle gold ground glow
  const glow = ctx.createLinearGradient(0, CANVAS_H - 40, 0, CANVAS_H);
  glow.addColorStop(0, 'transparent');
  glow.addColorStop(1, 'rgba(212,175,55,0.06)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
}

/** Draws the score progress bar at the bottom of the canvas. */
function drawProgressBar(ctx) {
  const BAR_H  = 4;
  const BAR_Y  = CANVAS_H - BAR_H;
  const filled = Math.min(1, G.score / WIN_SCORE);

  // Track
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, BAR_Y, CANVAS_W, BAR_H);

  // Fill
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W * filled, 0);
  grad.addColorStop(0,   '#A07C20');
  grad.addColorStop(0.5, '#D4AF37');
  grad.addColorStop(1,   '#F0D060');
  ctx.fillStyle = grad;
  ctx.fillRect(0, BAR_Y, CANVAS_W * filled, BAR_H);
}


/* ────────────────────────────────────────────────────────────────
   4g · GAME LOOP
   ──────────────────────────────────────────────────────────────── */

let gameRAF   = null; // requestAnimationFrame handle
let gameCanvas, gameCtx;

function gameLoop() {
  if (!G.running) return;

  G.frame++;

  // ── Update ──────────────────────────────────────────────
  updateBasket();

  if (G.frame % spawnInterval() === 0) spawnItem();

  updateItems();
  updateParticles();

  // Level up every 40 points
  const newLevel = Math.floor(G.score / 40) + 1;
  if (newLevel !== G.level) {
    G.level = newLevel;
    document.getElementById('game-level').textContent = G.level;
  }

  // ── Draw ───────────────────────────────────────────────
  drawBackground(gameCtx, G.frame);
  drawItems(gameCtx);
  drawBasket(gameCtx);
  drawParticles(gameCtx);
  drawProgressBar(gameCtx);

  gameRAF = requestAnimationFrame(gameLoop);
}

function startGame() {
  G = freshGameState();
  G.running    = true;
  G.highScore  = parseInt(document.getElementById('game-high-score').textContent) || 0;

  // Attach key state (they persist across calls via closure — reset here)
  G.keys = { left: false, right: false };

  updateHUD();
  hideOverlay();

  if (gameRAF) cancelAnimationFrame(gameRAF);
  gameRAF = requestAnimationFrame(gameLoop);
}

function endGame(won) {
  G.running = false;
  if (gameRAF) cancelAnimationFrame(gameRAF);

  // Update high score
  if (G.score > G.highScore) {
    G.highScore = G.score;
    document.getElementById('game-high-score').textContent = G.highScore;
  }

  if (won) {
    showWinModal();
    return;
  }

  // Show game-over overlay
  showOverlay(
    '💔',
    'Game Over!',
    `You scored <strong>${G.score}</strong> points.<br/>Reach ${WIN_SCORE} to unlock a surprise!`,
    'Try Again'
  );
}

function triggerWin() {
  G.won    = true;
  G.running = false;
  if (gameRAF) cancelAnimationFrame(gameRAF);

  // Update high score
  if (G.score > G.highScore) {
    G.highScore = G.score;
    document.getElementById('game-high-score').textContent = G.highScore;
  }

  showWinModal();
}


/* ────────────────────────────────────────────────────────────────
   4h · INPUT HANDLING
   ──────────────────────────────────────────────────────────────── */

function initGameInput() {
  // ── Keyboard ──────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (!G.running) return;
    if (e.key === 'ArrowLeft'  || e.key === 'a') G.keys.left  = true;
    if (e.key === 'ArrowRight' || e.key === 'd') G.keys.right = true;
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') { if (G.keys) G.keys.left  = false; }
    if (e.key === 'ArrowRight' || e.key === 'd') { if (G.keys) G.keys.right = false; }
  });

  // ── On-screen touch buttons ────────────────────────────────
  const btnLeft  = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');

  function touchStart(dir) {
    if (!G.running) return;
    if (dir === 'left')  { G.touchLeft  = true; btnLeft.classList.add('pressed'); }
    if (dir === 'right') { G.touchRight = true; btnRight.classList.add('pressed'); }
  }

  function touchEnd(dir) {
    if (dir === 'left')  { if (G) G.touchLeft  = false; btnLeft.classList.remove('pressed'); }
    if (dir === 'right') { if (G) G.touchRight = false; btnRight.classList.remove('pressed'); }
  }

  // Pointer events cover both mouse and touch
  btnLeft.addEventListener('pointerdown',  () => touchStart('left'));
  btnLeft.addEventListener('pointerup',    () => touchEnd('left'));
  btnLeft.addEventListener('pointerleave', () => touchEnd('left'));

  btnRight.addEventListener('pointerdown',  () => touchStart('right'));
  btnRight.addEventListener('pointerup',    () => touchEnd('right'));
  btnRight.addEventListener('pointerleave', () => touchEnd('right'));

  // Prevent default touch scrolling on the game canvas
  gameCanvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  gameCanvas.addEventListener('touchmove',  e => e.preventDefault(), { passive: false });
}


/* ────────────────────────────────────────────────────────────────
   4i · OVERLAY / HUD HELPERS
   ──────────────────────────────────────────────────────────────── */

function showOverlay(emoji, title, body, btnText) {
  const overlay   = document.getElementById('game-overlay');
  const titleEl   = document.getElementById('overlay-title');
  const bodyEl    = document.getElementById('overlay-body');
  const btnEl     = document.getElementById('overlay-btn');
  const emojiEl   = overlay.querySelector('.game-overlay__emoji');

  emojiEl.textContent   = emoji;
  titleEl.textContent   = title;
  bodyEl.innerHTML      = body;
  btnEl.textContent     = btnText;

  overlay.classList.remove('hidden');
}

function hideOverlay() {
  document.getElementById('game-overlay').classList.add('hidden');
}

function updateHUD() {
  document.getElementById('game-score').textContent      = G.score;
  document.getElementById('game-high-score').textContent = G.highScore || 0;
  document.getElementById('game-level').textContent      = G.level;
}


/* ────────────────────────────────────────────────────────────────
   4j · WIN MODAL & CANVAS CONFETTI
   ──────────────────────────────────────────────────────────────── */

function showWinModal() {
  const modal = document.getElementById('win-modal');
  modal.removeAttribute('hidden');
  modal.focus();

  launchConfetti();
}

function closeWinModal() {
  const modal = document.getElementById('win-modal');
  modal.setAttribute('hidden', '');

  stopConfetti();

  // Restart game prompt
  showOverlay(
    '💛',
    'Play Again?',
    `You scored <strong>${G.score}</strong> points!<br/>Can you do even better?`,
    'Play Again'
  );
  G.running = false;
}

/* ─── Canvas Confetti ─── */

let confettiRAF       = null;
let confettiParticles = [];

const CONFETTI_COLOURS = [
  '#D4AF37', '#F0D060', '#A07C20',
  '#F5EDD8', '#1A2355', '#0D4F3C',
  '#FFFFFF', '#FFB347',
];

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || 480;
  canvas.height = canvas.offsetHeight || 300;

  confettiParticles = Array.from({ length: 120 }, () => ({
    x:       Math.random() * canvas.width,
    y:       -Math.random() * canvas.height * 0.5,
    w:       6 + Math.random() * 8,
    h:       3 + Math.random() * 5,
    colour:  CONFETTI_COLOURS[Math.floor(Math.random() * CONFETTI_COLOURS.length)],
    vx:      (Math.random() - 0.5) * 3,
    vy:      2 + Math.random() * 3,
    angle:   Math.random() * Math.PI * 2,
    spin:    (Math.random() - 0.5) * 0.25,
    life:    1.0,
    decay:   0.004 + Math.random() * 0.006,
  }));

  function confettiLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allDead = true;

    for (const p of confettiParticles) {
      if (p.life <= 0) continue;
      allDead = false;

      p.x      += p.vx;
      p.y      += p.vy;
      p.angle  += p.spin;
      p.vy     += 0.06; // gravity
      p.life   -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.colour;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (!allDead) {
      confettiRAF = requestAnimationFrame(confettiLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (confettiRAF) cancelAnimationFrame(confettiRAF);
  confettiRAF = requestAnimationFrame(confettiLoop);
}

function stopConfetti() {
  if (confettiRAF) {
    cancelAnimationFrame(confettiRAF);
    confettiRAF = null;
  }
  confettiParticles = [];
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}


/* ────────────────────────────────────────────────────────────────
   4k · GAME BOOTSTRAP
   ──────────────────────────────────────────────────────────────── */

function initGame() {
  gameCanvas = document.getElementById('game-canvas');
  if (!gameCanvas) return;

  gameCtx = gameCanvas.getContext('2d');

  // Scale canvas for device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  gameCanvas.width  = CANVAS_W * dpr;
  gameCanvas.height = CANVAS_H * dpr;
  gameCanvas.style.width  = CANVAS_W + 'px';
  gameCanvas.style.height = CANVAS_H + 'px';
  gameCtx.scale(dpr, dpr);

  // Draw static start screen on the canvas
  drawBackground(gameCtx, 0);

  // Initialise empty game state (not running yet)
  G = freshGameState();

  // Overlay "Start" button
  const overlayBtn = document.getElementById('overlay-btn');
  overlayBtn.addEventListener('click', () => startGame());

  // Close win modal
  const closeBtn = document.getElementById('modal-close-btn');
  closeBtn.addEventListener('click', () => closeWinModal());

  // Close win modal on backdrop click
  document.getElementById('win-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('win-modal')) closeWinModal();
  });

  // Close win modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('win-modal').hasAttribute('hidden')) {
      closeWinModal();
    }
  });

  // Init input handlers
  initGameInput();
}


/* ══════════════════════════════════════════════════════════════════
   BOOTSTRAP — run everything once the DOM is ready
   ══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  startWeddingCounter();  // Sec 01 — live anniversary counter
  initCardFlips();        // Sec 02 — 3D card flips
  startParticles();       // Sec 03 — ambient floating particles
  initGame();             // Sec 04 — "Catch Omar's Heart" game
});
