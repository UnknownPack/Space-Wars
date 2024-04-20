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
        
                const new_spacecraft = new Spacecraft(spawnPosition.x, spawnPosition.y, spawnPosition.z, 1000, 4, 80, 10, this.scene, i, this.spacecraftGeometry, this.spacecraftMaterial, 20, 7);
                this.teams[i].push(new_spacecraft);
                this.spacecraftList.push(new_spacecraft);
            }
        }
    }

    update(deltaTime) { 
        for (let i = this.spacecraftList.length - 1; i >= 0; i--) {
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
    
        this.spacecraftList.forEach(spaceCraft => {
            if (spaceCraft.getSide() === 0) {
                spaceCraft.update(this.teamTwo, deltaTime);
            } else if (spaceCraft.getSide() === 1) {
                spaceCraft.update(this.teamOne, deltaTime);
            }
            spaceCraft.shipRenderer();
    
            // Collect missiles from all spacecrafts
            this.missileList = [];
            for (const missile of spaceCraft.giveMissileList()) {
                this.missileList.push(missile);
            }
        });
    
        // Manage missiles
        this.manageMissiles(deltaTime);
    }
    

    manageMissiles(deltaTime){
        this.explodedMissile = [];
        for (const missile of this.missileList){
            if(missile.isExploded()){
                this.missileList = this.missileList.filter(elem => !this.explodedMissile.includes(elem));
            }
            else if(!missile.isExploded()){
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

