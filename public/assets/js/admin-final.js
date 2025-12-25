/**
 * admin-final.js
 * نسخة نهائية شاملة: تفاعلات، toasts، spinner، chart محسّن، CSV، ثيم.
 * متطلبات DOM وRoutes كما ناقشنا سابقًا.
 */
document.addEventListener('DOMContentLoaded', () => {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (!csrfMeta) { console.error('CSRF meta missing'); return; }
  const CSRF = csrfMeta.getAttribute('content');

  const toastContainer = document.getElementById('toast-container');
  const globalSpinner = document.getElementById('global-spinner');
  const linksList = document.getElementById('links-list');
  const openAddBtn = document.getElementById('open-add');
  const logoutBtn = document.getElementById('logout-btn');
  const confirmLogoutBtn = document.getElementById('confirm-logout');

  function escapeHtml(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function showToast(message, type='info', timeout=3500){
    if(!toastContainer){ console.warn('toast-container missing:', message); return; }
    const id = 'toast-' + Date.now();
    const bg = (type==='success')?'text-bg-success':(type==='danger')?'text-bg-danger':(type==='warning')?'text-bg-warning':'text-bg-info';
    const html = `<div id="${id}" class="toast align-items-center ${bg} border-0 show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
    toastContainer.insertAdjacentHTML('beforeend', html);
    setTimeout(()=>{ const el=document.getElementById(id); if(el) el.remove(); }, timeout);
  }
  function showGlobalSpinner(){ if(globalSpinner) globalSpinner.classList.remove('d-none'); }
  function hideGlobalSpinner(){ if(globalSpinner) globalSpinner.classList.add('d-none'); }
  async function safeJson(res){ const t = await res.text().catch(()=>null); try{ return t?JSON.parse(t):null;}catch{return null;} }

  function createLinkItem(link){
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.dataset.id = link.id;
    li.dataset.icon = link.icon || '';
    li.dataset.active = link.is_active ? '1' : '0';
    li.innerHTML = `<div class="d-flex align-items-center justify-content-between w-100">
      <div class="d-flex align-items-center gap-3">
        <span class="drag-handle" title="اسحب لإعادة الترتيب" aria-hidden="true">
          <svg width="20" height="20"><use xlink:href="/assets/icons/icons.svg#icon-drag"></use></svg>
        </span>
        <div class="link-meta text-end">
          <div class="link-title">${escapeHtml(link.title)}</div>
          <div class="link-url">${escapeHtml(link.url)}</div>
        </div>
      </div>
      <div class="link-actions d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary edit-link" data-id="${link.id}">
          <svg width="14" height="14"><use xlink:href="/assets/icons/icons.svg#icon-edit"></use></svg> تعديل
        </button>
        <button class="btn btn-sm btn-outline-danger delete-link" data-id="${link.id}">
          <svg width="14" height="14"><use xlink:href="/assets/icons/icons.svg#icon-delete"></use></svg> حذف
        </button>
      </div>
    </div>`;
    return li;
  }

  function attachHandlers(root=document){
    root.querySelectorAll('.edit-link').forEach(btn=>{
      btn.removeEventListener('click', onEditClick);
      btn.addEventListener('click', onEditClick);
    });
    root.querySelectorAll('.delete-link').forEach(btn=>{
      btn.removeEventListener('click', onDeleteClick);
      btn.addEventListener('click', onDeleteClick);
    });
  }

  if(openAddBtn){
    openAddBtn.addEventListener('click', ()=>{
      const modalEl = document.getElementById('linkModal');
      document.getElementById('modal-id').value = '';
      document.getElementById('modal-title').value = '';
      document.getElementById('modal-url').value = '';
      document.getElementById('modal-icon').value = '';
      document.getElementById('modal-active').checked = true;
      if(modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  async function onEditClick(){
    const id = this.dataset.id;
    if(!id){ showToast('معرّف غير صالح','warning'); return; }
    const modalEl = document.getElementById('linkModal');
    const modalBody = modalEl?.querySelector('.modal-body');
    if (modalBody) { modalBody.dataset.prevHtml = modalBody.innerHTML; modalBody.innerHTML = '<div class="d-flex justify-content-center align-items-center" style="min-height:120px;"><div class="spinner-border text-primary" role="status"></div></div>'; }
    showGlobalSpinner();
    try {
      const res = await fetch('/admin/links/' + encodeURIComponent(id), { method:'GET', headers:{ 'X-CSRF-TOKEN': CSRF } });
      if (res.status === 405) { fillModalFromDOM(id); return; }
      if (!res.ok) { fillModalFromDOM(id); return; }
      const data = await res.json();
      if (modalBody && modalBody.dataset.prevHtml) modalBody.innerHTML = modalBody.dataset.prevHtml;
      fillModalFields(data);
      if (modalEl) new bootstrap.Modal(modalEl).show();
    } catch (err) {
      console.error('Edit fetch error', err);
      fillModalFromDOM(id);
    } finally { hideGlobalSpinner(); if (modalBody && modalBody.dataset.prevHtml) delete modalBody.dataset.prevHtml; }
  }

  function fillModalFields(data){
    const idEl = document.getElementById('modal-id');
    const titleEl = document.getElementById('modal-title');
    const urlEl = document.getElementById('modal-url');
    const iconEl = document.getElementById('modal-icon');
    const activeEl = document.getElementById('modal-active');
    if (idEl) idEl.value = data.id ?? '';
    if (titleEl) titleEl.value = data.title ?? '';
    if (urlEl) urlEl.value = data.url ?? '';
    if (iconEl) iconEl.value = data.icon ?? '';
    if (activeEl) activeEl.checked = !!data.is_active;
  }

  function fillModalFromDOM(id){
    const li = document.querySelector(`[data-id="${id}"]`);
    if(!li){ showToast('تعذر إيجاد بيانات العنصر','danger'); return; }
    const title = li.querySelector('.link-title')?.innerText || '';
    const url = li.querySelector('.link-url')?.innerText || '';
    const icon = li.dataset.icon || '';
    const active = li.dataset.active === '1';
    fillModalFields({ id, title, url, icon, is_active: active });
    const modalEl = document.getElementById('linkModal');
    if(modalEl) new bootstrap.Modal(modalEl).show();
  }

  async function onDeleteClick(){
    if(!confirm('هل تريد حذف هذا الرابط؟')) return;
    const id = this.dataset.id;
    showGlobalSpinner();
    try {
      const res = await fetch('/admin/links/' + encodeURIComponent(id), { method:'DELETE', headers:{ 'X-CSRF-TOKEN': CSRF } });
      if(res.ok){
        const li = document.querySelector(`[data-id="${id}"]`);
        if(li) li.remove();
        showToast('تم الحذف','success');
      } else {
        showToast('فشل الحذف','danger');
        console.error('Delete failed', res.status, await safeJson(res));
      }
    } catch (err) {
      console.error('Delete error', err);
      showToast('فشل الاتصال','danger');
    } finally { hideGlobalSpinner(); }
  }

  const modalForm = document.getElementById('linkModalForm');
  if(modalForm){
    modalForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const id = document.getElementById('modal-id').value;
      const isCreate = !id;
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;
      const payload = {
        title: document.getElementById('modal-title').value.trim(),
        url: document.getElementById('modal-url').value.trim(),
        icon: document.getElementById('modal-icon').value.trim(),
        is_active: document.getElementById('modal-active').checked ? 1 : 0
      };
      if(!payload.title || !payload.url){ showToast('املأ الحقول المطلوبة','warning'); if(submitBtn) submitBtn.disabled = false; return; }
      const method = isCreate ? 'POST' : 'PUT';
      const url = isCreate ? '/admin/links' : '/admin/links/' + encodeURIComponent(id);
      const headers = isCreate ? { 'X-CSRF-TOKEN': CSRF } : { 'Content-Type':'application/json', 'X-CSRF-TOKEN': CSRF };
      const body = isCreate ? new FormData(modalForm) : JSON.stringify(payload);
      showGlobalSpinner();
      try {
        const res = await fetch(url, { method, headers, body });
        const json = await safeJson(res);
        if(res.ok && json?.link){
          const existing = document.querySelector(`[data-id="${json.link.id}"]`);
          if(existing){
            const titleNode = existing.querySelector('.link-title');
            const urlNode = existing.querySelector('.link-url');
            if(titleNode) titleNode.innerText = json.link.title;
            if(urlNode) urlNode.innerText = json.link.url;
            existing.dataset.icon = json.link.icon || '';
            existing.dataset.active = json.link.is_active ? '1' : '0';
          } else {
            if(linksList){
              const newItem = createLinkItem(json.link);
              linksList.prepend(newItem);
              attachHandlers(newItem);
            }
          }
          showToast(isCreate ? 'تمت الإضافة' : 'تم التحديث','success');
          const modalEl = document.getElementById('linkModal');
          if(modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
          loadStats().catch(()=>{});
        } else if(res.status === 409){
          showToast(json?.message || 'هذا الرابط موجود بالفعل','warning');
        } else if(res.status === 422){
          const errs = json?.errors ? Object.values(json.errors).flat().join(' - ') : 'خطأ في البيانات';
          showToast(errs,'danger');
        } else {
          showToast('فشل العملية','danger');
          console.error('Save unexpected', res.status, json);
        }
      } catch (err) {
        console.error('Save error', err);
        showToast('فشل الاتصال','danger');
      } finally { if(submitBtn) submitBtn.disabled = false; hideGlobalSpinner(); }
    });
  }

  if(window.Sortable && linksList){
    Sortable.create(linksList, {
      handle: '.drag-handle',
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      touchStartThreshold: 5,
      onStart(evt){ evt.item.classList.add('sortable-ghost'); },
      onEnd: async (evt)=>{
        evt.item.classList.remove('sortable-ghost');
        const ids = Array.from(linksList.querySelectorAll('[data-id]')).map(li=>li.dataset.id);
        showToast('جارٍ حفظ الترتيب...','info',1200);
        try {
          const res = await fetch('/admin/links/reorder', { method:'POST', headers:{ 'Content-Type':'application/json', 'X-CSRF-TOKEN': CSRF }, body: JSON.stringify({ ids }) });
          if(res.ok) showToast('تم حفظ الترتيب','success');
          else { showToast('فشل حفظ الترتيب','danger'); console.error('Reorder failed', res.status, await safeJson(res)); }
        } catch (err) { console.error('Reorder error', err); showToast('فشل الاتصال','danger'); }
      }
    });
  }

  const mainChartCtx = document.getElementById('mainChart')?.getContext('2d');
  let mainChart = null;
  async function loadStats(){
    try {
      const res = await fetch('/admin/stats');
      if(!res.ok){ console.warn('stats fetch failed', res.status); return; }
      const data = await res.json();
      const visitsEl = document.getElementById('stat-visits');
      const clicksEl = document.getElementById('stat-clicks');
      if(visitsEl) visitsEl.innerText = data.visits ?? 0;
      if(clicksEl) clicksEl.innerText = data.clicks ?? 0;

      const labels = (data.byLink || []).map(l=>l.title);
      const values = (data.byLink || []).map(l=>l.clicks || 0);
      if(!labels.length){
        if(mainChart){ mainChart.destroy(); mainChart = null; }
        if(mainChartCtx){ mainChartCtx.clearRect(0,0,mainChartCtx.canvas.width, mainChartCtx.canvas.height); }
        return;
      }
      if(mainChart) mainChart.destroy();
      if(mainChartCtx){
        mainChart = new Chart(mainChartCtx, {
          type:'line',
          data:{ labels, datasets:[{ label:'نقرات', data: values, borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,0.08)', tension:0.35, fill:true, pointRadius:4 }] },
          options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
              legend:{display:false},
              tooltip:{ mode:'index', intersect:false, callbacks:{ label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue} نقرة` } },
              decimation:{ enabled:true, algorithm:'lttb', samples:200 }
            },
            scales:{ x:{ grid:{display:false} }, y:{ beginAtZero:true } }
          }
        });
      }
    } catch (err) { console.error('loadStats error', err); }
  }
  loadStats().catch(()=>{});

  const openStats = document.getElementById('open-stats');
  if(openStats){
    openStats.addEventListener('click', async ()=>{
      showGlobalSpinner();
      try {
        const res = await fetch('/admin/stats');
        if(!res.ok){ showToast('فشل تحميل الإحصاءات','danger'); return; }
        const data = await res.json();
        document.getElementById('stat-visits-modal').innerText = data.visits ?? 0;
        document.getElementById('stat-clicks-modal').innerText = data.clicks ?? 0;
        const ctx = document.getElementById('clicksChart')?.getContext('2d');
        if(ctx){
          const labels = (data.byLink || []).map(l=>l.title);
          const values = (data.byLink || []).map(l=>l.clicks || 0);
          const colors = labels.map((_,i)=>`hsl(${(i*47)%360} 75% 55%)`);
          if(window._clicksChart) window._clicksChart.destroy();
          window._clicksChart = new Chart(ctx, {
            type:'bar',
            data:{ labels, datasets:[{ label:'نقرات', data: values, backgroundColor: colors, borderRadius:6 }] },
            options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{beginAtZero:true} } }
          });
        }
        document.getElementById('stats-modal').style.display = 'block';
      } catch (err) { console.error('openStats error', err); showToast('فشل تحميل الإحصاءات','danger'); }
      finally { hideGlobalSpinner(); }
    });
  }
  const closeStats = document.getElementById('close-stats');
  if(closeStats) closeStats.addEventListener('click', ()=>{ document.getElementById('stats-modal').style.display = 'none'; });

  // CSV export
  function downloadCsv(filename, rows) {
    if (!rows || !rows.length) { showToast('لا توجد بيانات للتصدير','warning'); return; }
    const header = Object.keys(rows[0]).join(',');
    const csv = [header].concat(rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  const exportBtn = document.getElementById('export-csv');
  if(exportBtn){
    exportBtn.addEventListener('click', async ()=>{
      try {
        const res = await fetch('/admin/stats');
        if(!res.ok){ showToast('فشل تحميل البيانات','danger'); return; }
        const data = await res.json();
        downloadCsv('stats.csv', data.byLink || []);
      } catch (err) { console.error('CSV export error', err); showToast('فشل الاتصال','danger'); }
    });
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{ const modal = new bootstrap.Modal(document.getElementById('logoutModal')); modal.show(); });
  }
  if(confirmLogoutBtn){
    confirmLogoutBtn.addEventListener('click', async ()=>{
      showGlobalSpinner();
      try {
        const res = await fetch('/logout', { method:'POST', headers:{ 'X-CSRF-TOKEN': CSRF } });
        if(res.ok) { showToast('تم تسجيل الخروج','success'); setTimeout(()=> location.href = '/', 800); }
        else { showToast('فشل تسجيل الخروج','danger'); console.error('logout failed', res.status, await safeJson(res)); }
      } catch (err) { console.error('logout error', err); showToast('فشل الاتصال','danger'); }
      finally { hideGlobalSpinner(); }
    });
  }

  // Theme toggle
  (function(){
    const key = 'darkMode';
    function applyDarkMode(on){ if(on) document.documentElement.classList.add('theme-dark'), document.body.classList.add('theme-dark'); else document.documentElement.classList.remove('theme-dark'), document.body.classList.remove('theme-dark'); }
    const saved = localStorage.getItem(key);
    if(saved === '1') applyDarkMode(true);
    const toggle = document.getElementById('theme-toggle');
    if(toggle) toggle.addEventListener('click', ()=>{ const isOn = document.documentElement.classList.contains('theme-dark'); applyDarkMode(!isOn); localStorage.setItem(key, !isOn ? '1' : '0'); });
  })();

  attachHandlers(document);
});
