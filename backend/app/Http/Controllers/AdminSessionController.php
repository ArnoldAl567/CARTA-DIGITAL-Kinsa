<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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
}
