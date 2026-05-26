#!/bin/bash
echo "=========================================="
echo "      Starting WSL Ubuntu Services        "
echo "=========================================="

echo "Starting PostgreSQL..."
sudo service postgresql start

echo "Starting Redis..."
sudo service redis-server start

echo "Starting MinIO..."
mkdir -p ~/minio_data
export MINIO_ROOT_USER=imalat_minio
export MINIO_ROOT_PASSWORD=imalat_minio_2026

if pgrep -x "minio" > /dev/null; then
    echo "MinIO is already running."
else
    nohup minio server ~/minio_data --address ":9000" --console-address ":9001" > /tmp/minio.log 2>&1 &
    echo "MinIO started in background (log: /tmp/minio.log)."
fi

echo "------------------------------------------"
echo "Service Status Check:"
sudo service postgresql status
sudo service redis-server status
if pgrep -x "minio" > /dev/null; then
    echo "MinIO: running"
else
    echo "MinIO: STOPPED"
fi
echo "=========================================="
