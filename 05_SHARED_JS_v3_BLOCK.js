/* ===== PW-SHARED:BEGIN js v3 (copy unchanged) ===== */
/* common.js - shared by every page: storage, theme, sidebar menu, toast, modal */
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
if(LS.get('pwTheme','dark')==='light')document.body.classList.add('light');
var MENU_ALL=[
 {t:'Dashboard',f:'index.html',i:'⊞'},
 {g:'Patient Management',f:'patients.html',items:[['Appointments','appointments','📅'],['Patients','patients','🐾'],['Inpatients','inpatients','🏥']]},
 {g:'Finance & Inventory',f:'finance.html',items:[['Billing / POS','billing','🧾'],['Stock','inventory','📦'],['Expenses','expenses','💸'],['Goods Receipt','goodsreceipt','🚚']]},
 {g:'Services',f:'services.html',items:[['Available Services','all','📋'],['Consultation Fees','Consultation','🩺'],['Vaccination Fees','Vaccination','💉'],['Surgery Fees','Surgery','✂️']]},
 {g:'Communication',f:'communication.html',items:[['Reminders','reminders','🔔'],['Messaging','messaging','✉️'],['Announcements','announcements','📣'],['Q&A / FAQ','qa','❓'],['Communication History','history','🕘']]},
 {t:'Report',f:'report.html',i:'📊'},{t:'SOP',f:'sop.html',i:'📖'},{t:'Settings',f:'settings.html',i:'⚙️'}
];
/* ---- roles (v2): session is written by Settings; owner sees a short menu; staff roles may be limited by pwRolePerms ---- */
var SESSION=LS.get('pwSession',null)||{role:'admin'};
var ROLE=SESSION.role||'admin';
var PERMS=LS.get('pwRolePerms',null);
var MENU_OWNER=[
 {g:'My Pet Care',f:'patients.html',items:[['Appointments','appointments','📅'],['My Pets','patients','🐾']]},
 {g:'Services',f:'services.html',items:[['Available Services','all','📋'],['Consultation Fees','Consultation','🩺'],['Vaccination Fees','Vaccination','💉'],['Surgery Fees','Surgery','✂️']]},
 {g:'Communication',f:'communication.html',items:[['Reminders','reminders','🔔'],['Messaging','messaging','✉️'],['Announcements','announcements','📣'],['Q&A / FAQ','qa','❓'],['Communication History','history','🕘']]},
 {t:'Settings',f:'settings.html',i:'⚙️'}
];
function fileAllowed(f){var p=PERMS&&PERMS[ROLE];return !Array.isArray(p)||p.indexOf(f)>=0}
var MENU=ROLE==='owner'?MENU_OWNER:MENU_ALL.filter(function(m){return fileAllowed(m.f)});
if(ROLE==='owner')document.body.classList.add('role-owner');
(function(){var f=document.body.getAttribute('data-file')||(location.pathname.split('/').pop()||'index.html');
 var ok=MENU.some(function(m){return m.f===f});
 /* UI guard only - not real security (browser-only prototype) */
 if(!ok&&MENU.length)location.replace(MENU[0].f+(MENU[0].items?'#'+MENU[0].items[0][1]:''));})();
function curFile(){return document.body.getAttribute('data-file')||(location.pathname.split('/').pop()||'index.html')}
function navTo(f,k){ if(f===curFile()&&k&&window.showPage){showPage(k)} else location.href=f+(k?'#'+k:''); }
function buildSidebar(){
 var h='<div class="sb-logo"><div class="ico" style="background:white;padding:2px;font-size:22px;display:flex;align-items:center;justify-content:center">🐾</div><div><div class="brand">PET WORLD</div><div class="sub">Vet Clinic · Ahlone</div></div></div><div class="sb-section">';
 MENU.forEach(function(m){
  if(m.t){h+='<div class="ni" data-f="'+m.f+'" onclick="navTo(\''+m.f+'\')"><span class="ni-ico">'+m.i+'</span> '+m.t+'</div>';return;}
  var here=m.f===curFile();
  h+='<div class="sb-grp'+(here?'':' closed')+'"><div class="sb-grp-hd" onclick="toggleSbGrp(this.parentNode)"><span>'+m.g+'</span><span class="chev">▾</span></div><div class="sb-grp-body">';
  m.items.forEach(function(it){h+='<div class="ni" data-f="'+m.f+'" data-k="'+it[1]+'" onclick="navTo(\''+m.f+'\',\''+it[1]+'\')"><span class="ni-ico">'+it[2]+'</span> '+it[0]+'</div>';});
  h+='</div></div>';
 });
 document.getElementById('sb').innerHTML=h+'</div>';
 sbMark(location.hash.slice(1));
}
function sbMark(k){document.querySelectorAll('#sb .ni').forEach(function(n){var on=n.dataset.f===curFile()&&(n.dataset.k?n.dataset.k===k:true);n.classList.toggle('on',on)});}
function toggleSbGrp(g){g.classList.toggle('closed')}
function toggleSidebar(){var o=document.querySelector('.sb').classList.toggle('mob-open');document.getElementById('sbOverlay').classList.toggle('on',o)}
function closeSidebar(){document.querySelector('.sb').classList.remove('mob-open');document.getElementById('sbOverlay').classList.remove('on')}
function toggleTheme(){var l=document.body.classList.toggle('light');var b=document.getElementById('themeBtn');if(b)b.textContent=l?'🌞':'🌙';LS.set('pwTheme',l?'light':'dark')}
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.addEventListener('DOMContentLoaded',function(){buildSidebar();var b=document.getElementById('themeBtn');if(b)b.textContent=document.body.classList.contains('light')?'🌞':'🌙';});

function showToast(msg,ico){var t=document.getElementById('toast');t.innerHTML=(ico||'\u2705')+' <span>'+msg+'</span>';t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3000)}
/* ===== PW-SHARED:END js ===== */
