export class Clock{
    /*
    This clock runs at most 250Hz
    */        
    clock: boolean;
    PULSE_WIDTH: number;
    frequency: number;
    constructor(frequency : number){
        this.frequency = frequency
        this.clock = false;
        this.PULSE_WIDTH = 2;
    }
    startClock(pulse: (() => void) , pulseStart : ()=>void){
        setInterval(()=>{
            pulseStart();
            this.clock = false;
            for(let i = 0; i < this.PULSE_WIDTH ; i++){
                pulse();
            }
            this.clock = true;
            for(let i = 0; i < this.PULSE_WIDTH ; i++){
                pulse();
            }
        },1000 * (1/this.frequency))
    }
}