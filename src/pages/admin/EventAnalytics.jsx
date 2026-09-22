import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// ==========================================
// ICON HELPER
// ==========================================
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    trend: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    plus: <path d="M12 4v16m8-8H4" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    sync: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    chart: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    revenue: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    target: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    back: <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    close: <path d="M6 18L18 6M6 6l12 12" />,
    check: <path d="M5 13l4 4L19 7" />,
    info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    infinity: <path d="M18.178 8c5.096 0 5.096 8 0 8-2.678 0-4.678-2.667-6.178-5.333C10.5 8 8.5 8 5.822 8 0.726 8 .726 16 5.822 16c2.678 0 4.678-2.667 6.178-5.333 1.5 2.666 3.5 5.333 6.178 5.333" />,
    toggleOn: <path d="M8 7h8a5 5 0 015 5 5 5 0 01-5 5H8a5 5 0 01-5-5 5 5 0 015-5zm8 8a3 3 0 100-6 3 3 0 000 6z" />,
    toggleOff: <path d="M8 7h8a5 5 0 015 5 5 5 0 01-5 5H8a5 5 0 01-5-5 5 5 0 015-5zm0 8a3 3 0 100-6 3 3 0 000 6z" />,
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

// ==========================================
// FORMAT HELPERS
// ==========================================
const formatRupiah = (val) => {
  if (val === null || val === undefined) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatPeriod = (key) => {
  if (!key) return '-'
  const [y, m] = key.split('-')
  const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[parseInt(m)]} ${y}`
}

const statusConfig = {
  active: { label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', dot: 'bg-gray-400' },
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function EventAnalytics() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Detail state
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', target_amount: '', status: 'active' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Sync state
  const [syncing, setSyncing] = useState(null)
  const [syncResult, setSyncResult] = useState(null)

  // Analytics filters
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [participantPage, setParticipantPage] = useState(1)

  // Simulation state
  const [simTarget, setSimTarget] = useState('')
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/admin/events`, { headers })
      setEvents(res.data || [])
    } catch (err) {
      setError('Gagal memuat data events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const fetchAnalytics = useCallback(async (eventId, period = '', search = '', page = 1) => {
    setAnalyticsLoading(true)
    try {
      const params = { page }
      if (period) params.period = period
      if (search) params.search = search
      const res = await axios.get(`${API}/admin/events/${eventId}/analytics`, { headers, params })
      setAnalytics(res.data)
    } catch (err) {
      setAnalytics(null)
      setError('Gagal memuat analytics.')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  // ==========================================
  // EVENT CRUD
  // ==========================================
  const openCreateModal = () => {
    setEditEvent(null)
    setFormData({ name: '', description: '', target_amount: '', status: 'active' })
    setFormErrors({})
    setShowModal(true)
  }

  const openEditModal = (event) => {
    setEditEvent(event)
    setFormData({
      name: event.name,
      description: event.description || '',
      target_amount: event.target_amount || '',
      status: event.status,
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleSave = async () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Nama event wajib diisi'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        target_amount: formData.target_amount ? parseFloat(formData.target_amount) : 0,
        status: formData.status || 'active',
      }
      if (editEvent) {
        await axios.put(`${API}/admin/events/${editEvent.id}`, payload, { headers })
      } else {
        await axios.post(`${API}/admin/events`, payload, { headers })
      }
      setShowModal(false)
      fetchEvents()
      if (view === 'detail' && selectedEventId) {
        fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage)
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors)
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan event.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (event) => {
    const newStatus = event.status === 'active' ? 'inactive' : 'active'
    const confirmMsg = newStatus === 'inactive'
      ? `Nonaktifkan "${event.name}"? Tracking otomatis transaksi baru akan dihentikan (data historis tetap aman).`
      : `Aktifkan kembali "${event.name}"? Tracking transaksi baru akan berjalan otomatis.`

    if (!confirm(confirmMsg)) return

    try {
      await axios.put(`${API}/admin/events/${event.id}`, { status: newStatus }, { headers })
      fetchEvents()
      if (selectedEventId === event.id && view === 'detail') {
        fetchAnalytics(event.id, selectedPeriod, searchPhone, participantPage)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status event.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus event ini secara permanen?')) return
    try {
      await axios.delete(`${API}/admin/events/${id}`, { headers })
      fetchEvents()
      if (view === 'detail') goBackToList()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus event.')
    }
  }

  // ==========================================
  // SYNC
  // ==========================================
  const handleSync = async (eventId, allHistory = false) => {
    setSyncing(eventId)
    setSyncResult(null)
    try {
      const res = await axios.post(`${API}/admin/events/${eventId}/sync`, { all_history: allHistory }, { headers })
      setSyncResult({ eventId, ...res.data })
      fetchEvents()
      if (selectedEventId === eventId && view === 'detail') {
        fetchAnalytics(eventId, selectedPeriod, searchPhone, participantPage)
      }
    } catch (err) {
      setSyncResult({
        eventId,
        success: false,
        message: err.response?.data?.message || 'Sync gagal.',
      })
    } finally {
      setSyncing(null)
    }
  }

  // ==========================================
  // SIMULATE
  // ==========================================
  const handleSimulate = async (target) => {
    if (!selectedEventId || !target) return
    setSimLoading(true)
    setSimTarget(target)
    try {
      const params = { target }
      if (selectedPeriod) params.period = selectedPeriod
      const res = await axios.get(`${API}/admin/events/${selectedEventId}/simulate`, {
        headers,
        params,
      })
      setSimResult(res.data)
    } catch (err) {
      setSimResult(null)
    } finally {
      setSimLoading(false)
    }
  }

  // ==========================================
  // NAVIGATE TO DETAIL
  // ==========================================
  const openDetail = (eventId) => {
    setSelectedEventId(eventId)
    setView('detail')
    setSelectedPeriod('')
    setSearchPhone('')
    setParticipantPage(1)
    setSimResult(null)
    setSimTarget('')
    fetchAnalytics(eventId)
  }

  const goBackToList = () => {
    setView('list')
    setSelectedEventId(null)
    setAnalytics(null)
  }

  // Refetch when filters change
  useEffect(() => {
    if (view === 'detail' && selectedEventId) {
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage)
    }
  }, [selectedPeriod, searchPhone, participantPage])

  // ==========================================
  // RENDER: EVENTS LIST
  // ==========================================
  const renderEventsList = () => (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text flex items-center gap-2">
            <Icon name="trend" className="w-7 h-7 text-admin-accent" />
            Event Analytics
          </h1>
          <p className="text-sm text-admin-muted mt-1">
            Program loyalty & analisis pembelian customer berkelanjutan (Permanent / Never Expires)
          </p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-admin-accent text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm">
          <Icon name="plus" className="w-4 h-4" />
          Buat Event
        </button>
      </div>

      {/* Sync Result Toast */}
      {syncResult && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-between ${
          syncResult.success
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            <Icon name={syncResult.success ? 'check' : 'close'} className="w-4 h-4" />
            <span>{syncResult.message}</span>
            {syncResult.stats && (
              <span className="text-xs opacity-75 ml-2">
                ({syncResult.stats.valid_transactions} transaksi valid sejak {formatDate(syncResult.stats.start_date)}, {syncResult.stats.participant_rows} baris participant)
              </span>
            )}
          </div>
          <button onClick={() => setSyncResult(null)} className="opacity-50 hover:opacity-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-admin-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-admin-muted text-sm">{error}</p>
          <button onClick={fetchEvents} className="mt-3 text-admin-accent text-sm font-semibold hover:underline">Coba Lagi</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20 bg-admin-card border border-admin-border rounded-xl">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-admin-muted font-medium">Belum ada event aktif.</p>
          <p className="text-admin-muted text-sm mt-1">Buat event permanen untuk mulai menganalisis transaksi customer bulanan.</p>
          <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-admin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">
            <Icon name="plus" className="w-4 h-4 inline mr-1" /> Buat Event
          </button>
        </div>
      )}

      {/* Events Table */}
      {!loading && !error && events.length > 0 && (
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-base/50">
                  <th className="text-left px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden sm:table-cell">Mulai Aktif</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden md:table-cell">Target Simulasi</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden sm:table-cell">Customers</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden lg:table-cell">Last Sync</th>
                  <th className="text-right px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const sc = statusConfig[event.status] || statusConfig.active
                  return (
                    <tr key={event.id} className="border-b border-admin-border/50 hover:bg-admin-base/30 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(event.id)} className="text-admin-text font-semibold hover:text-admin-accent transition-colors text-left">
                          {event.name}
                        </button>
                        {event.description && <p className="text-xs text-admin-muted mt-0.5 line-clamp-1">{event.description}</p>}
                        <div className="sm:hidden mt-1 text-[11px] text-admin-muted flex items-center gap-1">
                          <Icon name="calendar" className="w-3 h-3" />
                          Mulai: {formatDate(event.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-admin-muted text-xs hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Icon name="calendar" className="w-3.5 h-3.5" />
                          <span>{formatDate(event.created_at)}</span>
                          <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-admin-base text-admin-muted border border-admin-border">Permanen</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-admin-text font-semibold text-xs">
                          {event.target_amount > 0 ? `${formatRupiah(event.target_amount)} /bln` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(event)}
                          title={`Klik untuk ubah ke ${event.status === 'active' ? 'Inactive' : 'Active'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-admin-text font-bold">{event.unique_customers || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-admin-muted hidden lg:table-cell">
                        {event.last_synced_at ? formatDateTime(event.last_synced_at) : <span className="text-admin-muted opacity-50">Belum sync</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSync(event.id)}
                            disabled={syncing === event.id}
                            className="p-1.5 text-admin-muted hover:text-blue-500 transition-colors disabled:opacity-50"
                            title="Sync / Rebuild Data"
                          >
                            <Icon name="sync" className={`w-4 h-4 ${syncing === event.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button onClick={() => openDetail(event.id)} className="p-1.5 text-admin-muted hover:text-admin-accent transition-colors" title="Lihat Analytics">
                            <Icon name="chart" className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditModal(event)} className="p-1.5 text-admin-muted hover:text-amber-500 transition-colors" title="Edit">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          {event.status === 'inactive' && (
                            <button onClick={() => handleDelete(event.id)} className="p-1.5 text-admin-muted hover:text-rose-500 transition-colors" title="Hapus">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  // ==========================================
  // RENDER: EVENT DETAIL / ANALYTICS
  // ==========================================
  const renderDetail = () => {
    const ev = analytics?.event
    const sum = analytics?.summary
    const targetSum = analytics?.target_summary
    const dist = analytics?.distribution
    const periods = analytics?.periods || []
    const participants = analytics?.participants
    const sc = ev ? (statusConfig[ev.status] || statusConfig.active) : statusConfig.active

    return (
      <div>
        {/* Back Button + Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={goBackToList} className="p-2 text-admin-muted hover:text-admin-text bg-admin-card border border-admin-border rounded-lg transition-colors">
              <Icon name="back" className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-admin-text">{ev?.name || 'Loading...'}</h1>
                {ev && (
                  <button
                    onClick={() => handleToggleStatus(ev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </button>
                )}
              </div>
              {ev && (
                <p className="text-xs text-admin-muted mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Icon name="calendar" className="w-3.5 h-3.5" />
                    Dimulai: {formatDate(ev.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Icon name="infinity" className="w-3.5 h-3.5" />
                    Event Berjalan Permanen (Never Expires)
                  </span>
                  {ev.last_synced_at && (
                    <span>• Sync terakhir: {formatDateTime(ev.last_synced_at)}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSync(selectedEventId, false)}
              disabled={syncing === selectedEventId}
              className="flex items-center gap-2 px-3 py-2 bg-admin-card border border-admin-border rounded-lg text-xs font-semibold text-admin-text hover:bg-admin-base/50 transition-colors disabled:opacity-50"
              title="Rebuild transaksi sejak event dibuat"
            >
              <Icon name="sync" className={`w-4 h-4 ${syncing === selectedEventId ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            <button
              onClick={() => {
                if (confirm('Rebuild SELURUH histori transaksi dari awal database? Data participant bulan terdahulu akan di-recalculate.')) {
                  handleSync(selectedEventId, true)
                }
              }}
              disabled={syncing === selectedEventId}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-admin-card border border-admin-border rounded-lg text-xs text-admin-muted hover:text-admin-text transition-colors disabled:opacity-50"
              title="Rebuild semua histori tanpa batas awal"
            >
              Rebuild Semua Histori
            </button>
          </div>
        </div>

        {/* Sync Result Toast */}
        {syncResult && syncResult.eventId === selectedEventId && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-between ${
            syncResult.success
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              <Icon name={syncResult.success ? 'check' : 'close'} className="w-4 h-4" />
              <span>{syncResult.message}</span>
              {syncResult.stats && (
                <span className="text-xs opacity-75 ml-2">
                  ({syncResult.stats.valid_transactions} transaksi valid sejak {formatDate(syncResult.stats.start_date)}, {syncResult.stats.participant_rows} rows)
                </span>
              )}
            </div>
            <button onClick={() => setSyncResult(null)} className="opacity-50 hover:opacity-100">
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Month Filter Selector Bar */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-1 flex items-center gap-1.5">
              <Icon name="calendar" className="w-4 h-4 text-admin-accent" />
              Pilih Bulan Analisis
            </div>
            <p className="text-xs text-admin-muted">
              Perhitungan di-reset secara logis setiap bulan kalender (YYYY-MM). Riwayat bulan lain tetap tersimpan independen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setSelectedPeriod(''); setParticipantPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedPeriod === ''
                  ? 'bg-admin-accent text-white border-admin-accent shadow-sm'
                  : 'bg-admin-base border-admin-border text-admin-text hover:border-admin-accent/50'
              }`}
            >
              Semua Histori
            </button>
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => { setSelectedPeriod(p); setParticipantPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedPeriod === p
                    ? 'bg-admin-accent text-white border-admin-accent shadow-sm'
                    : 'bg-admin-base border-admin-border text-admin-text hover:border-admin-accent/50'
                }`}
              >
                {formatPeriod(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {analyticsLoading && !analytics && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-admin-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No Data */}
        {!analyticsLoading && analytics && sum && sum.total_transactions === 0 && (
          <div className="text-center py-16 bg-admin-card border border-admin-border rounded-xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-admin-muted font-medium">Belum ada data transaksi untuk filter ini.</p>
            <p className="text-admin-muted text-sm mt-1">Klik "Sync Data" untuk menghitung dari transaksi yang ada di database.</p>
          </div>
        )}

        {/* Analytics Content */}
        {analytics && sum && sum.total_transactions > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: selectedPeriod ? 'Customer Unik (Bulan Ini)' : 'Customer Unik Total', value: sum.total_unique_customers, icon: 'users', color: 'text-blue-500' },
                { label: 'Total Transaksi', value: sum.total_transactions, icon: 'chart', color: 'text-indigo-500' },
                { label: 'Total Revenue', value: formatRupiah(sum.total_revenue), icon: 'revenue', color: 'text-emerald-500' },
                { label: 'Rata-rata/Customer', value: formatRupiah(sum.avg_purchase_per_customer_month), icon: 'trend', color: 'text-amber-500' },
                { label: 'Median/Customer', value: formatRupiah(sum.median_purchase_per_customer_month), icon: 'info', color: 'text-cyan-500' },
                { label: 'Tertinggi/Bulan', value: formatRupiah(sum.highest_monthly_purchase), icon: 'target', color: 'text-rose-500' },
              ].map((card, i) => (
                <div key={i} className="bg-admin-card border border-admin-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={card.icon} className={`w-4 h-4 ${card.color}`} />
                    <span className="text-[10px] font-semibold text-admin-muted uppercase tracking-wider">{card.label}</span>
                  </div>
                  <div className="text-lg font-bold text-admin-text truncate">{card.value}</div>
                </div>
              ))}
            </div>

            {/* Distribution + Simulation Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Purchase Distribution */}
              <div className="bg-admin-card border border-admin-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-admin-text mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="chart" className="w-4 h-4 text-admin-accent" />
                    Distribusi Pembelian {selectedPeriod ? `(${formatPeriod(selectedPeriod)})` : '(per Customer-Bulan)'}
                  </span>
                  <span className="text-[10px] text-admin-muted font-normal bg-admin-base px-2 py-0.5 rounded-full border border-admin-border">
                    {sum.total_unique_customers} customers
                  </span>
                </h3>
                <div className="space-y-2.5">
                  {(dist || []).map((bucket, i) => {
                    const maxCount = Math.max(...(dist || []).map(d => d.count), 1)
                    const widthPercent = (bucket.count / maxCount) * 100
                    const colors = [
                      'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500',
                      'bg-amber-500', 'bg-orange-500', 'bg-rose-500'
                    ]
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-admin-muted w-[140px] flex-shrink-0 text-right font-medium">{bucket.range}</span>
                        <div className="flex-1 bg-admin-base rounded-full h-6 overflow-hidden relative">
                          <div
                            className={`h-full ${colors[i]} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${Math.max(widthPercent, bucket.count > 0 ? 3 : 0)}%` }}
                          />
                          {bucket.count > 0 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-admin-text">
                              {bucket.count}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Target Simulation */}
              <div className="bg-admin-card border border-admin-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-admin-text flex items-center gap-2">
                    <Icon name="target" className="w-4 h-4 text-admin-accent" />
                    Simulasi Target {selectedPeriod ? `(${formatPeriod(selectedPeriod)})` : 'Per Bulan'}
                  </h3>
                  <span className="text-[9px] font-medium text-admin-muted bg-admin-base px-2 py-0.5 rounded-full uppercase border border-admin-border">
                    Admin Analytics
                  </span>
                </div>
                <p className="text-xs text-admin-muted mb-4">
                  Berapa customer yang total pembeliannya mencapai nominal target pada periode ini?
                </p>

                {/* Preset buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[25000, 50000, 75000, 100000, 125000, 150000, 200000].map(val => (
                    <button
                      key={val}
                      onClick={() => handleSimulate(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        Number(simTarget) === val
                          ? 'bg-admin-accent text-white border-admin-accent shadow-sm'
                          : 'bg-admin-base border-admin-border text-admin-text hover:border-admin-accent/50'
                      }`}
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Ketik target nominal khusus..."
                    value={simTarget}
                    onChange={(e) => setSimTarget(e.target.value)}
                    className="flex-1 px-3 py-2 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) handleSimulate(e.target.value)
                    }}
                  />
                  <button
                    onClick={() => handleSimulate(simTarget)}
                    disabled={!simTarget || simLoading}
                    className="px-4 py-2 bg-admin-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    Simulasi
                  </button>
                </div>

                {/* Result */}
                {simLoading && <div className="text-center py-4"><div className="w-5 h-5 border-2 border-admin-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>}
                
                {simResult && !simLoading && (
                  <div className="bg-admin-base border border-admin-border rounded-xl p-4">
                    <div className="text-center">
                      <div className="text-xs text-admin-muted mb-1">
                        Target: <span className="font-bold text-admin-text">{formatRupiah(simResult.target_amount)} /bulan</span>
                        {simResult.period !== 'all' && ` • ${formatPeriod(simResult.period)}`}
                      </div>
                      <div className="text-3xl font-black text-admin-accent">{simResult.qualifying_customers}</div>
                      <div className="text-sm text-admin-muted mt-1">
                        dari <span className="font-bold text-admin-text">{simResult.total_customers}</span> customer qualify
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-admin-accent/10 text-admin-accent rounded-full text-sm font-bold">
                        {simResult.percentage}% lolos target
                      </div>
                    </div>
                  </div>
                )}

                {!simResult && !simLoading && targetSum && targetSum.target_amount > 0 && (
                  <div className="bg-admin-base/50 border border-admin-border/50 rounded-xl p-3 text-center text-xs text-admin-muted">
                    Target default event: <strong className="text-admin-text">{formatRupiah(targetSum.target_amount)}</strong> →{' '}
                    <strong className="text-admin-accent">{targetSum.qualifying_customers}</strong> customer ({targetSum.percentage}%) qualify
                  </div>
                )}
              </div>
            </div>

            {/* Participants Table */}
            <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-admin-text flex items-center gap-2">
                  <Icon name="users" className="w-4 h-4 text-admin-accent" />
                  Data Pembelian Customer
                  {participants && <span className="text-xs text-admin-muted font-normal ml-1">({participants.total} baris data)</span>}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Phone Search */}
                  <div className="relative">
                    <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-muted" />
                    <input
                      type="text"
                      placeholder="Cari no HP..."
                      value={searchPhone}
                      onChange={(e) => { setSearchPhone(e.target.value); setParticipantPage(1) }}
                      className="pl-8 pr-3 py-1.5 bg-admin-base border border-admin-border rounded-lg text-xs text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent w-44"
                    />
                  </div>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-admin-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : participants && participants.data && participants.data.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-admin-base/50 border-b border-admin-border">
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">No HP (Masked)</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">Bulan Kalender</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">Total Pembelian</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden sm:table-cell">Jumlah Tx</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden md:table-cell">Rata-rata/Tx</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden lg:table-cell">Tx Terakhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.data.map((p) => (
                          <tr key={p.id} className="border-b border-admin-border/50 hover:bg-admin-base/20 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-admin-text">{p.masked_phone}</td>
                            <td className="px-4 py-2.5 text-xs text-admin-muted">
                              <span className="px-2 py-0.5 rounded bg-admin-base border border-admin-border/50">
                                {formatPeriod(p.period_key)}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-admin-text text-xs">{formatRupiah(p.total_purchase)}</td>
                            <td className="px-4 py-2.5 text-center text-xs text-admin-muted hidden sm:table-cell">{p.transaction_count}x</td>
                            <td className="px-4 py-2.5 text-right text-xs text-admin-muted hidden md:table-cell">{formatRupiah(p.avg_per_transaction)}</td>
                            <td className="px-4 py-2.5 text-center text-[11px] text-admin-muted hidden lg:table-cell">{formatDate(p.last_transaction_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {participants.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-admin-border flex items-center justify-between">
                      <span className="text-xs text-admin-muted">
                        Halaman {participants.current_page} dari {participants.last_page} ({participants.total} total customer-bulan)
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(participants.last_page, 7) }, (_, i) => {
                          let pageNum
                          if (participants.last_page <= 7) {
                            pageNum = i + 1
                          } else if (participants.current_page <= 4) {
                            pageNum = i + 1
                          } else if (participants.current_page >= participants.last_page - 3) {
                            pageNum = participants.last_page - 6 + i
                          } else {
                            pageNum = participants.current_page - 3 + i
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setParticipantPage(pageNum)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                participantPage === pageNum
                                  ? 'bg-admin-accent text-white'
                                  : 'text-admin-muted hover:text-admin-text hover:bg-admin-base'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-admin-muted text-sm">Tidak ada data participant{selectedPeriod ? ` untuk ${formatPeriod(selectedPeriod)}` : ''}.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ==========================================
  // RENDER: MODAL
  // ==========================================
  const renderModal = () => {
    if (!showModal) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        <div className="relative bg-admin-card border border-admin-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-admin-border flex items-center justify-between">
            <h3 className="font-bold text-admin-text">{editEvent ? 'Edit Event' : 'Buat Event Permanen'}</h3>
            <button onClick={() => setShowModal(false)} className="text-admin-muted hover:text-admin-text">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Notice */}
            <div className="p-3 bg-admin-base border border-admin-border rounded-lg text-xs text-admin-muted flex items-start gap-2">
              <Icon name="info" className="w-4 h-4 text-admin-accent flex-shrink-0 mt-0.5" />
              <span>
                Event bersifat <strong>permanen dan tidak memiliki tanggal berakhir</strong>. Akumulasi transaksi dihitung otomatis per customer berdasarkan bulan kalender.
              </span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Nama Event / Program *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: ND-HOTSPOT Customer Loyalty Program"
                className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent"
              />
              {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi internal untuk tim admin (opsional)"
                rows={3}
                className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent resize-none"
              />
            </div>

            {/* Target + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Target Nominal / Bulan</label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="Contoh: 100000"
                  className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent"
                />
                <p className="text-[10px] text-admin-muted mt-1">Hanya untuk simulasi analytics</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Status Tracking</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text focus:outline-none focus:border-admin-accent"
                >
                  <option value="active">Active (Tracking Otomatis)</option>
                  <option value="inactive">Inactive (Tracking Berhenti)</option>
                </select>
                <p className="text-[10px] text-admin-muted mt-1">Nonaktifkan untuk pause tracking</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-admin-border flex justify-end gap-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-admin-muted hover:text-admin-text transition-colors">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-admin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : (editEvent ? 'Update' : 'Buat Event')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div>
      {view === 'list' ? renderEventsList() : renderDetail()}
      {renderModal()}
    </div>
  )
}
