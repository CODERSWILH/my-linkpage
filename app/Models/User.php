<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    protected $fillable = ['name', 'email', 'password', 'role', 'profile_image', 'settings'];
    protected $hidden = ['password'];
    protected $casts = ['settings' => 'array',];
    public function links()
    {
        return $this->hasMany(Link::class);
    }
    public function themes()
    {
        return $this->hasMany(Theme::class);
    }
}
