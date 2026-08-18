# SIAGA Backend — Laravel 12 (PHP 8.2) development image.
#
# In development the application source is bind-mounted from the host and
# Composer dependencies are kept in the `backend_vendor` named volume (see
# compose.yaml). Dependencies are pre-installed at build time so the first
# `docker compose up` is fast; docker/docker/entrypoint.sh acts as a safety
# net that installs them when the volume has not been populated.

FROM php:8.2-cli-alpine

# Set the working directory.
WORKDIR /var/www/html

# Install system dependencies (runtime tools + build-time headers for the
# PHP extensions required by Laravel and the PostgreSQL driver).
RUN apk add --no-cache \
        bash \
        curl \
        curl-dev \
        git \
        unzip \
        zip \
        oniguruma-dev \
        libxml2-dev \
        postgresql-dev

# Install the PHP extensions required by Laravel 12 and pgsql.
RUN docker-php-ext-install -j$(nproc) \
        curl \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        pcntl \
        bcmath \
        xml

# Install Composer.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Composer dependencies. The composer scripts (package:discover,
# vendor:publish) are skipped here: they need the full application and the
# runtime .env, both of which are only available once the container runs.
COPY composer.json composer.lock ./
RUN composer install \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

# Copy the application source. (Bind-mounted over in development.)
COPY . .

# Generate the optimized Composer autoloader.
RUN composer dump-autoload --optimize --no-scripts

# Expose the Laravel development server port.
EXPOSE 8000

# Default command (overridden by compose.yaml).
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]