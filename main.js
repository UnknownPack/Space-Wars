import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { EnvironmentGenerator } from './EnvironmentGenerator.js';
import { InteractionHandler } from './InteractionHandler.js'; 
import { MTLLoader } from './build/loaders/MTLLoader.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';
 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./models/Space_Ships/sof/material_29.jpg');
// Create a MeshPhongMaterial using the texture
const phongMaterial = new THREE.MeshPhongMaterial({ 
  map: texture,
  specular: 0x222222,
  shininess: 25
});

// Load the OBJ file
const objLoader = new OBJLoader();
objLoader.load('./models/Space_Ships/sof/sof_.obj', function(object) {
  object.traverse(function(child) {
    if (child.isMesh) {
      child.material = phongMaterial; // Apply the Phong material to each mesh
    }
  });
  scene.add(object);
  MyUpdateLoop(); // Ensure MyUpdateLoop is defined to animate your scene
});

 

 

var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,1000);
camera.position.set(0,0,15);
camera.lookAt(0,0,1);

// Modify the lighting environment
var ambientLight = new THREE.AmbientLight("#100d69", 0.6); // Lower intensity for ambient light
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xffffff, 1, 100); // Add a point light for sharper highlights
pointLight.position.set(51, 51, 51); // Position the point light
scene.add(pointLight);

// You can also add a directional light similar to the sun's light
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly lower intensity
directionalLight.position.set(0, 1, 0); // Adjust direction as needed
//scene.add(directionalLight);
 
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0,30,0);
//scene.add(directionalLight);


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

/////////////////
// Update Loop //
////////////////
var MyUpdateLoop = function (){  
renderer.render(scene,camera);

var deltaTime = clock.getDelta();
//insert in method bellow, another method that returns the position of the light 
 
 
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