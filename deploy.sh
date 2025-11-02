#!/bin/bash

echo "🚀 [1/5] Pulling latest code from GitHub..."
git pull origin main

echo "🧱 [2/5] Stopping backend container..."
docker-compose stop backend

echo "🧹 [3/5] Removing backend container..."
docker-compose rm -f backend

echo "⚙️ [4/5] Rebuilding and starting backend container..."
docker-compose up --build -d backend

echo "🗄️ [5/5] Running Prisma DB Push..."
docker exec -it meme_backend_1 npx prisma db push

echo "✅ Deploy finished successfully!"
