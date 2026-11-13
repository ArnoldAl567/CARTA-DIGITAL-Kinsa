# Carta digital de Kinsa T’iqsi

La carta carga los productos y precios desde PostgreSQL a través de Laravel. Angular muestra el catálogo y guarda las cantidades del carrito en el navegador. Al confirmar, abre WhatsApp con el mensaje preparado para el restaurante.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `frontend/src/app/menu` | Catálogo, consulta a la API y tarjeta de producto |
| `frontend/src/app/order` | Carrito, cantidades, total y mensaje de WhatsApp |
| `frontend/public/images` | Logo, recortes originales y versiones WebP del catálogo |
| `backend/routes` y `backend/app` | API `GET /api/menu`, controlador y modelos |
| `backend/database` | Migración de PostgreSQL y carga inicial del catálogo |

## Cómo iniciar

Requisitos: PHP 8.3 o superior con `pdo_pgsql`, Composer, PostgreSQL y Node.js 22.12+ de la rama 22 o Node.js 24.

1. Crea una base de datos PostgreSQL llamada `kinsa` con un usuario que pueda crear tablas en ella.
2. En PowerShell, desde la raíz, instala y configura el backend.

   ```powershell
   cd backend
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   composer install
   ```

3. Si `APP_KEY` está vacía, ejecuta `php artisan key:generate`. Ajusta las variables `DB_*` de `backend/.env` con tus credenciales y ejecuta:

   ```powershell
   php artisan migrate --seed
   php artisan serve --host=127.0.0.1 --port=8000
   ```

4. Abre otra terminal desde la raíz y arranca Angular.

   ```powershell
   cd frontend
   npm ci
   npm start
   ```

5. Abre [la carta local](http://localhost:4200). El proxy de desarrollo envía `/api/**` a Laravel en el puerto 8000.

## Catálogo y fotografías

La carga inicial está en `backend/database/seeders/MenuSeeder.php`. Si cambias el archivo, aplica los cambios con `php artisan db:seed --class=MenuSeeder`. Los productos se actualizan por su identificador y los importes se expresan en céntimos.

Las imágenes de `frontend/public/images/catalogo` son versiones generadas con IA a partir de las referencias del PDF. Para sustituir una foto, usa el mismo nombre de archivo y un encuadre 3:2 que muestre el plato completo. La portada muestra el mural proporcionado para Kinsa T’iqsi, guardado como `frontend/public/images/portada/mural-kinsa.webp`.

## Compilación y publicación

- Ejecuta `php artisan test` en `backend` para comprobar las categorías y los precios.
- Ejecuta `npm run build` en `frontend` para generar `frontend/dist/kinsa-carta/browser`.
- Publica Laravel con `backend/public` como raíz, PostgreSQL configurado y `APP_DEBUG=false`. Ejecuta `php artisan migrate --force` y carga el catálogo con `php artisan db:seed --force` cuando inicialices la base.
- En Vercel, crea un proyecto para `backend` y otro para `frontend` con esas carpetas como raíces. El backend usa el runtime comunitario de PHP y Node.js 22 para la compilación. El frontend incluye una reescritura de `/api/*` a `https://carta-digital-kinsa-api.vercel.app`. Si la API recibe otro dominio, ajusta `frontend/vercel.json`. [Documentación de reescrituras de Vercel](https://vercel.com/docs/routing/rewrites)
- Conecta Neon al proyecto del backend mediante `DATABASE_URL`. Configura `DB_CONNECTION=pgsql`, `DB_SSLMODE=require`, `APP_ENV=production`, `APP_DEBUG=false`, `LOG_CHANNEL=stderr`, `CACHE_STORE=array`, `SESSION_DRIVER=array`, `QUEUE_CONNECTION=sync` y una `APP_KEY` propia para producción. Ejecuta las migraciones y la carga inicial con la conexión de Neon antes de abrir la carta al público.
