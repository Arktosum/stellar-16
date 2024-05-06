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