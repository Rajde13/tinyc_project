/* Pan, scroll-to-zoom, fit-to-view and the mini-map. */
/* ---------- pan, zoom, minimap ---------- */
function ap(){$('world').style.transform=`translate(${V.x}px,${V.y}px) scale(${V.k})`;mini()}
function zoomAt(px,py,f){const k=Math.min(2.5,Math.max(.15,V.k*f));f=k/V.k;V.x=px-(px-V.x)*f;V.y=py-(py-V.y)*f;V.k=k;ap()}
function fit(){if(!BB)return;const r=cv.getBoundingClientRect(),k=Math.min((r.width-60)/BB.w,(r.height-60)/BB.h,1.2);V.k=k;V.x=(r.width-BB.w*k)/2-BB.x*k;V.y=(r.height-BB.h*k)/2-BB.y*k;ap()}
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0015))},{passive:false});
let dr=null;
cv.addEventListener('pointerdown',e=>{if(e.target.closest('#tools,#mm'))return;dr={x:e.clientX,y:e.clientY,vx:V.x,vy:V.y};moved=false});
addEventListener('pointermove',e=>{if(!dr)return;const dx=e.clientX-dr.x,dy=e.clientY-dr.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;if(moved){V.x=dr.vx+dx;V.y=dr.vy+dy;ap()}});
addEventListener('pointerup',()=>{dr=null;setTimeout(()=>moved=false,0)});
$('zi').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(r.width/2,r.height/2,1.25)};
$('zo').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(r.width/2,r.height/2,.8)};
$('fit').onclick=fit;
function mini(){if(!BB)return;const m=$('mm'),r=cv.getBoundingClientRect(),p=50;
 m.setAttribute('viewBox',`${BB.x-p} ${BB.y-p} ${BB.w+2*p} ${BB.h+2*p}`);
 m.innerHTML=RECTS.map(q=>`<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" class="m-${q.c}"/>`).join('')+`<rect class="vp" x="${-V.x/V.k}" y="${-V.y/V.k}" width="${r.width/V.k}" height="${r.height/V.k}"/>`}
function mmGo(e){const m=$('mm'),pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.getScreenCTM().inverse()),r=cv.getBoundingClientRect();V.x=r.width/2-pt.x*V.k;V.y=r.height/2-pt.y*V.k;ap()}
let md=false;$('mm').addEventListener('pointerdown',e=>{md=true;mmGo(e)});addEventListener('pointermove',e=>{if(md)mmGo(e)});addEventListener('pointerup',()=>md=false);
addEventListener('resize',mini);
