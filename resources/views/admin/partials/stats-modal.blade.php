{{-- resources/views/admin/partials/stats-modal.blade.php --}}
{{-- <div id="stats-modal" class="hidden" style="position:fixed;right:20px;top:80px;background:#fff;padding:18px;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,0.12);z-index:999;">
  <h4>إحصاءات سريعة</h4>
  <div>
    <strong>إجمالي الزوار:</strong> {{ \App\Models\Visit::count() }}
  </div>
  <div>
    <strong>إجمالي النقرات:</strong> {{ \App\Models\LinkClick::count() }}
  </div>
  <hr>
  <h5>نقرات حسب الرابط</h5>
  <ul>
    @foreach(\App\Models\Link::where('user_id',1)->get() as $l)
      <li>{{ $l->title }} — <strong>{{ $l->clicks }}</strong></li>
    @endforeach
  </ul>
  <button id="close-stats" onclick="document.getElementById('stats-modal').classList.add('hidden')">إغلاق</button>
</div> --}}
<div id="stats-modal" class="position-fixed top-50 start-50 translate-middle bg-white p-3" style="width:520px;max-width:95%;display:none;z-index:2100;border-radius:12px;">
  <div class="d-flex justify-content-between align-items-center mb-2">
    <h6 class="mb-0">إحصاءات سريعة</h6>
    <div class="d-flex gap-2">
      <button id="export-csv" class="btn btn-sm btn-outline-primary">تصدير CSV</button>
      <button id="close-stats" class="btn-close"></button>
    </div>
  </div>
  <div class="row g-2 mb-3">
    <div class="col"><div class="p-3 bg-light rounded text-center"><div class="h5" id="stat-visits-modal">0</div><small class="text-muted">زوار</small></div></div>
    <div class="col"><div class="p-3 bg-light rounded text-center"><div class="h5" id="stat-clicks-modal">0</div><small class="text-muted">نقرات</small></div></div>
  </div>
  <div style="height:260px"><canvas id="clicksChart"></canvas></div>
</div>




