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


let OPERATION = [
    ()=>{},
    ()=>{},
    ()=>{
        console.log('ran')
        CONTROL_SIGNALS.REGISTER_A_OUTPUT = true;
        CONTROL_SIGNALS.REGISTER_B_STORE = true;
    }
]
const REGISTER_A = new Register(16);
const REGISTER_B = new Register(16);



function decimaltoBinaryArray(decimal : number , padding : number) : boolean[] {
    let binaryString = decimal.toString(2); // Convert number to binary string
    let binaryArray = binaryString.split('').map((x)=>Number(x) == 1); // Convert binary string to array of integers
    let paddedArray : boolean[] = Array(padding - binaryArray.length).fill(false).concat(binaryArray); // Pad array with zeros
    return paddedArray;
}



REGISTER_A.STORE(decimaltoBinaryArray(10,16),false,true);
REGISTER_A.STORE(decimaltoBinaryArray(10,16),true,true);
REGISTER_A.STORE(decimaltoBinaryArray(10,16),false,false);

const BUS = new Bus(16);


const CONTROL_SIGNALS = {
    REGISTER_A_STORE : false,
    REGISTER_A_OUTPUT : false,
    REGISTER_B_STORE : false,
    REGISTER_B_OUTPUT : false,
}

function boolArraytoString(array: boolean[]) {
    let output = {
        binary : "",
        decimal : 0,
    }

    for(let i = 0; i < array.length; i++) {
        let val = array[i];
        output.binary += val ? '1' : '0';
        output.decimal += val ? 2**(array.length - i -1) : 0;
    }
    return output
}
function computerLoop(){
    
    if(CONTROL_SIGNALS.REGISTER_B_OUTPUT){
        BUS.STORE(REGISTER_B.OUTPUT(CONTROL_SIGNALS.REGISTER_B_OUTPUT));
    }
    if(CONTROL_SIGNALS.REGISTER_A_OUTPUT){
        BUS.STORE(REGISTER_A.OUTPUT(CONTROL_SIGNALS.REGISTER_A_OUTPUT));
    }

    REGISTER_A.STORE(BUS.value,clock,CONTROL_SIGNALS.REGISTER_A_STORE);
    REGISTER_B.STORE(BUS.value,clock,CONTROL_SIGNALS.REGISTER_B_STORE);

   
}
function outputLoop(){
    // console.log(counter.output(false),clockCycles);
    for(let signal in CONTROL_SIGNALS){
        CONTROL_SIGNALS[signal] = false;
    }
    if(clockCycles < OPERATION.length){   
        OPERATION[clockCycles]();
    }
    console.log(CONTROL_SIGNALS)


    let register_a_value = boolArraytoString(REGISTER_A.OUTPUT(true));
    let register_b_value = boolArraytoString(REGISTER_B.OUTPUT(true));
    console.log("REGISTER A",register_a_value.decimal);
    console.log("REGISTER B",register_b_value.decimal);
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

requestAnimationFrame(animate);