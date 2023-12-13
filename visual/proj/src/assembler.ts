import OPCODES from "./opcodes"

let opcodes = new OPCODES();

const PROGRAM = 
`

#start 0x6000
#label a 0x5000
#label b 0x5001
#label c 0x5002
#label n 0x5003

lda a : fibo
ldb b
add_b
movab
lda b
sta a
movba
sta b
dec_m n
jnz fibo
ret

#main

ldi 0x00 : main
sta a
ldi 0x01
sta b
ldi 0x00
sta c
ldi 0x0a
sta n
jsr fibo
jmp main
hlt

`
// string, address

const fibo = `


#label a 0x5000
#label b 0x5001
#label c 0x5002
#label n 0x5003
#memset a 0x00
#memset b 0x01
#memset c 0x00
#memset n 0xff
lda b : loop
movab
lda a
add_b
sta c
lda b
sta a
lda c
sta b
dec_m n
jnz loop


`

const multiply = `
#start 0x6000
#label first_num 0x5000
#label second_num 0x5001
#memset first_num 0x07
#memset second_num 0xa

`

let labels : Record<string, number> = {}
let current_address = 0x0000
let prog_lines
prog_lines  =PROGRAM.split("\n");
// address : byte
let program : {
    Bytes : [number,number,boolean][],
    startAddress : number
} = 
{
    Bytes : [],
    startAddress : 0
}

for(let line of prog_lines){
    if(line.length == 0) continue;
    line = line.trim();
    let split_line = line.split(" ");
    if(line.startsWith('#')){
        let process = split_line[0]
        if(process == "#start"){
            let address = parseLabelAddress(split_line[1]);
            current_address = address
            program.startAddress = current_address
        }
        else if(process == "#label"){
            let label = split_line[1]
            let address = parseInt(split_line[2])
            labels[label] = address
        }
        else if(process == "#memset"){
            let address = parseLabelAddress(split_line[1])
            let data = parseInt(split_line[2])
            pushAddressData(address, data,false)
        }
        else if(process == "#main"){
            program.startAddress = current_address
        }
        continue;
    }

    if(line.includes(":")){
        let splitLine= line.split(":");
        let label = splitLine.pop()?.trim();
        if(label) labels[label] = current_address
        split_line = splitLine[0].trim().split(" ")
    }
    if(split_line.length == 2){
        // opcode address
        let OPObj =  opcodes.mnemonic(split_line[0].trim().toUpperCase())
        let opcode = OPObj.code;
        let address = parseLabelAddress(split_line[1])
        pushData(opcode,true)
        if(OPObj.operandCount == 2){
            let {highByte, lowByte} = WordToBytes(address);
            pushData(lowByte,false)
            pushData(highByte,false)
        }
        else{
            pushData(address,false)
        }
     
    }
    else if(split_line.length == 1){
        let opcode = opcodes.mnemonic(split_line[0].trim().toUpperCase()).code;
        pushData(opcode,true)
    }
    // console.log(line);
}


for(let [address,data,isOpcode] of program.Bytes){
    if(address == undefined || data == undefined){
        throw new Error("Invalid address or data!");
    }
    if(isOpcode){
        console.log(address.toString(16),opcodes.code(data).mnemonic);
    }
    else{
        console.log(address.toString(16),data.toString(16));
    }
}

function pushData(data:number,isOpcode:boolean){
    program.Bytes.push([current_address++,data,isOpcode])
}

function pushAddressData(address:number, data:number,isOpcode :boolean){
    program.Bytes.push([address,data,isOpcode])
}
function parseLabelAddress(addressLabel : string) : number {
    if (addressLabel in labels){
        return labels[addressLabel];
    }
    else{
        return parseInt(addressLabel)
    }
}

export function WordToBytes(word: number):{highByte : number,lowByte  : number}{
    let highByte : number = (word >> 8) & 0xFF;
    let lowByte : number  = word & 0xFF
    return {highByte,lowByte};
}

export function BytesToWord(highByte : number, lowByte : number) : number{
    let word : number = (highByte << 8) | lowByte
    return word
}
  

export default program