import './style.css'
import './components/test'
import { ArithmeticUnit, Bus, Counter, Register } from './components/test';

let PULSE_WIDTH = 3
let computerFreq = 2

let freq = computerFreq*PULSE_WIDTH; // Hz
let time = (1/freq) * 1000; // seconds
let lastTime = Date.now();
let clock = false;

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const clockDiv = document.createElement('div');
document.body.appendChild(clockDiv);

clockDiv.style.width = `100px`;
clockDiv.style.height = `100px`;





let iPULSE_WIDTH =0
let clockCycles = 0;
let counter = new Counter(16);

const REGISTER_A = new Register(16);
const REGISTER_B = new Register(16);


const BUS = new Bus(16);

const store = true;
function computerLoop(){

}
function outputLoop(){
    console.log(counter.output(false),clockCycles);
}

function drawLoop() {
    if(ctx==null) return;
    if(clock && iPULSE_WIDTH == PULSE_WIDTH-1){
        outputLoop();
        clockCycles++;
    }
    if(iPULSE_WIDTH == PULSE_WIDTH){
        iPULSE_WIDTH = 0
        clock = !clock;
    }
    clockDiv.style.backgroundColor = clock ? 'green' : 'red';
    clockDiv.innerText = `${clockCycles}`;
    
    computerLoop();
    iPULSE_WIDTH++;
}

function animate(){
    let currentTime = Date.now();
    let deltaTime = currentTime - lastTime;
    if(deltaTime >= time){
        drawLoop();
        lastTime = currentTime;
    }
    requestAnimationFrame(animate);
}

// requestAnimationFrame(animate);