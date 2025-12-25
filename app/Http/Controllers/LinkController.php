<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Link;
use App\Models\LinkClick;
use App\Models\Visit;
use Illuminate\Support\Facades\Auth;

class LinkController extends Controller
{
    // الصفحة العامة (single-tenant: user_id = 1)
    public function public(Request $request)
    {
        $userId = 1;
        $links = Link::where('user_id', $userId)->where('is_active', true)->orderBy('order')->get();
 
        Visit::create([
            'user_id' => $userId,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'path' => $request->path()
        ]);

        // اختر الثيم الافتراضي theme1 (يمكن تغييره لاحقاً)
        return view('themes.theme1', compact('links'));
    }

    // لوحة التحكم (محمية عبر middleware auth)
    public function index()
    {
        $userId = 1;
        $links = Link::where('user_id', $userId)->orderBy('order')->get();
        return view('admin.dashboard', compact('links'));
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url|max:1024',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);
        $data['user_id'] = 1;
        $data['is_active'] = $r->has('is_active') ? (bool)$r->input('is_active') : true;
        Link::create($data);
        return back()->with('success','تم إضافة الرابط');
    }

    public function update(Request $r, $id)
    {
        $link = Link::findOrFail($id);
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url|max:1024',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);
        $data['is_active'] = $r->has('is_active') ? (bool)$r->input('is_active') : true;
        $link->update($data);
        return back()->with('success','تم تحديث الرابط');
    }

    public function destroy($id)
    {
        $link = Link::findOrFail($id);
        $link->delete();
        return back()->with('success','تم حذف الرابط');
    }

    // تسجيل نقرة ثم إعادة توجيه
    public function click(Request $r)
    {
        $link = Link::find($r->input('link_id'));
        if ($link) {
            LinkClick::create([
                'link_id' => $link->id,
                'ip' => $r->ip(),
                'referrer' => $r->headers->get('referer')
            ]);
            $link->increment('clicks');
            return response()->json(['redirect' => $link->url]);
        }
        return response()->json(['error' => 'Not found'], 404);
    }
}
