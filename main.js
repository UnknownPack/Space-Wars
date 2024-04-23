import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { battleManager } from './battleManager.js';
import { Background } from './background.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';
import dat from './build/controls/dat.gui.module.js';




var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight; 
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,4000);
camera.position.set(0, 0, -200);
camera.lookAt(0, 0, 0);

var ambientLight = new THREE.AmbientLight(0x030D33, 0.5); // Lower intensity for ambient light
scene.add(ambientLight); 

// Creates the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new THREE.Color('black'));  // Set a clear color different from your object colors
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

////////////////////////////////////////////////////////////////////////////

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0, 0);
 
 

 
 ////////////////////
//  Space Battle   //
///////////////////
const num_if_ships = 8;
const radius_of_battle = 150;
const middle_of_battle = new THREE.Vector3(0, 0, 0);
const theBattleManager = new battleManager ( num_if_ships, radius_of_battle, middle_of_battle, scene);

var settings = {
  num_of_ships: 8,
  radius_of_battle: 150
};

// Create a new dat.GUI instance
var gui = new dat.GUI();
gui.add(settings, 'num_of_ships', 1, 20).onChange(updateScene);
gui.add(settings, 'radius_of_battle', 100, 300).onChange(updateScene);

function updateScene() {
  // Remove existing ships/battle elements
  clearBattleScene();

  // Add new ships/battle elements based on updated settings
  const middle_of_battle = new THREE.Vector3(0, 0, 0);
  theBattleManager = new battleManager(settings.num_of_ships, settings.radius_of_battle, middle_of_battle, scene);

  // Refresh or recreate other scene elements as necessary
  // ...

  // You might need to call a render or update function if your scene doesn't automatically update
  renderer.render(scene, camera);
}

function clearBattleScene() {
  // Implement the logic to remove ships or other elements from the scene
  // For example, if you have an array storing your ships, you could loop through it and remove each ship from the scene:
  theBattleManager.clearList();
  // Don't forget to dispose of geometries, materials, and textures if you're not using them anymore
}
 

const backround = new Background(scene); 
//////////////
// CONTROLS //
//////////////

// move mouse and: left   click to rotate,
//                 middle click to zoom,
//                 right  click to pan
// add the new control and link to the current camera to transform its position

var controls = new OrbitControls( camera, renderer.domElement );
var clock = new THREE.Clock(); 

/////////////////
// Update Loop //
////////////////
var MyUpdateLoop = function (){  
  renderer.render(scene,camera);
  var deltaTime = clock.getDelta();
  theBattleManager.update(deltaTime); 
  requestAnimationFrame(MyUpdateLoop);
  };

  requestAnimationFrame(MyUpdateLoop);

//keyboard functions, change parameters values
function handleKeyDown(event) {
  if (event.keyCode === 39)
  {
    ClearScene();
    n++;
    CreateScene();
  }
  if (event.keyCode === 37)
  {
    ClearScene();
    n--;
    n=Math.max(n,5);
    CreateScene();
  }
  if (event.keyCode === 32)
  {
    reverse=!reverse;
  }
}

//add keyboard listener
window.addEventListener('keydown', handleKeyDown, false);