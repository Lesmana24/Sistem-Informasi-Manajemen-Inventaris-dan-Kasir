import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CloudSun, DollarSign, Package, CheckCircle, Search, Edit, Trash2, Plus, X, ShoppingCart, Calculator, BarChart3, LayoutDashboard, FileText, Calendar, Leaf, Hash, Sun, Moon } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [time, setTime] = useState(new Date());
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Dashboard Metrics
  const [dashboardMetrics, setDashboardMetrics] = useState({ penjualanHarian: 0, penjualanBulanan: 0 });
  const [cuaca, setCuaca] = useState({ 
    suhu: '--', 
    kelembapan: '--',
    deskripsi: 'Memuat cuaca...', 
    ikon: '' 
  });
  const [namaKota, setNamaKota] = useState('Indramayu');
  const [isEditingKota, setIsEditingKota] = useState(false);
  const [inputKotaTemp, setInputKotaTemp] = useState('');

  // Kasir & Transaksi State
  const [cart, setCart] = useState([]);
  const [selectedBunga, setSelectedBunga] = useState('');
  const [qtyBeli, setQtyBeli] = useState(1);
  const [searchKasir, setSearchKasir] = useState('');
  const [isDropdownKasirOpen, setIsDropdownKasirOpen] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof globalThis.window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Modals & Tabs State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: '', lokasi: '', stok: '', harga: '' });

  // Checkout Alert State
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [tempTotalCheckout, setTempTotalCheckout] = useState(0);

  // Laporan & Riwayat Transaksi State
  const [dataTransaksi, setDataTransaksi] = useState([]);

  // Filter & Pagination State for Laporan
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [currentPageLaporan, setCurrentPageLaporan] = useState(1);
  const [searchTransaksi, setSearchTransaksi] = useState('');
  const itemsPerPageLaporan = 5;

  // Chart State
  const [tipeGrafik, setTipeGrafik] = useState('harian'); 

  // Filter Logika
  const filteredTransaksi = dataTransaksi.filter((trx) => {
    if (!appliedStartDate && !appliedEndDate) return true;
    const trxDate = new Date(trx.tanggal);
    const start = appliedStartDate ? new Date(appliedStartDate) : new Date('1970-01-01');
    const end = appliedEndDate ? new Date(appliedEndDate) : new Date('2100-01-01');
    return trxDate >= start && trxDate <= end;
  });

  const totalPendapatanFilter = filteredTransaksi.reduce((sum, trx) => sum + trx.total_harga, 0);
  const rataRataTransaksi = filteredTransaksi.length > 0 
    ? Math.round(totalPendapatanFilter / filteredTransaksi.length) 
    : 0;

  // Filtering Lanjutan: Pencarian Teks
  const finalTableData = filteredTransaksi.filter((trx) => {
    if (!searchTransaksi) return true;
    const lowerSearch = searchTransaksi.toLowerCase();
    const idMatch = trx.id_transaksi.toLowerCase().includes(lowerSearch);
    const itemsMatch = trx.items.toLowerCase().includes(lowerSearch);
    return idMatch || itemsMatch;
  });

  // Pagination Logika Laporan
  const indexOfLastLaporan = currentPageLaporan * itemsPerPageLaporan;
  const indexOfFirstLaporan = indexOfLastLaporan - itemsPerPageLaporan;
  const currentLaporanItems = finalTableData.slice(indexOfFirstLaporan, indexOfLastLaporan);
  const totalPagesLaporan = Math.ceil(finalTableData.length / itemsPerPageLaporan);

  // Aggregasi Chart Laporan
  const chartDataReversed = [...filteredTransaksi].reverse(); // Urutkan tanggal menaik untuk chart
  const aggregatedChartData = chartDataReversed.reduce((acc, current) => {
    let key;
    if (tipeGrafik === 'harian') {
      key = current.tanggal;
    } else {
      const dateObj = new Date(current.tanggal);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      key = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    const existingNode = acc.find(item => item.tanggal === key);
    if (existingNode) {
      existingNode.total_pendapatan += current.total_harga;
      existingNode.jumlah_transaksi += 1;
    } else {
      acc.push({
        tanggal: key,
        total_pendapatan: current.total_harga,
        jumlah_transaksi: 1
      });
    }
    return acc;
  }, []);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  // Fetch Data on Load
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard`);
        setDashboardMetrics({
          penjualanHarian: response.data.penjualanHarian || 0,
          penjualanBulanan: response.data.penjualanBulanan || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        alert('Gagal memuat data dashboard. Periksa koneksi API.');
      }
    };

    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bunga`);
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        alert('Gagal memuat data inventaris bunga dari server.');
      }
    };

    const fetchWeather = async () => {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${namaKota}&appid=008002581abc41bd5bf2e05ed32afb74&units=metric&lang=id`);
        const data = response.data;
        setCuaca({
          suhu: Math.round(data.main.temp),
          kelembapan: data.main.humidity,
          deskripsi: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
          ikon: data.weather[0].icon
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
        setCuaca({
          suhu: '--', 
          kelembapan: '--', 
          deskripsi: 'Gagal memuat', 
          ikon: ''
        });
      }
    };

    const fetchTransaksi = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/transaksi`);
        const mappedData = response.data.map(item => {
          const dateStr = item.tanggal.split('T')[0];
          const timeStr = item.tanggal.split('T')[1].substring(0, 5);
          return {
            id_transaksi: 'TRX-' + item.id,
            tanggal: dateStr,
            waktu: timeStr,
            items: item.items,
            total_harga: item.total_harga
          };
        });
        setDataTransaksi(mappedData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Gagal memuat data riwayat transaksi.');
      }
    };

    fetchDashboard();
    fetchInventory();
    fetchWeather();
    fetchTransaksi();
  }, [namaKota]);

  // Format Helper
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // Inventory Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const filteredInventory = inventory.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const availableForSale = inventory.filter(item => item.stok > 0);

  const filteredBungaKasir = availableForSale.filter(bunga => {
    // Return true if search string matches name, or if the search string is exactly the formatted display string (after selection)
    const displayString = `${bunga.nama} (${formatRupiah(bunga.harga)})`;
    return bunga.nama.toLowerCase().includes(searchKasir.toLowerCase()) || searchKasir === displayString;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ nama: item.nama, lokasi: item.lokasi, stok: item.stok, harga: item.harga });
    } else {
      setEditingId(null);
      setFormData({ nama: '', lokasi: '', stok: '', harga: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nama: '', lokasi: '', stok: '', harga: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      nama: formData.nama,
      lokasi: formData.lokasi,
      stok: Number(formData.stok),
      harga: Number(formData.harga)
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/bunga/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/bunga`, payload);
      }
      handleCloseModal();
      // Temporary inline fetch to substitute the hoisted functions
      try {
        const inventoryRes = await axios.get(`${API_BASE_URL}/bunga`);
        setInventory(inventoryRes.data);
      } catch(error) {
        console.error('Latar belakang refresh inventory gagal:', error);
      }
    } catch (error) {
       console.error('Error saving item:', error);
       alert('Terjadi kesalahan saat menyimpan data ke server.');
    }
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Yakin ingin menghapus bunga ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/bunga/${id}`);
        // Remove from cart if deleted visually
        setCart(cart.filter(item => item.id !== id));
        // Temporary inline fetch to substitute the hoisted functions
        try {
          const inventoryRes = await axios.get(`${API_BASE_URL}/bunga`);
          setInventory(inventoryRes.data);
        } catch(error) {
           console.error('Latar belakang refresh inventory gagal:', error);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Gagal menghapus data dari server.');
      }
    }
  };

  // POS Handlers
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedBunga || qtyBeli < 1) return;

    const bunga = inventory.find(b => b.id === Number(selectedBunga));
    if (!bunga) return;

    // Cek jika kuantitas melebihi stok yang ada + yang sudah di keranjang
    const existingCartItem = cart.find(item => item.id === bunga.id);
    const existingQty = existingCartItem ? existingCartItem.jumlah : 0;
    
    if (existingQty + qtyBeli > bunga.stok) {
       alert(`Stok tidak mencukupi! Sisa stok yang bisa dibeli: ${bunga.stok - existingQty}`);
       return;
    }

    if (existingCartItem) {
      setCart(cart.map(item => 
        item.id === bunga.id 
          ? { ...item, jumlah: item.jumlah + qtyBeli, subtotal: (item.jumlah + qtyBeli) * item.harga }
          : item
      ));
    } else {
      setCart([...cart, {
        id: bunga.id,
        nama: bunga.nama,
        harga: bunga.harga,
        jumlah: qtyBeli, // Used 'jumlah' here to map to backend expectation
        subtotal: qtyBeli * bunga.harga
      }]);
    }
    
    // Reset form pos
    setSelectedBunga('');
    setSearchKasir('');
    setQtyBeli(1);
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalCheckout = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // Format payload keranjang according to backend specs: [{id: 1, jumlah: 2}]
    const cartPayload = cart.map(item => ({
       id: item.id,
       jumlah: item.jumlah
    }));

    // Generate detail string items
    const itemsDetailString = cart.map(item => `${item.nama} (${item.jumlah})`).join(', ');

    try {
      await axios.post(`${API_BASE_URL}/checkout`, {
        keranjang: cartPayload,
        total_harga: totalCheckout,
        items_detail: itemsDetailString
      });

      // 3. Kosongkan keranjang & Tampilkan sukses
      setTempTotalCheckout(totalCheckout);
      setShowSuccessAlert(true);
      setCart([]);
      
      // Refresh inventory and dashboard to reflect database changes
      // Temporary inline fetches to substitute the hoisted functions
      try {
        const dashboardRes = await axios.get(`${API_BASE_URL}/dashboard`);
        setDashboardMetrics({
          penjualanHarian: dashboardRes.data.penjualanHarian || 0,
          penjualanBulanan: dashboardRes.data.penjualanBulanan || 0
        });
        
        const inventoryRes = await axios.get(`${API_BASE_URL}/bunga`);
        setInventory(inventoryRes.data);

        const transaksiRes = await axios.get(`${API_BASE_URL}/transaksi`);
        const mappedData = transaksiRes.data.map(item => {
          const dateStr = item.tanggal.split('T')[0];
          const timeStr = item.tanggal.split('T')[1].substring(0, 5);
          return {
            id_transaksi: 'TRX-' + item.id,
            tanggal: dateStr,
            waktu: timeStr,
            items: item.items,
            total_harga: item.total_harga
          };
        });
        setDataTransaksi(mappedData);
      } catch(error) {
        console.error('Warning: data could not immediately refresh after checkout', error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Gagal memproses checkout ke server!');
    }
  };

  const totalKeranjang = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 p-6 md:p-8 font-sans pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Manajemen Kios Bunga</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Sistem Manajemen Inventaris & Penjualan</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
              title={isDarkMode ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 bg-primary-50 dark:bg-slate-800 text-primary-900 dark:text-slate-100 px-5 py-3 rounded-xl font-medium border border-primary-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
              <Clock className="w-5 h-5 text-primary-600 dark:text-slate-300" />
              <span className="text-lg tabular-nums tracking-tight">
                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white border-t border-x border-slate-200 dark:border-slate-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none relative top-[1px]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & Kasir
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'laporan' 
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white border-t border-x border-slate-200 dark:border-slate-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none relative top-[1px]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Laporan & Riwayat
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* METRICS & WEATHER CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-sky-400 to-blue-500 dark:from-blue-900 dark:to-slate-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
            <div>
              {isEditingKota ? (
                <input
                  type="text"
                  value={inputKotaTemp}
                  autoFocus
                  onChange={(e) => setInputKotaTemp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (inputKotaTemp.trim()) setNamaKota(inputKotaTemp.trim());
                      setIsEditingKota(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingKota(false);
                    }
                  }}
                  onBlur={() => setIsEditingKota(false)}
                  className="bg-white/20 border-b-2 border-white text-white font-medium mb-1 px-1 py-0.5 outline-none placeholder-sky-200"
                  placeholder="Ketik nama kota..."
                />
              ) : (
                <button 
                  type="button"
                  className="text-sky-100 font-medium mb-1 flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setInputKotaTemp(namaKota);
                    setIsEditingKota(true);
                  }}
                  title="Klik untuk ubah kota"
                >
                  Cuaca {namaKota} <Edit className="w-3 h-3 opacity-70" />
                </button>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tighter">{cuaca.suhu}°C</span>
                <span className="text-sky-100 font-medium">{cuaca.deskripsi}</span>
              </div>
              <p className="text-sm text-sky-100 mt-2 flex items-center gap-1 opacity-90">
                Kelembapan: {cuaca.kelembapan}%
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              {cuaca.ikon ? (
                <img src={`https://openweathermap.org/img/wn/${cuaca.ikon}@2x.png`} alt="Ikon Cuaca" className="w-10 h-10 object-contain drop-shadow-md" />
              ) : (
                <CloudSun className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {/* Daily Sales */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Penjualan Harian</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatRupiah(dashboardMetrics.penjualanHarian)}</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle className="w-4 h-4" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Monthly Sales */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Penjualan Bulanan</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatRupiah(dashboardMetrics.penjualanBulanan)}</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1 font-medium">
                <Package className="w-4 h-4" /> {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </section>

        {/* INVENTORY & POS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-8">
            {/* INVENTORY SECTION */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              Inventaris Bunga
            </h2>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama bunga..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow duration-200"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-1" />
                Tambah Bunga
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Jenis Bunga
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Lokasi Bunga
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Harga
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Kuantitas / Stok
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.nama}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100">
                          {item.lokasi}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-100 font-medium">{formatRupiah(item.harga)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <div className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md text-sm font-bold ${
                           item.stok < 20 ? 'bg-red-100 text-red-800 dark:text-red-900' : 'bg-emerald-100 text-emerald-700 dark:text-emerald-900'
                         }`}>
                           {item.stok}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3" />
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pencarian "{searchQuery}" tidak cocok dengan inventaris atau inventaris kosong.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-400 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-primary-500 outline-none'
                }`}
              >
                Sebelumnya
              </button>
              
              <span className="text-sm font-medium text-slate-800 dark:text-slate-400">
                Halaman {currentPage} dari {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-400 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-primary-500 outline-none'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          )}
            </section>
          </div>

          {/* POINT OF SALE (KASIR) SECTION */}
          <section className="col-span-12 lg:col-span-4 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 max-h-[calc(100vh-120px)] sticky top-6 transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                Kasir
              </h2>
            </div>
            
            {/* Input Kasir */}
            <div className="p-6 shrink-0 border-b border-gray-100 dark:border-slate-700">
              <form onSubmit={handleAddToCart} className="space-y-4">
                <div className="relative">
                  <label htmlFor="bunga-search" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Pilih Bunga (Stok Tersedia)
                  </label>
                  <input
                    type="text"
                    id="bunga-search"
                    placeholder="Ketik untuk mencari bunga..."
                    value={searchKasir}
                    autoComplete="off"
                    onChange={(e) => {
                      setSearchKasir(e.target.value);
                      setIsDropdownKasirOpen(true);
                      if (selectedBunga) setSelectedBunga(''); // Reset selection if typing starts again
                    }}
                    onFocus={() => setIsDropdownKasirOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownKasirOpen(false), 200)}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-shadow"
                  />
                  
                  {isDropdownKasirOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredBungaKasir.length > 0 ? (
                        <ul className="py-1">
                          {filteredBungaKasir.map(bunga => (
                            <li key={bunga.id} className="border-b border-slate-50 dark:border-slate-600/50 last:border-0">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedBunga(bunga.id);
                                  setSearchKasir(`${bunga.nama} (${formatRupiah(bunga.harga)})`);
                                  setIsDropdownKasirOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer flex justify-between items-center transition-colors focus:bg-slate-50 dark:focus:bg-slate-600 outline-none"
                              >
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-slate-100">{bunga.nama}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatRupiah(bunga.harga)}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${bunga.stok < 20 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-700'}`}>
                                  Stok: {bunga.stok}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-4 text-sm text-center text-slate-500 dark:text-slate-400">
                          Bunga "{searchKasir}" tidak ditemukan atau stok habis.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="qty-beli" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Hash className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Jumlah
                  </label>
                  <input
                    type="number"
                    id="qty-beli"
                    min="1"
                    required
                    value={qtyBeli}
                    onChange={(e) => setQtyBeli(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-blue-700 dark:text-blue-100 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none transition-colors duration-200 mt-2"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Tambah ke Keranjang
                </button>
              </form>
            </div>

            {/* Keranjang Belanja */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-900/40">
                {cart.length > 0 ? (
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <li key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.nama}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.jumlah} x {formatRupiah(item.harga)}</p>
                        </div>
                        <div className="text-right mr-4 font-medium text-slate-700 dark:text-slate-300">
                          {formatRupiah(item.subtotal)}
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 p-1 rounded transition-colors"
                          title="Hapus dari Keranjang"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 text-center px-4">
                    <ShoppingCart className="w-12 h-12 mb-3 text-slate-400" />
                    <p className="font-medium text-slate-700">Keranjang belanja masih kosong.</p>
                    <p className="text-sm mt-1">Gunakan kolom pencarian di atas untuk menambahkan pesanan bunga.</p>
                  </div>
                )}
            </div>
              
            {/* Checkout Bar */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 flex flex-col gap-4 shrink-0 transition-colors duration-300">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Harga</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatRupiah(totalKeranjang)}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full inline-flex justify-center items-center px-8 py-3.5 text-base font-bold rounded-xl transition-all duration-200 ${
                    cart.length > 0 
                    ? 'text-white bg-green-600 dark:bg-blue-600 hover:bg-green-700 dark:hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-blue-500' 
                    : 'text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Checkout / Bayar
                </button>
            </div>
          </section>
        </div>

          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* FILTER SECTION */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 transition-colors duration-300">
              <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
                <div className="w-full sm:flex-1 md:w-48 relative">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Mulai Tanggal
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                  />
                </div>
                <div className="w-full sm:flex-1 md:w-48 relative">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Sampai Tanggal
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                  />
                </div>
                <button 
                  onClick={() => {
                    setAppliedStartDate(startDate);
                    setAppliedEndDate(endDate);
                    setCurrentPageLaporan(1);
                  }}
                  className="w-full sm:w-auto px-8 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-600 transition-all shadow-md h-[46px]"
                >
                  Terapkan Filter
                </button>
              </div>
              
              <div className="flex flex-row flex-wrap items-center gap-4 w-full md:w-auto mt-4 md:mt-0 justify-end">
                <div className="flex flex-col items-end bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-lg border border-blue-100 dark:border-blue-800 flex-1 sm:flex-none w-full sm:w-auto">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rata-rata per Transaksi</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(rataRataTransaksi)}</span>
                </div>
                <div className="flex flex-col items-end bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-lg border border-green-100 dark:border-green-800 flex-1 sm:flex-none w-full sm:w-auto">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Pemasukan</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatRupiah(totalPendapatanFilter)}</span>
                </div>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-colors duration-300">
              <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ringkasan Tren Penjualan</h2>
                </div>

                {/* Chart Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                  <button
                    onClick={() => setTipeGrafik('harian')}
                    className={`px-5 py-2 text-sm font-bold rounded-md transition-all ${tipeGrafik === 'harian' ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    Grafik Harian
                  </button>
                  <button
                    onClick={() => setTipeGrafik('bulanan')}
                    className={`px-5 py-2 text-sm font-bold rounded-md transition-all ${tipeGrafik === 'bulanan' ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    Grafik Bulanan
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Line Chart Pendapatan */}
                <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider text-center">Tren Total Pendapatan {tipeGrafik === 'harian' ? 'Harian' : 'Bulanan'}</h3>
                  {activeTab === 'laporan' && (
                    <div className="h-80 min-h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={aggregatedChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <Line type="monotone" dataKey="total_pendapatan" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Pendapatan (Rp)" />
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" vertical={false} />
                          <XAxis dataKey="tanggal" stroke="#64748b" fontSize={12} tickMargin={10} />
                          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `Rp${value / 1000}k`} />
                          <Tooltip 
                            formatter={(value) => formatRupiah(value)}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#475569' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Bar Chart Transaksi */}
                <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider text-center">Frekuensi Transaksi {tipeGrafik === 'harian' ? 'Harian' : 'Bulanan'}</h3>
                  {activeTab === 'laporan' && (
                    <div className="h-80 min-h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={aggregatedChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <Bar dataKey="jumlah_transaksi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jml Transaksi" />
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" vertical={false} />
                          <XAxis dataKey="tanggal" stroke="#64748b" fontSize={12} tickMargin={10} />
                          <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#475569' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* TRANSACTION TABLE DETAIL */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    Detail Transaksi Terbaru
                  </h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-4">
                  <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari ID Transaksi atau Bunga..."
                      value={searchTransaksi}
                      onChange={(e) => {
                        setSearchTransaksi(e.target.value);
                        setCurrentPageLaporan(1);
                      }}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow duration-200"
                    />
                  </div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shrink-0">
                    Total {finalTableData.length} Riwayat Transaksi
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full relative">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
                  <thead className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-none">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80">
                        ID Transaksi
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80">
                        Tanggal & Waktu
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80">
                        Daftar Bunga (Item)
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80">
                        Total Harga
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                    {currentLaporanItems.length > 0 ? (
                      currentLaporanItems.map((trx) => (
                        <tr key={trx.id_transaksi} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{trx.id_transaksi}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-medium">{trx.tanggal}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-300">{trx.waktu} WIB</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-100 line-clamp-2" title={trx.items}>
                              {trx.items}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{formatRupiah(trx.total_harga)}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                          Tidak ada riwayat transaksi ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Laporan */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-400">{finalTableData.length > 0 ? indexOfFirstLaporan + 1 : 0}</span> - <span className="font-semibold text-slate-800 dark:text-slate-400">{Math.min(indexOfLastLaporan, finalTableData.length)}</span> dari <span className="font-semibold text-slate-800 dark:text-slate-400">{finalTableData.length}</span> transaksi
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPageLaporan(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageLaporan === 1}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPageLaporan === 1 ? 'border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm dark:shadow-none'}`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPageLaporan(prev => Math.min(prev + 1, totalPagesLaporan))}
                    disabled={currentPageLaporan === totalPagesLaporan || totalPagesLaporan === 0}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPageLaporan === totalPagesLaporan || totalPagesLaporan === 0 ? 'border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm dark:shadow-none'}`}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <dialog open className="bg-transparent m-0 fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 w-full h-full max-w-none max-h-none" aria-labelledby="modal-title">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>

          {/* Modal Content container */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl text-left shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full ring-1 ring-slate-900/5 dark:ring-slate-700">
            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100 dark:border-slate-700 rounded-t-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-slate-100" id="modal-title">
                  {editingId ? 'Edit Bunga' : 'Tambah Bunga Baru'}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Bunga</label>
                  <input
                    type="text"
                    name="nama"
                    id="nama"
                    required
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-shadow"
                    placeholder="Contoh: Mawar Merah"
                  />
                </div>
                <div>
                  <label htmlFor="lokasi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lokasi Bunga</label>
                  <input
                    type="text"
                    name="lokasi"
                    id="lokasi"
                    required
                    value={formData.lokasi}
                    onChange={handleChange}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-shadow"
                    placeholder="Contoh: Rak Depan, Area Luar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="harga" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      name="harga"
                      id="harga"
                      required
                      min="0"
                      value={formData.harga}
                      onChange={handleChange}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-shadow"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="stok" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kuantitas / Stok</label>
                    <input
                      type="number"
                      name="stok" // matches API payload key
                      id="stok"
                      required
                      min="0"
                      value={formData.stok}
                      onChange={handleChange}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-shadow"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-white shadow-sm hover:bg-green-700 font-medium transition-colors"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Tambah Bunga'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
      )}

      {/* SUCCESS CHECKOUT MODAL */}
      {showSuccessAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 text-center transform transition-all animate-in zoom-in-95 duration-200">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Berhasil!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Pembayaran sebesar <span className="font-bold text-gray-700 dark:text-gray-300">{formatRupiah(tempTotalCheckout)}</span> telah berhasil dicatat ke sistem.
            </p>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
