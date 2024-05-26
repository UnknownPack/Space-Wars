import * as THREE from 'three';
import { Spacecraft } from './spacecraft.js';
import { OBJLoader } from './build/loaders/OBJLoader.js';
import { MTLLoader } from './build/loaders/MTLLoader.js';

export class battleManager {
    constructor(number_of_entities, radius_of_battle, middle_of_battle, scene) {
        this.number_of_entities = number_of_entities;
        this.radius_of_battle = radius_of_battle;
        this.middle_of_battle = middle_of_battle;
        this.scene = scene;
        this.spacecraftList = [];
        this.missileList = [];
        this.deltaTime = null;

        this.teamOne = [];
        this.teamTwo = [];
        this.teams = [this.teamOne, this.teamTwo];
        this.spacecraftList = [];
        this.scene = scene;  
        ///////////////////////////////
        //  Objects and Materials   //
        /////////////////////////////
         
         // Ensure that materials are loaded before loading the object
         const mtlLoader = new MTLLoader();
         mtlLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.mtl', (materials) => {
             materials.preload();
             const objLoader = new OBJLoader();
             objLoader.setMaterials(materials);
             objLoader.load('./models/Space_Ships/Ship1/Starcruiser_military.obj', (object) => {
                 const textureLoader = new THREE.TextureLoader();
                 textureLoader.load('./models/Space_Ships/sof/material_29.jpg', (texture) => { // Load your JPEG texture
                     object.traverse((child) => {
                         if (child.isMesh) {
                             child.material = new THREE.MeshPhongMaterial({
                                 map: texture, // Apply the texture
                                 color: 0x808080  // Optional: Set a default color or use loaded materials
                             });
                             this.spacecraftGeometry = child.geometry;
                             this.spacecraftMaterial = child.material;
                             this.makeTeams(); // Ensure this is called only after the geometry and materials are fully prepared
                         }
                     });
                 }, null, (error) => {
                     console.error('An error happened during texture loading:', error);
                 });
             }, null, (error) => {
                 console.error('An error happened during OBJ loading:', error);
             });
         });
         
         
    }

    makeTeams(){
        let halves = this.number_of_entities/2;
        for(let i = 0; i<2; i++){
            for(let p = 0; p<halves; p++){

            let areaMin = this.middle_of_battle.clone().sub(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));
            let areaMax = this.middle_of_battle.clone().add(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));

            let spawnPosition = new THREE.Vector3(
                this.getRandomInt(areaMin.x, areaMax.x),
                this.getRandomInt(areaMin.y, areaMax.y),
                this.getRandomInt(areaMin.z, areaMax.z)
                    );
        
                const new_spacecraft = new Spacecraft(spawnPosition.x, spawnPosition.y, spawnPosition.z, 1000, 3, 100, 10, this.scene, i, this.spacecraftGeometry, this.spacecraftMaterial, 40, 7 );
                this.teams[i].push(new_spacecraft);
                this.spacecraftList.push(new_spacecraft);
            }
        }
    }

    update(deltaTime) { 
        for (let i = this.spacecraftList.length - 1 ; i >= 0; i--) {
            const spaceCraft = this.spacecraftList[i];
            if (spaceCraft.isDead()) {
                const teamIndex = spaceCraft.getSide(); // Assuming getSide() returns 0 or 1
                const team = this.teams[teamIndex];
                
                // Find index of the spacecraft in the team array and remove it
                const teamArrayIndex = team.indexOf(spaceCraft);
                if (teamArrayIndex !== -1) {
                    team.splice(teamArrayIndex, 1);
                }
                
                // Remove from spacecraft list
                this.spacecraftList.splice(i, 1);
            }
        }
    
        this.missileList = [];
        this.spacecraftList.forEach(spaceCraft => {
            spaceCraft.update(this.teamTwo, deltaTime);  // Assuming side handling
            spaceCraft.shipRenderer();
            
            for (const missile of spaceCraft.giveMissileList()) {
                this.missileList.push(missile);
            }
        });
    } 

    makeNumEven(number) {
        return number % 2 === 1 ? number + 1 : number;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    clearList(){
        for (const ship of this.spacecraftList){
            ship.explode();
        }
    }
}

