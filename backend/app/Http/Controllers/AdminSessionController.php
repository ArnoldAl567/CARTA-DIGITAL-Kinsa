<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminSessionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['email' => $request->user()?->email])
            ->header('Cache-Control', 'no-store, private');
    }

    public function store(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:254'],
            'password' => ['required', 'string', 'max:72'],
        ]);
        $credentials['email'] = Str::lower($credentials['email']);

        if (strlen($credentials['password']) > 72 || ! Auth::attempt($credentials)) {
            return response()->json(['message' => 'El correo o la contraseña son incorrectos.'], 422);
        }

        $request->session()->regenerate();

        return $this->show($request);
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->show($request);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'max:72'],
            'password' => ['required', 'string', 'min:12', 'max:72', 'confirmed', 'different:current_password'],
        ], [
            'current_password.required' => 'Ingresa tu contraseña actual.',
            'password.required' => 'Ingresa una contraseña nueva.',
            'password.min' => 'La contraseña nueva debe tener al menos 12 caracteres.',
            'password.max' => 'La contraseña nueva puede tener hasta 72 caracteres.',
            'password.confirmed' => 'Las contraseñas nuevas no coinciden.',
            'password.different' => 'Elige una contraseña distinta de la actual.',
        ]);

        if (strlen($data['password']) > 72 || str_contains($data['password'], "\0")) {
            throw ValidationException::withMessages(['password' => 'Usa una contraseña de hasta 72 bytes.']);
        }

        DB::transaction(function () use ($request, $data): void {
            $user = $request->user()->newQuery()->lockForUpdate()->findOrFail($request->user()->getKey());
            if (strlen($data['current_password']) > 72 || str_contains($data['current_password'], "\0")
                || ! Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages(['current_password' => 'La contraseña actual es incorrecta.']);
            }

            $user->update(['password' => $data['password']]);
            if (config('session.driver') === 'database') {
                DB::connection(config('session.connection'))->table(config('session.table'))
                    ->where('user_id', $user->getKey())->delete();
            }
            $request->session()->regenerate(true);
        });

        return $this->show($request);
    }
}
