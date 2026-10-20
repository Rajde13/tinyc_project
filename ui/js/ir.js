/* Stage 4: AST to three-address code (new stage, no Python equivalent yet). */
function gen(ast){const ir=[];let tc=0,lc=0;const T=()=>'t'+ ++tc,L=()=>'L'+ ++lc,add=o=>ir.push(o);
 const ex=n=>{const h=n.hs;
  if(n.k=='Num')return n.v;if(n.k=='Var')return n.name;
  if(n.k=='Un'){const a=ex(n.a),d=T();add({k:'un',d,op:n.op,a,h});return d}
  if(n.op=='&&'||n.op=='||'){const d=T(),end=L(),a=ex(n.l);add({k:'mov',d,a,h});add({k:n.op=='&&'?'ifz':'ifnz',a:d,L:end,h});add({k:'mov',d,a:ex(n.r),h});add({k:'lbl',L:end,h});return d}
  const a=ex(n.l),b=ex(n.r),d=T();add({k:'bin',d,a,op:n.op,b,h});return d};
 const st=n=>{const h=n.hs;switch(n.k){
  case'Let':case'Assign':add({k:'mov',d:n.name,a:ex(n.v),h});break;
  case'Print':add({k:'print',a:ex(n.v),h});break;
  case'If':{const c=ex(n.c),e=L(),en=L();add({k:'ifz',a:c,L:e,h});st(n.t);if(n.f){add({k:'jmp',L:en,h});add({k:'lbl',L:e,h});st(n.f);add({k:'lbl',L:en,h})}else add({k:'lbl',L:e,h});break}
  case'While':{const s=L(),e=L();add({k:'lbl',L:s,h});const c=ex(n.c);add({k:'ifz',a:c,L:e,h});st(n.b);add({k:'jmp',L:s,h});add({k:'lbl',L:e,h});break}
  default:n.body.forEach(st)}};
 st(ast);return ir}
const irText=i=>({bin:()=>`${i.d} = ${i.a} ${i.op} ${i.b}`,un:()=>`${i.d} = ${i.op}${i.a}`,mov:()=>`${i.d} = ${i.a}`,print:()=>`print ${i.a}`,ifz:()=>`ifFalse ${i.a} goto ${i.L}`,ifnz:()=>`ifTrue ${i.a} goto ${i.L}`,jmp:()=>`goto ${i.L}`,lbl:()=>`${i.L}:`})[i.k]();
