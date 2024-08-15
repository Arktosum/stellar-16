export class Clock {
    ON_TIME: number;
    FREQUENCY: number;
    constructor(FREQUENCY: number = 1, ON_TIME: number = 2) {
        this.ON_TIME = ON_TIME;
        this.FREQUENCY = FREQUENCY; // Hz
    }
    step(pulse: { (clock: boolean): void; (arg0: boolean): void; (clock: boolean, phase: string): void; (arg0: boolean, arg1: string): void; }, waveStart: { (): void; (): void; (): void; (): void; }, waveEnd: { (): void; (): void; (): void; (): void; }) {
        waveStart();
        for (let i = 0; i < this.ON_TIME; i++) {
            pulse(false, "LOW LEVEL");
        }
        for (let i = 0; i < this.ON_TIME; i++) {
            pulse(true, "RISING EDGE");
        }
        for (let i = 0; i < this.ON_TIME; i++) {
            pulse(true, "HIGH LEVEL");
        }
        for (let i = 0; i < this.ON_TIME; i++) {
            pulse(false, "FALLING EDGE");
        }
        waveEnd();
    }
    start(pulse: { (clock: boolean): void; (arg0: boolean): void; (clock: boolean, phase: string): void; (arg0: boolean, arg1: string): void; }, waveStart: { (): void; (): void; (): void; (): void; }, waveEnd: { (): void; (): void; (): void; (): void; }) {
        setInterval(() => {
            this.step(pulse, waveStart, waveEnd);
        }, 1000 / this.FREQUENCY);
    }
}