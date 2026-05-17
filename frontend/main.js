let scene, camera, renderer;

let player = null;
let car;
let keys = {};
let inCar = false;

let carSpeed = 0;
const maxSpeed = 0.35;
const accel = 0.012;
const turnSpeed = 0.03;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 🌍 Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // 🏙️ Simple city buildings
  createCity();

  // 🚗 Car
  car = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 5),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  car.position.set(5, 0.75, 0);
  scene.add(car);

  // 👤 Player (simple fallback cube so it NEVER breaks)
  player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  player.position.set(0, 1, 5);
  scene.add(player);

  // 💡 Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  // 🎮 Controls
  window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

  window.addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 🏙️ CITY
function createCity() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  for (let i = -4; i <= 4; i++) {
    const road1 = new THREE.Mesh(
      new THREE.BoxGeometry(500, 0.1, 10),
      roadMat
    );
    road1.position.z = i * 40;
    scene.add(road1);

    const road2 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.1, 500),
      roadMat
    );
    road2.position.x = i * 40;
    scene.add(road2);
  }

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  for (let i = 0; i < 80; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(
        5 + Math.random() * 10,
        10 + Math.random() * 50,
        5 + Math.random() * 10
      ),
      buildingMat
    );

    b.position.x = (Math.random() - 0.5) * 400;
    b.position.z = (Math.random() - 0.5) * 400;
    b.position.y = b.geometry.parameters.height / 2;

    scene.add(b);
  }
}

// 👤 PLAYER MOVE
function updatePlayer() {
  if (!player) return;

  let speed = 0.12;
  let moving = false;

  if (keys["w"]) { player.position.z -= speed; moving = true; }
  if (keys["s"]) { player.position.z += speed; moving = true; }
  if (keys["a"]) { player.position.x -= speed; moving = true; }
  if (keys["d"]) { player.position.x += speed; moving = true; }

  if (moving) player.rotation.y += 0.05;

  follow(player.position);
}

// 🚗 CAR MOVE
function updateCar() {
  if (keys["w"]) carSpeed += accel;
  if (keys["s"]) carSpeed -= accel;

  carSpeed *= 0.98;

  if (carSpeed > maxSpeed) carSpeed = maxSpeed;
  if (carSpeed < -maxSpeed / 2) carSpeed = -maxSpeed / 2;

  if (keys["a"]) car.rotation.y += turnSpeed;
  if (keys["d"]) car.rotation.y -= turnSpeed;

  car.position.x -= Math.sin(car.rotation.y) * carSpeed;
  car.position.z -= Math.cos(car.rotation.y) * carSpeed;

  follow(car.position);
}

// 🎥 CAMERA FOLLOW
function follow(target) {
  camera.position.x = target.x;
  camera.position.z = target.z + 8;
  camera.position.y = 5;
  camera.lookAt(target);
}

// 🔁 ENTER / EXIT CAR
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    let dist = player.position.distanceTo(car.position);

    if (!inCar && dist < 3) {
      inCar = true;
    } else if (inCar) {
      inCar = false;

      player.position.set(
        car.position.x + 2,
        1,
        car.position.z + 2
      );
    }
  }
});

// 🔄 LOOP
function animate() {
  requestAnimationFrame(animate);

  if (inCar) {
    player.visible = false;
    updateCar();
  } else {
    player.visible = true;
    updatePlayer();
  }

  renderer.render(scene, camera);
                                                  }
