import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { battleManager } from './battleManager.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';
var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,4000);
camera.position.set(0, 0, -30);
camera.lookAt(0, 0, 0);

var directionalLight = new THREE.DirectionalLight(0xffffff, 100);
directionalLight.position.set(5, 3, 5); // Adjust position to suit scene setup
scene.add(directionalLight);

// Modify the lighting environment
var ambientLight = new THREE.AmbientLight("#100d69", 1); // Lower intensity for ambient light
scene.add(ambientLight);
/*
var pointLight = new THREE.PointLight("#100d69", 1, 100, 2); // Add a point light for sharper highlights
pointLight.position.set(1, 1, 1); // Position the point light
scene.add(pointLight);

// You can also add a directional light similar to the sun's light
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly lower intensity
directionalLight.position.set(0, 1, 0); // Adjust direction as needed
scene.add(directionalLight);
 
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0,30,0);
scene.add(directionalLight);
*/

// Creates the renderer
var renderer = new THREE.WebGLRenderer();
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
const num_if_ships = 2;
const radius_of_battle = 100;
const middle_of_battle = new THREE.Vector3(0, 0, 0);
const theBattleManager = new battleManager ( num_if_ships, radius_of_battle, middle_of_battle, scene);
 
 
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