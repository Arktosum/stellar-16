import { HEX_DISPLAY } from "./arithmetic";
import { Numeric } from "./Numeric";

class HexDisplay {
    element: HTMLDivElement;
    constructor() {
        this.element = document.createElement("div");
        this.displayNumber(Numeric.getBinaryArray("0000"));
    }
    displayNumber(booleanArray: boolean[]) {
        let display = HEX_DISPLAY(booleanArray);
        let [A, B, C, D, E, F, G] = display.map((item) => {
            return item ? "#aaaa00" : '#3a3a3a'
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

export class HexDisplay16 {
    displayA: HexDisplay;
    displayB: HexDisplay;
    displayC: HexDisplay;
    displayD: HexDisplay;
    container: HTMLDivElement;
    constructor() {
        this.displayA = new HexDisplay();
        this.displayB = new HexDisplay();
        this.displayC = new HexDisplay();
        this.displayD = new HexDisplay();
        this.container = document.createElement("div");
        this.container.style.display = 'flex';

        this.container.appendChild(this.displayA.element);
        this.container.appendChild(this.displayB.element);
        this.container.appendChild(this.displayC.element);
        this.container.appendChild(this.displayD.element);
    }
    displayNumber(binaryArray: boolean[]) {
        if (binaryArray.length != 16) throw new Error("Invalid binary length in HexDisplay16!");
        let nibbleA = binaryArray.slice(0, 4);
        let nibbleB = binaryArray.slice(4, 8);
        let nibbleC = binaryArray.slice(8, 12);
        let nibbleD = binaryArray.slice(12, 16);

        this.displayA.displayNumber(nibbleA)
        this.displayB.displayNumber(nibbleB)
        this.displayC.displayNumber(nibbleC)
        this.displayD.displayNumber(nibbleD)
    }
}