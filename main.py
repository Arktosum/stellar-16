from collections import deque
import time

from Bus import Bus
from Instructions import Instructions
from Memory import Memory
from Number import Number
from ProgramCounter import ProgramCounter
from Register import Register

        
class Computer:
    def __init__(self,clockRate):
        self.clock = False
        self.clockRate = clockRate
        self.BUS = Bus()
        self.HALT = False
        self.NOP = False
        self.A_REGISTER = Register('A',self.BUS)
        
        self.A_REGISTER.write(Number(159),True)
        self.B_REGISTER = Register('B',self.BUS)
        self.B_REGISTER.write(Number(200),True)
        self.C_REGISTER = Register('C',self.BUS)
        self.TEMP_REGISTER = Register('TEMP',self.BUS)
        self.INSTRUCTION_REGISTER = Register('IR',self.BUS)
        self.STACK_POINTER = Register('SP',self.BUS)
        self.RAM = Memory(self.BUS)
        self.PC = ProgramCounter(self.BUS)
        self.COMPONENTS = [
            self.A_REGISTER,self.B_REGISTER,self.C_REGISTER,self.TEMP_REGISTER,
            self.INSTRUCTION_REGISTER,self.STACK_POINTER,
            self.PC
        ]
        self.INSTRUCTIONS = Instructions()
        self.CURRENT_MICROCODE = deque()
        self.CURRENT_MICROCODE += self.INSTRUCTIONS.fetch()
        
        self.CLOCK_CYCLES_ELAPSED = 0

        # CONTROL WORD
        # AREAD,AWRITE,BREAD,BWRITE,CREAD,CWRITE,IRREAD,IRWRITE,SPREAD,SPWRITE
        self.CONTROL_WORD = [
            self.A_REGISTER.CONTROL_READ_BUS,
            self.A_REGISTER.CONTROL_WRITE_BUS,
            self.B_REGISTER.CONTROL_READ_BUS,
            self.B_REGISTER.CONTROL_WRITE_BUS,
            self.C_REGISTER.CONTROL_READ_BUS,
            self.C_REGISTER.CONTROL_WRITE_BUS,
            self.INSTRUCTION_REGISTER.CONTROL_READ_BUS,
            self.INSTRUCTION_REGISTER.CONTROL_WRITE_BUS,
            self.STACK_POINTER.CONTROL_READ_BUS,
            self.STACK_POINTER.CONTROL_WRITE_BUS,
            self.RAM.CONTROL_READ_BUS,
            self.RAM.CONTROL_WRITE_BUS,
            self.RAM.CONTROL_MEMORY_WRITE_SELF,
            self.PC.CONTROL_READ_BUS,
            self.PC.CONTROL_WRITE_BUS,
            self.PC.CONTROL_INCREMENT,
            self.PC.CONTROL_DECREMENT,
            self.CONTROL_HLT,
            self.CONTROL_NOP,
            self.TEMP_REGISTER.CONTROL_READ_BUS,
            self.TEMP_REGISTER.CONTROL_WRITE_BUS,
        ]
    def CONTROL_HLT(self,value : bool):
        self.HALT = value
    def CONTROL_NOP(self,value : bool):
        self.NOP = value
    
    def update(self,control_input,LOG):
        if len(control_input) != len(self.CONTROL_WORD):
            raise ValueError("Invalid control input size!")
        # ------------- RESET CONTROL WORD! ------------------
        for i in range(len(control_input)):
            self.CONTROL_WORD[i](False)
        # ----------------------------------------------------
        # ---------------- SET CONTROL WORD ------------------
        
        for i in range(len(control_input)):
            self.CONTROL_WORD[i](control_input[i])
        # ----------------------------------------------------
        
        
        self.RAM.writeToBus(LOG) # MDR -> BUS
        
        for COMPONENT in self.COMPONENTS:
            COMPONENT.readFromBus(self.clock,LOG)
            
        for COMPONENT in self.COMPONENTS:
            COMPONENT.writeToBus(LOG)
            
        self.RAM.readFromBus(self.clock,LOG)
        self.RAM.writeToMemory(self.clock,LOG)
        self.PC.increment(self.clock,LOG)
        self.PC.decrement(self.clock,LOG)
        
    def decode(self):
        print('Decoding...')
        OPCODE = self.INSTRUCTION_REGISTER.read().value
        current_instruction = self.INSTRUCTIONS.byOpcode(OPCODE)
        microcode : list[int] = current_instruction.function()
        print(f'Current instruction : {current_instruction.name}')
        
        self.CURRENT_MICROCODE.extend(microcode + self.INSTRUCTIONS.fetch())
        
    def cycle(self,control_input):
        # HIGH TO LOW
        for i in range(3):
            self.clock = not self.clock
            self.update(control_input,i==2)
        time.sleep(1/self.clockRate)
        
        for COMPONENT in self.COMPONENTS:
            print(f"{COMPONENT.name} | {COMPONENT.read().value}")
        
        print(f"MDR | {self.RAM.MDR.read().value}")
        print(f"MAR | {self.RAM.MAR.read().value}")
        print(f"MEM[3000] | {self.RAM.memory[0x3000].read().value}")
        print(f"MEM[3001] | {self.RAM.memory[0x3001].read().value}")
    def nameop(self,name):
        return self.INSTRUCTIONS.byName(name).opcode
    def start(self):
        self.RAM.SET(0x0000,self.nameop('LDA'))
        self.RAM.SET(0x0001,0x3000)
        self.RAM.SET(0x0000,self.nameop('STA'))
        self.RAM.SET(0x0001,0x3001)
        self.RAM.SET(0x0002,self.nameop('HLT'))
        self.RAM.SET(0x3000,0x5050)
        self.RAM.SET(0x3001,0xA0A0)
        CONTROL_LENGTH = len(self.CONTROL_WORD)
        while True:
            if self.HALT:
                print("------------- HALTED COMPUTER ------------------")
                break
            if self.NOP:
                self.NOP = False
                continue
            if not self.CURRENT_MICROCODE:
                self.decode()
            control_input_binary=Number(self.CURRENT_MICROCODE.popleft()).binaryString(CONTROL_LENGTH)[::-1]
            control_input=[x=="1" for x in control_input_binary]
            print(F"--------- START OF CYCLE - {self.CLOCK_CYCLES_ELAPSED} ------ ")
            print(F"MICROCODE --> {control_input_binary}")
            self.cycle(control_input)
            
            print(F"--------- END OF CYCLE - {self.CLOCK_CYCLES_ELAPSED} ------ ")
            self.CLOCK_CYCLES_ELAPSED+=1

computer = Computer(0x0A)
computer.start()