#include <iostream>
#include "digital.h"

struct MEMORY{
    bool read = false;
    bool write = false;

    DLATCH latch[65536];
    void run(DLATCH highAddress,DLATCH lowAddress){
        
    }
};


struct JKFF : NORSR{
    void run(bool k, bool j,bool clock){
        bool r = AND3(k,clock,Q);
        bool s = AND3(j,clock,notQ);
        NORSR::run(r,s);
    }
};

struct MSJKFF : NORSR{
    NORSR master;
    NORSR slave;
    void run(bool j, bool k, bool clock){
        bool s = AND3(j,clock,Q);
        bool r = AND3(k,clock,notQ);
        master.run(r,s);
        r = AND(Q,NOT(clock));
        s = AND(notQ,NOT(clock));
        slave.run(r,s);
        Q = slave.Q;
        notQ = slave.notQ;
    }
};
int main()
{
    REGISTER A,B;
    BUS bus;

    bool pulse = false;
    
    bool enable = true;
    int count = 0;
    DLATCH data[8];
    data[0].Q = 1;
    data[2].Q = 1;
    data[4].Q = 1;
    A.read = true;
    A.write = false;
    B.read = false;
    B.write = false;
    bus.data = data;

    while(true){
        // A.run(bus.data,pulse);
        // B.run(bus.data,pulse);
        // if(A.write) bus.data = A.latches; // tri state buffer
        // if(B.write) bus.data = B.latches; // tri state buffer
        
        // if(count > 1000 && enable){
        //     A.read = false;
        //     A.write = true;
        //     B.read = true;
        //     enable =false;
        // }
        // std::cout<<"---------"<<count<<"----------------"<<std::endl;
        // std::cout<<"Register A : ";
        // A.print();
        // std::cout<<"Register B : " ;
        // B.print();
        // std::cout<<"----------------------------"<<std::endl;
        if(pulse){
            std::cout<< jk.Q << std::endl;
        }
        pulse = NOT(pulse);
        count++;
    }
    return 0;
}