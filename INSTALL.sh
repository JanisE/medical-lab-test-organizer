#
# Viewing
#

# Create a local configuration file:
cp .env.example .env

# Generate app key:
php artisan key:generate

# Clear config cache:
php artisan config:cache

# Create DB:
touch database/database.sqlite

# Build the DB:
php artisan migrate --seed

#
# Parsing.
#

# Install Node.js dependencies
npm install --production
