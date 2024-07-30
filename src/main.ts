import Numeric from "./number";
import { Counter, FlipFlop } from "./sequential";

let clock = true;
const CLOCK_FREQUENCY = 50 // Hz
const CLOCK_SPEED = 1000 / CLOCK_FREQUENCY // ms
const ON_TIME = 2 // ms

let inputA = false;
let inputB = false;
let inputC = false;



const clockElement = document.createElement('div');
const btnElementA = document.createElement('button');
const btnElementB = document.createElement('button');
const btnElementC = document.createElement('button');

btnElementA.innerText = 'A'
btnElementB.innerText = 'B'
btnElementC.innerText = 'C'




btnElementA.addEventListener('click', (() => {
    inputA = !inputA;
    btnElementA.style.backgroundColor = inputA ? 'green' : "red";

}))
btnElementB.addEventListener('click', (() => {
    inputB = !inputB
    btnElementB.style.backgroundColor = inputB ? 'green' : "red";

}))
btnElementC.addEventListener('click', (() => {
    inputC = !inputC
    btnElementC.style.backgroundColor = inputC ? 'green' : "red";

}))
btnElementC.addEventListener('click', wave_pulse);
document.body.appendChild(clockElement);


document.body.appendChild(btnElementA);
document.body.appendChild(btnElementB);
document.body.appendChild(btnElementC);

clockElement.style.width = '100px';
clockElement.style.height = '100px';
clockElement.style.transition = 'background-color 0.1s'; // smooth transition for better visual effect

const counter = new Counter(16);

function pulse() {
    clockElement.style.backgroundColor = clock ? 'green' : "red";
    counter.SYNC(true, clock);
}

function log_wave_end() {
    console.log(Numeric.fromBinary(counter.read(false)).decimal)
}
function wave_pulse() {
    // console.log('-----------CYCLE START------------------')
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    // console.log("Negative Edge!")
    clock = !clock;
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    clock = !clock;
    log_wave_end();
    // console.log('-----------CYCLE END------------------')
}

setInterval(wave_pulse, CLOCK_SPEED);