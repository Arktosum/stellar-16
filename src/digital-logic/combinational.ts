import { XOR, AND, OR, NOT, NAND, NOR, XNOR } from "./gates";
import { decimalToBooleanArray } from "./utils";

export function HALF_ADDER(A: boolean, B: boolean): { sum: boolean, carry: boolean } {
    const sum = XOR(A, B);
    const carry = AND(A, B);
    return { sum, carry };
}

export function FULL_ADDER(A: boolean, B: boolean, Cin: boolean): { sum: boolean, carry: boolean } {
    const sum = XOR(XOR(A, B), Cin);
    const carry = OR(AND(A, B), AND(Cin, XOR(A, B)));
    return { sum, carry };
}

export function MUX_2x1(I1: boolean, I0: boolean, S: boolean): boolean {
    // S ? I1 : I0
    return OR(AND(S, I1), AND(NOT(S), I0));
}

export function MUX_4x1(inputs: boolean[], selects: boolean[]): boolean {

    const ordered_inputs = [...inputs].reverse()
    const ordered_selects = [...selects].reverse()

    const mux1 = MUX_2x1(ordered_inputs[0], ordered_inputs[1], ordered_selects[0])
    const mux2 = MUX_2x1(ordered_inputs[2], ordered_inputs[3], ordered_selects[0])

    return MUX_2x1(mux1, mux2, ordered_selects[1]);
}

export function MUX_8x1(inputs: boolean[], selects: boolean[]): boolean {

    const ordered_inputs = [...inputs].reverse()
    const ordered_selects = [...selects].reverse()

    const mux1 = MUX_2x1(ordered_inputs[0], ordered_inputs[1], ordered_selects[0])
    const mux2 = MUX_2x1(ordered_inputs[2], ordered_inputs[3], ordered_selects[0])
    const mux3 = MUX_2x1(ordered_inputs[4], ordered_inputs[5], ordered_selects[0])
    const mux4 = MUX_2x1(ordered_inputs[6], ordered_inputs[7], ordered_selects[0])

    const mux5 = MUX_2x1(mux1, mux2, ordered_selects[1]);
    const mux6 = MUX_2x1(mux3, mux4, ordered_selects[1]);

    return MUX_2x1(mux5, mux6, ordered_selects[2]);
}
export function ALU(inputA: boolean[], inputB: boolean[], control: boolean[], width: number): boolean[] {
    if (inputA.length !== width || inputB.length !== width) {
        throw new Error(`Inputs must be ${width} bits wide`);
    }
    /*  
        000: NOT A
        001: AND
        010: OR
        011: XOR
        100: NAND
        101: NOR
        110: Addition (using Full Adder)
        111: Subtraction (using Two's Complement)
    */
    const NOT_A_RESULT = inputA.map((A) => NOT(A));
    const AND_RESULT = inputA.map((A, index) => AND(A, inputB[index]));
    const OR_RESULT = inputA.map((A, index) => OR(A, inputB[index]));
    const XOR_RESULT = inputA.map((A, index) => XOR(A, inputB[index]));
    const NAND_RESULT = inputA.map((A, index) => NAND(A, inputB[index]));
    const NOR_RESULT = inputA.map((A, index) => NOR(A, inputB[index]));
    const ADDITION_RESULT = []
    const SUBTRACTION_RESULT = []

    let carry = false;
    for (let i = width - 1; i >= 0; i--) {
        // Reverse to conveniently get LSB to MSB
        let result = FULL_ADDER(inputA[i], inputB[i], carry);
        ADDITION_RESULT.push(result.sum);
        carry = result.carry;
    }
    // Because we pushed LSB to MSB , we need to reverse it back
    ADDITION_RESULT.reverse();

    // Subtraction (A - B) by using two's complement
    const notB = inputB.map(bit => NOT(bit)); // NOT B

    carry = true; // Here its true because to subtract we need to add ONE. so this basically works as expected.
    for (let i = width - 1; i >= 0; i--) {
        // Reverse to conveniently get LSB to MSB
        const result = FULL_ADDER(inputA[i], notB[i], carry);
        SUBTRACTION_RESULT.push(result.sum);
        carry = result.carry;
    }
    // Because we pushed LSB to MSB , we need to reverse it back
    SUBTRACTION_RESULT.reverse();

    const RESULT = [];

    for (let i = 0; i < width; i++) {
        const inputs = [NOT_A_RESULT[i], AND_RESULT[i], OR_RESULT[i], XOR_RESULT[i], NAND_RESULT[i], NOR_RESULT[i], ADDITION_RESULT[i], SUBTRACTION_RESULT[i]]
        RESULT.push(MUX_8x1(inputs, control));
    }

    return RESULT;
}


function AND_ARRAY(inputs: boolean[]): boolean {
    let result = true;
    for (let i = 0; i < inputs.length; i++) {
        result = AND(result, inputs[i]);
    }
    return result;
}


export function DECODER_mxn(inputs: boolean[]): boolean[] {
    // m , n = m^2
    const m = inputs.length;
    const n = 2 ** m;
    const RESULT = [];
    for (let i = 0; i < n; i++) {
        const value = decimalToBooleanArray(i, m);
        const xnors = [];
        for (let j = 0; j < m; j++) {
            xnors.push(XNOR(value[j], inputs[j]));
        }
        RESULT.push(AND_ARRAY(xnors));
    }
    return RESULT;
}
