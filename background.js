import * as THREE from 'three';

export class Background {

    constructor(debris, scene) {
        this.debris = debris;
        this.scene = scene;
        this.spheres = [];
        this.createBackground();
        this.createAstroidsAndDebris();  
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
        const light = new THREE.PointLight(0xF5DD9D, 25, 1000, 2);
        light.position.set(-100, 0, +600);
        this.scene.add(light); 
    }

    createPlanet(texture){
        const material = new THREE.MeshPhongMaterial({
            map: texture // Texture applied here
        });

        // Create a sphere geometry that will represent the sun
        const geometry = new THREE.SphereGeometry(25, 64, 64);
        const planet = new THREE.Mesh(geometry, material);

        // Position the sun in the scene
        planet.position.set(+340, 0, +750);

        // Add the sun to the scene
        this.scene.add(planet); 
        const light = new THREE.PointLight(0xC9B5F5,5, 500, 2);
        light.position.set(+340, 0, +750);
        this.scene.add(light); 
    }

    createAstroidsAndDebris() {
        const largestSize = 0.5;
        const smallestSize = 0.1;
        
        // Loop to create debris
        for(let i = 0; i < this.debris; i++) {
            // Random size within the range
            const size = this.getRandomDouble(smallestSize, largestSize);
            
            // Create a sphere geometry
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            
            // Create a Phong material
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff }); // You can adjust color
            
            // Create a mesh with the geometry and material
            const sphere = new THREE.Mesh(geometry, material);
            
            // Random position
            sphere.position.set(
                this.getRandomDouble(-250, 250), // Adjust as per your scene size
                this.getRandomDouble(-250, 250),
                this.getRandomDouble(-250, 250)
            );
    
            // Add the sphere to your scene or some container

            this.spheres.push(sphere);
            this.scene.add(sphere);
        }
    }

    update(deltaTime) { 
          
        for (const rock of this.spheres) {
            // Check if the rock has a velocity, if not assign one
            if (!rock.velocity) {
                rock.velocity = new THREE.Vector3(
                    this.getRandomDouble(-1, 1),
                    this.getRandomDouble(-1, 1),
                    this.getRandomDouble(-1, 1)
                ).normalize(); // Normalize to ensure constant speed
            }
    
            // Update rock position based on its velocity and the deltaTime
            rock.position.x += rock.velocity.x * deltaTime;
            rock.position.y += rock.velocity.y * deltaTime;
            rock.position.z += rock.velocity.z * deltaTime;
        }
    }
    

    getRandomDouble(min, max) {
        return Math.random() * (max - min) + min;
    }
    
}



