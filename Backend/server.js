const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Konfigurasi Koneksi Database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'kios_bunga_db'
};

//ENDPOINT CRUD BUNGA

// GET: Ambil semua data bunga
app.get('/api/bunga', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM bunga');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Tambah bunga baru
app.post('/api/bunga', async (req, res) => {
    const { nama, lokasi, stok, harga } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO bunga (nama, lokasi, stok, harga) VALUES (?, ?, ?, ?)',
            [nama, lokasi, stok, harga]
        );
        res.json({ message: 'Bunga berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update data bunga
app.put('/api/bunga/:id', async (req, res) => {
    const { nama, lokasi, stok, harga } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE bunga SET nama=?, lokasi=?, stok=?, harga=? WHERE id=?',
            [nama, lokasi, stok, harga, req.params.id]
        );
        res.json({ message: 'Data bunga berhasil diupdate!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Hapus bunga
app.delete('/api/bunga/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM bunga WHERE id=?', [req.params.id]);
        res.json({ message: 'Bunga berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//ENDPOINT KASIR / TRANSAKSI

// GET: Ambil semua riwayat transaksi untuk Laporan
app.get('/api/transaksi', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM transaksi ORDER BY tanggal DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Checkout Kasir (Kurangi stok & Catat penjualan)
app.post('/api/checkout', async (req, res) => {
    const { keranjang, total_harga, items_detail } = req.body; 
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // 1. Catat uang masuk & detail item di tabel transaksi
        await connection.execute(
            'INSERT INTO transaksi (total_harga, items) VALUES (?, ?)',
            [total_harga, items_detail]
        );

        // 2. Kurangi stok bunga satu per satu sesuai keranjang
        for (let item of keranjang) {
            await connection.execute(
                'UPDATE bunga SET stok = stok - ? WHERE id = ?',
                [item.jumlah, item.id]
            );
        }

        await connection.commit();
        res.json({ message: 'Checkout berhasil, stok terpotong!' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal checkout: ' + err.message });
    }
});

// GET: Dashboard (Ambil metrik harian & bulanan)
app.get('/api/dashboard', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Query untuk Harian
        const [harian] = await connection.execute(
            'SELECT SUM(total_harga) as total_harian FROM transaksi WHERE DATE(tanggal) = CURDATE()'
        );
        
        // Query untuk Bulanan
        const [bulanan] = await connection.execute(
            'SELECT SUM(total_harga) as total_bulanan FROM transaksi WHERE MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())'
        );

        res.json({
            penjualanHarian: harian[0].total_harian || 0,
            penjualanBulanan: bulanan[0].total_bulanan || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend API http://localhost:${PORT}`);
});