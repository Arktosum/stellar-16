import { Clock } from "./clock";
import { Numeric } from "./Numeric";



const clock = new Clock(250);
clock.startClock(loop);


let i = 0;
function loop(){

}

for(let i = 0 ; i <= 2**16; i++){
    let number = i;
    let output = Numeric.fromBinaryArray(new Numeric(number,16).binaryArray).decimal;
}
console.log("All done!");