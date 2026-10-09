'use strict';
const $=s=>document.querySelector(s);
const signs=[['Овен','♈','21 марта — 19 апреля',0],['Телец','♉','20 апреля — 20 мая',1],['Близнецы','♊','21 мая — 20 июня',2],['Рак','♋','21 июня — 22 июля',3],['Лев','♌','23 июля — 22 августа',0],['Дева','♍','23 августа — 22 сентября',1],['Весы','♎','23 сентября — 22 октября',2],['Скорпион','♏','23 октября — 21 ноября',3],['Стрелец','♐','22 ноября — 21 декабря',0],['Козерог','♑','22 декабря — 19 января',1],['Водолей','♒','20 января — 18 февраля',2],['Рыбы','♓','19 февраля — 20 марта',3]];
signs.forEach(s=>s[1]+='\uFE0E');
const signAssets=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const zodiacImage=i=>`assets/zodiac/zodiacSilver_${signAssets[i]}.png`;
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},remove(k){try{localStorage.removeItem(k)}catch{}}};
let saved=store.get('selena-sign'), selected=saved!==null&&/^\d+$/.test(saved)&&+saved<12?+saved:6,topic=0,day;
let readingLanguage=store.get('eos-reading-language')||'ru';if(!['ru','en','es'].includes(readingLanguage))readingLanguage='ru';
let chosenDate=null;
let savedReadings=[];try{savedReadings=JSON.parse(store.get('eos-saved-readings')||'[]')}catch{}if(!Array.isArray(savedReadings))savedReadings=[];
savedReadings=savedReadings.filter(x=>x&&Number.isInteger(x.sign)&&x.sign>=0&&x.sign<12&&Number.isInteger(x.topic)&&x.topic>=0&&x.topic<4&&['ru','en','es'].includes(x.lang)&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&!isNaN(Date.parse(x.date)));
const isoDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const activeDate=()=>chosenDate?new Date(chosenDate+'T12:00:00'):new Date();
const colors=[['Песочный','#cdb48a'],['Шалфей','#9ba890'],['Лавандовый','#afa2c7'],['Небесный','#87a9c2'],['Жемчужный','#ddd6ca'],['Терракота','#b77a62']];
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function dateKey(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}

// Matches the supplied iOS app's Gregorian day indexing, including leap-year wrap.
function projectDay(date){return Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(date.getFullYear(),0,1))/86400000)}
function projectRotation(date,index){const ordinal=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)+719163;return (ordinal*151+index*31)%window.EOS_CONTENT.work.length}
function projectForecast(date,index,theme){const content=window.EOS_LIBRARY[readingLanguage],key=signAssets[index];if(theme===2||theme===3)return content[theme===2?'work':'advice'][projectRotation(date,index)];const texts=content[theme===1?'love':'daily'][key];return texts[projectDay(date)%texts.length]}
function shortForecast(text){const sentences=text.match(/[^.!?]+[.!?]+(?:[»”"])?|[^.!?]+$/g)||[text];let short=sentences.slice(0,2).join('').trim();if(short.length>300){short=short.slice(0,297).replace(/\s+\S*$/,'')+'…'}return short}

function render(){const s=signs[selected],n=hash(day+':'+selected);$('#selected-name').textContent=s[0];$('#selected-icon').innerHTML=`<img src="${zodiacImage(selected)}" alt="">`;$('#selected-dates').textContent=s[2];$('#forecast-text').textContent=projectForecast(activeDate(),selected,topic);$('#today').textContent=new Intl.DateTimeFormat('ru',{day:'numeric',month:'long',year:'numeric'}).format(activeDate());$('#reading-date').value=isoDate(activeDate());$('#reading-language').value=readingLanguage;renderSavedReadings();$('#intention').textContent=window.EOS_CONTENT.advice[projectRotation(new Date(),selected)];$('#color-name').textContent=colors[n%6][0];$('#color-dot').style.background=colors[n%6][1];const fav=store.get('selena-sign')===String(selected);$('#favorite').textContent=fav?'★':'☆';$('#favorite').setAttribute('aria-pressed',fav);document.querySelectorAll('.zodiac button').forEach((b,i)=>b.setAttribute('aria-pressed',i===selected));document.querySelectorAll('[data-topic]').forEach((b,i)=>{b.classList.toggle('selected',i===topic);b.setAttribute('aria-pressed',i===topic)})}
signs.forEach((s,i)=>{const a=(i*30-90)*Math.PI/180,b=document.createElement('button');b.style.setProperty('--x',50+40*Math.cos(a));b.style.setProperty('--y',50+40*Math.sin(a));b.innerHTML=`<img src="${zodiacImage(i)}" alt="" draggable="false"><small>${s[0]}</small>`;b.setAttribute('aria-label',`Гороскоп: ${s[0]}`);b.onclick=()=>{selected=i;render()};$('#zodiac').append(b);for(const id of ['#sign-a','#sign-b']){const o=document.createElement('option');o.value=i;o.textContent=s[1]+' '+s[0];$(id).append(o)}});
document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{topic=+b.dataset.topic;render()});
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
$('#favorite').onclick=()=>{if(store.get('selena-sign')===String(selected)){store.remove('selena-sign');toast('Знак убран из избранного')}else toast(store.set('selena-sign',selected)?'Твой знак сохранён на этом устройстве':'Браузер не разрешает сохранение');render()};
$('#motion').onclick=()=>{const paused=$('#wheel').classList.toggle('paused');$('#motion').textContent=paused?'▷ Продолжить вращение':'Ⅱ Приостановить вращение';$('#motion').setAttribute('aria-pressed',paused)};
function modal(title,body){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;$('#info').showModal()}
$('.close').onclick=()=>$('#info').close();$('#info').addEventListener('click',e=>{if(e.target===$('#info')&&e.offsetX>=0&&e.offsetY>=0){const r=$('#info').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#info').close()}});
$('#share').onclick=async()=>{const text=`Eos · ${signs[selected][1]} ${signs[selected][0]} · ${$('#today').textContent}\n${$('#forecast-text').textContent}`;try{if(navigator.share){await navigator.share({title:'Eos',text})}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);toast('Гороскоп скопирован')}else{modal('Твой гороскоп','<p id="copy-text"></p><p>Выдели текст и скопируй его.</p>');$('#copy-text').textContent=text}}catch(e){if(e.name!=='AbortError')toast('Не удалось поделиться. Попробуй ещё раз.')}};
function updateDay(){const d=new Date();day=dateKey();$('#today').textContent=new Intl.DateTimeFormat('ru',{day:'numeric',month:'long',year:'numeric'}).format(d);$('#year').textContent=d.getFullYear();const cycle=29.530588853,age=(((d.getTime()-Date.UTC(2000,0,6,18,14))/86400000)%cycle+cycle)%cycle,p=age/cycle,illum=Math.round((1-Math.cos(2*Math.PI*p))*50);window.EOS_PHASE=p;if(window.__eosPhase)window.__eosPhase(p);const names=['Новолуние','Растущий серп','Первая четверть','Растущая Луна','Полнолуние','Убывающая Луна','Последняя четверть','Убывающий серп'];const name=names[Math.floor(p*8+.5)%8];$('#moon-name').textContent=name;$('#moon-short').textContent=name;$('#moon-detail').textContent=`Освещённость ≈ ${illum}% · расчётная фаза`;$('#intention').textContent=['Выбирать то, что откликается','Быть внимательнее к себе','Оставлять место для нового','Двигаться в своём темпе','Замечать простые радости','Говорить о важном','Доверять маленьким шагам'][hash(day)%7];render()}
updateDay();setInterval(()=>{if(dateKey()!==day)updateDay()},30000);
$('#sign-a').value=selected;$('#sign-b').value=4;
function compatibility(){const ai=+$('#sign-a').value,bi=+$('#sign-b').value;$('#compat-pair').innerHTML=[ai,bi].map(i=>`<span><img src="${zodiacImage(i)}" alt="">${signs[i][0]}</span>`).join('<b>✧</b>');const a=signs[+$('#sign-a').value],b=signs[+$('#sign-b').value],x=a[3],y=b[3];let t;if(x===y)t='Вы говорите на языке одной стихии: понять привычный ритм друг друга может быть проще. Оставляйте место и для различий.';else if((x===0&&y===2)||(x===2&&y===0))t='Огонь и Воздух: идеи встречаются с энергией. Пробуйте новое вместе, но не забывайте договариваться о повседневных мелочах.';else if((x===1&&y===3)||(x===3&&y===1))t='Земля и Вода: забота встречается с устойчивостью. Ваш маленький ритуал может стать хорошей опорой для близости.';else t='Разные стихии — разные способы чувствовать. Вместо догадок спрашивайте, какая поддержка нужна каждому из вас.';$('#compat-result').textContent=t}
$('#sign-a').onchange=$('#sign-b').onchange=compatibility;compatibility();
const ru=[['Луна','Moon','Обычная луна в ясном небе связана у Миллера с успехом в любви и делах. Молодая луна — с достатком и гармоничным союзом.'],['Вода','Water','Чистая вода символизирует радость и благополучие; мутная — тревоги. Пить прозрачную освежающую воду — к исполнению надежд.'],['Звёзды','Stars','Яркие, ясные звёзды связаны с благополучием. Тусклые или красные — с трудностями, а появляющиеся и исчезающие — с необычными переменами.'],['Солнце','Sun','Ясный восход означает радостные события. Солнце сквозь облака — ослабление трудностей; закат напоминает внимательнее отнестись к своим делам.'],['Радуга','Rainbow','Радуга означает обнадёживающий поворот дел. Для влюблённых это счастливый образ; над зелёными деревьями она символизирует успех начинаний.'],['Дом','House','Строить дом — к разумным переменам. Красивый дом связан с улучшением обстоятельств, старый и ветхий — с затруднениями.'],['Лес','Forest','Величественные зелёные деревья означают благополучие и радость. Потеряться в густом лесу — образ сложностей и разногласий.'],['Сад','Garden','Цветущий вечнозелёный сад символизирует душевный покой. Прогулка в нём с любимым человеком связана со счастьем и достатком.'],['Мост','Bridge','Благополучно перейти мост — преодолеть трудности. Ветхий мост, уходящий в темноту, связан с печалью и разочарованием.'],['Бабочка','Butterfly','Бабочка среди цветов и зелёной травы — образ благополучия. Летающие бабочки связаны с вестями от далёких друзей.'],['Птицы','Birds','Красивое оперение — благоприятный образ. Летящие птицы символизируют улучшение обстоятельств и уход неприятностей.'],['Дождь','Rain','Прозрачный дождь связан с радостью. Стук дождя по крыше — с домашним уютом; дождь из мрачных облаков — с беспокойством о делах.'],['Снег','Snow','Таяние снега означает, что опасения сменятся радостью. Солнце над снежным пейзажем связано с преодолением неблагоприятных обстоятельств.'],['Гора','Mountain','Подъём по приятной зелёной дороге символизирует продвижение. Трудный путь, на котором не удаётся достичь вершины, связан с препятствиями.'],['Море','Sea','Море у Миллера связано с неисполненными ожиданиями. Быстрое плавание с любимым человеком — с осуществлением романтических надежд.'],['Полёт','Flying','Полёт над зелёными деревьями связан с временными затруднениями и последующим улучшением. Видеть солнце во время полёта — образ напрасных тревог.']];
function normalized(s){return s.toLocaleLowerCase('ru').replaceAll('ё','е').trim()}
function dreams(){const q=normalized($('#dream-search').value),all=$('#english').checked;const data=all?window.MILLER.map(x=>[x.title,x.title,x.text]):ru;const found=data.filter(x=>normalized(x[0]+' '+x[1]).includes(q)).sort((a,b)=>Number(normalized(b[0])===q)-Number(normalized(a[0])===q));$('#dream-count').textContent=`${all?'Оригинал':'Русские пересказы'} · ${found.length} ${q?'найдено':'статей'}`;$('#dream-results').replaceChildren();found.slice(0,q?40:3).forEach((x,i)=>{const det=document.createElement('details');det.className='dream-result';det.open=i===0;const sum=document.createElement('summary');sum.textContent=x[0];const p=document.createElement('p');p.textContent=x[2];det.append(sum,p);if(!all){const b=document.createElement('button');b.className='text-btn';b.textContent='Читать полный оригинал ↗';b.onclick=()=>{$('#english').checked=true;$('#dream-search').value=x[1];dreams()};det.append(b)}$('#dream-results').append(det)});if(!found.length){const p=document.createElement('p');p.className='muted';p.textContent=all?'Ничего не найдено. Попробуй другое английское слово.':'В русской подборке нет этого образа. Включи весь оригинал и введи название на английском.';$('#dream-results').append(p)}if(found.length>(q?40:3)){const p=document.createElement('p');p.className='micro';p.textContent='Введи название образа, чтобы сузить поиск.';$('#dream-results').append(p)}}
$('#dream-search').oninput=dreams;$('#english').onchange=dreams;document.querySelectorAll('#dream-chips button').forEach(b=>b.onclick=()=>{$('#english').checked=false;$('#dream-search').value=b.textContent;dreams()});dreams();
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});window.addEventListener('appinstalled',()=>toast('Eos установлена'));
$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return}modal('Eos на твоём экране',`<p><b>iPhone / iPad:</b> открой сайт в Safari, нажми «Поделиться», затем «На экран Домой».</p><p><b>Android:</b> в меню Chrome выбери «Добавить на главный экран» или «Установить приложение».</p><p><b>Компьютер:</b> используй значок установки в адресной строке Chrome или Edge, если он доступен.</p><p>Установка работает после размещения сайта на HTTPS. При открытии файла с компьютера доступен сам сайт; отдельного APK или приложения в магазине нет.</p>`)};
$('#about').onclick=()=>modal('О Eos','<p>Eos — маленький ежедневный ритуал. Тексты взяты из вашего приложения Horoscope 10: общие и любовные — из годовых наборов для каждого знака, работа и советы — из тематических банков. На сайте показаны полные исходные записи. Доступны календарь, три языка прогнозов и сохранённое. Eos — единый сайт, который можно установить на главный экран телефона. Это ознакомительные тексты, не персональный астрологический расчёт.</p><p>Фаза Луны рассчитывается приближённо по среднему лунному циклу. Совместимость — игровая интерпретация четырёх стихий.</p><p>Сонник: Густав Миллер, оригинал из Project Gutenberg и 16 кратких русских пересказов отдельных фрагментов. Исторические толкования не являются фактическими прогнозами.</p><p>Любимый знак хранится только в этом браузере. На сайте нет аналитики, регистрации и передачи введённых слов на сервер.</p><p><a href="miller-original.txt" download>Скачать оригинал сонника</a> · <a href="https://www.gutenberg.org/ebooks/926" target="_blank" rel="noreferrer">Источник</a></p>');
// Three depth planes, low-amplitude parallax and slow twinkling.
// The constellations live here too, so one of them can light up at a time.
(()=>{
 const canvas=$('#stars'),ctx=canvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 // Real outlines, in unit coordinates scaled into the viewport.
 const FIGURES=[
  {cx:.16,cy:.16,s:.24,                      // Большая Медведица
   p:[[0,.35],[.17,.42],[.34,.40],[.50,.30],[.66,.46],[.86,.52],[1,.30]],
   e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]},
  {cx:.46,cy:.07,s:.14,                      // Кассиопея
   p:[[0,.20],[.25,.55],[.50,.18],[.75,.60],[1,.22]],
   e:[[0,1],[1,2],[2,3],[3,4]]},
  {cx:.09,cy:.80,s:.19,                      // Орион
   p:[[.10,.05],[.85,0],[.38,.50],[.50,.52],[.62,.54],[.05,1],[.90,.95]],
   e:[[0,2],[2,3],[3,4],[4,1],[2,5],[4,6]]},
  {cx:.70,cy:.90,s:.12,                      // Лира
   p:[[.50,0],[.20,.45],[.80,.40],[.30,1],[.75,.95]],
   e:[[0,1],[0,2],[1,3],[2,4],[3,4]]}
 ];
 const HOLD=7, FLARE=3.2;   // seconds: one figure's turn, and how long its flare lasts
 function constellations(t){
  const unit=Math.min(w,h),depth=.55,ox0=px*depth,oy0=py*depth;
  const turn=HOLD*FIGURES.length,phase=((t%turn)+turn)%turn;
  const active=Math.floor(phase/HOLD),local=phase-active*HOLD;
  const flare=local<FLARE?Math.sin(Math.PI*local/FLARE)**2:0;
  for(let fi=0;fi<FIGURES.length;fi++){
   const f=FIGURES[fi],lift=fi===active?flare:0;
   const size=unit*f.s,ox=w*f.cx+ox0,oy=h*f.cy+oy0;
   const at=i=>[ox+f.p[i][0]*size,oy+f.p[i][1]*size];
   ctx.strokeStyle=`rgba(176,212,255,${(.18+.42*lift).toFixed(3)})`;
   ctx.lineWidth=1.1+.5*lift;
   ctx.beginPath();
   for(const [a,b] of f.e){const[x1,y1]=at(a),[x2,y2]=at(b);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)}
   ctx.stroke();
   for(let i=0;i<f.p.length;i++){
    const [x,y]=at(i),rr=9+7*lift;
    const g=ctx.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,`rgba(214,232,255,${(.45+.45*lift).toFixed(3)})`);
    g.addColorStop(1,'rgba(214,232,255,0)');
    ctx.fillStyle=g;ctx.fillRect(x-rr,y-rr,rr*2,rr*2);
    ctx.fillStyle=`rgba(235,245,255,${(.8+.2*lift).toFixed(3)})`;
    ctx.beginPath();ctx.arc(x,y,1.6+.7*lift,0,Math.PI*2);ctx.fill();
   }
  }
 }
 let w,h,dpr,points=[],frame=0,last=0,time=0,px=0,py=0,tx=0,ty=0;
 function setup(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);let seed=381;const rnd=()=>{seed=seed*16807%2147483647;return seed/2147483647};points=[];
 for(let i=0;i<Math.min(950,Math.round(w*h/1600));i++){const z=rnd();points.push({x:rnd()*(w+100)-50,y:rnd()*(h+100)-50,z,r:z<.65?rnd()*.65+.25:rnd()*1.1+.7,a:rnd()*.48+.2,p:rnd()*Math.PI*2,blue:rnd()>.35})}paint(0)}
 function paint(t){ctx.clearRect(0,0,w,h);const neb=$('#universe');if(neb)neb.style.transform=`translate3d(${(px*.35).toFixed(2)}px,${(py*.35).toFixed(2)}px,0)`;for(const s of points){const depth=.2+s.z*s.z*1.8,x=s.x+px*depth+Math.sin(t*.07+s.p)*depth*2,y=s.y+py*depth+Math.cos(t*.06+s.p)*depth*2;const alpha=s.a*(.8+.2*Math.sin(t*.55+s.p));ctx.fillStyle=s.blue?`rgba(185,212,255,${alpha})`:`rgba(249,232,198,${alpha})`;if(s.z>.9){const glow=ctx.createRadialGradient(x,y,0,x,y,s.r*7);glow.addColorStop(0,`rgba(169,207,255,${alpha*.4})`);glow.addColorStop(1,'rgba(130,180,255,0)');ctx.fillStyle=glow;ctx.fillRect(x-s.r*7,y-s.r*7,s.r*14,s.r*14);ctx.fillStyle=`rgba(227,240,255,${alpha})`}ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();if(s.z>.97){ctx.strokeStyle=`rgba(187,217,255,${alpha*.5})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-4*s.r,y);ctx.lineTo(x+4*s.r,y);ctx.moveTo(x,y-4*s.r);ctx.lineTo(x,y+4*s.r);ctx.stroke()}}constellations(performance.now()/1000)}
 function tick(now){frame=0;if(document.hidden||reduce.matches||$('#wheel').classList.contains('paused'))return;if(now-last>32){time+=Math.min((now-last)/1000,.05);last=now;px+=(tx-px)*.035;py+=(ty-py)*.035;paint(time)}frame=requestAnimationFrame(tick)}
 function run(){if(frame)cancelAnimationFrame(frame);frame=0;last=performance.now();if(!document.hidden&&!reduce.matches&&!$('#wheel').classList.contains('paused'))frame=requestAnimationFrame(tick);else paint(time)}
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduce.matches){tx=(e.clientX/w-.5)*18;ty=(e.clientY/h-.5)*14}},{passive:true});document.addEventListener('pointerleave',()=>{tx=ty=0});addEventListener('resize',setup);document.addEventListener('visibilitychange',run);reduce.addEventListener('change',()=>{px=py=tx=ty=0;run()});$('#motion').addEventListener('click',run);setup();run();
})();
// Earth turning on its axis. The flat map is wrapped onto a sphere per frame through
// a lookup table built once per resize, so each frame is just a texture read.
// A still Earth is baked into celestial-soft.png underneath: if the map can't be read
// (opening index.html straight off disk taints the canvas), that copy simply stays.
(()=>{
 const cv=$('#earth');if(!cv)return;
 const ctx=cv.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const TILT=.41,LIGHT=[.5022,.5877,.6343],PAD=1.2,TURN=150,BASE=2.1;
 let tex=null,TW=0,TH=0,S=0,buf=null,row=null,lon=null,shade=null,rim=null,frame=0,last=0,spun=BASE;

 function setup(){
  const dpr=Math.min(devicePixelRatio||1,2),size=Math.round(cv.clientWidth*dpr);
  if(!size||!tex)return false;
  S=size;cv.width=S;cv.height=S;
  buf=ctx.createImageData(S,S);
  row=new Int32Array(S*S);lon=new Float32Array(S*S);
  shade=new Float32Array(S*S);rim=new Float32Array(S*S);
  const R=S/(2*PAD),c=S/2,ct=Math.cos(TILT),st=Math.sin(TILT),d=buf.data;
  for(let y=0,i=0;y<S;y++)for(let x=0;x<S;x++,i++){
   const nx=(x+.5-c)/R,ny=(y+.5-c)/R,r2=nx*nx+ny*ny,rad=Math.sqrt(r2);
   if(r2<=1){
    const nz=Math.sqrt(1-r2),ty=ny*ct-nx*st,tx=nx*ct+ny*st;
    const lat=Math.asin(Math.max(-1,Math.min(1,-ty)));
    row[i]=Math.round((.5-lat/Math.PI)*(TH-1))*TW;
    lon[i]=Math.atan2(tx,Math.max(nz,1e-6));
    const day=Math.pow(Math.max(0,nx*LIGHT[0]+ny*LIGHT[1]+nz*LIGHT[2]),.75);
    shade[i]=.10+.90*day;
    rim[i]=Math.pow(Math.max(0,(rad-.80)/.20),1.6)*day*.95;
    d[i*4+3]=Math.round(Math.min(1,(1-rad)*R/1.6)*255);
   }else{
    // Outside the disc only the atmosphere shows, and only on the lit side.
    const k=Math.exp(-Math.pow((rad-1)/.055,2));
    const day=Math.max(0,(nx*LIGHT[0]+ny*LIGHT[1])/rad);
    shade[i]=-1;rim[i]=0;
    d[i*4]=110;d[i*4+1]=176;d[i*4+2]=240;d[i*4+3]=Math.round(k*day*150);
   }
  }
  return true;
 }
 function paint(t){
  const d=buf.data,turn=lon.length;
  spun=BASE+t*(Math.PI*2/TURN);
  for(let i=0;i<turn;i++){
   if(shade[i]<0)continue;
   const u=(lon[i]+spun)/(Math.PI*2),col=((u%1)+1)%1;
   const s=(row[i]+((col*(TW-1))|0))*4,k=shade[i],g=rim[i];
   d[i*4]=tex[s]*k+96*g;
   d[i*4+1]=tex[s+1]*k+162*g;
   d[i*4+2]=tex[s+2]*k+232*g;
  }
  ctx.putImageData(buf,0,0);
 }
 function tick(now){
  frame=0;
  if(document.hidden||reduce.matches||$('#wheel').classList.contains('paused'))return;
  if(now-last>40){last=now;paint(now/1000)}
  frame=requestAnimationFrame(tick);
 }
 function run(){
  if(frame)cancelAnimationFrame(frame);frame=0;last=0;
  if(!document.hidden&&!reduce.matches&&!$('#wheel').classList.contains('paused'))frame=requestAnimationFrame(tick);
  else paint(performance.now()/1000);
 }
 const img=new Image();
 img.onload=()=>{
  const off=document.createElement('canvas');
  off.width=TW=img.naturalWidth;off.height=TH=img.naturalHeight;
  off.getContext('2d').drawImage(img,0,0);
  try{tex=off.getContext('2d').getImageData(0,0,TW,TH).data}catch{return}
  if(!setup())return;
  cv.style.opacity='1';
  run();
  addEventListener('resize',()=>{if(setup())run()});
  document.addEventListener('visibilitychange',run);
  reduce.addEventListener('change',run);
  $('#motion').addEventListener('click',run);
 };
 img.src='assets/earth-map.png';
})();

// The moon in the artwork is photographed full, while the page says which phase it is.
// This lays the real terminator over it, so the picture agrees with the text: the far
// side goes dark and what is left is the crescent of the day.
// Everything is built here — the artwork holds the only geometry this needs.
(()=>{
 const img=document.querySelector('.celestial-realistic'),wheel=$('#wheel');
 if(!img||!wheel)return;
 // Moon disc inside celestial-soft.png, and that image inside .wheel (inset 24%, 52% wide).
 const MX=873.5/1254,MY=458/1254,MRAD=331/1254,BOX=.52,OFF=.24,PAD=1.02;
 const cv=document.createElement('canvas');
 cv.id='moon-shadow';cv.setAttribute('aria-hidden','true');
 Object.assign(cv.style,{position:'absolute',
  left:((OFF+MX*BOX)*100).toFixed(3)+'%',top:((OFF+MY*BOX)*100).toFixed(3)+'%',
  width:(MRAD*2*BOX*PAD*100).toFixed(3)+'%',aspectRatio:'1',
  transform:'translate(-50%,-50%) translateZ(54px)',pointerEvents:'none'});
 img.insertAdjacentElement('afterend',cv);
 const ctx=cv.getContext('2d');

 // The lit limb always faces the sun, and in this artwork the sun sits down and to
 // the left of the moon, so the crescent opens that way.
 const SUN=Math.atan2(709.5-458,527-873.5);
 const FLOOR=.14;   // never show less than this lit, or the hero goes black at new moon

 function draw(p){
  const dpr=Math.min(devicePixelRatio||1,2),S=Math.round(cv.clientWidth*dpr);
  if(!S)return;
  if(cv.width!==S){cv.width=cv.height=S}
  const R=S/(2*PAD),c=S/2;
  let lit=(1-Math.cos(2*Math.PI*p))/2;
  lit=FLOOR+(1-FLOOR)*lit;
  const k=1-2*lit;                       // +1 thin crescent, 0 half, -1 full
  ctx.clearRect(0,0,S,S);
  ctx.save();
  ctx.translate(c,c);ctx.rotate(SUN);ctx.translate(-c,-c);
  ctx.beginPath();ctx.arc(c,c,R,0,Math.PI*2);ctx.clip();
  // Three passes a hair apart soften the terminator without needing a blur filter.
  for(const [d,a] of [[-.014,.58],[0,.58],[.014,.58]]){
   const kk=Math.max(-1,Math.min(1,k+d));
   ctx.beginPath();
   ctx.arc(c,c,R,Math.PI/2,Math.PI*1.5,false);       // the unlit limb
   ctx.ellipse(c,c,Math.abs(kk)*R,R,0,Math.PI*1.5,Math.PI/2,kk<0);
   ctx.closePath();
   ctx.fillStyle=`rgba(4,8,20,${a})`;                // a little earthshine left behind
   ctx.fill();
  }
  ctx.restore();
 }
 window.__eosPhase=draw;
 const paint=()=>draw(typeof window.EOS_PHASE==='number'?window.EOS_PHASE:.5);
 paint();addEventListener('resize',paint);
})();

if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Name search keeps the supplied silver symbol alongside every result.
$('#sign-search').addEventListener('input',()=>{
 const q=$('#sign-search').value.trim().toLowerCase().replaceAll('ё','е'),box=$('#sign-matches');box.replaceChildren();
 if(!q)return;
 const matches=signs.map((s,i)=>({s,i})).filter(({s})=>s[0].toLowerCase().replaceAll('ё','е').startsWith(q));
 for(const {s,i} of matches){const b=document.createElement('button');b.type='button';b.innerHTML=`<img src="${zodiacImage(i)}" alt=""><span>${s[0]}</span>`;b.onclick=()=>{selected=i;render();$('#sign-search').value='';box.replaceChildren();$('#sign-search').focus()};box.append(b)}
 if(matches.length===1&&matches[0].s[0].toLowerCase().replaceAll('ё','е')===q){selected=matches[0].i;render()}
 if(!matches.length)box.textContent='Такого знака нет. Например: Лев, Весы или Рыбы.';
});
(()=>{
 const wheel=$('#wheel'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 wheel.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduce.matches||wheel.classList.contains('paused'))return;const r=wheel.getBoundingClientRect();wheel.style.setProperty('--tilt-x',`${-(e.clientY-r.top-r.height/2)/r.height*9}deg`);wheel.style.setProperty('--tilt-y',`${(e.clientX-r.left-r.width/2)/r.width*9}deg`)});
 const reset=()=>{wheel.style.setProperty('--tilt-x','0deg');wheel.style.setProperty('--tilt-y','0deg')};wheel.addEventListener('pointerleave',reset);reduce.addEventListener('change',reset);$('#motion').addEventListener('click',reset);
 // Small meteor, once per fifteen minutes; alternate upper corners.
 const meteor=$('#shooting-star'),INTERVAL=15*60*1000;let right=Math.random()>.5;
 function shoot(){if(document.hidden||reduce.matches||wheel.classList.contains('paused'))return;right=!right;meteor.className=right?'from-right':'from-left';meteor.getAnimations().forEach(a=>a.cancel());meteor.animate([{opacity:0,transform:'translate3d(0,0,0)'},{opacity:.85,offset:.15},{opacity:.65,offset:.7},{opacity:0,transform:`translate3d(${right?'-':''}${Math.min(innerWidth*.65,720)}px,${Math.min(innerHeight*.6,480)}px,0)`}],{duration:1700,easing:'ease-in'});}
 setInterval(shoot,INTERVAL);
})();
// Nebula: one offscreen pass per resize — cobalt and violet clouds around a core
// in the upper right, plus star dust scattered through them. Drifts with the cursor.
(()=>{
 const c=$('#universe'),ctx=c.getContext('2d');
 const FX=.78,FY=.2,PAD=30;
 function draw(){
  const w=innerWidth+PAD*2,h=innerHeight+PAD*2,dpr=Math.min(devicePixelRatio||1,1.5);
  c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const m=Math.max(w,h);
  const clouds=[
   [FX*w,FY*h,m*.62,'rgba(26,54,152,.46)'],
   [FX*w+w*.12,FY*h-h*.06,m*.40,'rgba(78,40,150,.36)'],
   [FX*w-w*.30,FY*h+h*.18,m*.46,'rgba(11,26,94,.44)'],
   [w*.5,h*.5,m*.80,'rgba(6,14,56,.52)']
  ];
  for(const [x,y,r,col] of clouds){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(3,8,24,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
  let seed=1337;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<2400;i++){
   const t=rand(),x=FX*w+(rand()+rand()-1)*w*.62,y=FY*h+(rand()+rand()-1)*h*.55,a=(1-t)*.36+.04,big=rand()<.08?1.6:1;
   ctx.fillStyle=`rgba(${170+rand()*55|0},${195+rand()*45|0},250,${a.toFixed(3)})`;
   ctx.fillRect(x,y,big,big);
  }
 }
 draw();addEventListener('resize',draw);
})();

function readingRecord(){return {date:isoDate(activeDate()),sign:selected,topic,lang:readingLanguage}}
function readingKey(r){return `${r.date}:${r.sign}:${r.topic}:${r.lang}`}
function renderSavedReadings(){const list=$('#saved-readings-list');list.replaceChildren();const present=savedReadings.some(r=>readingKey(r)===readingKey(readingRecord()));$('#save-reading').textContent=present?'♥ Прогноз сохранён':'♡ Сохранить прогноз';$('#save-reading').setAttribute('aria-pressed',present);if(!savedReadings.length){const p=document.createElement('p');p.className='muted';p.textContent='Сохрани понравившийся прогноз — он появится здесь.';list.append(p);return}for(const r of savedReadings){const row=document.createElement('div');row.className='saved-reading-row';const b=document.createElement('button');b.innerHTML=`<img src="${zodiacImage(r.sign)}" alt=""><span>${signs[r.sign][0]} · ${r.date}<small>${['Общее','Любовь','Дела','Совет'][r.topic]} · ${r.lang.toUpperCase()}</small></span>`;b.onclick=()=>{selected=r.sign;topic=r.topic;readingLanguage=r.lang;chosenDate=r.date;render();$('#horoscope').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Удалить сохранённый прогноз');del.onclick=()=>{const next=savedReadings.filter(x=>readingKey(x)!==readingKey(r));if(store.set('eos-saved-readings',JSON.stringify(next))){savedReadings=next;render()}else toast('Браузер не разрешает сохранение')};row.append(b,del);list.append(row)}}
$('#reading-date').onchange=e=>{if(!e.target.value||!e.target.validity.valid){toast('Выбери дату с 2020 по 2100 год');e.target.value=isoDate(activeDate());return}chosenDate=e.target.value;render()};
$('#reading-language').onchange=e=>{readingLanguage=e.target.value;store.set('eos-reading-language',readingLanguage);render()};
$('#reading-today').onclick=()=>{chosenDate=null;render()};
$('#save-reading').onclick=()=>{const r=readingRecord(),has=savedReadings.some(x=>readingKey(x)===readingKey(r));const next=has?savedReadings.filter(x=>readingKey(x)!==readingKey(r)):[r,...savedReadings].slice(0,100);if(store.set('eos-saved-readings',JSON.stringify(next))){savedReadings=next;render();toast(has?'Прогноз удалён из сохранённого':'Прогноз сохранён')}else toast('Браузер не разрешает сохранение')};
