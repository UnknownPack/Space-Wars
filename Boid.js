import * as THREE from 'three';

export class Boid{
    constructor(position, velocity, maxSpeed, maxForce, searchRadius, lightPoint, lightAttraction, scene) { 
        this.position = position; 
        this.velocity = velocity; 
        this.maxSpeed = maxSpeed; 
        this.maxForce = maxForce; 
        this.lightPoint = lightPoint;  
        this.lightAttraction = lightAttraction;
        this.searchRadius = searchRadius; 
        this.scene = scene;
        this.boidMesh = null;  
        this.boundingSphere = null;
        this.spatialKey = '';
        this.initBoidMesh();
        this.initBoundingSphere();
    }
    
    update(){
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        if (this.boidMesh) {
            //sets boid mesh position
            this.boidMesh.position.copy(this.position);
        }
        if (this.boundingSphere) {
            this.boundingSphere.center.copy(this.position);
        }
    }
    
    boieRender(){
        //checks if boidMesh is not null and if this mesh is not already in the scene
        if (this.boidMesh && !this.scene.getObjectById(this.boidMesh.id)) {
            //if both are true, it adds the boid mesh to the scene
            this.scene.add(this.boidMesh);
        }
    }
    
    initBoidMesh() {
        // I'd reckon you can change the mesh of the moth here
        // I will use spheres to represent the moth
    
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.boidMesh = new THREE.Mesh(geometry, material);
        this.boidMesh.position.copy(this.position);
    }

    initBoundingSphere() {
        // this will be the volume upon which collision detection checks will be made
        let sphereRadius = this.searchRadius * 2; 
        this.boundingSphere = new THREE.Sphere(this.position.clone(), sphereRadius);
    }
    
    applyForce(force, deltaTime) {

        //current direction of object - force direction
        var direction = new THREE.Vector3(0, 0, 0);
        


        const inertiaFactor = 0.1; // Adjusted for more immediate response
        const smoothedForce = force.clone().multiplyScalar(deltaTime * inertiaFactor);
    
        // Apply force directly, without shuffling axes
        this.velocity.add(smoothedForce);
        this.velocity.clampLength(0, this.maxSpeed);
    }
    

    randomMovement(){

    }
    
    attractionToLight(){
        if (!this.lightPoint) return new THREE.Vector3(0, 0, 0); // Return a zero vector if lightPoint is not set
        const lightAttractionForce = new THREE.Vector3().subVectors(this.lightPoint, this.position);
        lightAttractionForce.multiplyScalar(this.lightAttraction); 
        return lightAttractionForce;
    }
    
    avoidanceBehaviour(obstacles) {
        let avoidanceForce = new THREE.Vector3();
        // Define a maximum magnitude for the avoidance force
        const maxAvoidanceForce = 0.05;
    
        for (let obstacle of obstacles) {  
            if (obstacle !== this) { 
                var distance = this.position.distanceTo(obstacle.position);  
                if (distance < this.searchRadius) {  
                    var direction = new THREE.Vector3().subVectors(this.position, obstacle.position).normalize(); 
                    avoidanceForce.add(direction);  
                }
            }
        }
        
        if (avoidanceForce.length() > maxAvoidanceForce) {
            avoidanceForce.normalize().multiplyScalar(maxAvoidanceForce);
        }
    
        return avoidanceForce;
    }

    updateSpatialKey(spatialKey){
        this.spatialKey = spatialKey;
    }

    giveSpatialKey(){
        return this.spatialKey;
    }   

    givePos(){
        return this.position;
    }
  } 

  function easeInOut(t) {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        return -1 + (4 - 2 * t) * t;
    }
}