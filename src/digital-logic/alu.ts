import { ARITHMETIC } from "./combinational";
import { Register, RegisterBuffer } from "./flipflop";

export default class ALU {
    A_REGISTER: Register;
    B_REGISTER: Register;
    OUTPUT_BUFFER: RegisterBuffer;
    SUBTRACT_FLAG: boolean;
    NEGATIVE_FLAG: boolean;
    OVERFLOW_FLAG: boolean;
    ZERO_FLAG: boolean;
    constructor() {
        this.A_REGISTER = new Register(16, 'ALU A REG', true);
        this.B_REGISTER = new Register(16, 'ALU B REG', true);
        this.OUTPUT_BUFFER = new RegisterBuffer(16, 'ALU OUT BUF');
        this.SUBTRACT_FLAG = false;
        this.NEGATIVE_FLAG = false;
        this.OVERFLOW_FLAG = false;
        this.ZERO_FLAG = false;
    }
    reset_control() {
        this.A_REGISTER.reset_control();
        this.B_REGISTER.reset_control();
        this.SUBTRACT_FLAG = false;
    }
    run() {
        const A_DATA = this.A_REGISTER.read(); // direct connection. always reading
        const B_DATA = this.B_REGISTER.read(); // direct connection. always reading

        const [data, NEGATIVE_FLAG, OVERFLOW_FLAG, ZERO_FLAG] = ARITHMETIC(A_DATA, B_DATA, this.SUBTRACT_FLAG);

        this.NEGATIVE_FLAG = NEGATIVE_FLAG;
        this.OVERFLOW_FLAG = OVERFLOW_FLAG;
        this.ZERO_FLAG = ZERO_FLAG;
        this.OUTPUT_BUFFER.WRITE_ENABLE = true; // Always be able to write.
        this.OUTPUT_BUFFER.write(data);
    }
}