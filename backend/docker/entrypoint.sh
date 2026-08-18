#!/bin/sh
set -e

# First-boot safety net: install Composer dependencies into the named
# `backend_vendor` volume when it has not been populated from the image
# (e.g. the volume-copy behaviour did not run or the volume was wiped).
if [ ! -f vendor/autoload.php ]; then
    echo "[entrypoint] vendor/autoload.php not found - installing Composer dependencies..."
    composer install --no-interaction --prefer-dist
fi

exec "$@"