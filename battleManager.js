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
        this.teams = [[], []]; // Initialize teams arrays
        this.activeMissiles = [];
        this.explodedMissiles = [];
    }



    makeTeams() {
        let halves = Math.floor(this.number_of_entities / 2);
        for (let i = 0; i < 2; i++) {
            for (let p = 0; p < halves; p++) {
                let spawnPosition = this.getRandomPosition();
                const new_spacecraft = new Spacecraft(spawnPosition, 1000, i, this.spacecraftGeometry, this.spacecraftMaterial, this.scene);
                this.teams[i].push(new_spacecraft);
                this.spacecraftList.push(new_spacecraft);
            }
        }
    }

    update(deltaTime) {
        this.explodedMissiles = [];
        for (const spaceCraft of this.spacecraftList) {
            spaceCraft.update(deltaTime);

            let missiles = spaceCraft.giveMissileList();
            this.missileList.push(...missiles);

            for (const missile of missiles) {
                if (missile.isExploded()) {
                    this.explodedMissiles.push(missile);
                } else {
                    missile.update(deltaTime);
                }
            }
        }

        // Filter out exploded missiles
        this.missileList = this.missileList.filter(missile => !this.explodedMissiles.includes(missile));
    }

    getRandomPosition() {
        let areaMin = this.middle_of_battle.clone().sub(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));
        let areaMax = this.middle_of_battle.clone().add(new THREE.Vector3(this.radius_of_battle, this.radius_of_battle, this.radius_of_battle));
        return new THREE.Vector3(
            this.getRandomInt(areaMin.x, areaMax.x),
            this.getRandomInt(areaMin.y, areaMax.y),
            this.getRandomInt(areaMin.z, areaMax.z)
        );
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

