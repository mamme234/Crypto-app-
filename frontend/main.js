let scene, camera, renderer;

let player, car;
let keys = {};
let inCar = false;

let playerMixer;

// car physics
let carSpeed = 0;
const maxSpeed = 0.35;
const acceleration = 0.012;
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

  // 🌍 ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // 🏙️ city
  createCity();

  // 🚗 car
  car = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 5),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  car.position.set(5, 0.75, 0);
  scene.add(car);

  // 👤 player (real model)
  const loader = new THREE.GLTFLoader();

  loader.load(
    "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
    (gltf) => {
      player = gltf.scene;
      player.scale.set(0.4, 0.4, 0.4);
      player.position.set(0, 0, 5);
      scene.add(player);

      playerMixer = new THREE.AnimationMixer(player);

      const idle = THREE.AnimationClip.findByName(gltf.animations, "Idle");
      if (idle) playerMixer.clipAction(idle).play();
    }
  );

  // 💡 lights
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(20, 50, 20);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // 🎮 controls
  window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

  // resize
  window.addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createCity() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  for (let i = -5; i <= 5; i++) {
    const road1 = new THREE.Mesh(
      new THREE.BoxGeometry(500, 0.1, 10),
      roadMat
    );
    road1.position.z = i * 30;
    scene.add(road1);

    const road2 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.1, 500),
      roadMat
    );
    road2.position.x = i * 30;
    scene.add(road2);
  }

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  for (let i = 0; i < 100; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(
        5 + Math.random() * 15,
        10 + Math.random() * 50,
        5 + Math.random() * 15
      ),
      buildingMat
    );

    b.position.x = (Math.random() - 0.5) * 400;
    b.position.z = (Math.random() - 0.5) * 400;
    b.position.y = b.geometry.parameters.height / 2;

    scene.add(b);
  }
}

// 👤 movement
function updatePlayer() {
  if (!player) return;

  let speed = 0.12;
  let moving = false;

  if (keys["w"]) {
    player.position.z -= speed;
    moving = true;
  }
  if (keys["s"]) {
    player.position.z += speed;
    moving = true;
  }
  if (keys["a"]) {
    player.position.x -= speed;
    moving = true;
  }
  if (keys["d"]) {
    player.position.x += speed;
    moving = true;
  }

  if (moving) player.rotation.y += 0.05;

  followCamera(player.position);

  if (playerMixer) playerMixer.update(0.016);
}

// 🚗 car movement
function updateCar() {
  if (keys["w"]) carSpeed += acceleration;
  if (keys["s"]) carSpeed -= acceleration;

  carSpeed *= 0.98;

  if (carSpeed > maxSpeed) carSpeed = maxSpeed;
  if (carSpeed < -maxSpeed / 2) carSpeed = -maxSpeed / 2;

  if (keys["a"]) car.rotation.y += turnSpeed;
  if (keys["d"]) car.rotation.y -= turnSpeed;

  car.position.x -= Math.sin(car.rotation.y) * carSpeed;
  car.position.z -= Math.cos(car.rotation.y) * carSpeed;

  followCamera(car.position);
}

// 🎥 camera
function followCamera(target) {
  camera.position.x = target.x;
  camera.position.z = target.z + 8;
  camera.position.y = 5;
  camera.lookAt(target);
}

// 🔁 enter/exit car
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e" && player) {
    let dist = player.position.distanceTo(car.position);

    if (!inCar && dist < 3) {
      inCar = true;
    } else if (inCar) {
      inCar = false;

      player.position.set(
        car.position.x + 2,
        0,
        car.position.z + 2
      );
    }
  }
});

// 🔄 game loop
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
