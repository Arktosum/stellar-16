import { AND, AND3, NOT, OR, XNOR, XOR } from "./gates";
import { dec_to_bool, Numeric } from "./Numeric";

export function HALF_ADDER(A: boolean, B: boolean): [boolean, boolean] {
    const SUM = XOR(A, B);
    const CARRY = AND(A, B);
    return [SUM, CARRY];
}

export function FULL_ADDER(A: boolean, B: boolean, CARRY: boolean) {
    const [HALF_SUM, HALF_CARRY] = HALF_ADDER(A, B);
    const [FULL_SUM, SUB_FINAL_CARRY] = HALF_ADDER(HALF_SUM, CARRY);
    const FULL_CARRY = OR(HALF_CARRY, SUB_FINAL_CARRY);
    return [FULL_SUM, FULL_CARRY];
}
export function FULL_ADDER_N(A: boolean[], B: boolean[], CARRY: boolean): [boolean[], boolean] {
    if (A.length != B.length) {
        throw new Error("Invalid bit Length of operands!")
    }
    let RESULT = [];
    let carry = CARRY
    for (let i = A.length - 1; i >= 0; i--) {
        let [full_sum, full_carry] = FULL_ADDER(A[i], B[i], carry);
        RESULT.push(full_sum);
        carry = full_carry
    }
    RESULT = RESULT.reverse();
    return [RESULT, carry];
}

export function MUX_2x1(A: boolean, B: boolean, S: boolean): boolean {
    return OR(AND(NOT(S), A), AND(S, B));
}

export function MUX_4x1(A: boolean, B: boolean, C: boolean, D: boolean, S1: boolean, S0: boolean): boolean {
    // 00 - A
    // 01 - B
    // 10 - C
    // 11 - D
    // Uses a MUX tree to make 4:1 MUX using 3 , 2:1 MUXes
    return MUX_2x1(MUX_2x1(A, B, S0), MUX_2x1(C, D, S0), S1);
}



export function DEMUX_1x2(A: boolean, S: boolean): boolean[] {
    return [AND(NOT(S), A), AND(S, A)]
}
export function DEMUX_recursive(A: boolean, S: boolean[]): boolean[] {
    // Base case: If there's only 1 selector bit, it's a 1x2 DEMUX
    if (S.length === 1) {
        return DEMUX_1x2(A, S[0]);
    }

    // Recursive case: Split the input with the first selector bit
    const [low, high] = DEMUX_1x2(A, S[0]);

    // Further split the low and high paths recursively
    const lowOutputs = DEMUX_recursive(low, S.slice(1));
    const highOutputs = DEMUX_recursive(high, S.slice(1));

    // Combine the outputs
    return [...lowOutputs, ...highOutputs];
}


export function DECODER_1x2(A: boolean): boolean[] {
    return [NOT(A), A]
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
        const binaryInput = dec_to_bool(i, m);
        let res = true;
        for (let j = 0; j < m; j++) {
            res = AND(res, XNOR(binaryInput[j], values[j]))
        }
        results.push(res);
    }
    return results;
}