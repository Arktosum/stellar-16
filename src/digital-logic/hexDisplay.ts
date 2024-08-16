import { createElement } from "../util";
import { AND, AND3, NOT, OR } from "./gates";

function SOP(products: boolean[]): boolean {
    let ans = false;
    for (let product of products) {
        ans = OR(ans, product);
    }
    return ans;
}




export function hex_decoder(booleanArray: boolean[]): boolean[] {
    if (booleanArray.length != 4) {
        throw Error("Invalid input size in hex display!");
    }

    let [A, B, C, D] = booleanArray
    let [NA, NB, NC, ND] = [NOT(A), NOT(B), NOT(C), NOT(D)]
    let products_a = [AND(NB, ND), AND(NA, C), AND(B, C), AND(A, ND), AND3(NA, B, D), AND3(A, NB, NC)]
    let products_b = [AND(NA, NB), AND(NB, ND), AND3(NA, NC, ND), AND3(NA, C, D), AND3(A, NC, D)]
    let products_c = [AND(NA, NC), AND(NA, D), AND(NC, D), AND(NA, B), AND(A, NB)]
    let products_d = [AND(A, NC), AND3(NA, NB, ND), AND3(NB, C, D), AND3(B, NC, D), AND3(B, C, ND)]
    let products_e = [AND(NB, ND), AND(C, ND), AND(A, C), AND(A, B)]
    let products_f = [AND(NC, ND), AND(B, ND), AND(A, NB), AND(A, C), AND3(NA, B, NC)]
    let products_g = [AND(NB, C), AND(C, ND), AND(A, NB), AND(A, D), AND3(NA, B, NC)]

    const a = SOP(products_a);
    const b = SOP(products_b);
    const c = SOP(products_c);
    const d = SOP(products_d);
    const e = SOP(products_e);
    const f = SOP(products_f);
    const g = SOP(products_g);

    // a , b, c, d, e , f, g
    return [a, b, c, d, e, f, g];
}

export class SevenSegmentDisplay {
    a_div: HTMLElement;
    b_div: HTMLElement;
    c_div: HTMLElement;
    d_div: HTMLElement;
    e_div: HTMLElement;
    f_div: HTMLElement;
    g_div: HTMLElement;
    container: HTMLElement;
    constructor() {
        this.container = createElement('div', 'hex-container');
        this.a_div = createElement('div', 'hex-horizontal hex-off');
        this.b_div = createElement('div', 'hex-vertical hex-off');
        this.c_div = createElement('div', 'hex-vertical hex-off');
        this.d_div = createElement('div', 'hex-horizontal hex-off');
        this.e_div = createElement('div', 'hex-vertical hex-off');
        this.f_div = createElement('div', 'hex-vertical hex-off');
        this.g_div = createElement('div', 'hex-horizontal hex-off');

        this.container.appendChild(this.a_div);
        const top_vertical_container = createElement('div', 'hex-vertical-container');
        top_vertical_container.appendChild(this.f_div);
        top_vertical_container.appendChild(this.b_div);
        this.container.appendChild(top_vertical_container);
        const bottom_vertical_container = createElement('div', 'hex-vertical-container');
        bottom_vertical_container.appendChild(this.e_div);
        bottom_vertical_container.appendChild(this.c_div);
        this.container.appendChild(this.g_div);
        this.container.appendChild(bottom_vertical_container);
        this.container.appendChild(this.d_div);
        this.display([false, false, false, false]) // Display zero initially.
    }
    display(data: boolean[]) {
        const [a, b, c, d, e, f, g] = hex_decoder(data);
        this.a_div.classList.replace(a ? 'hex-off' : 'hex-on', a ? 'hex-on' : 'hex-off');
        this.b_div.classList.replace(b ? 'hex-off' : 'hex-on', b ? 'hex-on' : 'hex-off');
        this.c_div.classList.replace(c ? 'hex-off' : 'hex-on', c ? 'hex-on' : 'hex-off');
        this.d_div.classList.replace(d ? 'hex-off' : 'hex-on', d ? 'hex-on' : 'hex-off');
        this.e_div.classList.replace(e ? 'hex-off' : 'hex-on', e ? 'hex-on' : 'hex-off');
        this.f_div.classList.replace(f ? 'hex-off' : 'hex-on', f ? 'hex-on' : 'hex-off');
        this.g_div.classList.replace(g ? 'hex-off' : 'hex-on', g ? 'hex-on' : 'hex-off');
    }
}

export class HexDisplay {
    size: number;
    displays: SevenSegmentDisplay[];
    container: HTMLElement;
    constructor(bitLength: number,description : string) {
        if (bitLength % 4 != 0) {
            console.error("Cannot display hex value without multiple of 4 bits!");
        }
        this.size = bitLength / 4;
        this.displays = [];
        for (let i = 0; i < this.size; i++) {
            this.displays.push(new SevenSegmentDisplay());
        }

        this.container = createElement('div', 'multi-hex-container flex-col');
        const displayContainer = createElement('div', 'flex');
        const textContainer = createElement('div', 'font-class',"",description);
        for (let display of this.displays) {
            displayContainer.appendChild(display.container);
        }
        this.container.appendChild(displayContainer);
        this.container.appendChild(textContainer);
    }
    display(data: boolean[]) {
        if (data.length != this.size * 4) {
            console.error("Given data length does not match Hex Display size!");
        }
        for (let i = 0; i < data.length; i += 4) {
            this.displays[Math.floor(i / 4)].display(data.slice(i, i + 4));
        }
    }
}