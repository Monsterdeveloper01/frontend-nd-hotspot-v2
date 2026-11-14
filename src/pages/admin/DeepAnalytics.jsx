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
        setError(res.data.message || 'Gagal memuat analitik')
      }
    } catch (err) {
      console.error('Fetch deep analytics error:', err)
      setError(err.response?.data?.message || 'Gagal menghubungi server')
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
      alert('Gagal merefresh saran AI: ' + (err.response?.data?.message || err.message))
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
          label: 'Jumlah Orang Beli Voucher',
          data: txCounts,
          backgroundColor: data.peak_hours.hourly.map(h => 
            data.peak_hours.top_hours.includes(h.hour) ? 'rgba(245, 158, 11, 0.85)' : 'rgba(56, 189, 248, 0.45)'
          ),
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Uang Masuk per Jam (Rp)',
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
              return ` Uang Masuk: Rp ${Number(context.raw).toLocaleString('id-ID')}`
            }
            return ` Pembeli: ${context.raw} orang`
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
          callback: (value) => 'Rp ' + (value >= 1000000 ? (value / 1000000).toFixed(1) + ' jt' : (value / 1000).toFixed(0) + ' rb')
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
          label: 'Seberapa Sering Dibeli (%)',
          data: plans.map(p => p.volume_share_pct),
          backgroundColor: 'rgba(56, 189, 248, 0.75)',
          borderRadius: 6,
        },
        {
          label: 'Sumbangan ke Kantong Kamu (%)',
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
        <p className="text-sm font-semibold text-admin-muted">Asisten AI sedang membaca data hotspot kamu...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
        <p className="text-red-400 font-bold mb-2">Terjadi Kendala</p>
        <p className="text-xs text-admin-muted mb-4">{error}</p>
        <button 
          onClick={() => fetchAnalytics(days)}
          className="px-4 py-2 bg-admin-base border border-admin-border text-admin-text rounded-xl text-xs font-bold hover:bg-admin-card cursor-pointer"
        >
          Coba Muat Ulang
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
            <span>KONSULTAN BISNIS PRIBADI KAMU</span>
          </div>
          <h1 className="text-2xl font-black text-admin-text tracking-tight flex items-center gap-2.5">
            <span>Analisis Pintar Bisnis WiFi</span>
          </h1>
          <p className="text-xs text-admin-muted mt-0.5">
            Bukan angka yang bikin pusing — Simak saran santai, jam paling ramai warkop, paket paling bikin untung, dan tebakan duit masuk bulan depan.
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
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  days === d 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-admin-muted hover:text-admin-text'
                }`}
              >
                {d} Hari Terakhir
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
            <span>{refreshingAi ? 'Lagi Menganalisis...' : 'Minta Saran AI Terbaru'}</span>
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
                  <i className="fas fa-robot" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      Saran Pintar Asisten Bisnis
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Ngobrol Santai
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Didukung oleh: <strong className="text-slate-200">{ai_insights.provider}</strong>
                  </p>
                </div>
              </div>

              {/* Health Score Pill */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kondisi Bisnis Kamu</div>
                  <div className="text-xs font-bold text-emerald-400">{ai_insights.health_status}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-lg">
                  {ai_insights.health_score}
                </div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <i className="fas fa-comment-dots" /> Kabar Usaha Kamu Bulan Ini:
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {ai_insights.executive_summary}
              </p>
            </div>

            {/* Actionable Strategy Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="fas fa-tasks text-emerald-400" /> Apa yang Harus Kamu Lakukan Hari Ini? (Tips Praktis):
              </h3>
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
                          item.priority.includes('Penting') 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.priority}
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
                      <span className="text-slate-400 font-medium">Kira-kira Dampaknya:</span>
                      <span className="text-emerald-400 font-bold">{item.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 HUMAN-FRIENDLY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Duit Masuk */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Uang Masuk ({days} Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i className="fas fa-wallet" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight">
            Rp {formatRupiah(summary?.gross_revenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className={`font-bold ${summary?.growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className={`fas fa-arrow-${summary?.growth_pct >= 0 ? 'up' : 'down'} text-[10px]`} /> {Math.abs(summary?.growth_pct || 0)}%
            </span>
            <span className="text-admin-muted">{summary?.growth_pct >= 0 ? 'lebih banyak dari sebelumnya' : 'turun dari sebelumnya'}</span>
          </div>
        </div>

        {/* Card 2: Pelanggan yang Gak Balik Lagi */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Pelanggan yang Hilang</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm">
              <i className="fas fa-user-slash" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight flex items-baseline gap-2">
            <span>{retention?.churn_count || 0} orang</span>
            <span className="text-xs font-semibold text-rose-400">
              ({retention?.churn_rate_pct || 0}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <span className="text-emerald-400 font-bold">{retention?.retention_rate_pct || 0}% orang</span>
            <span>tetap setia beli voucher</span>
          </div>
        </div>

        {/* Card 3: Jam Paling Ramai */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Jam Paling Ramai</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
              <i className="fas fa-fire" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {peak_hours?.peak_range_label || '19:00 - 22:00'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <i className="fas fa-users text-amber-400 text-[10px]" />
            <span>Waktu warkop/wifi kamu paling padat</span>
          </div>
        </div>

        {/* Card 4: Tebakan Duit Masuk Bulan Depan */}
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-bold uppercase mb-2">
            <span>Tebakan Omset Bulan Depan</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
              <i className="fas fa-piggy-bank" />
            </div>
          </div>
          <div className="text-2xl font-black text-admin-text tracking-tight">
            Rp {formatRupiah(forecasting?.forecast_next_month?.moderate)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-admin-muted">
            <span className="text-emerald-400 font-bold">Kalo lagi rame:</span>
            <span>Rp {formatRupiah(forecasting?.forecast_next_month?.optimistic)}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: JAM BERAPA WIFI PALING RAMAI */}
      <div className="bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
              <i className="fas fa-clock text-amber-400" />
              <span>Jam Berapa Pelanggan Paling Ramai Konek?</span>
            </h3>
            <p className="text-xs text-admin-muted mt-0.5">
              Grafik ini menunjukkan jam-jam sibuk di tempat kamu. Warna kuning adalah jam puncak saat paling banyak orang beli & internetan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              🔥 Paling Penuh: {peak_hours?.peak_range_label}
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
            Di Mana Saja Pelanggan Kamu Paling Banyak Internetan?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {peak_hours?.locations?.map((loc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-admin-text">{loc.name}</div>
                  <div className="text-[10px] text-admin-muted">{loc.ip}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-400">{loc.sessions} Orang Konek</div>
                  <div className="text-[10px] text-slate-400">{loc.traffic_gb} GB Data Terpakai</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: PAKET MANA YANG PALING BIKIN UNTUNG VS PALING LAKU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Comparison */}
        <div className="lg:col-span-5 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2 mb-1">
              <i className="fas fa-balance-scale text-cyan-400" />
              <span>Sering Dibeli vs Bikin Dompet Tebal</span>
            </h3>
            <p className="text-xs text-admin-muted mb-4">
              Warna biru menunjukkan paket mana yang paling sering dibeli, sedangkan warna kuning menunjukkan paket mana yang paling banyak nyumbang uang.
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
              <span className="text-slate-400 block text-[10px] uppercase font-bold">👑 Paling Banyak Nyumbang Uang:</span>
              <span className="text-emerald-400 font-extrabold">{plans_matrix?.most_profitable?.name || '-'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">🔥 Paling Sering Dibeli:</span>
              <span className="text-amber-400 font-extrabold">{plans_matrix?.most_popular?.name || '-'}</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Table Matrix */}
        <div className="lg:col-span-7 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-admin-text">
                Rapor Tiap Paket Voucher
              </h3>
              <p className="text-xs text-admin-muted">
                Lihat paket mana yang jadi juara dan paket mana yang sepi peminat.
              </p>
            </div>
            <span className="text-xs text-admin-muted font-bold">
              {plans_matrix?.total_plans || 0} Paket
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Nama Paket</th>
                  <th className="pb-3 font-bold">Harga</th>
                  <th className="pb-3 font-bold text-center">Berapa Kali Dibeli</th>
                  <th className="pb-3 font-bold text-right">Uang Masuk</th>
                  <th className="pb-3 font-bold text-right">Status</th>
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
                      <span className="font-bold text-admin-text">{plan.volume_sold} kali</span>
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

      {/* SECTION 3 & 4: PELANGGAN BALIK LAGI GAK & TEBAKAN DUIT BULAN DEPAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention & Churn Cohorts */}
        <div className="lg:col-span-6 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
                <i className="fas fa-heart text-rose-400" />
                <span>Pelanggan Kamu Sering Balik Beli Gak?</span>
              </h3>
              <p className="text-xs text-admin-muted mt-0.5">
                Melihat berapa banyak orang yang setia nongkrong vs yang cuma coba sekali lalu pergi.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-400">{retention?.churn_rate_pct}%</span>
              <span className="block text-[10px] text-admin-muted uppercase font-bold">Gak Balik Lagi</span>
            </div>
          </div>

          {/* Retention Progress Bar */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-400">🟢 Tetap Setia Beli: {retention?.retention_rate_pct}%</span>
              <span className="text-rose-400">🔴 Hilang / Gak Balik: {retention?.churn_rate_pct}%</span>
            </div>
            <div className="h-3 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${retention?.retention_rate_pct || 0}%` }}
              />
            </div>
          </div>

          {/* Cohort Segments in plain language */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">👑 Pelanggan Setia Banget (VIP)</span>
              <span className="text-lg font-black text-emerald-400">{retention?.segments?.vip_regulars || 0} orang</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Sering banget beli (4x lebih)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">🔄 Pelanggan Rutin</span>
              <span className="text-lg font-black text-cyan-400">{retention?.segments?.repeat_buyers || 0} orang</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Beli 2-3 kali sebulan</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">🌱 Pelanggan Baru / Nyoba-nyoba</span>
              <span className="text-lg font-black text-admin-text">{retention?.segments?.one_time_buyers || 0} orang</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Baru 1 kali beli voucher</span>
            </div>

            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border">
              <span className="text-[10px] text-admin-muted font-bold uppercase block">🏃‍♂️ Pelanggan Kabur (Gak Balik)</span>
              <span className="text-lg font-black text-rose-400">{retention?.segments?.at_risk_churn || 0} orang</span>
              <span className="text-[10px] text-admin-muted block mt-0.5">Sudah 2 minggu gak kelihatan</span>
            </div>
          </div>
        </div>

        {/* Revenue Forecasting & Next Month Projection */}
        <div className="lg:col-span-6 bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
                  <i className="fas fa-piggy-bank text-emerald-400" />
                  <span>Kira-kira Berapa Duit yang Bakal Masuk Bulan Depan?</span>
                </h3>
                <p className="text-xs text-admin-muted mt-0.5">
                  Tebakan otomatis dari rata-rata uang harian yang kamu dapatkan saat ini.
                </p>
              </div>
            </div>

            {/* Daily Run-rate info */}
            <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-admin-muted text-[10px] block uppercase font-bold">Rata-rata Uang Harian:</span>
                <span className="text-base font-black text-admin-text">Rp {formatRupiah(forecasting?.daily_run_rate)} / hari</span>
              </div>
              <div className="text-right">
                <span className="text-admin-muted text-[10px] block uppercase font-bold">Tren Pertumbuhan:</span>
                <span className={`text-sm font-bold ${forecasting?.growth_velocity_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {forecasting?.growth_velocity_pct >= 0 ? 'Makin Naik (+)' : 'Lagi Turun (-)'}{Math.abs(forecasting?.growth_velocity_pct || 0)}%
                </span>
              </div>
            </div>

            {/* 3 Forecast Scenarios Cards in human terms */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">🌧️ Kalo Lagi Agak Sepi</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-300 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.conservative)}
                </span>
                <span className="text-[9px] text-slate-500">Pas tanggal tua</span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-center">
                <span className="text-[9px] font-bold text-cyan-300 uppercase block">☀️ Kalo Normal Biasa</span>
                <span className="text-sm sm:text-base font-extrabold text-cyan-400 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.moderate)}
                </span>
                <span className="text-[9px] text-cyan-500">Paling realistis</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                <span className="text-[9px] font-bold text-emerald-300 uppercase block">🚀 Kalo Rame Banget</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 block my-1">
                  Rp {formatRupiah(forecasting?.forecast_next_month?.optimistic)}
                </span>
                <span className="text-[9px] text-emerald-500">Kalo rajin promo</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-admin-muted p-3 rounded-xl bg-admin-base/40 border border-admin-border/60">
            <strong className="text-amber-400 font-bold">💡 Tips Biar Duit Makin Banyak:</strong> {forecasting?.key_growth_lever}
          </div>
        </div>
      </div>

      {/* SECTION 5: DARI MANA SAJA UANG MASUK (CHANNEL PENJUALAN) */}
      <div className="bg-admin-card border border-admin-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-admin-text flex items-center gap-2">
              <i className="fas fa-store text-amber-400" />
              <span>Dari Mana Saja Orang Beli Voucher?</span>
            </h3>
            <p className="text-xs text-admin-muted mt-0.5">
              Melihat apakah orang lebih suka bayar sendiri via QRIS di HP, tukar koin, atau beli fisik di warung/titipan.
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
                  <span className="text-amber-400 font-extrabold">{ch.revenue_share_pct}% dari total</span>
                </div>
                <div className="text-xl font-black text-admin-text">
                  Rp {formatRupiah(ch.revenue)}
                </div>
                <div className="text-xs text-admin-muted mt-1">
                  {ch.count} Kali Transaksi
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-admin-border/60 flex items-center justify-between text-[11px] text-admin-muted">
                <span>Rata-rata Sekali Beli:</span>
                <span className="text-emerald-400 font-bold">Rp {formatRupiah(ch.aov)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
