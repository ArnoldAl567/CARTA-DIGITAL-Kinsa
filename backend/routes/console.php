<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:cuenta {correo} {--actualizar}', function (): int {
    $email = Str::lower(trim($this->argument('correo')));
    $user = User::where('email', $email)->first();

    if ($user && ! $this->option('actualizar')) {
        $this->error('La cuenta ya existe. Usa --actualizar para cambiar su contraseña.');

        return 1;
    }

    $password = $this->secret('Contraseña (mínimo 12 caracteres)');
    $confirmation = $this->secret('Repite la contraseña');
    $validator = Validator::make([
        'email' => $email,
        'password' => $password,
        'password_confirmation' => $confirmation,
    ], [
        'email' => ['required', 'email', 'max:254'],
        'password' => ['required', 'string', 'min:12', 'max:72', 'confirmed',
            function (string $attribute, string $value, Closure $fail): void {
                if (strlen($value) > 72) {
                    $fail('La contraseña supera los 72 bytes.');
                }
            },
        ],
    ]);

    if ($validator->fails()) {
        $this->error('Verifica el correo y usa una contraseña de 12 a 72 caracteres que coincida en ambos campos.');

        return 1;
    }

    User::updateOrCreate(['email' => $email], ['password' => $password]);
    $this->info('Cuenta de administración guardada.');

    return 0;
})->purpose('Crear una cuenta de administración o actualizar su contraseña');
