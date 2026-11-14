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

export default function DeepAnalytics() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshingAi, setRefreshingAi] = useState(false)
  const [error, setError] = useState('')

  const formatRupiah = (val) => {
    if (!val && val !== 0) return '0'
    return Number(val).toLocaleString('id-ID')
  }

  const fetchAnalytics = async (selectedDays = days) => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/deep-analytics?days=${selectedDays}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.data.success) {
        setData(res.data.data)
      } else {
        setError(res.data.message || 'Gagal memuat analitik bisnis')
      }
    } catch (err) {
      console.error('Fetch deep analytics error:', err)
      setError(err.response?.data?.message || 'Gagal menghubungi server untuk analitik bisnis')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAi = async () => {
    setRefreshingAi(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/deep-analytics/refresh-ai?days=${days}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.data.success && res.data.ai_insights) {
        setData(prev => ({
          ...prev,
          ai_insights: res.data.ai_insights
        }))
      }
    } catch (err) {
      console.error('Refresh AI error:', err)
      alert('Gagal merefresh AI insights: ' + (err.response?.data?.message || err.message))
    } finally {
      setRefreshingAi(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(days)
  }, [days])

  // Hourly Peak Chart Config
  const peakHourlyChartData = () => {
    if (!data?.peak_hours?.hourly) return null

    const labels = data.peak_hours.hourly.map(h => h.label)
    const txCounts = data.peak_hours.hourly.map(h => h.transactions)
    const revenues = data.peak_hours.hourly.map(h => h.revenue)

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Jumlah Transaksi',
          data: txCounts,
          backgroundColor: data.peak_hours.hourly.map(h => 
            data.peak_hours.top_hours.includes(h.hour) ? 'rgba(245, 158, 11, 0.85)' : 'rgba(56, 189, 248, 0.45)'
          ),
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Omset per Jam (Rp)',
          data: revenues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'y1',
        }
      ]
    }
  }

  const peakHourlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            if (context.dataset.yAxisID === 'y1') {
              return ` Omset: Rp ${Number(context.raw).toLocaleString('id-ID')}`
            }
            return ` Transaksi: ${context.raw} user`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#10b981',
          font: { size: 10 },
          callback: (value) => 'Rp ' + (value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : (value / 1000).toFixed(0) + 'k')
        }
      }
    }
  }

  // Plan Comparison Chart
  const planComparisonChartData = () => {
    if (!data?.plans_matrix?.plans) return null

    const plans = data.plans_matrix.plans.slice(0, 7)
    return {
      labels: plans.map(p => p.name),
      datasets: [
        {
          label: 'Pangsa Volume Jual (%)',
          data: plans.map(p => p.volume_share_pct),
          backgroundColor: 'rgba(56, 189, 248, 0.75)',
          borderRadius: 6,
        },
        {
          label: 'Kontribusi Omset (%)',
          data: plans.map(p => p.revenue_share_pct),
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderRadius: 6,
        }
      ]
    }
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-admin-muted">Menganalisis performa bisnis & menjalankan AI advisor...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
        <p className="text-red-400 font-bold mb-2">Terjadi Kesalahan</p>
        <p className="text-xs text-admin-muted mb-4">{error}</p>
        <button 
          onClick={() => fetchAnalytics(days)}
          className="px-4 py-2 bg-admin-base border border-admin-border text-admin-text rounded-xl text-xs font-bold hover:bg-admin-card"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const { summary, peak_hours, plans_matrix, retention, forecasting, channels, ai_insights } = data || {}

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>EXECUTIVE BUSINESS INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-black text-admin-text tracking-tight flex items-center gap-2.5">
            <span>Deep Analytics Bisnis Hotspot</span>
          </h1>
          <p className="text-xs text-admin-muted mt-0.5">
            Insight strategis berbasis data riil transaksi, jam sibuk, churn pelanggan, dan analisis prediktif AI.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Days Filter Pills */}
          <div className="flex items-center bg-admin-card border border-admin-border rounded-xl p-1 text-xs">
            {[7, 14, 30, 60, 90].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  days === d 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-admin-muted hover:text-admin-text'
                }`}
              >
                {d} Hari
              </button>
            ))}
          </div>

          {/* Refresh AI Button */}
          <button
            type="button"
            onClick={handleRefreshAi}
            disabled={refreshingAi}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <i className={`fas fa-magic ${refreshingAi ? 'animate-spin' : ''}`} />
            <span>{refreshingAi ? 'Menganalisis...' : 'Analisis Ulang AI'}</span>
          </button>
        </div>
      </div>

      {/* AI EXECUTIVE ADVISOR CARD (HERO BANNER) */}
      {ai_insights && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/35 p-6 shadow-2xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow-inner">
                  <i className="fas fa-brain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      AI Executive Advisor
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Live Advisor
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Engine: <strong className="text-slate-200">{ai_insights.provider}</strong>
                  </p>
                </div>
              </div>

              {/* Health Score Pill */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Health Score</div>
                  <div className="text-xs font-bold text-emerald-400">{ai_insights.health_status}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-lg">
                  {ai_insights.health_score}
                </div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="fas fa-lightbulb" /> Executive Summary
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {ai_insights.executive_summary}
              </p>
            </div>

            {/* Actionable Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ai_insights.action_items?.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.priority === 'Kritis' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : (item.priority === 'Tinggi' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300')
                      }`}>
                        Prioritas {item.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {item.action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Potensi Dampak:</span>
                    <span className="text-emerald-400 font-bold">{item.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4 HIGH IMPACT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omset Periode Ini */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Total Omset ({days} Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i className="fas fa-coins" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight">
            Rp {formatRupiah(summary?.gross_revenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className={`font-bold ${summary?.growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className={`fas fa-arrow-${summary?.growth_pct >= 0 ? 'up' : 'down'} text-[10px]`} /> {Math.abs(summary?.growth_pct || 0)}%
            </span>
            <span className="text-admin-muted">vs {days} hari sebelumnya</span>
          </div>
        </div>

        {/* Card 2: Churn Rate */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Tingkat Churn Pelanggan</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm">
              <i className="fas fa-user-slash" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight flex items-baseline gap-2">
            <span>{retention?.churn_rate_pct || 0}%</span>
            <span className="text-xs font-semibold text-admin-muted">
              ({retention?.churn_count || 0} user tidak balik)
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <span className="text-emerald-400 font-bold">{retention?.retention_rate_pct || 0}%</span>
            <span>retensi pelanggan terjaga</span>
          </div>
        </div>

        {/* Card 3: Jam Puncak */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Jam Puncak Trafik</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
              <i className="fas fa-fire" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {peak_hours?.peak_range_label || '19:00 - 22:00'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <i className="fas fa-bolt text-amber-400 text-[10px]" />
            <span>Fasilitasi bandwidth QoS ekstra</span>
          </div>
        </div>

        {/* Card 4: Proyeksi Bulan Depan */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Estimasi Omset Bulan Depan</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
              <i className="fas fa-chart-line" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight">
            Rp {formatRupiah(forecasting?.forecast_next_month?.moderate)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <span className="text-cyan-400 font-bold">Target Optimis:</span>
            <span>Rp {formatRupiah(forecasting?.forecast_next_month?.optimistic)}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: JAM SIBUK PER LOKASI & 24-HOUR TRAFFIC */}
      <div className="bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
              <i className="fas fa-clock text-amber-400" />
              <span>Analisis Jam Sibuk & Trafik per Jam</span>
            </h3>
            <p className="text-xs text-admin-muted mt-0.5">
              Pola distribusi aktivitas pembelian voucher dan beban sesi hotspot dalam rentang 24 jam.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              🔥 Puncak: {peak_hours?.peak_range_label}
            </span>
          </div>
        </div>

        {/* 24-Hour Bar/Line Chart */}
        <div className="h-72 w-full mb-6">
          {peakHourlyChartData() && <Bar data={peakHourlyChartData()} options={peakHourlyOptions} />}
        </div>

        {/* Location / NAS Breakdown Cards */}
        <div className="border-t border-admin-border pt-4">
          <h4 className="text-xs font-bold text-admin-muted uppercase tracking-wider mb-3">
            Distribusi Trafik per Lokasi / Router
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {peak_hours?.locations?.map((loc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-admin-text">{loc.name}</div>
                  <div className="text-[10px] text-admin-muted">{loc.ip}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-400">{loc.sessions} Sesi</div>
                  <div className="text-[10px] text-slate-400">{loc.traffic_gb} GB Trafik</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: MATRIX PAKET PALING PROFITABLE VS PALING LAKU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Comparison */}
        <div className="lg:col-span-5 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2 mb-1">
              <i className="fas fa-balance-scale text-cyan-400" />
              <span>Volume vs Profitabilitas</span>
            </h3>
            <p className="text-xs text-admin-muted mb-4">
              Perbandingan kontribusi omset (%) vs volume kuantitas voucher terjual.
            </p>

            <div className="h-64 w-full">
              {planComparisonChartData() && (
                <Bar 
                  data={planComparisonChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } }
                    },
                    scales: {
                      x: { ticks: { color: '#94a3b8', font: { size: 9 } } },
                      y: { ticks: { color: '#94a3b8', font: { size: 9 }, callback: (v) => v + '%' } }
                    }
                  }} 
                />
              )}
            </div>
          </div>

          {/* Quick Winner Callout */}
          <div className="mt-4 p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Raja Profit:</span>
              <span className="text-emerald-400 font-extrabold">{plans_matrix?.most_profitable?.name || '-'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Paling Laku:</span>
              <span className="text-amber-400 font-extrabold">{plans_matrix?.most_popular?.name || '-'}</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Table Matrix */}
        <div className="lg:col-span-7 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-admin-text">
              Matrix Kinerja Paket Voucher
            </h3>
            <span className="text-xs text-admin-muted font-bold">
              Total {plans_matrix?.total_plans || 0} Paket Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Nama Paket</th>
                  <th className="pb-3 font-bold">Harga</th>
                  <th className="pb-3 font-bold text-center">Terjual</th>
                  <th className="pb-3 font-bold text-right">Total Omset</th>
                  <th className="pb-3 font-bold text-right">Klasifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {plans_matrix?.plans?.map((plan) => (
                  <tr key={plan.id} className="hover:bg-admin-base/50 transition-colors">
                    <td className="py-3 font-bold text-admin-text">
                      <div className="flex items-center gap-1.5">
                        {plan.is_gaming && <span className="text-[10px] text-emerald-400">⚡</span>}
                        <span>{plan.name}</span>
                      </div>
                      <span className="text-[10px] text-admin-muted">{plan.duration}</span>
                    </td>
                    <td className="py-3 font-semibold text-admin-muted">
                      Rp {formatRupiah(plan.price)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-bold text-admin-text">{plan.volume_sold}</span>
                      <span className="text-[10px] text-admin-muted block">({plan.volume_share_pct}%)</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-extrabold text-emerald-400">Rp {formatRupiah(plan.total_revenue)}</span>
                      <span className="text-[10px] text-admin-muted block">({plan.revenue_share_pct}%)</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        plan.badge === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        (plan.badge === 'amber' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        (plan.badge === 'blue' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-slate-700/50 text-slate-300'))
                      }`}>
                        {plan.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3 & 4: CHURN RATE & FORECASTING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention & Churn Cohorts */}
        <div className="lg:col-span-6 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
                <i className="fas fa-users text-rose-400" />
                <span>Analisis Churn & Segmentasi Loyalitas</span>
              </h3>
              <p className="text-xs text-admin-muted mt-0.5">
                Berapa persen pelanggan yang aktif kembali vs berhenti beli.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-400">{retention?.churn_rate_pct}%</span>
              <span className="block text-[10px] text-admin-muted uppercase font-bold">Churn Rate</span>
            </div>
          </div>

          {/* Retention Progress Bar */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-400">Retensi: {retention?.retention_rate_pct}%</span>
              <span className="text-rose-400">Churn: {retention?.churn_rate_pct}%</span>
            </div>
            <div className="h-3 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${retention?.retention_rate_pct || 0}%` }}
              />
            </div>
          </div>

          {/* Cohort Segments */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">👑 VIP / Regular (4+ Transaksi)</span>
              <span className="text-lg font-black text-emerald-400">{retention?.segments?.vip_regulars || 0}</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Pelanggan harian setia</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">🔄 Repeat Buyers (2-3 Transaksi)</span>
              <span className="text-lg font-black text-cyan-400">{retention?.segments?.repeat_buyers || 0}</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Beli berulang kali</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">🌱 Pelanggan Baru / Sekali Beli</span>
              <span className="text-lg font-black text-admin-text">{retention?.segments?.one_time_buyers || 0}</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Perlu dikonversi repeat</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">⚠️ Berisiko Churn (Lapsed)</span>
              <span className="text-lg font-black text-rose-400">{retention?.segments?.at_risk_churn || 0}</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Target broadcast diskon</span>
            </div>
          </div>
        </div>

        {/* Revenue Forecasting & Next Month Projection */}
        <div className="lg:col-span-6 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
                  <i className="fas fa-chart-line text-emerald-400" />
                  <span>Proyeksi Omset Bulan Depan</span>
                </h3>
                <p className="text-xs text-admin-muted mt-0.5">
                  Estimasi pendapatan berdasarkan moving average run-rate harian.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {forecasting?.confidence_score}
              </span>
            </div>

            {/* Daily Run-rate info */}
            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-admin-muted text-[10px] block uppercase font-bold">Rata-rata Run-Rate Harian:</span>
                <span className="text-base font-black text-admin-text">Rp {formatRupiah(forecasting?.daily_run_rate)} / hari</span>
              </div>
              <div className="text-right">
                <span className="text-admin-muted text-[10px] block uppercase font-bold">Velocity Pertumbuhan:</span>
                <span className={`text-sm font-bold ${forecasting?.growth_velocity_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {forecasting?.growth_velocity_pct >= 0 ? '+' : ''}{forecasting?.growth_velocity_pct}%
                </span>
              </div>
            </div>

            {/* 3 Forecast Scenarios Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Konservatif</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-300 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.conservative)}
                </span>
                <span className="text-[9px] text-slate-500">Musim Sepi (85%)</span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-center">
                <span className="text-[9px] font-bold text-cyan-300 uppercase block">Moderat (Baseline)</span>
                <span className="text-sm sm:text-base font-extrabold text-cyan-400 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.moderate)}
                </span>
                <span className="text-[9px] text-cyan-500">Tren Normal</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                <span className="text-[9px] font-bold text-emerald-300 uppercase block">Optimis (Target)</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.optimistic)}
                </span>
                <span className="text-[9px] text-emerald-500">+18% Target</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-admin-muted p-3 rounded-xl bg-admin-base/40 border border-admin-border/60">
            <strong className="text-amber-400 font-bold">💡 Growth Lever:</strong> {forecasting?.key_growth_lever}
          </div>
        </div>
      </div>

      {/* SECTION 5: SALES CHANNEL & RESELLER PERFORMANCE */}
      <div className="bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
              <i className="fas fa-store text-amber-400" />
              <span>Performa Channel Penjualan & Reseller</span>
            </h3>
            <p className="text-xs text-admin-muted mt-0.5">
              Breakdown efektivitas penjualan via QRIS Mandiri, Tukar Poin, dan Mitra/Reseller Offline.
            </p>
          </div>
          <span className="text-xs font-bold text-admin-muted">
            Total {channels?.total_transactions || 0} Transaksi Berhasil
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels?.channels?.map((ch) => (
            <div key={ch.key} className="p-4 rounded-xl bg-admin-base border border-admin-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-admin-muted mb-2">
                  <span>{ch.name}</span>
                  <span className="text-amber-400 font-extrabold">{ch.revenue_share_pct}%</span>
                </div>
                <div className="text-xl font-black text-admin-text">
                  Rp {formatRupiah(ch.revenue)}
                </div>
                <div className="text-xs text-admin-muted mt-1">
                  {ch.count} Transaksi
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-admin-border/60 flex items-center justify-between text-[11px] text-admin-muted">
                <span>Rata-rata Order (AOV):</span>
                <span className="text-emerald-400 font-bold">Rp {formatRupiah(ch.aov)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
