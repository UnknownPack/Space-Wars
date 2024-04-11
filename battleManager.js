import * as THREE from 'three';
import { spacecraft } from './spacecraft.js'; 

export class battleManager{
    constructor(number_of_entites, radius_of_battle, middle_of_battle, scene){
        this.number_of_entites = makeEven(number_of_entites);
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
    }

    makeTeams(){
        let halves = this.number_of_entites/2;
        for(let i = 0; i<2; i++){
            for(let p = 0; i<halves; p++){

            let areaMin = this.middle_of_battle.clone().sub(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));
            let areaMax = this.middle_of_battle.clone().add(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));

            let spawnPosition = new THREE.Vector3(
                getRandomInt(areaMin.x, areaMax.x),
                getRandomInt(areaMin.y, areaMax.y),
                getRandomInt(areaMin.z, areaMax.z)
);
        
                const spacecraft = new spacecraft(spawnPosition.x, spawnPosition.y, spawnPosition.z, 1000, 1, 25, 6,scene, i );
                this.teams[i].push(spacecraft);
                spacecraftList.push(spacecraft);
            }
        }
    }

    update(deltaTime){
        for(const spaceCraft in this.spacecraftList){
            if(spaceCraft.getSide() == 0){
                spaceCraft.update(deltaTime, this.teamTwo);
            }
            else if (spaceCraft.getSide() == 1){
                spaceCraft.update(deltaTime, this.teamOne);
            }
            spaceCraft.shipRenderer();
            this.missileList.clear();
            for (const missile in spaceCraft.giveMissileList()){
                this.missileList.push(missile);
            }
        }

        manageMissiles(deltaTime);
    }

    manageMissiles(deltaTime){
        this.explodedMissile.clear();
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

     makeEven(number) {
        return number % 2 === 1 ? number + 1 : number;
      }
      
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}