import { Bus, HLRegister, Memory, ProgramCounter, Register_8 ,ALU} from "./components"
import OPCODES from "./opcodes"
let opcodes = new OPCODES();

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

      // fetch,ins,fetch,ins,fetch,ins....
      // microInstructions end when instruction is over.
      let JMP = opcodes.mnemonic("JMP").microcode
      let JMP_CONDITIONAL = opcodes.mnemonic("JNZ").microcode
      if(this.ins_end){
        console.log(`------------------- START OF FETCH - ${this.t_step}--------------------`)
        let [current_instruction,current_instruction_name] = [opcodes.FETCH_MICROCODE,"FETCH"]
        this.executeMicrocode(current_instruction);
      }
      else{
        let opcode = opcodes.code(this.IR.data)
        let [current_instruction,current_instruction_name] = [opcode.microcode,opcode.mnemonic]
        console.log(`-------------- START OF EXECUTE ${current_instruction_name} - ${this.t_step} ---------------------`)
        console.log(`-------------- ZF - ${this.ALU.ZERO_FLAG}  | CF - ${this.ALU.CARRY_FLAG}---------------------`)
        // CONDITION JUMP OPERATIONS TO MAKE THE COMPUTER TURING COMPLETE.
        if(current_instruction_name == "JC"){
            current_instruction = this.ALU.CARRY_FLAG ? JMP : JMP_CONDITIONAL
        }
        if(current_instruction_name == "JZ"){
            current_instruction = this.ALU.ZERO_FLAG ? JMP : JMP_CONDITIONAL
        }
        if(current_instruction_name == "JNC"){
            current_instruction = this.ALU.CARRY_FLAG ? JMP_CONDITIONAL : JMP
        }
        if(current_instruction_name == "JNZ"){
            current_instruction = this.ALU.ZERO_FLAG ? JMP_CONDITIONAL : JMP
        }

        this.executeMicrocode(current_instruction);
      }
    }
    executeMicrocode(microInstructions : number[] ){
      let CONTROL_SIGNAL_MAP= [
        (state:boolean)=>{this.ALU.ALU_INCREMENT = state},(state:boolean)=>{this.ALU.SUBTRACT_FLAG = state},
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
      console.log("CONTROL_WORD - ",controlString)
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
  