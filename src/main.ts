import { Clock } from "./clock";
import { HexDisplay16 } from "./components";
import { Counter } from "./memory";
import { Numeric } from "./Numeric";

const clock = new Clock(10);
clock.startClock(pulse, pulseStart);
const counter = new Counter(16);
const element = new HexDisplay16();
document.body.appendChild(element.container);

function pulseStart() {
    const ans = Numeric.fromBinaryArray(counter.output())
    element.displayNumber(ans.binaryArray);
    // console.log(ans.binaryString,ans.decimalString);
}
function pulse() {
    counter.ASYNC(true, clock.clock);
}
