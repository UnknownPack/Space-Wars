import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { GUI } from './build/controls/dat.gui.module.js';

// Vertex Shader
const vertexShader = `
uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    // Calculate the displacement
    float displacement = sin(time * 2.0 + position.y * 10.0) * 0.2 
                       + cos(time * 3.0 + position.x * 15.0) * 0.2
                       + sin(time * 1.5 + position.z * 20.0) * 0.2;
    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float time;
uniform vec3 pulseColor;
uniform bool enablePulse;
varying vec3 vNormal;
varying vec3 vPosition;

// Function to convert HSL to RGB
vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;
    vec3 rgb;

    if (h < 1.0 / 6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0 / 6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0 / 6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0 / 6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0 / 6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + vec3(m);
}

void main() {
    float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    float hue = mod(time * 0.1, 1.0); // Calculate hue based on time
    vec3 rainbowColor = hsl2rgb(hue, 1.0, 0.5); // Convert HSL to RGB
    vec3 color = rainbowColor * intensity; // Apply intensity

    // Adding pulsating effect
    if (enablePulse) {
        float pulse = 0.5 + 0.5 * sin(time * 2.0); // Slowed down the pulse by scaling time
        color *= pulse * pulseColor;
    } else {
        color *= pulseColor;
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x030D33, 0.5); // Lower intensity for ambient light
scene.add(ambientLight);

// Directional light from above
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White directional light
directionalLight.position.set(0, 25, 0); // Position it above the sphere
directionalLight.castShadow = true; // Enable shadows for the directional light

// Update shadow camera settings
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

scene.add(directionalLight);

// Shader Material
const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        pulseColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, // Default to white
        enablePulse: { value: true }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

// Custom depth material to account for vertex displacement in shadows
const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    displacementMap: null,
    displacementScale: 1,
    displacementBias: 0
});

depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.time = shaderMaterial.uniforms.time;
    shader.vertexShader = `
        uniform float time;
        ${shader.vertexShader}
    `.replace(
        `#include <begin_vertex>`,
        `
        // Calculate the displacement
        float displacement = sin(time * 2.0 + position.y * 10.0) * 0.2 
                           + cos(time * 3.0 + position.x * 15.0) * 0.2
                           + sin(time * 1.5 + position.z * 20.0) * 0.2;
        vec3 transformed = position + normal * displacement;
        `
    );
};

// GUI controls
const guiControls = {
  timeSpeed: 0.01,
  pulseColor: [255, 255, 255], // Default to white
  scale: 1, // Default scale
  sphereVertices: 32, // Default number of vertices
  enablePulse: true // Default to pulsing enabled
};

const gui = new GUI();
gui.add(guiControls, 'timeSpeed', 0.001, 0.01).name('Time Speed'); 
gui.add(guiControls, 'scale', 0.1, 1.5).name('Scale').onChange(value => {
  sphere.scale.set(value, value, value);
});
gui.add(guiControls, 'sphereVertices', 0, 50).name('Vertices').onChange(value => {
  updateSphereGeometry(value);
});
gui.add(guiControls, 'enablePulse').name('Enable Pulse').onChange(value => {
  shaderMaterial.uniforms.enablePulse.value = value;
});

// Function to update the sphere geometry
function updateSphereGeometry(vertices) {
    const newGeometry = new THREE.SphereGeometry(5, vertices, vertices);
    sphere.geometry.dispose(); // Dispose the old geometry
    sphere.geometry = newGeometry; // Set the new geometry
}

// Create a sphere geometry and add it to the scene
const geometry = new THREE.SphereGeometry(5, guiControls.sphereVertices, guiControls.sphereVertices);
const sphere = new THREE.Mesh(geometry, shaderMaterial);
sphere.position.y = 5; // Bring the sphere higher in the scene
sphere.castShadow = true; // Enable shadow casting for the sphere
sphere.customDepthMaterial = depthMaterial; // Use custom depth material
scene.add(sphere);

// Create a plane to be affected by the light
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotate to be a floor
plane.position.y = -10; // Position it below the sphere
plane.receiveShadow = true; // Enable shadow receiving for the plane
scene.add(plane);

// Set camera position
camera.position.z = 15;

// Function to calculate the pulsating color
function calculatePulseColor(time, pulseColor) {
    // Replicate shader logic
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.0);

    // Base color calculations
    const baseColor = new THREE.Color(1.0, 0.6, 0.0);
    const yellow = new THREE.Color(1.0, 1.0, 0.0);
    const black = new THREE.Color(0.0, 0.0, 0.0);

    // Simulate intensity calculation from shader
    const intensity = Math.pow(0.4 - Math.abs(Math.sin(time)), 2.0);
    let color = baseColor.clone().multiplyScalar(intensity);

    // Color transitions
    color = color.clone().lerp(yellow, THREE.MathUtils.smoothstep(intensity, 0.0, 0.3));
    color = color.lerp(black, THREE.MathUtils.smoothstep(intensity, 0.3, 1.0));

    // Apply pulsating effect
    color.multiplyScalar(pulse);
    color.multiply(pulseColor);

    return color;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update time uniform
    shaderMaterial.uniforms.time.value += guiControls.timeSpeed;

    // Update the point light color to match the sphere
    const pulseColor = calculatePulseColor(shaderMaterial.uniforms.time.value, shaderMaterial.uniforms.pulseColor.value);

    renderer.render(scene, camera);
}
animate();

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();

// Update loop
function MyUpdateLoop() {
    renderer.render(scene, camera);
    var deltaTime = clock.getDelta();
    shaderMaterial.uniforms.time.value += guiControls.timeSpeed;
    requestAnimationFrame(MyUpdateLoop);
}

requestAnimationFrame(MyUpdateLoop);

// Keyboard functions, change parameters values
function handleKeyDown(event) {
    if (event.keyCode === 39) {
        // Example action: Increase something
    }
    if (event.keyCode === 37) {
        // Example action: Decrease something
    }
    if (event.keyCode === 32) {
        // Example action: Toggle something
    }
}

// Add keyboard listener
window.addEventListener('keydown', handleKeyDown, false);
