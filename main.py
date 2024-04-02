import time

from gates import MemoryUnit, Number

class Component:
    def __init__(self):
        pass
    def update(self):
        pass
    def readFromBus(self):
        pass
    def writeToBus(self):
        pass

class Bus:
    def __init__(self):
        self.data = Number(0)
    def write(self, data:Number):
        self.data = data
    def read(self) -> Number:
        return self.data
    def print(self,showQ = True):
        self.data.print(16)
        
        
class Register(Component):
    def __init__(self,BUS : Bus):
        super().__init__()
        self.READ_ENABLE = False
        self.WRITE_ENABLE = False
        self.BUS = BUS
        self.flipflops = [MemoryUnit() for _ in range(16)]
    def CONTROL_READ(self,value:bool):
        self.READ_ENABLE = value
    def CONTROL_WRITE(self,value:bool):
        self.WRITE_ENABLE = value
    def readFromBus(self,CLOCK):
        if not self.READ_ENABLE:
            return
        self.write(self.BUS.read(),CLOCK)
        
    def writeToBus(self):
        if not self.WRITE_ENABLE:
            return
        self.BUS.write(self.read())
        
    def write(self, data:Number,CLOCK):
        binArray = data.tobinaryArray(16)
        for i in range(len(binArray)):
            self.flipflops[i].DFF(binArray[i],CLOCK)
    def read(self,showQ = True) -> Number:
        array = [ff.Q if showQ else ff.Q_ for ff in self.flipflops]
        val = Number.fromBinaryArray(array)
        return val
    def print(self,showQ = True):
        self.read(showQ).print(16)
        
class Computer:
    def __init__(self,clockRate):
        self.clock = False
        self.clockRate = clockRate
        self.BUS = Bus()
        self.HALT = False
        self.A_REGISTER = Register(self.BUS)
        
        self.A_REGISTER.write(Number(159),True)
        self.B_REGISTER = Register(self.BUS)
        self.C_REGISTER = Register(self.BUS)
        self.INSTRUCTION_REGISTER = Register(self.BUS)
        self.STACK_POINTER = Register(self.BUS)
        self.COMPONENTS = [
            self.A_REGISTER,self.B_REGISTER,self.C_REGISTER,
            self.INSTRUCTION_REGISTER,self.STACK_POINTER
        ]
        
    def update(self):
        # CONTROL WORD
        # AREAD,AWRITE,BREAD,BWRITE,CREAD,CWRITE,IRREAD,IRWRITE,SPREAD,SPWRITE
        control_word = [
            self.A_REGISTER.CONTROL_READ,
            self.A_REGISTER.CONTROL_WRITE,
            self.B_REGISTER.CONTROL_READ,
            self.B_REGISTER.CONTROL_WRITE,
            self.C_REGISTER.CONTROL_READ,
            self.C_REGISTER.CONTROL_WRITE,
            self.INSTRUCTION_REGISTER.CONTROL_READ,
            self.INSTRUCTION_REGISTER.CONTROL_WRITE,
            self.STACK_POINTER.CONTROL_READ,
            self.STACK_POINTER.CONTROL_WRITE,
            ]
        print(self.clock)
        control_input = [x=="1" for x in input("Instruction word : ")]
        
        for i in range(len(control_input)):
            control_word[i](control_input[i])
        for COMPONENT in self.COMPONENTS:
            COMPONENT.readFromBus(self.clock)
        for COMPONENT in self.COMPONENTS:
            COMPONENT.writeToBus()
            
        if self.clock:
            # high state
            for COMPONENT in self.COMPONENTS:
                COMPONENT.read().print(16)
            self.HALT = True
        
    def start(self):
        while True:
            if self.HALT:
                break
            self.update()
            self.clock = not self.clock
            time.sleep(1/self.clockRate)
            
computer = Computer(10)
computer.start()