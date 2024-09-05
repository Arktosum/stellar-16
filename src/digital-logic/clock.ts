type PulseFunction = (clock: boolean, phase: string) => void;
type WaveControlFunction = () => void;

export class Clock {
    FREQUENCY: number;
    clock: boolean;
    constructor(FREQUENCY: number = 1) {
        this.FREQUENCY = FREQUENCY; // Hz
        this.clock = false;
    }
    man_pulse(pulse: PulseFunction) {
        pulse(this.clock, `MAN PULSE - CLOCK:${this.clock}`);
    }
    step(pulse: PulseFunction, waveStart: WaveControlFunction, waveEnd: WaveControlFunction): void {
        waveStart();
        pulse(false, 'LOW LEVEL');
        pulse(true, 'RISING EDGE');
        pulse(true, 'HIGH LEVEL');
        pulse(false, 'FALLING EDGE');
        waveEnd();
    }

    start(pulse: PulseFunction, waveStart: WaveControlFunction, waveEnd: WaveControlFunction): void {
        setInterval(() => {
            this.step(pulse, waveStart, waveEnd);
        }, 1000 / this.FREQUENCY);
    }
}
