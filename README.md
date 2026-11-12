# Presensi Wajah Mahasiswa AI — Cloudflare Workers + D1

Project ini menggunakan file HTML presensi mahasiswa yang diberikan, dengan penyimpanan data mahasiswa dan riwayat presensi ke Cloudflare D1.

## Isi project
- `public/index.html`: kamera, FaceMesh, registrasi, daftar mahasiswa, riwayat, dan ekspor CSV.
- `src/worker.js`: API untuk membaca/menyimpan/menghapus mahasiswa dan membaca/menyimpan presensi.
- `schema.sql`: struktur tabel SQLite untuk D1.
- `wrangler.jsonc`: konfigurasi Worker dan binding D1.

## Catatan penyimpanan
- Data mahasiswa (NIM, nama, prodi, dan vektor wajah 16 angka) disimpan di D1.
- Riwayat presensi disimpan di D1.
- Foto snapshot hanya muncul pada notifikasi presensi saat itu dan tidak disimpan ke D1 agar database tidak dipenuhi data gambar besar.
- Ini prototipe pengenalan wajah berbasis geometri landmark, bukan sistem biometrik produksi. Uji hasil pencocokan sebelum dipakai untuk penilaian kehadiran resmi.

## Langkah deploy

### 1. Buat database D1
1. Login ke Cloudflare Dashboard.
2. Buka **Workers & Pages → D1 SQL Database**.
3. Pilih **Create database**.
4. Beri nama `presensi-ai-mahasiswa-db`.
5. Salin **Database ID**.

### 2. Masukkan Database ID
Buka `wrangler.jsonc`, ganti `GANTI_DENGAN_DATABASE_ID` dengan Database ID milikmu. Jangan ubah nama binding `DB`.

### 3. Buat tabel
Di halaman database D1, buka **Console**. Salin seluruh isi `schema.sql`, lalu jalankan.

### 4. Upload ke GitHub
Buat repository baru, lalu upload seluruh isi folder project ini. Pastikan folder `public` dan `src` ikut ter-upload.

### 5. Deploy Worker
Hubungkan repository GitHub ini ke Cloudflare Workers. Gunakan:
- Build command: `npm install`
- Deploy command: `npx wrangler deploy`

Pastikan binding D1 bernama `DB` terhubung ke database `presensi-ai-mahasiswa-db`. Jika belum, buka pengaturan Worker → **Bindings** → **D1 database** dan tambahkan binding dengan variable name `DB`.

## Uji aplikasi
Buka alamat Worker yang diberikan Cloudflare. Endpoint `/api/health` harus menampilkan `Presensi Mahasiswa API aktif`. Lalu daftarkan mahasiswa uji dan periksa tabel `users` serta `attendances` di D1.

## Penting
- Akses kamera memerlukan HTTPS atau localhost dan izin kamera browser.
- Data di IndexedDB browser lama tidak otomatis dipindahkan ke D1. Daftarkan ulang mahasiswa pada versi Cloudflare.
- Jangan bagikan data biometrik mahasiswa tanpa persetujuan dan izin yang sesuai.
