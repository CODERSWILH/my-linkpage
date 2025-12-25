<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'theme_key', 'settings'];
    protected $casts = ['settings' => 'array'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
