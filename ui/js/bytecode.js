/* Stage 5: three-address code to stack bytecode. */
function emit(ir){const bc=[],ad={},on={'+':'ADD','-':'SUB','*':'MUL','/':'DIV','%':'MOD','==':'EQ','!=':'NE','<':'LT','<=':'LE','>':'GT','>=':'GE'};
 const pu=(x,h)=>bc.push({op:typeof x=='number'?'PUSH':'LOAD',arg:x,h});
 for(const i of ir){const h=i.h;switch(i.k){
  case'lbl':ad[i.L]=bc.length;break;
  case'bin':pu(i.a,h);pu(i.b,h);bc.push({op:on[i.op],h});bc.push({op:'STORE',arg:i.d,h});break;
  case'un':pu(i.a,h);bc.push({op:i.op=='-'?'NEG':'NOT',h});bc.push({op:'STORE',arg:i.d,h});break;
  case'mov':pu(i.a,h);bc.push({op:'STORE',arg:i.d,h});break;
  case'print':pu(i.a,h);bc.push({op:'PRINT',h});break;
  case'ifz':case'ifnz':pu(i.a,h);bc.push({op:i.k=='ifz'?'JZ':'JNZ',arg:i.L,h});break;
  case'jmp':bc.push({op:'JMP',arg:i.L,h})}}
 bc.push({op:'HALT'});bc.forEach(b=>{if(b.op[0]=='J')b.arg=ad[b.arg]});return bc}
