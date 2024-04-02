from Bus import Bus
from Component import Component
from MemoryUnit import MemoryUnit
from Number import Number


class Register(Component):
    def __init__(self,name:str,BUS : Bus):
        super().__init__()
        self.READ_BUS_ENABLE = False
        self.WRITE_BUS_ENABLE = False
        self.BUS = BUS
        self.name = name
        self.flipflops = [MemoryUnit() for _ in range(16)]
    def CONTROL_READ_BUS(self,value:bool):
        self.READ_BUS_ENABLE = value
    def CONTROL_WRITE_BUS(self,value:bool):
        self.WRITE_BUS_ENABLE = value
    def readFromBus(self,CLOCK,LOG):
        if not self.READ_BUS_ENABLE:
            return
        if LOG:
            print(f"| BUS -> REG({self.name}) |")
        self.write(self.BUS.read(),CLOCK)
        
    def writeToBus(self,LOG):
        if not self.WRITE_BUS_ENABLE:
            return
        
        if LOG:
            print(f"| REG({self.name}) -> BUS |")
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
        