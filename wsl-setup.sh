#!/bin/bash
# Clean exit on erro
set -e

echo "=========================================="
echo "      WSL Ubuntu Service Setup Script     "
echo "=========================================="

echo "[1/5] Updating packages..."
sudo apt-get update

echo "[2/5] Installing PostgreSQL and Redis..."
sudo apt-get install -y postgresql postgresql-contrib redis-server wget curl

echo "[3/5] Starting PostgreSQL and creating user/database..."
sudo service postgresql start

# Create user 'imalat_user' if it doesn't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='imalat_user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER imalat_user WITH PASSWORD 'imalat_pass_2026' SUPERUSER;"

# Create database 'imalat_db' if it doesn't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='imalat_db'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE imalat_db OWNER imalat_user;"

echo "[4/5] Starting and configuring Redis..."
sudo service redis-server start
# Configure password 'imalat_redis_2026' in redis.conf
sudo sed -i 's/# requirepass foobared/requirepass imalat_redis_2026/' /etc/redis/redis.conf
sudo sed -i 's/requirepass .*/requirepass imalat_redis_2026/' /etc/redis/redis.conf
sudo service redis-server restart

echo "[5/5] Downloading and configuring MinIO & Client..."
# Download MinIO Server binary if not exists
if [ ! -f /usr/local/bin/minio ]; then
    echo "Downloading MinIO Server..."
    wget -q --show-progress https://dl.min.io/server/minio/release/linux-amd64/minio
    chmod +x minio
    sudo mv minio /usr/local/bin/
fi

# Download MinIO Client binary if not exists
if [ ! -f /usr/local/bin/mc ]; then
    echo "Downloading MinIO Client (mc)..."
    wget -q --show-progress https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Start MinIO server in the background
mkdir -p ~/minio_data
export MINIO_ROOT_USER=imalat_minio
export MINIO_ROOT_PASSWORD=imalat_minio_2026

if pgrep -x "minio" > /dev/null; then
    echo "MinIO is already running."
else
    nohup minio server ~/minio_data --address ":9000" --console-address ":9001" > /tmp/minio.log 2>&1 &
fi

# Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
for i in {1..15}; do
    if curl -s http://localhost:9000 > /dev/null; then
        echo "MinIO API is responsive!"
        break
    fi
    sleep 1
done

# Configure Client Alias and Bucket
echo "Configuring MinIO client bucket..."
mc alias set local http://localhost:9000 imalat_minio imalat_minio_2026
mc mb local/imalat-files || echo "Bucket 'imalat-files' already exists or could not be created."

echo "=========================================="
echo "    Setup Complete! Services are Ready!   "
echo "=========================================="
