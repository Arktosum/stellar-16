import { Clock } from './digital-logic/clock';
import { DFlipFlop, Register } from './digital-logic/flipflop';
import './style.css'

const root = document.body;
function createElement(elementType: string, className: string = "", id: string = "", text: string = "") {
  const element = document.createElement(elementType);
  element.className = className;
  element.id = id;
  element.innerText = text;
  element.textContent = text;
  return element;
}
function bitButton(description: string, callback = () => { }) {
  const container = createElement('div', 'bit-container');
  const bitButton = createElement('div', 'bit-button');
  const bitDescription = createElement('div', 'bit-description', "", description);
  container.state = false;
  bitButton.classList.add('bit-off');
  container.appendChild(bitButton);
  container.appendChild(bitDescription);
  container.addEventListener('click', () => {
    container.state = !container.state;
    bitButton.classList.remove(container.state ? 'bit-off' : 'bit-on');
    bitButton.classList.add(!container.state ? 'bit-off' : 'bit-on');
    callback();
  })
  return container;
}

const clock = new Clock(1, 2);
const register = new Register(4);

const stepButton = bitButton('STEP', () => {
  clock.step(pulse, waveStart, waveEnd);
});

const bit0 = bitButton('DATA0');
const bit1 = bitButton('DATA1');
const bit2 = bitButton('DATA2');
const bit3 = bitButton('DATA3');

const registerContainer = createElement('div', 'flex');
registerContainer.appendChild(bit3);
registerContainer.appendChild(bit2);
registerContainer.appendChild(bit1);
registerContainer.appendChild(bit0);

root.appendChild(stepButton);
root.appendChild(registerContainer);



function pulse(clock: boolean, phase: string) {
  console.log(`--------- PULSE START - ${phase} ---------`)
  register.write(clock, [bit3.state, bit2.state, bit1.state, bit0.state])
  console.log(`--------- PULSE END -------------------`)
}

function waveStart() {
  console.log('--------- WAVE START ---------')
}

function waveEnd() {
  console.log('--------- WAVE END ---------')
  console.log(register.read());
}

// clock.start(pulse, waveStart, waveEnd);
