# Mem API Project

## Setup dengan Docker (Recommended)

### 1. Build & Start Semua Services

```bash
docker-compose up --build -d
```

Command ini akan:
- Build Docker image untuk aplikasi Express
- Start PostgreSQL container
- Start aplikasi Express container
- **Otomatis run migrations** saat container aplikasi start
- Generate Prisma Client saat build

### 2. Check Logs

```bash
# Logs semua services
docker-compose logs -f

# Logs aplikasi saja
docker-compose logs -f app

# Logs PostgreSQL saja
docker-compose logs -f postgres
```

### 3. Stop Services

```bash
docker-compose down
```

### 4. Stop & Remove Volumes (Hapus Data)

```bash
docker-compose down -v
```

## Setup Manual (Development)

Jika ingin develop tanpa Docker atau mengalami masalah Docker build:

### Quick Start (All-in-One)

```bash
# Windows PowerShell
.\start-dev.ps1

# Kemudian setup aplikasi
npm run setup
npm start
```

### Manual Setup

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 2. Setup Environment

File `.env` sudah tersedia dengan konfigurasi:
```
DATABASE_URL="postgresql://mem_user:mem_password@localhost:5432/mem_db?schema=public"
```

### 3. Install & Setup All (One Command)

```bash
npm run setup
```

Atau manual:
```bash
npm install
npm run prisma:generate
npm run migrate:dev
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
# atau
npm start
```

## Troubleshooting Docker Build

### Error: Prisma OpenSSL (`libssl.so.1.1: No such file or directory`)

**Solusi Recommended: Gunakan node:20-slim (lebih kompatibel)**
```bash
docker-compose -f docker-compose.slim.yml up --build -d
```

**Atau rebuild dengan Dockerfile yang sudah diperbaiki:**
```bash
docker-compose build --no-cache app
docker-compose up -d
```

### Error: TLS Handshake Timeout

**Solusi 1: Retry Build**
```bash
docker-compose build --no-cache app
```

**Solusi 2: Gunakan Dockerfile Alternatif**
```bash
docker-compose -f docker-compose.alternative.yml up --build -d
# atau
docker-compose -f docker-compose.slim.yml up --build -d
```

**Solusi 3: Manual Pull Image**
```bash
docker pull node:20-alpine
# atau
docker pull node:20-slim
```

**Solusi 4: Development Tanpa Docker App Container (Paling Mudah)**
```bash
# Hanya start PostgreSQL dengan Docker
docker-compose up -d postgres

# Run aplikasi manual
npm run setup
npm start
```

Lihat `docker-troubleshoot.md` untuk detail lebih lengkap.

## API Endpoints

- `GET /` - Health check
- `GET /api/ai-token` - Get AI token data
- `POST /api/ai-token/update` - Update tokens

## Docker Configuration

**PostgreSQL:**
- Port: `5432`
- Database: `mem_db`
- User: `mem_user`
- Password: `mem_password`

**Express App:**
- Port: `5000` (mapped from container port 3000)
- Auto-migrate saat container start
- Health check: `http://localhost:5000/`

## Docker Commands

```bash
# Build & Start
docker-compose up --build -d

# Start (tanpa rebuild)
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild app saja
docker-compose build app
docker-compose up -d app

# Restart app
docker-compose restart app

# Remove semua (termasuk volumes)
docker-compose down -v
```

## Migrations

- **Docker**: Migrations otomatis berjalan saat container app start via Dockerfile CMD
- **Manual**: `npm run migrate:dev` untuk development atau `npm run migrate:deploy` untuk production
