// Tetris Neo - Modern + Retro Tetris Game

// --- CONFIG ---
const COLS = 10, ROWS = 20;
let BLOCK = 32; // Block size
const PIECES = [
  { name: 'I', color: '#00eaff', shape: [[0,1],[1,1],[2,1],[3,1]] },
  { name: 'J', color: '#ff00c8', shape: [[0,0],[0,1],[1,1],[2,1]] },
  { name: 'L', color: '#ffe600', shape: [[2,0],[0,1],[1,1],[2,1]] },
  { name: 'O', color: '#00ff85', shape: [[1,0],[2,0],[1,1],[2,1]] },
  { name: 'S', color: '#fffb00', shape: [[1,0],[2,0],[0,1],[1,1]] },
  { name: 'T', color: '#ff00c8', shape: [[1,0],[0,1],[1,1],[2,1]] },
  { name: 'Z', color: '#ff0040', shape: [[0,0],[1,0],[1,1],[2,1]] }
];

// --- STATE ---
let board, current, next, hold, canHold, bag, score, level, lines, dropInterval, dropTimer, paused, gameOver;
let keys = {}, touchStart = null, volume = 0.5, muted = false;
let canvas, ctx, bgCanvas, bgCtx;

// --- AUDIO ---
const audioCtx = window.AudioContext ? new window.AudioContext() : null;
const sounds = {};

function playSound(name) {
  if (!audioCtx || muted) return;
  const s = sounds[name];
  if (!s) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = s;
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(audioCtx.destination);
    src.start();
  } catch (e) {
    console.log('Audio error:', e);
  }
}

// --- CANVAS SETUP ---
function setupCanvas() {
  console.log('Setting up canvas...');
  
  canvas = document.getElementById('tetris');
  bgCanvas = document.getElementById('bg-anim');
  
  if (!canvas || !bgCanvas) {
    console.error('Canvas elements not found');
    return false;
  }
  
  ctx = canvas.getContext('2d');
  bgCtx = bgCanvas.getContext('2d');
  
  if (!ctx || !bgCtx) {
    console.error('Could not get canvas contexts');
    return false;
  }
  
  // Set canvas size
  canvas.width = COLS * BLOCK;
  canvas.height = ROWS * BLOCK;
  bgCanvas.width = COLS * BLOCK;
  bgCanvas.height = ROWS * BLOCK;
  
  console.log('Canvas setup complete:', canvas.width, 'x', canvas.height);
  return true;
}

// --- DEVICE DETECTION ---
const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

// --- GAME LOGIC ---
function createBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function randomPiece() {
  if (bag.length === 0) {
    bag = [...PIECES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function createPiece(piece) {
  return {
    ...piece,
    x: Math.floor(COLS / 2) - 2,
    y: 0,
    rotation: 0
  };
}

function isValidMove(piece, dx, dy, newRotation) {
  const shape = piece.shape;
  const rotation = newRotation !== undefined ? newRotation : piece.rotation;
  
  for (let [px, py] of shape) {
    const x = piece.x + px + dx;
    const y = piece.y + py + dy;
    
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y >= 0 && board[y][x]) return false;
  }
  return true;
}

function move(dx, dy) {
  if (gameOver || paused || !current) return;
  if (isValidMove(current, dx, dy)) {
    current.x += dx;
    current.y += dy;
    if (dx !== 0) playSound('move');
  }
}

function rotate() {
  if (gameOver || paused || !current) return;
  
  // Create rotated shape
  const rotated = [];
  for (let [x, y] of current.shape) {
    // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
    rotated.push([y, -x]);
  }
  
  // Normalize coordinates (make sure min x and y are 0)
  const minX = Math.min(...rotated.map(([x, y]) => x));
  const minY = Math.min(...rotated.map(([x, y]) => y));
  
  const normalizedShape = rotated.map(([x, y]) => [x - minX, y - minY]);
  
  // Try to place the rotated piece
  const originalShape = current.shape;
  current.shape = normalizedShape;
  
  // Check if rotation is valid
  if (isValidMove(current, 0, 0)) {
    playSound('rotate');
  } else {
    // Try wall kicks - move left/right if rotation hits wall
    let kicked = false;
    for (let kick of [-1, 1, -2, 2]) {
      if (isValidMove(current, kick, 0)) {
        current.x += kick;
        playSound('rotate');
        kicked = true;
        break;
      }
    }
    
    if (!kicked) {
      // Revert rotation if no valid position found
      current.shape = originalShape;
    }
  }
}

function softDrop() {
  if (gameOver || paused) return;
  move(0, 1);
  playSound('softdrop');
}

function hardDrop() {
  if (gameOver || paused) return;
  while (isValidMove(current, 0, 1)) {
    current.y++;
  }
  placePiece();
  playSound('harddrop');
}

function holdPiece() {
  if (gameOver || paused || !canHold) return;
  if (hold) {
    [current, hold] = [hold, current];
    current.x = Math.floor(COLS / 2) - 2;
    current.y = 0;
  } else {
    hold = current;
    current = createPiece(next);
    next = createPiece(randomPiece());
  }
  canHold = false;
  playSound('hold');
}

function placePiece() {
  if (!current) return;
  
  for (let [px, py] of current.shape) {
    const x = current.x + px;
    const y = current.y + py;
    if (y >= 0) {
      board[y][x] = current.color;
    }
  }
  
  const linesCleared = clearLines();
  if (linesCleared > 0) {
    lines += linesCleared;
    score += linesCleared * 100 * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(50, 500 - (level - 1) * 50);
    playSound(`line${linesCleared}`);
  }
  
  current = createPiece(next);
  next = createPiece(randomPiece());
  canHold = true;
  
  if (!isValidMove(current, 0, 0)) {
    gameOver = true;
    playSound('gameover');
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++; // Check same line again
    }
  }
  return cleared;
}

// --- RENDERING ---
function draw() {
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = '#181825';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw board
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        ctx.fillStyle = board[y][x];
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }
  }
  
  // Draw current piece
  if (current) {
    ctx.fillStyle = current.color;
    for (let [px, py] of current.shape) {
      const x = current.x + px;
      const y = current.y + py;
      if (y >= 0) {
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }
  }
  
  // Update UI
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  document.getElementById('lines').textContent = lines;
}

function drawBackground() {
  if (!bgCtx) return;
  
  bgCtx.fillStyle = '#181825';
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  // Simple grid pattern
  bgCtx.strokeStyle = 'rgba(0, 234, 255, 0.1)';
  bgCtx.lineWidth = 1;
  
  for (let x = 0; x <= COLS; x++) {
    bgCtx.beginPath();
    bgCtx.moveTo(x * BLOCK, 0);
    bgCtx.lineTo(x * BLOCK, bgCanvas.height);
    bgCtx.stroke();
  }
  
  for (let y = 0; y <= ROWS; y++) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, y * BLOCK);
    bgCtx.lineTo(bgCanvas.width, y * BLOCK);
    bgCtx.stroke();
  }
}

// --- GAME LOOP ---
function gameLoop() {
  if (!gameOver) {
    dropTimer += 16;
    if (dropTimer >= dropInterval && !paused) {
      if (current && isValidMove(current, 0, 1)) {
        current.y++;
      } else if (current) {
        placePiece();
      }
      dropTimer = 0;
    }
  }
  
  draw();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  console.log('Resetting game...');
  board = createBoard();
  bag = [];
  current = createPiece(randomPiece());
  next = createPiece(randomPiece());
  hold = null;
  canHold = true;
  score = 0;
  level = 1;
  lines = 0;
  dropInterval = 500;
  dropTimer = 0;
  paused = false;
  gameOver = false;
  
  drawBackground();
}

// --- INPUT ---
function setupControls() {
  // Keyboard controls
  document.addEventListener('keydown', e => {
    switch(e.code) {
      case 'ArrowLeft': move(-1, 0); break;
      case 'ArrowRight': move(1, 0); break;
      case 'ArrowDown': softDrop(); break;
      case 'ArrowUp': rotate(); break;
      case 'Space': e.preventDefault(); hardDrop(); break;
      case 'ShiftLeft':
      case 'ShiftRight': holdPiece(); break;
      case 'KeyP': 
        paused = !paused;
        if (paused) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
        }
        break;
    }
  });
  
  // Touch controls for mobile
  if (isMobile()) {
    setupTouchControls();
  }
}

function setupTouchControls() {
  if (!canvas) return;
  
  let touchStartPos = null;
  let touchStartTime = 0;
  
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    touchStartTime = Date.now();
  });
  
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if (!touchStartPos) return;
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const touchDuration = Date.now() - touchStartTime;
    
    // Quick tap to rotate (less than 300ms and minimal movement)
    if (touchDuration < 300 && distance < 40) {
      rotate();
      console.log('Tap to rotate triggered');
    } 
    // Swipe gestures - require minimum distance and not too slow
    else if (distance > 50 && touchDuration < 800) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
          move(1, 0);
          console.log('Swipe right');
        } else {
          move(-1, 0);
          console.log('Swipe left');
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          softDrop();
          console.log('Swipe down');
        } else {
          hardDrop();
          console.log('Swipe up');
        }
      }
    }
    
    touchStartPos = null;
    touchStartTime = 0;
  });
  
  // Prevent scrolling when touching the canvas
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
  });
}

// --- AUDIO ---
function makeSounds() {
  if (!audioCtx) return;
  
  function synth(freq, dur, type='square', vol=0.3) {
    const sampleRate = 22050;
    const len = Math.floor(sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    
    for (let i = 0; i < len; i++) {
      if (type === 'square') {
        data[i] = vol * (Math.sin(2 * Math.PI * freq * i / sampleRate) > 0 ? 1 : -1);
      } else {
        data[i] = vol * Math.sin(2 * Math.PI * freq * i / sampleRate);
      }
    }
    return buf;
  }
  
  sounds['move'] = synth(220, 0.05);
  sounds['rotate'] = synth(440, 0.08);
  sounds['softdrop'] = synth(330, 0.05);
  sounds['harddrop'] = synth(660, 0.08);
  sounds['hold'] = synth(550, 0.08);
  sounds['line1'] = synth(880, 0.12);
  sounds['line2'] = synth(660, 0.12);
  sounds['line3'] = synth(440, 0.12);
  sounds['line4'] = synth(220, 0.12);
  sounds['gameover'] = synth(110, 0.5);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Tetris...');
  
  if (!setupCanvas()) {
    alert('Failed to setup canvas!');
    return;
  }
  
  setupControls();
  
  if (audioCtx) {
    makeSounds();
  }
  
  // Audio controls
  document.getElementById('mute-btn').onclick = () => {
    muted = !muted;
    document.getElementById('mute-btn').textContent = muted ? 'Unmute' : 'Mute';
  };
  
  document.getElementById('volume-slider').oninput = e => {
    volume = parseFloat(e.target.value);
  };
  
  resetGame();
  gameLoop();
  
  console.log('Tetris initialized successfully!');
});
