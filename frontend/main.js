let scene, camera, renderer;

let player, car;
let keys = {};
let inCar = false;

let carSpeed = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 🌍 ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // 🏙️ simple city
  createCity();

  // 🚗 car
  car = new THREE.Mesh(
    new THREE.BoxGeometry(3,1.5,5),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  car.position.set(5,0.75,0);
  scene.add(car);

  // 👤 REAL CHARACTER
  const loader = new THREE.GLTFLoader();

  loader.load(
    "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
    (gltf) => {
      player = gltf.scene;
      player.scale.set(0.4,0.4,0.4);
      player.position.set(0,0,5);
      scene.add(player);
    }
  );

  // 💡 lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10,20,10);
  scene.add(light);

  // keyboard
  window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  // 📱 MOBILE CONTROLS
  setupMobile();

  window.addEventListener("resize", onResize);
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 🏙️ CITY
function createCity(){
  const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  for(let i=0;i<60;i++){
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(
        5+Math.random()*10,
        10+Math.random()*40,
        5+Math.random()*10
      ),
      mat
    );

    b.position.x = (Math.random()-0.5)*300;
    b.position.z = (Math.random()-0.5)*300;
    b.position.y = b.geometry.parameters.height/2;

    scene.add(b);
  }
}

// 👤 MOVE PLAYER
function updatePlayer(){
  if(!player) return;

  let speed = 0.12;

  if(keys["w"]) player.position.z -= speed;
  if(keys["s"]) player.position.z += speed;
  if(keys["a"]) player.position.x -= speed;
  if(keys["d"]) player.position.x += speed;

  follow(player.position);
}

// 🚗 CAR
function updateCar(){
  if(keys["w"]) carSpeed += 0.012;
  if(keys["s"]) carSpeed -= 0.012;

  carSpeed *= 0.98;

  if(keys["a"]) car.rotation.y += 0.03;
  if(keys["d"]) car.rotation.y -= 0.03;

  car.position.x -= Math.sin(car.rotation.y)*carSpeed;
  car.position.z -= Math.cos(car.rotation.y)*carSpeed;

  follow(car.position);
}

// 🎥 CAMERA
function follow(t){
  camera.position.x = t.x;
  camera.position.z = t.z + 8;
  camera.position.y = 5;
  camera.lookAt(t);
}

// 🔁 ENTER / EXIT
window.addEventListener("keydown",(e)=>{
  if(e.key.toLowerCase()=="e" && player){
    let dist = player.position.distanceTo(car.position);

    if(!inCar && dist < 3){
      inCar = true;
    } else {
      inCar = false;
      player.position.set(car.position.x+2,0,car.position.z+2);
    }
  }
});

// 📱 MOBILE BUTTONS
function setupMobile(){
  const bind = (id, key) => {
    const el = document.getElementById(id);

    el.addEventListener("touchstart", ()=> keys[key]=true);
    el.addEventListener("touchend", ()=> keys[key]=false);

    el.addEventListener("mousedown", ()=> keys[key]=true);
    el.addEventListener("mouseup", ()=> keys[key]=false);
  };

  bind("up","w");
  bind("down","s");
  bind("left","a");
  bind("right","d");
}

// 🔄 LOOP
function animate(){
  requestAnimationFrame(animate);

  if(inCar){
    if(player) player.visible = false;
    updateCar();
  } else {
    if(player) player.visible = true;
    updatePlayer();
  }

  renderer.render(scene,camera);
}
