/* Shared helpers: DOM shortcut, HTML escaping, and the compiler error type. */
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
class E{constructor(m,s,e){this.m=m;this.s=s;this.e=e}}
