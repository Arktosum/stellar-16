

export const counter = {
    AND: 0,
    NOT: 0,
    NAND: 0,
    OR: 0,
    NOR: 0,
    XOR: 0,
    XNOR: 0
}
export function AND(a: boolean, b: boolean): boolean {
    counter.AND++;
    return a && b;
}

export function NOT(a: boolean): boolean {
    counter.NOT++;
    return !a;
}

export function NAND(a: boolean, b: boolean): boolean {
    counter.NAND++;
    return NOT(AND(a, b));
}

export function OR(a: boolean, b: boolean): boolean {
    counter.OR++;
    return NAND(NOT(a), NOT(b));
}

export function NOR(a: boolean, b: boolean): boolean {
    counter.NOR++;
    return NOT(OR(a, b));
}

export function XOR(a: boolean, b: boolean): boolean {
    counter.XOR++;
    return OR(AND(a, NOT(b)), AND(NOT(a), b));
}
export function XNOR(a: boolean, b: boolean): boolean {
    counter.XNOR++;
    return NOT(XOR(a, b));
}

