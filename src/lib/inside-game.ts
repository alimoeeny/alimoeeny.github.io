import * as THREE from 'three';

// Basic scene setup (will be expanded in later steps)
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let gameContainer: HTMLElement | null;

const clock = new THREE.Clock();
const keyboardState: { [key: string]: boolean } = {};
const moveSpeed = 50; // Units per second
const globeCenter = new THREE.Vector3(0, 0, 0); // Center of the globe
const globeRadius = 500; // Must match the sphere's radius
let playerUp = new THREE.Vector3(0, 1, 0); // Player's current "up" direction

let isMouseLookActive = false;
let previousMousePosition = { x: 0, y: 0 };
const mouseSensitivity = 0.002; // Adjust as needed

function initGame(containerId: string): void {
  gameContainer = document.getElementById(containerId);
  if (!gameContainer) {
    console.error('Error: Game container not found!', containerId);
    return;
  }

  console.log('Initializing game in container:', gameContainer);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101010); // Dark background for now

  // Camera
  camera = new THREE.PerspectiveCamera(75, gameContainer.clientWidth / gameContainer.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 0); // Initial camera position, will be (0,0,0) for globe later

  // Create the globe geometry
  const globeGeometry = new THREE.SphereGeometry(500, 60, 40); // Radius 500, 60 width segments, 40 height segments

  // Create the globe material
  const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb, // Sky blue color for now
    side: THREE.BackSide // Render on the inside of the sphere
  });

  // Create the globe mesh and add it to the scene
  const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globeMesh);
  console.log('Globe sphere created and added to the scene.');

  // Add randomly placed cubes
  const cubeGeometry = new THREE.BoxGeometry(10, 10, 10); // Standard 10x10x10 cube
  const cubeMaterial = new THREE.MeshStandardMaterial({ // Using MeshStandardMaterial for potential lighting later
    color: 0xff8844, // An orange-ish color for the cubes
    roughness: 0.7,
    metalness: 0.1
  });

  const numberOfCubes = 50; // Let's add 50 cubes
  const placementRadius = 480; // Place cubes within a radius slightly smaller than the globe (radius 500) to avoid direct contact with the sphere wall

  for (let i = 0; i < numberOfCubes; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Generate random spherical coordinates
    const phi = Math.acos(-1 + (2 * Math.random())); // Angle from the positive Y-axis (0 to PI)
    const theta = Math.random() * 2 * Math.PI; // Angle around the Y-axis (0 to 2PI)
    const r = Math.random() * placementRadius; // Random radius up to placementRadius

    // Convert spherical coordinates to Cartesian coordinates
    cube.position.x = r * Math.sin(phi) * Math.cos(theta);
    cube.position.y = r * Math.sin(phi) * Math.sin(theta);
    cube.position.z = r * Math.cos(phi);
    
    // Ensure cubes are not exactly at the origin (where the camera is)
    if (cube.position.length() < 5) { // If too close to center, push it out a bit
       cube.position.normalize().multiplyScalar(5);
    }

    scene.add(cube);
  }
  console.log(`${numberOfCubes} cubes created and added to the scene.`);

  // Add basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white ambient light, half intensity
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000); // White point light, 0.8 intensity, affects objects up to 1000 units away
  pointLight.position.set(0, 10, 20); // Position it slightly above and in front of the camera's initial viewpoint
  scene.add(pointLight);
  
  console.log('Ambient and Point lights added to the scene.');

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
  gameContainer.appendChild(renderer.domElement);
  
  // Initial render to make sure it's working
  // renderer.render(scene, camera); // Removed as animate loop will handle rendering
  // console.log('Three.js scene initialized and rendered once.'); // Removed

  // Mouse look controls
  gameContainer.addEventListener('mousedown', () => {
    gameContainer.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => { // Corrected the arrow function syntax
    if (document.pointerLockElement === gameContainer) {
      isMouseLookActive = true;
      console.log('Pointer locked');
    } else {
      isMouseLookActive = false;
      console.log('Pointer unlocked');
    }
  });
  
  document.addEventListener('mousemove', (event) => {
    if (!isMouseLookActive) {
      return;
    }

    const deltaX = event.movementX || 0;
    const deltaY = event.movementY || 0;

    // Rotate around the Y-axis (yaw) - affects the entire camera object
    camera.rotation.y -= deltaX * mouseSensitivity;

    // Rotate around the X-axis (pitch) - affects the camera's local X-axis
    // Clamp pitch to prevent flipping upside down
    camera.rotation.x -= deltaY * mouseSensitivity;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    
    // Ensure the rotation order is YXZ for intuitive FPS-style controls
    camera.rotation.order = 'YXZ'; 

  }, false);

  console.log('Mouse look controls initialized.');

  // Keyboard controls
  document.addEventListener('keydown', (event) => {
    keyboardState[event.code] = true;
  });

  document.addEventListener('keyup', (event) => {
    keyboardState[event.code] = false;
  });

  console.log('Keyboard controls initialized.');

  // Handle window resize
  window.addEventListener('resize', () => {
    if (gameContainer && camera && renderer) {
      const newWidth = gameContainer.clientWidth;
      const newHeight = gameContainer.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    }
  }, false);

  console.log('Window resize listener added.');

  // Start the animation loop
  animate();
  console.log('Animation loop started.');
}

function updatePlayer(deltaTime: number): void {
  if (!camera) return; // Camera might not be initialized yet

  const moveDirection = new THREE.Vector3(0, 0, 0);
  const currentSpeed = moveSpeed * deltaTime;

  // Forward/Backward movement (relative to camera's direction)
  if (keyboardState['KeyW'] || keyboardState['ArrowUp']) {
    moveDirection.z -= 1;
  }
  if (keyboardState['KeyS'] || keyboardState['ArrowDown']) {
    moveDirection.z += 1;
  }
  // Strafe Left/Right movement (relative to camera's direction)
  if (keyboardState['KeyA'] || keyboardState['ArrowLeft']) {
    moveDirection.x -= 1;
  }
  if (keyboardState['KeyD'] || keyboardState['ArrowRight']) {
    moveDirection.x += 1;
  }

  if (moveDirection.lengthSq() === 0) return; // No movement input

  // Apply movement relative to camera's current orientation (ignoring pitch for planar movement on sphere surface)
  const worldDirection = camera.getWorldDirection(new THREE.Vector3());
  const rightDirection = new THREE.Vector3().crossVectors(camera.up, worldDirection).normalize(); // Camera's local right, assuming camera.up is aligned with playerUp

  const movement = new THREE.Vector3();
  movement.addScaledVector(worldDirection, -moveDirection.z * currentSpeed); // Negative Z because Three.js camera looks down -Z
  movement.addScaledVector(rightDirection, moveDirection.x * currentSpeed);

  // Project movement onto the plane defined by playerUp
  // This simplifies movement to be tangent to the sphere at the player's feet.
  movement.projectOnPlane(playerUp);
  
  camera.position.add(movement);

  // --- Spherical Gravity Adjustment ---
  // 1. Keep player on the surface of the sphere (or very close to it)
  //    Vector from center to player
  const toPlayer = camera.position.clone().sub(globeCenter);
  toPlayer.normalize().multiplyScalar(globeRadius - 2.0); // Keep player 2 units above "ground" (adjust as needed for camera height)
  camera.position.copy(globeCenter).add(toPlayer);

  // 2. Update player's "up" vector
  //    The new "up" is the direction from the sphere's center to the player's new position.
  playerUp = camera.position.clone().sub(globeCenter).normalize();

  // 3. Re-orient the camera to align with the new "up" vector
  //    The camera should look towards the horizon of the sphere.
  //    We need a stable "forward" direction for the lookAt.
  //    Let's use the current look direction projected onto the new tangent plane.
  
  const lookTarget = new THREE.Vector3();
  camera.getWorldDirection(lookTarget); // Get current look direction
  lookTarget.add(camera.position); // Make it a point in space

  // Align camera's up vector with the new playerUp
  camera.up.copy(playerUp);
  
  // Make the camera look at the target point, using the new 'up'
  // This will adjust the camera's orientation to match the spherical surface.
  camera.lookAt(lookTarget);
}

function animate(): void {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta(); // Get time difference between frames

  // Update game logic that depends on time
  updatePlayer(deltaTime); 

  // Render the scene
  if (renderer && scene && camera) { // Ensure they are initialized
    renderer.render(scene, camera);
  }
}

// Expose the init function to be called from Astro page
export { initGame };
