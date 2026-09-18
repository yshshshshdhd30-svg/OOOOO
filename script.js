(function(){
  const textInput=document.getElementById('textInput');
  const charCount=document.getElementById('charCount');
  const voiceSelect=document.getElementById('voiceSelect');
  const rate=document.getElementById('rate'), pitch=document.getElementById('pitch');
  const rateValue=document.getElementById('rateValue'), pitchValue=document.getElementById('pitchValue');
  const status=document.getElementById('status');
  const historyKey='textVoiceHistory';
  let voices=[];

  function updateCount(){charCount.textContent=textInput.value.length.toLocaleString('ar-EG')}
  function setStatus(t){status.textContent=t}
  function loadVoices(){
    if(!('speechSynthesis' in window))return;
    voices=window.speechSynthesis.getVoices();
    voiceSelect.innerHTML='<option value="">الصوت الافتراضي</option>';
    voices.forEach((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=v.name+' — '+v.lang;voiceSelect.appendChild(o)})
  }
  function getHistory(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch(e){return []}}
  function saveHistory(text){if(!text.trim())return;let h=getHistory().filter(x=>x.text!==text);h.unshift({text:text.slice(0,300),date:new Date().toLocaleString('ar-EG')});localStorage.setItem(historyKey,JSON.stringify(h.slice(0,20)));renderHistory()}
  function renderHistory(){const box=document.getElementById('historyList'),h=getHistory();box.innerHTML=h.length?h.map((x,i)=>'<div class="history-item"><div>'+escapeHtml(x.text)+'</div><time>'+x.date+'</time></div>').join(''):'<div class="empty">لا يوجد سجل حتى الآن.</div>'}
  function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function speak(){
    const text=textInput.value.trim();
    if(!text){setStatus('اكتب نصًا أولًا.');textInput.focus();return}
    if(!('speechSynthesis' in window)){setStatus('المتصفح الحالي لا يدعم تحويل النص إلى صوت.');return}
    window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=parseFloat(rate.value);u.pitch=parseFloat(pitch.value);
    const idx=voiceSelect.value;if(idx!==''&&voices[idx])u.voice=voices[idx];
    u.onstart=()=>setStatus('يتم تشغيل الصوت الآن...');u.onend=()=>setStatus('اكتمل تشغيل النص.');u.onerror=()=>setStatus('حدث خطأ أثناء تشغيل الصوت.');
    window.speechSynthesis.speak(u);saveHistory(text)
  }
  textInput.addEventListener('input',updateCount);
  rate.addEventListener('input',()=>rateValue.textContent=Number(rate.value).toFixed(1)+'×');
  pitch.addEventListener('input',()=>pitchValue.textContent=Number(pitch.value).toFixed(1));
  document.getElementById('speakBtn').onclick=speak;
  document.getElementById('pauseBtn').onclick=()=>{if(window.speechSynthesis){window.speechSynthesis.pause();setStatus('تم الإيقاف المؤقت.')}};
  document.getElementById('stopBtn').onclick=()=>{if(window.speechSynthesis){window.speechSynthesis.cancel();setStatus('تم الإيقاف.')}};
  document.getElementById('clearBtn').onclick=()=>{textInput.value='';updateCount();setStatus('تم مسح النص.')};
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  function showTab(id){document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));window.scrollTo({top:0,behavior:'smooth'})}
  document.getElementById('loginBtn').onclick=()=>alert('نسخة الملفات الأربعة لا تحتاج تسجيل دخول. يمكن إضافة Firebase لاحقًا إذا كانت الاستضافة تدعمها.');
  document.getElementById('notifyBtn').onclick=()=>alert('تم تسجيل طلب الإشعار على هذا الجهاز.');
  document.getElementById('shareBtn').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);setStatus('تم نسخ رابط الموقع.')}catch(e){setStatus('انسخ رابط الصفحة من شريط المتصفح لمشاركته.')}};
  loadVoices();if('speechSynthesis' in window)speechSynthesis.onvoiceschanged=loadVoices;updateCount();renderHistory();
})();
