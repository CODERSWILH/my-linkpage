<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title','لوحة التحكم')</title>

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Custom dashboard CSS -->
  <link rel="stylesheet" href="/assets/css/admin-dashboard.css">
  <link rel="stylesheet" href="/assets/css/theme-dark.css">

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

  <style>body{font-family:Inter,system-ui,Arial;background:#f6f8fb;color:#0b1220}</style>
  @stack('head')
</head>
<body>
  @yield('content')

  <!-- Toast container & global spinner -->
  <div aria-live="polite" aria-atomic="true" class="position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 1080;">
    <div id="toast-container"></div>
  </div>
  <div id="global-spinner" class="position-fixed top-50 start-50 translate-middle d-none" style="z-index:1090;">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">جارٍ التحميل...</span></div>
  </div>

  <!-- Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>

  <!-- Admin JS final -->
  <script src="/assets/js/admin-final.js" defer></script>
  @stack('scripts')
</body>
</html>
