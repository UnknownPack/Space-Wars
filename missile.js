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

        var geometry = new THREE.SphereGeometry(5, 32, 32); // radius, widthSegments, heightSegments
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // white color
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        this.timeLife -= deltaTime;
        this.faceEnemy(this.target);
        
        // Correct slerp usage
        this.quaternion.slerp(this.targetQuaternion, deltaTime * this.rotationSpeed);
    
        const direction = new THREE.Vector3().subVectors(this.target.position, this.position).normalize();
        const movement = direction.multiplyScalar(deltaTime * this.speed);
        this.position.add(movement);
    
        // Check for impact or end of life
        if (this.position.distanceTo(this.target.position) < 1 || this.timeLife <= 0) {
            this.explode();
            if (this.position.distanceTo(this.target.position) < 1) {
                this.target.takeDamage(this.damage);
            }
        } else {
            // Update the missile's mesh position and rotation
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        }  
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
        
        
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.obj', (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xffffff, // Example: Set a default color or use loaded materials
                        });
                        this.spacecraftGeometry = child.geometry;
                        this.spacecraftMaterial = child.material;
                        this.makeTeams(); // Ensure this is called only after the geometry and materials are fully prepared
                    }
                }); 
            }, null, (error) => {
                console.error('An error happened during OBJ loading:', error);
            });
        });
    }
    */


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
        this.scene.remove(this.mesh);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Slightly lower intensity
        directionalLight.position.set(this.position); // Adjust direction as needed
        this.scene.add(directionalLight);
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.mesh.geometry) this.mesh.geometry.dispose();

        setTimeout(() => {
            this.scene.remove(explosion); 
        }, 2000);
        this.scene.remove(this.mesh);

        this.exploded = true;
    }
    

    isExploded(){
        return this.exploded;
    }
}
