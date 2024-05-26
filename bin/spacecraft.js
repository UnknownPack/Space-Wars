import * as THREE from 'three';
import { Missile } from './missile.js'; 
import { MTLLoader } from '../build/loaders/MTLLoader.js';
import { OBJLoader } from '../build/loaders/OBJLoader.js';

export class Spacecraft {

    constructor(x, y, z, health, speed, range, ammo, scene, side, geometry, material, tooClose, rateOfFire ) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.rotationSpeed = 0.5;
        this.targetQuaternion = new THREE.Quaternion();
        this.health = health;
        this.speed = speed;
        this.ammo = ammo;
        this.initialAmmo = ammo;  
        this.range = range;
        this.tooClose = tooClose;
        this.enemy = null;
        this.missleList = [];
        this.side = side;
        this.dead = false;
        this.rateOfFire = rateOfFire;
        this.initialRateOfFire = rateOfFire;  
        this.scene = scene; 

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(0.07, 0.07, 0.07);
        this.evading = false;
        this.evadeStartTime = 0;
        this.evasionDuration = 5;  
        this.needToReload = false;
        this.reloadStartTime = 0;  
        this.reloadDuration = 10;  
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        this.distanceto_enemy = null; 

        if (this.side === 0) {
            this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);   
        } 
        this.mesh.quaternion.copy(this.quaternion);
    }
         
    update(list, deltaTime) {   
        
        if (!this.enemy) {
            this.faceEnemy(list);   
        }
        if (this.enemy) {
            this.distanceto_enemy = this.position.distanceTo(this.enemy.position); 
        }
        if (this.dead || !this.mesh || this.health <= 0) { 
            this.explode();
            return;
        }
        else{ 
            if (!this.evading && this.distanceto_enemy <= this.range && !this.enemy.isDead()) {
                this.fireMissiles(deltaTime);
            }
                 
        
            // Determine if we need to evade or attack based on distance
            if (this.distanceto_enemy <= this.tooClose) {
                // Too close, start evading
                if (!this.evading) { 
                    this.evading = true;
                    this.evadeStartTime = Date.now();
                    this.fireMissiles(deltaTime) // Reset the timer when starting evasion
                }
            } 
            else {
                // If we are evading but are no longer too close, we can stop evading
                if (this.evading && (Date.now() - this.evadeStartTime) / 100 > this.evasionDuration) { 
                    this.evading = false;
                }
                
                // If not evading and within range, attempt to fire
                if ( this.distanceto_enemy <= this.range && !this.enemy.isDead()) {
                    this.fireMissiles(deltaTime);
                }
            }
        
            // If currently evading, continue the maneuver
            if (this.evading) {
                this.evasiveManuver(deltaTime);
            } 
            else {
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
            else{
                if ( this.distanceto_enemy <= this.range && !this.enemy.isDead()) {
                    this.fireMissiles(deltaTime);
                }
            } 
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        } 
         
        this.updateMissiles(deltaTime);
    } 

    fireMissiles(deltaTime) {
        if (this.ammo > 0) {
            this.rateOfFire -= deltaTime;
            if (this.rateOfFire <= 0 && this.enemy) {   
                this.ammo--; 
                const missilePosition = this.position.clone();
                const rocket = new Missile(
                    missilePosition.x,
                    missilePosition.y,
                    missilePosition.z,
                    15, // Speed of the missile
                    0.05, // Rotation speed of the missile
                    250, // Damage of the missile
                    this.enemy, // Target of the missile
                    20, // Lifetime of the missile
                    this.scene,
                    this.side
                );
                this.missleList.push(rocket);
                this.rateOfFire = this.initialRateOfFire; // Reset rate of fire
    
                // Immediately call the missile's update method with the current deltaTime to avoid initial static state
                rocket.update(deltaTime);
                // Add the missile to the scene
                this.scene.add(rocket.mesh);
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
    
        const evadeTimeElapsed = (Date.now() - this.evadeStartTime) / 1000;   
        if (evadeTimeElapsed < this.evasionDuration || this.position.distanceTo(this.enemy.position) <= this.tooClose) { 
            const evadeDirection = new THREE.Vector3().subVectors(this.position, this.enemy.position).normalize(); 
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

    faceEnemy(list) {
        let closestEnemy = null;
        let shortestDistance = Number.MAX_VALUE;
    
        for (const ship of list) {
            if (!ship.isDead() && ship !== this) {
                let distance = this.position.distanceTo(ship.position);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestEnemy = ship;
                }
            }
        }
    
        this.enemy = closestEnemy; // Assign the closest living enemy that isn't itself
        if (this.enemy) {
            const directionVector = new THREE.Vector3().subVectors(this.enemy.position, this.position).normalize();
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), directionVector);
            this.setTargetOrientation(targetQuaternion);
        } else {
            this.resetTargetQuat(); // Reset orientation if no enemies are found
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

    updateMissiles(deltaTime) {
        for (let i = this.missleList.length - 1; i >= 0; i--) {
            const missile = this.missleList[i];
            if (missile.isExploded()) {
                // Remove the missile from the scene and the list
                this.scene.remove(missile.mesh);
                this.missleList.splice(i, 1);
            } else {
                missile.update(deltaTime); // Update missile logic
                missile.missileRenderer(); // Render missile
            }
        }
    }

    explode() { 
        const geometry = new THREE.SphereGeometry(12, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.dead = true;
        this.scene.add(explosion);
    
        // Add a light to simulate the explosion's flash
        var directionalLight = new THREE.DirectionalLight(0xffffff, 15);
        directionalLight.position.set(this.position);
        this.scene.add(directionalLight);
    
        // Dispose of the spacecraft's material and geometry 
        this.scene.remove(this.mesh); // Remove the spacecraft's mesh
         
         
        // Remove the explosion mesh after 3 seconds
        setTimeout(() => {
            if(this.mesh !=null) this.scene.remove(this.mesh); 
            if (this.mesh.material) this.mesh.material.dispose();
            if (this.mesh.geometry) this.mesh.geometry.dispose();
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

    isDead(){
        return this.dead;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
  }