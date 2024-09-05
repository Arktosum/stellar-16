import { MUX2_1 } from "./combinational";
import { JKFlipFlop } from "./flipflop";
import { AND, XOR, NOT } from "./gates";
import Numeric, { boolean_to_hex } from "./number";

export class Counter {
    flipflops: JKFlipFlop[];
    size: number;
    description: string;
    COUNT_ENABLE: boolean;
    OUTPUT_ENABLE: boolean;
    WRITE_ENABLE: boolean;
    positive_trigger: boolean;
    constructor(bitLength: number, description: string, positive_trigger: boolean) {

        // PROBLEM : LOADING circuitry takes two clock cycles to settle.
        // TO REPRODUCE ERROR : 
        // - 1st Clock cycle - PC++; 0000 -> 0001
        // - 2nd Clock cycle - Load 0000 to PC , should turn 0000 but get 0010 or something like that
        // - 3rd clock cylce - load 0000 to PC , now it settles to 0000
        
        this.flipflops = [];
        this.size = bitLength;
        this.description = description;
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new JKFlipFlop(positive_trigger));
        }
        this.COUNT_ENABLE = false;
        this.OUTPUT_ENABLE = false;
        this.WRITE_ENABLE = false;
        this.positive_trigger = positive_trigger
    }
    read() {
        const result = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            const data = this.flipflops[i].Q;
            result.push(data);
        }
        return result;
    }
    SYNC(CLOCK: boolean, DATA: boolean[], reverse: boolean) {
        console.log(`PRE-WRITE-CHECK`, boolean_to_hex(this.read()))
        let prev = true; // Always TRUE
        for (let i = this.size - 1; i >= 0; i--) {
            const ff = this.flipflops[i];
            CLOCK = AND(CLOCK, XOR(this.COUNT_ENABLE, this.WRITE_ENABLE));
            const J_MUX = MUX2_1(DATA[i], prev, this.WRITE_ENABLE);
            const K_MUX = MUX2_1(NOT(DATA[i]), prev, this.WRITE_ENABLE);
            ff.MSJKFF(J_MUX, CLOCK, K_MUX);
            prev = AND(prev, MUX2_1(ff.Q_, ff.Q, reverse));
        }
        if (this.COUNT_ENABLE) {
            console.log(`${this.description}++`);
            console.log(`POST-INCREMENT-CHECK`, boolean_to_hex(this.read()))
        }
        if (this.WRITE_ENABLE) {
            console.log(`${this.description} <- ${Numeric.fromBinary(DATA).toHex(4)}`)
            console.log(`POST-WRITE-CHECK`, boolean_to_hex(this.read()))
        }

    }
}