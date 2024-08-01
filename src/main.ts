import { AND, AND3, NOT, OR_N } from "./gates";
import { Counter } from "./sequential";

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


class HexDisplay {
    element: HTMLDivElement;
    constructor() {
        this.element = document.createElement('div');
    }
    getHex(value: boolean[]): boolean[] {
        const [A, B, C, D] = value;
        const [A_, B_, C_, D_] = [NOT(A), NOT(B), NOT(C), NOT(D)]

        const a = OR_N([AND3(A, B_, C_), AND3(A_, B, D), AND(A, D_), AND(A_, C), AND(B, C), AND(B_, D_)])
        const b = OR_N([AND3(A_, C_, D_), AND3(A_, C, D), AND3(A, C_, D), AND(B_, C_), AND(B_, D_)])
        const c = OR_N([AND(A_, C_), AND(A_, D), AND(C_, D), AND(A_, B), AND(A, B_)])
        const d = OR_N([AND3(A_, B_, D_), AND3(B_, C, D), AND3(B, C_, D), AND3(B, C, D_), AND(A, C_)])
        const e = OR_N([AND(B_, D_), AND(C, D_), AND(A, C), AND(A, B)])
        const f = OR_N([AND3(A_, B, C_), AND(C_, D_), AND(B, D_), AND(A, B_), AND(A, C)])
        const g = OR_N([AND3(A_, B, C_), AND(B_, C), AND(C, D_), AND(A, B_), AND(A, D)])

        return [a, b, c, d, e, f, g]
    }
    display(value: boolean[]) {
        if (value.length != 4) {
            console.error("Invalid value for hex display! only 4 bits are allowed!");
            return;
        }
        let [a, b, c, d, e, f, g] = this.getHex(value);

        const check = (isOn: boolean) => isOn ? "good-color" : "bad-color"
        this.element.innerHTML = `<div class="hex-container">
      <div class="hex-horiz ${check(a)}"></div>
      <div class="hex-flat">
        <div class="hex-vert ${check(f)}"></div>
        <div class="hex-vert ${check(b)}"></div>
      </div>
      <div class="hex-horiz ${check(g)}"></div>
      <div class="hex-flat">
        <div class="hex-vert ${check(e)}"></div>
        <div class="hex-vert ${check(c)}"></div>
      </div>
      <div class="hex-horiz ${check(d)}"></div>
    </div>`
    }
}

const hexDis = new HexDisplay();
const hexDis1 = new HexDisplay();
const hexDis2 = new HexDisplay();
const hexDis3 = new HexDisplay();

document.body.appendChild(hexDis.element);
document.body.appendChild(hexDis1.element);
document.body.appendChild(hexDis2.element);
document.body.appendChild(hexDis3.element);

function pulse() {
    clockElement.style.backgroundColor = clock ? 'green' : "red";
    counter.SYNC(true, clock);
}

function log_wave_end() {
    const value = counter.read(true)
    // getCounts()
    hexDis.display(value.slice(0, 4));
    hexDis1.display(value.slice(4, 8));
    hexDis2.display(value.slice(8, 12));
    hexDis3.display(value.slice(12, 16));
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