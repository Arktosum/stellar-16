import { ALU, FULL_ADDER, HALF_ADDER, MUX_2x1, MUX_8x1 } from "../digital-logic/combinational";
import { booleanArrayToDecimal, decimalToBooleanArray, split_array } from "../digital-logic/utils";

describe('Composite Components Tests', () => {
    test('HALF_ADDER', () => {
        expect(HALF_ADDER(true, true)).toEqual({ sum: false, carry: true });
        expect(HALF_ADDER(true, false)).toEqual({ sum: true, carry: false });
        expect(HALF_ADDER(false, true)).toEqual({ sum: true, carry: false });
        expect(HALF_ADDER(false, false)).toEqual({ sum: false, carry: false });
    });
    test('FULL_ADDER', () => {
        expect(FULL_ADDER(false, false, false)).toEqual({ sum: false, carry: false });
        expect(FULL_ADDER(false, false, true)).toEqual({ sum: true, carry: false });
        expect(FULL_ADDER(false, true, false)).toEqual({ sum: true, carry: false });
        expect(FULL_ADDER(false, true, true)).toEqual({ sum: false, carry: true });

        expect(FULL_ADDER(true, false, false)).toEqual({ sum: true, carry: false });
        expect(FULL_ADDER(true, false, true)).toEqual({ sum: false, carry: true });
        expect(FULL_ADDER(true, true, false)).toEqual({ sum: false, carry: true });
        expect(FULL_ADDER(true, true, true)).toEqual({ sum: true, carry: true });

    })
    test("MUX_2x1", () => {
        for (let i = 0; i < 2 ** 3; i++) {
            const bits = decimalToBooleanArray(i, 3);
            expect(MUX_2x1(bits[1], bits[0], bits[2])).toEqual(bits[2] ? bits[1] : bits[0]);
        }
    })
    test("MUX_8x1", () => {
        for (let i = 0; i < 2 ** 11; i++) {
            const bits = decimalToBooleanArray(i, 11);
            const [selects, inputs] = split_array(bits, 3);

            const select_index = booleanArrayToDecimal(selects);

            expect(MUX_8x1(inputs, selects)).toEqual(inputs[select_index]);
        }
    })

});


describe('ALU', () => {
    const width = 4; // Test with a 4-bit ALU

    test('NOT operation (000 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const control = [false, false, false]; // 000: Selects NOT A operation
        const expectedOutput = [false, true, false, true]; // 0101 (NOT A)

        const result = ALU(inputA, inputA, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('AND operation (001 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const inputB = [false, true, true, false]; // 0110
        const control = [false, false, true]; // 001: Selects AND operation
        const expectedOutput = [false, false, true, false]; // 0010 (AND)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('OR operation (010 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const inputB = [false, true, true, false]; // 0110
        const control = [false, true, false]; // 010: Selects OR operation
        const expectedOutput = [true, true, true, false]; // 1110 (OR)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('XOR operation (011 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const inputB = [false, true, true, false]; // 0110
        const control = [false, true, true]; // 011: Selects XOR operation
        const expectedOutput = [true, true, false, false]; // 1100 (XOR)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('NAND operation (100 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const inputB = [false, true, true, false]; // 0110
        const control = [true, false, false]; // 100: Selects NAND operation
        const expectedOutput = [true, true, false, true]; // 1101 (NAND)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('NOR operation (101 control)', () => {
        const inputA = [true, false, true, false];  // 1010
        const inputB = [false, true, true, false]; // 0110
        const control = [true, false, true]; // 101: Selects NOR operation
        const expectedOutput = [false, false, false, true]; // 0001 (NOR)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('Addition (110 control)', () => {
        const inputA = decimalToBooleanArray(5, 4)
        const inputB = decimalToBooleanArray(4, 4)
        const control = [true, true, false]; // 110: Selects ADD operation
        const expectedOutput = decimalToBooleanArray(9, 4)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    test('Subtraction (111 control)', () => {
        const inputA = decimalToBooleanArray(5, 4)
        const inputB = decimalToBooleanArray(4, 4)
        const control = [true, true, true];  // 111: Selects SUB operation
        const expectedOutput = decimalToBooleanArray(1, 4) // 0101 (A - B)

        const result = ALU(inputA, inputB, control, width);
        expect(result).toEqual(expectedOutput);
    });

    // Test with 8-bit inputs
    test('8-bit AND operation (001 control)', () => {
        const inputA = [true, false, true, false, true, false, true, false];  // 10101010
        const inputB = [false, true, false, true, false, true, false, true]; // 01010101
        const control = [false, false, true]; // 001: Selects AND operation
        const expectedOutput = [false, false, false, false, false, false, false, false]; // 00000000 (AND)

        const result = ALU(inputA, inputB, control, 8);
        expect(result).toEqual(expectedOutput);
    });
});
