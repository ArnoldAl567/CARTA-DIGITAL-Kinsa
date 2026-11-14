<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_edit_the_catalog_and_control_what_the_public_sees(): void
    {
        $this->seed();
        $product = Product::where('slug', 'kinsa-duo')->firstOrFail();
        $path = "/api/administrar/platos/{$product->id}";
        $changes = [
            'name' => 'Kinsa Dúo editado',
            'description' => 'Descripción actualizada',
            'category_id' => $product->category_id,
            'price_cents' => 2150,
            'available' => false,
        ];

        $this->patchJson($path, $changes)->assertUnauthorized();
        User::create(['email' => 'dueno@example.com', 'password' => 'prueba-panel-2026']);
        $this->postJson('/api/administrar/sesion', ['email' => 'dueno@example.com', 'password' => 'incorrecta'])
            ->assertUnprocessable();
        $this->postJson('/api/administrar/sesion', ['email' => 'dueno@example.com', 'password' => 'prueba-panel-2026'])
            ->assertOk()->assertJsonPath('email', 'dueno@example.com');
        $this->getJson('/api/administrar/platos')->assertOk()->assertJsonCount(19, 'products');

        $this->patchJson($path, $changes)->assertOk()->assertJsonPath('available', false);
        $this->getJson('/api/menu')->assertOk()->assertJsonMissing(['slug' => 'kinsa-duo']);

        $photo = UploadedFile::fake()->image('plato.jpg', 320, 240);
        $response = $this->post($path, [...$changes, 'available' => '1', 'photo' => $photo, '_method' => 'PATCH'])
            ->assertOk()->assertJsonPath('price_cents', 2150);
        $this->seed();
        $this->getJson('/api/menu')->assertOk()->assertJsonFragment([
            'slug' => 'kinsa-duo',
            'description' => 'Descripción actualizada',
            'price_cents' => 2150,
            'image' => $response->json('image'),
        ]);
        $this->get($response->json('image'))->assertOk()->assertHeader('Content-Type', 'image/jpeg');

        $this->deleteJson('/api/administrar/sesion')->assertOk()->assertJsonPath('email', null);
        $this->getJson('/api/administrar/platos')->assertUnauthorized();
    }

    public function test_the_limit_counts_hidden_products_and_allows_the_thirtieth_product(): void
    {
        $this->seed();
        $this->actingAs(User::create(['email' => 'dueno@example.com', 'password' => 'prueba-panel-2026']));
        $product = Product::where('slug', 'kinsa-duo')->firstOrFail();
        for ($index = Product::count(); $index < 29; $index++) {
            $copy = $product->replicate();
            $copy->fill(['slug' => 'prueba-'.Str::random(12), 'available' => false])->save();
        }

        $data = [
            'name' => 'Último plato',
            'category_id' => $product->category_id,
            'price_cents' => 1400,
            'available' => '1',
        ];
        $this->post('/api/administrar/platos', [...$data, 'photo' => UploadedFile::fake()->image('plato.jpg')])
            ->assertCreated();
        $this->post('/api/administrar/platos', [...$data, 'photo' => UploadedFile::fake()->image('plato.jpg')])
            ->assertUnprocessable()->assertJsonValidationErrors('limit');
        $this->assertDatabaseCount('products', 30);
    }
}
