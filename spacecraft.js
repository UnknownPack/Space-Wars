import * as THREE from 'three';
import { Missile } from './missile.js'; 
import { MTLLoader } from './build/loaders/MTLLoader.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';

export class Spacecraft {

    constructor(x, y, z, health, speed, range, ammo, scene, side, geometry, material) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.rotationSpeed = 0.05;
        this.targetQuaternion = new THREE.Quaternion();
    
        this.health = health;
        this.speed = speed;
        this.ammo = ammo;
        this.range = range;
    
        this.enemy = null;
        this.missleList = [];
        this.side = side;
    
        this.dead = false;
        this.scene = scene; 
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(0.35, 0.35, 0.35); 
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        if (this.side === 1) {
            this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);  // 180 degrees around Y-axis
        }
    
        // Apply this quaternion to the mesh
        this.mesh.quaternion.copy(this.quaternion); 
    }
         
    update(list, deltaTime) {   
        if (this.dead || !this.mesh) return;

        // Calculate the forward vector
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.quaternion);  // Apply the ship's current rotation to the forward vector

        // Update the position: Move the ship forward
        const velocity = forward.multiplyScalar(this.speed * deltaTime);
        this.position.add(velocity);

        // Check if the ship has an enemy and adjust orientation and position accordingly
        if (this.enemy === null) {
            this.faceEnemy(list);  // Find and face the closest enemy
        } 
        else {
            // Smoothly interpolate the current rotation towards the target rotation
            if (this.targetQuaternion) {
                this.quaternion.slerp(this.targetQuaternion, deltaTime * this.rotationSpeed);
            }

            // If within range, fire missiles
            if (this.position.distanceTo(this.enemy.position) <= this.range) {
                for (let i = 0; i < this.ammo; i++) {
                    const rocket = new Missile(this.position.x, this.position.y, this.position.z, 50, 0.05, 100, this.enemy, 5000, this.scene);
                    rocket.addSelfToMissileList(this.missileList);
                }
            }
        }

        // Sync the mesh position and rotation with the spacecraft's logical position and quaternion
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);

        // Check health and explode if necessary
        if (this.health <= 0) {
            this.explode();
        }
    }

    shipRenderer(){
        //checks if mesh is not null and if this mesh is not already in the scene
        if (this.mesh && !this.scene.getObjectById(this.mesh.id)) {
            //if both are true, it adds the boid mesh to the scene
            this.scene.add(this.mesh);
        }
    }

    searchForClosestEnemy(list){
        let closestShip = null;
        let shortestDistance = Number.MAX_VALUE;

        for (const ship of list) { 
            let distance = ship.distance;  

            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestShip = ship;
            }
        }
        this.enemy = closestShip;
        return closestShip;  
    }

   
    setTargetOrientation(targetQuaternion) {
        this.targetQuaternion = targetQuaternion;
    }

    faceEnemy(list){
        const closestEnemy = this.searchForClosestEnemy(list);
        if (closestEnemy) {
            const directionVector = new THREE.Vector3().subVectors(closestEnemy.position, this.position).normalize();
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), directionVector);
            this.setTargetOrientation(targetQuaternion);
        }
    }

    resetTargetQuat(){
        if(this.targetQuaternion){
            this.targetQuaternion = new THREE.Quaternion();
        }
    }

  
    giveMissileList(){
        return this.missleList;
    }

    explode() {
        const geometry = new THREE.SphereGeometry(5, 32, 32); // Larger radius for impact, adjust as needed
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color for explosion
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.dead = true;
        this.scene.add(explosion);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly lower intensity
        directionalLight.position.set(this.position); // Adjust direction as needed
        this.scene.add(directionalLight);
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        /*
        setTimeout(() => {
            this.scene.remove(explosionMesh); 
        }, 3000);
        */
        this.scene.remove(this.mesh);
 
    }
    
    getSide(){
        return this.side;
    }

    getPosition(){
        return this.position;
    }
  }