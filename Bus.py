from Number import Number


class Bus:
    def __init__(self):
        self.data = Number(0)
    def write(self, data:Number):
        self.data = data
    def read(self) -> Number:
        return self.data
    def print(self,showQ = True):
        self.data.print(16)