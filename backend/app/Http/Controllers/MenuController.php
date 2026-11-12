<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $categories = Category::query()
            ->select('id', 'slug', 'name', 'short_name')
            ->orderBy('position')
            ->with('products')
            ->get();

        return response()->json(['categories' => $categories]);
    }
}
