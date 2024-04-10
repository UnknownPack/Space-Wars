import * as THREE from 'three';
import { spacecraft } from './spacecraft.js'; 

export class battleManager{
    constructor(number_of_entites, radius_of_battle, middle_of_battle){
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
    }

    makeTeams(){
        let halves = this.number_of_entites/2;
        for(let i = 0; i<2; i++){
            for(let p = 0; i<halves; p++){

                let areaSpawn = this.middle_of_battle +=this.radius_of_battle; 
                let spawnPosition = new THREE.Vector3(
                    this.getRandomInt(-areaSpawn, areaSpawn), 
                    this.getRandomInt(-areaSpawn, areaSpawn), 
                    this.getRandomInt(-areaSpawn, areaSpawn));
        
                const spacecraft = new spacecraft(spawnPosition.x, spawnPosition.y, spawnPosition.z, 1000, 1, 25, 6, i );
                this.teams[i].push(spacecraft);
                spacecraftList.push(spacecraft);
            }
        }
    }

    update(){
        for(const spaceCraft in this.spacecraftList){
            spaceCraft.update();
            this.missileList.clear();
            for (const missile in spaceCraft.giveMissileList()){
                this.missileList.push(missile);
            }
        }

        manageMissiles();
    }

    manageMissiles(){
        this.explodedMissile.clear();
        for (const missile in this.missileList){
            if(missile.isExploded()){
                this.missileList = this.missileList.filter(elem => !this.explodedMissile.includes(elem));
            }
            else missile.update();
        }
    }

     makeEven(number) {
        return number % 2 === 1 ? number + 1 : number;
      }
      
}