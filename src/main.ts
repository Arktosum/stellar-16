import './style.css'
import './components/test'
import { Bus, Counter, Register } from './components/test';


class Logger{
    global_log: boolean;
    constructor(){
        this.global_log = true;       
    }
    log(message: string){
        if(!this.global_log) return;
        console.log(message);
    }
}

const logger = new Logger();
let freq = 1
let clockMultiplier = 1
let time = (1/freq)*1000 // ms
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

let clockCycles = 0;

let OPERATION = [
    ()=>{},
    ()=>{
        CONTROL_SIGNALS.REGISTER_A_OUTPUT = true;
        CONTROL_SIGNALS.REGISTER_B_STORE = true;
    }
]

const REGISTER_A = new Register(16);
const REGISTER_B = new Register(16);


REGISTER_A.STORE(decimaltoBinaryArray(10,16),false,true);
REGISTER_A.STORE(decimaltoBinaryArray(10,16),true,true);
REGISTER_A.STORE(decimaltoBinaryArray(10,16),false,true);

function decimaltoBinaryArray(decimal : number , padding : number) : boolean[] {
    let binaryString = decimal.toString(2); // Convert number to binary string
    let binaryArray = binaryString.split('').map((x)=>Number(x) == 1); // Convert binary string to array of integers
    let paddedArray : boolean[] = Array(padding - binaryArray.length).fill(false).concat(binaryArray); // Pad array with zeros
    return paddedArray;
}



const BUS = new Bus(16);
let counter = new Counter(16);

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
    counter.SYNC(clock,true);
    
    if(CONTROL_SIGNALS.REGISTER_B_OUTPUT){
        BUS.STORE(REGISTER_B.OUTPUT(CONTROL_SIGNALS.REGISTER_B_OUTPUT));
    }
    if(CONTROL_SIGNALS.REGISTER_A_OUTPUT){
        BUS.STORE(REGISTER_A.OUTPUT(CONTROL_SIGNALS.REGISTER_A_OUTPUT));
    }

    REGISTER_A.STORE(BUS.value,clock,CONTROL_SIGNALS.REGISTER_A_STORE);
    REGISTER_B.STORE(BUS.value,clock,CONTROL_SIGNALS.REGISTER_B_STORE);

    
}
function intializeLoop(){
    for(let signal in CONTROL_SIGNALS){
        CONTROL_SIGNALS[signal] = false;
    }
    if(clockCycles < OPERATION.length){   
        OPERATION[clockCycles]();
    }
}
function outputLoop(){
    let register_a_value = boolArraytoString(REGISTER_A.OUTPUT(true));
    let register_b_value = boolArraytoString(REGISTER_B.OUTPUT(true));
    logger.log("COUNTER : "+ counter.output(true).decimal.toString(10));
    logger.log("Register A : " +register_a_value.decimal.toString(10));
    logger.log("Register B : " +register_b_value.decimal.toString(10));

}

function drawLoop() {
    if(ctx==null) return;
    logger.log(`////////////------- START OF CLOCK CYCLE ${clockCycles}-----------////////////`);
    intializeLoop();
    logger.log(`------- END OF INTIALIZATION ${clockCycles}-----------`);
    logger.log(`------- EXECUTION ${clockCycles}-----------`);
    clock = false;
    computerLoop();
    computerLoop();
    clock = true;
    computerLoop();
    computerLoop();
    outputLoop();
    logger.log(`////////////------- END OF CLOCK CYCLE ${clockCycles}-----------////////////`);
    clockCycles++;
}

setInterval(()=>{
    for(let i = 0;  i < clockMultiplier ; i++){
        drawLoop();
    }
},time)


let prevClockSpeed = 0;
setInterval(()=>{
    let curr = clockCycles - prevClockSpeed;
    prevClockSpeed = clockCycles;
    clockDiv.innerText = `${curr} Hz`;
},1000)


// function animate(){
//     requestAnimationFrame(animate);

//     let currentTime = Date.now();
//     let deltaTime = currentTime - lastTime;
//     if(deltaTime >= time){
//         drawLoop();
//         lastTime = currentTime;
//     }
// }




// requestAnimationFrame(animate);