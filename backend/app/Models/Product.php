<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public const CATALOG_LIMIT = 30;

    protected $fillable = ['slug', 'category_id', 'name', 'description', 'price_cents', 'image', 'position', 'available'];

    protected $hidden = ['category_id'];

    protected function casts(): array
    {
        return ['price_cents' => 'integer', 'available' => 'boolean'];
    }
}
