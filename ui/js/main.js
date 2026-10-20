/* Startup: populate examples and run the first compile. */
/* ---------- init ---------- */
$('ex').innerHTML=Object.keys(EX).map(k=>`<option>${k}</option>`).join('');
$('ex').onchange=()=>{$('src').value=EX[$('ex').value];compile();fit()};
$('src').value=EX['Loop and branch'];compile();fit();
