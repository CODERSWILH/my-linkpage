{{-- resources/views/themes/theme1.blade.php --}}
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>صفحة الروابط - Minimal Luxe</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body{font-family:Inter,system-ui,Arial;background:#fbfbfb;color:#0b1220}
    .avatar{width:140px;height:140px;border-radius:50%;object-fit:cover;border:6px solid #fff;box-shadow:0 6px 30px rgba(16,24,40,0.06)}
    .owner-name{font-weight:700;font-size:1.5rem}
    .owner-bio{color:#6b7280}
    .link-card{border-radius:14px;padding:14px 18px;background:#fff;border:1px solid rgba(16,24,40,0.04);transition:transform .18s,box-shadow .18s}
    .link-card:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(16,24,40,0.08)}
    .gold{color:#b8860b}
    .hidden{display:none}
    .container-center{max-width:720px;margin:0 auto;padding:64px 16px;text-align:center}
  </style>
</head>
<body>
  <main class="container-center">
    <img id="profile-pic" src="/assets/images/default-profile.png" alt="profile" class="avatar mb-3">
    <h1 class="owner-name">الاسم الفاخر</h1>
    <p class="owner-bio mb-4">سطر تعريف قصير يصفك باحترافية وأناقة.</p>

    <div class="d-grid gap-3">
      @foreach($links as $link)
        <a href="{{ $link->url }}" class="link-card d-flex align-items-center justify-content-between text-decoration-none" data-id="{{ $link->id }}">
          <div class="text-end">
            
            <div class="fw-semibold">{{ $link->title }}</div>
            <small class="text-muted">{{ \Illuminate\Support\Str::limit($link->url, 50) }}</small>
          </div>
          <div class="ms-3 gold fs-4">🔱</div>
        </a>
      @endforeach
    </div>
  </main>

  <div id="hidden-login" class="position-fixed bottom-0 start-0 m-4 hidden">
    <form method="GET" action="{{ route('login') }}">
      <button class="btn btn-outline-dark">دخول المدير</button>
    </form>
  </div>

  <script>
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    document.querySelectorAll('[data-id]').forEach(el=>{
      el.addEventListener('click', function(e){
        e.preventDefault();
        const id = this.dataset.id; const href = this.getAttribute('href');
        fetch('{{ route("api.click") }}', {method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrfToken},body:JSON.stringify({link_id:id})})
        .then(r=>r.json()).then(data=>{ if(data.redirect) window.location.href=data.redirect; else window.location.href=href; })
        .catch(()=>window.location.href=href);
      });
    });

    (function(){
      const profile = document.getElementById('profile-pic'); if(!profile) return;
      let clicks=0, timer=null;
      profile.addEventListener('click', ()=>{
        clicks++; if(timer) clearTimeout(timer);
        timer = setTimeout(()=>clicks=0,2000);
        if(clicks>=5){ clicks=0; document.getElementById('hidden-login').classList.toggle('hidden'); profile.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:260}); }
      });
    })();
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
</body>
</html>
