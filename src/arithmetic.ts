import { AND, OR, XOR } from "./gates";


function HALF_ADDER(A : boolean, B: boolean) : [boolean,boolean]{
    const SUM = XOR(A,B);
    const CARRY = AND(A,B);
    return [SUM,CARRY];
}

function FULL_ADDER(A : boolean, B : boolean , C : boolean) : [boolean,boolean]{
    const [HALF_SUM,HALF_CARRY] = HALF_ADDER(A,B);
    const [FINAL_SUM,SECOND_CARRY] = HALF_ADDER(HALF_SUM,C);
    const FINAL_CARRY = OR(HALF_CARRY,SECOND_CARRY);
    return [ FINAL_SUM ,FINAL_CARRY ]
}

export function nADDER(A : boolean[], B : boolean[], C : boolean) : [boolean[],boolean]{
    if(A.length != B.length){
        throw new Error("Invalid input sizes!");
    }
    let SUMS = [];
    let CARRY = C;

    for(let i = A.length-1 ; i >=0 ; i--){
        let [sum,carry] = FULL_ADDER(A[i],B[i],CARRY);
        SUMS.push(sum);
        CARRY = carry;
    }
    SUMS = SUMS.reverse()
    return [SUMS,CARRY];
}