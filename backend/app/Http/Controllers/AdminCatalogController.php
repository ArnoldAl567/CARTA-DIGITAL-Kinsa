<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'limit' => Product::CATALOG_LIMIT,
            'categories' => Category::orderBy('position')->get(['id', 'name', 'short_name']),
            'products' => Product::orderBy('category_id')->orderBy('position')->get()
                ->map(fn (Product $product) => $product->makeVisible('category_id')),
        ])->header('Cache-Control', 'no-store, private');
    }

    public function store(Request $request): JsonResponse
    {
        $product = $this->save($request, new Product);

        return response()->json($product->makeVisible('category_id'), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        return response()->json($this->save($request, $product)->makeVisible('category_id'));
    }

    public function photo(int $product, string $version): Response
    {
        $photo = DB::table('product_photos')->where('product_id', $product)
            ->where('version', $version)->first();
        abort_if($photo === null, 404);

        return response(base64_decode($photo->content), 200, [
            'Content-Type' => $photo->mime,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function save(Request $request, Product $product): Product
    {
        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'price_cents' => ['required', 'integer', 'min:1', 'max:999999'],
            'available' => ['required', 'boolean'],
            'photo' => [$product->exists ? 'sometimes' : 'required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
        $data = $request->validate($rules, [
            'name.required' => 'Escribe el nombre del plato.',
            'name.max' => 'El nombre puede tener hasta 100 caracteres.',
            'category_id.exists' => 'Selecciona una categoría de la carta.',
            'description.max' => 'La descripción puede tener hasta 255 caracteres.',
            'price_cents.min' => 'Ingresa un precio de al menos S/ 0.01.',
            'price_cents.max' => 'Ingresa un precio de hasta S/ 9999.99.',
            'photo.required' => 'Agrega una foto del plato.',
            'photo.image' => 'Usa una imagen JPG, PNG o WebP.',
            'photo.mimes' => 'Usa una imagen JPG, PNG o WebP.',
            'photo.max' => 'La foto puede pesar hasta 2 MB.',
        ]);
        $photo = $request->file('photo');
        unset($data['photo']);

        return DB::transaction(function () use ($data, $photo, $product): Product {
            if (! $product->exists) {
                // Serializa las altas para que dos solicitudes no ocupen el último cupo.
                Category::orderBy('id')->lockForUpdate()->firstOrFail();

                if (Product::count() >= Product::CATALOG_LIMIT) {
                    throw ValidationException::withMessages(['limit' => 'La carta ya tiene 30 platos registrados.']);
                }

                $slug = Str::slug(Str::limit($data['name'], 60, '')) ?: 'plato';
                $product->slug = $slug.'-'.Str::lower(Str::random(12));
                $product->image = '';
            }

            if (! $product->exists || $product->category_id != $data['category_id']) {
                $product->position = Product::where('category_id', $data['category_id'])->max('position') + 1;
            }

            $product->fill($data)->save();

            if ($photo) {
                $version = (string) Str::uuid();
                DB::table('product_photos')->updateOrInsert(['product_id' => $product->id], [
                    'version' => $version,
                    'mime' => $photo->getMimeType(),
                    'content' => base64_encode($photo->getContent()),
                ]);

                $product->update(['image' => "/api/menu/fotos/{$product->id}/{$version}"]);
            }

            return $product;
        });
    }
}
