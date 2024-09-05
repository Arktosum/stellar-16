import { DECODERM_2N } from "./combinational";
import { RegisterBuffer } from "./flipflop";
import { AND } from "./gates";
import Numeric from "./number";

export class ROM {
    units: RegisterBuffer[];
    addressLength: number;
    dataLength: number;
    constructor(addressLength: number, dataLength: number) {
        this.addressLength = addressLength;
        this.dataLength = dataLength;
        this.units = [];
        for (let i = 0; i < 2 ** addressLength; i++) {
            this.units.push(new RegisterBuffer(dataLength, `MU - (${i})`));
        }
    }
    writeLocation(location: number, data: number) {
        this.units[location].WRITE_ENABLE = true;
        this.units[location].write(new Numeric(data).toBinary(this.dataLength));
    }
    run(ADDRESS: boolean[]) {
        const half_address_length = Math.floor(this.addressLength / 2);
        const high_address = DECODERM_2N(ADDRESS.slice(0, half_address_length));
        const low_address = DECODERM_2N(ADDRESS.slice(half_address_length, 2 * half_address_length));
        let data = new Numeric(0).toBinary(this.dataLength);
        for (let i = 0; i < 2 ** half_address_length; i++) {
            for (let j = 0; j < 2 ** half_address_length; j++) {
                const location = (2 ** half_address_length) * i + j;
                const LOCATED = AND(high_address[i], low_address[j]);
                const mem_unit = this.units[location]
                if (!LOCATED) continue; // This is technically cheating but kind of optimizing.
                data = mem_unit.read();
                if (LOCATED) return data; // This is technically cheating but kind of optimizing.
            }
        }
        return data;
    }
}