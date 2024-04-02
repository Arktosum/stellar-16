
class Instructions:
    def __init__(self):
        self.A_READ_BUS = 1 << 0
        self.A_WRITE_BUS = 1 << 1
        self.B_READ_BUS = 1 << 2
        self.B_WRITE_BUS = 1 << 3
        self.C_READ_BUS = 1 << 4
        self.C_WRITE_BUS = 1 << 5
        self.IR_READ_BUS = 1 << 6
        self.IR_WRITE_BUS = 1 << 7
        self.SP_READ_BUS = 1 << 8
        self.SP_WRITE_BUS = 1 << 9
        self.MEM_READ_BUS = 1 << 10
        self.MEM_WRITE_BUS = 1 << 11
        self.MEM_WRITE_SELF = 1 << 12
        self.PC_READ_BUS = 1 << 13
        self.PC_WRITE_BUS = 1 << 14
        self.PC_INCREMENT = 1 << 15
        self.PC_DECREMENT = 1 << 16
        self.HLT = 1 << 17
        self.NOP = 1 << 18
        self.TEMP_READ_BUS = 1 << 19
        self.TEMP_WRITE_BUS = 1 << 20
        
        self.instructions : list[Instruction]= [
            Instruction('NOP',0x0000,self.NOP_FN),
            Instruction('HLT',0x0001,self.HLT_FN),
            Instruction('LDA',0x0002,self.LDA),
            Instruction('STA',0x0003,self.STA),
        ]
    
    def byOpcode(self,opcode :int):
        for ins in self.instructions:
            if ins.opcode == opcode:
                return ins
    def byName(self,name :str):
        for ins in self.instructions:
            if ins.name == name:
                return ins
    def NOP_FN(self)->list[int]:
        return [self.NOP]
    def HLT_FN(self)->list[int]:
        return [self.HLT]
            
    def fetch(self) -> list[int]:
        return [
            self.PC_WRITE_BUS | self.MEM_READ_BUS,
            self.MEM_WRITE_BUS | self.IR_READ_BUS | self.PC_INCREMENT
        ]
    def LDA(self) -> list[int]:
        return [
            self.PC_WRITE_BUS | self.MEM_READ_BUS, # 3000H in MDR
            self.MEM_WRITE_BUS | self.TEMP_READ_BUS, # 3000H in temp
            self.TEMP_WRITE_BUS | self.MEM_READ_BUS, # VAL[3000H] iN MDR 
            self.MEM_WRITE_BUS | self.A_READ_BUS | self.PC_INCREMENT, # VAL[3000H] in A
        ]
        
    def STA(self) -> list[int]:
        return [
            self.PC_WRITE_BUS | self.MEM_READ_BUS, # 3000H in MDR
            self.MEM_WRITE_BUS | self.TEMP_READ_BUS, # 3000H in temp
            
            self.TEMP_WRITE_BUS | self.MEM_READ_BUS, # VAL[3000H] iN MDR (MAR is stored)
            self.A_WRITE_BUS | self.MEM_WRITE_SELF | self.PC_INCREMENT, #  (new MDR is supplied from A)
        ]



class Instruction:
    def __init__(self,name,opcode,function):
        self.name = name
        self.opcode = opcode
        self.function = function