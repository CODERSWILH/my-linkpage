<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Link;

class LinksSeeder extends Seeder
{
    public function run(): void
    {
        $userId = 1;
        $sample = [
            ['title'=>'موقعي الشخصي','url'=>'https://example.com','icon'=>null,'order'=>1],
            ['title'=>'قناتي','url'=>'https://youtube.com','icon'=>null,'order'=>2],
            ['title'=>'تواصل معي','url'=>'mailto:hello@example.com','icon'=>null,'order'=>3],
        ];
        foreach($sample as $s){
            Link::create(array_merge($s,['user_id'=>$userId]));
        }
    }
}
