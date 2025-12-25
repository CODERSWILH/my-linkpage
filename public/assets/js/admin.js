/**
 * public/assets/js/admin.js
 * نسخة نهائية: آمنة، سلسة، سريعة.
 * تأكد من تحميل Bootstrap, SortableJS, Chart.js قبل هذا الملف أو استخدم defer.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ====== إعدادات أساسية ======
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (!csrfMeta) {
    console.error('CSRF meta tag missing. Add <meta name="csrf-token" content="{{ csrf_token() }}"> to your layout.');
    return;
  }
  const CSRF = csrfMeta.getAttribute('content');

  // عناصر واجهة
  const toastContainer = document.getElementById('toast-container');
  const globalSpinner = document.getElementById('global-spinner');
  const linksList = document.getElementById('links-list');

  // ====== مساعدات واجهة ======
  function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info', timeout = 3500) {
    if (!toastContainer) { console.warn('toast-container missing:', message); return; }
    const id = 'toast-' + Date.now();
    const bg = (type === 'success') ? 'text-bg-success' : (type === 'danger') ? 'text-bg-danger' : (type === 'warning') ? 'text-bg-warning' : 'text-bg-info';
    const html = `
      <div id="${id}" class="toast align-items-center ${bg} border-0 show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${escapeHtml(message)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>`;
    toastContainer.insertAdjacentHTML('beforeend', html);
    setTimeout(() => { const el = document.getElementById(id); if (el) el.remove(); }, timeout);
  }

  function showGlobalSpinner() { if (globalSpinner) globalSpinner.classList.remove('d-none'); }
  function hideGlobalSpinner() { if (globalSpinner) globalSpinner.classList.add('d-none'); }

  async function safeJson(res) {
    const text = await res.text().catch(() => null);
    try { return text ? JSON.parse(text) : null; } catch { return null; }
  }

  // ====== إنشاء عنصر قائمة رابط (DOM) بأمان ======
  function createLinkListItem(link) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.dataset.id = link.id;
    li.dataset.icon = link.icon || '';
    li.dataset.active = link.is_active ? '1' : '0';
    li.innerHTML = `
      <div>
        <strong class="link-title">${escapeHtml(link.title)}</strong><br>
        <small class="text-muted link-url">${escapeHtml(link.url)}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-secondary edit-link" data-id="${link.id}">تعديل</button>
        <button class="btn btn-sm btn-outline-danger delete-link" data-id="${link.id}">حذف</button>
      </div>`;
    return li;
  }

  // ====== إضافة رابط (FormData) ======
  const linkForm = document.getElementById('link-form');
  if (linkForm) {
    let adding = false;
    linkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (adding) return;
      adding = true;

      const addBtn = document.getElementById('add-link');
      const addSpinner = document.getElementById('add-link-spinner');
      if (addBtn) addBtn.disabled = true;
      if (addSpinner) addSpinner.classList.remove('d-none');

      const title = linkForm.querySelector('[name="title"]')?.value?.trim();
      const url = linkForm.querySelector('[name="url"]')?.value?.trim();
      if (!title || !url) {
        showToast('الرجاء ملء الحقول المطلوبة', 'warning');
        if (addBtn) addBtn.disabled = false;
        if (addSpinner) addSpinner.classList.add('d-none');
        adding = false;
        return;
      }

      // تحقق سريع محلي من التكرار
      if (linksList && Array.from(linksList.querySelectorAll('.link-url')).some(el => el.innerText === url)) {
        showToast('هذا الرابط موجود بالفعل', 'warning');
        if (addBtn) addBtn.disabled = false;
        if (addSpinner) addSpinner.classList.add('d-none');
        adding = false;
        return;
      }

      const fd = new FormData(linkForm);
      try {
        const res = await fetch('/admin/links', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd });
        const json = await safeJson(res);
        if (res.status === 201 && json?.link) {
          if (linksList) {
            const newItem = createLinkListItem(json.link);
            linksList.prepend(newItem);
            attachRowHandlers(newItem);
          }
          linkForm.reset();
          showToast('تمت الإضافة بنجاح', 'success');
        } else if (res.status === 409) {
          showToast(json?.message || 'هذا الرابط موجود بالفعل', 'warning');
        } else if (res.status === 422) {
          const errs = json?.errors ? Object.values(json.errors).flat().join(' - ') : 'خطأ في البيانات';
          showToast(errs, 'danger');
        } else {
          showToast('فشل الإضافة، حاول لاحقاً', 'danger');
          console.error('Add unexpected', res.status, json);
        }
      } catch (err) {
        console.error('Add error', err);
        showToast('فشل الاتصال، تحقق من الشبكة', 'danger');
      } finally {
        if (addBtn) addBtn.disabled = false;
        if (addSpinner) addSpinner.classList.add('d-none');
        adding = false;
      }
    });
  }

  // ====== ربط معالجات الصفوف (تعديل/حذف) ======
  function attachRowHandlers(root = document) {
    root.querySelectorAll('.edit-link').forEach(btn => {
      btn.removeEventListener('click', onEditClick);
      btn.addEventListener('click', onEditClick);
    });
    root.querySelectorAll('.delete-link').forEach(btn => {
      btn.removeEventListener('click', onDeleteClick);
      btn.addEventListener('click', onDeleteClick);
    });
  }

  // ====== جلب بيانات عنصر واحد وملء المودال ======
  async function onEditClick(e) {
    const id = this.dataset.id;
    if (!id) { showToast('معرّف غير صالح', 'warning'); return; }
    showGlobalSpinner();
    try {
      // جلب من الخادم (تأكد من وجود GET route)
      const res = await fetch('/admin/links/' + id, { method: 'GET', headers: { 'X-CSRF-TOKEN': CSRF } });
      if (!res.ok) {
        // إذا لم يكن GET متاحاً، املأ من DOM كنسخة احتياطية
        console.warn('Fetch link failed', res.status);
        fillModalFromDOM(id);
        return;
      }
      const data = await res.json();
      fillModalFields(data);
      const modalEl = document.getElementById('linkModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    } catch (err) {
      console.error('onEditClick error', err);
      fillModalFromDOM(id);
    } finally {
      hideGlobalSpinner();
    }
  }

  function fillModalFields(data) {
    document.getElementById('modal-id').value = data.id ?? '';
    document.getElementById('modal-title').value = data.title ?? '';
    document.getElementById('modal-url').value = data.url ?? '';
    document.getElementById('modal-icon').value = data.icon ?? '';
    document.getElementById('modal-active').checked = !!data.is_active;
  }

  function fillModalFromDOM(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (!li) { showToast('تعذر إيجاد بيانات العنصر', 'danger'); return; }
    const title = li.querySelector('.link-title')?.innerText || '';
    const url = li.querySelector('.link-url')?.innerText || '';
    const icon = li.dataset.icon || '';
    const active = li.dataset.active === '1';
    fillModalFields({ id, title, url, icon, is_active: active });
    const modalEl = document.getElementById('linkModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  // ====== حذف عنصر ======
  async function onDeleteClick(e) {
    if (!confirm('هل تريد حذف هذا الرابط؟')) return;
    const id = this.dataset.id;
    showGlobalSpinner();
    try {
      const res = await fetch('/admin/links/' + id, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': CSRF } });
      if (res.ok) {
        const li = document.querySelector(`[data-id="${id}"]`);
        if (li) li.remove();
        showToast('تم الحذف', 'success');
      } else {
        showToast('فشل الحذف', 'danger');
        console.error('Delete failed', res.status, await safeJson(res));
      }
    } catch (err) {
      console.error('Delete error', err);
      showToast('فشل الاتصال', 'danger');
    } finally {
      hideGlobalSpinner();
    }
  }

  // ربط المعالجات للصفوف الحالية
  attachRowHandlers(document);

  // ====== حفظ التعديل من المودال (PUT) ======
  // ====== حفظ التعديل من المودال (آمن ومحسّن) ======
  const modalForm = document.getElementById('linkModalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // تحقق من وجود الحقول الأساسية
      const idEl = document.getElementById('modal-id');
      const titleEl = document.getElementById('modal-title');
      const urlEl = document.getElementById('modal-url');
      const iconEl = document.getElementById('modal-icon');
      const activeEl = document.getElementById('modal-active');

      if (!idEl || !titleEl || !urlEl || !iconEl || !activeEl) {
        // console.error('Modal fields missing', { idEl, titleEl, urlEl, iconEl, activeEl });
        showToast('خطأ داخلي: حقول المودال غير موجودة', 'danger');
        return;
      }

      const saveBtn = modalForm.querySelector('button[type="submit"]');
      if (saveBtn) saveBtn.disabled = true;

      const id = idEl.value;
      const payload = {
        title: titleEl.value.trim(),
        url: urlEl.value.trim(),
        icon: iconEl.value.trim(),
        is_active: activeEl.checked ? 1 : 0
      };

      // تحقق بسيط قبل الإرسال
      if (!payload.title || !payload.url) {
        showToast('الرجاء ملء الحقول المطلوبة', 'warning');
        if (saveBtn) saveBtn.disabled = false;
        return;
      }

      try {
        const res = await fetch('/admin/links/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
          body: JSON.stringify(payload)
        });

        const json = await safeJson(res);
        // سجل الاستجابة للمساعدة في التصحيح
        // console.log('Update response', res.status, json);

        if (res.ok && json?.link) {
          // حاول تحديث DOM بأمان
          const li = document.querySelector(`[data-id="${json.link.id}"]`);
          if (li) {
            const titleNode = li.querySelector('.link-title');
            const urlNode = li.querySelector('.link-url');
            if (titleNode) titleNode.innerText = json.link.title;
            if (urlNode) urlNode.innerText = json.link.url;
            li.dataset.icon = json.link.icon || '';
            li.dataset.active = json.link.is_active ? '1' : '0';
            showToast('تم التحديث', 'success');
          } else {
            // إن لم يوجد العنصر في DOM، أعد تحميل الصفحة كخطة احتياطية
            showToast('تم التحديث — إعادة تحميل لعرض التغييرات', 'success', 1800);
            setTimeout(() => location.reload(), 900);
          }
          // إغلاق المودال إن أمكن
          const modalEl = document.getElementById('linkModal');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        } else if (res.status === 409) {
          showToast(json?.message || 'يوجد رابط بنفس العنوان', 'warning');
        } else if (res.status === 422) {
          const errs = json?.errors ? Object.values(json.errors).flat().join(' - ') : 'خطأ في البيانات';
          showToast(errs, 'danger');
        } else {
          showToast('فشل التحديث، تحقق من السجل', 'danger');
          console.error('Update unexpected', res.status, json);
        }
      } catch (err) {
        console.error('Update error', err);
        showToast('فشل الاتصال، تحقق من الشبكة', 'danger');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }


  // ====== إعادة الترتيب بالسحب (SortableJS) ======
  if (window.Sortable && linksList) {
    Sortable.create(linksList, {
      animation: 150,
      onEnd: async () => {
        const ids = Array.from(linksList.querySelectorAll('[data-id]')).map(li => li.dataset.id);
        showToast('جارٍ حفظ الترتيب...', 'info', 1500);
        try {
          const res = await fetch('/admin/links/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
            body: JSON.stringify({ ids })
          });
          if (res.ok) showToast('تم حفظ الترتيب', 'success');
          else { showToast('فشل حفظ الترتيب', 'danger'); console.error('Reorder failed', res.status, await safeJson(res)); }
        } catch (err) {
          console.error('Reorder error', err);
          showToast('فشل الاتصال', 'danger');
        }
      }
    });
  }

  // ====== إحصاءات وChart.js ======
  const openStats = document.getElementById('open-stats');
  if (openStats) {
    openStats.addEventListener('click', async () => {
      showGlobalSpinner();
      try {
        const res = await fetch('/admin/stats');
        if (!res.ok) { showToast('فشل تحميل الإحصاءات', 'danger'); return; }
        const data = await res.json();
        document.getElementById('stat-visits').innerText = data.visits ?? 0;
        document.getElementById('stat-clicks').innerText = data.clicks ?? 0;

        const ctx = document.getElementById('clicksChart')?.getContext('2d');
        if (ctx) {
          const labels = (data.byLink || []).map(l => l.title);
          const values = (data.byLink || []).map(l => l.clicks || 0);
          const colors = labels.map((_, i) => `hsl(${(i * 47) % 360} 75% 55%)`);
          if (window._clicksChart) window._clicksChart.destroy();
          window._clicksChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'نقرات', data: values, backgroundColor: colors, borderRadius: 6 }] },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#374151' } },
                y: { beginAtZero: true, ticks: { color: '#374151' }, grid: { color: 'rgba(15,23,42,0.06)' } }
              },
              animation: { duration: 600, easing: 'easeOutQuart' }
            }
          });
        }
        document.getElementById('stats-modal').style.display = 'block';
      } catch (err) {
        console.error('Stats error', err);
        showToast('فشل تحميل الإحصاءات', 'danger');
      } finally {
        hideGlobalSpinner();
      }
    });
  }

  const closeStats = document.getElementById('close-stats');
  if (closeStats) closeStats.addEventListener('click', () => { document.getElementById('stats-modal').style.display = 'none'; });

  // Escape لإغلاق الإحصاءات
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const stats = document.getElementById('stats-modal');
      if (stats && stats.style.display === 'block') stats.style.display = 'none';
    }
  });

  // نهاية DOMContentLoaded
});
