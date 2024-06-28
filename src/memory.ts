import { AND, AND3, NOR, NOT } from "./gates";


export class Latch{
    Q: boolean;
    Q_: boolean;
    constructor(){
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(R : boolean , S : boolean){
        this.Q = NOR(R,this.Q_);
        this.Q_ = NOR(S,this.Q);
    }
    RSNORENABLE(R: boolean , E : boolean , S: boolean){
        this.RSNOR(AND(R,E),AND(S,E))
    }
    DATA(D : boolean , E : boolean){
        this.RSNORENABLE(NOT(D),E,D);
    }
}

export class FlipFlop{
    Q: boolean;
    Q_: boolean;
    master: Latch;
    slave: Latch;
    constructor(){
        this.Q = false;
        this.Q_ = true;

        this.master = new Latch();
        this.slave = new Latch();

        // Initialize Latches

        this.master.RSNOR(false,true);
        this.master.RSNOR(false,true);

        this.slave.RSNOR(true,false);
        this.slave.RSNOR(true,false);
    }
    MSDATA(D : boolean , CLOCK : boolean){

        this.master.DATA(D,CLOCK);
        this.slave.DATA(this.master.Q,NOT(CLOCK));
        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;

    }
    MSJK(J : boolean,CLOCK : boolean, K : boolean){
        const masterR = AND3(J,CLOCK,this.Q_);
        const masterS = AND3(K,CLOCK,this.Q);

        this.master.RSNOR(masterR,masterS);

        const slaveR = AND(this.master.Q,NOT(CLOCK));
        const slaveS = AND(this.master.Q_,NOT(CLOCK));

        this.slave.RSNOR(slaveR,slaveS);

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;

    }
    TOGGLE(T : boolean, CLOCK :boolean){
        this.MSJK(T,CLOCK,T);
    }
}

export class Counter{
    flipflops: FlipFlop[];
    bitLength: number;
    constructor(bitLength :number){
        this.flipflops = [];
        this.bitLength = bitLength;
        for(let i = 0; i < this.bitLength; i++){
            this.flipflops.push(new FlipFlop());
        }
        // Initialize counter
        this.ASYNC(true,false);
        this.ASYNC(true,true);
    }
    output() : boolean[]{
        let result = [];
        for(let ff of this.flipflops){
            result.push(ff.Q);
        }
        return result.reverse();
    }
    ASYNC(T : boolean, CLOCK : boolean){
        let clock = CLOCK;
        for(let ff of this.flipflops){
            ff.TOGGLE(T,clock);
            clock = ff.Q;
        }
    }
}


export class Register{
    bitLength: number;
    data: FlipFlop[];
    constructor(bitLength : number){
        this.bitLength = bitLength;
        this.data = [];
        for(let i = 0; i < this.bitLength; i++){
            this.data.push(new FlipFlop());
        }

    }
    use(DATA : boolean[] , CLOCK : boolean, STORE : boolean, OUTPUT : boolean){
        if(DATA.length != this.bitLength) throw new Error("Data length mismatch!");
        
        for(let i = 0 ; i < this.data.length; i++){
            this.data[i].MSDATA(DATA[i],CLOCK);
        }
    }
}