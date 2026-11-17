import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [alertMsg, setAlertMsg] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'maintenance',
    message: '',
    start_time: '',
    end_time: '',
    expires_at: '',
    is_active: true,
    dismissible: true
  })

  const token = localStorage.getItem('token')

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setAnnouncements(res.data.data)
      }
    } catch (err) {
      console.error('Fetch announcements error:', err)
      setAlertMsg({ type: 'error', text: 'Gagal memuat daftar pengumuman' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'maintenance',
      message: '',
      start_time: '',
      end_time: '',
      expires_at: '',
      is_active: true,
      dismissible: true
    })
    setEditingItem(null)
  }

  const formatForInput = (val) => {
    if (!val) return ''
    if (typeof val === 'string') {
      if (val.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(val)) {
        const d = new Date(val)
        const pad = (n) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
      return val.replace(' ', 'T').substring(0, 16)
    }
    const d = new Date(val)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const openCreateModal = () => {
    resetForm()
    // Default preset: Maintenance 1 jam lagi
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    const later = new Date(now.getTime() + 3 * 60 * 60 * 1000)

    setFormData({
      title: 'Pemeliharaan Jaringan WiFi & Server',
      type: 'maintenance',
      message: 'Kami akan melakukan peningkatan perangkat dan pemeliharaan server untuk mengoptimalkan kecepatan internet. Selama periode ini, koneksi hotspot mungkin mengalami gangguan sesaat.',
      start_time: formatForInput(now),
      end_time: formatForInput(later),
      expires_at: formatForInput(later),
      is_active: true,
      dismissible: true
    })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)

    setFormData({
      title: item.title,
      type: item.type,
      message: item.message,
      start_time: formatForInput(item.start_time),
      end_time: formatForInput(item.end_time),
      expires_at: formatForInput(item.expires_at),
      is_active: Boolean(item.is_active),
      dismissible: Boolean(item.dismissible)
    })
    setShowModal(true)
  }

  const handleEndTimeChange = (val) => {
    setFormData(prev => ({
      ...prev,
      end_time: val,
      // Auto-update expires_at to match end_time by default
      expires_at: (!prev.expires_at || prev.expires_at === prev.end_time) ? val : prev.expires_at
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setAlertMsg(null)

    try {
      const formatToDb = (val) => {
        if (!val) return null
        return val.replace('T', ' ') + (val.length === 16 ? ':00' : '')
      }

      const payload = {
        ...formData,
        start_time: formatToDb(formData.start_time),
        end_time: formatToDb(formData.end_time),
        expires_at: formatToDb(formData.expires_at) || formatToDb(formData.end_time),
      }

      if (editingItem) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/announcements/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAlertMsg({ type: 'success', text: 'Pengumuman berhasil diperbarui' })
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/announcements`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAlertMsg({ type: 'success', text: 'Pengumuman baru berhasil diterbitkan' })
      }

      setShowModal(false)
      resetForm()
      fetchAnnouncements()
    } catch (err) {
      console.error('Submit announcement error:', err)
      const msg = err.response?.data?.message || 'Gagal menyimpan pengumuman'
      setAlertMsg({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/announcements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAnnouncements()
    } catch (err) {
      console.error('Toggle error:', err)
      alert('Gagal mengubah status pengumuman')
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Yakin ingin menghapus pengumuman "${title}"?`)) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlertMsg({ type: 'success', text: 'Pengumuman berhasil dihapus' })
      fetchAnnouncements()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Gagal menghapus pengumuman')
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'maintenance':
        return { label: 'Pemeliharaan Jaringan', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: 'fa-tools' }
      case 'warning':
        return { label: 'Peringatan / Gangguan', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: 'fa-exclamation-triangle' }
      case 'promo':
        return { label: 'Promo & Event', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: 'fa-gift' }
      default:
        return { label: 'Informasi Penting', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', icon: 'fa-info-circle' }
    }
  }

  const parseSafeDate = (v) => {
    if (!v) return null
    if (typeof v === 'string') {
      if (v.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(v)) {
        return new Date(v)
      }
      return new Date(v.replace(' ', 'T'))
    }
    return new Date(v)
  }

  const formatSchedule = (start, end) => {
    if (!start) return 'Tanpa jadwal spesifik (Tampil terus sampai dinonaktifkan)'
    const s = parseSafeDate(start)
    if (!s || isNaN(s.getTime())) return start

    const optionsDate = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
    const dateStr = s.toLocaleDateString('id-ID', optionsDate)
    const startTime = s.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    if (end) {
      const e = parseSafeDate(end)
      if (e && !isNaN(e.getTime())) {
        const endTime = e.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        return `${dateStr}, ${startTime} - ${endTime} WIB`
      }
    }
    return `${dateStr}, mulai ${startTime} WIB`
  }

  const isExpired = (exp) => {
    if (!exp) return false
    const d = parseSafeDate(exp)
    if (!d || isNaN(d.getTime())) return false
    return d <= new Date()
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-1.5">
            <i className="fas fa-bullhorn text-cyan-400" />
            <span>PUSAT PENGUMUMAN & INFORMASI PORTAL</span>
          </div>
          <h1 className="text-2xl font-black text-admin-text tracking-tight flex items-center gap-2.5">
            <span>Informasi & Maintenance Notice</span>
          </h1>
          <p className="text-xs text-admin-muted mt-0.5">
            Tampilkan pesan jadwal pemeliharaan jaringan, pengumuman gangguan, atau info penting di halaman utama login hotspot. Otomatis hilang saat waktu berakhir.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnnouncements}
            className="px-3.5 py-2.5 bg-admin-card border border-admin-border text-admin-text text-xs font-bold rounded-xl hover:bg-admin-base transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            title="Muat Ulang"
          >
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus" />
            <span>Tambah Pengumuman</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <i className={`fas ${alertMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} />
            <span>{alertMsg.text}</span>
          </div>
          <button type="button" onClick={() => setAlertMsg(null)} className="text-current opacity-70 hover:opacity-100 cursor-pointer">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Auto-expire Feature Callout */}
      <div className="p-4 rounded-2xl bg-admin-card border border-admin-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
            <i className="fas fa-magic" />
          </div>
          <div>
            <h4 className="text-xs font-black text-admin-text">Otomatis Bersih & Hilang Sendiri</h4>
            <p className="text-[11px] text-admin-muted mt-0.5">
              Pengumuman yang sudah melewati jam selesai atau waktu batas kedaluwarsa akan langsung otomatis dihapus dari sistem sehingga halaman utama portal selalu bersih tanpa perlu Anda hapus manual.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap hidden sm:inline-flex items-center gap-1">
          <i className="fas fa-check" /> Auto-Expire Aktif
        </span>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {loading && announcements.length === 0 ? (
          <div className="p-12 text-center text-admin-muted text-xs bg-admin-card rounded-2xl border border-admin-border">
            <i className="fas fa-sync fa-spin text-lg mb-2 text-cyan-400 block" />
            Memuat pengumuman...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center bg-admin-card rounded-2xl border border-admin-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg mx-auto mb-3">
              <i className="fas fa-bullhorn" />
            </div>
            <h3 className="text-sm font-black text-admin-text mb-1">Belum Ada Pengumuman Aktif</h3>
            <p className="text-xs text-admin-muted max-w-md mx-auto mb-4">
              Saat ini tidak ada peringatan maintenance atau informasi yang tampil di halaman utama hotspot. Klik tombol di bawah untuk membuat pengumuman baru.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-plus" />
              <span>Buat Pengumuman Maintenance Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {announcements.map((item) => {
              const badge = getTypeBadge(item.type)
              const expired = isExpired(item.expires_at)

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-admin-card border transition-all ${
                    !item.is_active || expired
                      ? 'border-admin-border/50 opacity-60'
                      : 'border-admin-border hover:border-cyan-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 mt-0.5 ${badge.color}`}>
                        <i className={`fas ${badge.icon}`} />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          
                          {item.is_active ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ● Aktif di Portal
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              Nonaktif
                            </span>
                          )}

                          {expired && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Waktu Lewat (Akan terhapus)
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-black text-admin-text tracking-tight">
                          {item.title}
                        </h3>

                        <p className="text-xs text-admin-muted leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] text-admin-muted">
                          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                            <i className="fas fa-clock text-[10px]" />
                            <span>{formatSchedule(item.start_time, item.end_time)}</span>
                          </div>

                          {item.dismissible ? (
                            <span className="text-slate-400">
                              <i className="fas fa-times-circle text-[10px] mr-1 text-slate-500" /> Bisa ditutup user
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold">
                              <i className="fas fa-lock text-[10px] mr-1" /> Wajib tampil (tidak bisa ditutup)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-admin-border/50">
                      <div className="flex items-center gap-2">
                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            item.is_active
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
                          }`}
                          title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <i className={`fas ${item.is_active ? 'fa-eye' : 'fa-eye-slash'} mr-1`} />
                          <span>{item.is_active ? 'Aktif' : 'Off'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-admin-base border border-admin-border text-admin-muted hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
                          title="Edit Pengumuman"
                        >
                          <i className="fas fa-pencil-alt text-xs" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg bg-admin-base border border-admin-border text-admin-muted hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <i className="fas fa-trash text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-admin-card border border-admin-border rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-admin-border mb-4">
              <div>
                <h3 className="text-base font-black text-admin-text flex items-center gap-2">
                  <i className="fas fa-bullhorn text-amber-500" />
                  <span>{editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}</span>
                </h3>
                <p className="text-xs text-admin-muted mt-0.5">
                  Pesan ini akan langsung muncul di halaman login warkop / hotspot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-admin-base hover:bg-admin-border text-admin-muted hover:text-admin-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipe Pengumuman */}
              <div>
                <label className="block text-xs font-bold text-admin-muted uppercase tracking-wider mb-1.5">
                  Kategori Pengumuman
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'maintenance', label: '🛠️ Maintenance', desc: 'Pemeliharaan' },
                    { val: 'warning', label: '⚠️ Gangguan', desc: 'Peringatan' },
                    { val: 'info', label: 'ℹ️ Info Portal', desc: 'Pengumuman' },
                    { val: 'promo', label: '🎁 Promo', desc: 'Event / Diskon' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.val })}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                        formData.type === t.val
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-admin-base border-admin-border text-admin-muted hover:text-admin-text'
                      }`}
                    >
                      <div className="leading-tight">{t.label}</div>
                      <span className="text-[10px] opacity-70 font-normal">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-xs font-bold text-admin-muted uppercase tracking-wider mb-1.5">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Pemeliharaan Jaringan WiFi & Server"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-admin-base border border-admin-border text-admin-text text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pesan */}
              <div>
                <label className="block text-xs font-bold text-admin-muted uppercase tracking-wider mb-1.5">
                  Pesan Pengumuman untuk Pelanggan
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tuliskan keterangan detail untuk pengunjung warkop / pelanggan hotspot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-admin-base border border-admin-border text-admin-text text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Jadwal Mulai & Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-admin-muted uppercase tracking-wider mb-1.5">
                    Jadwal Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-admin-base border border-admin-border text-admin-text text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-admin-muted uppercase tracking-wider mb-1.5">
                    Jadwal Selesai & Otomatis Hilang
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-admin-base border border-admin-border text-admin-text text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Begitu jam ini terlewati, pengumuman otomatis hilang dari portal.
                  </span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 border-t border-admin-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded bg-admin-base border-admin-border text-amber-500 focus:ring-0"
                  />
                  <span className="text-admin-text font-bold">Aktifkan Sekarang</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="rounded bg-admin-base border-admin-border text-amber-500 focus:ring-0"
                  />
                  <span className="text-admin-muted">Pelanggan bisa menutup banner (X)</span>
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-admin-border/50">
                <span className="text-[10px] font-bold text-admin-muted uppercase tracking-wider block mb-2">
                  Pratinjau Tampilan di Halaman Utama (Live Preview):
                </span>
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                    <i className="fas fa-tools" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-400 text-amber-950">
                        {formData.type.toUpperCase()}
                      </span>
                      <strong className="text-xs font-black text-amber-300 truncate">
                        {formData.title || 'Judul Pengumuman'}
                      </strong>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-tight">
                      {formData.message || 'Pesan pengumuman...'}
                    </p>
                    {formData.start_time && formData.end_time && (
                      <div className="text-[10px] text-amber-400 font-bold mt-1">
                        ⏰ Jadwal: {formatSchedule(formData.start_time, formData.end_time)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-admin-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-admin-base hover:bg-admin-border text-admin-text text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-save" />
                  <span>{submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Terbitkan Pengumuman')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
