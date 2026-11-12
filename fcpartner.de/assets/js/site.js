(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const root=document.documentElement;
const mqReduce=matchMedia('(prefers-reduced-motion: reduce)');
let reduce=mqReduce.matches;
root.classList.add('js');
const shown=el=>el.offsetParent!==null;

/* ---------- Start: Glas-Linse ---------- */
const hero=$('#hero'), scene=$('#scene'), lens=$('#lens'), lensIn=$('#lensIn'), h1=$('#h1');
const S=1.34;
let clone=null, R=0, R0=0, k=1, hx=0, hy=0, hw=1, hh=1;
const K_POINTER=.8; /* Größe der Linse, solange sie mit der Maus geführt wird (1 = Ruhegröße) */
const pos={x:0,y:0};
let pointer=null, heroVis=false, raf=0, ready=false, firstPlace=true;

function buildLens(){
  clone=scene.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden','true');
  clone.setAttribute('inert','');
  $$('[id]',clone).forEach(n=>n.removeAttribute('id'));
  $$('[tabindex]',clone).forEach(n=>n.removeAttribute('tabindex'));
  lensIn.textContent='';
  lensIn.appendChild(clone);
}
function measure(){
  if(!clone) return;
  const sr=scene.getBoundingClientRect(), hr=h1.getBoundingClientRect();
  if(sr.width<2) return;
  clone.style.width=sr.width+'px';
  clone.style.height=sr.height+'px';
  lens.style.width='';lens.style.height='';
  R0=lens.offsetWidth/2; R=R0*k;
  lens.style.width=lens.style.height=(2*R).toFixed(1)+'px';
  hx=hr.left-sr.left; hy=hr.top-sr.top; hw=hr.width; hh=hr.height;
  if(firstPlace){pos.x=hx+hw*.6; pos.y=hy+hh*.7; firstPlace=false;}
  place();
}
function place(){
  if(!clone) return;
  lens.style.transform='translate3d('+(pos.x-R).toFixed(2)+'px,'+(pos.y-R).toFixed(2)+'px,0)';
  clone.style.transform='translate3d('+(R-pos.x*S).toFixed(2)+'px,'+(R-pos.y*S).toFixed(2)+'px,0) scale('+S+')';
}
function frame(t){
  raf=0;
  if(!ready||!shown(hero)) return;
  let tx=pos.x, ty=pos.y, moving=true;
  if(pointer){ tx=pointer.x; ty=pointer.y; }
  else if(!reduce){
    const hp=clamp(-hero.getBoundingClientRect().top/Math.max(1,hero.offsetHeight));
    tx=hx+hw*(.08+.66*(.5+.5*Math.sin(t*.00033+1.1)))+hp*hw*.1;
    ty=hy+hh*(.52+.3*Math.sin(t*.00049+.4));
  } else moving=false;
  if(!reduce){
    hero.style.setProperty('--a',Math.sin(t*.00021).toFixed(4));
    hero.style.setProperty('--b',Math.cos(t*.00017).toFixed(4));
  }
  const kt=pointer?K_POINTER:1;
  k+=(kt-k)*.14; if(Math.abs(kt-k)<.003) k=kt;
  R=R0*k; lens.style.width=lens.style.height=(2*R).toFixed(1)+'px';
  pos.x+=(tx-pos.x)*.12; pos.y+=(ty-pos.y)*.12;
  place();
  if(heroVis && (moving || pointer || k!==kt)) raf=requestAnimationFrame(frame);
}
function kick(){ if(!raf && ready && heroVis) raf=requestAnimationFrame(frame); }

if(hero&&scene&&lens&&lensIn&&h1){
buildLens();
hero.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch') return;
  const sr=scene.getBoundingClientRect();
  pointer={x:e.clientX-sr.left,y:e.clientY-sr.top};
  kick();
});
hero.addEventListener('pointerleave',()=>{pointer=null;kick();});
new IntersectionObserver(es=>{heroVis=es[0].isIntersecting;if(heroVis)kick();},{threshold:0}).observe(hero);

function startLens(){
  ready=true;
  measure();
  if(clone && scene.getBoundingClientRect().width>1) lens.classList.add('ready');
  kick();
}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(startLens);} else {startLens();}
}

/* ---------- Für wen: wachsender Glaskörper ---------- */
const sizes=$('#sizes'), sStage=$('#sizesStage'), card=$('#sizeCard');
const rings=sStage?$$('.ring',sStage):[], panes=card?$$('.size-pane',card):[], snBtns=sStage?$$('.sn-btn',sStage):[];
const SN=panes.length;
let D={minW:300,maxW:900,minH:170,maxH:420};
function layoutSizes(){
  if(!sStage||!shown(sStage)) return;
  const cw=Math.min(sStage.clientWidth-32,1040);
  D.maxW=cw; D.minW=Math.min(300,cw*.82);
  D.maxH=Math.min(sStage.clientHeight*.5,480);
  D.minH=innerWidth<700?200:170;
  rings.forEach((r,i)=>{
    const f=i/(SN-1);
    r.style.width=lerp(D.minW,D.maxW,f).toFixed(1)+'px';
    r.style.height=lerp(D.minH,D.maxH,f).toFixed(1)+'px';
    r.style.borderRadius=lerp(26,46,f).toFixed(1)+'px';
  });
}
let lastIdx=-1;
function updateSizes(){
  if(!sizes||mqReduce.matches||!shown(sizes)) return;
  const rect=sizes.getBoundingClientRect();
  const total=Math.max(1,sizes.offsetHeight-sStage.offsetHeight);
  const p=clamp(-rect.top/total);
  const raw=p*(SN-1), fl=Math.min(SN-2,Math.floor(raw));
  const s=fl+smooth(raw-fl);
  const f=s/(SN-1);
  card.style.width=lerp(D.minW,D.maxW,f).toFixed(1)+'px';
  card.style.height=lerp(D.minH,D.maxH,f).toFixed(1)+'px';
  card.style.borderRadius=lerp(26,46,f).toFixed(1)+'px';
  card.style.setProperty('--g',f.toFixed(3));
  sStage.style.setProperty('--p',p.toFixed(3));
  const idx=Math.round(s);
  if(idx!==lastIdx){
    lastIdx=idx;
    panes.forEach((el,i)=>el.classList.toggle('on',i===idx));
    rings.forEach((r,i)=>{r.classList.toggle('cur',i===idx);r.classList.toggle('passed',i<idx);});
    snBtns.forEach((b,i)=>{b.classList.toggle('cur',i===idx);if(i===idx)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
  }
}
/* Anklicken: scrollt weich zur Stelle, an der die Größe voll zu sehen ist */
function goSize(k){
  if(!sizes||mqReduce.matches||!shown(sizes)) return;
  const total=Math.max(1,sizes.offsetHeight-sStage.offsetHeight);
  const top=sizes.getBoundingClientRect().top+scrollY;
  scrollTo({top:Math.round(top+total*k/(SN-1)),behavior:'smooth'});
}
(sStage?$$('[data-k]',sStage):[]).forEach(b=>b.addEventListener('click',()=>goSize(+b.dataset.k)));

/* ---------- Für wen: drei Fragen, die Zeile in der Mitte leuchtet ---------- */
const asks=$$('#asksList li');
function updateAsks(){
  if(!asks.length||!shown(asks[0])) return;
  if(mqReduce.matches){asks.forEach(l=>l.style.removeProperty('--o'));return;}
  const mid=innerHeight*.55;
  asks.forEach(l=>{
    const r=l.getBoundingClientRect(), d=Math.abs((r.top+r.height/2)-mid)/(innerHeight*.5);
    l.style.setProperty('--o',clamp(1.12-d*.85,.28,1).toFixed(3));
  });
}

/* ---------- Leistungen ---------- */
const svc=$('#svc'), svcStage=$('#svcStage'), items=svc?$$('.svc-item',svc):[], panel=$('#svcPanel'), sOrbs=svc?$$('.svc-orb',svc):[];
const panels=items.map(it=>{const p=document.createElement('p');p.className='svc-pane';p.textContent=$('.svc-d',it).textContent;panel.appendChild(p);return p;});
const mqSvc=matchMedia('(min-width:900px) and (min-height:720px) and (prefers-reduced-motion:no-preference)');
let svcIdx=-1;
const svcBtns=svc?$$('.svc-btn',svc):[];
function syncSvcBtns(){svcBtns.forEach(b=>{b.disabled=!mqSvc.matches;});}
syncSvcBtns();
mqSvc.addEventListener&&mqSvc.addEventListener('change',syncSvcBtns);
/* Anklicken: scrollt weich zur Stelle, an der der Eintrag hervorgehoben ist */
svcBtns.forEach((b,i)=>b.addEventListener('click',()=>{
  if(!mqSvc.matches||!shown(svc)) return;
  const total=Math.max(1,svc.offsetHeight-svcStage.offsetHeight);
  const top=svc.getBoundingClientRect().top+scrollY;
  scrollTo({top:Math.round(top+total*(i+.5)/items.length),behavior:'smooth'});
}));
function updateSvc(){
  if(!svc||!shown(svc)) return;
  if(!mqSvc.matches){ items.forEach(it=>it.style.removeProperty('--o')); svcIdx=-1; return; }
  const rect=svc.getBoundingClientRect();
  const total=Math.max(1,svc.offsetHeight-svcStage.offsetHeight);
  const p=clamp(-rect.top/total), n=items.length;
  const s=p*n-.5;
  items.forEach((it,i)=>it.style.setProperty('--o',clamp(1-Math.abs(i-s)*.5,.16,1).toFixed(3)));
  const idx=clamp(Math.floor(p*n),0,n-1);
  if(idx!==svcIdx){
    svcIdx=idx;
    panels.forEach((el,i)=>el.classList.toggle('on',i===idx));
    sOrbs.forEach((o,k)=>{
      const x=Math.sin(idx*1.7+k*2.1)*34, y=Math.cos(idx*2.3+k*1.3)*28, sc=.86+((idx+k)%4)*.1;
      o.style.transform='translate('+x.toFixed(1)+'%,'+y.toFixed(1)+'%) scale('+sc.toFixed(2)+')';
    });
  }
}

/* ---------- Navigation: Ton nach Untergrund, Anhebung am Seitenanfang ---------- */
const nav=$('#nav');
let menuOpen=false;
function updateNav(){
  nav.style.setProperty('--t',clamp(scrollY/120).toFixed(3));
  const y=nav.getBoundingClientRect().top+30;
  const dark=menuOpen||$$('[data-tone="dark"]').some(s=>{if(!shown(s))return false;const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>=y;});
  nav.classList.toggle('dark',dark);
}

/* ---------- Menü (Handy) ---------- */
const menuBtn=$('#menuBtn'), menu=$('#menu');
function setMenu(o){
  menuOpen=o;
  menu.hidden=!o;
  menuBtn.setAttribute('aria-expanded',o?'true':'false');
  menuBtn.textContent=o?'Schließen':'Menü';
  root.classList.toggle('menu-open',o);
  updateNav();
}
menuBtn.addEventListener('click',()=>setMenu(!menuOpen));
addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen){setMenu(false);menuBtn.focus();}});
matchMedia('(min-width:860px)').addEventListener('change',e=>{if(e.matches&&menuOpen)setMenu(false);});

/* ---------- Seiten: eigene Adressen (live) oder Adress-Kürzel (Vorschau) ---------- */
const MULTI=document.body.hasAttribute('data-page');
const pages=$$('.page'), byName={};
pages.forEach(p=>{byName[p.dataset.page]=p;});
const footCta=$('#footCta');
let cur='';
function route(first){
  let h=''; try{h=decodeURIComponent(location.hash.slice(1)).toLowerCase();}catch(_){}
  if(!byName[h]) h='start';
  if(h===cur) return;
  cur=h;
  pages.forEach(p=>{p.hidden=p.dataset.page!==h;});
  root.dataset.top=byName[h].dataset.top;
  document.title=byName[h].dataset.title;
  footCta.hidden=(h==='kontakt');
  $('#foot').classList.toggle('plain',h==='kontakt');
  $$('[data-nav]').forEach(a=>{if(a.dataset.nav===h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(menuOpen) setMenu(false);
  scrollTo(0,0);
  lastIdx=-1; svcIdx=-1;
  layoutSizes(); measure();
  update();
  if(!first){const hd=$('h1',byName[h]);if(hd)hd.focus({preventScroll:true});}
}
function initMulti(){
  cur=document.body.dataset.page;
  $$('[data-nav]').forEach(a=>{if(a.dataset.nav===cur)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  layoutSizes(); measure(); update();
}
if(!MULTI) addEventListener('hashchange',()=>route(false));
/* erneuter Klick auf die aktuelle Seite: nach oben */
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest(MULTI?'a[href]':'a[href^="#"]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button) return;
  const href=a.getAttribute('href');
  const same=MULTI?(href===location.pathname||href==='.'):(href.slice(1)===cur);
  if(same){e.preventDefault();if(menuOpen)setMenu(false);scrollTo({top:0,behavior:reduce?'auto':'smooth'});}
});

/* ---------- Takt ---------- */
let tick=false;
function update(){
  if(hero) hero.style.setProperty('--sy',Math.round(scrollY));
  updateSizes(); updateSvc(); updateAsks(); updateNav();
}
function request(){ if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;update();});} }
addEventListener('scroll',request,{passive:true});
addEventListener('resize',()=>{measure();layoutSizes();lastIdx=-1;svcIdx=-1;request();});
mqReduce.addEventListener&&mqReduce.addEventListener('change',e=>{reduce=e.matches;lastIdx=-1;request();kick();});

/* ---------- Glanzlicht folgt dem Zeiger ---------- */
document.addEventListener('pointermove',e=>{
  const g=e.target.closest&&e.target.closest('.glass');
  if(!g) return;
  const r=g.getBoundingClientRect();
  g.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
  g.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
},{passive:true});

/* ---------- Formular (Vorschau: sendet nichts; live: data-live, sendet an das Skript) ---------- */
const form=$('#form'), status=$('#formStatus');
if(form){
  const t0=Date.now();
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.checkValidity()){status.textContent='Bitte füllen Sie alle Felder aus und bestätigen Sie den Hinweis.';form.reportValidity();return;}
    if(!form.hasAttribute('data-live')){status.textContent='Vorschau: Hier wurde nichts gesendet. In der Live-Version geht die Anfrage an uns.';return;}
    const btn=form.querySelector('button[type="submit"]');
    const fd=new FormData(form); fd.append('dauer',String(Date.now()-t0));
    btn.disabled=true; status.textContent='Wird gesendet …';
    fetch(form.getAttribute('action'),{method:'POST',body:fd,headers:{'Accept':'application/json'}})
      .then(r=>r.json().then(j=>({ok:r.ok&&j&&j.ok,msg:j&&j.message}),()=>({ok:false,msg:''})))
      .then(res=>{
        if(res.ok){form.reset();status.textContent=res.msg||'Danke, wir haben Ihre Anfrage erhalten und melden uns bei Ihnen.';}
        else status.textContent=res.msg||'Das hat leider nicht geklappt. Bitte versuchen Sie es später noch einmal.';
      })
      .catch(()=>{status.textContent='Keine Verbindung. Bitte versuchen Sie es später noch einmal.';})
      .then(()=>{btn.disabled=false;});
  });
}

/* ---------- Rechtstexte: Dialog. Live wird der Text aus der eigenen Seite (/impressum/, /datenschutz/) geladen ---------- */
const dlg=$('#dlg'), dlgTitle=$('#dlgTitle'), dlgBody=$('#dlgBody');
const titles={impressum:'Impressum',datenschutz:'Datenschutzerklärung'};
function openDlg(name){
  dlgTitle.textContent=titles[name]||'';
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
}
$$('[data-dlg]').forEach(b=>b.addEventListener('click',e=>{
  const name=b.dataset.dlg;
  if(MULTI&&cur===name) return; /* auf der Seite selbst: normaler Link */
  e.preventDefault();
  if(!MULTI){openDlg(name);return;}
  fetch(b.getAttribute('href'),{credentials:'same-origin'})
    .then(r=>{if(!r.ok)throw 0;return r.text();})
    .then(t=>{
      const src=new DOMParser().parseFromString(t,'text/html').querySelector('.legal-body');
      if(!src)throw 0;
      dlgBody.innerHTML=src.innerHTML; openDlg(name);
    })
    .catch(()=>{location.href=b.getAttribute('href');});
}));
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});

if(MULTI) initMulti(); else route(true);
})();
