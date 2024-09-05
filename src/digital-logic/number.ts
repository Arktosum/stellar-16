export default class Numeric {
    decimal: number;
    constructor(decimalNumber: number) {
        this.decimal = decimalNumber;
    }
    toBinary(bitLength: number): boolean[] {
        let binary = this.decimal.toString(2);
        const diffLength = bitLength - binary.length;
        if (diffLength > 0) binary = "0".repeat(diffLength) + binary;

        const result = [];
        for (let i = 0; i < binary.length; i++) {
            result.push(binary[i] == "1")
        }
        return result
    }
    toHex(bitLength: number): string {
        let hex = this.decimal.toString(16);
        const diffLength = bitLength - hex.length;
        if (diffLength > 0) hex = "0".repeat(diffLength) + hex;
        return "0x" + hex;
    }
    static fromBinary(boolArray: boolean[]): Numeric {
        let boolString = "";
        for (let i = 0; i < boolArray.length; i++) {
            boolString += boolArray[i] ? "1" : "0";
        }
        const decimal = parseInt(boolString, 2);
        return new Numeric(decimal);
    }

}

export function boolean_to_hex(data: boolean[]) {
    return Numeric.fromBinary(data).toHex(4);
}
