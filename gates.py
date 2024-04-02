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

