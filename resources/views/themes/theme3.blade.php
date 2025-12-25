{{-- resources/views/themes/theme3.blade.php --}}
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>صفحة الروابط - Vibrant Artistic</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body{font-family:Poppins,system-ui;background:linear-gradient(135deg,#fff0f6,#ecfeff);min-height:100vh;color:#0b1220}
    .avatar{width:120px;height:120px;border-radius:20px;object-fit:cover;box-shadow:0 10px 30px rgba(99,102,241,0.12)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;max-width:980px;margin:24px auto}
    .pill{background:#fff;border-radius:14px;padding:14px;text-align:center;transition:transform .18s,box-shadow .18s}
    .pill:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(99,102,241,0.12)}
    .accent{background:linear-gradient(90deg,#ff6b6b,#7c3aed);-webkit-background-clip:text;background-clip:text;color:transparent}
    .share-btn{position:fixed;left:18px;bottom:18px;z-index:999}
  </style>
</head>
<body>
  <header class="text-center py-4">
    <img id="profile-pic" src="/assets/images/default-profile.png" alt="profile" class="avatar mb-2">
    <h1 class="h4 accent">اسم مبدع</h1>
    <p class="text-muted">سطر مرح يصف الإبداع والذوق.</p>
  </header>

  <main class="container">
    <div class="grid">
      @foreach($links as $link)
        <a href="{{ $link->url }}" class="pill text-decoration-none" data-id="{{ $link->id }}">
          <div class="fw-semibold">{{ $link->title }}</div>
          <small class="text-muted">{{ \Illuminate\Support\Str::limit($link->url, 40) }}</small>
        </a>
      @endforeach
    </div>
  </main>

  <div class="share-btn">
    <button class="btn btn-lg btn-gradient" style="background:linear-gradient(90deg,#ff7a59,#ff3cac);color:#fff;border-radius:12px">مشاركة</button>
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
      profile.addEventListener('click', ()=>{
        clicks++; if(timer) clearTimeout(timer); timer=setTimeout(()=>clicks=0,2000);
        if(clicks>=3){ clicks=0; alert('مرحبا بك في لوحة الإدارة — اضغط للدخول'); document.getElementById('hidden-login')?.classList.toggle('hidden'); }
      });
    })();
  </script>
    <div id="hidden-login" class="position-fixed bottom-0 start-0 m-4 hidden">
    <form method="GET" action="{{ route('login') }}">
      <button class="btn btn-outline-dark">دخول المدير</button>
    </form>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>

</body>
</html>
