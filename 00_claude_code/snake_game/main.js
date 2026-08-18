// スネークゲーム (Snake)
"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// --- ゲーム設定 ---
const CELL_SIZE = 20;
const COLS = WIDTH / CELL_SIZE;
const ROWS = HEIGHT / CELL_SIZE;
const MOVE_INTERVAL = 100; // ms

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const STATE = {
  READY: "ready",
  PLAYING: "playing",
  GAME_OVER: "game_over",
};

// --- ゲーム状態 ---
let snake = [];
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let food = { x: 0, y: 0 };
let score = 0;
let gameState = STATE.READY;
let lastMoveTime = 0;

function resetGame() {
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);
  snake = [
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX - 3, y: startY },
  ];
  direction = DIRECTIONS.RIGHT;
  nextDirection = DIRECTIONS.RIGHT;
  score = 0;
  gameState = STATE.READY;
  placeFood();
}

function placeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
  food = position;
}

resetGame();

// --- 入力処理 ---
function setDirection(newDirection) {
  // 逆方向への即時反転は無視する
  const isOpposite =
    newDirection.x === -direction.x && newDirection.y === -direction.y;
  if (!isOpposite) {
    nextDirection = newDirection;
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      e.preventDefault();
      setDirection(DIRECTIONS.UP);
      break;
    case "ArrowDown":
      e.preventDefault();
      setDirection(DIRECTIONS.DOWN);
      break;
    case "ArrowLeft":
      e.preventDefault();
      setDirection(DIRECTIONS.LEFT);
      break;
    case "ArrowRight":
      e.preventDefault();
      setDirection(DIRECTIONS.RIGHT);
      break;
    case "Space":
      e.preventDefault();
      if (gameState === STATE.READY) {
        gameState = STATE.PLAYING;
      } else if (gameState === STATE.GAME_OVER) {
        resetGame();
      }
      break;
  }
});

// --- 更新処理 ---
function updateSnake() {
  direction = nextDirection;

  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  // 壁との衝突
  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
    gameState = STATE.GAME_OVER;
    return;
  }

  // 自分自身との衝突
  if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    gameState = STATE.GAME_OVER;
    return;
  }

  snake.unshift(newHead);

  // 餌との衝突
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }
}

function update(time) {
  if (gameState !== STATE.PLAYING) return;

  if (time - lastMoveTime >= MOVE_INTERVAL) {
    lastMoveTime = time;
    updateSnake();
  }
}

// --- 描画処理 ---
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawGrid();
  drawFood();
  drawSnake();
  drawHud();

  if (gameState === STATE.READY) {
    drawCenterText("Space でスタート");
  } else if (gameState === STATE.GAME_OVER) {
    drawCenterText("ゲームオーバー — Space で再挑戦");
  }
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  for (let col = 0; col <= COLS; col++) {
    ctx.beginPath();
    ctx.moveTo(col * CELL_SIZE, 0);
    ctx.lineTo(col * CELL_SIZE, HEIGHT);
    ctx.stroke();
  }
  for (let row = 0; row <= ROWS; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * CELL_SIZE);
    ctx.lineTo(WIDTH, row * CELL_SIZE);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#2a9d8f" : "#57cc99";
    ctx.fillRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  });
}

function drawFood() {
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawHud() {
  ctx.fillStyle = "#f0f0f0";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

function drawCenterText(text) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, HEIGHT / 2 - 40, WIDTH, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, WIDTH / 2, HEIGHT / 2 + 7);
}

// --- メインループ ---
function loop(time) {
  update(time);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
