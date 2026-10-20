/* Bidirectional highlighting between source, graph and inspector. */
/* ---------- highlighting ---------- */
function paint(){const F=hov||pin;
 document.querySelectorAll('[data-a]').forEach(el=>el.classList.toggle('hl',!!F&&+el.dataset.a>=F[0]&&+el.dataset.b<=F[1]));
 const rg=[];if(R.err){let a=R.err.s,b=R.err.e;if(b<=a){a=Math.max(0,a-1);b=a+1}rg.push([a,b,'er'])}
 if(F&&F[1]>F[0])rg.push([F[0],F[1],'m']);rg.sort((x,y)=>x[0]-y[0]);
 let o='',i=0;for(const[a,b,c]of rg){if(a<i)continue;o+=esc(SRC.slice(i,a))+`<span class="${c}">${esc(SRC.slice(a,b))}</span>`;i=b}
 $('mir').innerHTML=o+esc(SRC.slice(i))+' '}
document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-fa]');const n=t?[+t.dataset.fa,+t.dataset.fb]:null;if(String(n)!=String(hov)){hov=n;paint()}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-fa]');if(t&&!moved){pin=[+t.dataset.fa,+t.dataset.fb];paint()}});
$('tabs').onclick=e=>{const b=e.target.closest('[data-t]');if(b){SEL=b.dataset.t;pane();draw()}};
const caret=()=>{const p=$('src').selectionStart,T=(R.lex||[]).filter(t=>t.t!='EOF'),t=T.find(t=>p>=t.s&&p<t.e)||T.find(t=>p==t.e);pin=t?[t.s,t.e]:null;paint()};
$('src').addEventListener('click',caret);$('src').addEventListener('keyup',e=>{if(e.key.startsWith('Arrow'))caret()});
$('src').addEventListener('input',compile);
$('src').addEventListener('scroll',()=>{const s=$('src'),m=$('mir');m.scrollTop=s.scrollTop;m.scrollLeft=s.scrollLeft;$('gut').scrollTop=s.scrollTop});
