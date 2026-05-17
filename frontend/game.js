const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// PLAYER
let player = { x: 200, y: 200, size: 20, speed: 4 };

// CAR
let car = { x: 400, y: 300, size: 40, speed: 7 };
let inCar = false;

// WORLD
let enemy = { x: 600, y: 200, alive: true };
let police = { x: 800, y: 300 };

// GAME DATA
let money = 0;
let wanted = 0;
let chapter = 1;

// CAMERA
let camera = { x: 0, y: 0 };

// BULLETS
let bullets = [];

// CONTROLS
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// MOVE
function move() {
  let obj = inCar ? car : player;
  let speed = inCar ? car.speed : player.speed;

  if (keys["w"]) obj.y -= speed;
  if (keys["s"]) obj.y += speed;
  if (keys["a"]) obj.x -= speed;
  if (keys["d"]) obj.x += speed;
}

// CAMERA FOLLOW (CINEMATIC)
function updateCamera() {
  camera.x += (player.x - camera.x - canvas.width / 2) * 0.07;
  camera.y += (player.y - camera.y - canvas.height / 2) * 0.07;
}

// SHOOT
document.getElementById("shoot").onclick = function () {
  bullets.push({ x: player.x, y: player.y, speed: 10 });
  wanted++;
  updateUI();
};

// CAR TOGGLE
document.getElementById("car").onclick = function () {
  inCar = !inCar;
};

// MISSION SYSTEM (STORY)
document.getElementById("mission").onclick = function () {
  if (chapter === 1) {
    alert("Chapter 1: Eliminate target in Istanbul streets");
  }

  if (enemy.alive === false && chapter === 1) {
    chapter = 2;
    money += 500;
    alert("Chapter 1 Complete → Chapter 2 Unlocked");
    updateUI();
  }
};

// AI
function enemyAI() {
  if (!enemy.alive) return;
  enemy.x += (player.x - enemy.x) * 0.01;
  enemy.y += (player.y - enemy.y) * 0.01;
}

function policeAI() {
  if (wanted > 0) {
    police.x += (player.x - police.x) * 0.02;
    police.y += (player.y - police.y) * 0.02;
  }
}

// BULLETS
function updateBullets() {
  bullets.forEach(b => {
    b.x += b.speed;

    if (enemy.alive &&
        b.x < enemy.x + 20 &&
        b.x > enemy.x &&
        b.y < enemy.y + 20 &&
        b.y > enemy.y) {

      enemy.alive = false;
      money += 100;
      updateUI();
    }
  });
}

// UI
function updateUI() {
  document.getElementById("money").innerText = money;
  document.getElementById("wanted").innerText = wanted;
  document.getElementById("chapter").innerText = chapter;
}

// DRAW WORLD
function draw() {
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // PLAYER
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x - camera.x, player.y - camera.y, 20, 20);

  // ENEMY
  if (enemy.alive) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, 20, 20);
  }

  // POLICE
  ctx.fillStyle = "white";
  ctx.fillRect(police.x - camera.x, police.y - camera.y, 20, 20);

  // BULLETS
  ctx.fillStyle = "orange";
  bullets.forEach(b => {
    ctx.fillRect(b.x - camera.x, b.y - camera.y, 5, 5);
  });
}

// LOOP
function update() {
  move();
  updateCamera();

  enemyAI();
  policeAI();
  updateBullets();

  draw();

  requestAnimationFrame(update);
}

update();
