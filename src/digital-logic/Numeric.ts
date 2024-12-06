

export class Numeric {
    value: number;
    constructor(value: number) {
        this.value = value;
    }
    toBooleanArray(bitLength: number) {
        let binaryValue = this.value.toString(2);
        const diff = bitLength - binaryValue.length;
        if (diff > 0) {
            binaryValue = '0'.repeat(diff) + binaryValue;
        }
        const boolArray = [];
        for (let i = 0; i < bitLength; i++) {
            boolArray.push(binaryValue[i] == '1');
        }
        return boolArray;
    }
    static fromBooleanArray(data: boolean[]) {
        let binaryString = "";
        for (let i = 0; i < data.length; i++) {
            binaryString += data[i] ? '1' : '0';
        };
        let value = parseInt(binaryString, 2);
        return new Numeric(value);
    }
}


export function bool_to_dec(array: boolean[]) {
    return Numeric.fromBooleanArray(array).value
}
export function dec_to_bool(dec: number, bitLength: number) {
    return new Numeric(dec).toBooleanArray(bitLength);
}
