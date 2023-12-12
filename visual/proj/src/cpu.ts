import { Bus, HLRegister, Memory, ProgramCounter, Register_8 ,ALU} from "./components"

export default class CPU{
    public A: Register_8 
    public B: Register_8 
    public IR: Register_8 
    public HL : HLRegister
    public PC : ProgramCounter
    public addressBus : Bus
    public dataBus : Bus
    public memory : Memory
    public ALU : ALU
    private registers : Register_8[]
  
    public HALT_CPU  : boolean 
    public ins_end : boolean
    public t_step : number
    constructor(){
      this.addressBus = new Bus();
      this.dataBus = new Bus();
  
      this.memory = new Memory(this.dataBus, this.addressBus);
  
      this.A = new Register_8(this.dataBus);
      this.B = new Register_8(this.dataBus);
      this.IR = new Register_8(this.dataBus);
      this.HL = new HLRegister(this.dataBus,this.addressBus)
      this.PC = new ProgramCounter(this.addressBus);
      this.ALU = new ALU(this.dataBus,this.A)
      this.registers = [
        this.A,this.B,this.IR,this.HL.H,this.HL.L
      ];
      this.HALT_CPU = false;
  
      this.t_step = 0;
      this.ins_end = true;
    }
    HALT_CPU_SET(){this.HALT_CPU = true}
    resetControlSignals(){
      for(let register of this.registers){
        register.clearFlags();
      }
      this.ALU.clearFlags();
      this.PC.clearFlags();
      this.memory.clearFlags();
    }
    setControlSignals(){
      // MEMORY - MEMORY_READ ,MEMORY_WRITE (2)
      // REGISTER (A , B, IR ) - READ_DBUS,WRITE_DBUS (2*3 = 6)
      // PC - READ_ABUS, WRITE_ABUS,PC_INCREMENT (3)
      // HL - READ_DBUS,WRITE_DBUS, READ_ABUS, WRITE_ABUS (4&2 = 8)
      // CPU - HALT (1)
      // 20 SIGNALS
  
      enum CONTROL_SIGNALS {
        ALU_SUB     = 1  << 21,
        MEMORY_READ =  1 << 20,
        MEMORY_WRITE = 1 << 19,
        A_READ_DBUS =  1 << 18,
        A_WRITE_DBUS = 1 << 17,
        B_READ_DBUS =  1 << 16,
        B_WRITE_DBUS = 1 << 15,
        IR_READ_DBUS =  1 << 14,
        IR_WRITE_DBUS = 1 << 13,
        PC_READ_ABUS = 1 << 12,
        PC_WRITE_ABUS = 1 << 11,
        PC_INCREMENT = 1 << 10,
        H_READ_DBUS = 1 << 9,
        H_WRITE_DBUS = 1 << 8,
        L_READ_DBUS = 1 << 7,
        L_WRITE_DBUS = 1 << 6,
        HL_READ_ABUS = 1 << 5,
        HL_WRITE_ABUS = 1 << 4,
        ALU_BUFFER_READ_DBUS = 1 << 3,
        ALU_BUFFER_WRITE_DBUS = 1 << 2,
        ALU_FLAG_SET_ENABLE = 1 << 1,
        HALT_CPU = 1 << 0
      }
      let FETCH = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.IR_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT
      ]
      let NOP = [
        0
      ]
      let LDA_ABS = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.L_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.H_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.HL_WRITE_ABUS | CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.A_READ_DBUS
      ]
      let HLT = [CONTROL_SIGNALS.HALT_CPU]
      let STA_ABS = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.L_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.H_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.HL_WRITE_ABUS |CONTROL_SIGNALS.A_WRITE_DBUS| CONTROL_SIGNALS.MEMORY_WRITE,
      ]
      let JMP_ABS = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.L_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.H_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.HL_WRITE_ABUS | CONTROL_SIGNALS.PC_READ_ABUS
      ]
      // ADD M , A <- A + M
      let ADD_M = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.L_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.H_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.HL_WRITE_ABUS | CONTROL_SIGNALS.MEMORY_READ | CONTROL_SIGNALS.ALU_BUFFER_READ_DBUS | CONTROL_SIGNALS.ALU_FLAG_SET_ENABLE,
        CONTROL_SIGNALS.ALU_BUFFER_WRITE_DBUS | CONTROL_SIGNALS.A_READ_DBUS
      ]
      // SUB M , A <- A - M
      let SUB_M = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.L_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.H_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT,
        CONTROL_SIGNALS.HL_WRITE_ABUS | CONTROL_SIGNALS.MEMORY_READ | CONTROL_SIGNALS.ALU_BUFFER_READ_DBUS| CONTROL_SIGNALS.ALU_SUB | CONTROL_SIGNALS.ALU_FLAG_SET_ENABLE,
        CONTROL_SIGNALS.ALU_BUFFER_WRITE_DBUS | CONTROL_SIGNALS.A_READ_DBUS
      ]
      // MOVAB , B <- A
      let MOVAB = [
        CONTROL_SIGNALS.A_WRITE_DBUS | CONTROL_SIGNALS.B_READ_DBUS
      ]
      // MOVBA , A <- B
      let MOVBA = [
        CONTROL_SIGNALS.B_WRITE_DBUS | CONTROL_SIGNALS.A_READ_DBUS
      ]
      // A <- A + B
      let ADD_B = [
        CONTROL_SIGNALS.B_WRITE_DBUS | CONTROL_SIGNALS.ALU_BUFFER_READ_DBUS | CONTROL_SIGNALS.ALU_FLAG_SET_ENABLE,
        CONTROL_SIGNALS.ALU_BUFFER_WRITE_DBUS | CONTROL_SIGNALS.A_READ_DBUS
      ]
      // A <- A - B
      let SUB_B = [
        CONTROL_SIGNALS.B_WRITE_DBUS | CONTROL_SIGNALS.ALU_BUFFER_READ_DBUS |  CONTROL_SIGNALS.ALU_SUB | CONTROL_SIGNALS.ALU_FLAG_SET_ENABLE,
        CONTROL_SIGNALS.ALU_BUFFER_WRITE_DBUS | CONTROL_SIGNALS.A_READ_DBUS
      ]
      let  OPCODE_INSTRUCTION_MAP  =  {
        // Name used for easy debugging.
        0x00 : [NOP,"NOP"],
        0x01 : [LDA_ABS,"LDA_ABS"],
        0x02 : [STA_ABS,"STA_ABS"],
        0x03 : [JMP_ABS,"JMP_ABS"],
        0x04 : [ADD_M,"ADD_M"],
        0x05 : [MOVAB,"MOVAB"],
        0x06 : [MOVBA,"MOVBA"],
        0x07 : [ADD_B,"ADDB"],
        0x08 : [JMP_ABS,"JMP_C"],   // IF CARRY , DO JUMP ELSE NOP
        0x09 : [JMP_ABS,"JMP_NC"], // IF NO CARRY , DO JUMP ELSE NOP
        0x0a : [JMP_ABS,"JMP_Z"], // IF ZERO , DO JUMP ELSE NOP
        0x0b : [JMP_ABS,"JMP_NZ"], // IF NO ZERO , DO JUMP ELSE NOP
        0x0c : [SUB_M , "SUB_M"],
        0x0d : [SUB_B,"SUB_B"],
        0xfe : [HLT , "HLT"]
      }
  
      // fetch,ins,fetch,ins,fetch,ins....
      // microInstructions end when instruction is over.
      if(this.ins_end){
        console.log(`------------------- START OF FETCH - ${this.t_step}--------------------`)
        let [current_instruction,current_instruction_name] = [FETCH,"FETCH"]
        this.executeMicrocode(current_instruction);
      }
      else{
        let [current_instruction,current_instruction_name] = OPCODE_INSTRUCTION_MAP[this.IR.data]
        console.log(`-------------- START OF EXECUTE ${current_instruction_name} - ${this.t_step} --------------------`)
        // CONDITION JUMP OPERATIONS TO MAKE THE COMPUTER TURING COMPLETE.
        if(current_instruction_name == "JMP_C"){
            current_instruction = this.ALU.CARRY_FLAG ? JMP_ABS : NOP
        }
        if(current_instruction_name == "JMP_Z"){
            current_instruction = this.ALU.ZERO_FLAG ? JMP_ABS : NOP
        }
        if(current_instruction_name == "JMP_NC"){
            current_instruction = this.ALU.CARRY_FLAG ? NOP : JMP_ABS
        }
        if(current_instruction_name == "JMP_NZ"){
            current_instruction = this.ALU.ZERO_FLAG ? NOP : JMP_ABS
        }

        this.executeMicrocode(current_instruction);
      }
    }
    executeMicrocode(microInstructions : number[]){
      let CONTROL_SIGNAL_MAP= [
        (state:boolean)=>{this.ALU.SUBTRACT_FLAG = state},
        (state:boolean)=>{this.memory.MEMORY_READ = state},         (state:boolean)=>{this.memory.MEMORY_WRITE = state},
        (state:boolean)=>{this.A.READ_DBUS = state},                (state:boolean)=>{this.A.WRITE_DBUS = state},
        (state:boolean)=>{this.B.READ_DBUS = state},                (state:boolean)=>{this.B.WRITE_DBUS = state},
        (state:boolean)=>{this.IR.READ_DBUS = state},               (state:boolean)=>{this.IR.WRITE_DBUS = state},
        (state:boolean)=>{this.PC.READ_ABUS = state},               (state:boolean)=>{this.PC.WRITE_ABUS = state},            (state:boolean)=>{this.PC.PC_INCREMENT=state} ,
        (state:boolean)=>{this.HL.H.READ_DBUS = state} ,            (state:boolean)=>{this.HL.H.WRITE_DBUS = state} ,         (state:boolean)=>{this.HL.L.READ_DBUS = state},(state:boolean)=>{this.HL.L.WRITE_DBUS = state} ,
        (state:boolean)=>{this.HL.READ_ABUS = state} ,              (state:boolean)=>{this.HL.WRITE_ABUS = state} ,
        (state:boolean)=>{this.ALU.ALU_buffer.READ_DBUS = state} ,  (state:boolean)=>{this.ALU.ALU_buffer.WRITE_DBUS = state},(state:boolean)=>{this.ALU.FLAG_SET_ENABLE = state},
        (state:boolean)=>{this.HALT_CPU = state}
      ]

      let currentMicroInstruction = microInstructions[this.t_step];
      this.t_step++;
   
      // ------------------------------------------------------------------------
      let size = currentMicroInstruction.toString(2).length;
      let diff = CONTROL_SIGNAL_MAP.length-size;
      let controlString = "";
      for(let i = 0; i < diff; i++){
        controlString +="0";
      }
      controlString += currentMicroInstruction.toString(2);
      // console.log(controlString);
      // ------------------------------------------------------------------------
      for(let i = 0 ; i < CONTROL_SIGNAL_MAP.length ; i++){
        let bit = controlString[i]
        CONTROL_SIGNAL_MAP[i](bit == "1")
      }
      console.log("CONTROL_STRING - ",controlString)
      if(this.t_step >= microInstructions.length){
        console.log("-------------------- END OF INSTRUCTION -------------------")
        this.t_step = 0;
        this.ins_end = !this.ins_end;
      }

    }
    fallingEdge(){
      // Set control signals
      this.resetControlSignals();
      this.setControlSignals();
    }
    lowLevel(){
      /* 
      - reg to bus
      - calculation and ALU to bus
      - MEM to bus
      */
      for(let register of this.registers){
        register.writeBus();
      }
      this.HL.writeBus();
      this.PC.writeBus();
      this.memory.readMemory(); // memory read and output to data bus
      this.ALU.writeBus();
    }
    risingEdge(){
      // bus to reg // read from bus
      // pc++
      for(let register of this.registers){
        register.readBus();
      }
      this.ALU.readBus();
      this.HL.readBus();
      this.PC.readBus();
      this.PC.increment();
    }
    highLevel(){
      // calculation and ALU to bus ( just in case )
      this.ALU.writeBus();
      // bus to mem
      this.memory.writeMemory();  // data bus -> memory to write
    }
    PULSE(){
      if(this.HALT_CPU){
        console.log("STOPPED CPU!");
        return;
      }
      this.fallingEdge();
      this.lowLevel();
      this.risingEdge();
      this.highLevel();
    }
  }
  