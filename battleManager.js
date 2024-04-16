import * as THREE from 'three';
import { Spacecraft } from './spacecraft.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';

export class battleManager{
    constructor(number_of_entites, radius_of_battle, middle_of_battle, scene){
        this.number_of_entites = number_of_entites;
        //this.makeNumEven(number_of_entites);
        this.radius_of_battle = radius_of_battle;
        this.middle_of_battle = middle_of_battle;

        this.activeMissiles = [];
        this.explodedMissile = [];

        this.teamOne = [];
        this.teamTwo = [];
        this.teams = [this.teamOne, this.teamTwo];
        this.spacecraftList = [];
        this.missileList = [];
        this.deltaTime = null;

        this.scene = scene;

        ///////////////////////////////
        //  Objects and Materials   //
        /////////////////////////////
        
        this.spacecraftGeometry = null;
        this.spacecraftMaterial = null;
 
        /*
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.mtl', (texture) => {
            this.spacecraftMaterial = new THREE.MeshPhongMaterial({ 
                map: texture,
                specular: 0x222222,
                shininess: 25
            });

            const objLoader = new OBJLoader();
            objLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.obj', (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        this.spacecraftGeometry = child.geometry;
                    }
                });
                // Now that we have the geometry and material, we can create spacecraft instances as needed
            });
        });
        */
        
    }

    async loadResources() {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        try {
            const materials = await new Promise((resolve, reject) => {
                mtlLoader.load('path/to/materials.mtl', (materials) => {
                    materials.preload();
                    resolve(materials);
                }, null, reject);
            });
    
            objLoader.setMaterials(materials);
            const object = await new Promise((resolve, reject) => {
                objLoader.load('path/to/model.obj', (loadedObject) => {
                    resolve(loadedObject);  // or traverse and find a specific geometry
                }, null, reject);
            });
    
            // Assuming object is a mesh or group with meshes
            this.spacecraftGeometry = object.children.find(child => child instanceof THREE.Mesh).geometry;
            this.spacecraftMaterial = new THREE.MeshPhongMaterial({
                map: materials.map,  // Assuming the map exists
                specular: 0x222222,
                shininess: 25
            });
        } catch (error) {
            console.error("Error loading model or materials:", error);
            throw error;  // Re-throw to handle it in initialize()
        }
    }
    

    async initialize() {
        await this.loadResources().catch(error => {
            console.error("Failed to load resources:", error);
            return;  // Stop the initialization process if resources fail to load
        });
        this.makeTeams();  // Proceed only if resources are successfully loaded
    }

    makeTeams(){
        let halves = this.number_of_entites/2;
        for(let i = 0; i<2; i++){
            for(let p = 0; p<halves; p++){

            let areaMin = this.middle_of_battle.clone().sub(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));
            let areaMax = this.middle_of_battle.clone().add(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));

            let spawnPosition = new THREE.Vector3(
                this.getRandomInt(areaMin.x, areaMax.x),
                this.getRandomInt(areaMin.y, areaMax.y),
                this.getRandomInt(areaMin.z, areaMax.z)
);
        
                const new_spacecraft = new Spacecraft(spawnPosition.x, spawnPosition.y, spawnPosition.z, 1000, 1, 25, 0, this.scene, i, this.spacecraftGeometry, this.spacecraftMaterial );
                this.teams[i].push(new_spacecraft);
                this.spacecraftList.push(new_spacecraft);
            }
        }
    }

    update(deltaTime){
        for(const spaceCraft of this.spacecraftList){
            if(spaceCraft.getSide() == 0){
                spaceCraft.update(this.teamTwo, deltaTime);
            }
            else if (spaceCraft.getSide() == 1){
                spaceCraft.update(this.teamOne, deltaTime);
            }
            spaceCraft.shipRenderer();
        this.missileList = [];

            for (const missile of spaceCraft.giveMissileList()){
                this.missileList.push(missile);
            }
        }
        this.manageMissiles(deltaTime);
    }

    manageMissiles(deltaTime){
        this.explodedMissile = [];
        for (const missile in this.missileList){
            if(missile.isExploded()){
                this.missileList = this.missileList.filter(elem => !this.explodedMissile.includes(elem));
            }
            else{
                missile.update(deltaTime);
                missile.missileRenderer(); 
            }  
        }
    }

    makeNumEven(number) {
        return number % 2 === 1 ? number + 1 : number;
    }
      
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    
}
