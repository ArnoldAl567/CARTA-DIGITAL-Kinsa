<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['slug', 'name', 'short_name', 'position'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class)
            ->select('category_id', 'slug', 'name', 'description', 'price_cents', 'image')
            ->where('available', true)
            ->orderBy('position');
    }
}
