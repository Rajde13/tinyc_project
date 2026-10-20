/* Flow-chart canvas: stage nodes, AST graph layout, edges. */
/* ---------- canvas ---------- */
function layout(n,d,key,out,st){const ks=ch(n).map((c,i)=>layout(c,d+1,key+'.'+i,out,st));
 const x=ks.length?(ks[0].x+ks[ks.length-1].x)/2:(st.x+=SW)-SW;const o={n,key,x,y:d*68,ks};out.push(o);return o}
function draw(){RECTS=[];let ed='';
 const bez=(x1,y1,x2,y2,v)=>v?`M${x1} ${y1}C${x1} ${y1+28},${x2} ${y2-28},${x2} ${y2}`:`M${x1} ${y1}C${x1+40} ${y1},${x2-40} ${y2},${x2} ${y2}`;
 ST.forEach(([id,name,tag],i)=>{let el=PN[id];
  if(!el){el=PN[id]=document.createElement('div');el.onclick=()=>{if(moved)return;SEL=id=='src'?'lex':id;pane();draw()};$('world').appendChild(el)}
  const s=R.st[id];el.className='node '+s+(SEL==id?' sel':'');el.style.transform=`translate(${i*NG}px,0)`;
  el.innerHTML=`<small>${id=='par'?'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="3" cy="2.5" r="1.4"/><circle cx="3" cy="9.5" r="1.4"/><circle cx="9" cy="4.5" r="1.4"/><path d="M3 4v4.2M9 6c0 2.4-6 1.2-6 3"/></svg>':''}${tag}</small><h3>${name}</h3><p>${esc(sum(id))}</p>`;
  RECTS.push({x:i*NG,y:0,w:NW,h:PH,c:s});
  if(i)ed+=`<path class="e-${s}" d="${bez((i-1)*NG+NW,PH/2,i*NG,PH/2)}"/>`});
 const seen=new Set();
 if(R.par){const out=[],root=layout(R.par,0,'r',out,{x:0}),sh=2*NG+NW/2-(root.x+SW/2);
  ed+=`<path class="e-ok" d="${bez(2*NG+NW/2,PH,2*NG+NW/2,AY,1)}"/>`;
  for(const o of out){const cx=o.x+sh+SW/2,l=cx-42,t=AY+o.y;seen.add(o.key);let el=AN.get(o.key);
   if(!el){el=document.createElement('div');el.className='an';el.style.transform=`translate(${l}px,${t}px)`;AN.set(o.key,el);$('world').appendChild(el);el.offsetWidth}
   el.style.transform=`translate(${l}px,${t}px)`;const n=o.n;
   el.innerHTML=`<b>${esc(lab(n))}</b>${n.ty?`<i>${n.ty}</i>`:''}`;el.title=n.k;
   if(n.hs){el.dataset.a=n.hs[0];el.dataset.b=n.hs[1]}else{delete el.dataset.a;delete el.dataset.b}
   el.dataset.fa=n.s;el.dataset.fb=n.e;RECTS.push({x:l,y:t,w:84,h:38,c:'ok'});
   for(const k of o.ks)ed+=`<path class="e-ok" d="${bez(cx,t+38,k.x+sh+SW/2,AY+k.y,1)}"/>`}}
 for(const[k,el]of AN)if(!seen.has(k)){el.remove();AN.delete(k)}
 $('edges').innerHTML=ed;
 const xs=RECTS.flatMap(r=>[r.x,r.x+r.w]),ys=RECTS.flatMap(r=>[r.y,r.y+r.h]);
 BB={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};ap();paint()}
