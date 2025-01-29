export function decimalToBooleanArray(decimal: number, padding: number): boolean[] {
    // Convert the decimal number to a binary string
    let binaryString = decimal.toString(2);

    // Calculate the number of leading zeros needed
    const leadingZeros = padding - binaryString.length;

    // Pad the binary string with leading zeros
    binaryString = '0'.repeat(leadingZeros > 0 ? leadingZeros : 0) + binaryString;

    // Convert the binary string to a boolean array
    return binaryString.split('').map(bit => bit === '1');
}

export function booleanArrayToDecimal(booleanArray: boolean[]): number {
    // Convert the boolean array to a binary string
    const binaryString = booleanArray.map(bit => (bit ? '1' : '0')).join('');

    // Convert the binary string to a decimal number
    return parseInt(binaryString, 2);
}

export function split_array<T>(array: T[], index: number): [T[], T[]] {
    const firstHalf = array.slice(0, index);
    const secondHalf = array.slice(index);
    return [firstHalf, secondHalf]
}