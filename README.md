# 🌻 Manajemen Kios Bunga

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Sistem Informasi Manajemen Inventaris dan Kasir berbasis web yang dirancang khusus untuk toko bunga. Aplikasi ini mempermudah pencatatan stok, pemrosesan transaksi penjualan (Point of Sale), serta menyediakan dashboard analitik interaktif untuk memonitor performa bisnis secara *real-time*.

## ✨ Fitur Utama

- **Dashboard Analitik Interaktif**: Visualisasi data performa toko melalui grafik tren penjualan harian dan frekuensi transaksi menggunakan Recharts.
- **Manajemen Inventaris Bunga (CRUD)**: Sistem kelola stok barang dengan indikator visual otomatis untuk "stok kritis" (segera habis).
- **Sistem Kasir / POS (Point of Sale)**: Fitur antarmuka kasir responsif dengan keranjang belanja dinamis dan perhitungan otomatis subtotal serta total harga transaksi.
- **Custom Pop-up Alert**: Notifikasi sukses *checkout* bertipe modal alert, didesain estetik dan informatif tanpa me-*refresh* halaman.
- **Filter Laporan Transaksi**: Pencarian dan rentang tanggal riwayat transaksi, dilengkapi dengan komputasi metrik bisnis level atas (Total Pemasukan, Total Transaksi, Rata-rata Nilai Transaksi).
- **Dukungan Dark Mode / Light Mode Penuh**: Antarmuka adaptif dengan dukungan *Dark Scheme* menggunakan Tailwind CSS, menjaga kenyamanan tata cahaya dari layout bagi pengguna.

## 📸 Tangkapan Layar (Screenshots)

| Dashboard & Analitik | Sistem Kasir (POS) |
| :---: | :---: |
| ![Dashboard UI](/screenshots/reports.png) | ![Kasir UI](/screenshots/dashboard.png) |

| Pop-up Checkout | Mode Gelap (Dark Mode) |
| :---: | :---: |
| ![Pop-up Success](/screenshots/popup.png) | ![Dark Mode UI](/screenshots/darkmode.png) |

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan instalasi di lingkungan (*environment*) lokal Anda, pastikan beberapa perangkat lunak berikut telah terinstal pada sistem:

- [Node.js](https://nodejs.org/) (Sangat direkomendasikan Node.js Versi 18 LTS atau lebih baru)
- npm atau [Yarn](https://yarnpkg.com/) (Package Manager)
- [XAMPP](https://www.apachefriends.org/) / [Laragon](https://laragon.org/) (Atau MySQL instance berjalan untuk koneksi lokal Database)

## 🚀 Cara Instalasi & Menjalankan Proyek (Getting Started)

1. **Clone repositori proyek ini**
   ```bash
   git clone https://github.com/username-anda/manajemen-kios-bunga.git
   ```

2. **Masuk ke direktori proyek Frontend**
   ```bash
   cd manajemen-kios-bunga
   ```

3. **Instal seluruh dependensi (Dependencies)**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment Backend (Database MySQL)**
   Jalankan server MySQL Anda (Start modul MySQL di XAMPP/Laragon Control Panel).
   Setelah itu, buka direktori *Backend*, temukan atau buat file konfigurasi `.env`, letakkan kode kredensial berikut:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=kios_bunga_db
   PORT=3000
   ```
   *(Pastikan Anda telah melakukan Import terhadap skema SQL ke dalam database lokal yang bernama `kios_bunga_db`)*.

5. **Jalankan Server Backend**
   Pada instance Terminal/CMD baru, di dalam direktori `Backend/`:
   ```bash
   node server.js
   ```
   Atau jika menggunakan `nodemon` / script kustom di dalam package.json: `npm start`

6. **Jalankan Aplikasi Frontend (Development Mode)**
   Kembali ke Terminal pada direktori root Frontend proyek Anda, jalankan *Development Server Vite*:
   ```bash
   npm run dev
   ```

Aplikasi *Client-Side React* Anda seharusnya dapat langsung diakses melalui peramban (browser) di alamat *default* Vite: `http://localhost:5173`. 

## 📂 Struktur Folder (Singkat)

```text
📦 proyek-kios-bunga
 ┣ 📂 Backend              # Source code API Server (Node.js/Express)
 ┣ 📂 src                  # Source code Frontend (React.js)
 ┃ ┣ 📂 assets             # File aset statis lokal
 ┃ ┣ 📜 App.jsx            # Entry komponen utama UI dari Dashboard & Kasir
 ┃ ┣ 📜 index.css          # Setup direktif & konfigurasi Tailwind CSS v4
 ┃ ┗ 📜 main.jsx           # Setup konfigurasi Vite (Mount root DOM React)
 ┣ 📜 package.json         # Konfigurasi dependensi NPM & metadata proyek
 ┗ 📜 vite.config.js       # Aturan alias & *bundling* Vite JS
```

---
Didesain untuk portofolio dan dikembangkan dengan ❤️ untuk standar pengelolaan manajemen modern (Clean UI / UX).
