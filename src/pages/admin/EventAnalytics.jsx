import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API_URL
const WA_SOCKET_URL = import.meta.env.VITE_WA_URL || 'http://localhost:5000'

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
    bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    gift: <path d="M20 12v10H4V12M2 7h20v5H2zm10 5v10m0-15c-1.5-3-5.5-3-5.5 0 0 3 5.5 3 5.5 3zm0 0c1.5-3 5.5-3 5.5 0 0 3-5.5 3-5.5 3z" />,
    copy: <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
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

const formatTimeOnly = (dateObj) => {
  if (!dateObj) return '-'
  return new Date(dateObj).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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

  // Real-time WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false)
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState(new Date())
  const [liveFlashNotice, setLiveFlashNotice] = useState(null)

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

  // Phase 2: Reward Rules state
  const [voucherPlans, setVoucherPlans] = useState([])
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [ruleFormData, setRuleFormData] = useState({ voucher_plan_id: '', name: '', description: '', is_active: true })
  const [savingRule, setSavingRule] = useState(false)
  const [ruleErrors, setRuleErrors] = useState({})
  const [reconcilingRuleId, setReconcilingRuleId] = useState(null)
  const [retryingRewardId, setRetryingRewardId] = useState(null)
  const [ruleNotice, setRuleNotice] = useState(null)
  const [copiedRewardCode, setCopiedRewardCode] = useState(null)

  // Loyalty Test Mode state
  const [testPhone, setTestPhone] = useState('081234567890')
  const [testAmount, setTestAmount] = useState('100000')
  const [testExpiryOverride, setTestExpiryOverride] = useState('normal')
  const [testUseRealMikrotik, setTestUseRealMikrotik] = useState(false)
  const [testSendWhatsapp, setTestSendWhatsapp] = useState(false)
  const [runningTest, setRunningTest] = useState(false)
  const [resettingTest, setResettingTest] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState(null)

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [participantPage, setParticipantPage] = useState(1)

  // Refs for current filter state (used inside WebSocket callbacks without re-attaching listeners)
  const selectedEventIdRef = useRef(selectedEventId)
  const selectedPeriodRef = useRef(selectedPeriod)
  const searchPhoneRef = useRef(searchPhone)
  const participantPageRef = useRef(participantPage)
  const viewRef = useRef(view)

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId
    selectedPeriodRef.current = selectedPeriod
    searchPhoneRef.current = searchPhone
    participantPageRef.current = participantPage
    viewRef.current = view
  }, [selectedEventId, selectedPeriod, searchPhone, participantPage, view])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/admin/events`, { headers })
      setEvents(res.data || [])
      setLastRealtimeUpdate(new Date())
    } catch (err) {
      if (!silent) setError('Gagal memuat data events.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const fetchAnalytics = useCallback(async (eventId, period = '', search = '', page = 1, silent = false) => {
    if (!silent) setAnalyticsLoading(true)
    try {
      const params = { page }
      if (period) params.period = period
      if (search) params.search = search
      const res = await axios.get(`${API}/admin/events/${eventId}/analytics`, { headers, params })
      setAnalytics(res.data)
      setLastRealtimeUpdate(new Date())
    } catch (err) {
      if (!silent) {
        setAnalytics(null)
        setError('Gagal memuat analytics.')
      }
    } finally {
      if (!silent) setAnalyticsLoading(false)
    }
  }, [])

  // ==========================================
  // WEBSOCKET (SOCKET.IO) REALTIME LISTENER
  // ==========================================
  useEffect(() => {
    let socket = null

    try {
      socket = io(WA_SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        setWsConnected(true)
      })

      socket.on('disconnect', () => {
        setWsConnected(false)
      })

      // Listen to real-time analytics broadcast triggered by payment callback
      socket.on('analytics_updated', (data) => {
        setLastRealtimeUpdate(new Date())
        setLiveFlashNotice(`⚡ Transaksi voucher baru masuk: ${data?.phone || 'Customer'} (${formatRupiah(data?.amount || 0)})`)
        setTimeout(() => setLiveFlashNotice(null), 5000)

        // Instantly refresh active view with ZERO delay
        if (viewRef.current === 'detail' && selectedEventIdRef.current) {
          fetchAnalytics(selectedEventIdRef.current, selectedPeriodRef.current, searchPhoneRef.current, participantPageRef.current, true)
        } else {
          fetchEvents(true)
        }
      })
    } catch (err) {
      console.warn('WebSocket connection error:', err)
    }

    // Fallback reconciliation interval (every 45s just in case socket disconnects)
    const fallbackInterval = setInterval(() => {
      if (viewRef.current === 'detail' && selectedEventIdRef.current) {
        fetchAnalytics(selectedEventIdRef.current, selectedPeriodRef.current, searchPhoneRef.current, participantPageRef.current, true)
      } else {
        fetchEvents(true)
      }
    }, 45000)

    return () => {
      clearInterval(fallbackInterval)
      if (socket) {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('analytics_updated')
        socket.disconnect()
      }
    }
  }, [fetchAnalytics, fetchEvents])

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
    if (!formData.name.trim()) errors.name = 'Nama program event wajib diisi'
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
      ? `Nonaktifkan "${event.name}"? Tracking transaksi baru akan dihentikan (data historis tetap tersimpan utuh).`
      : `Aktifkan kembali "${event.name}"? Tracking transaksi voucher baru akan langsung berjalan secara real-time.`

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
    if (!confirm('Hapus program event ini secara permanen?')) return
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
  // PHASE 2: REWARD RULES HANDLERS
  // ==========================================
  const fetchVoucherPlans = async () => {
    try {
      const res = await axios.get(`${API}/voucher-plans`, { headers })
      setVoucherPlans(res.data || [])
    } catch (err) {
      console.warn('Failed to load voucher plans', err)
    }
  }

  const openCreateRuleModal = () => {
    setEditRule(null)
    setRuleFormData({ voucher_plan_id: '', name: '', description: '', is_active: true })
    setRuleErrors({})
    fetchVoucherPlans()
    setShowRuleModal(true)
  }

  const openEditRuleModal = (rule) => {
    setEditRule(rule)
    setRuleFormData({
      voucher_plan_id: rule.voucher_plan_id,
      name: rule.name,
      description: rule.description || '',
      is_active: Boolean(rule.is_active),
    })
    setRuleErrors({})
    fetchVoucherPlans()
    setShowRuleModal(true)
  }

  const handleSaveRule = async () => {
    const errs = {}
    if (!ruleFormData.name.trim()) errs.name = 'Nama reward wajib diisi.'
    if (!ruleFormData.voucher_plan_id) errs.voucher_plan_id = 'Pilih paket voucher dari master data.'
    if (Object.keys(errs).length > 0) {
      setRuleErrors(errs)
      return
    }

    setSavingRule(true)
    try {
      let res
      if (editRule) {
        res = await axios.put(`${API}/admin/events/${selectedEventId}/reward-rules/${editRule.id}`, ruleFormData, { headers })
      } else {
        res = await axios.post(`${API}/admin/events/${selectedEventId}/reward-rules`, ruleFormData, { headers })
      }

      setShowRuleModal(false)
      const retro = res.data?.retroactive_stats
      if (retro && retro.eligible > 0) {
        setRuleNotice(`✨ Otomatisasi: ${retro.issued} voucher reward berhasil diterbitkan untuk customer yang sudah mencapai target! (${retro.skipped} sudah ada)`)
      } else {
        setRuleNotice(res.data?.message || 'Reward rule berhasil disimpan.')
      }
      setTimeout(() => setRuleNotice(null), 8000)

      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan reward rule.')
    } finally {
      setSavingRule(false)
    }
  }

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Yakin ingin menghapus Reward Rule ini?')) return
    try {
      await axios.delete(`${API}/admin/events/${selectedEventId}/reward-rules/${ruleId}`, { headers })
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert('Gagal menghapus reward rule.')
    }
  }

  const handleToggleRuleStatus = async (rule) => {
    try {
      const res = await axios.put(`${API}/admin/events/${selectedEventId}/reward-rules/${rule.id}`, {
        is_active: !rule.is_active,
      }, { headers })
      const retro = res.data?.retroactive_stats
      if (retro && retro.eligible > 0) {
        setRuleNotice(`✨ Rule diaktifkan: ${retro.issued} voucher reward langsung diterbitkan ke customer eligible!`)
        setTimeout(() => setRuleNotice(null), 8000)
      }
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert('Gagal mengubah status reward rule.')
    }
  }

  const handleReconcileEligible = async (ruleId) => {
    setReconcilingRuleId(ruleId)
    try {
      const res = await axios.post(`${API}/admin/events/${selectedEventId}/reward-rules/${ruleId}/process-eligible`, {}, { headers })
      const stats = res.data?.stats
      setRuleNotice(`⚡ Rekonsiliasi selesai: ${stats?.issued || 0} diterbitkan, ${stats?.skipped || 0} sudah ada, ${stats?.failed || 0} gagal.`)
      setTimeout(() => setRuleNotice(null), 8000)
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert('Gagal memproses ulang customer eligible.')
    } finally {
      setReconcilingRuleId(null)
    }
  }

  const handleRetryReward = async (rewardId) => {
    setRetryingRewardId(rewardId)
    try {
      const res = await axios.post(`${API}/admin/events/${selectedEventId}/rewards/${rewardId}/retry`, {}, { headers })
      alert(res.data?.message || 'Proses retry reward selesai.')
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal retry penerbitan reward.')
    } finally {
      setRetryingRewardId(null)
    }
  }

  // ==========================================
  // LOYALTY TEST MODE HANDLERS
  // ==========================================
  const handleRunLoyaltyTest = async () => {
    if (!testPhone.trim()) {
      alert('Masukkan nomor HP untuk simulasi testing.')
      return
    }
    if (!testAmount || isNaN(testAmount) || Number(testAmount) <= 0) {
      alert('Masukkan nominal simulasi pembelian.')
      return
    }

    setRunningTest(true)
    setTestResult(null)
    setTestError(null)

    try {
      let expiryMinutes = null
      if (testExpiryOverride === '1m') expiryMinutes = 1
      else if (testExpiryOverride === '5m') expiryMinutes = 5
      else if (testExpiryOverride === '1h') expiryMinutes = 60

      const payload = {
        phone: testPhone.trim(),
        amount: Number(testAmount),
        simulated_amount: Number(testAmount),
        period_key: selectedPeriod || undefined,
        use_real_mikrotik: Boolean(testUseRealMikrotik),
        expiry_minutes: expiryMinutes,
        expiry_override_minutes: expiryMinutes,
        send_whatsapp: Boolean(testSendWhatsapp),
      }

      const res = await axios.post(`${API}/admin/events/${selectedEventId}/loyalty-test/run`, payload, { headers })
      setTestResult(res.data)
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      const errData = err.response?.data
      const msg = errData?.message || (errData?.errors ? Object.values(errData.errors).flat().join(', ') : err.message) || 'Gagal menjalankan loyalty test.'
      setTestError(msg)
    } finally {
      setRunningTest(false)
    }
  }

  const handleResetLoyaltyTest = async (resetAll = false) => {
    const confirmMsg = resetAll
      ? 'Yakin ingin mereset SEMUA data Loyalty Test Mode pada event ini? Data transaksi production TIDAK akan terpengaruh.'
      : `Yakin ingin mereset data test untuk nomor ${testPhone}?`

    if (!confirm(confirmMsg)) return

    setResettingTest(true)
    try {
      const payload = {
        phone: resetAll ? 'all' : testPhone.trim(),
        period_key: selectedPeriod || undefined,
      }
      const res = await axios.post(`${API}/admin/events/${selectedEventId}/loyalty-test/reset`, payload, { headers })
      alert(res.data?.message || 'Data test berhasil direset.')
      setTestResult(null)
      setTestError(null)
      fetchAnalytics(selectedEventId, selectedPeriod, searchPhone, participantPage, true)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mereset data test.')
    } finally {
      setResettingTest(false)
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-admin-text flex items-center gap-2">
              <Icon name="trend" className="w-7 h-7 text-admin-accent" />
              Loyalty Analytics
            </h1>
            {/* Realtime WebSocket Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              wsConnected
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span>{wsConnected ? 'WebSocket Real-Time Live' : 'Reconnecting WebSocket'}</span>
            </div>
          </div>
          <p className="text-sm text-admin-muted mt-1">
            Pencatatan data riil transaksi pembeli voucher per bulan kalender (Permanent Program — Never Expires)
          </p>
        </div>

        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-admin-accent text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm">
          <Icon name="plus" className="w-4 h-4" />
          Buat Program Event
        </button>
      </div>

      {/* Live Flash Notice Banner */}
      {liveFlashNotice && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Icon name="bolt" className="w-4 h-4" />
          <span>{liveFlashNotice}</span>
        </div>
      )}

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
                ({syncResult.stats.valid_transactions} transaksi voucher sejak {formatDate(syncResult.stats.start_date)}, {syncResult.stats.participant_rows} rows)
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
          <button onClick={() => fetchEvents()} className="mt-3 text-admin-accent text-sm font-semibold hover:underline">Coba Lagi</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20 bg-admin-card border border-admin-border rounded-xl">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-admin-muted font-medium">Belum ada program event aktif.</p>
          <p className="text-admin-muted text-sm mt-1">Buat program event permanen untuk mencatat transaksi riil pembeli voucher.</p>
          <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-admin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">
            <Icon name="plus" className="w-4 h-4 inline mr-1" /> Buat Program Event
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
                  <th className="text-left px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Program Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden sm:table-cell">Mulai Berjalan</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden md:table-cell">Target Loyalty</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Status Tracking</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden sm:table-cell">Customer Unik</th>
                  <th className="text-center px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider hidden lg:table-cell">Terakhir Diupdate</th>
                  <th className="text-right px-4 py-3 font-semibold text-admin-muted text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const sc = statusConfig[event.status] || statusConfig.active
                  return (
                    <tr key={event.id} className="border-b border-admin-border/50 hover:bg-admin-base/30 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(event.id)} className="text-admin-text font-semibold hover:text-admin-accent transition-colors text-left flex items-center gap-2">
                          <span>{event.name}</span>
                          {event.status === 'active' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Tracking Aktif Real-time" />
                          )}
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
                          <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-admin-base text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Permanen
                          </span>
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
                          title={`Klik untuk ubah status ke ${event.status === 'active' ? 'Inactive' : 'Active'}`}
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
                        {event.last_synced_at ? formatDateTime(event.last_synced_at) : <span className="text-admin-muted opacity-50">Real-time tracking</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSync(event.id)}
                            disabled={syncing === event.id}
                            className="p-1.5 text-admin-muted hover:text-blue-500 transition-colors disabled:opacity-50"
                            title="Rebuild Data Transaksi"
                          >
                            <Icon name="sync" className={`w-4 h-4 ${syncing === event.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button onClick={() => openDetail(event.id)} className="p-1.5 text-admin-muted hover:text-admin-accent transition-colors" title="Lihat Dashboard Detail">
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
    const targetAch = analytics?.target_achievement
    const dist = analytics?.distribution
    const periods = analytics?.periods || []
    const participants = analytics?.participants
    const testModeInfo = analytics?.test_mode
    const sc = ev ? (statusConfig[ev.status] || statusConfig.active) : statusConfig.active

    return (
      <div>
        {/* Live Flash Notice Banner */}
        {liveFlashNotice && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-2">
              <Icon name="bolt" className="w-4 h-4 text-emerald-500" />
              <span>{liveFlashNotice}</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">Realtime Live</span>
          </div>
        )}

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
                {/* Real-time Indicator Badge */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  wsConnected
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  <span>{wsConnected ? '100% REAL-TIME LIVE' : 'WS RECONNECTING'}</span>
                </div>
              </div>
              {ev && (
                <p className="text-xs text-admin-muted mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Icon name="calendar" className="w-3.5 h-3.5" />
                    Mulai: {formatDate(ev.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Icon name="infinity" className="w-3.5 h-3.5" />
                    Program Berjalan Permanen
                  </span>
                  <span className="text-[11px] text-admin-muted">
                    • Terakhir diperbarui: <strong className="text-admin-text">{formatTimeOnly(lastRealtimeUpdate)}</strong>
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSync(selectedEventId, false)}
              disabled={syncing === selectedEventId}
              className="flex items-center gap-1.5 px-3 py-2 bg-admin-card border border-admin-border rounded-lg text-xs font-semibold text-admin-text hover:bg-admin-base/50 transition-colors disabled:opacity-50"
              title="Rebuild kalkulasi dari transaksi di database"
            >
              <Icon name="sync" className={`w-3.5 h-3.5 ${syncing === selectedEventId ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            <button
              onClick={() => {
                if (confirm('Rebuild SELURUH histori transaksi voucher dari awal database? Data participant bulan terdahulu akan di-recalculate ulang.')) {
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
              Pilih Periode Bulan Kalender
            </div>
            <p className="text-xs text-admin-muted">
              Pencatatan riil transaksi pembeli voucher dipisahkan per bulan kalender. Riwayat bulan lampau tersimpan independen.
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

        {/* Notice Info Sisi Customer */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="info" className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Admin Internal Only:</strong> Sistem ini mencatat data riil pembeli voucher hotspot. Customer <u>belum</u> menerima reward/notifikasi apa pun.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 uppercase tracking-wider">
            Fase 1: Real Data Tracking
          </span>
        </div>

        {/* Loading */}
        {analyticsLoading && !analytics && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-admin-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Analytics Content */}
        {!analyticsLoading && analytics && (
          <>
            {sum && sum.total_transactions > 0 ? (
              <>
                {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: selectedPeriod ? 'Customer Unik (Bulan Ini)' : 'Customer Unik Total', value: sum.total_unique_customers, icon: 'users', color: 'text-blue-500' },
                { label: 'Total Transaksi Voucher', value: sum.total_transactions, icon: 'chart', color: 'text-indigo-500' },
                { label: 'Total Revenue Voucher', value: formatRupiah(sum.total_revenue), icon: 'revenue', color: 'text-emerald-500' },
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

            {/* Distribution + Real Target Achievement Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Purchase Distribution */}
              <div className="bg-admin-card border border-admin-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-admin-text mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="chart" className="w-4 h-4 text-admin-accent" />
                    Distribusi Pembelian {selectedPeriod ? `(${formatPeriod(selectedPeriod)})` : '(per Customer-Bulan)'}
                  </span>
                  <span className="text-[10px] text-admin-muted font-normal bg-admin-base px-2 py-0.5 rounded-full border border-admin-border">
                    {sum.total_unique_customers} customer terdata
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

              {/* Target Pencapaian Loyalty Customer (DATA AKTUAL) */}
              <div className="bg-admin-card border border-admin-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-admin-text flex items-center gap-2">
                      <Icon name="target" className="w-4 h-4 text-admin-accent" />
                      Target Pencapaian Loyalty Customer {selectedPeriod ? `(${formatPeriod(selectedPeriod)})` : 'Per Bulan'}
                    </h3>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/20">
                      Data Aktual
                    </span>
                  </div>
                  <p className="text-xs text-admin-muted mb-4">
                    Kondisi riil pencapaian target loyalty pelanggan berdasarkan transaksi voucher yang sudah terjadi:
                  </p>
                </div>

                {targetAch && targetAch.target_amount > 0 ? (
                  <div className="bg-admin-base border border-admin-border rounded-xl p-6 text-center my-auto">
                    <div className="text-xs text-admin-muted mb-1">
                      Target Program: <strong className="text-admin-text text-sm">{formatRupiah(targetAch.target_amount)} /bulan</strong>
                      {selectedPeriod && ` • ${formatPeriod(selectedPeriod)}`}
                    </div>
                    <div className="text-4xl font-black text-admin-accent my-2">{targetAch.qualifying_customers}</div>
                    <div className="text-sm text-admin-muted">
                      dari total <strong className="text-admin-text">{targetAch.total_customers}</strong> customer telah mencapai target
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                      ✓ {targetAch.percentage}% customer memenuhi kualifikasi
                    </div>
                  </div>
                ) : (
                  <div className="bg-admin-base border border-admin-border rounded-xl p-6 text-center my-auto">
                    <Icon name="target" className="w-8 h-8 text-admin-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-admin-text">Target Nominal Belum Ditentukan</p>
                    <p className="text-xs text-admin-muted mt-1">
                      Edit program event untuk menetapkan target nominal bulanan (misal: Rp 100.000).
                    </p>
                  </div>
                )}

                <div className="mt-3 text-[11px] text-admin-muted text-center">
                  * Evaluasi dilakukan independen per customer per bulan kalender.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 bg-admin-card border border-admin-border rounded-xl mb-6">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-admin-muted font-medium">Belum ada transaksi riil voucher untuk program/periode ini.</p>
            <p className="text-admin-muted text-xs mt-1">
              Gunakan <strong>Loyalty Test Mode</strong> di bawah untuk mensimulasikan pencapaian target dan otomatisasi reward voucher secara aman tanpa transaksi palsu.
            </p>
          </div>
        )}

        {/* Phase 2: Automatic Reward System Card */}
            <div className="bg-admin-card border border-admin-border rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon name="gift" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-admin-text">
                        Otomatisasi Reward Voucher (Phase 2)
                      </h3>
                      <p className="text-xs text-admin-muted">
                        Reward diterbitkan otomatis ke MikroTik ketika akumulasi belanja mencapai target nominal event ({formatRupiah(ev?.target_amount || 0)}).
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openCreateRuleModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-admin-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    Tambah Reward Rule
                  </button>
                </div>
              </div>

              {/* Feedback notice if any */}
              {ruleNotice && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>{ruleNotice}</span>
                  <button onClick={() => setRuleNotice(null)} className="text-emerald-600 hover:text-emerald-800">
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Reward Rules List */}
              {analytics?.reward_rules && analytics.reward_rules.length > 0 ? (
                <div className="space-y-3">
                  {analytics.reward_rules.map((rule) => {
                    const plan = rule.voucher_plan
                    return (
                      <div
                        key={rule.id}
                        className="bg-admin-base border border-admin-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <Icon name="gift" className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-admin-text">{rule.name}</h4>
                              <button
                                onClick={() => handleToggleRuleStatus(rule)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase transition-opacity ${
                                  rule.is_active
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {rule.is_active ? '● Aktif' : '○ Nonaktif'}
                              </button>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-admin-muted flex-wrap">
                              <span>Paket: <strong className="text-admin-text">{plan?.name || 'Voucher Plan'}</strong></span>
                              {plan?.duration && <span>Durasi: <strong className="text-admin-text">{plan.duration}</strong></span>}
                              {plan?.mikrotik_profile && <span>Profil MikroTik: <strong className="text-admin-text">{plan.mikrotik_profile}</strong></span>}
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Masa Berlaku: 5 Hari</span>
                            </div>
                            {rule.description && (
                              <p className="text-xs text-admin-muted mt-1 italic">{rule.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          {/* Reconcile button for requirement #6 */}
                          <button
                            onClick={() => handleReconcileEligible(rule.id)}
                            disabled={reconcilingRuleId === rule.id || !rule.is_active}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-50"
                            title="Cek dan terbitkan reward untuk customer yang sudah mencapai target"
                          >
                            <Icon name="refresh" className={`w-3.5 h-3.5 ${reconcilingRuleId === rule.id ? 'animate-spin' : ''}`} />
                            {reconcilingRuleId === rule.id ? 'Memproses...' : 'Proses Ulang Eligible'}
                          </button>
                          <button
                            onClick={() => openEditRuleModal(rule)}
                            className="p-1.5 text-admin-muted hover:text-amber-500 transition-colors"
                            title="Edit Rule"
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-admin-muted hover:text-rose-500 transition-colors"
                            title="Hapus Rule"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-admin-base border border-dashed border-admin-border rounded-xl p-6 text-center">
                  <Icon name="gift" className="w-8 h-8 text-admin-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-admin-text">Belum Ada Reward Rule</p>
                  <p className="text-xs text-admin-muted mt-1 max-w-md mx-auto">
                    Buat aturan reward untuk menentukan paket voucher gratis yang otomatis diterbitkan ke MikroTik ketika pelanggan mencapai target {formatRupiah(ev?.target_amount || 0)}.
                  </p>
                  <button
                    onClick={openCreateRuleModal}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-admin-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    Buat Reward Rule Sekarang
                  </button>
                </div>
              )}

              {/* Stats badges */}
              {analytics?.reward_stats && (
                <div className="mt-4 pt-3 border-t border-admin-border/60 flex items-center justify-between text-xs text-admin-muted flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span>
                      Diterbitkan: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{analytics.reward_stats.issued || 0}</strong>
                    </span>
                    <span>
                      Sedang Diproses: <strong className="text-amber-600 font-bold">{analytics.reward_stats.processing || 0}</strong>
                    </span>
                    {analytics.reward_stats.failed > 0 && (
                      <span>
                        Gagal: <strong className="text-rose-600 font-bold">{analytics.reward_stats.failed}</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-75">
                    * Masa berlaku reward voucher adalah 5 hari sejak diterbitkan.
                  </span>
                </div>
              )}
            </div>

            {/* Phase 2: Loyalty Test Mode Card */}
            <div className="bg-admin-card border border-admin-border rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon name="bolt" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-admin-text">
                        Loyalty Test Mode
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        testModeInfo?.enabled
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {testModeInfo?.enabled ? 'Test Mode Active (Isolated)' : 'Test Mode Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-admin-muted">
                      Simulasi akumulasi belanja dan otomatisasi penerbitan reward voucher secara terisolasi tanpa transaksi palsu.
                    </p>
                  </div>
                </div>
              </div>

              {!testModeInfo?.enabled ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Icon name="info" className="w-4 h-4 text-amber-500" />
                    Loyalty Test Mode is disabled.
                  </div>
                  <p>
                    Set <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono font-bold">LOYALTY_TEST_MODE=true</code> pada file <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono">backend/.env</code> untuk mengaktifkan fitur pengujian ini.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Safety Assurance Banner */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Icon name="check" className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Keamanan Data Terjamin:</strong> Simulasi ini <u>tidak membuat record</u> di tabel <code className="font-mono bg-blue-500/20 px-1 py-0.5 rounded">transactions</code>, tidak membuat transaksi Midtrans palsu, dan tidak memengaruhi laporan omset/revenue penjualan riil.
                    </span>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Event Name */}
                    <div>
                      <label className="block text-xs font-semibold text-admin-text mb-1">
                        Program Event
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={ev?.name || 'Selected Event'}
                        className="w-full px-3 py-2 bg-admin-base/70 border border-admin-border rounded-lg text-xs text-admin-muted font-medium cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-admin-text mb-1">
                        Nomor HP / WhatsApp Customer
                      </label>
                      <input
                        type="text"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3 py-2 bg-admin-base border border-admin-border rounded-lg text-xs text-admin-text focus:outline-none focus:border-admin-accent font-mono"
                      />
                      <span className="text-[10px] text-admin-muted mt-0.5 block">Format: 081234567890 atau 6281234567890</span>
                    </div>

                    {/* Simulated Purchase Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-admin-text mb-1">
                        Simulated Purchase Amount (Rp)
                      </label>
                      <input
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(e.target.value)}
                        placeholder="100000"
                        className="w-full px-3 py-2 bg-admin-base border border-admin-border rounded-lg text-xs text-admin-text focus:outline-none focus:border-admin-accent font-mono"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setTestAmount(String(Math.round((ev?.target_amount || 100000) * 0.5)))}
                          className="text-[10px] px-2 py-0.5 bg-admin-base border border-admin-border rounded hover:border-admin-accent text-admin-muted hover:text-admin-text transition-colors"
                        >
                          50% ({formatRupiah((ev?.target_amount || 100000) * 0.5)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestAmount(String(ev?.target_amount || 100000))}
                          className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                        >
                          Target ({formatRupiah(ev?.target_amount || 100000)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestAmount(String((ev?.target_amount || 100000) + 50000))}
                          className="text-[10px] px-2 py-0.5 bg-admin-base border border-admin-border rounded hover:border-admin-accent text-admin-muted hover:text-admin-text transition-colors"
                        >
                          Lebih Target ({formatRupiah((ev?.target_amount || 100000) + 50000)})
                        </button>
                      </div>
                    </div>

                    {/* Expiry Override */}
                    <div>
                      <label className="block text-xs font-semibold text-admin-text mb-1">
                        Reward Expiry Test
                      </label>
                      <select
                        value={testExpiryOverride}
                        onChange={(e) => setTestExpiryOverride(e.target.value)}
                        className="w-full px-3 py-2 bg-admin-base border border-admin-border rounded-lg text-xs text-admin-text focus:outline-none focus:border-admin-accent"
                      >
                        <option value="normal">Normal: 5 Hari (+5 days)</option>
                        <option value="1m">Test Cepat: 1 Menit (+1 minute)</option>
                        <option value="5m">Test Cepat: 5 Menit (+5 minutes)</option>
                        <option value="1h">Test Cepat: 1 Jam (+1 hour)</option>
                      </select>
                      <span className="text-[10px] text-admin-muted mt-0.5 block">Override masa kedaluwarsa khusus simulasi test</span>
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-2 space-y-2 flex flex-col justify-end pb-1">
                      {/* Real MikroTik Checkbox */}
                      <label className="flex items-start gap-2 cursor-pointer text-xs text-admin-text">
                        <input
                          type="checkbox"
                          checked={testUseRealMikrotik}
                          onChange={(e) => setTestUseRealMikrotik(e.target.checked)}
                          className="mt-0.5 rounded border-admin-border text-admin-accent focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            [ ] Use real MikroTik integration
                          </span>
                          <p className="text-[11px] text-admin-muted">
                            Jika dicentang, sistem akan <u>benar-benar</u> membuat user hotspot di router MikroTik. Jika tidak dicentang (default), voucher menggunakan Mock Provider yang aman tanpa menyentuh MikroTik.
                          </p>
                        </div>
                      </label>

                      {/* WhatsApp Notification Checkbox */}
                      <label className="flex items-start gap-2 cursor-pointer text-xs text-admin-text">
                        <input
                          type="checkbox"
                          checked={testSendWhatsapp}
                          onChange={(e) => setTestSendWhatsapp(e.target.checked)}
                          className="mt-0.5 rounded border-admin-border text-admin-accent focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-admin-text">
                            Kirim Notifikasi WhatsApp (Jika LOYALTY_TEST_WHATSAPP=true)
                          </span>
                          <span className="text-[11px] text-admin-muted block">
                            Default: dinonaktifkan untuk melindungi privasi nomor customer.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-5 flex items-center gap-3 flex-wrap pt-3 border-t border-admin-border/50">
                    <button
                      onClick={handleRunLoyaltyTest}
                      disabled={runningTest || resettingTest}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-admin-accent text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Icon name="bolt" className={`w-4 h-4 ${runningTest ? 'animate-spin' : ''}`} />
                      {runningTest ? 'Menjalankan Simulasi...' : 'Run Loyalty Test'}
                    </button>

                    <button
                      onClick={() => handleResetLoyaltyTest(false)}
                      disabled={runningTest || resettingTest}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-admin-base border border-admin-border text-admin-text rounded-lg text-xs font-semibold hover:border-admin-accent transition-all disabled:opacity-50"
                      title="Reset test data untuk nomor ini"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5 text-rose-500" />
                      Reset Test Nomor Ini
                    </button>

                    <button
                      onClick={() => handleResetLoyaltyTest(true)}
                      disabled={runningTest || resettingTest}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                      title="Bersihkan seluruh data test mode"
                    >
                      <Icon name="sync" className={`w-3.5 h-3.5 ${resettingTest ? 'animate-spin' : ''}`} />
                      Reset Semua Test Data
                    </button>
                  </div>

                  {/* Error Message */}
                  {testError && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-between">
                      <span>❌ {testError}</span>
                      <button onClick={() => setTestError(null)} className="text-rose-500">
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Test Result Display */}
                  {testResult && (
                    <div className="mt-4 p-4 bg-admin-base border border-admin-border rounded-xl">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            testResult.target_reached
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}>
                            {testResult.target_reached ? '✓ Target Tercapai' : '○ Target Belum Tercapai'}
                          </span>
                          <span className="text-xs text-admin-muted font-mono">
                            {testResult.phone} ({formatPeriod(testResult.period_key)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            testResult.mode === 'real_mikrotik_test'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {testResult.mode === 'real_mikrotik_test' ? '⚡ REAL MIKROTIK' : '🛡️ MOCK SIMULASI'}
                          </span>
                          {testResult.reward_idempotent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
                              IDEMPOTENT (Voucher Existing)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-medium text-admin-text mb-3">
                        {testResult.message}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-admin-muted">
                            Simulasi Akumulasi: <strong className="text-admin-text font-bold">{formatRupiah(testResult.simulated_total_amount)}</strong>
                          </span>
                          <span className="text-admin-text font-bold">
                            {testResult.progress_percent}% ({formatRupiah(testResult.target_amount)})
                          </span>
                        </div>
                        <div className="w-full bg-admin-card rounded-full h-3 overflow-hidden border border-admin-border">
                          <div
                            className={`h-full transition-all duration-500 ${
                              testResult.target_reached ? 'bg-emerald-500' : 'bg-admin-accent'
                            }`}
                            style={{ width: `${Math.min(testResult.progress_percent, 100)}%` }}
                          />
                        </div>
                        {!testResult.target_reached && (
                          <span className="text-[11px] text-admin-muted mt-1 block">
                            Sisa nominal untuk mencapai target: <strong className="text-admin-text">{formatRupiah(testResult.remaining_amount)}</strong>
                          </span>
                        )}
                      </div>

                      {/* Voucher Generated Card */}
                      {testResult.voucher_code && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Icon name="gift" className="w-4 h-4" />
                              Reward Voucher Otomatis Diterbitkan!
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black font-mono tracking-widest text-admin-text">
                                {testResult.voucher_code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(testResult.voucher_code)
                                  setCopiedRewardCode(testResult.voucher_code)
                                  setTimeout(() => setCopiedRewardCode(null), 2500)
                                }}
                                className="p-1 text-admin-muted hover:text-admin-text"
                                title="Copy kode voucher"
                              >
                                <Icon name="copy" className="w-4 h-4" />
                              </button>
                              {copiedRewardCode === testResult.voucher_code && (
                                <span className="text-[10px] text-emerald-600 font-bold animate-pulse">Tersalin!</span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-admin-muted flex-wrap">
                              <span>Masa Berlaku: <strong className="text-admin-text">{formatDateTime(testResult.expires_at)}</strong> ({testResult.expiry_override})</span>
                              {testResult.mikrotik_id && (
                                <span>ID Router: <strong className="text-admin-text font-mono">{testResult.mikrotik_id}</strong></span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <a
                              href={`/loyalty`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Cek di /loyalty ↗
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Participants Table (FULL RAW PHONE NUMBER - NO MASKING) */}
            <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-admin-text flex items-center gap-2">
                    <Icon name="users" className="w-4 h-4 text-admin-accent" />
                    Data Riil Pembelian Customer Voucher
                    {participants && <span className="text-xs text-admin-muted font-normal ml-1">({participants.total} baris customer-bulan)</span>}
                  </h3>
                  <p className="text-[11px] text-admin-muted mt-0.5">
                    Nomor WhatsApp / HP ditampilkan lengkap (tanpa masking) untuk keperluan identifikasi admin.
                  </p>
                </div>
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
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">No HP / WhatsApp</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">Periode</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">Total Pembelian</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden sm:table-cell">Jumlah Transaksi</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden md:table-cell">Rata-rata/Tx</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden lg:table-cell">Target</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden lg:table-cell">Status Pencapaian</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider">Reward Voucher</th>
                          <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-admin-muted uppercase tracking-wider hidden xl:table-cell">Last Purchase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.data.map((p) => {
                          const targetAmt = p.target_amount || targetAch?.target_amount || ev?.target_amount || 0
                          const qualifies = p.is_target_achieved !== undefined
                            ? p.is_target_achieved
                            : (targetAmt > 0 && p.total_purchase >= targetAmt)

                          return (
                            <tr key={p.id} className="border-b border-admin-border/50 hover:bg-admin-base/20 transition-colors">
                              {/* FULL UNMASKED PHONE NUMBER */}
                              <td className="px-4 py-2.5 font-mono text-xs text-admin-text font-bold tracking-tight">
                                {p.phone || p.masked_phone}
                              </td>
                              <td className="px-4 py-2.5 text-xs text-admin-muted">
                                <span className="px-2 py-0.5 rounded bg-admin-base border border-admin-border/50 font-medium">
                                  {formatPeriod(p.period_key)}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-extrabold text-admin-text text-xs">{formatRupiah(p.total_purchase)}</td>
                              <td className="px-4 py-2.5 text-center text-xs text-admin-muted hidden sm:table-cell">{p.transaction_count}x</td>
                              <td className="px-4 py-2.5 text-right text-xs text-admin-muted hidden md:table-cell">{formatRupiah(p.avg_per_transaction)}</td>
                              <td className="px-4 py-2.5 text-center text-xs text-admin-muted hidden lg:table-cell">
                                {targetAmt > 0 ? formatRupiah(targetAmt) : '-'}
                              </td>
                              <td className="px-4 py-2.5 text-center hidden lg:table-cell">
                                {targetAmt > 0 ? (
                                  qualifies ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <Icon name="check" className="w-3 h-3" />
                                      Capai Target
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-admin-muted">
                                      Belum
                                    </span>
                                  )
                                ) : (
                                  <span className="text-admin-muted opacity-50 text-xs">-</span>
                                )}
                              </td>
                              {/* Reward Voucher Column (Phase 2: Automatic Reward System) */}
                              <td className="px-4 py-2.5 text-center">
                                {p.reward ? (
                                  p.reward.status === 'issued' ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                      <span>{p.reward.voucher_code}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(p.reward.voucher_code)
                                          setCopiedRewardCode(p.reward.voucher_code)
                                          setTimeout(() => setCopiedRewardCode(null), 2000)
                                        }}
                                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                                        title={`Salin kode (Exp: ${p.reward.expires_at || '5 hari'})`}
                                      >
                                        <Icon name={copiedRewardCode === p.reward.voucher_code ? "check" : "copy"} className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : p.reward.status === 'used' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      Terpakai ({p.reward.voucher_code})
                                    </span>
                                  ) : p.reward.status === 'expired' ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-admin-muted">
                                      Expired ({p.reward.voucher_code})
                                    </span>
                                  ) : p.reward.status === 'failed' ? (
                                    <div className="inline-flex items-center gap-1.5 justify-center">
                                      <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 cursor-help"
                                        title={p.reward.error_message || 'Gagal membuat user di MikroTik'}
                                      >
                                        Gagal
                                      </span>
                                      <button
                                        onClick={() => handleRetryReward(p.reward.id)}
                                        disabled={retryingRewardId === p.reward.id}
                                        className="text-[10px] font-bold text-rose-600 underline hover:text-rose-700 disabled:opacity-50"
                                        title="Retry penerbitan reward"
                                      >
                                        {retryingRewardId === p.reward.id ? 'Retrying...' : 'Retry'}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                                      Processing...
                                    </span>
                                  )
                                ) : qualifies ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    Eligible (No Rule)
                                  </span>
                                ) : (
                                  <span className="text-admin-muted opacity-40 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center text-[11px] text-admin-muted hidden xl:table-cell">
                                {p.last_transaction_at ? formatDateTime(p.last_transaction_at) : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {participants.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-admin-border flex items-center justify-between">
                      <span className="text-xs text-admin-muted">
                        Halaman {participants.current_page} dari {participants.last_page} ({participants.total} baris customer-bulan)
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
            <h3 className="font-bold text-admin-text">{editEvent ? 'Edit Program Event' : 'Buat Program Event Permanen'}</h3>
            <button onClick={() => setShowModal(false)} className="text-admin-muted hover:text-admin-text">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Notice */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
              <Icon name="infinity" className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Event bersifat <strong>permanen (tanpa batas waktu)</strong>. Sistem secara otomatis mencatat transaksi riil pembeli voucher hotspot per nomor telepon dan bulan kalender.
              </span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Nama Program Event *</label>
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
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Deskripsi Internal</label>
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
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Target Loyalty / Bulan (Rp)</label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="Contoh: 100000"
                  className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent"
                />
                <p className="text-[10px] text-admin-muted mt-1">Syarat target nominal belanja per bulan</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">Status Tracking</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text focus:outline-none focus:border-admin-accent"
                >
                  <option value="active">Active (Tracking Real-Time Aktif)</option>
                  <option value="inactive">Inactive (Tracking Dihentikan)</option>
                </select>
                <p className="text-[10px] text-admin-muted mt-1">Data historis tetap aman saat inactive</p>
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
              {saving ? 'Menyimpan...' : (editEvent ? 'Update' : 'Buat Program')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // RENDER: REWARD RULE MODAL (PHASE 2)
  // ==========================================
  const renderRuleModal = () => {
    if (!showRuleModal) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRuleModal(false)} />
        <div className="relative bg-admin-card border border-admin-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-admin-border flex items-center justify-between">
            <h3 className="font-bold text-admin-text">
              {editRule ? 'Edit Reward Rule' : 'Tambah Reward Rule Otomatis'}
            </h3>
            <button onClick={() => setShowRuleModal(false)} className="text-admin-muted hover:text-admin-text">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Informational Banner */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <Icon name="gift" className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <strong>Reward Otomatis & Terintegrasi MikroTik:</strong>
                <p className="mt-0.5 opacity-90">
                  Target nominal belanja sepenuhnya mengikuti <strong>events.target_amount</strong> ({formatRupiah(analytics?.event?.target_amount || 0)}). Ketika rule disimpan atau diaktifkan, seluruh customer yang sudah mencapai target akan otomatis diterbitkan vouchernya ke MikroTik.
                </p>
              </div>
            </div>

            {/* Reward Name */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">
                Nama Reward *
              </label>
              <input
                type="text"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                placeholder="Contoh: Free Internet 7 Hari Unlimited"
                className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent"
              />
              {ruleErrors.name && <p className="text-rose-500 text-xs mt-1">{ruleErrors.name}</p>}
            </div>

            {/* Voucher Plan Picker */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">
                Pilih Paket Voucher (Master Data) *
              </label>
              <select
                value={ruleFormData.voucher_plan_id}
                onChange={(e) => setRuleFormData({ ...ruleFormData, voucher_plan_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text focus:outline-none focus:border-admin-accent"
              >
                <option value="">-- Pilih Paket Voucher --</option>
                {voucherPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.duration ? `(${plan.duration})` : ''} - Profil MikroTik: {plan.mikrotik_profile || plan.name} {plan.price ? `[Harga Normal: ${formatRupiah(plan.price)}]` : ''}
                  </option>
                ))}
              </select>
              {ruleErrors.voucher_plan_id && <p className="text-rose-500 text-xs mt-1">{ruleErrors.voucher_plan_id}</p>}
              <p className="text-[10px] text-admin-muted mt-1">
                Voucher reward akan diterbitkan ke router MikroTik dengan profil dan uptime limit dari paket yang dipilih.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">
                Deskripsi / Syarat Tambahan (Opsional)
              </label>
              <textarea
                value={ruleFormData.description}
                onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                placeholder="Catatan internal atau deskripsi reward..."
                rows={2}
                className="w-full px-3 py-2.5 bg-admin-base border border-admin-border rounded-lg text-sm text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-accent resize-none"
              />
            </div>

            {/* Active Toggle & Expiry Info */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-admin-border/50">
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">
                  Masa Berlaku Voucher
                </label>
                <div className="px-3 py-2 bg-admin-base border border-admin-border rounded-lg text-xs font-bold text-admin-text">
                  5 Hari sejak diterbitkan
                </div>
                <p className="text-[10px] text-admin-muted mt-0.5">Otomatis kadaluwarsa di DB & MikroTik</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1.5">
                  Status Rule
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleFormData.is_active}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-admin-accent rounded border-admin-border focus:ring-admin-accent"
                  />
                  <span className="text-xs font-semibold text-admin-text">
                    {ruleFormData.is_active ? 'Aktif (Auto-Issue)' : 'Nonaktif'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-admin-border flex justify-end gap-2">
            <button
              onClick={() => setShowRuleModal(false)}
              className="px-4 py-2 text-sm font-medium text-admin-muted hover:text-admin-text transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveRule}
              disabled={savingRule}
              className="px-5 py-2 bg-admin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {savingRule ? 'Menyimpan & Memproses...' : (editRule ? 'Update Rule' : 'Simpan & Aktifkan')}
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
      {renderRuleModal()}
    </div>
  )
}
