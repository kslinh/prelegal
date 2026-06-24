#!/bin/bash
set -e

echo "Starting Prelegal..."
mkdir -p /app/data
cd /app/backend
alembic upgrade head
python3 main.py
