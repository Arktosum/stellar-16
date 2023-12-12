import { Bus, HLRegister, Memory, ProgramCounter, Register_8 } from "./components"

export default class CPU{
    public A: Register_8 
    public B: Register_8 
    public IR: Register_8 
    public HL : HLRegister
    public PC : ProgramCounter
    public addressBus : Bus
    public dataBus : Bus
    public memory : Memory
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
      this.registers = [
        this.A,this.B,this.IR,this.HL.H,this.HL.L
      ];
      this.HALT_CPU = false;
  
      this.t_step = 0;
      this.ins_end = true;
    }
    HALT_CPU_SET(){
      this.HALT_CPU = true
    }
    resetControlSignals(){
      for(let register of this.registers){
        register.clearFlags();
      }
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
        MEMORY_READ =  1 << 17,
        MEMORY_WRITE = 1 << 16,
        A_READ_DBUS =  1 << 15,
        A_WRITE_DBUS = 1 << 14,
        B_READ_DBUS =  1 << 13,
        B_WRITE_DBUS = 1 << 12,
        IR_READ_DBUS =  1 << 11,
        IR_WRITE_DBUS = 1 << 10,
        PC_READ_ABUS = 1 << 9,
        PC_WRITE_ABUS = 1 << 8,
        PC_INCREMENT = 1 << 7,
        H_READ_DBUS = 1 << 6,
        H_WRITE_DBUS = 1 << 5,
        L_READ_DBUS = 1 << 4,
        L_WRITE_DBUS = 1 << 3,
        HL_READ_ABUS = 1 << 2,
        HL_WRITE_ABUS = 1 << 1,
        HALT_CPU = 1 << 0
      }
      let FETCH = [
        CONTROL_SIGNALS.PC_WRITE_ABUS| CONTROL_SIGNALS.MEMORY_READ,
        CONTROL_SIGNALS.IR_READ_DBUS | CONTROL_SIGNALS.PC_INCREMENT
      ]
      let NOP = [
        CONTROL_SIGNALS.PC_INCREMENT 
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
  
      let  OPCODE_INSTRUCTION_MAP  =  {
        // Name used for easy debugging.
        0x00 : [NOP,"NOP"],
        0x01 : [LDA_ABS,"LDA_ABS"],
        0x02 : [STA_ABS,"STA_ABS"],
        0x03 : [JMP_ABS,"JMP_ABS"],
        0xFe : [HLT , "HLT"]
      }
  
      // fetch,ins,fetch,ins,fetch,ins....
      // microInstructions end when instruction is over.
      if(this.ins_end){
        let [current_instruction,current_instruction_name] = [FETCH,"FETCH"]
        console.log(current_instruction_name,this.t_step)
        this.executeMicrocode(current_instruction);
      }
      else{
        let [current_instruction,current_instruction_name] = OPCODE_INSTRUCTION_MAP[this.IR.data]
        console.log(current_instruction_name,this.t_step)
        this.executeMicrocode(current_instruction);
      }
    }
    executeMicrocode(microInstructions : number[]){
      let CONTROL_SIGNAL_MAP= [
        ()=>{this.memory.MEMORY_READ_SET()},()=>{this.memory.MEMORY_WRITE_SET()},
        ()=>{this.A.READ_DBUS_SET()},()=>{this.A.WRITE_DBUS_SET()},
        ()=>{this.B.READ_DBUS_SET()},()=>{this.B.WRITE_DBUS_SET()},
        ()=>{this.IR.READ_DBUS_SET()},()=>{this.IR.WRITE_DBUS_SET()},
        ()=>{this.PC.READ_ABUS_SET()},()=>{this.PC.WRITE_ABUS_SET()},()=>{this.PC.PC_INCREMENT_SET()} ,
        ()=>{this.HL.H.READ_DBUS_SET()} ,()=>{this.HL.H.WRITE_DBUS_SET()} ,()=>{this.HL.L.READ_DBUS_SET();},()=>{this.HL.L.WRITE_DBUS_SET()} ,
        ()=>{this.HL.READ_ABUS_SET()} ,()=>{this.HL.WRITE_ABUS_SET()} ,
        ()=>{this.HALT_CPU_SET()}
      ]
  
      
      let currentMicroInstruction = microInstructions[this.t_step];
      this.t_step++;
      if(this.t_step >= microInstructions.length){
        console.log("EOI");
        this.t_step = 0;
        this.ins_end = !this.ins_end;
      }
  
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
        if(bit === "1"){
          CONTROL_SIGNAL_MAP[i]()
        }
      }
    }
    fallingEdge(){
      // Set control signals
      this.resetControlSignals();
      this.setControlSignals();
      let CONTROL_SIGNAL_WORD= [
        this.memory.MEMORY_READ,this.memory.MEMORY_WRITE,
        this.A.READ_DBUS,this.A.WRITE_DBUS,
        this.B.READ_DBUS,this.B.WRITE_DBUS,
        this.IR.READ_DBUS,this.IR.WRITE_DBUS,
        this.PC.READ_ABUS,this.PC.WRITE_ABUS,this.PC.PC_INCREMENT ,
        this.HL.H.READ_DBUS ,this.HL.H.WRITE_DBUS ,this.HL.READ_ABUS,this.HL.WRITE_ABUS ,
        this.HL.L.READ_DBUS ,this.HL.L.WRITE_DBUS ,this.HL.READ_ABUS ,this.HL.WRITE_ABUS ,
        this.HALT_CPU
      ]
      let control_string = ""
      for(let value of CONTROL_SIGNAL_WORD){
        control_string+=value == true ? "1" : "0";
      }
      console.log(control_string)
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
  
    }
    risingEdge(){
      // bus to reg // read from bus
      // pc++
      for(let register of this.registers){
        register.readBus();
      }
      this.HL.readBus();
      this.PC.readBus();
      this.PC.increment();
    }
    highLevel(){
      // calculation and ALU to bus ( just in case )
  
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
  