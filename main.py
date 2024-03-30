import time

from gates import Register16

class RAM:
    def __init__(self):
        self.data = []
        for _ in range(2**16):
            self.data.append(Register16())
class Computer:
    def __init__(self,clockRate):
        self.clock = False
        self.clockRate = clockRate
        
        self.RAM = RAM()
        
        self.PC = Register16()
        self.IR = Register16()
    
        self.ACCUMULATOR = Register16()
        self.B_REGISTER = Register16()
        
    def lowLevel(self):
        print("-- Low level -- clock : " + str("HIGH" if self.clock else 'LOW'))
    def risingEdge(self):
        print("-- Rising edge -- clock : " + str("HIGH" if self.clock else 'LOW'))
    def highLevel(self):
        print("-- High level -- clock : " + str("HIGH" if self.clock else 'LOW'))
    def fallingEdge(self):
        print("-- Falling edge -- clock : " + str("HIGH" if self.clock else 'LOW'))
    
    def start(self):
        while True:
            self.clock = False
            self.lowLevel()
            self.clock = True
            self.risingEdge()
            self.clock = True
            self.highLevel()
            self.clock = False
            self.fallingEdge()
            time.sleep(1/self.clockRate)
            
computer = Computer(10)
computer.start()