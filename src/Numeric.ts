

export default class Numeric {
    decimal_value: number;
    hex_value: string;
    boolean_array: boolean[];
    bit_size: number;
    binary_string: string;
    constructor(decimal_value: number = 0, bit_size = 16) {
        this.decimal_value = decimal_value;
        this.bit_size = bit_size;
        this.hex_value = decimal_value.toString(this.bit_size).toUpperCase();
        this.boolean_array = [];
        let temp = decimal_value;
        for (let i = 0; i < this.bit_size; i++) {
            this.boolean_array.push((temp & 1) === 1);
            temp = temp >> 1;
        }

        // MSB -> LSB
        this.binary_string = this.boolean_array.map((b: boolean) => b ? '1' : '0').reverse().join('');
    }
    static fromDecimal(decimal_value: number): Numeric {
        return new Numeric(decimal_value);
    }
    static fromHex(hex_value: string): Numeric {
        const decimal_value = parseInt(hex_value, 16);
        return new Numeric(decimal_value);
    }

    static fromBooleanArray(boolean_array: boolean[]): Numeric {
        // LSB -> MSB
        let decimal_value = 0;
        for (let i = 0; i < boolean_array.length; i++) {
            if (boolean_array[i]) {
                decimal_value += (1 << i);
            }
        }
        return new Numeric(decimal_value);
    }
}