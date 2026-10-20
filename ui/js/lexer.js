/* Stage 1: lexical analysis. Mirrors tinyc/lexer.py. */
const KW=['let','print','if','else','while'],P2=['==','!=','<=','>=','&&','||'],P1='+-*/%<>=!(){};';
function lex(src){const T=[];let i=0,n=src.length;
 while(i<n){const c=src[i];
  if(/\s/.test(c)){i++;continue}
  if(src.startsWith('//',i)){while(i<n&&src[i]!='\n')i++;continue}
  if(/\d/.test(c)){let j=i;while(/\d/.test(src[j]||''))j++;T.push({t:'NUM',v:+src.slice(i,j),s:i,e:j});i=j;continue}
  if(/[A-Za-z_]/.test(c)){let j=i;while(/\w/.test(src[j]||''))j++;const w=src.slice(i,j);T.push({t:KW.includes(w)?w:'ID',v:w,s:i,e:j});i=j;continue}
  const d=src.slice(i,i+2);
  if(P2.includes(d)){T.push({t:d,v:d,s:i,e:i+2});i+=2;continue}
  if(P1.includes(c)){T.push({t:c,v:c,s:i,e:i+1});i++;continue}
  throw new E(`unexpected character '${c}'`,i,i+1)}
 T.push({t:'EOF',v:'',s:n,e:n});return T}
