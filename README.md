# Katalog Koperasi Sumber Makmur — Next.js + MariaDB Lab

Aplikasi ini adalah **fullstack Next.js App Router** untuk lab praktikum keamanan web. Tidak menggunakan Docker, Express, maupun ORM. Database menggunakan **MariaDB** dan seluruh akses data aplikasi menggunakan **SQL native melalui mysql2**.

Target deployment: **server Linux CentOS lokal/LAN**. Tidak membutuhkan Nginx, domain, HTTPS, atau Certbot.

## Fitur
- Katalog produk dan detail produk.
- Search produk dari MariaDB.
- Kategori.
- Dashboard admin.
- CRUD produk dan kategori.
- API route Next.js.
- SQL native dengan `mysql2`.
- Mode lab untuk SQL Injection dasar dan XSS dasar.

## Persyaratan
- CentOS/RHEL-compatible Linux.
- Node.js LTS, disarankan Node.js 20 atau 22.
- npm.
- MariaDB Server.
- PM2.

## 1. Instalasi Node.js

Gunakan Node.js LTS yang sesuai dengan kebijakan server. Pastikan:

```bash
# 1. Download & jalankan setup script NodeSource untuk Node 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -

# 2. Install Node.js
sudo dnf install -y nodejs

# 3. Verifikasi versi
node -v
npm -v

```

Jika server belum memiliki Node.js, instal Node.js LTS terlebih dahulu.

## 2. Instalasi dan menjalankan MariaDB

Pastikan MariaDB aktif:

```bash
sudo dnf install mariadb-server mariadb-client
sudo systemctl enable --now mariadb
sudo systemctl status mariadb
```

## 3. Menyiapkan source aplikasi

Contoh lokasi aplikasi:

```bash
sudo mkdir -p /var/www
cd /var/www
```

Extract source ke:

```bash
git clone https://github.com/jonisetiyawan48/vuln-web.git
```

Kemudian:

```bash
cd /var/www/vuln-web
npm install
```

## 4. Konfigurasi database

Salin konfigurasi:

```bash
cp env.example .env
nano .env
```

Contoh:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=koperasi
DB_PASSWORD=password_database
DB_NAME=koperasi

LAB_MODE=true
```

### Membuat user MariaDB

Masuk ke MariaDB sebagai root:

```bash
sudo mariadb
```

Kemudian:

```sql

CREATE DATABASE IF NOT EXISTS koperasi;
CREATE USER IF NOT EXISTS 'koperasi'@'localhost' IDENTIFIED BY 'password_database';
GRANT ALL PRIVILEGES ON koperasi.* TO 'koperasi'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> `seed.sql` akan membuat database `koperasi` jika belum ada. User MariaDB harus memiliki hak untuk membuat database pada instalasi pertama, atau database dapat dibuat terlebih dahulu oleh administrator.

## 5. Seed database otomatis saat build

**Ya. Pada versi ini database seed dijalankan otomatis ketika `mysql import` dijalankan.**

Alurnya: waktu npm run build otomatis terimport

`db/seed.sql` dibuat idempotent untuk struktur dan data contoh sehingga dapat dijalankan kembali tanpa sengaja membuat data contoh berulang.

### Catatan penting tentang seed saat build

Karena seed dijalankan pada `prebuild`, **MariaDB harus sudah aktif dan `.env` harus benar sebelum `npm run build`**.

Ini sengaja dipilih untuk server lab supaya instalasi lebih sederhana: setelah konfigurasi `.env`, administrator cukup menjalankan build dan database contoh langsung disiapkan.

Jika suatu saat tidak ingin seed otomatis saat build, hapus script `prebuild` dari `package.json` dan gunakan `npm run db:seed` secara manual.

## 6. Build aplikasi

Setelah MariaDB dan `.env` siap:

```bash
cd /var/www/vuln-web
npm run build
```

Jika berhasil, aplikasi siap dijalankan dalam mode production.

## 7. Instal PM2

Install PM2 secara global:

```bash
sudo npm install -g pm2
```

Cek:

```bash
pm2 -v
```

## 8. Menjalankan Next.js menggunakan PM2

Project sudah menyediakan:

```text
ecosystem.config.cjs
```

Jalankan:

```bash
cd /var/www/vuln-web
pm2 start ecosystem.config.cjs
```

Cek proses:

```bash
pm2 status
```

Lihat log:

```bash
pm2 logs koperasi-sumber-makmur
```

Restart:

```bash
pm2 restart all
```

Stop:

```bash
pm2 stop all
```

## 9. Agar PM2 otomatis hidup setelah server reboot

Jalankan sebagai user yang digunakan untuk menjalankan aplikasi:

```bash
pm2 startup
```

Ikuti command `sudo ...` yang diberikan PM2, lalu simpan process list:

```bash
pm2 save
```

Setelah reboot, cek:

```bash
pm2 status
```

## 10. Akses dari komputer siswa

PM2 menjalankan Next.js pada:

```text
0.0.0.0:3000
```

Cari IP server CentOS:

```bash
ip a
```

Misalnya IP server:

```text
192.168.1.10
```

Maka komputer siswa mengakses:

```text
http://192.168.1.10:3000
```

Tidak diperlukan Nginx, domain, HTTPS, maupun Certbot.

## 11. Firewall CentOS

Jika `firewalld` aktif, buka port 3000:

```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

Cek:

```bash
sudo firewall-cmd --list-ports
```

## 12. Mode praktikum keamanan

### LAB_MODE=true

Mode ini digunakan untuk praktikum. Beberapa bagian aplikasi sengaja dibuat rentan agar siswa dapat mengamati konsep dasar:

- SQL Injection (auth bypass) pada form **login admin**.
- Reflected XSS pada parameter pencarian katalog.
- Stored XSS pada **deskripsi kategori** (tampil di halaman utama `/`).

Panduan langkah demi langkah beserta payload contoh ada di [`TESTING.md`](./TESTING.md). Ringkasan lokasi:

```text
1. SQL Injection (auth bypass)
```

```text
/admin/login
```

```text
Email: admin@sumbermakmur.desa' -- 
Password: (boleh diisi apa saja)
```

```text
2. Reflected XSS
```

```text
/catalog?q=<script>alert('Reflected XSS')</script>
```

```text
3. Stored XSS
```

```text
/admin/categories/[id]/edit
masukkan <script>alert('Stored XSS Berhasil')</script> ke dalam field Deskripsi

Pengujian bisa dicek di halaman utama /
```

Detail lengkap (kenapa payload bekerja, query mentahnya, variasi payload lain) ada di `TESTING.md`.

## 13. Update source code aplikasi

Setelah source diperbarui:

```bash
cd /var/www/vuln-web
npm install
npm run build
pm2 restart all
```

Perhatikan bahwa `npm run build` akan menjalankan seed terlebih dahulu.

## 14. Backup database

Backup:

```bash
mysqldump -u koperasi -p koperasi > backup-koperasi.sql
```

Restore:

```bash
mysql -u koperasi -p koperasi < backup-koperasi.sql
```

## 15. Troubleshooting

### Next.js tidak dapat terhubung ke MariaDB

Periksa:

```bash
sudo systemctl status mariadb
```

Kemudian periksa `.env`:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Tes login:

```bash
mariadb -u koperasi -p -h 127.0.0.1
```

### Build gagal pada tahap db:seed

Jalankan manual:

```bash
npm run db:seed
```

Lihat pesan error MariaDB. Biasanya penyebabnya adalah user database tidak memiliki privilege yang diperlukan atau konfigurasi `.env` salah.

### Dari PC siswa tidak bisa membuka website

Di server:

```bash
pm2 status
sudo ss -lntp | grep 3000
sudo firewall-cmd --list-ports
```

Pastikan Next.js listen pada `0.0.0.0:3000`, bukan hanya `127.0.0.1:3000`.

### Melihat log aplikasi

```bash
pm2 logs koperasi-sumber-makmur
```

## 16. Urutan instalasi singkat

Jika server sudah memiliki Node.js, npm, MariaDB, dan PM2, urutan paling singkat:

```bash
cd /var/www/vuln
npm install
cp env.example .env
nano .env
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Kemudian buka dari komputer siswa:

```text
http://IP_SERVER:3000
```
