export function AND(A: boolean, B: boolean) { return A && B; }
export function NOT(A: boolean) { return !A }
export function NAND(A: boolean, B: boolean) { return NOT(AND(A, B)); }
export function OR(A: boolean, B: boolean) { return NAND(NOT(A), NOT(B)) };
export function NOR(A: boolean, B: boolean) { return NOT(OR(A, B)) };
export function XOR(A: boolean, B: boolean) { return AND(OR(A, B), OR(NOT(A), NOT(B))) }
export function XNOR(A: boolean, B: boolean) { return NOT(XOR(A, B)) };
export function AND3(A: boolean, B: boolean, C: boolean) { return AND(A, AND(B, C)) };
export function AND4(A: boolean, B: boolean, C: boolean) { return AND(A, AND(B, C)) };