/* Stage 3: semantic analysis with int/bool type checking. Extends tinyc/semantic.py. */
function sema(ast){const env={},syms=[],ar='+-*/%',cm=['<','<=','>','>='];
 const er=(m,n)=>new E(m,n.hs[0],n.hs[1]);
 const T=n=>{switch(n.k){
  case'Num':return n.ty='int';
  case'Var':if(!env[n.name])throw er(`undefined variable '${n.name}'`,n);return n.ty=env[n.name].ty;
  case'Un':{const t=T(n.a);if(n.op=='-'&&t!='int')throw er(`unary '-' needs int, got ${t}`,n);return n.ty=n.op=='-'?'int':'bool'}
  case'Bin':{const a=T(n.l),b=T(n.r),o=n.op,isA=ar.includes(o);
   if(isA||cm.includes(o)){if(a!='int'||b!='int')throw er(`operator '${o}' needs int operands, got ${a} and ${b}`,n);return n.ty=isA?'int':'bool'}
   if(o=='=='||o=='!='){if(a!=b)throw er(`cannot compare ${a} with ${b}`,n);return n.ty='bool'}
   return n.ty='bool'}}};
 const S=n=>{switch(n.k){
  case'Let':{const t=T(n.v);if(env[n.name])throw er(`'${n.name}' is already declared`,n);env[n.name]={ty:t};syms.push({name:n.name,ty:t,at:n.hs});break}
  case'Assign':{if(!env[n.name])throw er(`assignment to undeclared variable '${n.name}'`,n);const t=T(n.v);if(t!=env[n.name].ty)throw er(`cannot assign ${t} to ${env[n.name].ty} variable '${n.name}'`,n);break}
  case'Print':T(n.v);break;
  case'If':T(n.c);S(n.t);if(n.f)S(n.f);break;
  case'While':T(n.c);S(n.b);break;
  default:n.body.forEach(S)}};
 S(ast);return syms}
