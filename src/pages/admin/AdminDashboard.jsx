import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  // Voucher Chart Modal State
  const [voucherChartModalOpen, setVoucherChartModalOpen] = useState(false)

  const formatPrice = (val) => Math.floor(val || 0).toLocaleString('id-ID');

  const [isMaintenance, setIsMaintenance] = useState(false)
  const [routerStatus, setRouterStatus] = useState({ online: null, latency_ms: null })

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

  const fetchRouterStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mikrotik/status`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      })
      setRouterStatus(res.data)
    } catch (err) {
      setRouterStatus({ online: false, latency_ms: null, error: 'Gagal cek status' })
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
    fetchRouterStatus()
    const routerInterval = setInterval(fetchRouterStatus, 30000)
    return () => clearInterval(routerInterval)
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
      fill: false,
      borderColor: '#0ea5e9', // admin-accent
      backgroundColor: 'transparent',
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#0ea5e9',
      borderWidth: 2
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff', // admin-card
        titleColor: '#64748b', // zinc-400
        bodyColor: '#0f172a', // zinc-100
        borderColor: '#e2e8f0', // admin-border
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `Rp ${formatPrice(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9', drawBorder: false },
        border: { display: false },
        ticks: { 
          color: '#64748b', // zinc-500
          font: { size: 11 },
          callback: (v) => v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : v >= 1000 ? (v/1000).toFixed(0) + 'K' : v,
          padding: 10
        }
      },
      x: {
        grid: { display: false, drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          padding: 10
        }
      }
    }
  }

  return (
    <div className="space-y-6 pb-20">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
                <h1 className="text-2xl font-semibold text-admin-text tracking-tight">Dashboard</h1>
                <p className="text-admin-muted text-sm mt-1">Sistem Billing ND-Hotspot</p>
            </div>
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border ${routerStatus.online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : routerStatus.online === false ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${routerStatus.online ? 'bg-emerald-500 animate-pulse' : routerStatus.online === false ? 'bg-red-500' : 'bg-zinc-500 animate-pulse'}`}></span>
                    {routerStatus.online ? `Router ${routerStatus.latency_ms}ms` : routerStatus.online === false ? 'Router Offline' : 'Checking...'}
                </div>
                <div className="text-xs text-admin-muted bg-admin-base/50 px-3 py-1.5 rounded-md border border-admin-border flex items-center gap-2">
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    <span>
                        {time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} • {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <button 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-admin-accent text-white text-xs font-medium rounded-md hover:bg-admin-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Icon name="refresh" className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Memuat...' : 'Refresh'}
                </button>
                <button 
                    onClick={toggleMaintenance}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-2 transition-colors ${isMaintenance ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-admin-base text-admin-text border-admin-border hover:bg-zinc-700'}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${isMaintenance ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></div>
                    Maint
                </button>
            </div>
        </div>

        {/* Router Status Banner */}
        {routerStatus.online === false && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                <p className="text-sm font-medium text-red-400">🔴 Router Offline — Periksa koneksi MikroTik segera!</p>
            </div>
        {/* ONU Health Section */}
        {data?.stats?.olt_stats?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.stats.olt_stats.map(olt => (
                    <div key={olt.id} className="bg-admin-card border border-admin-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black uppercase tracking-widest text-admin-text truncate pr-2">{olt.name}</span>
                            <Link to="/admin/network-center" className="text-[10px] bg-admin-base px-2 py-1 rounded-md text-admin-muted hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                                DETAIL
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Online</p>
                                <p className="text-lg font-black text-emerald-600">{olt.online}</p>
                            </div>
                            <div className={`rounded-lg p-2 text-center ${olt.offline > 0 ? 'bg-rose-500/10 animate-pulse' : 'bg-admin-base'}`}>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${olt.offline > 0 ? 'text-rose-600' : 'text-admin-muted'}`}>Offline</p>
                                <p className={`text-lg font-black ${olt.offline > 0 ? 'text-rose-600' : 'text-admin-muted'}`}>{olt.offline}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Statistik Atas (3 Kolom Besar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kotak 1: Total Pendapatan */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 flex flex-col justify-between">
                <div>
                    <p className="text-sm font-medium text-admin-muted mb-1">Pendapatan Bulan Ini</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-semibold text-admin-text tracking-tight">Rp {formatPrice(data.stats.monthly_revenue)}</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-admin-border flex items-center justify-between">
                    <div>
                        <p className="text-xs text-admin-muted">Omset Hari Ini</p>
                        <p className="text-sm font-medium text-admin-success mt-0.5">Rp {formatPrice(data.stats.today_revenue)}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-admin-base/50 text-admin-muted rounded border border-admin-border">Bill {data.stats.today_revenue > 0 ? ((data.stats.bill_revenue_today/data.stats.today_revenue)*100).toFixed(0) : '0'}%</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-admin-base/50 text-admin-muted rounded border border-admin-border">Vcr {data.stats.today_revenue > 0 ? ((data.stats.voucher_revenue_today/data.stats.today_revenue)*100).toFixed(0) : '0'}%</span>
                    </div>
                </div>
            </div>

            {/* Kotak 2: Total Pelanggan */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-admin-muted">Pelanggan Aktif</p>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-admin-success/10 text-admin-success text-[10px] font-medium rounded-full border border-admin-success/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-admin-success"></span>
                            {data.stats.online_count} Online
                        </span>
                    </div>
                    <p className="text-3xl font-semibold text-admin-text tracking-tight">{data.stats.total_customers.toLocaleString('id-ID')}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-admin-border grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-admin-muted">Tunggakan (Due)</p>
                        <p className="text-sm font-medium text-amber-500 mt-0.5">{data.stats.due_customers.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-admin-muted">Terisolir</p>
                        <p className="text-sm font-medium text-red-500 mt-0.5">{data.stats.isolated_customers.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            {/* Kotak 3: Detail Hari Ini */}
            <div className="bg-admin-card rounded-xl border border-admin-border p-5 flex flex-col justify-between">
                <div>
                    <p className="text-sm font-medium text-admin-muted mb-1">Performa Hari Ini</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <p className="text-xs text-admin-muted">Bill Masuk</p>
                            <p className="text-lg font-semibold text-admin-text mt-0.5">Rp {formatPrice(data.stats.bill_revenue_today)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-admin-muted">Voucher Terjual</p>
                            <p className="text-lg font-semibold text-admin-text mt-0.5">{data.stats.voucher_sold_today.toLocaleString('id-ID')} <span className="text-xs text-admin-muted font-normal">voucher</span></p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-admin-border">
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <p className="text-xs text-admin-muted">Pendapatan Voucher</p>
                            <button 
                                onClick={() => setVoucherChartModalOpen(true)}
                                className="mt-1 px-3 py-1 bg-admin-base border border-admin-border text-[10px] font-semibold text-admin-text rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1"
                            >
                                <Icon name="trend" className="w-3 h-3 text-admin-accent" />
                                Lihat Chart
                            </button>
                        </div>
                        <p className="text-lg font-bold text-admin-text mt-0.5">Rp {formatPrice(data.stats.voucher_revenue_today)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-admin-card rounded-xl border border-admin-border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-semibold text-admin-text tracking-tight">Trend Pendapatan {time.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <p className="text-xs text-admin-muted mt-1">Statistik pendapatan harian bulan ini</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <span className="flex items-center text-[10px] text-admin-muted font-medium"><span className="w-2 h-2 rounded-full bg-admin-accent mr-1.5"></span> Total Pendapatan</span>
                </div>
            </div>
            
            <div className="h-72 w-full">
                <Line data={chartConfig} options={chartOptions} />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-admin-text">Jam Ramai Pengunjung (Hari Ini)</h3>
                        <p className="text-xs text-admin-muted mt-1">Statistik kunjungan unik per jam (Reset setiap hari)</p>
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
                                backgroundColor: '#2563eb',
                                hoverBackgroundColor: '#1d4ed8',
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border overflow-hidden">
                <div className="px-6 py-4 border-b border-admin-border bg-admin-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-admin-text">Voucher Aktif & Online</h3>
                            <p className="text-xs text-admin-muted mt-1">Gabungan sesi aktif</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full absolute animate-ping"></div>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                                {data.stats.online_count} Online
                            </span>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-admin-border max-h-[400px] overflow-y-auto">
                    {data.combined_users?.length > 0 ? data.combined_users.map((user, i) => (
                        <div key={i} className="p-4 hover:bg-admin-base transition-colors flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-admin-text uppercase">{user.code}</p>
                                    {user.is_online ? (
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    ) : (
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-admin-accent uppercase mt-1">{user.plan_name || 'VOUCHER'}</p>
                            </div>
                            <div className="text-right">
                                {user.is_online ? (
                                    <>
                                        <p className="text-xs font-mono font-bold text-admin-text">{user.uptime}</p>
                                        <p className="text-[10px] font-medium text-rose-500 mt-0.5">Exp: {user.expires_at ? new Date(user.expires_at).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                    </>
                                ) : (
                                    <p className="text-[10px] text-admin-muted italic mt-2">
                                        {user.expires_at 
                                            ? `Exp: ${new Date(user.expires_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}` 
                                            : 'Belum Digunakan'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-admin-muted text-sm">Tidak ada sesi / voucher aktif.</div>
                    )}
                </div>
            </div>

            <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border overflow-hidden">
                <div className="px-6 py-4 border-b border-admin-border bg-admin-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-admin-text">Pembayaran Terbaru</h3>
                            <p className="text-xs text-admin-muted mt-1">Pembayaran terbaru yang berhasil</p>
                        </div>
                        <button 
                            onClick={() => setModalOpen(true)}
                            className="px-3 py-1.5 text-xs font-semibold text-admin-text bg-admin-base border border-admin-border rounded-md hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            Lihat Semua
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-admin-border max-h-[400px] overflow-y-auto">
                    {data.recent_transactions.length > 0 ? data.recent_transactions.map((tx) => {
                        const isBill = tx.external_id?.startsWith('BILL-') || tx.external_id?.startsWith('MANUAL-');
                        return (
                            <div key={tx.id} className="p-4 hover:bg-admin-base transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isBill ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                            <Icon name={isBill ? "bill" : "voucher"} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-admin-text">
                                                {isBill 
                                                    ? (tx.customer?.name || tx.customer_name || 'Pelanggan') 
                                                    : `Voucher Hotspot${tx.voucher?.code ? ` - ${tx.voucher.code}` : ''}`}
                                            </p>
                                            <p className="text-[10px] text-admin-muted mt-0.5 font-mono">{tx.external_id}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    SUCCESS
                                                </span>
                                                <span className="text-[9px] text-admin-accent font-medium uppercase tracking-wider">{tx.reference_id || tx.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isBill ? 'text-purple-600' : 'text-emerald-600'}`}>
                                            +Rp {formatPrice(tx.amount)}
                                        </p>
                                        <p className="text-[10px] text-admin-muted mt-1">
                                            {new Date(tx.paid_at || tx.created_at).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="p-8 text-center text-admin-muted text-sm">Belum ada transaksi hari ini.</div>
                    )}
                </div>
            </div>
        </div>

        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-admin-card rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-admin-border">
                    <div className="bg-admin-card border-b border-admin-border px-8 py-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-admin-text">Riwayat Transaksi</h3>
                                <p className="text-admin-muted text-xs mt-1">Semua transaksi yang berhasil diproses</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 text-admin-muted hover:bg-admin-base hover:text-admin-text rounded-xl transition-colors">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex space-x-2 mt-6">
                            {['all', 'bill', 'voucher'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setHistoryFilter(f)}
                                    className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors border ${historyFilter === f ? 'bg-admin-text text-white border-admin-text' : 'bg-admin-base text-admin-muted border-admin-border hover:bg-slate-100'}`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'bill' ? 'Tagihan' : 'Voucher'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 bg-admin-base">
                        <div className="bg-admin-card rounded-xl border border-admin-border shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-admin-base border-b border-admin-border text-[10px] font-bold text-admin-muted uppercase tracking-wider">
                                        <th className="px-6 py-4">Waktu</th>
                                        <th className="px-6 py-4">Invoice / Ref</th>
                                        <th className="px-6 py-4">Tipe & Nama</th>
                                        <th className="px-6 py-4">Metode</th>
                                        <th className="px-6 py-4 text-right">Nominal</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {historyLoading ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-admin-muted"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></td></tr>
                                    ) : historyData?.data?.length > 0 ? (
                                        historyData.data.map((tx) => {
                                            const isBill = tx.external_id?.startsWith('BILL-') || tx.external_id?.startsWith('MANUAL-');
                                            return (
                                                <tr key={tx.id} className="hover:bg-admin-base/50 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-medium text-admin-muted">
                                                        {new Date(tx.paid_at || tx.created_at).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-mono font-bold text-admin-text">{tx.external_id}</p>
                                                        <p className="text-[10px] text-admin-accent mt-0.5">{tx.reference_id || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isBill ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                <Icon name={isBill ? "bill" : "voucher"} className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-admin-text">{tx.customer?.name || tx.customer_name || 'Voucher Hotspot'}</p>
                                                                <p className="text-[10px] text-admin-muted uppercase tracking-wider font-mono mt-0.5">
                                                                    {isBill ? 'Tagihan Bulanan' : (tx.voucher?.code || 'Voucher Eceran')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-admin-text uppercase">
                                                        {tx.payment_method || 'MANUAL'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-xs font-bold text-admin-text">
                                                        Rp {formatPrice(tx.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr><td colSpan="6" className="px-6 py-8 text-center text-admin-muted text-sm">Tidak ada data transaksi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {voucherChartModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-admin-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-admin-border">
                    <div className="bg-admin-card border-b border-admin-border px-8 py-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-admin-text flex items-center gap-2">
                                    <Icon name="trend" className="w-5 h-5 text-admin-accent" /> 
                                    Statistik Penjualan Voucher
                                </h3>
                                <p className="text-admin-muted text-xs mt-1">Tren pendapatan dari penjualan voucher 30 hari terakhir</p>
                            </div>
                            <button onClick={() => setVoucherChartModalOpen(false)} className="p-2 text-admin-muted hover:bg-admin-base hover:text-admin-text rounded-xl transition-colors">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 bg-admin-base overflow-y-auto">
                        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border p-6 h-[400px]">
                            <Line 
                                data={{
                                    labels: data?.voucher_chart?.map(c => new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })) || [],
                                    datasets: [{
                                        label: 'Pendapatan Voucher (Rp)',
                                        data: data?.voucher_chart?.map(c => c.total) || [],
                                        fill: true,
                                        borderColor: '#2563eb',
                                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                        tension: 0.4
                                    }]
                                }} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        tooltip: {
                                            ...chartOptions.plugins.tooltip,
                                            callbacks: {
                                                label: (ctx) => `Rp ${formatPrice(ctx.parsed.y)}`
                                            }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default AdminDashboard
