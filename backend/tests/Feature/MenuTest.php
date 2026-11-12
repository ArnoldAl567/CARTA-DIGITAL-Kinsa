<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_the_pdf_catalog_after_reseeding(): void
    {
        $this->seed();
        $this->seed();

        $response = $this->getJson('/api/menu')
            ->assertOk()
            ->assertJsonCount(5, 'categories')
            ->assertJsonPath('categories.0.products.0.image', '/images/catalogo/kinsa-duo.webp');

        $prices = collect($response->json('categories'))
            ->pluck('products')
            ->flatten(1)
            ->pluck('price_cents', 'slug')
            ->all();

        $this->assertSame([
            'kinsa-duo' => 2500,
            'ala-doble' => 2000,
            'kinsa-trio' => 3800,
            'mostrito' => 2300,
            'ala-broaster' => 1300,
            'pecho-broaster' => 1800,
            'muslo-broaster' => 1700,
            'acevichadas' => 2000,
            'buffalo' => 2000,
            'maracuya-alitas' => 2000,
            'honey-mustard' => 2000,
            'bbq' => 2000,
            'salchipapa' => 1300,
            'choripapa' => 1600,
            'hamburguesa' => 1600,
            'coca-cola' => 600,
            'inca-kola' => 600,
            'chicha-morada' => 1000,
            'maracuya-bebida' => 1000,
        ], $prices);
    }
}
