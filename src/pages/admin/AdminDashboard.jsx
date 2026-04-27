import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    revenue: <path d="M12 1v22m5-18H8.5a4.5 4.5 0 000 9h7a4.5 4.5 0 010 9H7" />,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" />,
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
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [time, setTime] = useState(new Date())
  
  // History Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [historyData, setHistoryData] = useState({ data: [], meta: {} })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all')

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
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

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )

  const chartConfig = {
    labels: data?.chart.map(c => new Date(c.date).getDate()) || [],
    datasets: [{
      label: 'Revenue',
      data: data?.chart.map(c => c.total) || [],
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
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
          label: (ctx) => `Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
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
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Dashboard Overview</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            Monitoring finansial dan operasional ND-Hotspot real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Icon name="clock" className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
              {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {time.toLocaleTimeString('id-ID')}
            </span>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Icon name="refresh" className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Icon name="revenue" className="w-7 h-7" />
            </div>
            <div className="flex gap-2">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Bulan Ini</span>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Hari Ini</span>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pendapatan (Bulan Ini)</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {data.stats.monthly_revenue.toLocaleString('id-ID')}</h2>
            </div>
            <div className="pt-8 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Omset Hari Ini</p>
              <h2 className="text-2xl font-black text-emerald-600 tracking-tighter italic">Rp {data.stats.today_revenue.toLocaleString('id-ID')}</h2>
              <div className="mt-4 flex gap-2">
                <span className="text-[8px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 rounded">Bill: {data.stats.bill_revenue_today > 0 ? Math.round((data.stats.bill_revenue_today/data.stats.today_revenue)*100) : 0}%</span>
                <span className="text-[8px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded">Voucher: {data.stats.voucher_revenue_today > 0 ? Math.round((data.stats.voucher_revenue_today/data.stats.today_revenue)*100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="users" className="w-7 h-7" />
            </div>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">User Base</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black text-slate-900">{data.stats.total_customers}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Due</p>
              <p className="text-2xl font-black text-amber-500">{data.stats.due_customers}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Isolir</p>
              <p className="text-2xl font-black text-rose-500">{data.stats.isolated_customers}</p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Online</p>
              <p className="text-xl font-black text-emerald-600">{data.stats.online_count} <span className="text-[8px]">Active</span></p>
            </div>
            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(data.stats.online_count / Math.max(1, data.stats.total_customers)) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Sales Activity Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Icon name="voucher" className="w-7 h-7" />
            </div>
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Penjualan</span>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Terjual</p>
                <span className="text-[8px] font-black text-emerald-600">Hari Ini</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">{data.stats.voucher_sold_today} <span className="text-sm">VCR</span></h2>
            </div>
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Revenue</p>
              <p className="text-lg font-black text-indigo-600">Rp {data.stats.voucher_revenue_today.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Trend Pendapatan Harian</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Akumulasi settlement Bill & Voucher bulan ini</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Processing</span>
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <Line data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Active Vouchers & Online Users */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <Icon name="check" className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active & Online</h2>
            </div>
            <div className="flex gap-2">
              <span className="text-[8px] font-black px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">{data.stats.online_count} Online</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Voucher</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.combined_users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4">
                      <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{user.code}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">{user.plan_name}</p>
                    </td>
                    <td className="px-8 py-4">
                      {user.is_online ? (
                        <span className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-[10px] font-mono font-bold text-slate-500 italic">
                        {user.is_online ? user.uptime : 'Last seen: ' + new Date(user.used_at || 0).toLocaleTimeString('id-ID')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <Icon name="bill" className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Payments</h2>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Lihat Semua
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {data.recent_transactions.map((tx) => (
              <div key={tx.id} className="px-10 py-5 hover:bg-slate-50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tx.external_id.startsWith('BILL-') ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    <Icon name={tx.external_id.startsWith('BILL-') ? 'bill' : 'voucher'} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{tx.external_id}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-widest">SUCCESS</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{new Date(tx.created_at).toLocaleTimeString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-600 tracking-tighter italic">+Rp {tx.amount.toLocaleString('id-ID')}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-slate-950 px-12 py-8 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Full Transaction History</h2>
                <div className="flex gap-4 mt-4">
                  {['all', 'bill', 'voucher'].map((f) => (
                    <button 
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-colors"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-12 relative">
              {historyLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Time</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {historyData.data.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-6 font-mono text-xs font-black text-slate-900">{tx.external_id}</td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${tx.external_id.startsWith('BILL-') ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {tx.external_id.startsWith('BILL-') ? 'Bill Payment' : 'Voucher Sale'}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-slate-900 tracking-tight">Rp {tx.amount.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">{tx.payment_method || 'QRIS'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination meta={historyData.meta} onPageChange={(p) => fetchHistory(p)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
