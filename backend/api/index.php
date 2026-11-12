<?php

// Vercel's function bundle is read-only. Laravel can build its caches in /tmp.
if (DIRECTORY_SEPARATOR === '/') {
    $cache = sys_get_temp_dir();
    $_ENV['APP_PACKAGES_CACHE'] ??= $cache.'/kinsa-packages.php';
    $_ENV['APP_SERVICES_CACHE'] ??= $cache.'/kinsa-services.php';
    $_ENV['VIEW_COMPILED_PATH'] ??= $cache;
}

require __DIR__.'/../public/index.php';
