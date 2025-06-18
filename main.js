import * as THREE from 'three';
import nipplejs from 'nipplejs';

class PrincessGarden {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 1, 200);
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
        
        // Camera rotation controls
        this.cameraDistance = 25;
        this.cameraAngleH = 0; // horizontal rotation
        this.cameraAngleV = Math.PI / 3; // vertical rotation (60 degrees down from horizontal)
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Zoom controls
        this.frustumSize = 35;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
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

        // Initial camera projection update
        this.updateCameraProjection();
        
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
        // Create a single, large ground plane for seamless terrain
        this.createGroundPlane();
        
        // Create paths on top of the ground plane
        this.createPaths();
        
        // Create fountain
        this.createFountain();
        
        // Create flowers
        this.createFlowers();
    }
    
    createGroundPlane() {
        // A single large plane (500x500) to serve as the ground for the main garden and surrounding area.
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createNeighboringTerrain() {
        // This function is no longer needed as createGroundPlane handles the entire terrain.
    }
    
    createGrassQuadrants() {
        // This function is no longer needed as createGroundPlane handles the grass.
    }
    
    createPaths() {
        // Horizontal path - extend to cover the full garden area
        const pathGeometry = new THREE.PlaneGeometry(20, 4);
        const pathMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
        
        const horizontalPath = new THREE.Mesh(pathGeometry, pathMaterial);
        horizontalPath.rotation.x = -Math.PI / 2;
        horizontalPath.position.set(0, 0.01, 0);
        horizontalPath.receiveShadow = true;
        this.scene.add(horizontalPath);
        
        // Vertical path - extend to cover the full garden area
        const verticalPath = new THREE.Mesh(pathGeometry, pathMaterial);
        verticalPath.rotation.x = -Math.PI / 2;
        verticalPath.rotation.z = Math.PI / 2;
        verticalPath.position.set(0, 0.01, 0);
        verticalPath.receiveShadow = true;
        this.scene.add(verticalPath);
        
        // Path tiles - 3 tiles per path as specified
        this.createPathTiles();
    }
    
    createPathTiles() {
        const tileGeometry = new THREE.PlaneGeometry(1.2, 1.2);
        const tileMaterial = new THREE.MeshLambertMaterial({ color: 0xbc9a6a });
        
        const tilePositions = [
            // Horizontal path tiles (3 tiles evenly spaced along 20-unit path)
            [-6, 0.02, 0], [0, 0.02, 0], [6, 0.02, 0],
            // Vertical path tiles (3 tiles evenly spaced along 20-unit path)
            [0, 0.02, -6], [0, 0.02, 6]
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
        // Princess torso (more realistic proportions) - made taller
        const torsoGeometry = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12);
        const torsoMaterial = new THREE.MeshLambertMaterial({ color: 0xffc0cb });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 1.7, 0); // raised from 1.2 to 1.7
        torso.castShadow = true;
        this.scene.add(torso);

        // Princess waist
        const waistGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 12);
        const waistMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
        const waist = new THREE.Mesh(waistGeometry, waistMaterial);
        waist.position.set(0, 1.45, 0); // raised from 0.95 to 1.45
        waist.castShadow = true;
        this.scene.add(waist);

        // Princess skirt
        const skirtGeometry = new THREE.CylinderGeometry(0.6, 0.3, 0.5, 16);
        const skirtMaterial = new THREE.MeshLambertMaterial({ color: 0xff1493 });
        const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
        skirt.position.set(0, 1.1, 0); // raised from 0.6 to 1.1
        skirt.castShadow = true;
        this.scene.add(skirt);
        
        // Princess head (more proportional)
        const headGeometry = new THREE.SphereGeometry(0.22, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.32, 0); // raised from 1.82 to 2.32
        head.castShadow = true;
        this.scene.add(head);

        // Larger, more expressive eyes - positioned better on face
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 }); // Royal blue eyes
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 2.36, 0.15); // raised and moved back slightly
        this.scene.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 2.36, 0.15); // raised and moved back slightly
        this.scene.add(rightEye);

        // Eye pupils
        const pupilGeometry = new THREE.SphereGeometry(0.025, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.08, 2.36, 0.17); // raised and adjusted
        this.scene.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.08, 2.36, 0.17); // raised and adjusted
        this.scene.add(rightPupil);

        // Eyelashes
        const eyelashGeometry = new THREE.CylinderGeometry(0.005, 0.002, 0.04, 4);
        const eyelashMaterial = new THREE.MeshLambertMaterial({ color: 0x2f1b14 });
        
        // Left eyelashes
        for (let i = 0; i < 5; i++) {
            const eyelash = new THREE.Mesh(eyelashGeometry, eyelashMaterial);
            eyelash.position.set(-0.08 + (i - 2) * 0.015, 2.39, 0.16); // raised
            eyelash.rotation.z = (i - 2) * 0.1;
            eyelash.rotation.x = -0.2;
            this.scene.add(eyelash);
        }
        
        // Right eyelashes
        for (let i = 0; i < 5; i++) {
            const eyelash = new THREE.Mesh(eyelashGeometry, eyelashMaterial);
            eyelash.position.set(0.08 + (i - 2) * 0.015, 2.39, 0.16); // raised
            eyelash.rotation.z = (i - 2) * 0.1;
            eyelash.rotation.x = -0.2;
            this.scene.add(eyelash);
        }

        // Rosy cheeks
        const cheekGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const cheekMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff69b4, 
            transparent: true, 
            opacity: 0.6 
        });
        
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-0.12, 2.3, 0.13); // raised and moved back
        this.scene.add(leftCheek);
        
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(0.12, 2.3, 0.13); // raised and moved back
        this.scene.add(rightCheek);

        // Improved nose
        const noseGeometry = new THREE.SphereGeometry(0.018, 8, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 2.31, 0.17); // raised and moved back slightly
        nose.scale.set(0.8, 0.6, 1.2);
        this.scene.add(nose);

        // More defined lips
        const lipGeometry = new THREE.SphereGeometry(0.03, 8, 6);
        const lipMaterial = new THREE.MeshLambertMaterial({ color: 0xff1493 });
        const lips = new THREE.Mesh(lipGeometry, lipMaterial);
        lips.position.set(0, 2.26, 0.16); // raised and moved back
        lips.scale.set(1.8, 0.4, 0.8);
        this.scene.add(lips);
        
        // Golden hair (more detailed and voluminous)
        const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16);
        const hairMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 }); // Golden color
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 2.42, -0.08); // raised from 1.92 to 2.42
        hair.scale.set(1.2, 1.4, 1.1);
        hair.castShadow = true;
        this.scene.add(hair);

        // Hair volume on sides
        const sideHairGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        
        const leftSideHair = new THREE.Mesh(sideHairGeometry, hairMaterial);
        leftSideHair.position.set(-0.25, 2.38, -0.02); // raised from 1.88 to 2.38
        leftSideHair.scale.set(1.3, 1.2, 0.8);
        leftSideHair.castShadow = true;
        this.scene.add(leftSideHair);
        
        const rightSideHair = new THREE.Mesh(sideHairGeometry, hairMaterial);
        rightSideHair.position.set(0.25, 2.38, -0.02); // raised from 1.88 to 2.38
        rightSideHair.scale.set(1.3, 1.2, 0.8);
        rightSideHair.castShadow = true;
        this.scene.add(rightSideHair);

        // Elegant hair strands
        for (let i = 0; i < 8; i++) {
            const strandGeometry = new THREE.CylinderGeometry(0.025, 0.015, 0.4, 6);
            const strand = new THREE.Mesh(strandGeometry, hairMaterial);
            const angle = (i / 8) * Math.PI * 2;
            strand.position.set(
                Math.cos(angle) * 0.28,
                2.2, // raised from 1.7 to 2.2
                Math.sin(angle) * 0.28 - 0.08
            );
            strand.rotation.z = Math.cos(angle) * 0.4;
            strand.rotation.x = Math.sin(angle) * 0.3;
            strand.castShadow = true;
            this.scene.add(strand);
        }

        // Princess tiara
        const tiaraGeometry = new THREE.CylinderGeometry(0.26, 0.28, 0.08, 16);
        const tiaraMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const tiara = new THREE.Mesh(tiaraGeometry, tiaraMaterial);
        tiara.position.set(0, 2.52, 0); // raised from 2.02 to 2.52
        tiara.castShadow = true;
        this.scene.add(tiara);

        // Tiara gems
        for (let i = 0; i < 5; i++) {
            const gemGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const gemMaterial = new THREE.MeshLambertMaterial({ color: 0xff1493 });
            const gem = new THREE.Mesh(gemGeometry, gemMaterial);
            const angle = (i / 5) * Math.PI * 2;
            gem.position.set(
                Math.cos(angle) * 0.25,
                2.56, // raised from 2.06 to 2.56
                Math.sin(angle) * 0.25
            );
            this.scene.add(gem);
        }
        
        // Shoulders
        const shoulderGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        const shoulderMaterial = new THREE.MeshLambertMaterial({ color: 0xffc0cb });
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.4, 1.9, 0); // raised from 1.4 to 1.9
        leftShoulder.castShadow = true;
        this.scene.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.4, 1.9, 0); // raised from 1.4 to 1.9
        rightShoulder.castShadow = true;
        this.scene.add(rightShoulder);
        
        // Upper arms
        const upperArmGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 12);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        leftUpperArm.position.set(-0.45, 1.6, 0.1); // raised from 1.1 to 1.6
        leftUpperArm.rotation.z = Math.PI / 6;
        leftUpperArm.rotation.x = -Math.PI / 8;
        leftUpperArm.castShadow = true;
        this.scene.add(leftUpperArm);
        
        const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        rightUpperArm.position.set(0.45, 1.6, 0.1); // raised from 1.1 to 1.6
        rightUpperArm.rotation.z = -Math.PI / 6;
        rightUpperArm.rotation.x = -Math.PI / 8;
        rightUpperArm.castShadow = true;
        this.scene.add(rightUpperArm);

        // Elbows
        const elbowGeometry = new THREE.SphereGeometry(0.08, 10, 10);
        
        const leftElbow = new THREE.Mesh(elbowGeometry, armMaterial);
        leftElbow.position.set(-0.52, 1.35, 0.18); // raised from 0.85 to 1.35
        leftElbow.castShadow = true;
        this.scene.add(leftElbow);
        
        const rightElbow = new THREE.Mesh(elbowGeometry, armMaterial);
        rightElbow.position.set(0.52, 1.35, 0.18); // raised from 0.85 to 1.35
        rightElbow.castShadow = true;
        this.scene.add(rightElbow);
        
        // Lower arms
        const lowerArmGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 12);
        
        const leftLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
        leftLowerArm.position.set(-0.55, 1.1, 0.35); // raised from 0.6 to 1.1
        leftLowerArm.rotation.z = Math.PI / 8;
        leftLowerArm.rotation.x = -Math.PI / 4;
        leftLowerArm.castShadow = true;
        this.scene.add(leftLowerArm);
        
        const rightLowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
        rightLowerArm.position.set(0.55, 1.1, 0.35); // raised from 0.6 to 1.1
        rightLowerArm.rotation.z = -Math.PI / 8;
        rightLowerArm.rotation.x = -Math.PI / 4;
        rightLowerArm.castShadow = true;
        this.scene.add(rightLowerArm);
        
        // Detailed hands with fingers
        this.createDetailedHands();
    }

    createDetailedHands() {
        // Left hand palm
        const palmGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.16);
        const handMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        
        const leftPalm = new THREE.Mesh(palmGeometry, handMaterial);
        leftPalm.position.set(-0.58, 0.92, 0.55); // raised from 0.42 to 0.92
        leftPalm.rotation.x = -Math.PI / 3;
        leftPalm.rotation.z = Math.PI / 12;
        leftPalm.castShadow = true;
        this.scene.add(leftPalm);
        
        const rightPalm = new THREE.Mesh(palmGeometry, handMaterial);
        rightPalm.position.set(0.58, 0.92, 0.55); // raised from 0.42 to 0.92
        rightPalm.rotation.x = -Math.PI / 3;
        rightPalm.rotation.z = -Math.PI / 12;
        rightPalm.castShadow = true;
        this.scene.add(rightPalm);

        // Fingers for left hand
        const fingerGeometry = new THREE.CylinderGeometry(0.015, 0.012, 0.08, 8);
        
        for (let i = 0; i < 4; i++) {
            const finger = new THREE.Mesh(fingerGeometry, handMaterial);
            finger.position.set(
                -0.58 + (i - 1.5) * 0.025,
                0.88, // raised from 0.38 to 0.88
                0.62
            );
            finger.rotation.x = -Math.PI / 2.5;
            finger.rotation.z = Math.PI / 12;
            finger.castShadow = true;
            this.scene.add(finger);
        }

        // Thumb for left hand
        const thumb = new THREE.Mesh(fingerGeometry, handMaterial);
        thumb.position.set(-0.62, 0.94, 0.52); // raised from 0.44 to 0.94
        thumb.rotation.x = -Math.PI / 4;
        thumb.rotation.y = Math.PI / 6;
        thumb.rotation.z = Math.PI / 8;
        thumb.castShadow = true;
        this.scene.add(thumb);

        // Fingers for right hand
        for (let i = 0; i < 4; i++) {
            const finger = new THREE.Mesh(fingerGeometry, handMaterial);
            finger.position.set(
                0.58 + (i - 1.5) * 0.025,
                0.88, // raised from 0.38 to 0.88
                0.62
            );
            finger.rotation.x = -Math.PI / 2.5;
            finger.rotation.z = -Math.PI / 12;
            finger.castShadow = true;
            this.scene.add(finger);
        }

        // Thumb for right hand
        const rightThumb = new THREE.Mesh(fingerGeometry, handMaterial);
        rightThumb.position.set(0.62, 0.94, 0.52); // raised from 0.44 to 0.94
        rightThumb.rotation.x = -Math.PI / 4;
        rightThumb.rotation.y = -Math.PI / 6;
        rightThumb.rotation.z = -Math.PI / 8;
        rightThumb.castShadow = true;
        this.scene.add(rightThumb);
        
        // Store hand positions for water effect (use palm positions)
        this.princessHands = [leftPalm, rightPalm];
    }

    createWaterEffect() {
        this.waterParticles = [];
        const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        const particleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 30; i++) { // increased from 20 to 30 particles
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(0, 1.9, 0.6); // raised initial position
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.15,
                    Math.random() * 0.3 + 0.15,
                    Math.random() * 0.15 + 0.05
                ),
                life: Math.random() * 3 + 1.5 // longer life
            };
            this.scene.add(particle);
            this.waterParticles.push(particle);
        }
    }
    
    createFlowers() {
        const flowerPositions = [
            // Top-left quadrant (3 flowers within 8x8 grass area)
            [-8, 0, -8], [-4, 0, -8], [-6, 0, -4],
            // Top-right quadrant  
            [8, 0, -8], [4, 0, -8], [6, 0, -4],
            // Bottom-left quadrant
            [-8, 0, 8], [-4, 0, 8], [-6, 0, 4],
            // Bottom-right quadrant
            [8, 0, 8], [4, 0, 8], [6, 0, 4]
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
        
        // Mouse camera controls
        window.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        });
        
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        window.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown) return;
            
            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            
            this.cameraAngleH -= deltaX * 0.01;
            this.cameraAngleV = Math.max(0.1, Math.min(Math.PI / 2, this.cameraAngleV + deltaY * 0.01));
            
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        });

        // Mouse wheel zoom
        window.addEventListener('wheel', (event) => {
            event.preventDefault(); // Prevent page scrolling
            const zoomSpeed = 0.05;
            this.frustumSize += event.deltaY * zoomSpeed;
            this.frustumSize = Math.max(5, Math.min(80, this.frustumSize)); // Clamp zoom level
            this.updateCameraProjection();
        }, { passive: false });
        
        // Touch camera controls
        let lastTouchX, lastTouchY;
        let lastPinchDistance = 0;
        window.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1 && !this.isPinching(event)) {
                this.isMouseDown = true; // for rotation
                lastTouchX = event.touches[0].clientX;
                lastTouchY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
                this.isMouseDown = false; // disable rotation during pinch
                lastPinchDistance = this.getPinchDistance(event);
            }
        });

        window.addEventListener('touchend', (event) => {
            this.isMouseDown = false;
            lastPinchDistance = 0;
        });
        
        window.addEventListener('touchmove', (event) => {
            event.preventDefault(); // Prevent page scrolling
            if (event.touches.length === 1 && this.isMouseDown) {
                const deltaX = event.touches[0].clientX - lastTouchX;
                const deltaY = event.touches[0].clientY - lastTouchY;
                
                this.cameraAngleH -= deltaX * 0.01;
                this.cameraAngleV = Math.max(0.1, Math.min(Math.PI / 2, this.cameraAngleV + deltaY * 0.01));
                
                lastTouchX = event.touches[0].clientX;
                lastTouchY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
                const pinchDistance = this.getPinchDistance(event);
                const deltaPinch = pinchDistance - lastPinchDistance;
                
                // Zoom with pinch
                const zoomSpeed = 0.1;
                this.frustumSize -= deltaPinch * zoomSpeed;
                this.frustumSize = Math.max(5, Math.min(80, this.frustumSize)); // Clamp zoom
                this.updateCameraProjection();
                
                lastPinchDistance = pinchDistance;
            }
        }, { passive: false });
        
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

    isPinching(event) {
        return event.touches.length === 2;
    }

    getPinchDistance(event) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
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
        
        // Update camera position based on rotation angles
        const cameraX = this.cameraPosition.x + Math.cos(this.cameraAngleH) * Math.sin(this.cameraAngleV) * this.cameraDistance;
        const cameraY = Math.cos(this.cameraAngleV) * this.cameraDistance;
        const cameraZ = this.cameraPosition.z + Math.sin(this.cameraAngleH) * Math.sin(this.cameraAngleV) * this.cameraDistance;
        
        this.camera.position.set(cameraX, cameraY, cameraZ);
        this.camera.lookAt(this.cameraPosition.x, 0, this.cameraPosition.z);
    }
    
    updateWaterParticles(deltaTime) {
        this.waterParticles.forEach(particle => {
            particle.position.add(particle.userData.velocity.clone().multiplyScalar(deltaTime));
            particle.userData.life -= deltaTime;
            
            // Gravity effect
            particle.userData.velocity.y -= 9.8 * deltaTime;
            
            // Reset particle when it hits the ground or life expires
            if (particle.position.y < 1.3 || particle.userData.life <= 0) { // adjusted ground level
                // Reset from princess hands - ensure hands exist
                if (this.princessHands && this.princessHands.length > 0) {
                    const hand = this.princessHands[Math.floor(Math.random() * 2)];
                    particle.position.copy(hand.position);
                    // Add slight offset upward from hand
                    particle.position.y += 0.1;
                    particle.userData.velocity.set(
                        (Math.random() - 0.5) * 0.2,
                        Math.random() * 0.4 + 0.25,
                        Math.random() * 0.2 + 0.1
                    );
                    particle.userData.life = Math.random() * 3 + 1.5;
                }
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

    updateCameraProjection() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // More aggressive angle adjustment to prevent clipping when looking down at steep angles
        // When cameraAngleV is small (looking more straight down), we need much larger frustum
        const normalizedAngle = this.cameraAngleV / (Math.PI / 2); // 0 to 1, where 0 is straight down
        const angleAdjustment = 1 + (1 - normalizedAngle) * 2; // More aggressive scaling
        const adjustedFrustumSize = this.frustumSize * angleAdjustment;
        
        this.camera.left = -adjustedFrustumSize * aspect / 2;
        this.camera.right = adjustedFrustumSize * aspect / 2;
        this.camera.top = adjustedFrustumSize / 2;
        this.camera.bottom = -adjustedFrustumSize / 2;
        this.camera.near = 1;
        this.camera.far = 200;
        this.camera.updateProjectionMatrix();
    }
    
    onWindowResize() {
        this.updateCameraProjection();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Start the game
new PrincessGarden();