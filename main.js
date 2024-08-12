import * as THREE from "three";
import Papa from "papaparse";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import { TextGeometry } from "three/examples/jsm/Addons.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

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

// Create text overlays
const textOverlay = document.getElementById("text-overlay");
const subtitle = document.getElementById("subtitle");

// Create EU parliament groups array, listing their colors, cubes that will be crated, and their party's leaders' portrait
const groups = [
    { name: "PPE", color: 0x4db4ff, cubes: [], picture: "/portraits/PPE.jpg", notablePerson: "Roberta Metsola, MT" },
    { name: "S&D", color: 0xfd1c36, cubes: [], picture: "/portraits/S&D.jpg", notablePerson: "Iratxe García Pérez, ES" },
    { name: "PfE", color: 0x422b76, cubes: [], picture: "/portraits/PFE.jpg", notablePerson: "Jordan Bardella, FR" },
    { name: "ECR", color: 0x4086b9, cubes: [], picture: "/portraits/ECR.jpg", notablePerson: "Elena Donazzan, IT" },
    { name: "Renew", color: 0xffe13d, cubes: [], picture: "/portraits/RENEW.jpg", notablePerson: "Nikola Minchev, BG" },
    { name: "Verts/EFA", color: 0x3ff34e, cubes: [], picture: "/portraits/VERTS_EFA.jpg", notablePerson: "Bas Eickhout, NL" },
    { name: "The Left", color: 0xa03232, cubes: [], picture: "/portraits/THE_LEFT.jpg", notablePerson: "Kathleen Funchion, IE" },
    { name: "ESN", color: 0x13277e, cubes: [], picture: "/portraits/ESN.jpg", notablePerson: "René Aust, DE" },
    { name: "NI", color: 0x777777, cubes: [], picture: "/portraits/NI.jpg", notablePerson: "Fidias Panayiotou, CY" },
    { name: "Vacant", color: 0xFFFFFF, cubes: [], picture: "/portraits/VACANT.jpg", notablePerson: "Antoni Comín, ES-CT" },
];

// ~~ LOADING MANAGER ~~
// Create a loading manager
const loadingManager = new THREE.LoadingManager();

// Log progress during loading and increment progress bar
const progressBar = document.getElementById("progress-bar");
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressBar.value = (itemsLoaded / itemsTotal) * 100;
    console.log(`Loading file: ${url}. Progress: ${itemsLoaded} of ${itemsTotal} files.`);
};

// Log when all loading is complete and remove progrees bar container
const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = () => {
    progressBarContainer.style.display = "none";
    console.log(`All resources have been successfully loaded.`);
};

// Log if there's an error during loading
loadingManager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
};
// ~~ END LOADING MANAGER ~

// Load a font for TextGeometry
const fontLoader = new FontLoader(loadingManager);
let font;
fontLoader.load('/Roboto_Thin_Regular.json', (loadedFont) => {
    font = loadedFont;
});

// Use the loading manager with TextureLoader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Load portrait images
const portraits = groups.reduce((acc, group) => {
    if (group.picture) {
        const portrait = textureLoader.load(group.picture);
        acc[group.name] = portrait;
    }
    return acc;
}, {});

// Use the loading manager with SVGLoader
const svgLoader = new SVGLoader(loadingManager);
svgLoader.load(
    "/controls.svg",
    (data) => {
        const paths = data.paths;
        const group = new THREE.Group();
        
        // Convert SVG path to shapes
        paths.forEach((path) => {
            const shapes = path.toShapes(true);

            shapes.forEach((shape) => {
                const geometry = new THREE.ShapeGeometry(shape);
                const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            });
        });

        // Position the graphic within the scene
        group.position.z = -10;
        group.position.y = 18;
        group.position.x = 30;
        group.scale.set(0.015, 0.015, 0.015);
        group.rotation.set(1.75, 0, 0);
        scene.add(group);
    },
    (xhr) => {
        console.log("SVG graphics: " + (xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.log("Error loading SVG: ", error);
    }
);

// Create a plane geometry for the portrait image
const planeGeometry = new THREE.PlaneGeometry(1.6, 2);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
planeMaterial.map = null;
planeMaterial.opacity = 0;

// Set scale, rotation and position of portrait plane
plane.position.set(-34.5, 17, -5);
plane.rotation.set(-1.4, 0, 0);
plane.scale.set(6, 6, 6);
scene.add(plane);

// Create text caption for displaying notable person's name
let notablePersonText;
function createNotablePersonText(group) {
    if (font) {
        const textGeometry = new TextGeometry(group.notablePerson, {
            font: font,
            size: 0.4,
            depth: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        notablePersonText = new THREE.Mesh(textGeometry, textMaterial);

        scene.add(notablePersonText);
        notablePersonText.position.set(-29, 16, 0.7);
        notablePersonText.rotation.set(-1.4, 0, 0);
        notablePersonText.scale.set(3, 3, 3);
        
    }
}

// Add and set limits for orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 120;

// Pointer move function, allows tracking of cursor for object interaction
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    intersection(event);
}

window.addEventListener("pointermove", onPointerMove);

// Handle intersection logic
let INTERSECTED;
function intersection(event) {

    // Raycasting
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (INTERSECTED !== intersectedObject) {
            if (INTERSECTED) {
                
                // Ignores the SVG graphic being rendered in when cursor is hovering over it
                if (INTERSECTED.userData.group && INTERSECTED.userData.group.cubes) {
                    INTERSECTED.userData.group.cubes.forEach(cube => {
                        cube.material.color.set(INTERSECTED.userData.group.color);
                    });
                }
                if (notablePersonText) {
                    scene.remove(notablePersonText);
                    notablePersonText.geometry.dispose();
                    notablePersonText.material.dispose();
                }
            }

            // When hover over group, highlight colour applied
            const group = intersectedObject.userData.group;

            if (group && group.cubes) {
                group.cubes.forEach(cube => {
                    cube.material.color.set(0xffffae);
                });

                // Update text overlay content and position
                textOverlay.textContent = group.name || "The Westminster-Brussels Chart";
                const vector = new THREE.Vector3();
                intersectedObject.getWorldPosition(vector);

                switch (group.name) {
                    case "PPE":
                        subtitle.textContent = "Group of the European People's Party (Christian Democrats)";
                        break;
                    case "S&D":
                        subtitle.textContent = "Group of the Progressive Alliance of Socialists and Democrats in the European Parliament";
                        break;
                    case "PfE":
                        subtitle.textContent = "Patriots for Europe Group";
                        break;
                    case "ECR":
                        subtitle.textContent = "European Conservatives and Reformists Group";
                        break;
                    case "Renew":
                        subtitle.textContent = "Renew Europe Group";
                        break;
                    case "Verts/EFA":
                        subtitle.textContent = "Group of the Greens/European Free Alliance";
                        break;
                    case "The Left":
                        subtitle.textContent = "The Left group in the European Parliament - GUE/NGL";
                        break;
                    case "ESN":
                        subtitle.textContent = "Europe of Sovereign Nations Group";
                        break;
                    case "NI":
                        subtitle.textContent = "Non-inscrits";
                        break;
                    case "Vacant":
                        subtitle.textContent = "Vacant seat(s)";
                        break;
                    default:
                        subtitle.textContent = "An interactive chart by github.com/neuziad";
                        break;
                }

                // Set background colour to group colour overlay
                renderer.setClearColor(group.color, 0.4);

                // Set the portrait
                if (portraits[group.name]) {
                    planeMaterial.map = portraits[group.name];
                    planeMaterial.opacity = 1;
                    planeMaterial.needsUpdate = true;
                } else {
                    planeMaterial.map = null;
                    planeMaterial.opacity = 0;
                }

                // Create and position the notable person text
                createNotablePersonText(group);

                INTERSECTED = intersectedObject;
            }
        }
    } else {
        if (INTERSECTED) {

            // Safeguard to check if INTERSECTED has userData.group and cubes
            if (INTERSECTED.userData.group && INTERSECTED.userData.group.cubes) {
                INTERSECTED.userData.group.cubes.forEach(cube => {
                    cube.material.color.set(INTERSECTED.userData.group.color);
                });
            }

            INTERSECTED = null;

            // Set back to default header text and background colour
            textOverlay.textContent = "The Westminster-Brussels Chart";
            subtitle.textContent = "An interactive chart by github.com/neuziad";
            renderer.setClearColor(0xefefef, 1);

            // Make the plane invisible when no group is hovered
            planeMaterial.map = null;
            planeMaterial.opacity = 0;

            // Remove the notable person text when no group is hovered
            if (notablePersonText) {
                scene.remove(notablePersonText);
                notablePersonText.geometry.dispose();
                notablePersonText.material.dispose();
            }
        }
    }
}


// Parse the CSV file using Papa Parse
Papa.parse("/raw.csv", {
    download: true,
    header: true,
    complete: function (results) {
        const dataForm = results.data;

        let index = 0;
        let gridHeight = 10;
        let spacing = 1.2;

        groups.forEach((group) => {

            // Find the corresponding row for the group in the CSV data
            const groupData = dataForm.find(row => row.Groups.trim().toLowerCase() === group.name.trim().toLowerCase());

            if (!groupData) {
                console.error(`No matching data found for group: ${group.name}`);
                return;
            }

            // Sum the counts across all columns except for "EUP" (ignoring the "Groups" column)
            const groupCount = Object.keys(groupData)
                .filter(key => key !== "Groups" && key !== "EUP")
                .reduce((sum, key) => {
                    return sum + parseInt(groupData[key], 10);
                }, 0);

            console.log(`Group: ${group.name}, Count: ${groupCount}`);

            if (isNaN(groupCount) || groupCount <= 0) {
                return;
            }        
            
            // Create geometry and material for each cubes (as well as their hitboxes)
            const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 0.5, 5);
            const hitboxGeometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);

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

                cube.position.set(x - 39, 15, z + 2);
                hitbox.position.set(x - 39, 15, z + 2);

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
window.addEventListener("resize", () => {
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
