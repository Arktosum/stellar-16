import { Clock } from './digital-logic/clock';
import { Counter } from './digital-logic/flipflop';
import { HexDisplay } from './digital-logic/hexDisplay';
import './style.css'
import { createElement } from './util';

const root = document.body;

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
const counter = new Counter(16);
const hexDisplay = new HexDisplay(16, 'COUNTER');

const stepButton = bitButton('STEP', () => {
  for (let i = 0; i < 1; i++) {
    clock.step(pulse, waveStart, waveEnd);
  }
});

const bit0 = bitButton('K');
const bit1 = bitButton('J');
const bit2 = bitButton('DATA2');
const bit3 = bitButton('DATA3');

const registerContainer = createElement('div', 'flex');
registerContainer.appendChild(bit3);
registerContainer.appendChild(bit2);
registerContainer.appendChild(bit1);
registerContainer.appendChild(bit0);

root.appendChild(stepButton);
root.appendChild(registerContainer);
root.appendChild(hexDisplay.container);

function pulse(clock: boolean, phase: string) {
  console.log(`--------- PULSE START - ${phase} ---------`)
  counter.SYNC(clock, true, true);
  hexDisplay.display(counter.read());
  console.log(`--------- PULSE END -------------------`)
}
function waveStart() {
  console.log('--------- WAVE START ---------')
}
function waveEnd() {
  console.log('--------- WAVE END ---------')
}

// clock.start(pulse, waveStart, waveEnd);
