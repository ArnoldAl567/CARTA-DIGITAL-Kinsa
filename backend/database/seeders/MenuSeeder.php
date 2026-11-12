<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menu = [
            ['promos', 'Promociones y combos', 'Combos', [
                ['kinsa-duo', 'Promo Kinsa Dúo', 2500, 'Muslo y ala broaster, papas fritas y dos Pepsi de 355 ml.'],
                ['ala-doble', 'Promo Ala Doble', 2000, 'Dos alas broaster con papas fritas.'],
                ['kinsa-trio', 'Promo Kinsa Trío', 3800, 'Pecho, muslo y ala broaster, papas fritas y tres Pepsi.'],
            ]],
            ['broaster', 'Pollo broaster y platos especiales', 'Broaster', [
                ['mostrito', 'Mostrito', 2300, 'Arroz chaufa, papas fritas y muslo broaster.'],
                ['ala-broaster', 'Ala Broaster', 1300, 'Ala broaster con papas fritas.'],
                ['pecho-broaster', 'Pecho Broaster', 1800, 'Pecho broaster con papas fritas.'],
                ['muslo-broaster', 'Muslo Broaster', 1700, 'Muslo broaster con papas fritas.'],
            ]],
            ['alitas', 'Alitas especiales', 'Alitas', [
                ['acevichadas', 'Alitas Acevichadas', 2000, '6 unidades.'],
                ['buffalo', 'Alitas Buffalo', 2000, '6 unidades.'],
                ['maracuya-alitas', 'Alitas en Salsa de Maracuyá', 2000, '6 unidades.'],
                ['honey-mustard', 'Alitas Honey Mustard', 2000, '6 unidades.'],
                ['bbq', 'Alitas BBQ', 2000, '6 unidades.'],
            ]],
            ['salchipapas-hamburguesas', 'Salchipapas y hamburguesas', 'Salchipapas y burgers', [
                ['salchipapa', 'Salchipapa', 1300, null],
                ['choripapa', 'Choripapa', 1600, null],
                ['hamburguesa', 'Hamburguesa Kinsa', 1600, null],
            ]],
            ['bebidas', 'Bebidas', 'Bebidas', [
                ['coca-cola', 'Coca-Cola 600 ml', 600, null],
                ['inca-kola', 'Inca Kola 600 ml', 600, null],
                ['chicha-morada', 'Chicha Morada 1 litro', 1000, null],
                ['maracuya-bebida', 'Maracuyá 1 litro', 1000, null],
            ]],
        ];

        DB::transaction(function () use ($menu): void {
            foreach ($menu as $categoryPosition => [$slug, $name, $shortName, $products]) {
                $category = Category::updateOrCreate(['slug' => $slug], [
                    'name' => $name,
                    'short_name' => $shortName,
                    'position' => $categoryPosition + 1,
                ]);

                foreach ($products as $productPosition => [$productSlug, $productName, $price, $description]) {
                    Product::updateOrCreate(['slug' => $productSlug], [
                        'category_id' => $category->id,
                        'name' => $productName,
                        'description' => $description,
                        'price_cents' => $price,
                        'image' => "/images/catalogo/{$productSlug}.webp",
                        'position' => $productPosition + 1,
                    ]);
                }
            }
        });
    }
}
