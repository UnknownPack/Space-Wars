import { OBJLoader } from './build/loaders/OBJLoader.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';
import * as THREE from 'three';

export class Missile {
    constructor(x, y, z, speed, rotationSpeed, damage, target, timeLife,scene, side ) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.targetQuaternion = new THREE.Quaternion();
        this.speed = speed;
        this.rotationSpeed = rotationSpeed; 
        this.damage = damage;
        this.target = target;
        this.timeLife = timeLife;
        this.exploded = false;
        this.side = side;
        this.scene = scene; 
        if (this.side === 1) {
            this.material = new THREE.MeshBasicMaterial({ color: 0xd17979 }); // Set color to #d17979
        } else {
            this.material = new THREE.MeshBasicMaterial({ color: 0x6f6ffc }); // Set color to #6f6ffc
        }

        const geometry = new THREE.SphereGeometry(2, 32, 32);
        this.mesh = new THREE.Mesh(geometry, this.material); 
        this.mesh.scale.set(1, 1, 1);
        this.scene.add(this.mesh);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 10); // Slightly lower intensity
        this.directionalLight.position.set(this.position);
        this.scene.add(this.directionalLight);
    }

    update(deltaTime) {
        this.directionalLight.position.set(this.position);
        this.timeLife -= deltaTime;
        this.faceEnemy(this.target);
        
        // Correct slerp usage
        this.quaternion.slerp(this.targetQuaternion, deltaTime * this.rotationSpeed);
    
        const direction = new THREE.Vector3().subVectors(this.target.position, this.position).normalize();
        const movement = direction.multiplyScalar(deltaTime * this.speed);
        this.position.add(movement);
    
        // Check for impact or end of life
        if (this.position.distanceTo(this.target.position) < 1 || this.timeLife <= 0 ||this.target == null) {
            this.explode();
            if (this.position.distanceTo(this.target.position) < 1) {
                this.target.takeDamage(this.damage);
            }
        } else {
            // Update the missile's mesh position and rotation
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        }  
        if (this.timeLife <= 0 && !this.exploded) {
            this.explode(); // Handle explosion which removes the mesh immediately
            // Schedule final cleanup 10 seconds after explosion
            setTimeout(() => {
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                    if (this.mesh.material) this.mesh.material.dispose();
                    if (this.mesh.geometry) this.mesh.geometry.dispose();
                }
            }, 10000);
        }
    }
    
    
    missileRenderer(){
        //checks if mesh is not null and if this mesh is not already in the scene
        if (this.mesh && !this.scene.getObjectById(this.mesh.id)) {
        //if both are true, it adds the boid mesh to the scene
            this.scene.add(this.mesh);
        }
    }  

    faceEnemy(target) { 
        const directionVector = new THREE.Vector3().subVectors(target.position, this.position).normalize();
        this.targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), directionVector);
    }

    explode() {
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        this.scene.add(explosion); 
        var directionalLight = new THREE.DirectionalLight(0xffffff, 15); // Slightly lower intensity
        directionalLight.position.set(this.position); // Adjust direction as needed
        this.scene.add(directionalLight);

        setTimeout(() => {
            if(this.mesh !=null)this.scene.remove(this.mesh);
            if (this.mesh.material) this.mesh.material.dispose();
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            this.scene.remove(explosion); 
        }, 2000);
        

        this.exploded = true;
    }
    

    isExploded(){
        return this.exploded;
    }
}
