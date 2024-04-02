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
        