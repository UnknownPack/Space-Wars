import * as THREE from 'three';
import dat from './build/controls/dat.gui.module.js';

export class Background {

    constructor(debris, scene) {
        this.debris = debris;
        this.scene = scene;
        this.spheres = [];
        this.SunBrightness = 14; // Initialize the SunBrightness
        this.createBackground();
        this.createAstroidsAndDebris();
        this.gui = new dat.GUI();
        this.setupGUI(); // Setup GUI controls
    }

    createBackground() {
        const textureLoader = new THREE.TextureLoader();
        
        // Load the .jpg texture with wrapping and filtering options set
        textureLoader.load('./models/Planets/sol/2k_sun.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            texture.needsUpdate = true;

            this.createSun(texture); // Now pass the texture to createSun 
             
        });

        textureLoader.load('./models/Planets/AlienPlanet/planet_Bog1200.png', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            texture.needsUpdate = true;

            this.createPlanet(texture); // Now pass the texture to createSun 
             
        });
    }

    createSun(texture) {
        const material = new THREE.MeshBasicMaterial({
            map: texture // Texture applied here
        });

        const geometry = new THREE.SphereGeometry(50, 64, 64);
        const sun = new THREE.Mesh(geometry, material);
        sun.position.set(-100, 0, +600);
        this.scene.add(sun);

        const light = new THREE.PointLight(0xF5DD9D, this.SunBrightness, 1000, 2);
        light.position.set(-100, 0, +600);
        light.name = 'sunLight'; // Name the light for later reference
        this.scene.add(light); 
    }

    createPlanet(texture){
        const material = new THREE.MeshPhongMaterial({
            map: texture // Texture applied here
        });

        const geometry = new THREE.SphereGeometry(25, 64, 64);
        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(+340, 0, +750);
        this.scene.add(planet); 
        const light = new THREE.PointLight(0xC9B5F5, 5, 500, 2);
        light.position.set(+340, 0, +750);
        this.scene.add(light); 
    }

    createAstroidsAndDebris() {
        for(let i = 0; i < this.debris; i++) {
            const size = this.getRandomDouble(0.1, 0.5);
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                this.getRandomDouble(-250, 250),
                this.getRandomDouble(-250, 250),
                this.getRandomDouble(-250, 250)
            );
            this.spheres.push(sphere);
            this.scene.add(sphere);
        }
    }

    setupGUI() {
        this.gui.add(this, 'SunBrightness', 1, 30).onChange(this.updateScene.bind(this));
    }

    updateScene(value) {
        const sunLight = this.scene.getObjectByName('sunLight');
        if (sunLight) {
            sunLight.intensity = value;
        }
    }

    getRandomDouble(min, max) {
        return Math.random() * (max - min) + min;
    }
}



