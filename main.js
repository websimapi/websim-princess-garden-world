import * as THREE from 'three';
import nipplejs from 'nipplejs';

class PrincessGarden {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        this.cameraPosition = new THREE.Vector3(0, 0, 0);
        this.moveSpeed = 8;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.set(0, 20, 0);
        this.camera.lookAt(0, 0, 0);
        
        // Setup lighting
        this.setupLighting();
        
        // Create world
        this.createWorld();
        
        // Setup controls
        this.setupControls();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    createWorld() {
        // Create grass quadrants
        this.createGrassQuadrants();
        
        // Create paths
        this.createPaths();
        
        // Create fountain
        this.createFountain();
        
        // Create flowers
        this.createFlowers();
    }
    
    createGrassQuadrants() {
        const grassGeometry = new THREE.PlaneGeometry(12, 12);
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a7c59,
            transparent: true
        });
        
        const positions = [
            [-8, 0, -8],  // Top-left
            [8, 0, -8],   // Top-right
            [-8, 0, 8],   // Bottom-left
            [8, 0, 8]     // Bottom-right
        ];
        
        positions.forEach(pos => {
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.rotation.x = -Math.PI / 2;
            grass.position.set(pos[0], pos[1], pos[2]);
            grass.receiveShadow = true;
            this.scene.add(grass);
        });
    }
    
    createPaths() {
        // Horizontal path
        const pathGeometry = new THREE.PlaneGeometry(20, 4);
        const pathMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
        
        const horizontalPath = new THREE.Mesh(pathGeometry, pathMaterial);
        horizontalPath.rotation.x = -Math.PI / 2;
        horizontalPath.position.set(0, 0.01, 0);
        horizontalPath.receiveShadow = true;
        this.scene.add(horizontalPath);
        
        // Vertical path
        const verticalPath = new THREE.Mesh(pathGeometry, pathMaterial);
        verticalPath.rotation.x = -Math.PI / 2;
        verticalPath.rotation.z = Math.PI / 2;
        verticalPath.position.set(0, 0.01, 0);
        verticalPath.receiveShadow = true;
        this.scene.add(verticalPath);
        
        // Path tiles
        this.createPathTiles();
    }
    
    createPathTiles() {
        const tileGeometry = new THREE.PlaneGeometry(1.2, 1.2);
        const tileMaterial = new THREE.MeshLambertMaterial({ color: 0xbc9a6a });
        
        const tilePositions = [
            // Horizontal path tiles
            [-4, 0.02, 0], [0, 0.02, 0], [4, 0.02, 0],
            // Vertical path tiles  
            [0, 0.02, -4], [0, 0.02, 4]
        ];
        
        tilePositions.forEach(pos => {
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(pos[0], pos[1], pos[2]);
            tile.castShadow = true;
            this.scene.add(tile);
        });
    }
    
    createFountain() {
        // Fountain base
        const baseGeometry = new THREE.CylinderGeometry(2.5, 3, 0.5, 16);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 0.25, 0);
        base.castShadow = true;
        this.scene.add(base);
        
        // Fountain bowl
        const bowlGeometry = new THREE.CylinderGeometry(2, 2.2, 0.3, 16);
        const bowlMaterial = new THREE.MeshLambertMaterial({ color: 0xa0876c });
        const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
        bowl.position.set(0, 0.65, 0);
        bowl.castShadow = true;
        this.scene.add(bowl);
        
        // Frills around bowl
        for (let i = 0; i < 8; i++) {
            const frillGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
            const frillMaterial = new THREE.MeshLambertMaterial({ color: 0x9d8269 });
            const frill = new THREE.Mesh(frillGeometry, frillMaterial);
            
            const angle = (i / 8) * Math.PI * 2;
            frill.position.set(
                Math.cos(angle) * 2.3,
                0.8,
                Math.sin(angle) * 2.3
            );
            frill.castShadow = true;
            this.scene.add(frill);
        }
        
        // Princess
        this.createPrincess();
        
        // Water particles
        this.createWaterEffect();
    }
    
    createPrincess() {
        // Princess body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffc0cb });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.4, 0);
        body.castShadow = true;
        this.scene.add(body);
        
        // Princess head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.2, 0);
        head.castShadow = true;
        this.scene.add(head);
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 2.3, 0);
        hair.scale.set(1, 1.2, 1);
        hair.castShadow = true;
        this.scene.add(hair);
        
        // Arms reaching forward
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.3, 1.7, 0.3);
        leftArm.rotation.z = Math.PI / 4;
        leftArm.rotation.x = -Math.PI / 6;
        leftArm.castShadow = true;
        this.scene.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.3, 1.7, 0.3);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.rotation.x = -Math.PI / 6;
        rightArm.castShadow = true;
        this.scene.add(rightArm);
        
        // Hands
        const handGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const handMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.5, 1.4, 0.6);
        leftHand.castShadow = true;
        this.scene.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.5, 1.4, 0.6);
        rightHand.castShadow = true;
        this.scene.add(rightHand);
        
        this.princessHands = [leftHand, rightHand];
    }
    
    createWaterEffect() {
        this.waterParticles = [];
        const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        const particleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(0, 1.4, 0.6);
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.2 + 0.1,
                    Math.random() * 0.1
                ),
                life: Math.random() * 2 + 1
            };
            this.scene.add(particle);
            this.waterParticles.push(particle);
        }
    }
    
    createFlowers() {
        const flowerPositions = [
            // Top-left quadrant
            [-12, 0, -12], [-6, 0, -10], [-10, 0, -6],
            // Top-right quadrant
            [12, 0, -12], [6, 0, -10], [10, 0, -6],
            // Bottom-left quadrant
            [-12, 0, 12], [-6, 0, 10], [-10, 0, 6],
            // Bottom-right quadrant
            [12, 0, 12], [6, 0, 10], [10, 0, 6]
        ];
        
        flowerPositions.forEach((pos, index) => {
            this.createFlower(pos[0], pos[1], pos[2], index);
        });
    }
    
    createFlower(x, y, z, index) {
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(x, y + 0.5, z);
        stem.castShadow = true;
        this.scene.add(stem);
        
        // Flower petals
        const colors = [0xff69b4, 0xff1493, 0xffc0cb, 0xff6347, 0xffd700, 0xff4500];
        const petalColor = colors[index % colors.length];
        
        for (let i = 0; i < 6; i++) {
            const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const petalMaterial = new THREE.MeshLambertMaterial({ color: petalColor });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            petal.position.set(
                x + Math.cos(angle) * 0.4,
                y + 1.2,
                z + Math.sin(angle) * 0.4
            );
            petal.scale.set(0.8, 0.3, 0.8);
            petal.castShadow = true;
            this.scene.add(petal);
        }
        
        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(x, y + 1.2, z);
        center.castShadow = true;
        this.scene.add(center);
    }
    
    setupControls() {
        // Desktop controls
        window.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveState.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveState.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveState.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveState.right = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveState.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveState.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveState.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveState.right = false;
                    break;
            }
        });
        
        // Mobile controls
        if ('ontouchstart' in window) {
            const joystick = nipplejs.create({
                zone: document.getElementById('gameContainer'),
                mode: 'static',
                position: { left: '100px', bottom: '100px' },
                color: 'white',
                size: 80
            });
            
            joystick.on('move', (evt, data) => {
                const force = Math.min(data.force, 1);
                const angle = data.angle.radian;
                
                this.moveState.forward = Math.sin(angle) * force > 0.3;
                this.moveState.backward = Math.sin(angle) * force < -0.3;
                this.moveState.left = Math.cos(angle) * force < -0.3;
                this.moveState.right = Math.cos(angle) * force > 0.3;
            });
            
            joystick.on('end', () => {
                this.moveState.forward = false;
                this.moveState.backward = false;
                this.moveState.left = false;
                this.moveState.right = false;
            });
        }
    }
    
    updateMovement(deltaTime) {
        const moveDistance = this.moveSpeed * deltaTime;
        
        if (this.moveState.forward) {
            this.cameraPosition.z -= moveDistance;
        }
        if (this.moveState.backward) {
            this.cameraPosition.z += moveDistance;
        }
        if (this.moveState.left) {
            this.cameraPosition.x -= moveDistance;
        }
        if (this.moveState.right) {
            this.cameraPosition.x += moveDistance;
        }
        
        // Clamp camera position to world bounds
        this.cameraPosition.x = Math.max(-15, Math.min(15, this.cameraPosition.x));
        this.cameraPosition.z = Math.max(-15, Math.min(15, this.cameraPosition.z));
        
        this.camera.position.set(
            this.cameraPosition.x,
            20,
            this.cameraPosition.z
        );
        this.camera.lookAt(this.cameraPosition.x, 0, this.cameraPosition.z);
    }
    
    updateWaterParticles(deltaTime) {
        this.waterParticles.forEach(particle => {
            particle.position.add(particle.userData.velocity.clone().multiplyScalar(deltaTime));
            particle.userData.life -= deltaTime;
            
            // Gravity effect
            particle.userData.velocity.y -= 9.8 * deltaTime;
            
            // Reset particle when it hits the ground or life expires
            if (particle.position.y < 0.8 || particle.userData.life <= 0) {
                // Reset from princess hands
                const hand = this.princessHands[Math.floor(Math.random() * 2)];
                particle.position.copy(hand.position);
                particle.userData.velocity.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.4 + 0.2,
                    Math.random() * 0.2 + 0.1
                );
                particle.userData.life = Math.random() * 2 + 1;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        this.updateMovement(deltaTime);
        this.updateWaterParticles(deltaTime);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 30;
        
        this.camera.left = -frustumSize * aspect / 2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = -frustumSize / 2;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Start the game
new PrincessGarden();

