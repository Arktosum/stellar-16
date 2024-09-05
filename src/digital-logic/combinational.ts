import { XOR, AND, OR, NOT, XNOR } from "./gates";
import Numeric from "./number";

function HALF_ADDER(A: boolean, B: boolean): [boolean, boolean] {
    const SUM = XOR(A, B);
    const CARRY = AND(A, B);

    return [SUM, CARRY];
}

function FULL_ADDER(A: boolean, B: boolean, CarryIn: boolean): [boolean, boolean] {
    const [HALF_SUM, HALF_CARRY] = HALF_ADDER(A, B);
    const [FULL_SUM, NEXT_CARRY] = HALF_ADDER(HALF_SUM, CarryIn);
    const FULL_CARRY = OR(HALF_CARRY, NEXT_CARRY);

    return [FULL_SUM, FULL_CARRY];
}
export function FULL_ADDER_N(A: boolean[], B: boolean[], carryIn: boolean): [boolean[], boolean] {
    if (A.length != B.length) {
        throw new Error("A and B must have same bitLength!");
    }

    const FULL_SUMS: boolean[] = [];
    let FULL_CARRY = carryIn;
    const bitLength = A.length;

    for (let i = bitLength - 1; i >= 0; i--) {
        const [sum, carry] = FULL_ADDER(A[i], B[i], FULL_CARRY);
        FULL_SUMS.push(sum);
        FULL_CARRY = carry;
    }
    FULL_SUMS.reverse();
    return [FULL_SUMS, FULL_CARRY]
}
export function ARITHMETIC(A: boolean[], B: boolean[], subtract: boolean): [boolean[], boolean, boolean, boolean] {
    if (A.length != B.length) {
        throw new Error("A and B must have same bitLength!");
    }
    const SUB_INPUT: boolean[] = [];
    for (let i = 0; i < A.length; i++) {
        SUB_INPUT.push(XOR(B[i], subtract));
    }
    const [SUM, CARRY] = FULL_ADDER_N(A, SUB_INPUT, subtract);

    let ZERO_FLAG = true; // Zero if ALL bits are 0
    let OVERFLOW_FLAG = CARRY // Overflow if SET
    let NEGATIVE_FLAG = SUM[0]; // NEGATIVE if First bit is SET
    for (let bit of SUM) {
        ZERO_FLAG = AND(ZERO_FLAG, NOT(bit));
    }
    return [SUM, NEGATIVE_FLAG, OVERFLOW_FLAG, ZERO_FLAG];
}
export function MUX2_1(A: boolean, B: boolean, select0: boolean): boolean {
    // select0 ? A : B
    return OR(AND(A, select0), AND(B, NOT(select0)));
}
export function DECODER2_4(A: boolean, B: boolean): [boolean, boolean, boolean, boolean] {
    /*
    DECODER
    
    A B | Y0 Y1 Y2 Y3
    0 0 |  1 0  0  0
    0 1 |  0 1  0  0
    1 0 |  0 0  1  0
    1 1 |  0 0  0  1
    */
    const Y0 = AND(NOT(A), NOT(B))
    const Y1 = AND(NOT(A), B)
    const Y2 = AND(A, NOT(B))
    const Y3 = AND(A, B)
    return [Y0, Y1, Y2, Y3]
}
// SLOW FUNCTION EVEN FOR 16 BITS. In real life this would be a parallel circuit.
export function DECODERM_2N(values: boolean[]): boolean[] {
    const m = values.length;
    const n = 2 ** values.length;
    const results: boolean[] = [];

    for (let i = 0; i < n; i++) {
        const binaryInput = (new Numeric(i)).toBinary(m);
        let res = true;
        for (let j = 0; j < m; j++) {
            res = AND(res, XNOR(binaryInput[j], values[j]))
        }
        results.push(res);
    }
    return results;
}

// 00 1
// 01 1
// 10 1
// 11 0

// JA = NOR(L',CL')
// KA = 
