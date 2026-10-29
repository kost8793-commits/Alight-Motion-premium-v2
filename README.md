# Alight Motion Premium Tool (AM Prem) - Localhost Edition

Aplikasi web replika Menu AM Prem (Alight Motion Premium) bergaya Neo-Brutalist yang dapat dijalankan secara mandiri di **Localhost** (`http://localhost:3000`) atau dihubungkan ke server remote `maya327.my.id`.

---

## 🚀 Cara Menjalankan di Localhost (Komputer Sendiri)

### Prasyarat
- **Node.js** versi 18 atau lebih baru ([Unduh di nodejs.org](https://nodejs.org/))
- **NPM** (otomatis terpasang bersama Node.js)

### Langkah-langkah:

1. **Buka Terminal / Command Prompt** dan masuk ke direktori proyek:
   ```bash
   cd alight-premium-tool
   ```

2. **Pasang Dependensi (Install Dependencies):**
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan (Dev Server):**
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi di Browser:**
   Buka URL berikut di browser kamu:
   ```text
   http://localhost:3000
   ```

---

## 🛠 Mode Server yang Tersedia

1. **Mode Localhost (Bawaan)**:
   - Server Express berjalan di port `3000`.
   - Menghasilkan token dan link verifikasi Alight Motion secara mandiri tanpa memerlukan koneksi ke server eksternal.
   - Link otomatis terisi ke Langkah 02 untuk pengujian cepat.

2. **Mode Remote (maya327.my.id)**:
   - Dapat diaktifkan melalui tombol switcher di header atau modal *Pengaturan Server*.
   - Meneruskan permintaan ke `http://maya327.my.id/api.php` dengan penanganan sesi otomatis.

3. **Mode Custom Endpoint**:
   - Masukkan URL backend server atau API Key milikmu sendiri.

---

## 🎵 Pemutar Musik Neobrutalist
Dilengkapi synthesizer Web Audio bawaan di pojok kanan bawah yang menghasilkan melodi retro 8-bit tanpa ketergantungan file MP3 eksternal.
