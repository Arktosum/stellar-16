function AND(A : boolean , B : boolean) : boolean{
    return A && B;
}
function NOT(A:boolean) : boolean {
    return !A;
}
function NAND(A : boolean , B : boolean) : boolean{
    return NOT(AND(A,B))
}
function OR(A : boolean , B : boolean) : boolean{
    return NAND(NOT(A),NOT(B))
}

function NOR(A : boolean , B : boolean) : boolean{
    return NOT(OR(A,B))
}

function XOR(A : boolean , B : boolean) : boolean{
    return AND(OR(A,B),OR(NOT(A),NOT(B)))
}

function XNOR(A : boolean , B : boolean) : boolean{
    return NOT(XOR(A,B))
}

function AND3(A : boolean , B : boolean , C : boolean) : boolean{
    return AND(AND(A,B),C)
}   

function HALF_ADDER(A : boolean , B : boolean) : boolean[]{
    const sum = XOR(A,B)
    const carry = AND(A,B)
    return [sum,carry]
}

function MUX2_1(A : boolean , B : boolean,S0 : boolean) : boolean {
    /*
    Y is A if S0 is ON else B
    */
    return OR(AND(A,S0),AND(B,!S0))
}

function FULL_ADDER(A : boolean , B : boolean,CarryIn : boolean) : boolean[]{
    const [HALF_SUM,HALF_CARRY] = HALF_ADDER(A,B)
    const [FULL_SUM,FULL_CARRY] = HALF_ADDER(HALF_SUM,CarryIn)
    return [FULL_SUM,OR(HALF_CARRY,FULL_CARRY)]
}

export function ArithmeticUnit(arrayA : boolean[], arrayB : boolean[],SUBTRACT : boolean) {
    if(arrayA.length != arrayB.length){
        throw new Error("Invalid addition!");
    }
    let n = arrayA.length;

    let carryIn = SUBTRACT;
    let zero = false;
    let negative = false;
    let result = [];
    // LSB....MSB so reverse
    for(let i = n-1; i >= 0; i--) {
        let a = arrayA[i]
        let b = arrayB[i]
        let [sum,carry] =  FULL_ADDER(a,b,carryIn);
        carryIn = carry;
        result.push(sum);
        zero = AND(NOT(sum),zero) // check if all bits are zero. then it's zero.
        if(i == 0 && sum) {
            // This is the MSB. if this is set, then it's a negative number.
            negative = true;
        }
    }
    // if final has carry then it's overflowing!
    // reverse it back to MSB...LSB
    result = result.reverse()
    return {
        result,
        zero,
        carry : carryIn,
        negative
    };
}




export class Latch{
    Q: boolean;
    Q_: boolean;
    constructor(){
        this.Q = false;
        this.Q_ = true;
    }
    SR(R : boolean, S : boolean){
        this.Q = NOR(R,this.Q_)
        this.Q_ = NOR(S,this.Q)
    }
    SRE(R : boolean, ENABLE: boolean ,S : boolean){
        this.SR(AND(R,ENABLE),AND(S,ENABLE))
    }
    DLatch(D : boolean , CLOCK: boolean){
        this.SRE(NOT(D),CLOCK,D)
    }
    JKLatch(K:boolean,CLOCK:boolean, J:boolean){
        let r = AND3(K,CLOCK,this.Q);
        let s = AND3(J,CLOCK,this.Q_);
        this.SR(r,s);
    }    
}



export class FlipFlop{
    Q: boolean;
    Q_: boolean;
    master: Latch;
    slave: Latch ;
    INIT_MS_ZERO: boolean;
    constructor(){
        /*
        These circuits require a clock signal, especially an edge triggered clock signal.
        */
        this.Q = false;
        this.Q_ = true;
        this.INIT_MS_ZERO = false;
        this.master = new Latch();
        this.slave = new Latch();
    }

    MSDFF(D: boolean,CLOCK:boolean){
        this.master.DLatch(D,!CLOCK);
        this.slave.DLatch(this.master.Q,CLOCK);
        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
    MSJKFF(J:boolean,CLOCK:boolean, K:boolean){
        let masterR = AND3(J,CLOCK,this.Q_);
        let masterS = AND3(K,CLOCK,this.Q);
        this.master.SR(masterR,masterS);

        let slaveR = AND(this.master.Q,!CLOCK);
        let slaveS = AND(this.master.Q_,!CLOCK);
        this.slave.SR(slaveR,slaveS);
        this.Q = this.slave.Q
        this.Q_ = this.slave.Q_
        if(!this.INIT_MS_ZERO){
            this.INIT_MS_ZERO = true;
            this.MSJKFF(false,false,true);
            this.MSJKFF(false,false,true);
            this.MSJKFF(false,true,true);
            this.MSJKFF(false,true,true);
            this.MSJKFF(false,false,false);
            this.MSJKFF(false,false,false);
            // console.log(msjkff.Q,msjkff.Q_); // false, true
            // console.log(msjkff.master.Q,msjkff.master.Q_); // true , false
            // console.log(msjkff.slave.Q,msjkff.slave.Q_); // false , true
        }
    }
    TFF(T : boolean , CLOCK:boolean){
        this.MSJKFF(T,CLOCK,T)
    }
}


export class Bus{
    value : boolean[];
    constructor(bitLength : number){
        this.value = [];
        for(let i =0 ; i < bitLength ; i++){
            this.value.push(false);
        }
    }
    STORE(boolArray  :boolean[]){
        this.value = boolArray;
    }
    OUTPUT() : boolean[] {
        return this.value;
    }
}


export class Bit{
    flipflop: FlipFlop;
    constructor(){
        this.flipflop = new FlipFlop();
    }
    STORE(D : boolean, CLOCK : boolean,STORE : boolean){
        let IN_D = MUX2_1(D,this.flipflop.Q,STORE);
        this.flipflop.MSDFF(IN_D,CLOCK)
    }
    OUTPUT(OUTPUT_ENABLE : boolean) : boolean{
        // TRI STATE BUFFER
        return AND(this.flipflop.Q,OUTPUT_ENABLE);
    }
}

export class Register{
    bitLength: number;
    bits: Bit[];
    constructor(bitLength : number){
        this.bitLength = bitLength
        this.bits = [];
        for(let i = 0 ; i < bitLength; i++){
            this.bits.push(new Bit());
        }
    }
    STORE(DBoolArray : boolean[],CLOCK : boolean,STORE : boolean){
        if(DBoolArray.length != this.bitLength){
            throw new Error("Invalid Boolean Array length! in Register");
        }
        for(let i =0 ; i < this.bitLength; i++){
            let bit = this.bits[i];
            let d = DBoolArray[i];
            bit.STORE(d,CLOCK,STORE);
        }
    }
    OUTPUT(OUTPUT_ENABLE : boolean) : boolean[]{
        let result = [];
        for(let i =0 ; i < this.bitLength; i++){
            let bit = this.bits[i];
            result.push(bit.OUTPUT(OUTPUT_ENABLE));
        }
        return result;
    }
}
export class Counter{
    bitLength: number;
    counters: FlipFlop[];
    constructor(bitLength : number){
        this.bitLength = bitLength;
        this.counters = [];
        // MSB .... LSB
        for(let i = 0 ; i < this.bitLength ; i++){
            this.counters.push(new FlipFlop());
        }
    }
    ASYNC(CLOCK : boolean,TOGGLE:boolean){
        /*
        Connection is on Q, if you want a down counter, print Q' instead!
        */
        // this.counters is in MSB...LSB order. so reverse
        let prev = CLOCK;
        for(let i = this.counters.length - 1; i >= 0 ; i--){
            let tff = this.counters[i];
            tff.TFF(TOGGLE,prev);
            prev = tff.Q;
        }
    }
    SYNC(CLOCK : boolean,TOGGLE:boolean){
        // this.counters is in MSB...LSB order. so reverse
        let prev = TOGGLE;
        for(let i = this.counters.length - 1; i >= 0 ; i--){
            let tff = this.counters[i];
            tff.TFF(prev,CLOCK);
            prev = AND(tff.Q,prev);
        }
    }
    output(UP=true){
        // MSB .... LSB
        let output = {
            binary : "",
            decimal : 0
        }
        for(let i =0 ; i < this.counters.length ; i++){
            let tff = this.counters[i];
            let val = UP ? tff.Q : tff.Q_
            output.binary += val ? '1' : '0';
            output.decimal += val ? 2**(this.counters.length - i -1) : 0;
        }
        return output;
    }
}






    
