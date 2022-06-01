//GLOBAL VARIABLES
const startPosition = 3.5;
const endPosition = -startPosition;
const text = document.querySelector(".text");
const timeLimit= 10;
let gameStat = "loading";
let isLookingBackward = true;

// SCENE CAMERA PREAPRATION
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//CAMERA
camera.position.z = 5; // lesser = closer

//LIGHT
const light = new THREE.AmbientLight( 0xffffff ); 
scene.add( light );

//COLOR
renderer.setClearColor (0xb7c3f3, 1);

//CUBE
function createCube(size, positionX, rotY = 0, color = 0xF0BB62){
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

//DOLL
const loader = new THREE.GLTFLoader();
class Doll{
    constructor(){
            loader.load("../models/scene.gltf", (gltf) => {
            scene.add( gltf.scene );
            gltf.scene.scale.set(.4,.4,.4);
            gltf.scene.position.set(0,-1,0);
            this.doll = gltf.scene;
        }) 
    }
    lookBackward(){
        gsap.to(this.doll.rotation, {y: -3.15, duration: 1});
        setTimeout(() => {
            isLookingBackward = true;
        }, 150);
    }
    lookForward(){
        gsap.to(this.doll.rotation, {y: 0, duration: 1});
        setTimeout(() => {
            isLookingBackward = false;
        }, 450);
    }
    async start(){
        this.lookBackward();
        await delay((Math.random() * 1000)+1000);
        this.lookForward();
        await delay((Math.random() * 750)+750);
        this.start();
    }
}

let doll= new Doll();


//TRACK
function createTrack(){
    createCube({w: startPosition * 2+0.2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z=-1;
    createCube({w: .2, h: 1.5, d: 1}, startPosition, -.35);
    createCube({w: .2, h: 1.5, d: 1}, endPosition, .35);
}
createTrack();

//PLAYER
class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        sphere.position.z = 1;
        sphere.position.x = startPosition;
        this.player = sphere;
        this.playerInfo = {
            positionX : startPosition,
            velocity : 0
        }
    }
    check(){
        if (this.playerInfo.velocity>0 && !isLookingBackward){
            alert ("YOU LOSE");
            gameStat = "over";
        }
        else if (this.playerInfo.positionX < endPosition + .4){
            alert ("YOU WIN");
            gameStat = "over";
        }
        else if (timeLimit == 0){
            alert ("YOU LOSE");
        }
    }
    run(){
        this.playerInfo.velocity = .03;
    }
    stop(){
        this.playerInfo.velocity = 0;
    }
    update(){
        this.check();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}
const player = new Player();

async function init(){
    await delay(500);
    text.innerText = "Starting in 3";
    await delay(500);
    text.innerText = "Starting in 2";
    await delay(500);
    text.innerText = "Starting in 1";
    await delay(500);
    text.innerText = "GOOOO!!!";
    startGame();
}
function startGame(){
    gameStat = "started";
    let progressbar = createCube({w: 5, h: .1, d: 1}, 0);
    progressbar.position.y = 3.35;
    gsap.to(progressbar.scale, {x: 0, duration: timeLimit, ease: "none"});
    setTimeout(() => {
        if(gameStat != "over"){
            text.innerText = "Time Out!!!";
            gameStat = "over"
        }
    }, timeLimit * 1000)
    doll.start();
}
init();
//CONSTANT ANIMATION
function animate() {
    if (gameStat === "over") return;
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    player.update();
}
animate();

//RESPONSIVE
window.addEventListener('resize', onWindowResize, false);
function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize (window.innerWidth,window.innerHeight);
}

//CONTROLS
window.addEventListener('keydown', (e) => {
    if (gameStat != "started" ){
        return;
    }

    else if (e.key == "ArrowUp"){
        player.run();
    }
})
window.addEventListener('keyup', (e) => {
    if (e.key == "ArrowUp"){
        player.stop();
    }
})