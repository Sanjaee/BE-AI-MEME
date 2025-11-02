#!/bin/bash

echo "🚀 [1/5] Pulling latest code from GitHub..."
git pull origin main

echo "🧱 [2/5] Stopping and removing containers..."
docker-compose down

echo "🧹 [3/5] Removing unused Docker images..."
docker image prune -a -f

echo "⚙️ [4/5] Building and starting containers..."
docker-compose up --build -d

echo "🗄️ [5/5] Running Prisma DB Push..."
docker exec -it meme_backend_1 npx prisma db push

echo "✅ Deploy finished successfully!"
