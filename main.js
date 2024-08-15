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
let titleText;
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

        let titleTextOptions;

        if (group.name === "European Commission" || group.name === "Council of the EU") {
            titleTextOptions = "President"
        } else if (group.name === "Vacant") {
            titleTextOptions = "Vacant seat"
        } else {
            titleTextOptions = "Notable member"
        }

        const titleTextGeometry = new TextGeometry(titleTextOptions, {
            font: font,
            size: 0.4,
            depth: 0.1,
        });
        titleText = new THREE.Mesh(titleTextGeometry, textMaterial);
        scene.add(titleText);
        titleText.position.set(-29, 16.5, -1);
        titleText.rotation.set(-1.4, 0, 0);
        titleText.scale.set(2, 2, 2);
    }
}

// Add and set limits for orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 120;

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

const specialGroups = [
    { name: "European Commission", color: 0xf67003, cubes: [], picture: "/portraits/EC.jpg", notablePerson: "Ursula von der Leyen, DE" },
    { name: "Council of the EU", color: 0x2284a1, cubes: [], picture: "/portraits/COUNCIL.jpg", notablePerson: "Hungary, HU" },
];

// ~~ LOADING MANAGER ~~
// Create a loading manager
const loadingManager = new THREE.LoadingManager();

// DEPRECATED:
// Log progress during loading and increment progress bar
// const progressBar = document.getElementById("progress-bar");
// loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
//     progressBar.value = (itemsLoaded / itemsTotal) * 100;
// };

// Log when all loading is complete and remove progrees bar container
const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = () => {
    progressBarContainer.style.display = "none";
};

// Log if there's an error during loading
loadingManager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
};
// ~~ END LOADING MANAGER ~

// ~~ LOADERS ~~
// Load a font for TextGeometry
const fontLoader = new FontLoader(loadingManager);
let font;
fontLoader.load('/Roboto_Thin_Regular.json', (loadedFont) => {
    font = loadedFont;
});

// Use the loading manager with TextureLoader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Load portrait images
const portraits = [...groups, ...specialGroups].reduce((acc, group) => {
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
    }
);
// ~~ END LOADERS ~~

// ~~ EVENT LISTENERS ~~
// Pointer move function, allows tracking of cursor for object interaction
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    intersection(event);
}

window.addEventListener("pointermove", onPointerMove);

// Handle window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// ~~ END EVENT LISTENERS ~~

// ~~ INTERSECTION HANDLER ~~
let INTERSECTED;

// Handle hovering intersection logic
function intersection() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (INTERSECTED !== intersectedObject) {
            if (INTERSECTED) {
                resetGroupColor(INTERSECTED);
                clearText();
            }

            const group = intersectedObject.userData.group;

            if (group && group.cubes) {
                highlightGroup(group);
                updateOverlay(group);
                createNotablePersonText(group);
                INTERSECTED = intersectedObject;
            }
        }
    } else {
        if (INTERSECTED) {
            resetGroupColor(INTERSECTED);
            clearText();
            resetOverlay();
            INTERSECTED = null;
        }
    }
}

// Resets the color of all cubes in a group
function resetGroupColor(object) {
    if (object.userData.group && object.userData.group.cubes) {
        object.userData.group.cubes.forEach(cube => {
            cube.material.color.set(object.userData.group.color);
        });
    }
}

// Clears text geometry elements when called
function clearText() {
    if (notablePersonText) {
        scene.remove(notablePersonText);
        notablePersonText.geometry.dispose();
        notablePersonText.material.dispose();
    }

    if (titleText) {
        scene.remove(titleText);
        titleText.geometry.dispose();
        titleText.material.dispose();
    }
}

// Changes colour of group of cubes with highlight colour
function highlightGroup(group) {
    group.cubes.forEach(cube => {
        cube.material.color.set(0xffffae);
    });
}

// Updates HTML text overlay
function updateOverlay(group) {
    textOverlay.textContent = group.name || "The Westminster-Brussels Chart";
    renderer.setClearColor(group.color, 0.4);

    if (portraits[group.name]) {
        planeMaterial.map = portraits[group.name];
        planeMaterial.opacity = 1;
        planeMaterial.needsUpdate = true;
    } else {
        planeMaterial.map = null;
        planeMaterial.opacity = 0;
    }

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
            subtitle.textContent = "Seat left vacant in parliament";
            break;
        case "European Commission":
            subtitle.textContent = "The executive arm of the European Union";
            break;
        case "Council of the EU":
            subtitle.textContent = "Not to be confused with the European Council.";
            break;
        default:
            subtitle.textContent = "An interactive chart by github.com/neuziad";
            break;
    };
};

// Resets HTML text overlay
function resetOverlay() {
    textOverlay.textContent = "The Westminster-Brussels Chart";
    subtitle.textContent = "An interactive chart by github.com/neuziad";
    renderer.setClearColor(0xefefef, 1);
    planeMaterial.map = null;
    planeMaterial.opacity = 0;
    planeMaterial.needsUpdate = true;
}
// ~~ END INTERSECTION HANDLER ~~

// ~~ CSV DATA PARSER ~~
Papa.parse("/raw.csv", {
    download: true,
    header: true,
    complete: function (results) {
        const dataForm = results.data;

        let index = 0;
        let gridHeight = 10;
        let spacing = 1.2;

        // Parse and render main groups
        groups.forEach((group) => {
            const groupData = dataForm.find(row => row.Groups.trim().toLowerCase() === group.name.trim().toLowerCase());

            if (!groupData) {
                console.error(`No matching data found for group: ${group.name}`);
                return;
            }

            const groupCount = Object.keys(groupData)
                .filter(key => key !== "Groups" && key !== "EUP")
                .reduce((sum, key) => {
                    return sum + parseInt(groupData[key], 10);
                }, 0);


            if (isNaN(groupCount) || groupCount <= 0) {
                return;
            }        

            const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 0.5, 5);
            const hitboxGeometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
            const cubeMaterial = new THREE.MeshStandardMaterial({ color: group.color });
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
            
            for (let i = 0; i < groupCount; i++) {
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);

                cube.userData.group = group;
                hitbox.userData.group = group;

                scene.add(cube);
                scene.add(hitbox);
                group.cubes.push(cube);

                const x = Math.floor(index / gridHeight) * spacing;
                const z = (index % gridHeight) * spacing;

                cube.position.set(x - 39, 15, z + 2);
                hitbox.position.set(x - 39, 15, z + 2);

                cube.castShadow = true;
                cube.receiveShadow = true;

                index++;
            }
        });

        // Reset index and adjust position for the special groups
        index = 0;
        let specialGridHeight = 5;
        let specialSpacing = 1.3;

        // Parse and render special groups
        specialGroups.forEach((group) => {
            const groupData = dataForm.find(row => row.Groups.trim().toLowerCase() === group.name.trim().toLowerCase());

            if (!groupData) {
                console.error(`No matching data found for group: ${group.name}`);
                return;
            }

            const groupCount = Object.keys(groupData)
                .filter(key => key !== "Groups" && key !== "EUP")
                .reduce((sum, key) => {
                    return sum + parseInt(groupData[key], 10);
                }, 0);

            if (isNaN(groupCount) || groupCount <= 0) {
                return;
            }        

            const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 0.5, 5);
            const hitboxGeometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
            const cubeMaterial = new THREE.MeshStandardMaterial({ color: group.color });
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
            
            for (let i = 0; i < groupCount; i++) {
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);

                cube.userData.group = group;
                hitbox.userData.group = group;

                scene.add(cube);
                scene.add(hitbox);
                group.cubes.push(cube);

                // Position cubes in a separate grid on the opposite side
                const x = Math.floor(index / specialGridHeight) * specialSpacing;
                const z = (index % specialGridHeight) * specialSpacing;

                cube.position.set(x - 39, 15, z + 15);
                hitbox.position.set(x - 39, 15, z + 15);

                cube.castShadow = true;
                cube.receiveShadow = true;

                index++;
            }
        });

        // Start animation loop
        animate();
    }
});
// ~~ END CSV DATA PARSER ~~

// ~~ ACCESSIBILITY MODE ~~
let isAccessibilityMode = false;

window.toggleAccessibilityMode = function() {
    isAccessibilityMode = !isAccessibilityMode;
    updateColors();
}

function updateColors() {
    const colorblindColors = [
        0xffc20a, 0x994f00, 0x40b0a6, 0xe66100, 0x4b0092, 0xfefe62, 0x005ab5, 0x1a85ff, 0xffffff, 0x000000,
        0xf9a967, 0x0a275f
    ];

    if (isAccessibilityMode) {
        groups.forEach((group, index) => {
            group.color = colorblindColors[index];
            group.cubes.forEach(cube => cube.material.color.set(group.color));
        });
        specialGroups.forEach((group, index) => {
            group.color = colorblindColors[index + groups.length];
            group.cubes.forEach(cube => cube.material.color.set(group.color));
        });
    } else {
        // Revert to original colors
        groups.forEach((group) => {
            group.color = group.originalColor;
            group.cubes.forEach(cube => cube.material.color.set(group.color));
        });
        specialGroups.forEach((group) => {
            group.color = group.originalColor;
            group.cubes.forEach(cube => cube.material.color.set(group.color));
        });
    }
}

// Store the original color in the group object for later use
groups.forEach(group => {
    group.originalColor = group.color;
});
specialGroups.forEach(group => {
    group.originalColor = group.color;
});
// ~~ END ACCESSIBILITY MODE ~~

// ~~ ANIMATION LOOP ~~
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
// ~~ END ANIMATION LOOP ~~
