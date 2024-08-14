import { DECODERM_2N } from "./combinational";
import { AND } from "./gates";
import { Register } from "./sequential";

export class MEMORY {
    flipflops: Register[];
    READ_ENABLE: boolean;
    WRITE_ENABLE: boolean;
    output: boolean[];
    constructor(addressLength: number) {
        // Assuming the MEMORY UNIT IS ALWAYS 16 bit. we can always generalize it later.
        this.flipflops = [];
        for (let i = 0; i < 2 ** addressLength; i++) {
            this.flipflops.push(new Register(16, ""));
        }
        this.READ_ENABLE = false;
        this.WRITE_ENABLE = false;
        this.output = [];
        for (let i = 0; i < 16; i++) {
            this.output.push(false);
        }
    }
    run(CLOCK: boolean, ADDRESS: boolean[], DATA: boolean[]) {
        const high_address = DECODERM_2N(ADDRESS.slice(0, 8));
        const low_address = DECODERM_2N(ADDRESS.slice(8, 16));
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const located = AND(high_address[i], low_address[j]);
                const location = 256 * i + j;
                this.flipflops[location].WRITE_ENABLE = AND(this.WRITE_ENABLE, located);
                this.flipflops[location].run(CLOCK, DATA);
                this.flipflops[location].READ_ENABLE = AND(this.READ_ENABLE, located);
                this.output = this.flipflops[location].read();
            }
        }
    }
}