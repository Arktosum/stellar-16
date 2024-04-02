from Bus import Bus
from Component import Component
from Number import Number
from Register import Register


class Memory(Component):
    def __init__(self,BUS : Bus):
        super().__init__()
        self.READ_BUS_ENABLE = False
        self.WRITE_BUS_ENABLE = False
        self.MEMORY_WRITE_SELF_ENABLE = False
        self.BUS = BUS
        self.memory : list[Register]= [Register(str(i),None) for i in range((2**16))]
        self.MAR = Register('MAR',BUS)
        self.MDR = Register('MDR',BUS)
    def CONTROL_READ_BUS(self,value:bool):
        self.READ_BUS_ENABLE = value
    def CONTROL_WRITE_BUS(self,value:bool):
        self.WRITE_BUS_ENABLE = value
        
    def CONTROL_MEMORY_WRITE_SELF(self,value:bool):
        self.MEMORY_WRITE_SELF_ENABLE = value
        
    def readFromBus(self,CLOCK,LOG):
        if not self.READ_BUS_ENABLE:
            return
        if LOG:
            print("| BUS-> MAR-> MEM-> MDR |")
        address = self.BUS.read()
        self.MAR.write(address,CLOCK)
        
        data= self.read(self.MAR.read())
        self.MDR.write(data,CLOCK)
        
    
    def writeToMemory(self,CLOCK,LOG):
        '''
        Address must be loaded before using BUS
        Data must be loaded before writing to same BUS.
        '''
        if not self.MEMORY_WRITE_SELF_ENABLE:
            return
        data = self.BUS.read()
        address = self.MAR.read()
        if LOG:
            print(f"| MDR,MAR -> MEM(STORE -> #{data.value} @ {address.value}) |")
        
        self.write(address,data,CLOCK)
        

        
    def writeToBus(self,LOG):
        if not self.WRITE_BUS_ENABLE:
            return
        if LOG:
            print("| MDR -> BUS |")

        self.BUS.write(self.MDR.read())
    
    def SET(self,address : int,data : int):
        '''
        Only to be used to load instructions!
        '''
        self.write(Number(address),Number(data),True)
        
    def write(self,address:Number,data:Number,CLOCK):
        return self.memory[address.value].write(data,CLOCK)
    def read(self,address : Number,showQ = True) -> Number:
        return self.memory[address.value].read(showQ)
    def print(self,address,showQ = True):
        self.read(address,showQ).print(16)
        
        