import { AND, NOR, NOT, OR, XNOR, XOR } from "./gate";
import Numeric from "./Numeric";
// CIN, A, B  -> SUM , COUT

// 0 , 0 , 0   -> 0   , 0
// 0 , 0 , 1   -> 1   , 0
// 0 , 1 , 0   -> 1   , 0
// 0 , 1 , 1   -> 0   , 1

export function HALF_ADDER(A: boolean, B: boolean): { SUM: boolean; CARRY: boolean } {
    const SUM = XOR(A, B);
    const CARRY = AND(A, B)
    return { SUM, CARRY };
}

// CIN, A, B  -> SUM , COUT

// 0 , 0 , 0   -> 0   , 0
// 0 , 0 , 1   -> 1   , 0
// 0 , 1 , 0   -> 1   , 0
// 0 , 1 , 1   -> 0   , 1

// 1 , 0 , 0   -> 1   , 0
// 1 , 0 , 1   -> 0   , 1
// 1 , 1 , 0   -> 0   , 1
// 1 , 1 , 1   -> 1   , 1

export function FULL_ADDER(CIN: boolean, A: boolean, B: boolean): { SUM: boolean; COUT: boolean } {
    const firstHalf = HALF_ADDER(A, B);

    const secondHalf = HALF_ADDER(CIN, firstHalf.SUM);
    const COUT = OR(firstHalf.CARRY, secondHalf.CARRY);
    return { SUM: secondHalf.SUM, COUT };
}



export function LOGIC_N_BIT(A: Numeric, B: Numeric, operation: 'AND' | 'OR' | 'XOR' | 'NOR' | 'XNOR'): Numeric {
    if (A.bit_size !== B.bit_size) {
        throw new Error("Bit sizes of A and B must be the same");
    }
    const bit_size = A.bit_size;
    const RESULT_array: boolean[] = [];
    for (let i = 0; i < bit_size; i++) {
        let result_bit: boolean;
        switch (operation) {
            case 'AND':
                result_bit = AND(A.boolean_array[i], B.boolean_array[i]);
                break;
            case 'OR':
                result_bit = OR(A.boolean_array[i], B.boolean_array[i]);
                break;
            case 'XOR':
                result_bit = XOR(A.boolean_array[i], B.boolean_array[i]);
                break;
            case 'NOR':
                result_bit = NOR(A.boolean_array[i], B.boolean_array[i]);
                break
            case 'XNOR':
                result_bit = XNOR(A.boolean_array[i], B.boolean_array[i]);
                break;
            default:
                throw new Error("Invalid operation");
        }
        RESULT_array.push(result_bit);
    }
    return Numeric.fromBooleanArray(RESULT_array);
}


export function ADDER_N_BIT(A: Numeric, B: Numeric, CIN: boolean = false): { SUM: Numeric; COUT: boolean } {
    if (A.bit_size !== B.bit_size) {
        throw new Error("Bit sizes of A and B must be the same");
    }
    const bit_size = A.bit_size;
    const SUM_array: boolean[] = [];
    let CARRY = CIN;
    for (let i = 0; i < bit_size; i++) {
        const A_bit = A.boolean_array[i];
        const B_bit = B.boolean_array[i];
        const fullAdderResult = FULL_ADDER(CARRY, A_bit, B_bit);
        SUM_array.push(fullAdderResult.SUM);
        CARRY = fullAdderResult.COUT;
    }
    const SUM = Numeric.fromBooleanArray(SUM_array);
    return { SUM, COUT: CARRY };
}


export function MUX_2_TO_1(A: boolean, B: boolean, SELECT: boolean): boolean {
    return OR(AND(SELECT, B), AND(NOT(SELECT), A));
}
export function MUX_4_TO_1(A: boolean, B: boolean, C: boolean, D: boolean, SELECT_0: boolean, SELECT_1: boolean): boolean {
    const firstPair = MUX_2_TO_1(A, B, SELECT_0);
    const secondPair = MUX_2_TO_1(C, D, SELECT_0);
    return MUX_2_TO_1(firstPair, secondPair, SELECT_1);
}

export function MUX_4_TO_1_NUMERIC(A: Numeric, B: Numeric, C: Numeric, D: Numeric, SELECT_0: boolean, SELECT_1: boolean): Numeric {
    if (A.bit_size !== B.bit_size || A.bit_size !== C.bit_size || A.bit_size !== D.bit_size) {
        throw new Error("All inputs must have the same bit size");
    }
    const bit_size = A.bit_size;
    const RESULT_array: boolean[] = [];
    for (let i = 0; i < bit_size; i++) {
        const mux_result = MUX_4_TO_1(A.boolean_array[i], B.boolean_array[i], C.boolean_array[i], D.boolean_array[i], SELECT_0, SELECT_1);
        RESULT_array.push(mux_result);
    }
    return Numeric.fromBooleanArray(RESULT_array);
}



