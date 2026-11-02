(()=>{
// 1) Paste your Google Analytics 4 measurement ID here (looks like G-AB12CD34EF)
const GA_ID='G-XXXXXXXXXX';

const KEY='sf_consent',MAX_AGE=180*24*3600*1000; // choice is asked again after ~6 months
const read=()=>{try{const o=JSON.parse(localStorage.getItem(KEY));return o&&Date.now()-o.t<MAX_AGE?o.c:null}catch(e){return null}};
const save=c=>{try{localStorage.setItem(KEY,JSON.stringify({c,t:Date.now()}))}catch(e){}};
const valid=/^G-[A-Z0-9]{6,}$/.test(GA_ID)&&GA_ID!=='G-XXXXXXXXXX';

function loadGA(){
  if(!valid||window.__gaLoaded)return;
  window.__gaLoaded=true;window['ga-disable-'+GA_ID]=false;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments)};
  gtag('js',new Date());gtag('config',GA_ID);
  const s=document.createElement('script');s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
}
function stopGA(){
  if(valid)window['ga-disable-'+GA_ID]=true;
  const h=location.hostname,doms=['',h,'.'+h,'.'+h.split('.').slice(-2).join('.')];
  document.cookie.split(';').forEach(c=>{
    const n=c.split('=')[0].trim();
    if(n==='_ga'||n.indexOf('_ga_')===0)doms.forEach(d=>{document.cookie=n+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'+(d?'; domain='+d:'')});
  });
}
function banner(){
  let b=document.getElementById('cookie-banner');
  if(b){b.hidden=false;return}
  const pl=document.querySelector('footer a[href$="privacy.html"]');
  b=document.createElement('div');b.id='cookie-banner';
  b.setAttribute('role','dialog');b.setAttribute('aria-label','Cookie consent');
  b.innerHTML='<p>We use Google Analytics cookies to see how the site is used. They are only set if you accept. <a href="'+(pl?pl.getAttribute('href'):'privacy.html')+'">Learn more</a></p>'+
    '<div class="cookie-actions"><button type="button" class="btn ghost" data-c="denied">Decline</button><button type="button" class="btn ghost" data-c="granted">Accept</button></div>';
  b.addEventListener('click',e=>{
    const c=e.target.dataset&&e.target.dataset.c;if(!c)return;
    save(c);b.hidden=true;c==='granted'?loadGA():stopGA();
  });
  document.body.appendChild(b);
}
document.querySelectorAll('[data-cookie-settings]').forEach(el=>el.addEventListener('click',banner));
const c=read();
if(c==='granted')loadGA();else if(c==='denied')stopGA();else banner();
})();
