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
        this.range = range;
        this.tooClose = tooClose;
        this.enemy = null;
        this.missleList = [];
        this.side = side; 
        this.dead = false;
        this.rateOfFire = rateOfFire;
        this.scene = scene; 
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(0.07, 0.07, 0.07); 
        this.evading = false;
        this.evadeStartTime = 0;
        this.evasionDuration = 5;
        this.needToReload = false;
      //this.mesh.scale.set(0.005, 0.005, 0.005); 
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        if (this.side === 1) {
            this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);  // 180 degrees around Y-axis
        }
    
        // Apply this quaternion to the mesh
        this.mesh.quaternion.copy(this.quaternion); 
    }
         
    update(list, deltaTime) {   
        if (this.dead || !this.mesh) {
            console.log("I AM DEAD");
            return;
        }
    
        // Check if the ship has an enemy and adjust orientation and position accordingly
        if (this.enemy == null) {
            this.faceEnemy(list);  // Find and face the closest enemy
        } else {
            if(this.evading == false || this.needToReload == false){
                 // Recalculate the target orientation every frame
            this.faceEnemy(list);  // Optionally, you could only call this when the enemy has moved significantly
    
            // Smoothly interpolate the current rotation towards the target rotation
            this.quaternion.slerp(this.targetQuaternion, deltaTime * this.rotationSpeed);
    
            // Move the ship forward if not within firing range
            
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(this.quaternion);  // Apply the ship's current rotation to the forward vector
            const velocity = forward.multiplyScalar(this.speed * deltaTime);
            this.position.add(velocity);
            if(!this.evading && this.position.distanceTo(this.enemy.position) <= this.range && this.position.distanceTo(this.enemy.position) >this.tooClose) {
                    // If within range, fire missiles
                this.fireMissiles(deltaTime);
            }
            if(this.position.distanceTo(this.enemy.position)<=this.tooClose){
                this.evading = true; 
                }
            }
            else{
                this.evasiveManuver(deltaTime); 
            } 
        }

        
        if(this.needToReload == true){
            reloadMissiles(deltaTime);
        }
    
        // Sync the mesh position and rotation with the spacecraft's logical position and quaternion
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
    
        // Check health and explode if necessary
        if (this.health <= 0) {
            this.explode();
        } 
    }
    
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

    fireMissiles(deltaTime) {
        var ammo = this.ammo; 
        let thisRateOfFire = this.rateOfFire;

        thisRateOfFire-=deltaTime;
        if (thisRateOfFire <= 0 && ammo > 0) {
            ammo--;
            console.log("fired missile! " + this.ammo + " missiles left.");
            const rocket = new Missile(this.position.x, this.position.y, this.position.z, 15, 0.05, 100, this.enemy, 5000, this.scene);
            this.missleList.push(rocket);
            thisRateOfFire =this.rateOfFire; 
        }
        if (this.ammo == 0) {
            this.needToReload = true;
        }
    } 

    reloadMissiles(deltaTime) { 
        let timeSinceReload = 0;
        timeSinceReload += deltaTime;
            if (this.timeSinceReload >= 10) {
                this.needToReload = false; 
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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
  }