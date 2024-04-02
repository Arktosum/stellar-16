from gates import AND, AND3, NOR, NOT


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
            self.master.SR(False,True)
            self.slave.SR(True,False)
            
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