import { HEX_DISPLAY, nADDER } from "./arithmetic";
import { Clock } from "./clock";
import { Counter } from "./memory";
import { Numeric } from "./Numeric";

class HexDisplay{
    element: HTMLDivElement;
    constructor(){
        this.element = document.createElement("div");
        document.body.appendChild(this.element);
        this.displayNumber(Numeric.getBinaryArray("0000"));
    }
    displayNumber(booleanArray : boolean[]){
        let display = HEX_DISPLAY(booleanArray);
        let [A,B,C,D,E,F,G] = display.map((item)=>{
            return item ? "yellow" : '#3a3a3a'
        }) 
        this.element.innerHTML = `
        <div style="background-color:black; width : 100px; height:150px; padding : 5px; display:flex; flex-direction:column; align-items:center">
            <div id="a" style="background-color:${A}; width : 60px; height : 20px; border-radius: 10px;"></div>
            <div style="display:flex; justify-content:space-between; width:100%">
                <div id="f" style="background-color:${F}; width : 20px; height : 40px; border-radius: 10px;"></div>
                <div id="b" style="background-color:${B}; width : 20px; height : 40px; border-radius: 10px;"></div>
            </div>
            <div id="g" style="background-color:${G}; width : 60px; height : 20px; border-radius: 10px;"></div>
            <div style="display:flex; justify-content:space-between; width:100%">
                <div id="e" style="background-color:${E}; width : 20px; height : 40px; border-radius: 10px;"></div>
                <div id="c" style="background-color:${C}; width : 20px; height : 40px; border-radius: 10px;"></div>
            </div>
            <div id="d" style="background-color:${D}; width : 60px; height : 20px; border-radius: 10px;"></div>
        </div>
    `
    }
}

const hexDisplayA = new HexDisplay();
const hexDisplayB = new HexDisplay();
const hexDisplayC = new HexDisplay();
const hexDisplayD= new HexDisplay();


const clock = new Clock(20);



clock.startClock(pulse,pulseStart);


const counter = new Counter(16);

function pulseStart(){
    const ans = Numeric.fromBinaryArray(counter.output())

    let nibbleA = ans.binaryArray.slice(0,4);
    let nibbleB = ans.binaryArray.slice(4,8);
    let nibbleC = ans.binaryArray.slice(8,12);
    let nibbleD = ans.binaryArray.slice(12,16);

    hexDisplayA.displayNumber(nibbleA)
    hexDisplayB.displayNumber(nibbleB)
    hexDisplayC.displayNumber(nibbleC)
    hexDisplayD.displayNumber(nibbleD)
    // console.log(ans.binaryString,ans.decimalString);
}
function pulse(){
    counter.ASYNC(true,clock.clock);
}
