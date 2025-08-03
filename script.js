// Tetris Neo - Modern + Retro Tetris Game
// Author: GitHub Copilot

// --- CONFIG ---
const COLS = 10, ROWS = 20, BLOCK = 24;
const PIECES = [
  { name: 'I', color: '#00eaff', shape: [[0,1],[1,1],[2,1],[3,1]] },
  { name: 'J', color: '#ff00c8', shape: [[0,0],[0,1],[1,1],[2,1]] },
  { name: 'L', color: '#ffe600', shape: [[2,0],[0,1],[1,1],[2,1]] },
  { name: 'O', color: '#00ff85', shape: [[1,0],[2,0],[1,1],[2,1]] },
  { name: 'S', color: '#fffb00', shape: [[1,0],[2,0],[0,1],[1,1]] },
  { name: 'T', color: '#ff00c8', shape: [[1,0],[0,1],[1,1],[2,1]] },
  { name: 'Z', color: '#ff0040', shape: [[0,0],[1,0],[1,1],[2,1]] }
];

const WALL_KICKS = {
  I: [[0,0],[0,-1],[0,1],[1,0],[-1,0]],
  O: [[0,0]],
  default: [[0,0],[0,-1],[0,1],[1,0],[-1,0]]
};

// --- STATE ---
let board, current, next, hold, canHold, bag, score, level, lines, dropInterval, dropTimer, paused, gameOver;
let keys = {}, touchStart = null, volume = 0.5, muted = false;

// --- AUDIO ---
const audioCtx = window.AudioContext ? new window.AudioContext() : null;
const sounds = {};

function playSound(name) {
  if (!audioCtx || muted) return;
  const s = sounds[name];
  if (!s) return;
  const src = audioCtx.createBufferSource();
  src.buffer = s;
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  src.connect(gain).connect(audioCtx.destination);
  src.start();
}

// --- GAME INIT ---
function resetGame() {
  board = Array.from({length:ROWS},()=>Array(COLS).fill(null));
  bag = [];
  score = 0; level = 1; lines = 0;
  dropInterval = 600;
  dropTimer = 0;
  paused = false; gameOver = false;
  next = randomPiece();
  current = randomPiece();
  hold = null; canHold = true;
  updateStats();
  drawNext(); drawHold();
}

function randomPiece() {
  if (bag.length === 0) bag = shuffle([...PIECES]);
  const p = bag.pop();
  return {
    ...p,
    x: Math.floor(COLS/2)-2,
    y: 0,
    rot: 0,
    shape: getRotated(p.shape,0)
  };
}

function shuffle(arr) {
  for (let i=arr.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function getRotated(shape, rot) {
  let s = shape.map(([x,y])=>[x,y]);
  for (let r=0;r<rot;r++) {
    s = s.map(([x,y])=>[y,-x]);
    const minX = Math.min(...s.map(([x])=>x));
    const minY = Math.min(...s.map(([,y])=>y));
    s = s.map(([x,y])=>[x-minX,y-minY]);
  }
  return s;
}

// --- GAME LOOP ---
function gameLoop(ts) {
  if (!dropTimer) dropTimer = ts;
  if (!paused && !gameOver) {
    if (ts-dropTimer > dropInterval) {
      dropPiece();
      dropTimer = ts;
    }
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Game update logic can be added here
}

// --- DRAW ---
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  // Draw board
  for (let y=0;y<ROWS;y++) {
    for (let x=0;x<COLS;x++) {
      if (board[y][x]) drawBlock(x,y,board[y][x].color);
    }
  }
  
  // Draw current piece
  if (current) {
    current.shape.forEach(([dx,dy])=>{
      drawBlock(current.x+dx,current.y+dy,current.color);
    });
    
    // Draw ghost piece
    let ghostY = current.y;
    while (!collides(current.x,ghostY+1,current.shape)) ghostY++;
    ctx.globalAlpha = 0.3;
    current.shape.forEach(([dx,dy])=>{
      drawBlock(current.x+dx,ghostY+dy,current.color);
    });
    ctx.globalAlpha = 1;
  }
}

function drawBlock(x,y,color) {
  ctx.save();
  ctx.translate(x*BLOCK,y*BLOCK);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillRect(2,2,BLOCK-4,BLOCK-4);
  ctx.restore();
}

function drawNext() {
  const c = document.getElementById('next-piece');
  c.innerHTML = '';
  const nc = document.createElement('canvas');
  nc.width = nc.height = 80;
  const nctx = nc.getContext('2d');
  next.shape.forEach(([dx,dy])=>{
    nctx.fillStyle = next.color;
    nctx.shadowColor = next.color;
    nctx.shadowBlur = 8;
    nctx.fillRect(16+dx*16,16+dy*16,16,16);
  });
  c.appendChild(nc);
}

function drawHold() {
  const c = document.getElementById('hold-piece');
  c.innerHTML = '';
  if (!hold) return;
  const hc = document.createElement('canvas');
  hc.width = hc.height = 80;
  const hctx = hc.getContext('2d');
  hold.shape.forEach(([dx,dy])=>{
    hctx.fillStyle = hold.color;
    hctx.shadowColor = hold.color;
    hctx.shadowBlur = 8;
    hctx.fillRect(16+dx*16,16+dy*16,16,16);
  });
  c.appendChild(hc);
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  document.getElementById('lines').textContent = lines;
}

// --- COLLISION ---
function collides(x,y,shape) {
  for (const [dx,dy] of shape) {
    const nx = x+dx, ny = y+dy;
    if (nx<0||nx>=COLS||ny<0||ny>=ROWS) return true;
    if (board[ny] && board[ny][nx]) return true;
  }
  return false;
}

// --- PIECE MOVEMENT ---
function move(dx,dy) {
  if (!current) return;
  if (!collides(current.x+dx,current.y+dy,current.shape)) {
    current.x += dx; current.y += dy;
    playSound('move');
  }
}

function rotate() {
  if (!current) return;
  let rot = (current.rot+1)%4;
  let shape = getRotated(PIECES.find(p=>p.name===current.name).shape,rot);
  for (const [kx,ky] of WALL_KICKS[current.name]||WALL_KICKS.default) {
    if (!collides(current.x+kx,current.y+ky,shape)) {
      current.x += kx; current.y += ky;
      current.rot = rot; current.shape = shape;
      playSound('rotate');
      return;
    }
  }
}

function hardDrop() {
  if (!current) return;
  let dy = 0;
  while (!collides(current.x,current.y+dy+1,current.shape)) dy++;
  current.y += dy;
  lockPiece();
  playSound('harddrop');
}

function softDrop() {
  if (!current) return;
  if (!collides(current.x,current.y+1,current.shape)) {
    current.y++;
    score += 1;
    playSound('softdrop');
  }
}

function holdPiece() {
  if (!canHold) return;
  playSound('hold');
  if (!hold) {
    hold = {...current};
    current = next;
    next = randomPiece();
  } else {
    [hold,current] = [{...current},{...hold}];
  }
  canHold = false;
  drawHold();
  drawNext();
}

function dropPiece() {
  if (!current) return;
  if (!collides(current.x,current.y+1,current.shape)) {
    current.y++;
  } else {
    lockPiece();
  }
}

function lockPiece() {
  current.shape.forEach(([dx,dy])=>{
    const x = current.x+dx, y = current.y+dy;
    if (y>=0&&y<ROWS&&x>=0&&x<COLS) board[y][x] = {color:current.color};
  });
  canHold = true;
  clearLines();
  current = next;
  next = randomPiece();
  drawNext();
  if (collides(current.x,current.y,current.shape)) {
    gameOver = true;
    playSound('gameover');
    setTimeout(()=>alert('Game Over! Press F5 to restart.'),500);
  }
}

function clearLines() {
  let cleared = 0;
  for (let y=ROWS-1;y>=0;y--) {
    if (board[y].every(cell=>cell)) {
      board.splice(y,1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      animateLineClear(y);
      y++; // Check the same line again since we removed one
    }
  }
  if (cleared) {
    lines += cleared;
    score += [100,300,500,800][cleared-1]*level;
    playSound('line'+cleared);
    if (lines >= level*10) {
      level++;
      dropInterval = Math.max(80,600-50*level);
      playSound('levelup');
    }
    updateStats();
  }
}

function animateLineClear(y) {
  const bg = document.getElementById('bg-anim');
  const bctx = bg.getContext('2d');
  for (let i=0;i<20;i++) {
    const x = Math.random()*bg.width;
    const color = [varNeon(),varNeon(),varNeon()].join(',');
    bctx.beginPath();
    bctx.arc(x,y*BLOCK+BLOCK/2,Math.random()*8+4,0,2*Math.PI);
    bctx.fillStyle = `rgba(${color},0.8)`;
    bctx.shadowColor = `rgb(${color})`;
    bctx.shadowBlur = 16;
    bctx.fill();
  }
  setTimeout(()=>bctx.clearRect(0,0,bg.width,bg.height),400);
}

function varNeon() {
  return [0,255][Math.floor(Math.random()*2)];
}

// --- INPUT ---
document.addEventListener('keydown',e=>{
  if (gameOver) return;
  if (e.code==='ArrowLeft') move(-1,0);
  else if (e.code==='ArrowRight') move(1,0);
  else if (e.code==='ArrowDown') softDrop();
  else if (e.code==='ArrowUp') rotate();
  else if (e.code==='Space') {
    e.preventDefault();
    hardDrop();
  }
  else if (e.code==='ShiftLeft'||e.code==='ShiftRight') holdPiece();
  else if (e.code==='KeyP') paused=!paused;
});

// --- TOUCH CONTROLS ---
canvas.addEventListener('touchstart',e=>{
  e.preventDefault();
  touchStart = e.touches[0];
});

canvas.addEventListener('touchend',e=>{
  e.preventDefault();
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX-touchStart.clientX;
  const dy = e.changedTouches[0].clientY-touchStart.clientY;
  if (Math.abs(dx)>Math.abs(dy)) {
    if (dx>30) move(1,0);
    else if (dx<-30) move(-1,0);
  } else {
    if (dy>30) softDrop();
    else if (dy<-30) hardDrop();
  }
  touchStart = null;
});

canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
},{passive:false});

// Touch controls for rotation (tap)
canvas.addEventListener('click', () => {
  if (!gameOver) rotate();
});

// --- AUDIO CONTROLS ---
document.getElementById('mute-btn').onclick = ()=>{
  muted = !muted;
  document.getElementById('mute-btn').classList.toggle('active',muted);
  document.getElementById('mute-btn').textContent = muted ? 'Unmute' : 'Mute';
};

document.getElementById('volume-slider').oninput = e => {
  volume = parseFloat(e.target.value);
};

// --- SOUND GENERATION ---
function synth(freq,dur,type='square',vol=0.3) {
  if (!audioCtx) return new Float32Array(22050);
  const sampleRate = 22050, len = Math.floor(sampleRate*dur);
  const buf = audioCtx.createBuffer(1,len,sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0;i<len;i++) {
    data[i] = vol*Math.sin(2*Math.PI*freq*i/sampleRate);
    if (type==='square') data[i] = vol*(Math.sin(2*Math.PI*freq*i/sampleRate)>0?1:-1);
  }
  return buf;
}

function makeSounds() {
  if (!audioCtx) return;
  sounds['move'] = synth(220,0.05);
  sounds['rotate'] = synth(440,0.08);
  sounds['softdrop'] = synth(330,0.05);
  sounds['harddrop'] = synth(660,0.08);
  sounds['hold'] = synth(550,0.08);
  sounds['line1'] = synth(880,0.12);
  sounds['line2'] = synth(660,0.12);
  sounds['line3'] = synth(440,0.12);
  sounds['line4'] = synth(220,0.12);
  sounds['levelup'] = synth(1200,0.18);
  sounds['gameover'] = synth(110,0.5);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  if (audioCtx) makeSounds();
  resetGame();
  requestAnimationFrame(gameLoop);
});
