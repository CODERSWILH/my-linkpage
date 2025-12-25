<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Link;
use App\Models\LinkClick;
use App\Models\Visit;
use Illuminate\Support\Facades\Validator;

class LinkAdminController extends Controller
{
    public function index()
    {
        $links = Link::where('user_id', 1)->orderBy('order')->get();
        return view('admin.dashboard', compact('links'));
    }

    // app/Http/Controllers/Admin/LinkAdminController.php (store method)
    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'url'   => 'required|url|max:1024',
            'icon'  => 'nullable|string|max:255',
        ]);

        $userId = auth()->id ?? 1;

        if (Link::where('user_id', $userId)->where('url', $data['url'])->exists()) {
            return response()->json(['message' => 'هذا الرابط موجود بالفعل'], 409);
        }

        $link = Link::create([
            'user_id' => $userId,
            'title'   => $data['title'],
            'url'     => $data['url'],
            'icon'    => $data['icon'] ?? null,
            'order'   => (int) Link::where('user_id', $userId)->max('order') + 1,
            'is_active' => true,
        ]);

        return response()->json(['link' => $link], 201);
    }



    public function update(Request $r, $id)
    {
        $link = Link::findOrFail($id);
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url|max:1024',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);
        // تحقق من تكرار URL مع روابط أخرى
        if (Link::where('user_id', $link->user_id)->where('url', $data['url'])->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'يوجد رابط بنفس العنوان بالفعل'], 409);
        }
        $link->update($data);
        return response()->json(['link' => $link]);
    }

    public function destroy($id)
    {
        $link = Link::findOrFail($id);
        $link->delete();
        return response()->json(['deleted' => true]);
    }


    public function show($id)
    {
        $link = Link::findOrFail($id);
        return response()->json([
            'id' => $link->id,
            'title' => $link->title,
            'url' => $link->url,
            'icon' => $link->icon,
            'is_active' => (bool) $link->is_active,
            'order' => $link->order,
        ]);
    }




    public function reorder(Request $r)
    {
        $ids = $r->input('ids', []);
        foreach ($ids as $index => $id) {
            Link::where('id', $id)->update(['order' => $index + 1]);
        }
        return response()->json(['ok' => true]);
    }

    public function stats()
    {
        $totalVisits = Visit::count();
        $totalClicks = LinkClick::count();
        $byLink = Link::where('user_id', 1)->get(['id', 'title', 'clicks']);
        return response()->json(['visits' => $totalVisits, 'clicks' => $totalClicks, 'byLink' => $byLink]);
    }
    // تسجيل نقرة ثم إعادة توجيه
    // public function click(Request $r)
    // {
    //     $link = Link::find($r->input('link_id'));
    //     if ($link) {
    //         LinkClick::create([
    //             'link_id' => $link->id,
    //             'ip' => $r->ip(),
    //             'referrer' => $r->headers->get('referer')
    //         ]);
    //         $link->increment('clicks');
    //         return response()->json(['redirect' => $link->url]);
    //     }
    //     return response()->json(['error' => 'الرابط غير موجود'], 404);
    // }
}
