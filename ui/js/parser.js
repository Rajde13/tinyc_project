/* Stage 2: syntax analysis (recursive descent). Mirrors tinyc/parser.py. */
function parse(T){let p=0;const pk=()=>T[p],nx=()=>T[p++],fd=k=>k.t=='EOF'?'end of input':`'${k.v}'`;
 const want=(t,w)=>{const k=pk();if(k.t!=t)throw new E(`expected ${w} but found ${fd(k)}`,k.s,k.e);return nx()};
 const bin=(sub,ops)=>()=>{let l=sub();while(ops.includes(pk().t)){const o=nx(),r=sub();l={k:'Bin',op:o.t,l,r,s:l.s,e:r.e,hs:[o.s,o.e]}}return l};
 const un=()=>{const k=pk();if(k.t=='-'||k.t=='!'){nx();const a=un();return{k:'Un',op:k.t,a,s:k.s,e:a.e,hs:[k.s,k.e]}}return pr()};
 function pr(){const k=pk();
  if(k.t=='NUM'){nx();return{k:'Num',v:k.v,s:k.s,e:k.e,hs:[k.s,k.e]}}
  if(k.t=='ID'){nx();return{k:'Var',name:k.v,s:k.s,e:k.e,hs:[k.s,k.e]}}
  if(k.t=='('){nx();const x=expr();want(')',"')'");return x}
  throw new E(`expected an expression but found ${fd(k)}`,k.s,k.e)}
 const expr=bin(bin(bin(bin(bin(bin(un,['*','/','%']),['+','-']),['<','<=','>','>=']),['==','!=']),['&&']),['||']);
 const blk=()=>{const o=want('{',"'{'"),body=[];while(pk().t!='}'&&pk().t!='EOF')body.push(stmt());const c=want('}',"'}'");return{k:'Block',body,s:o.s,e:c.e,hs:[o.s,o.e]}};
 const cnd=()=>{want('(',"'('");const c=expr();want(')',"')'");return c};
 function ifs(){const k=nx(),c=cnd(),t=blk();let f=null;if(pk().t=='else'){nx();f=pk().t=='if'?ifs():blk()}return{k:'If',c,t,f,s:k.s,e:(f||t).e,hs:[k.s,k.e]}}
 function stmt(){const k=pk();
  if(k.t=='let'){nx();const n=want('ID','a variable name');want('=',"'='");const v=expr(),z=want(';',"';'");return{k:'Let',name:n.v,v,s:k.s,e:z.e,hs:[n.s,n.e]}}
  if(k.t=='print'){nx();const v=expr(),z=want(';',"';'");return{k:'Print',v,s:k.s,e:z.e,hs:[k.s,k.e]}}
  if(k.t=='if')return ifs();
  if(k.t=='while'){nx();const c=cnd(),b=blk();return{k:'While',c,b,s:k.s,e:b.e,hs:[k.s,k.e]}}
  if(k.t=='{')return blk();
  if(k.t=='ID'&&T[p+1].t=='='){nx();nx();const v=expr(),z=want(';',"';'");return{k:'Assign',name:k.v,v,s:k.s,e:z.e,hs:[k.s,k.e]}}
  throw new E(`expected a statement but found ${fd(k)}`,k.s,k.e)}
 const body=[];while(pk().t!='EOF')body.push(stmt());
 return{k:'Program',body,s:0,e:T[T.length-1].e}}
