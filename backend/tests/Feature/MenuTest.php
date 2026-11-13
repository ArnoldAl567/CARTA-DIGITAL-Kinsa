<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_the_catalog_with_current_prices_after_reseeding(): void
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
            'kinsa-duo' => 2000,
            'ala-doble' => 1600,
            'kinsa-trio' => 3000,
            'mostrito' => 1800,
            'ala-broaster' => 1000,
            'pecho-broaster' => 1400,
            'muslo-broaster' => 1300,
            'acevichadas' => 1500,
            'buffalo' => 1500,
            'maracuya-alitas' => 1500,
            'honey-mustard' => 1500,
            'bbq' => 1500,
            'salchipapa' => 1000,
            'choripapa' => 1200,
            'hamburguesa' => 1200,
            'coca-cola' => 400,
            'inca-kola' => 400,
            'chicha-morada' => 800,
            'maracuya-bebida' => 800,
        ], $prices);
    }
}
