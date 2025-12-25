@extends('layouts.app')
@section('title','لوحة التحكم')

@section('content')
<div class="container">
  <div class="row g-3 align-items-stretch mb-4">
    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-primary text-white me-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="currentColor"/><path d="M2 20a10 10 0 0120 0H2z" fill="currentColor"/></svg>
        </div>
        <div class="stat-body text-end w-100">
          <div class="stat-value" id="stat-visits">0</div>
          <div class="stat-label">زوار</div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-success text-white me-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" stroke-width="1.6"/></svg>
        </div>
        <div class="stat-body text-end w-100">
          <div class="stat-value" id="stat-clicks">0</div>
          <div class="stat-label">نقرات</div>
        </div>
      </div>
    </div>

    <div class="col-md-4 d-flex justify-content-end align-items-start">
      <div class="action-group d-flex gap-2">
        <button id="open-add" class="btn btn-add px-3 py-2">
          <svg width="16" height="16" class="me-1"><use xlink:href="/assets/icons/icons.svg#icon-add"></use></svg>
          إضافة رابط
        </button>
        <button id="open-stats" class="btn btn-outline-secondary px-3">عرض الإحصاءات</button>
        <button id="theme-toggle" class="btn btn-outline-secondary px-3">ثيم</button>
        <button id="logout-btn" class="btn btn-outline-danger px-3">تسجيل خروج</button>
      </div>
    </div>
  </div>

  <div class="card mb-4">
    <div class="card-body">
      <canvas id="mainChart" height="80"></canvas>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">الروابط</h5>
      <small class="text-muted">اسحب المقبض لإعادة الترتيب</small>
    </div>
    <ul id="links-list" class="list-group list-group-flush">
      @foreach($links as $link)
        <li class="list-group-item" data-id="{{ $link->id }}" data-icon="{{ $link->icon ?? '' }}" data-active="{{ $link->is_active ? '1' : '0' }}">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center gap-3">
              <span class="drag-handle" title="اسحب لإعادة الترتيب" aria-hidden="true">
                <svg width="20" height="20"><use xlink:href="/assets/icons/icons.svg#icon-drag"></use></svg>
              </span>
              <div class="link-meta text-end">
                <div class="link-title">{{ $link->title }}</div>
                <div class="link-url">{{ $link->url }}</div>
              </div>
            </div>
            <div class="link-actions d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary edit-link" data-id="{{ $link->id }}">
                <svg width="14" height="14"><use xlink:href="/assets/icons/icons.svg#icon-edit"></use></svg> تعديل
              </button>
              <button class="btn btn-sm btn-outline-danger delete-link" data-id="{{ $link->id }}">
                <svg width="14" height="14"><use xlink:href="/assets/icons/icons.svg#icon-delete"></use></svg> حذف
              </button>
            </div>
          </div>
        </li>
      @endforeach
    </ul>
  </div>
</div>

@include('admin.partials.link-modal')
@include('admin.partials.stats-modal')
@include('admin.partials.logout-modal')
@endsection
