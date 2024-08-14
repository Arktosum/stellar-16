

let AND_COUNT = 0
let NOT_COUNT = 0
let OR_COUNT = 0

export function NOT(A: boolean) {
    NOT_COUNT++;
    return !A;
}
export function AND(A: boolean, B: boolean) {
    AND_COUNT++;
    return A && B;
}

export function OR_N(A: boolean[]): boolean {
    let result = false;
    for (let bool of A) {
        result = OR(result, bool)
    }
    return result;
}
export function AND3(A: boolean, B: boolean, C: boolean) { return AND(AND(A, B), C) }
export function NAND(A: boolean, B: boolean) { return NOT(AND(A, B)) }
export function OR(A: boolean, B: boolean) {
    OR_COUNT++;
    return NAND(NOT(A), NOT(B))
}
export function NOR(A: boolean, B: boolean) { return NOT(OR(A, B)) }
export function XOR(A: boolean, B: boolean) { return AND(OR(A, B), OR(NOT(A), NOT(B))) }
export function XNOR(A: boolean, B: boolean) { return NOT(XOR(A, B)) }

export function getCounts() {
    console.log({ AND_COUNT, NOT_COUNT, OR_COUNT })
}