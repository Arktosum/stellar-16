export class Numeric{
    decimal: number;
    decimalString: string;
    binaryString: string;
    bitLength: number;
    binaryArray: boolean[];
    constructor(decimal : number,bitLength : number){
        this.decimal = decimal;
        this.bitLength = bitLength;
        this.decimalString = decimal.toString();
        this.binaryString = Numeric.getBinaryString(this.decimal,this.bitLength);
        this.binaryArray = Numeric.getBinaryArray(this.binaryString);
    }
    static getBinaryArray(binaryString : string) : boolean[]{
        let binaryArray = [];
        for(let bit of binaryString){
            binaryArray.push(bit == '1');
        }
        return binaryArray;
    }
    static fromBinaryArray(binaryArray : boolean[]) : Numeric{
        let decimal = 0;

        for(let i = 0; i < binaryArray.length; i++){
            decimal += 2**(binaryArray.length - i - 1) * (binaryArray[i] ? 1 : 0);
        }
        return new Numeric(decimal,binaryArray.length);
    }
    static getBinaryString(decimal : number,bitLength : number) : string {
        let binaryString = decimal.toString(2);
        const diff = Math.abs(bitLength - binaryString.length);
        binaryString= "0".repeat(diff) + binaryString;
        return binaryString;
    }
}