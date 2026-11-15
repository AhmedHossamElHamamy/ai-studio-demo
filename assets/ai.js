/* Shared helpers for the AI demos: settings, Gemini call, toast, copy. With no personal key, calls go through a small proxy that keeps the site key on the server. */
(function(){
  const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  const AI={store};
  AI.key=()=>store.get('ai_gemini_key','');
  AI.model=()=>{const m=store.get('ai_gemini_model','gemini-3.5-flash');return /2\.5|2\.0/.test(m)?'gemini-3.5-flash':m};
  AI.proxy='https://gemini-proxy.ahmed110hossam.workers.dev/';
  AI.live=()=>store.get('ai_offline','')!=='1';
  AI.toast=function(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  AI.copy=async function(text){try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}AI.toast('تم النسخ ✓')};
  AI.gemini=async function(prompt,{json=false,system='',temperature=0.9}={}){
    const key=AI.key();
    const body={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature}};
    if(system)body.systemInstruction={parts:[{text:system}]};
    if(json)body.generationConfig.responseMimeType='application/json';
    const models=[...new Set([AI.model(),'gemini-3.5-flash','gemini-3.1-flash-lite'])];let last;
    for(const m of models){
      try{
        const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),35000);
        const url=key?'https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(m)+':generateContent?key='+encodeURIComponent(key):AI.proxy+'?model='+encodeURIComponent(m);
        const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:ctl.signal});
        clearTimeout(to);const j=await r.json();
        if(!r.ok){last=new Error((j.error&&j.error.message)||('HTTP '+r.status));if(r.status===400||r.status===403)throw last;continue}
        const txt=(((j.candidates||[])[0]||{}).content||{}).parts?.map(p=>p.text||'').join('')||'';
        return json?JSON.parse(txt.replace(/^```json|```$/g,'').trim()):txt.trim();
      }catch(e){last=e;if(/API key|PERMISSION|400|403/.test(String(e)))break}
    }
    throw last||new Error('Gemini failed');
  };
  AI.mountSettings=function(onChange){
    const m=document.createElement('div');m.className='modal';m.innerHTML=`
    <div class="card"><h3>إعدادات الذكاء الاصطناعي (Gemini)</h3>
    <p class="muted small">الأداة متصلة بـ Gemini جاهزة بدون أي إعداد. لو عندك مفتاح خاص من Google AI Studio تقدر تضعه هنا (اختياري)، ويُحفظ في متصفحك فقط.</p>
    <label class="row" style="gap:8px;align-items:center"><input id="kOff" type="checkbox" style="width:auto"> تشغيل بالمحرك المحلي فقط (بدون إنترنت)</label>
    <label>مفتاحك الخاص (اختياري)</label><input id="kKey" type="password" placeholder="AIza..." autocomplete="off">
    <label>النموذج</label><select id="kModel"><option>gemini-3.5-flash</option><option>gemini-3.8-flash</option><option>gemini-3.1-flash-lite</option></select>
    <div class="row" style="margin-top:16px"><button class="btn" id="kSave">حفظ</button><button class="btn ghost" id="kClear">مسح المفتاح</button><button class="btn ghost" id="kClose">إغلاق</button></div>
    <p class="muted small" style="margin-top:12px">مفتاح الموقع محفوظ على خادم وسيط آمن ولا يظهر للزوار إطلاقا.</p></div>`;
    document.body.appendChild(m);
    const open=()=>{m.querySelector('#kKey').value=AI.key();m.querySelector('#kModel').value=AI.model();m.querySelector('#kOff').checked=!AI.live();m.classList.add('show')};
    m.querySelector('#kClose').onclick=()=>m.classList.remove('show');
    m.onclick=e=>{if(e.target===m)m.classList.remove('show')};
    m.querySelector('#kSave').onclick=()=>{store.set('ai_gemini_key',m.querySelector('#kKey').value.trim());store.set('ai_gemini_model',m.querySelector('#kModel').value);store.set('ai_offline',m.querySelector('#kOff').checked?'1':'');m.classList.remove('show');AI.toast(AI.live()?'تم الحفظ، الأداة متصلة بـ Gemini':'تم الحفظ، الأداة تعمل محليا');paint();onChange&&onChange()};
    m.querySelector('#kClear').onclick=()=>{store.set('ai_gemini_key','');m.querySelector('#kKey').value='';paint();onChange&&onChange();AI.toast('تم مسح المفتاح')};
    function paint(){document.querySelectorAll('[data-mode]').forEach(el=>{el.className='badge '+(AI.live()?'live':'demo');el.innerHTML='<i></i>'+(AI.live()?'متصل بـ Gemini':'وضع محلي بدون إنترنت')})}
    document.querySelectorAll('[data-open-settings]').forEach(b=>b.onclick=open);paint();
    return {open,paint};
  };
  AI.pick=a=>a[Math.floor(Math.random()*a.length)];
  AI.shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  AI.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // Arabic normalisation for search
  AI.norm=s=>String(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  window.AI=AI;
})();
