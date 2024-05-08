import { nADDER } from "./arithmetic";
import { Clock } from "./clock";
import { Counter } from "./memory";
import { Numeric } from "./Numeric";



const clock = new Clock(100);



clock.startClock(pulse,pulseStart);


const counter = new Counter(16);


function pulseStart(){
    const ans = Numeric.fromBinaryArray(counter.output())
    console.log(ans.binaryString,ans.decimalString);
}
function pulse(){
    counter.ASYNC(true,clock.clock);
}
