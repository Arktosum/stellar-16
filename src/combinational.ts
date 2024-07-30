import { XOR, AND, OR, NOT } from "./gates";


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

    const FULL_SUMS = [];
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
    const SUB_INPUT = [];
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