<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['slug', 'category_id', 'name', 'description', 'price_cents', 'image', 'position'];

    protected $hidden = ['category_id'];

    protected function casts(): array
    {
        return ['price_cents' => 'integer'];
    }
}
