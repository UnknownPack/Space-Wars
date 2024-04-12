import { OBJLoader } from './build/loaders/OBJLoader.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';
import * as THREE from 'three';

export class Missile {
    constructor(x, y, z, speed, rotationSpeed, damage, target, timeLife,scene) {
        this.position = new THREE.Vector3(x, y, z);
        this.quaternion = new THREE.Quaternion();
        this.targetQuaternion = new THREE.Quaternion();
        this.speed = speed;
        this.rotationSpeed = rotationSpeed; 
        this.damage = damage;
        this.target = target;
        this.timeLife = timeLife;
        this.exploded = false;

        this.scene = scene;
        this.mesh = null;
        //this.createMesh();

        this.deltaTime = deltaTime;

        var geometry = new THREE.SphereGeometry(1, 32, 32); // radius, widthSegments, heightSegments
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // white color
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    update( deltaTime) { // Fixed reference
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
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
    }

    missileRenderer(){
        //checks if mesh is not null and if this mesh is not already in the scene
        if (this.mesh && !this.scene.getObjectById(this.mesh.id)) {
        //if both are true, it adds the boid mesh to the scene
            this.scene.add(this.mesh);
        }
    }

    /*
    createMesh(){
        // Load the OBJ file
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('./models/Space_Ships/agm-114HellFire/Texture/Texture.jpg');

        // Create a MeshPhongMaterial using the texture
        const phongMaterial = new THREE.MeshPhongMaterial({ 
        map: texture,
        specular: 0x222222,
        shininess: 25
        });

        const objLoader = new OBJLoader(); 
        objLoader.load('./models/Space_Ships/agm-114HellFire/AGM-114HellFire.obj', (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = phongMaterial;
                }
            });
            this.mesh = object; // Assign the loaded object to this.mesh
            this.scene.add(this.mesh);
            // No need to call MyUpdateLoop here; it should be part of your rendering loop.
        });        
    }
    */


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
        this.scene.add(explosion);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly lower intensity
        directionalLight.position.set(this.position); // Adjust direction as needed
        this.scene.add(directionalLight);
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.mesh.geometry) this.mesh.geometry.dispose();

        /*
        setTimeout(() => {
            scene.remove(explosionMesh); 
        }, 3000);
        this.scene.remove(this.mesh);
        */
        
    }

    isExploded(){
        return this.exploded;
    }
}
