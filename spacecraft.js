import * as THREE from 'three';
import { Missile } from './missile.js'; 

export class spacecraft {

    constructor(x, y, z, health, speed, range, ammo, side) {
        this.position = new THREE.Vector3(x, y, z);  
        this.quaternion = new THREE.Quaternion();
        this.rotationSpeed = 0.05;
        this.targetQuaternion = new THREE.Quaternion();

        this.health = health;
        this.speed = speed; 
        this.ammo = ammo;
        this.range = range;

        this.enemy = null;
        this.side = side;
        this.missleList = [];

        this.dead = false;

        this.mesh = null;
        createMesh()
    }
         
    update(list, deltaTime) { 
        if(!this.dead){
            if(this.enemy == null){
                faceEnemy(list);
                
            }
            else{
                if (this.targetQuaternion){
                    THREE.Quaternion.slerp(this.quaternion, this.targetQuaternion, this.quaternion, deltaTime * this.rotationSpeed);
                }  
                while(this.position.distanceTo(this.target.position) > this.range){
                    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion);
                    forward.multiplyScalar(this.speed * deltaTime);
                    this.position.add(forward);
                }
    
                if(this.position.distanceTo(this.target.position) <= this.range){
                    for(let i = 0; i <this.ammo; i++){
                        const rocket = new Missile (this.position.x, this.position.y, this.position.z,50, 0.05, 100, this.target, 5000);
                        rocket.addSelfToMissileList(this.missleList);
                    }
                }
            }
        }
         

        if(this.health == 0){
            explode();
        }
    }

    createMesh(){
        
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
        return missleList;
    }

    explode() {
        const geometry = new THREE.SphereGeometry(5, 32, 32); // Larger radius for impact, adjust as needed
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color for explosion
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.dead = true;
        scene.add(explosion);

        setTimeout(() => {
            scene.remove(explosionMesh); 
        }, 3000);
    }
    
    
  }