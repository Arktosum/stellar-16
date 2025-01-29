import { FlipFlop, Latch, ProgramCounter, Register } from "../digital-logic/sequential";
import { decimalToBooleanArray } from "../digital-logic/utils";

describe('Latch Tests', () => {
    test('RS Latch: Default', () => {
        const latch = new Latch();
        expect(latch.Q).toEqual(false);
        expect(latch.Q_).toEqual(true);
    });

    test('RS Latch: Set', () => {
        const latch = new Latch();
        latch.D(true, true);
        expect(latch.Q).toEqual(true);
        expect(latch.Q_).toEqual(false);
    });

    test('RS Latch: Set then reset', () => {
        const latch = new Latch();
        latch.D(true, true);
        latch.D(false, true);
        expect(latch.Q).toEqual(false);
        expect(latch.Q_).toEqual(true);
    });
    test("Random Brute testing (1000): ", () => {
        const latch = new Latch();
        let actualQ = false;
        for (let i = 0; i < 1000; i++) {
            const mode = Math.floor(Math.random() * 10000) % 3;
            if (mode == 0) {
                // Check state
                expect(latch.Q).toEqual(actualQ);
                expect(latch.Q_).toEqual(!actualQ);
            }
            else if (mode == 1) {
                // set state
                latch.D(true, true);
                actualQ = true;
                expect(latch.Q).toEqual(actualQ);
                expect(latch.Q_).toEqual(!actualQ);
            }
            else if (mode == 2) {
                // reset state
                latch.D(false, true);
                actualQ = false;
                expect(latch.Q).toEqual(actualQ);
                expect(latch.Q_).toEqual(!actualQ);
            }
        }

    })
});

describe('Master-Slave D Flip-Flop', () => {
    test('Must only update on rising edge', () => {
        const ff = new FlipFlop(true);
        ff.MSDFF(true, false)// LOW SET
        ff.MSDFF(true, true)// trigger SET
        expect(ff.Q).toEqual(true);
        //
    });
});

describe("Register Tests", () => {
    let reg: Register;

    beforeEach(() => {
        reg = new Register(8); // Create an 8-bit register for testing
    });

    test("Initial state is all false", () => {
        expect(reg.read()).toEqual(Array(8).fill(false));
    });

    test('Able to write random data', () => {
        for (let i = 0; i < 1000; i++) {
            const randomInteger = Math.floor(Math.random() * 255);
            reg.WRITE_ENABLE = true;
            reg.run(decimalToBooleanArray(randomInteger, 8), false);
            reg.run(decimalToBooleanArray(randomInteger, 8), true);
            expect(reg.read()).toEqual(decimalToBooleanArray(randomInteger, 8));
            reg.WRITE_ENABLE = false;
        }
    })
    test('Should not write data if write enable is false', () => {
        reg.WRITE_ENABLE = false;
        const original_data = reg.read();
        for (let i = 0; i < 1000; i++) {
            const randomInteger = Math.floor(Math.random() * 255);
            reg.run(decimalToBooleanArray(randomInteger, 8), false);
            reg.run(decimalToBooleanArray(randomInteger, 8), true);
            expect(reg.read()).toEqual(original_data);
        }
    })
});


test('Program Counter should increment', () => {
    const pc = new ProgramCounter(16);  // 4-bit PC for simplicity
    pc.INCREMENT = true;  // Enable increment

    for (let i = 0; i < 65536; i++) {
        const value = decimalToBooleanArray(i, 16);
        expect(pc.read()).toEqual(value);
        pc.run(decimalToBooleanArray(0,16), false);
        pc.run(decimalToBooleanArray(0,16), true);
    }
});
