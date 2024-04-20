import * as THREE from 'three';
import { Missile } from './missile.js'; 
import { MTLLoader } from './build/loaders/MTLLoader.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';

export class Spacecraft {

    constructor(x, y, z, health, speed, range, ammo, scene, side, geometry, material, tooClose, rateOfFire) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.rotationSpeed = 0.5;
        this.targetQuaternion = new THREE.Quaternion();
        this.health = health;
        this.speed = speed;
        this.ammo = ammo;
        this.initialAmmo = ammo; // Store the initial ammo count
        this.range = range;
        this.tooClose = tooClose;
        this.enemy = null;
        this.missleList = [];
        this.side = side;
        this.dead = false;
        this.rateOfFire = rateOfFire;
        this.initialRateOfFire = rateOfFire; // Store the initial rate of fire
        this.scene = scene;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(0.07, 0.07, 0.07);
        this.evading = false;
        this.evadeStartTime = 0;
        this.evasionDuration = 5; // Duration of evasion in seconds
        this.needToReload = false;
        this.reloadStartTime = 0; // Track the start time of reloading
        this.reloadDuration = 10; // Duration to reload in seconds
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        if (this.side === 1) {
            this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI); // Rotate 180 degrees around Y-axis
        }
        this.mesh.quaternion.copy(this.quaternion);
    }
         
    update(list, deltaTime) {   
        if (this.dead || !this.mesh) {
            console.log("I AM DEAD");
            this.explode();
            return;
        }
    
        // Always face the closest enemy
        this.faceEnemy(list);
    
        // Determine distance to enemy
        let distanceToEnemy = this.enemy ? this.position.distanceTo(this.enemy.position) : Infinity;
    
        // Determine if we need to evade or attack based on distance
        if (distanceToEnemy <= this.tooClose) {
            // Too close, start evading
            if (!this.evading) { 
                this.evading = true;
                this.evadeStartTime = Date.now(); // Reset the timer when starting evasion
            }
        } 
        else {
            // If we are evading but are no longer too close, we can stop evading
            if (this.evading && (Date.now() - this.evadeStartTime) / 1000 > this.evasionDuration) { 
                this.evading = false;
            }
            
            // If not evading and within range, attempt to fire
            if ( distanceToEnemy <= this.range) {
                this.fireMissiles(deltaTime);
            }
        }
    
        // If currently evading, continue the maneuver
        if (this.evading) {
            this.evasiveManuver(deltaTime);
        } else {
            // Not evading, so we move towards or maintain our position relative to the enemy
            // Smoothly interpolate the current rotation towards the target rotation
            this.quaternion.slerp(this.targetQuaternion, deltaTime * this.rotationSpeed);
    
            // Move the ship forward
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(this.quaternion); // Apply the ship's current rotation to the forward vector
            const velocity = forward.multiplyScalar(this.speed * deltaTime);
            this.position.add(velocity);
        }
    
        // Reload if needed
        if (this.needToReload) {
            this.reloadMissiles(deltaTime);
        }
    
        // Sync the mesh position and rotation with the spacecraft's logical position and quaternion
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
    
        // Check health and explode if necessary
        if (this.health <= 0) {
            this.explode();
        } 
    }
    /*
    
    fireMissiles(deltaTime) {
        var ammo = this.ammo; 
        let thisRateOfFire = this.rateOfFire;
        thisRateOfFire-=deltaTime;
        for (let i = 0; i < ammo; i++) {
            if(thisRateOfFire  == 0){
                this.ammo--;
                console.log("fired missile! " + this.ammo + " missiles left." );
                const rocket = new Missile(this.position.x, this.position.y, this.position.z, 15, 0.05, 100, this.enemy, 5000, this.scene);
                this.missleList.push(rocket);
            }
        }   
        if(ammo == 0){
            this.needToReload = true;
        }
    }
    */

    fireMissiles(deltaTime) {
        if (this.ammo > 0) {
            this.rateOfFire -= deltaTime;
            if (this.rateOfFire <= 0) {
                this.ammo--;
                console.log("Missile fired, ammo left: " + this.ammo);
                const rocket = new Missile(
                    this.position.x,
                    this.position.y,
                    this.position.z,
                    15, 0.05,
                    500,
                    this.enemy,
                    5000,
                    this.scene
                );
                this.missleList.push(rocket);
                this.rateOfFire = this.initialRateOfFire; // Reset rate of fire
            }
        }
        if (this.ammo == 0 && !this.needToReload) {
            this.needToReload = true;
            this.reloadStartTime = Date.now(); // Start reload timer
        }
    } 

    reloadMissiles(deltaTime) {
        if (this.needToReload) {
            const reloadElapsedTime = (Date.now() - this.reloadStartTime) / 1000;
            if (reloadElapsedTime >= this.reloadDuration) {
                this.ammo = this.initialAmmo; // Reset ammo to full
                this.needToReload = false;
                this.rateOfFire = this.initialRateOfFire; // Reset rate of fire
            }
        }
    }

    evasiveManuver(deltaTime) {
        if (!this.evading) {
            this.evadeStartTime = Date.now();  // Store the start time of evasion
            this.evading = true;
        }
    
        const evadeTimeElapsed = (Date.now() - this.evadeStartTime) / 1000;  // Convert to seconds
    
        // Evade if the elapsed time is less than the evasion duration or if the enemy is still too close
        if (evadeTimeElapsed < this.evasionDuration || this.position.distanceTo(this.enemy.position) <= this.tooClose) {
            // If the enemy is too close, move in the opposite direction
            const evadeDirection = new THREE.Vector3().subVectors(this.position, this.enemy.position).normalize();
            
            // Apply the evasion direction to the current position
            const newPosition = this.position.clone().addScaledVector(evadeDirection, this.speed * deltaTime);
            this.position.copy(newPosition);
    
            // Reset the evade start time if the enemy is still too close, to continue evading
            if (this.position.distanceTo(this.enemy.position) <= this.tooClose) {
                this.evadeStartTime = Date.now();
            }
        } else {
            // Evasion complete, reset flags and state
            this.evading = false;
            this.evadeStartTime = 0;
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
            let distance = this.position.distanceTo(ship.position); // Correct distance calculation
    
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestShip = ship;
            }
        }
        this.enemy = closestShip; // Ensure that this line is being reached 
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
        this.enemy = closestEnemy;
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
        console.log("I have exploded");
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.dead = true;
        this.scene.add(explosion);
    
        // Add a light to simulate the explosion's flash
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(this.position);
        this.scene.add(directionalLight);
    
        // Dispose of the spacecraft's material and geometry
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        this.scene.remove(this.mesh); // Remove the spacecraft's mesh
    
        // Remove the explosion mesh after 3 seconds
        setTimeout(() => {
            this.scene.remove(explosion);
            this.scene.remove(directionalLight); // Also remove the directional light from the scene
        }, 3000);
    }
    

    takeDamage(damage){
        this.health -= damage;
    }
    
    getSide(){
        return this.side;
    }

    getPosition(){
        return this.position;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
  }