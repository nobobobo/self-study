// ブロック崩しゲーム (Breakout)
"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// --- ゲーム設定 ---
const PADDLE_WIDTH = 90;
const PADDLE_HEIGHT = 12;
const PADDLE_Y_OFFSET = 30;
const PADDLE_SPEED = 7;

const BALL_RADIUS = 7;
const BALL_SPEED = 4.5;

const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_PADDING = 6;
const BRICK_TOP_OFFSET = 60;
const BRICK_SIDE_OFFSET = 20;
const BRICK_HEIGHT = 20;
const BRICK_WIDTH =
  (WIDTH - BRICK_SIDE_OFFSET * 2 - BRICK_PADDING * (BRICK_COLS - 1)) / BRICK_COLS;

const ROW_COLORS = ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#457b9d", "#a06cd5"];

const STATE = {
  READY: "ready",
  PLAYING: "playing",
  GAME_OVER: "game_over",
  CLEARED: "cleared",
};

// --- ゲーム状態 ---
let paddle = {
  x: (WIDTH - PADDLE_WIDTH) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
};

let ball = {
  x: WIDTH / 2,
  y: HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT - BALL_RADIUS - 1,
  dx: 0,
  dy: 0,
  radius: BALL_RADIUS,
};

let bricks = [];
let score = 0;
let lives = 3;
let gameState = STATE.READY;

const keys = { left: false, right: false };

function createBricks() {
  const arr = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      arr.push({
        x: BRICK_SIDE_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: ROW_COLORS[row % ROW_COLORS.length],
        alive: true,
      });
    }
  }
  return arr;
}

function resetBallAndPaddle() {
  paddle.x = (WIDTH - PADDLE_WIDTH) / 2;
  ball.x = WIDTH / 2;
  ball.y = HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT - BALL_RADIUS - 1;
  ball.dx = 0;
  ball.dy = 0;
}

function launchBall() {
  const angle = (Math.random() * 0.6 + 0.2) * Math.PI; // 36°〜144° 相当の範囲
  ball.dx = BALL_SPEED * Math.cos(angle);
  ball.dy = -Math.abs(BALL_SPEED * Math.sin(angle));
}

function resetGame() {
  bricks = createBricks();
  score = 0;
  lives = 3;
  resetBallAndPaddle();
  gameState = STATE.READY;
}

resetGame();

// --- 入力処理 ---
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space") {
    e.preventDefault();
    if (gameState === STATE.READY) {
      gameState = STATE.PLAYING;
      launchBall();
    } else if (gameState === STATE.GAME_OVER || gameState === STATE.CLEARED) {
      resetGame();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = WIDTH / rect.width;
  const mouseX = (e.clientX - rect.left) * scaleX;
  paddle.x = clamp(mouseX - paddle.width / 2, 0, WIDTH - paddle.width);
});

canvas.addEventListener("click", () => {
  if (gameState === STATE.READY) {
    gameState = STATE.PLAYING;
    launchBall();
  } else if (gameState === STATE.GAME_OVER || gameState === STATE.CLEARED) {
    resetGame();
  }
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// --- 更新処理 ---
function updatePaddle() {
  if (keys.left) paddle.x -= PADDLE_SPEED;
  if (keys.right) paddle.x += PADDLE_SPEED;
  paddle.x = clamp(paddle.x, 0, WIDTH - paddle.width);

  if (gameState === STATE.READY) {
    ball.x = paddle.x + paddle.width / 2;
  }
}

function updateBall() {
  if (gameState !== STATE.PLAYING) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  // 壁との衝突
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx *= -1;
  } else if (ball.x + ball.radius > WIDTH) {
    ball.x = WIDTH - ball.radius;
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy *= -1;
  }

  // パドルとの衝突
  const paddleY = HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
  if (
    ball.dy > 0 &&
    ball.y + ball.radius >= paddleY &&
    ball.y + ball.radius <= paddleY + paddle.height + ball.radius &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.y = paddleY - ball.radius;
    const hitPos = (ball.x - paddle.x) / paddle.width - 0.5; // -0.5〜0.5
    const bounceAngle = hitPos * (Math.PI / 3); // 最大60度
    const speed = Math.hypot(ball.dx, ball.dy);
    ball.dx = speed * Math.sin(bounceAngle);
    ball.dy = -Math.abs(speed * Math.cos(bounceAngle));
  }

  // ブロックとの衝突
  for (const brick of bricks) {
    if (!brick.alive) continue;
    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      brick.alive = false;
      score += 10;

      // どちらの面に当たったかで反射方向を決める
      const overlapLeft = ball.x + ball.radius - brick.x;
      const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
      const overlapTop = ball.y + ball.radius - brick.y;
      const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop || minOverlap === overlapBottom) {
        ball.dy *= -1;
      } else {
        ball.dx *= -1;
      }
      break;
    }
  }

  // 落下判定
  if (ball.y - ball.radius > HEIGHT) {
    lives -= 1;
    if (lives <= 0) {
      gameState = STATE.GAME_OVER;
    } else {
      gameState = STATE.READY;
      resetBallAndPaddle();
    }
  }

  // クリア判定
  if (bricks.every((b) => !b.alive)) {
    gameState = STATE.CLEARED;
  }
}

// --- 描画処理 ---
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBricks();
  drawPaddle();
  drawBall();
  drawHud();

  if (gameState === STATE.READY) {
    drawCenterText("Space または クリックでスタート");
  } else if (gameState === STATE.GAME_OVER) {
    drawCenterText("ゲームオーバー — Space で再挑戦");
  } else if (gameState === STATE.CLEARED) {
    drawCenterText("クリア！ — Space でもう一度");
  }
}

function drawBricks() {
  for (const brick of bricks) {
    if (!brick.alive) continue;
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }
}

function drawPaddle() {
  const y = HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
  ctx.fillStyle = "#f1faee";
  ctx.fillRect(paddle.x, y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe66d";
  ctx.fill();
  ctx.closePath();
}

function drawHud() {
  ctx.fillStyle = "#f0f0f0";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 24);
  ctx.textAlign = "right";
  ctx.fillText(`Lives: ${lives}`, WIDTH - 10, 24);
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
function loop() {
  updatePaddle();
  updateBall();
  draw();
  requestAnimationFrame(loop);
}

loop();
