import * as THREE from 'three';

export class Missile {
    constructor(x, y, z, speed, rotationSpeed, damage, target, timeLife) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.targetQuaternion = new THREE.Quaternion();
        this.speed = speed;
        this.rotationSpeed = rotationSpeed; 
        this.damage = damage;
        this.target = target;
        this.timeLife = timeLife;
        this.addedToList = false; // Fixed scoping
        this.exploded = false;
    }

    update(list, deltaTime) {
        if (!this.addedToList) this.addSelfToMissileList(list); // Fixed reference
        this.faceEnemy(this.target);
        
        while(timeLife>0){
            this.timeLife-=deltaTime;
            if (!this.quaternion.equals(this.targetQuaternion)) {
                THREE.Quaternion.slerp(this.quaternion, this.targetQuaternion, this.quaternion, deltaTime * this.rotationSpeed);
            }
    
            // Simplified movement logic
            const direction = new THREE.Vector3().subVectors(this.target.position, this.position).normalize();
            const movement = direction.multiplyScalar(deltaTime * this.speed);
            this.position.add(movement);
    
            // Check for explosion condition
            if (this.position.distanceTo(this.target.position) < 1) { // Threshold check
                this.explode();
            }
        }
        if(timeLife==0){
            this.explode();
        }
    }

    addSelfToMissileList(list) {
        list.push(this); // Assuming list is an array
        this.addedToList = true;
    }

    faceEnemy(target) { 
        const directionVector = new THREE.Vector3().subVectors(target.position, this.position).normalize();
        this.targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), directionVector);
    }

    explode() {
        const geometry = new THREE.SphereGeometry(5, 32, 32); // Larger radius for impact, adjust as needed
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color for explosion
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.exploded = true;
        scene.add(explosion);

        setTimeout(() => {
            scene.remove(explosionMesh); 
        }, 3000);
    }

    isExploded(){
        return this.exploded;
    }
}
