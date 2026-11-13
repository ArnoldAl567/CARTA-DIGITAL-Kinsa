<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PRICES = [
        'kinsa-duo' => [2500, 2000],
        'ala-doble' => [2000, 1600],
        'kinsa-trio' => [3800, 3000],
        'mostrito' => [2300, 1800],
        'ala-broaster' => [1300, 1000],
        'pecho-broaster' => [1800, 1400],
        'muslo-broaster' => [1700, 1300],
        'acevichadas' => [2000, 1500],
        'buffalo' => [2000, 1500],
        'maracuya-alitas' => [2000, 1500],
        'honey-mustard' => [2000, 1500],
        'bbq' => [2000, 1500],
        'salchipapa' => [1300, 1000],
        'choripapa' => [1600, 1200],
        'hamburguesa' => [1600, 1200],
        'coca-cola' => [600, 400],
        'inca-kola' => [600, 400],
        'chicha-morada' => [1000, 800],
        'maracuya-bebida' => [1000, 800],
    ];

    public function up(): void
    {
        foreach (self::PRICES as $slug => [, $price]) {
            DB::table('products')->where('slug', $slug)->update(['price_cents' => $price]);
        }
    }

    public function down(): void
    {
        foreach (self::PRICES as $slug => [$previous, $price]) {
            DB::table('products')
                ->where('slug', $slug)
                ->where('price_cents', $price)
                ->update(['price_cents' => $previous]);
        }
    }
};
