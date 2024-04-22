import * as THREE from 'three';

export class Background {

    constructor(scene) {
        this.scene = scene;
        this.createBackground();
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
    }

    createSun(texture) {
        // Define the material with the texture
        const material = new THREE.MeshBasicMaterial({
            map: texture // Texture applied here
        });

        // Create a sphere geometry that will represent the sun
        const geometry = new THREE.SphereGeometry(50, 64, 64);
        const sun = new THREE.Mesh(geometry, material);

        // Position the sun in the scene
        sun.position.set(-100, 0, +600);

        // Add the sun to the scene
        this.scene.add(sun);

        // Create a point light to simulate the sun's light
        const light = new THREE.PointLight(0xE06214,15, 1000, 2);
        light.position.set(-100, 0, +600);
        this.scene.add(light); 
    }
}



