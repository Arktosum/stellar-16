import { AND, AND3, NAND, NOT, OR, XOR } from "./gates";

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

function SOP(products : boolean[]) : boolean{
    let ans = false;
    for(let product of products){
        ans = OR(ans,product);
    }
    return ans;
}

    // WORK IN PROGRESS
export function HEX_DISPLAY(booleanArray : boolean[]) : boolean[]{
    if(booleanArray.length != 4){
        throw Error("Invalid input size in hex display!");
    }

    let [A,B,C,D] = booleanArray
    let [NA,NB,NC,ND] = booleanArray.map((item)=> NOT(item)) 
    let products_a = [AND(NB,ND),AND(NA,C),AND(B,C),AND(A,ND),AND3(NA,B,D),AND3(A,NB,NC)]
    let products_b = [AND(NA,NB),AND(NB,ND),AND3(NA,NC,ND),AND3(NA,C,D),AND3(A,NC,D)]
    let products_c = [AND(NA,NC),AND(NA,D),AND(NC,D),AND(NA,B),AND(A,NB)]
    let products_d = [AND(A,NC),AND3(NA,NB,ND),AND3(NB,C,D),AND3(B,NC,D),AND3(B,C,ND)]
    let products_e = [AND(NB,ND),AND(C,ND),AND(A,C),AND(A,B)]
    let products_f = [AND(NC,ND),AND(B,ND),AND(A,NB),AND(A,C),AND3(NA,B,NC)]
    let products_g = [AND(NB,C),AND(C,ND),AND(A,NB),AND(A,D),AND3(NA,B,NC)]

    const a  = SOP(products_a);
    const b  = SOP(products_b);
    const c  = SOP(products_c);
    const d  = SOP(products_d);
    const e  = SOP(products_e);
    const f  = SOP(products_f);
    const g  = SOP(products_g);

    // a , b, c, d, e , f, g
    return [a,b,c,d,e,f,g];    
}




// 0011111011110111