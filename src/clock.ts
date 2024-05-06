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
    pulse(callback: (() => void)){
        callback();
    }
    startClock(callback: (() => void)){
        setInterval(()=>{
            this.clock = false;
            for(let i = 0; i < this.PULSE_WIDTH ; i++){
                this.pulse(callback);
            }
            this.clock = true;
            for(let i = 0; i < this.PULSE_WIDTH ; i++){
                this.pulse(callback);
            }
        },1000 * (1/this.frequency))
    }
}