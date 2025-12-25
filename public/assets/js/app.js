// public/assets/js/app.js
document.addEventListener('DOMContentLoaded', function(){
  // إرسال نقرة الرابط عبر AJAX ثم إعادة توجيه
  document.querySelectorAll('[data-id]').forEach(btn=>{
    btn.addEventListener('click', function(e){
      e.preventDefault();
      const id = this.dataset.id;
      fetch('/api/click', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').getAttribute('content') : ''
        },
        body: JSON.stringify({link_id: id})
      }).then(r=>r.json()).then(data=>{
        if (data.redirect) window.location.href = data.redirect;
      }).catch(()=>{ window.location.href = this.getAttribute('href') || '#'; });
    });
  });

  // زر الدخول المخفي: تسلسل نقرات على الصورة (مثال: 5 نقرات خلال 2 ثانية)
  const profile = document.getElementById('profile-pic');
  if (profile){
    let clicks = 0, timer = null;
    profile.addEventListener('click', ()=>{
      clicks++;
      if (timer) clearTimeout(timer);
      timer = setTimeout(()=>{ clicks = 0; }, 2000);
      if (clicks >= 5){
        clicks = 0;
        const hidden = document.getElementById('hidden-login');
        if (hidden) hidden.classList.toggle('hidden');
        // إضافة تأثير بصري قصير
        profile.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:300});
      }
    });
  }

  // اختياري: إظهار نافذة إحصاءات عائمة (سيتم تحميل المحتوى عبر AJAX لاحقاً)
  // يمكنك ربط هذا الزر في لوحة التحكم لفتح #stats-modal
  const statsBtn = document.getElementById('open-stats');
  if (statsBtn){
    statsBtn.addEventListener('click', ()=>{
      const modal = document.getElementById('stats-modal');
      if (modal) modal.classList.toggle('hidden');
    });
  }
});
