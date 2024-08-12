import * as THREE from 'three';
import Papa from 'papaparse';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Credit console log
console.log("Project by neuziad");

// Create scene and set camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 65, 5);
camera.lookAt(0, -65, 20);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Add ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Add directional lighting pointing towards cubes
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 45, 20);
scene.add(directionalLight);

// Set background color to off-white grey
renderer.setClearColor(0xefefef, 1);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// EU parliament groups and their colors
const groups = [
    { name: 'PPE', color: 0x4db4ff, cubes: [] },
    { name: 'S&D', color: 0xfd1c36, cubes: [] },
    { name: 'PfE', color: 0x422b76, cubes: [] },
    { name: 'ECR', color: 0x4086b9, cubes: [] },
    { name: 'Renew', color: 0xffe13d, cubes: [] },
    { name: 'Verts/EFA', color: 0x3ff34e, cubes: [] },
    { name: 'The Left', color: 0xa03232, cubes: [] },
    { name: 'ESN', color: 0x13277e, cubes: [] },
    { name: 'NI', color: 0x777777, cubes: [] },
    { name: 'Vacant', color: 0xFFFFFF, cubes: [] }
];

// Pointer move function, allows tracking of cursor for object interaction
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    intersection(event);
}

window.addEventListener('pointermove', onPointerMove);

// Handle intersection logic
let INTERSECTED;
function intersection(event) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (INTERSECTED != intersectedObject) {
            if (INTERSECTED) {
                INTERSECTED.userData.group.cubes.forEach(cube => {
                    cube.material.color.set(INTERSECTED.userData.group.color);
                });
            }

            // When hover over group, highlight colour applied
            const group = intersectedObject.userData.group;
            group.cubes.forEach(cube => {
                cube.material.color.set(0xffffae);
            });

            INTERSECTED = intersectedObject;
        }
    } else {
        if (INTERSECTED) {

            // When not hovering over group, reset colour
            INTERSECTED.userData.group.cubes.forEach(cube => {
                cube.material.color.set(INTERSECTED.userData.group.color);
            });

            INTERSECTED = null;
        }
    }
}    

// Parse the CSV file using Papa Parse
Papa.parse('/raw.csv', {
    download: true,
    header: true,
    complete: function (results) {
        const dataForm = results.data;

        let index = 0;
        let gridHeight = 6;
        let spacing = 1.3;

        groups.forEach((group) => {

            // Find the corresponding row for the group in the CSV data
            const groupData = dataForm.find(row => row.Groups.trim().toLowerCase() === group.name.trim().toLowerCase());

            if (!groupData) {
                console.error(`No matching data found for group: ${group.name}`);
                return;
            }

            // Sum the counts across all columns except for 'EUP' (ignoring the 'Groups' column)
            const groupCount = Object.keys(groupData)
                .filter(key => key !== 'Groups' && key !== 'EUP')
                .reduce((sum, key) => {
                    return sum + parseInt(groupData[key], 10);
                }, 0);

            console.log(`Group: ${group.name}, Count: ${groupCount}`);

            if (isNaN(groupCount) || groupCount <= 0) {
                return;
            }        
            
            // Create geometry and material for each cubes (as well as their hitboxes)
            const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 0.5, 5);
            const hitboxGeometry = new RoundedBoxGeometry(1.6, 1.6, 1.6, 0.5, 5);

            const cubeMaterial = new THREE.MeshStandardMaterial({ color: group.color });
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
            
            // Generates cubes for every member of each group
            for (let i = 0; i < groupCount; i++) {
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);

                cube.userData.group = group;
                hitbox.userData.group = group;

                scene.add(cube);
                scene.add(hitbox);
                group.cubes.push(cube);
                
                // Position cubes in grid-like fashion
                const x = Math.floor(index / gridHeight) * spacing;
                const z = (index % gridHeight) * spacing;

                cube.position.set(x - 75, 10, z + 2);
                hitbox.position.set(x - 75, 10, z + 2);

                cube.castShadow = true;
                cube.receiveShadow = true;

                index++;
            }
        });

        // Start animation loop
        animate();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    groups.forEach(group => {
        group.cubes.forEach(cube => {
            cube.rotation.y -= 0.002;
            cube.rotation.z -= 0.00001;
        });
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();