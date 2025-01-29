export function AND(a: boolean, b: boolean): boolean {
    return a && b;
}

export function NOT(a: boolean): boolean {
    return !a;
}

// Composite Gates
export function OR(a: boolean, b: boolean): boolean {
    return NOT(AND(NOT(a), NOT(b)));
}

export function XOR(a: boolean, b: boolean): boolean {
    return AND(OR(a, b), NOT(AND(a, b)));
}

export function XNOR(a: boolean, b: boolean): boolean {
    return NOT(XOR(a, b))
}
export function NAND(a: boolean, b: boolean): boolean {
    return NOT(AND(a, b));
}

export function NOR(a: boolean, b: boolean): boolean {
    return NOT(OR(a, b));
}

export function BUFFER(a: boolean): boolean {
    return NOT(NOT(a));
}

