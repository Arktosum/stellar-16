import { AND, NOT, OR, XOR, NAND, NOR, BUFFER } from "../digital-logic/gates";

describe('Logic Gates Tests', () => {
    test('AND', () => {
        expect(AND(true, true)).toBe(true);
        expect(AND(true, false)).toBe(false);
        expect(AND(false, true)).toBe(false);
        expect(AND(false, false)).toBe(false);
    });

    test('NOT', () => {
        expect(NOT(true)).toBe(false);
        expect(NOT(false)).toBe(true);
    });

    test('OR', () => {
        expect(OR(true, true)).toBe(true);
        expect(OR(true, false)).toBe(true);
        expect(OR(false, true)).toBe(true);
        expect(OR(false, false)).toBe(false);
    });

    test('XOR', () => {
        expect(XOR(true, true)).toBe(false);
        expect(XOR(true, false)).toBe(true);
        expect(XOR(false, true)).toBe(true);
        expect(XOR(false, false)).toBe(false);
    });

    test('NAND', () => {
        expect(NAND(true, true)).toBe(false);
        expect(NAND(true, false)).toBe(true);
        expect(NAND(false, true)).toBe(true);
        expect(NAND(false, false)).toBe(true);
    });

    test('NOR', () => {
        expect(NOR(true, true)).toBe(false);
        expect(NOR(true, false)).toBe(false);
        expect(NOR(false, true)).toBe(false);
        expect(NOR(false, false)).toBe(true);
    });

    test('BUFFER', () => {
        expect(BUFFER(true)).toBe(true);
        expect(BUFFER(false)).toBe(false);
    });
});
