const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// PLAYER
let player = { x: 200, y: 200, size: 20, speed: 4 };

// CAR
let car = { x: 400, y: 300, size: 40, speed: 7 };
let inCar = false;

// WORLD OBJECTS
let bullets = [];
let npcs = [];
let traffic = [];
let policeCars = [];

// GAME DATA
let money = 0;
let wanted = 0;

// JOYSTICK (simple touch)
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// SPAWN NPCs
for (let i=0;i<10;i++){
  npcs.push({x:Math.random()*800,y:Math.random()*400});
}

// SPAWN TRAFFIC
for (let i=0;i<5;i++){
  traffic.push({x:Math.random()*800,y:Math.random()*400});
}

// MOVE PLAYER / CAR
function move() {
  let obj = inCar ? car : player;
  let speed = inCar ? car.speed : player.speed;

  if (keys["w"]) obj.y -= speed;
  if (keys["s"]) obj.y += speed;
  if (keys["a"]) obj.x -= speed;
  if (keys["d"]) obj.x += speed;
}

// SHOOT
document.getElementById("attack").onclick = () => {
  bullets.push({ x: player.x, y: player.y, speed: 10 });
  wanted++;
  updateUI();
};

// CAR TOGGLE
document.getElementById("car").onclick = () => {
  inCar = !inCar;
};

// POLICE AI (CHASE)
function policeAI() {
  if (wanted > 0) {
    if (policeCars.length < 2) {
      policeCars.push({x:600,y:100});
    }

    policeCars.forEach(p => {
      if (p.x < player.x) p.x += 2;
      if (p.x > player.x) p.x -= 2;
      if (p.y < player.y) p.y += 2;
      if (p.y > player.y) p.y -= 2;
    });
  }
}

// BULLETS
function updateBullets() {
  bullets.forEach(b => {
    b.x += b.speed;
  });
}

// NPC MOVEMENT
function moveNPCs() {
  npcs.forEach(n => {
    n.x += (Math.random()-0.5)*2;
    n.y += (Math.random()-0.5)*2;
  });
}

// DRAW CITY GRID (ISTANBUL STYLE)
function drawCity() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#222";

  for (let i=0;i<20;i++){
    ctx.beginPath();
    ctx.moveTo(i*80,0);
    ctx.lineTo(i*80,canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*80);
    ctx.lineTo(canvas.width,i*80);
    ctx.stroke();
  }
}

// DRAW EVERYTHING
function draw() {
  drawCity();

  // PLAYER / CAR
  ctx.fillStyle = inCar ? "yellow" : "blue";
  let obj = inCar ? car : player;
  ctx.fillRect(obj.x,obj.y,obj.size,obj.size);

  // NPCS
  ctx.fillStyle = "green";
  npcs.forEach(n => ctx.fillRect(n.x,n.y,10,10));

  // TRAFFIC
  ctx.fillStyle = "gray";
  traffic.forEach(t => ctx.fillRect(t.x,t.y,15,15));

  // POLICE
  ctx.fillStyle = "white";
  policeCars.forEach(p => ctx.fillRect(p.x,p.y,20,20));

  // BULLETS
  ctx.fillStyle = "orange";
  bullets.forEach(b => ctx.fillRect(b.x,b.y,5,5));
}

// UI
function updateUI() {
  document.getElementById("money").innerText = money;
  document.getElementById("wanted").innerText = wanted;
}

// LOOP
function update() {
  move();
  moveNPCs();
  policeAI();
  updateBullets();
  draw();
  requestAnimationFrame(update);
}

update();
