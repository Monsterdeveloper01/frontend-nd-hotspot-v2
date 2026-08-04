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

  // Chart Modal State
  const [chartModalOpen, setChartModalOpen] = useState(false)

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

  const chartDataArray = data?.chart.map(c => c.total) || [];
  const maxVal = chartDataArray.length > 0 ? Math.max(...chartDataArray) : 0;
  const maxIdx = chartDataArray.indexOf(maxVal);

  const chartConfig = {
    labels: data?.chart.map(c => new Date(c.date).getDate()) || [],
    datasets: [{
      label: 'Pendapatan (Rp)',
      data: chartDataArray,
      fill: true,
      borderColor: '#0ea5e9', // admin-accent
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
        return gradient;
      },
      tension: 0.4,
      pointRadius: context => context.dataIndex === maxIdx ? 5 : 0,
      pointBackgroundColor: context => context.dataIndex === maxIdx ? '#0ea5e9' : 'transparent',
      pointBorderColor: context => context.dataIndex === maxIdx ? '#ffffff' : 'transparent',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
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
        grid: { color: '#e2e8f0', drawBorder: false, borderDash: [4, 4], lineWidth: 1 },
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

  const getUnifiedChartData = () => {
      if (!data) return { labels: [], datasets: [] };

      const dateSet = new Set();
      const charts = ['voucher_chart', 'bill_chart', 'qris_statis_chart'];
      
      charts.forEach(chartName => {
          if (data[chartName]) {
              data[chartName].forEach(item => dateSet.add(item.date));
          }
      });

      const sortedDates = Array.from(dateSet).sort();

      const mapData = (chartName) => {
          if (!data[chartName]) return sortedDates.map(() => 0);
          const dataMap = data[chartName].reduce((acc, curr) => {
              acc[curr.date] = curr.total;
              return acc;
          }, {});
          return sortedDates.map(date => dataMap[date] || 0);
      };

      return {
          labels: sortedDates.map(d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
          datasets: [
              {
                  label: 'Voucher',
                  data: mapData('voucher_chart'),
                  fill: true,
                  borderColor: '#60a5fa', // Blue
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  tension: 0.4
              },
              {
                  label: 'Bill',
                  data: mapData('bill_chart'),
                  fill: true,
                  borderColor: '#10b981', // Emerald
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
              },
              {
                  label: 'QRIS Statis',
                  data: mapData('qris_statis_chart'),
                  fill: true,
                  borderColor: '#8b5cf6', // Violet
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  tension: 0.4
              }
          ]
      };
  };

  return (
    <div className="space-y-6 pb-20">
        {/* Header Dashboard */}
        <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-2">
                <Icon name="dashboard" className="w-5 h-5 text-admin-text" />
                <h1 className="text-lg font-bold text-admin-text tracking-wider uppercase">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-admin-base text-admin-text text-xs font-medium rounded-md border border-admin-border hover:bg-admin-card transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Icon name="refresh" className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{refreshing ? 'Memuat...' : 'Refresh'}</span>
                </button>
                <button 
                    onClick={toggleMaintenance}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-2 transition-colors ${isMaintenance ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-admin-base text-admin-text border-admin-border hover:bg-zinc-700'}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${isMaintenance ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></div>
                    <span className="hidden sm:inline">Maint</span>
                </button>
            </div>
        </div>

        {/* Router Status Banner */}
        {routerStatus.online === false && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                <p className="text-sm font-medium text-red-400">🔴 Router Offline — Periksa koneksi MikroTik segera!</p>
            </div>
        )}
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

        {/* RINGKASAN HARI INI */}
        <div className="bg-admin-card rounded-md shadow-sm border border-admin-border mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-admin-border flex justify-between items-center bg-admin-card">
                <h2 className="text-xs font-bold text-admin-text tracking-wider uppercase flex items-center gap-2">
                    <Icon name="master" className="w-4 h-4" /> RINGKASAN HARI INI
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-admin-border">
                {/* Card 1: Pemasukan Voucher */}
                <div className="p-4 flex items-center justify-between border-b sm:border-b-0">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">Pemasukan Voucher</p>
                        <p className="text-2xl font-bold text-[#60a5fa] mb-1">Rp{formatPrice(data.stats.voucher_revenue_today)}</p>
                        <p className="text-[10px] text-admin-muted">Keuangan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Icon name="sold" className="w-5 h-5 text-[#60a5fa]" />
                    </div>
                </div>
                {/* Card 2: Pemasukan Invoice */}
                <div className="p-4 flex items-center justify-between border-b sm:border-b-0 lg:border-b-0">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">Pemasukan Invoice</p>
                        <p className="text-2xl font-bold text-[#10b981] mb-1">Rp{formatPrice(data.stats.bill_revenue_today)}</p>
                        <p className="text-[10px] text-admin-muted">Keuangan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Icon name="check" className="w-5 h-5 text-[#10b981]" />
                    </div>
                </div>
                {/* Card 3: Pengeluaran */}
                <div className="p-4 flex items-center justify-between sm:border-t lg:border-t-0 border-admin-border">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">Pengeluaran</p>
                        <p className="text-2xl font-bold text-[#f59e0b] mb-1">Rp0</p>
                        <p className="text-[10px] text-admin-muted">Keuangan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Icon name="bill" className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                </div>
                
                {/* Card 4: Voucher Online */}
                <div className="p-4 flex items-center justify-between border-t border-admin-border">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">Voucher Online</p>
                        <p className="text-2xl font-bold text-[#10b981] mb-1">{data.stats.online_count}</p>
                        <p className="text-[10px] text-admin-muted">Device Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Icon name="online" className="w-5 h-5 text-[#10b981]" />
                    </div>
                </div>
                {/* Card 5: PPPoE-DHCP Online */}
                <div className="p-4 flex items-center justify-between border-t border-admin-border sm:border-l sm:border-admin-border">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">PPPoE-DHCP Online</p>
                        <p className="text-2xl font-bold text-[#8b5cf6] mb-1">0</p>
                        <p className="text-[10px] text-admin-muted">User Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Icon name="users" className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                </div>
                {/* Card 6: Pelanggan Terisolir */}
                <div className="p-4 flex items-center justify-between border-t border-admin-border lg:border-l lg:border-admin-border sm:col-span-2 lg:col-span-1">
                    <div>
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-1">Pelanggan Terisolir</p>
                        <p className="text-2xl font-bold text-[#ef4444] mb-1">{data.stats.isolated_customers}</p>
                        <p className="text-[10px] text-admin-muted">PPPoE-DHCP Expired</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <Icon name="close" className="w-5 h-5 text-[#ef4444]" />
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-admin-card rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-admin-text tracking-tight">Trend Pendapatan {time.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <p className="text-xs text-slate-400 mt-1">Statistik pendapatan harian bulan ini</p>
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
            <div className="bg-admin-card rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-admin-text tracking-tight">Jam Ramai Pengunjung (Hari Ini)</h3>
                        <p className="text-xs text-slate-400 mt-1">Statistik kunjungan unik per jam (Reset setiap hari)</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                        <Icon name="clock" className="w-4 h-4" />
                    </div>
                </div>
                <div className="h-64 w-full">
                    <Line 
                        data={{
                            labels: peakHours.map(p => p.hour),
                            datasets: [{
                                label: 'Visitor Hits',
                                data: peakHours.map(p => p.count),
                                fill: true,
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                                        label: (ctx) => `${ctx.parsed.y} Kunjungan`
                                    }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Kiri: Log Aplikasi (Transactions) */}
            <div className="lg:col-span-2 bg-admin-card rounded-md shadow-sm border border-admin-border overflow-hidden flex flex-col h-[400px]">
                <div className="px-4 py-3 border-b border-admin-border flex justify-between items-center bg-admin-card">
                    <h2 className="text-xs font-bold text-admin-text tracking-wider uppercase flex items-center gap-2">
                        <Icon name="master" className="w-4 h-4" /> LOG APLIKASI
                    </h2>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="text-[10px] text-admin-muted hover:text-admin-text font-semibold uppercase tracking-wider"
                    >
                        Lihat Semua
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-admin-card p-4 space-y-3">
                    {data.recent_transactions?.length > 0 ? data.recent_transactions.map((tx) => {
                        const isBill = tx.external_id?.startsWith('BILL-') || tx.external_id?.startsWith('MANUAL-');
                        return (
                            <div key={tx.id} className="flex gap-4">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-admin-base border border-admin-border flex items-center justify-center">
                                        <Icon name={isBill ? "bill" : "voucher"} className="w-4 h-4 text-admin-muted" />
                                    </div>
                                </div>
                                <div className="flex-1 border-b border-admin-border pb-3">
                                    <p className="text-xs text-admin-muted">
                                        {new Date(tx.paid_at || tx.created_at).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-sm font-medium text-admin-text mt-0.5">
                                        {isBill 
                                            ? `Pembayaran Tagihan ${(tx.customer?.name || tx.customer_name || 'Pelanggan')} Berhasil` 
                                            : `Pembelian Voucher ${tx.voucher?.code || ''} Berhasil`}
                                    </p>
                                    <p className="text-xs text-admin-muted font-mono mt-0.5">
                                        Ref: {tx.reference_id || tx.external_id} | Rp{formatPrice(tx.amount)}
                                    </p>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-admin-muted text-xs mt-10">Belum ada log transaksi.</div>
                    )}
                </div>
            </div>

            {/* Kanan: Informasi Lisensi */}
            <div className="bg-admin-card rounded-md shadow-sm border border-admin-border overflow-hidden h-[400px]">
                <div className="px-4 py-3 border-b border-admin-border bg-admin-card">
                    <h2 className="text-xs font-bold text-admin-text tracking-wider uppercase flex items-center gap-2">
                        <Icon name="master" className="w-4 h-4" /> Informasi Lisensi
                    </h2>
                </div>
                <div className="p-5 space-y-6">
                    {/* Sesi Online */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-semibold text-admin-text uppercase tracking-wider">Total Sesi Online</p>
                            <p className="text-[10px] text-admin-muted font-bold">{data.stats.online_count}/600 <span className="text-emerald-500 ml-1">{Math.round((data.stats.online_count/600)*100)}%</span></p>
                        </div>
                        <div className="w-full bg-admin-base rounded-full h-1.5 border border-admin-border overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min((data.stats.online_count/600)*100, 100)}%` }}></div>
                        </div>
                    </div>
                    {/* Voucher Terjual (Assuming out of 1000 limit for demo) */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-semibold text-admin-text uppercase tracking-wider">Voucher Terjual Hari Ini</p>
                            <p className="text-[10px] text-admin-muted font-bold">{data.stats.voucher_sold_today}/1000 <span className="text-blue-500 ml-1">{Math.round((data.stats.voucher_sold_today/1000)*100)}%</span></p>
                        </div>
                        <div className="w-full bg-admin-base rounded-full h-1.5 border border-admin-border overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((data.stats.voucher_sold_today/1000)*100, 100)}%` }}></div>
                        </div>
                    </div>
                    {/* Router Status */}
                    <div className="mt-8 p-4 rounded border border-admin-border bg-admin-base text-center">
                        <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider mb-2">KONEKSI MIKROTIK</p>
                        {routerConnected ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Icon name="network" className="w-8 h-8 text-emerald-500" />
                                <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">TERHUBUNG</p>
                                <p className="text-[10px] text-admin-muted font-mono">{routerStatus.latency_ms}ms latency</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Icon name="network" className="w-8 h-8 text-rose-500 opacity-50" />
                                <p className="text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">TERPUTUS</p>
                                <p className="text-[10px] text-admin-muted font-mono">Periksa koneksi RouterOS</p>
                            </div>
                        )}
                    </div>
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
                        {historyData?.meta && (
                            <Pagination 
                                meta={historyData.meta} 
                                onPageChange={(page) => fetchHistory(page, historyFilter)} 
                            />
                        )}
                    </div>
                </div>
            </div>
        )}

        {chartModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-admin-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-admin-border">
                    <div className="bg-admin-card border-b border-admin-border px-8 py-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-admin-text flex items-center gap-2">
                                    <Icon name="trend" className="w-5 h-5 text-admin-accent" /> 
                                    Statistik Pendapatan
                                </h3>
                                <p className="text-admin-muted text-xs mt-1">Tren pendapatan 30 hari terakhir berdasarkan jenis</p>
                            </div>
                            <button onClick={() => setChartModalOpen(false)} className="p-2 text-admin-muted hover:bg-admin-base hover:text-admin-text rounded-xl transition-colors">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 bg-admin-base overflow-y-auto">
                        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border p-6 h-[400px]">
                            <Line 
                                data={getUnifiedChartData()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: { 
                                            display: true, 
                                            position: 'top',
                                            labels: {
                                                usePointStyle: true,
                                                boxWidth: 8,
                                                padding: 20,
                                                font: { size: 11 }
                                            }
                                        },
                                        tooltip: {
                                            ...chartOptions.plugins.tooltip,
                                            callbacks: {
                                                label: (ctx) => `${ctx.dataset.label}: Rp ${formatPrice(ctx.parsed.y)}`
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
