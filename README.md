# Carta digital de Kinsa T’iqsi

La carta carga los productos y precios desde PostgreSQL a través de Laravel. Angular muestra el catálogo y guarda las cantidades del carrito en el navegador. Al confirmar, abre WhatsApp con el mensaje preparado para el restaurante.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `frontend/src/app/menu` | Catálogo, consulta a la API y tarjeta de producto |
| `frontend/src/app/order` | Carrito, cantidades, total y mensaje de WhatsApp |
| `frontend/public/images` | Logo, recortes originales y versiones WebP del catálogo |
| `frontend/src/app/admin` | Panel de administración en `/administrar` |
| `backend/routes` y `backend/app` | API de la carta, inicio de sesión y administración del catálogo |
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

La carga inicial está en `backend/database/seeders/MenuSeeder.php`. El seeder registra los platos iniciales que falten y conserva las ediciones de los que ya existen. Los importes se guardan en céntimos.

Las imágenes iniciales de `frontend/public/images/catalogo` son versiones generadas con IA a partir de las referencias del PDF. La portada combina la foto de la pareja con el mural de Kinsa T’iqsi y está disponible en dos resoluciones en `frontend/public/images/portada`.

## Administrar la carta

1. En `backend`, aplica las migraciones con `php artisan migrate`.
2. Crea la cuenta del dueño con `php artisan admin:cuenta correo@ejemplo.com`. La consola pedirá la contraseña de forma interactiva. Agrega `--actualizar` para cambiar la contraseña de una cuenta existente.
3. Abre [el panel local](http://127.0.0.1:4200/administrar) e inicia sesión.

Desde el panel puedes registrar y editar hasta 30 platos. El límite incluye platos ocultos. Puedes cambiar su nombre, categoría, descripción, precio y visibilidad. Las fotos JPG, PNG o WebP de hasta 2 MB se guardan en PostgreSQL y se sirven a través de la API. Recarga la carta pública para ver los cambios.

## Compilación y publicación

- Ejecuta `php artisan test` en `backend` para comprobar las categorías y los precios.
- Ejecuta `npm run build` en `frontend` para generar `frontend/dist/kinsa-carta/browser`.
- Publica Laravel con `backend/public` como raíz, PostgreSQL configurado y `APP_DEBUG=false`. Ejecuta `php artisan migrate --force` y carga el catálogo con `php artisan db:seed --force` cuando inicialices la base.
- En Vercel, crea un proyecto para `backend` y otro para `frontend` con esas carpetas como raíces. El backend usa el runtime comunitario de PHP y Node.js 22 para la compilación. `frontend/vercel.json` envía `/api/*` a `carta-kinsa-api-pruebas.vercel.app` desde el dominio de la rama de revisión y las URLs individuales de despliegue. El dominio público `carta-kinsa.vercel.app` usa `carta-digital-kinsa-api.vercel.app`. [Documentación de reescrituras de Vercel](https://vercel.com/docs/routing/rewrites)
- Conecta Neon al proyecto del backend mediante `DATABASE_URL`. Configura `DB_CONNECTION=pgsql`, `DB_SSLMODE=require`, `APP_ENV=production`, `APP_DEBUG=false`, `LOG_CHANNEL=stderr`, `CACHE_STORE=array`, `SESSION_DRIVER=database`, `SESSION_SECURE_COOKIE=true`, `QUEUE_CONNECTION=sync` y una `APP_KEY` propia para cada entorno. Ejecuta las migraciones antes de habilitar el panel y usa la carga inicial para una base nueva.
- El proyecto `carta-kinsa-api-pruebas` tiene su propia base Neon `kinsa-pruebas-postgres`. Ejecuta las migraciones y crea la cuenta del dueño en esa base para habilitar el panel de las vistas previas.
