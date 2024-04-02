from MemoryUnit import MemoryUnit
from Number import Number
from gates import AND


class Counter:
    def __init__(self,bitCount):
        self.bitCount = bitCount
        self.flipflops = [MemoryUnit() for _ in range(bitCount)]
    def output(self,showQ = True) -> Number:
        array = [ff.Q if showQ else ff.Q_ for ff in self.flipflops]
        val = Number.fromBinaryArray(array)
        return val
    
    def input(self,inputNumber : Number,CLOCK : bool):
        num = inputNumber.tobinaryArray(self.bitCount)
        if len(num) != self.bitCount:
            raise ValueError("Invalid input size! in counter!")
        
        for i in range(self.bitCount):
            if num[i]:
                self.flipflops[i].MSJKFF(True,CLOCK,False) # set as 1
            else:
                self.flipflops[i].MSJKFF(False,CLOCK,True) # set as 0
                
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

    def SYNC(self,T : bool, CLOCK : bool,UP = False):
        '''
        CLOCK is the same, Toggle Changes!\n
        If ripple and output are both same, then it's an up counter. if they are different, it's a down counter
        rippleQ means Q is the ripple. otherwise Q' will be the ripple
        '''
        prev = T
        for ff in self.flipflops[::-1]:
            ff.TFF(prev,CLOCK)
            if UP:
                prev = AND(ff.Q,prev)
            else:
                prev = AND(ff.Q_,prev)

# counter = Counter(16)
# clock = False
# while True:
#     counter.SYNC(0,clock)
#     clock = not clock
#     counter.print(False)
#     time.sleep(0.1)