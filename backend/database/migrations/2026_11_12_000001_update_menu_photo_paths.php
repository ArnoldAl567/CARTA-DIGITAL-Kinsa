<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PRODUCTS = [
        'kinsa-duo', 'ala-doble', 'kinsa-trio', 'mostrito', 'ala-broaster',
        'pecho-broaster', 'muslo-broaster', 'acevichadas', 'buffalo', 'maracuya-alitas',
        'honey-mustard', 'bbq', 'salchipapa', 'choripapa', 'hamburguesa',
        'coca-cola', 'inca-kola', 'chicha-morada', 'maracuya-bebida',
    ];

    public function up(): void
    {
        $this->updatePhotoPaths('/images', '/images/catalogo');
    }

    public function down(): void
    {
        $this->updatePhotoPaths('/images/catalogo', '/images');
    }

    private function updatePhotoPaths(string $oldDirectory, string $newDirectory): void
    {
        foreach (self::PRODUCTS as $slug) {
            DB::table('products')
                ->where('slug', $slug)
                ->where('image', "$oldDirectory/$slug.webp")
                ->update(['image' => "$newDirectory/$slug.webp"]);
        }
    }
};
