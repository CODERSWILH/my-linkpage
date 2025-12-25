{{-- resources/views/themes/theme2.blade.php --}}
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>صفحة الروابط - Dark Glass</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body{font-family:Inter,system-ui;background:linear-gradient(180deg,#071029 0%,#0b1220 100%);color:#e6eef8;min-height:100vh}
    .glass{backdrop-filter: blur(8px);background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.06);border-radius:16px}
    .avatar{width:130px;height:130px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.06)}
    .owner-name{font-weight:700}
    .link-card{transition:transform .18s,box-shadow .18s}
    .link-card:hover{transform:translateY(-8px);box-shadow:0 30px 60px rgba(2,6,23,0.6)}
    .muted{color:rgba(230,238,248,0.7)}
    .container-center{max-width:760px;margin:0 auto;padding:64px 16px;text-align:center}
  </style>
</head>
<body>
  <main class="container-center">
    <div class="glass p-4 d-inline-block text-center">
      <img id="profile-pic" src="/assets/images/default-profile.png" alt="profile" class="avatar mb-3">
      <h1 class="owner-name">الاسم الراقي</h1>
      <p class="muted mb-3">سطر يصف الهوية بأسلوب عصري وغامق.</p>
    </div>

    <div class="mt-4 d-grid gap-3" style="max-width:720px;margin:24px auto 0;">
      @foreach($links as $link)
        <a href="{{ $link->url }}" class="link-card text-decoration-none glass p-3 d-flex align-items-center justify-content-between" data-id="{{ $link->id }}">
        
          <div class="text-end">
            <div class="fw-semibold">{{ $link->title }}</div>
            <small class="muted">{{ \Illuminate\Support\Str::limit($link->url, 50) }}</small>
          </div>
          <div class="ms-3"><span class="badge bg-gradient rounded-pill" style="background:linear-gradient(90deg,#7c3aed,#06b6d4)">فتح</span></div>
        </a>
      @endforeach
    </div>
  </main>

  <!-- Hidden login modal trigger -->
  <div id="hidden-login" class="position-fixed bottom-0 start-0 m-4 hidden">
    <form method="GET" action="{{ route('login') }}">
      <button class="btn btn-outline-light">دخول المدير</button>
    </form>
  </div>

  <script>
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    document.querySelectorAll('[data-id]').forEach(el=>{
      el.addEventListener('click', function(e){
        e.preventDefault();
        const id=this.dataset.id, href=this.getAttribute('href');
        fetch('{{ route("api.click") }}',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrfToken},body:JSON.stringify({link_id:id})})
        .then(r=>r.json()).then(data=>{ if(data.redirect) window.location.href=data.redirect; else window.location.href=href; })
        .catch(()=>window.location.href=href);
      });
    });

    (function(){
      const profile=document.getElementById('profile-pic'); if(!profile) return;
      let clicks=0,timer=null;
      profile.addEventListener('dblclick', ()=>{ /* dblclick reveals small hint */ });
      profile.addEventListener('click', ()=>{
        clicks++; if(timer) clearTimeout(timer); timer=setTimeout(()=>clicks=0,2000);
        if(clicks>=4){ clicks=0; document.getElementById('hidden-login').classList.toggle('hidden'); profile.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:260}); }
      });
    })();
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
</body>
</html>
