#include <iostream>
bool AND(bool a, bool b)
{
    return a && b;
}

bool AND3(bool a, bool b, bool c){
    return AND(AND(a,b),c);
}
bool NOT(bool a)
{
    return !a;
}

bool NAND(bool a, bool b)
{
    return NOT(AND(a, b));
}

bool OR(bool a, bool b)
{
    return NAND(NOT(a), NOT(b));
}

bool NOR(bool a, bool b)
{
    return NOT(OR(a, b));
}

bool XOR(bool a, bool b)
{
    return AND(OR(a, b), OR(NOT(a), NOT(b)));
}

struct NORSR
{
    bool Q = false;
    bool notQ = true;

    void run(bool r, bool s)
    {
        /*
            R    Q

            S    Q'

            R   S | Q  Q'
        --------------------------------
            0   0 |  memory ( previous )
            0   1 | 1  0   (set Q)
            1   0 | 0   1  (reset Q)
            1   1 | 0   0  (Invalid)
        */

        for (int i = 0; i < 2; i++)
        {
            // Run it twice to get more accurate results.
            Q = NOR(r, notQ);
            notQ = NOR(s, Q);
        }
    }
};

struct NORSRENABLE : NORSR{
    void run(bool r, bool s,bool enable){
        r = AND(r,enable);
        s = AND(s,enable);
        NORSR::run(r,s);
    }
};

struct DLATCH: NORSRENABLE{
    void run(bool enable,bool data){
        NORSRENABLE::run(NOT(data),data,enable);
    }
};

struct REGISTER{
    DLATCH latches[8];
    bool read = false;
    bool write = false;
    void run(DLATCH* data,bool clock){
        // NOTE: Both load and enable cannot be called at the same time!
        // Load will load the data to these registers.
        for(int i = 0; i < 8 ; i++){
            bool d = OR(AND(NOT(read),latches[i].Q),AND(read,data[i].Q));
            latches[i].run(clock,d);
        }
        // enable will output the data back to the bus.
        // just there for stylistic purposes. will only be required when using a tri state buffer.
    }
    void print(){
        for(auto latch : latches){
            std::cout<<latch.Q;
        }
        std::cout<<std::endl;
    }
};
struct BUS{
    DLATCH *data;
};
