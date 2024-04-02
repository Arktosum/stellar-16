import math
import time
def AND(a : bool , b : bool) -> bool:
    return a and b
def NOT(a : bool) -> bool:
    return not a
def NAND(a : bool , b : bool) -> bool:
    return NOT(AND(a, b))
def OR(a : bool , b : bool) -> bool:
    return NAND(NOT(a),NOT(b))
def NOR(a : bool , b : bool) -> bool:
    return NOT(OR(a, b))
def XOR(a : bool , b : bool) -> bool:
    return OR(AND(a,NOT(b)),AND(b,NOT(a)))
def XNOR(a : bool , b : bool) -> bool:
    return NOT(XNOR(a, b))
def AND3(a : bool , b : bool,c:bool) -> bool:
    return AND(AND(a,b),c)

def HALF_ADDER(A : bool ,B : bool)->tuple[bool,bool]:
    SUM = XOR(A,B)
    CARRY = AND(A,B)
    return SUM,CARRY

def FULL_ADDER(A : bool, B : bool,CarryIn:bool)->tuple[bool,bool]:
    HALF_SUM,HALF_CARRY = HALF_ADDER(A,B)
    HALF_TWO_SUM,HALF_TWO_CARRY = HALF_ADDER(HALF_SUM,CarryIn)
    FULL_SUM = HALF_TWO_SUM
    FULL_CARRY = OR(HALF_CARRY,HALF_TWO_CARRY)
    return FULL_SUM,FULL_CARRY

class MemoryUnit:
    def __init__(self) -> None:
        self.Q = False
        self.Q_ = True
    
        # Setting as None due to recursion Error.
        # used for JKFF 
        self.latch = None
        
        # used for master-slave JKFF
        self.master = None
        self.slave = None
    
    def SR(self,RESET:bool,SET:bool) -> None:
        # for strangeness , this must happen alot of times until it converges. otherwise we get Q and Q_ as False sometimes.
        for _ in range(2):
            TOP_NOR = NOR(RESET,self.Q_)
            BOTTOM_NOR = NOR(SET,self.Q)
            self.Q = TOP_NOR
            self.Q_ = BOTTOM_NOR

    def SRE(self,RESET:bool,ENABLE : bool,SET:bool)-> None:
        self.SR(AND(RESET,ENABLE),AND(SET,ENABLE))
    def DFF(self,DATA : bool , CLOCK : bool) -> None:
        self.SRE(NOT(DATA),CLOCK,DATA)
    def JKFF(self,J : bool ,CLOCK : bool, K:bool ) -> None:
        if not self.latch:
            self.latch = MemoryUnit()
        latch_r = AND3(self.latch.Q,J,CLOCK)
        latch_s = AND3(self.latch.Q_,K,CLOCK)
        self.latch.SR(latch_r,latch_s)
        
        self.Q = self.latch.Q
        self.Q_ = self.latch.Q_
    
    def MSJKFF(self,J : bool ,CLOCK : bool, K:bool ) -> None:
        if not self.master and not self.slave:
            self.master = MemoryUnit()
            self.slave = MemoryUnit()
            # this is a problem. I do not know why the master and slave have to be initialized with these particular configurations.
            # we have to understand this further.
            self.master.SR(0,1)
            self.slave.SR(1,0)
            
        master_r = AND3(J,CLOCK,self.Q_)
        master_s = AND3(K,CLOCK,self.Q)
        self.master.SR(master_r,master_s)
        
        slave_r = AND(self.master.Q,NOT(CLOCK))
        slave_s = AND(self.master.Q_,NOT(CLOCK))
        self.slave.SR(slave_r,slave_s)
        
        self.Q = self.slave.Q
        self.Q_ = self.slave.Q_
        
        
        
    def TFF(self, T: bool , CLOCK : bool)-> None:
        '''
            When CLOCK goes from HIGH TO LOW , and J and K are SET, toggling happens!
        '''  
        self.MSJKFF(T,CLOCK,T)
            

class Number:
    def __init__(self,value:int) -> None:
        self.value = value
    def hexString(self) -> str:
        return
    def binaryString(self,padding=0) -> str:
        binary = bin(self.value)[2:]
        diff = padding - len(binary)
        if diff > 0:
            binary = "0"*diff + binary
        return binary
    @staticmethod
    def fromBinaryArray(binArray : list[bool])-> 'Number':
        value = 0
        for i in range(len(binArray)):
            if binArray[i]:
                value += 2**(len(binArray)-i-1)
        return Number(value)
    def tobinaryArray(self,padding=0):
        return [x == "1" for x in self.binaryString(padding)]
    
    def print(self,padding=0)->None:
        print(self.binaryString(padding)," | ",self.value)
        
class Counter:
    def __init__(self,bitCount):
        self.flipflops = [MemoryUnit() for _ in range(bitCount)]
    def output(self,showQ = True) -> Number:
        array = [ff.Q if showQ else ff.Q_ for ff in self.flipflops]
        val = Number.fromBinaryArray(array)
        return val
    
    def print(self,showQ = True):
        self.output(showQ).print()
    def ASYNC(self,T : bool, CLOCK : bool):
        '''
        Toggle is the same, Clock Changes!\n
        If ripple and output are both same, then it's an up counter. if they are different, it's a down counter
        rippleQ means Q is the ripple. otherwise Q' will be the ripple
        '''
        clock = CLOCK
        for ff in self.flipflops[::-1]:
            ff.TFF(T,clock)
            clock = ff.Q

    def SYNC(self,T : bool, CLOCK : bool):
        '''
        CLOCK is the same, Toggle Changes!\n
        If ripple and output are both same, then it's an up counter. if they are different, it's a down counter
        rippleQ means Q is the ripple. otherwise Q' will be the ripple
        '''
        prev = T
        for ff in self.flipflops[::-1]:
            ff.TFF(prev,CLOCK)
            prev = AND(ff.Q,prev)

# counter = Counter(16)
# clock = False
# while True:
#     counter.SYNC(0,clock)
#     clock = not clock
#     counter.print(False)
#     time.sleep(0.1)
    
