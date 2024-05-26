import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { GUI } from './build/controls/dat.gui.module.js';

// Vertex Shader
const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader
const fragmentShader = `
uniform float time;
uniform vec3 pulseColor;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 color = vec3(1.0, 0.6, 0.0) * intensity; // Start with orange color

    // Color transition
    color = mix(color, vec3(1.0, 1.0, 0.0), smoothstep(0.0, 0.3, intensity)); // yellow to orange
    color = mix(color, vec3(0.0, 0.0, 0.0), smoothstep(0.3, 1.0, intensity)); // orange to black

    // Adding pulsating effect
    float pulse = 0.5 + 0.5 * sin(time * 2.0); // Slowed down the pulse by scaling time
    color *= pulse * pulseColor;

    gl_FragColor = vec4(color, 1.0);
}
`;

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x030D33, 0.5); // Lower intensity for ambient light
scene.add(ambientLight); 

// Point light to simulate light emission from the sphere
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Initial white light
pointLight.position.set(0, 0, 5);
scene.add(pointLight);

// Shader Material
const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        pulseColor: { value: new THREE.Color(1.0, 1.0, 1.0) } // Default to white
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

// GUI controls
const guiControls = {
  timeSpeed: 0.05,
  pulseColor: [255, 255, 255] // Default to white
};

const gui = new GUI();
gui.add(guiControls, 'timeSpeed', 0.001, 0.05).name('Time Speed'); // Increased the upper range to 1.0
gui.addColor(guiControls, 'pulseColor').name('Pulse Color').onChange(value => {
  shaderMaterial.uniforms.pulseColor.value.setRGB(value[0] / 255, value[1] / 255, value[2] / 255);
});

// Create a sphere geometry and add it to the scene
const geometry = new THREE.SphereGeometry(5, 32, 32);
const sphere = new THREE.Mesh(geometry, shaderMaterial);
scene.add(sphere);

// Create a plane to be affected by the light
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotate to be a floor
plane.position.y = -10; // Position it below the sphere
scene.add(plane);

// Set camera position
camera.position.z = 15;

// Function to calculate the pulsating color
function calculatePulseColor() {
    const time = shaderMaterial.uniforms.time.value;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.0);
    const color = new THREE.Color(1.0, 0.6, 0.0).multiplyScalar(pulse);

    // Mix with other colors
    const yellow = new THREE.Color(1.0, 1.0, 0.0);
    const black = new THREE.Color(0.0, 0.0, 0.0);
    const intensity = Math.pow(0.4 - Math.abs(Math.sin(time)), 2.0);

    let finalColor = color.clone().lerp(yellow, THREE.MathUtils.smoothstep(intensity, 0.0, 0.3));
    finalColor = finalColor.lerp(black, THREE.MathUtils.smoothstep(intensity, 0.3, 1.0));

    finalColor.multiply(shaderMaterial.uniforms.pulseColor.value);
    return finalColor;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update time uniform
    shaderMaterial.uniforms.time.value += guiControls.timeSpeed;

    // Update the point light color to match the sphere
    const pulseColor = calculatePulseColor();
    pointLight.color.set(pulseColor);

    // Update the point light position to match the sphere
    pointLight.position.copy(sphere.position);

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
