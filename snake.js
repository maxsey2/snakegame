(()=>{
const $=s=>document.querySelector(s);
const cv=$('#board'),ctx=cv.getContext('2d'),ov=$('#overlay');
const N=20;
const MODES={classic:{n:'Classic',ms:170,wrap:false,d:'Walls are deadly. The snake speeds up with every apple.'},zen:{n:'Zen',ms:185,wrap:true,d:'No walls: leave one side, come back on the other.'},turbo:{n:'Turbo',ms:120,wrap:false,d:'Deadly walls, high speed from the start.'}};
const DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const track=(n,p)=>{if(window.gtag)gtag('event',n,p)};
const st={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let mode=st.get('sfm');if(!MODES[mode])mode='classic';
let snake,dir={x:1,y:0},queue=[],food,score=0,state='idle',acc=0,prev=0,pulse=0,cell=0;
const best=()=>+st.get('sfb_'+mode)||0;
const ms=()=>Math.max(75,MODES[mode].ms-score*1.2);

function fit(){cv.width=cv.height=Math.round(cv.clientWidth*(window.devicePixelRatio||1));cell=cv.width/N}
function ui(){
  $('#score').textContent=score;$('#best').textContent=Math.max(best(),score);$('#modeName').textContent=MODES[mode].n;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
}
function show(t,p,b,sh){$('#ovTitle').textContent=t;$('#ovText').textContent=p;$('#play').textContent=b;$('#share').textContent='Share my score';$('#share').hidden=!sh;ov.hidden=false}
function spawn(){let f;do{f={x:Math.random()*N|0,y:Math.random()*N|0}}while(snake.some(s=>s.x===f.x&&s.y===f.y));return f}
function reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};queue=[];score=0;food=spawn();ui()}
function start(){if(state==='idle'||state==='over'){reset();track('game_start',{mode:mode})}state='play';ov.hidden=true;acc=0}
function pause(){if(state==='play'){state='pause';show('Paused','Take your time.','Resume',false)}}
function die(){
  state='over';track('game_over',{mode:mode,score:score});const b=best(),rec=score>b;if(rec)st.set('sfb_'+mode,score);ui();
  show(rec?'New best!':'Game over','Score: '+score+' · Best: '+Math.max(b,score),'Play again',score>0);
}
function turn(x,y){
  if(state==='pause')return;
  const r=queue.length?queue[queue.length-1]:dir;
  if((x===-r.x&&y===-r.y)||(x===r.x&&y===r.y))return;
  if(state!=='play')start();
  if(queue.length<2)queue.push({x,y});
}
function step(){
  if(queue.length)dir=queue.shift();
  let x=snake[0].x+dir.x,y=snake[0].y+dir.y;
  if(MODES[mode].wrap){x=(x+N)%N;y=(y+N)%N}else if(x<0||y<0||x>=N||y>=N)return die();
  const eat=x===food.x&&y===food.y,body=eat?snake:snake.slice(0,-1);
  if(body.some(s=>s.x===x&&s.y===y))return die();
  snake.unshift({x,y});
  if(eat){score++;pulse=1;if(snake.length>=N*N)return die();food=spawn();ui()}else snake.pop();
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function draw(t){
  const c=cell;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){ctx.fillStyle=(i+j)%2?'#c9d79d':'#cfdca6';ctx.fillRect(i*c,j*c,c,c)}
  if(!snake)return;
  const fx=(food.x+.5)*c,fy=(food.y+.5)*c,pr=c*(.3+.03*Math.sin(t/180)+.12*pulse);
  ctx.fillStyle='#ff5a1f';ctx.beginPath();ctx.arc(fx,fy,pr,0,7);ctx.fill();
  ctx.fillStyle='#ffd2b8';ctx.beginPath();ctx.arc(fx-pr*.3,fy-pr*.3,pr*.22,0,7);ctx.fill();
  const L=snake.length;
  for(let i=L-1;i>=0;i--){
    const s=snake[i],k=i/Math.max(L,10),p=c*.06;
    ctx.fillStyle='hsl(85 45% '+(9+24*k)+'%)';
    rr(s.x*c+p,s.y*c+p,c-2*p,c-2*p,c*.3);
  }
  const h=snake[0],ex=h.x*c+c/2,ey=h.y*c+c/2;
  ctx.fillStyle='#cfdca6';
  for(const sg of[-1,1]){ctx.beginPath();ctx.arc(ex+dir.x*c*.14-dir.y*sg*c*.2,ey+dir.y*c*.14+dir.x*sg*c*.2,c*.09,0,7);ctx.fill()}
}
function loop(t){
  const dt=Math.min(t-prev,100);prev=t;
  if(state==='play'){acc+=dt;let g=0;while(acc>=ms()&&state==='play'&&g++<5){acc-=ms();step()}}
  pulse=Math.max(0,pulse-dt/300);draw(t);requestAnimationFrame(loop);
}

addEventListener('keydown',e=>{
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',z:'up',s:'down',a:'left',q:'left',d:'right'};
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(k===' '||k==='p'){e.preventDefault();state==='play'?pause():start();return}
  if(m[k]){e.preventDefault();turn(...DIR[m[k]])}
});
let t0=null;
cv.addEventListener('touchstart',e=>{const t=e.touches[0];t0={x:t.clientX,y:t.clientY}},{passive:true});
cv.addEventListener('touchmove',e=>{
  e.preventDefault();if(!t0)return;
  const t=e.touches[0],dx=t.clientX-t0.x,dy=t.clientY-t0.y;
  if(Math.hypot(dx,dy)>22){Math.abs(dx)>Math.abs(dy)?turn(Math.sign(dx),0):turn(0,Math.sign(dy));t0={x:t.clientX,y:t.clientY}}
},{passive:false});
$('#play').onclick=e=>{e.currentTarget.blur();start()};
$('#pause').onclick=e=>{e.currentTarget.blur();if(state==='play')pause();else if(state==='pause')start()};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
  mode=b.dataset.mode;st.set('sfm',mode);state='idle';reset();show('Mode '+MODES[mode].n,MODES[mode].d,'Play',false);b.blur();
});
document.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();turn(...DIR[b.dataset.d])}));
$('#share').onclick=async()=>{
  const txt='I scored '+score+' in Snake ('+MODES[mode].n+' mode) on SnakeForFree.com. Can you beat it?';
  try{if(navigator.share)await navigator.share({text:txt,url:location.origin});else{await navigator.clipboard.writeText(txt+' '+location.origin);$('#share').textContent='Copied!'}}catch(e){}
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
new ResizeObserver(fit).observe(cv);
fit();reset();show('Ready?',MODES[mode].d,'Play',false);requestAnimationFrame(loop);
})();
