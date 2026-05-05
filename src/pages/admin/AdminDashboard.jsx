import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import Pagination from '../../components/Pagination'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    revenue: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    users: <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
    voucher: <path d="M15 5v2m-6-2v2M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4M3 10h18M3 10v10a2 2 0 002 2h14a2 2 0 002-2V10M7 14h10" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    trend: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    bill: <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />,
    check: <path d="M5 13l4 4L19 7" />,
    close: <path d="M6 18L18 6M6 6l12 12" />
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [peakHours, setPeakHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [time, setTime] = useState(new Date())
  
  // History Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [historyData, setHistoryData] = useState({ data: [], meta: { links: [] } })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all')

  const formatPrice = (val) => Math.floor(val || 0).toLocaleString('id-ID');

  const [isMaintenance, setIsMaintenance] = useState(false)

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [statsRes, peakRes, maintRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/analytics/peak-hours`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/maintenance/status`)
      ])
      setData(statsRes.data)
      setPeakHours(peakRes.data)
      setIsMaintenance(maintRes.data.maintenance_mode)
    } catch (err) {
      console.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const toggleMaintenance = async () => {
    if (!confirm(`Apakah Anda yakin ingin ${isMaintenance ? 'MENONAKTIFKAN' : 'MENGAKTIFKAN'} Mode Maintenance?`)) return
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/maintenance/toggle`, { active: !isMaintenance }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsMaintenance(!isMaintenance)
    } catch (err) {
      alert('Gagal mengubah mode maintenance')
    }
  }

  const fetchHistory = async (page = 1, filter = historyFilter) => {
    setHistoryLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/transactions?page=${page}&filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistoryData({ data: res.data.data, meta: res.data })
    } catch (err) {
      console.error('Failed to fetch history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/dashboard/refresh-mikrotik`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchData()
    } catch (err) {
      alert('Gagal sinkronisasi router')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const clockTimer = setInterval(() => setTime(new Date()), 1000)
    const dataTimer = setInterval(fetchData, 30000)
    return () => {
      clearInterval(clockTimer)
      clearInterval(dataTimer)
    }
  }, [])

  useEffect(() => {
    if (modalOpen) fetchHistory(1, historyFilter)
  }, [modalOpen, historyFilter])

  if (loading || !data) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )

  const chartConfig = {
    labels: data?.chart.map(c => new Date(c.date).getDate()) || [],
    datasets: [{
      label: 'Pendapatan (Rp)',
      data: data?.chart.map(c => c.total) || [],
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 10, family: 'Inter', weight: '900' },
        bodyFont: { size: 14, family: 'Inter', weight: '700' },
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => `Rp ${formatPrice(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: '#f1f5f9' },
        ticks: { 
          font: { size: 10, family: 'Inter', weight: '700' },
          callback: (v) => v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(0) + 'K' : v
        }
      },
      x: {
        grid: { display: false }
      }
    }
  }

  return (
    <div className="space-y-8 pb-20">
        {/* Header Dashboard */}
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">Selamat datang kembali, Admin! 
                        <span className="text-blue-600 font-medium ml-1">• Sistem Billing ND-Hotspot</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg font-medium border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Icon name="clock" className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">
                                {time.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })},{' '}
                                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-75"
                    >
                        <Icon name="refresh" className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Memuat...' : 'Refresh Data'}
                    </button>
                    <button 
                        onClick={toggleMaintenance}
                        className={`px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${isMaintenance ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isMaintenance ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
                        {isMaintenance ? 'Maint: ON' : 'Maint: OFF'}
                    </button>
                </div>
            </div>
        </div>

        {/* Statistik Atas (3 Kolom Besar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* Kotak 1: Total Pendapatan */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                        <Icon name="revenue" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">Bulan Ini</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">Hari Ini</span>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Total Pendapatan Bulan Ini</p>
                        <p className="text-2xl font-bold text-gray-900">Rp {formatPrice(data.stats.monthly_revenue)}</p>
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                            <Icon name="trend" className="w-3.5 h-3.5 mr-1" />
                            <span>{data.stats.monthly_revenue > 0 ? (100).toFixed(1) : '0'}% dari target</span>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-blue-100">
                        <p className="text-sm text-gray-600 mb-1 font-medium">Total Omset Hari Ini</p>
                        <p className="text-2xl font-bold text-emerald-700">Rp {formatPrice(data.stats.today_revenue)}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center text-xs text-emerald-600">
                                <Icon name="trend" className="w-3.5 h-3.5 mr-1" />
                                <span>vs kemarin</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded font-bold">Bill {data.stats.today_revenue > 0 ? ((data.stats.bill_revenue_today/data.stats.today_revenue)*100).toFixed(0) : '0'}%</span>
                                <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-bold">VCR {data.stats.today_revenue > 0 ? ((data.stats.voucher_revenue_today/data.stats.today_revenue)*100).toFixed(0) : '0'}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kotak 2: Total Pelanggan */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-gray-100 rounded-lg">
                        <Icon name="users" className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">Total</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">Due</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-800">Isolir</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1 font-medium">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{data.stats.total_customers.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1 font-medium">Due</p>
                        <p className="text-2xl font-bold text-yellow-600">{data.stats.due_customers.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1 font-medium">Isolir</p>
                        <p className="text-2xl font-bold text-red-600">{data.stats.isolated_customers.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Statistik pelanggan terkini</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {data.stats.online_count} Online
                        </span>
                    </div>
                </div>
            </div>

            {/* Kotak 3: Pendapatan Bill dan Voucher */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-purple-100 rounded-lg">
                        <Icon name="bill" className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">Hari Ini</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <p className="text-xs text-gray-600 mb-1">Pendapatan Bill</p>
                        <p className="text-lg font-bold text-purple-700">Rp {formatPrice(data.stats.bill_revenue_today)}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-200 p-3">
                        <p className="text-xs text-gray-600 mb-1">Voucher Terjual</p>
                        <p className="text-lg font-bold text-emerald-700">{data.stats.voucher_sold_today.toLocaleString('id-ID')}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-600">
                            <span>VCR</span>
                            <span className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-bold">
                                {time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200 p-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Pendapatan Voucher</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">Rp {formatPrice(data.stats.voucher_revenue_today)}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Rata-rata/voucher:</span>
                        <span className="font-semibold text-emerald-700">
                            Rp {data.stats.voucher_sold_today > 0 ? formatPrice(data.stats.voucher_revenue_today/data.stats.voucher_sold_today) : '0'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Chart Pendapatan Bulan Berjalan (Full Width) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Trend Pendapatan {time.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Analisis pendapatan harian Bill dan Voucher (Tanggal 1 - Akhir Bulan)</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        Total: Rp {formatPrice(data.stats.monthly_revenue)}
                    </span>
                </div>
            </div>
            
            <div className="h-80 w-full">
                <Line data={chartConfig} options={chartOptions} />
            </div>
        </div>

        {/* Jam Ramai Grid */}
        <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Peak Hours Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Jam Ramai Pengunjung (Hari Ini)</h3>
                        <p className="text-xs text-gray-500 mt-1">Statistik kunjungan unik per jam (Reset setiap hari)</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                        <Icon name="clock" className="w-4 h-4" />
                    </div>
                </div>
                <div className="h-64 w-full">
                    <Bar 
                        data={{
                            labels: peakHours.map(p => p.hour),
                            datasets: [{
                                label: 'Visitor Hits',
                                data: peakHours.map(p => p.count),
                                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                                hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
                                borderRadius: 4,
                            }]
                        }} 
                        options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                tooltip: {
                                    ...chartOptions.plugins.tooltip,
                                    callbacks: {
                                        label: (ctx) => `${ctx.parsed.y} Kunjungan`
                                    }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>

        {/* Voucher Aktif & Transaksi Terkini */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Voucher Aktif & User Online */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Voucher Aktif & Online</h3>
                            <p className="text-xs text-gray-500 mt-1">Gabungan sesi aktif</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center w-6 h-6">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full absolute animate-ping"></div>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold">
                                {data.stats.online_count} Online
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Voucher</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Uptime</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {data.combined_users.length > 0 ? data.combined_users.map((user, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_online ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-emerald-700 border border-emerald-200">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                Online
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                                                Offline
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900 uppercase">{user.code}</p>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase">{user.plan_name || 'VOUCHER'}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            {user.is_online ? (
                                                <>
                                                    <span className="font-mono text-xs font-bold text-gray-700">Uptime: {user.uptime}</span>
                                                    <span className="text-[9px] text-rose-600 font-bold mt-0.5">
                                                        Exp: {user.expires_at ? new Date(user.expires_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">
                                                    {user.expires_at 
                                                        ? `Exp: ${new Date(user.expires_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}` 
                                                        : 'Belum Digunakan'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-400 text-sm italic">
                                        Tidak ada sesi aktif
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaksi Terkini */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Transaksi Terkini</h3>
                            <p className="text-xs text-gray-500 mt-1">Pembayaran terbaru yang berhasil</p>
                        </div>
                        <button 
                            onClick={() => setModalOpen(true)}
                            className="px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                            Lihat Semua
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {data.recent_transactions.length > 0 ? data.recent_transactions.map((tx) => {
                        const isBill = tx.external_id?.startsWith('BILL-') || tx.external_id?.startsWith('MANUAL-');
                        return (
                            <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isBill ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                            <Icon name={isBill ? 'bill' : 'voucher'} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            {isBill ? (
                                                <p className="font-bold text-sm text-gray-900">{tx.customer?.name || tx.external_id}</p>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <p className="font-bold text-sm text-gray-900">{tx.voucher?.code || 'ND-VOUCHER'}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold">{tx.customer_phone || '-'}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase">SUCCESS</span>
                                                <span className="text-[9px] text-blue-600 font-mono tracking-tight">{tx.external_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600">+Rp {formatPrice(tx.amount)}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 font-medium">
                                            {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm italic">Belum ada transaksi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Modal Riwayat Transaksi */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">Riwayat Transaksi</h3>
                                <p className="text-gray-300 text-sm mt-1">Semua transaksi yang berhasil diproses</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-xl transition-colors">
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex space-x-2 mt-6">
                            {['all', 'bill', 'voucher'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setHistoryFilter(f)}
                                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${historyFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'bill' ? 'Tagihan' : 'Voucher'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto relative p-6 bg-gray-50">
                        {historyLoading && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-sm font-bold text-gray-600">Memuat data...</p>
                            </div>
                        )}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pelanggan / Detail</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Metode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {historyData?.data?.map((tx) => {
                                        const isBill = tx.external_id?.startsWith('BILL-') || tx.external_id?.startsWith('MANUAL-');
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">{tx.external_id}</td>
                                                <td className="px-6 py-4">
                                                    {isBill ? (
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{tx.customer?.name || '-'}</p>
                                                            <p className="text-[10px] text-gray-500">{tx.customer_phone || '-'}</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-sm font-bold text-blue-600 uppercase">{tx.voucher?.code || 'VOUCHER'}</p>
                                                            <p className="text-[10px] text-gray-500">WA: {tx.customer_phone || '-'}</p>
                                                            <p className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded inline-block font-bold">{tx.plan?.name || 'Voucher Plan'}</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isBill ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {isBill ? 'Tagihan' : 'Voucher'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 text-base">Rp {formatPrice(tx.amount)}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                                    {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                                        {tx.payment_method || 'QRIS'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {!historyLoading && historyData?.data?.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-gray-400 font-medium">Belum ada transaksi untuk filter ini.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Pagination meta={historyData.meta} onPageChange={(p) => fetchHistory(p)} />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default AdminDashboard
