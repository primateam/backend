**Isi file `.env`**
    ```env
    DATABASE_URL="postgresql://honouser:honopass@db:5432/honoapp"
    ```
Menjalankan Aplikasi

**Bangun dan jalankan container** dalam mode detached (-d):
    ```bash
    docker-compose up -d --build
    ```
    Ini akan memulai server `app` dan database `db`.

**Terapkan Skema Database**
    Setelah container berjalan, jalankan perintah `db:push` untuk membuat semua tabel ke database:
    ```bash
    docker-compose exec app npm run db:push
    ```
**Selesai!**
    Server sekarang berjalan dan dapat diakses di `http://localhost:3000`.