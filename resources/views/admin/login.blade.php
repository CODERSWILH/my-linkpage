<!doctype html>
<html>
<head><meta charset="utf-8"><title>Admin Login</title></head>
<body>
  <h2>تسجيل دخول المدير</h2>
  @if($errors->any()) <div style="color:red">{{$errors->first()}}</div> @endif
  <form method="post" action="{{ route('admin.login.post') }}">
    @csrf
    <label>البريد<input type="email" name="email" value="{{ old('email') }}"></label><br>
    <label>كلمة المرور<input type="password" name="password"></label><br>
    <button type="submit">دخول</button>
  </form>
</body>
</html>
