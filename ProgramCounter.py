
from Bus import Bus
from Component import Component
from Counter import Counter
from Number import Number


class ProgramCounter(Component):
    def __init__(self,BUS : Bus):
        super().__init__()
        self.READ_BUS_ENABLE = False
        self.WRITE_BUS_ENABLE = False
        self.INCREMENT_ENABLE = False
        self.DECREMENT_ENABLE = False
        self.BUS = BUS
        self.name = 'PC'
        self.counter = Counter(16)
        
    def CONTROL_READ_BUS(self,value:bool):
        self.READ_BUS_ENABLE = value
    def CONTROL_WRITE_BUS(self,value:bool):
        self.WRITE_BUS_ENABLE = value
    def CONTROL_INCREMENT(self,value:bool):
        self.INCREMENT_ENABLE = value
    def CONTROL_DECREMENT(self,value:bool):
        self.DECREMENT_ENABLE = value
        
    def increment(self,CLOCK:bool,LOG):
        if not self.INCREMENT_ENABLE:
            return
        if LOG:
            print("| PC++ |")
        self.counter.SYNC(True,CLOCK,True)
        # self.counter.SYNC(True,not CLOCK,True)        
    def decrement(self,CLOCK:bool,LOG):
        if not self.DECREMENT_ENABLE:
            return
        if LOG:
            print("| PC-- |")
        self.counter.SYNC(True,CLOCK,False)
    
    def readFromBus(self,CLOCK,LOG):
        if not self.READ_BUS_ENABLE:
            return
        if LOG:
            print(f"| BUS -> PC |")
        self.write(self.BUS.read(),CLOCK)
        
    def writeToBus(self,LOG):
        if not self.WRITE_BUS_ENABLE:
            return
        if LOG:
            print(f"| PC -> BUS |")
        self.BUS.write(self.read())
        
    def write(self, data:Number,CLOCK):
        self.counter.input(data,CLOCK)
            
    def read(self) -> Number:
        val = self.counter.output()
        return val

        