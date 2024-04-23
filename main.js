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
 

 
 ////////////////////
//  Space Battle   //
///////////////////
const num_if_ships = 10;
const radius_of_battle = 150;
const middle_of_battle = new THREE.Vector3(0, 0, 0);
const theBattleManager = new battleManager ( num_if_ships, radius_of_battle, middle_of_battle, scene);
 
 

const backround = new Background(250, scene); 
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
  backround.update(deltaTime);
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