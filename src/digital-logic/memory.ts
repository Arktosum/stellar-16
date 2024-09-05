import { DECODERM_2N } from "./combinational";
import { Register, RegisterBuffer } from "./flipflop";
import { AND } from "./gates";
import Numeric from "./number";

export class RAM {
    units: Register[];
    MEMORY_ADDRESS_REGISTER: Register;
    MEMORY_OUT_BUFFER: RegisterBuffer;
    MEMORY_DATA_BUFFER: RegisterBuffer;
    MEM_STORE: boolean = false;
    constructor(addressLength: number) {
        // Assuming the MEMORY UNIT IS ALWAYS 16 bit. we can always generalize it later.
        this.units = [];
        for (let i = 0; i < 2 ** addressLength; i++) {
            this.units.push(new Register(16, `MU - (${i})`, true));
        }
        this.MEMORY_ADDRESS_REGISTER = new Register(16, "MAR", true);
        this.MEMORY_OUT_BUFFER = new RegisterBuffer(16, "RAM OUT");
        this.MEMORY_DATA_BUFFER = new RegisterBuffer(16, "RAM IN");

    }
    reset_control() {
        this.MEMORY_ADDRESS_REGISTER.reset_control();
        this.MEM_STORE = false;
        // No need to reset Buffers
    }
    writeLocation(location: number, data: number) {
        // only used by User
        this.units[location].WRITE_ENABLE = true;
        this.units[location].write(false, new Numeric(data).toBinary(16));
        this.units[location].write(true, new Numeric(data).toBinary(16));
        this.units[location].WRITE_ENABLE = false;
    }
    readLocation(location: number) {
        // ONLY FOR USER -> Returns the next 256 words from Location
        const data: string[][] = [];
        for (let i = 0; i < 16; i++) {
            const row: string[] = [];
            for (let j = 0; j < 16; j++) {
                const word = this.units[location + 16 * i + j];
                row.push(Numeric.fromBinary(word.read()).toHex(4));
            }
            data.push(row);
        }
        return data;
    }
    run(clock: boolean) {
        const ADDRESS = this.MEMORY_ADDRESS_REGISTER.read();
        const DATA_IN = this.MEMORY_DATA_BUFFER.read();
        const high_address = DECODERM_2N(ADDRESS.slice(0, 8));
        const low_address = DECODERM_2N(ADDRESS.slice(8, 16));

        if (this.MEM_STORE) {
            console.log(`RAM M[${Numeric.fromBinary(ADDRESS).toHex(4)}] <- ${Numeric.fromBinary(DATA_IN).toHex(4)}`)
        }
        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {

                const location = 256 * i + j;
                const LOCATED = AND(high_address[i], low_address[j]);

                const mem_unit = this.units[location]
                if (!LOCATED) continue; // This is technically cheating but kind of optimizing.
                // MDR_OUT = MEM_LOAD_ENABLE 
                // MEM_STORE AND CLOCK = MEM[MAR] <- MDR
                mem_unit.WRITE_ENABLE = this.MEM_STORE;
                mem_unit.write(clock, DATA_IN);
                mem_unit.WRITE_ENABLE = false;
                const stored_data = mem_unit.read();
                this.MEMORY_OUT_BUFFER.WRITE_ENABLE = true; // Always be able to write.
                this.MEMORY_OUT_BUFFER.write(stored_data);
                if (LOCATED) return; // This is technically cheating but kind of optimizing.
            }
        }
    }
}