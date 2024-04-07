import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { EnvironmentGenerator } from './EnvironmentGenerator.js';
import { InteractionHandler } from './InteractionHandler.js';
import { BoidManager } from './BoidManager.js';
 


var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,1000);
camera.position.set(0,0,15);
camera.lookAt(0,0,1);

// Creates lightning environment
var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0,30,0);
scene.add(directionalLight);

// Creates the renderer
var renderer = new THREE.WebGLRenderer( );
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement );



 
//////////////
//  Boids   //
//////////////



  // Create boid manager
  //these paramters can be changed
  const numberOfBoids = 500;
  const obstacles = [];
  const velocity = 0.1;
  const maxSpeed = 0.1;
  const maxForce = 0.01;
  const searchRadius = 3;
  // change lightPoint Vector3 to light
  const lightPoint = new THREE.Vector3(0, 0, 0);
  const lightAttraction = 100;
  const spawnRadius = 10;
  const boidManager = new BoidManager(numberOfBoids, obstacles, velocity, maxSpeed, maxForce, searchRadius, lightAttraction, spawnRadius, scene);

  //add interacble objects
 
 
//////////////
// CONTROLS //
//////////////

// move mouse and: left   click to rotate,
//                 middle click to zoom,
//                 right  click to pan
// add the new control and link to the current camera to transform its position

var controls = new OrbitControls( camera, renderer.domElement );

//final update loop
var clock = new THREE.Clock();
var numberOfBoids_adjustable = numberOfBoids

/////////////////
// Update Loop //
////////////////
var MyUpdateLoop = function (){  
renderer.render(scene,camera);

var deltaTime = clock.getDelta();
//insert in method bellow, another method that returns the position of the light
boidManager.setLightPoint(lightPoint);
boidManager.updateBoids(deltaTime);
boidManager.manageBoids(numberOfBoids_adjustable)
 
 
//controls.update(); 

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

//this fucntion is called when the window is resized
var MyResize = function ( )
{
var width = window.innerWidth;
var height = window.innerHeight;
renderer.setSize(width,height);
camera.aspect = width/height;
camera.updateProjectionMatrix();
renderer.render(scene,camera);
};

//link the resize of the window to the update of the camera
window.addEventListener( 'resize', MyResize);