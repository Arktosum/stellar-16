export class Bus {
    data: boolean[];
    constructor(bitLength: number) {
        this.data = [];
        for (let i = 0; i < bitLength; i++) {
            this.data.push(false);
        }
    }
    read() {
        return this.data;
    }
    write(OUTPUT_ENABLE: boolean, input: boolean[]) {
        /*
            This is basically a Tri-state buffer.
        */
        // TODO: Implement using MUX
        // This is here because it is too hard to implement TRI-STATE LOGIC at the moment.
        if (OUTPUT_ENABLE) {
            this.data = input
        }
    }
}
