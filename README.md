# Prima Backend

> 🌐 [Read this in English](README_EN.md)

Backend API untuk aplikasi Prima, dibangun menggunakan [Hono](https://hono.dev/) framework dengan Node.js dan PostgreSQL.

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat](#prasyarat)
- [Instalasi dan Penyiapan](#instalasi-dan-penyiapan)
  - [Menggunakan Docker (Direkomendasikan)](#menggunakan-docker-direkomendasikan)
  - [Instalasi Manual](#instalasi-manual)
- [Petunjuk Penggunaan](#petunjuk-penggunaan)
  - [Menjalankan Aplikasi](#menjalankan-aplikasi)
  - [Skrip yang Tersedia](#skrip-yang-tersedia)
  - [API Endpoints](#api-endpoints)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Proyek](#struktur-proyek)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Tentang Proyek

Prima Backend adalah RESTful API yang menyediakan layanan untuk mengelola:
- **Autentikasi** - Login dan manajemen sesi pengguna
- **Pengguna** - Manajemen data pengguna
- **Tim** - Pengelolaan tim
- **Pelanggan** - Manajemen data pelanggan
- **Interaksi** - Pencatatan interaksi dengan pelanggan
- **Produk** - Manajemen katalog produk
- **Konversi** - Pelacakan konversi penjualan

## Teknologi yang Digunakan

| Teknologi | Deskripsi |
|-----------|-----------|
| [Hono](https://hono.dev/) | Framework web yang ringan dan cepat |
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [PostgreSQL](https://www.postgresql.org/) | Database relasional |
| [Drizzle ORM](https://orm.drizzle.team/) | ORM TypeScript/JavaScript |
| [Docker](https://www.docker.com/) | Kontainerisasi aplikasi |
| [Zod](https://zod.dev/) | Validasi skema |
| [JWT](https://jwt.io/) | Autentikasi token |
| [Pino](https://getpino.io/) | Logger berkinerja tinggi |

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- **Docker & Docker Compose** (untuk instalasi dengan Docker)
- **Node.js 18+** (untuk instalasi manual)
- **PostgreSQL 16+** (untuk instalasi manual)
- **npm** atau **yarn**

## Instalasi dan Penyiapan

### Menggunakan Docker (Direkomendasikan)

1. **Clone repositori**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Buat file environment**
   
   Buat file `.env` di root folder proyek:
   ```env
   DATABASE_URL="postgresql://honouser:honopass@db:5432/honoapp"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

3. **Bangun dan jalankan container**
   ```bash
   docker-compose up -d --build
   ```
   Perintah ini akan memulai:
   - Server aplikasi (`app`) di port 3000
   - Database PostgreSQL (`db`) di port 5432

4. **Terapkan skema database**
   ```bash
   docker-compose exec app npm run db:push
   ```

5. **Verifikasi instalasi**
   
   Buka browser dan akses `http://localhost:3000`. Anda akan melihat pesan:
   ```
   Hello! Server Hono ini sedang berjalan.
   ```

### Instalasi Manual

1. **Clone repositori**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Siapkan database PostgreSQL**
   
   Buat database baru di PostgreSQL:
   ```sql
   CREATE DATABASE honoapp;
   CREATE USER honouser WITH PASSWORD 'honopass';
   GRANT ALL PRIVILEGES ON DATABASE honoapp TO honouser;
   ```

4. **Konfigurasi environment**
   
   Buat file `.env`:
   ```env
   DATABASE_URL="postgresql://honouser:honopass@localhost:5432/honoapp"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

5. **Terapkan skema database**
   ```bash
   npm run db:push
   ```

6. **Jalankan aplikasi**
   ```bash
   npm run start
   ```

## Petunjuk Penggunaan

### Menjalankan Aplikasi

| Perintah | Deskripsi |
|----------|-----------|
| `npm run start` | Menjalankan server dalam mode produksi |
| `npm run dev` | Menjalankan server dalam mode development dengan auto-reload |

### Skrip yang Tersedia

| Skrip | Deskripsi |
|-------|-----------|
| `npm run start` | Menjalankan aplikasi |
| `npm run dev` | Mode development dengan watch |
| `npm run db:generate` | Generate migrasi database |
| `npm run db:push` | Push skema ke database |
| `npm run db:studio` | Membuka Drizzle Studio untuk manajemen database |
| `npm run lint` | Menjalankan ESLint untuk pengecekan kode |

### API Endpoints

Semua endpoint API menggunakan prefix `/v1`. Endpoint yang memerlukan autentikasi ditandai dengan 🔒.

| Endpoint | Deskripsi |
|----------|-----------|
| `GET /` | Health check |
| `POST /v1/auth/login` | Login pengguna |
| `POST /v1/auth/register` | Registrasi pengguna |
| 🔒 `/v1/users/*` | Manajemen pengguna |
| 🔒 `/v1/teams/*` | Manajemen tim |
| 🔒 `/v1/customers/*` | Manajemen pelanggan |
| 🔒 `/v1/interactions/*` | Manajemen interaksi |
| 🔒 `/v1/products/*` | Manajemen produk |
| 🔒 `/v1/conversions/*` | Manajemen konversi |

**Autentikasi:**

Untuk mengakses endpoint yang dilindungi, sertakan token JWT di header:
```
Authorization: Bearer <your-jwt-token>
```

## Konfigurasi Environment

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | URL koneksi PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key untuk JWT | `your-secret-key` |
| `PORT` | Port server (opsional, default: 3000) | `3000` |
| `NODE_ENV` | Environment aplikasi | `development` / `production` |

## Struktur Proyek

```
backend/
├── .github/
│   └── workflows/
│       └── docker-build.yml  # GitHub Actions workflow
├── src/
│   ├── controllers/          # Handler untuk request
│   ├── db/                   # Konfigurasi dan skema database
│   ├── errors/               # Custom error classes
│   ├── middleware/           # Middleware (auth, error handler)
│   ├── routes/               # Definisi routes
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions (logger, etc)
│   └── index.js              # Entry point aplikasi
├── .env                      # Environment variables (tidak di-commit)
├── .gitignore
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker image configuration
├── drizzle.config.js         # Drizzle ORM configuration
├── eslint.config.js          # ESLint configuration
├── package.json
└── README.md
```

## CI/CD

Proyek ini menggunakan GitHub Actions untuk CI/CD. Workflow akan otomatis:

1. **Build** Docker image saat ada push ke branch `main`
2. **Push** image ke GitHub Container Registry (GHCR)

**Image tersedia di:**
```
ghcr.io/<owner>/prima-be:latest
```

**Tags yang dihasilkan:**
- `latest` - Build terbaru dari branch default
- `main` - Nama branch
- `<sha>` - Git commit SHA

**Cara pull image:**
```bash
docker pull ghcr.io/<owner>/prima-be:latest
```

## Troubleshooting

### Database tidak dapat terhubung

1. Pastikan PostgreSQL sudah berjalan
2. Periksa `DATABASE_URL` di file `.env`
3. Untuk Docker, pastikan container `db` sudah healthy:
   ```bash
   docker-compose ps
   ```

### Port sudah digunakan

Ubah port di file `.env` atau `docker-compose.yml`:
```env
PORT=3001
```

### Container tidak mau start

Lihat log untuk debugging:
```bash
docker-compose logs -f app
```
