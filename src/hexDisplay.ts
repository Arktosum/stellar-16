import { NOT, OR_N, AND3, AND } from "./gates";

export class HexDisplay {
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
    this.element.innerHTML = `
    <div class="hex-container">
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
    </div>
    `
  }
}

export class HexDisplay4 {
  hex_displays: HexDisplay[];
  container: HTMLDivElement;
  constructor(displayName:string) {
    this.hex_displays = [];
    for (let i = 0; i < 4; i++) {
      this.hex_displays.push(new HexDisplay());
    }
    this.container = document.createElement('div');
    const containerElement = document.createElement('div');
    const textElement = document.createElement('div');
    this.container.style.display = 'flex';
    containerElement.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    textElement.textContent = displayName
    this.container.appendChild(containerElement);
    this.container.appendChild(textElement);
    containerElement.appendChild(this.hex_displays[0].element);
    containerElement.appendChild(this.hex_displays[1].element);
    containerElement.appendChild(this.hex_displays[2].element);
    containerElement.appendChild(this.hex_displays[3].element);
  }
  display(value: boolean[]) {
    this.hex_displays[0].display(value.slice(0, 4));
    this.hex_displays[1].display(value.slice(4, 8));
    this.hex_displays[2].display(value.slice(8, 12));
    this.hex_displays[3].display(value.slice(12, 16));
  }
}