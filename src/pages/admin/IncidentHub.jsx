import { useState, useEffect } from 'react';
import axios from 'axios';

const Icon = ({ name, className = "w-4 h-4" }) => {
  const icons = {
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    alertCircle: <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    whatsapp: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    creditCard: <path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22" />,
    server: <path d="M2 2h20v8H2V2zm0 12h20v8H2v-8zm4-8h.01M6 18h.01" />,
    check: <path d="M20 6L9 17l-5-5" />,
    trash: <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />,
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    chevronDown: <path d="M19 9l-7 7-7-7" />,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.alertCircle}
    </svg>
  );
};

export default function IncidentHub() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    unresolved_count: 0,
    critical_count: 0,
    today_count: 0,
    whatsapp_failed_count: 0,
    fraud_count: 0,
    mikrotik_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('unresolved');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchIncidents = async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/incidents`, {
        params: {
          page: p,
          status: selectedStatus,
          category: selectedCategory,
          severity: selectedSeverity,
          search: search || undefined,
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setIncidents(res.data.incidents.data || []);
        setStats(res.data.stats || {});
        setTotalPages(res.data.incidents.last_page || 1);
        setPage(res.data.incidents.current_page || 1);
      }
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(1);
  }, [selectedStatus, selectedCategory, selectedSeverity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents(1);
  };

  const handleResolve = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/incidents/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ type: 'success', text: 'Insiden berhasil ditandai selesai.' });
      fetchIncidents(page);
    } catch (err) {
      setNotification({ type: 'error', text: 'Gagal menyelesaikan insiden.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/incidents/${id}/retry`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotification({ type: 'success', text: res.data.message });
      } else {
        setNotification({ type: 'error', text: res.data.message });
      }
      fetchIncidents(page);
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.message || 'Gagal mengeksekusi retry.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus log insiden ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchIncidents(page);
    } catch (err) {
      alert('Gagal menghapus insiden.');
    }
  };

  const handleResolveAll = async () => {
    if (!confirm(`Selesaikan semua insiden ${selectedCategory !== 'all' ? `kategori ${selectedCategory}` : ''}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/incidents/resolve-all`, {
        category: selectedCategory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ type: 'success', text: 'Semua insiden terkait berhasil diselesaikan.' });
      fetchIncidents(1);
    } catch (err) {
      setNotification({ type: 'error', text: 'Gagal menyelesaikan insiden.' });
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'whatsapp':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><Icon name="whatsapp" className="w-3 h-3" /> WhatsApp</span>;
      case 'payment_fraud':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20"><Icon name="shield" className="w-3 h-3" /> Fraud / Payment</span>;
      case 'mikrotik':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"><Icon name="server" className="w-3 h-3" /> MikroTik</span>;
      case 'billing':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Icon name="creditCard" className="w-3 h-3" /> Billing</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><Icon name="alertCircle" className="w-3 h-3" /> System</span>;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500 text-white tracking-widest shadow-[0_0_8px_rgba(244,63,94,0.4)]">CRITICAL</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-white tracking-widest">WARNING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-400">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-admin-text tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Icon name="shield" className="w-6 h-6" />
              </span>
              Fraud & Incident Command Center
            </h1>
            {stats.critical_count > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {stats.critical_count} CRITICAL
              </span>
            )}
          </div>
          <p className="text-xs text-admin-muted mt-1">
            Pusat kendali otomatis seluruh kegagalan backend, percobaan fraud checkout, error pengiriman WhatsApp, dan router MikroTik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchIncidents(page)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-admin-card text-admin-text border border-admin-border hover:bg-admin-base transition flex items-center gap-1.5"
          >
            <Icon name="refresh" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {stats.unresolved_count > 0 && (
            <button
              onClick={handleResolveAll}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-admin-base text-admin-muted hover:text-admin-text border border-admin-border transition flex items-center gap-1.5"
            >
              <Icon name="check" className="w-3.5 h-3.5" />
              Selesaikan Semua
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-admin-card border border-admin-border p-4 rounded-2xl relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase text-admin-muted tracking-wider">Insiden Belum Selesai</div>
          <div className="text-2xl md:text-3xl font-black text-rose-500 mt-1">
            {stats.unresolved_count}
          </div>
          <div className="text-[10px] text-admin-muted mt-0.5">Membutuhkan tindakan admin</div>
        </div>

        <div className="bg-admin-card border border-admin-border p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase text-admin-muted tracking-wider flex items-center gap-1">
            <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-500" />
            WhatsApp Gagal
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-500 mt-1">
            {stats.whatsapp_failed_count}
          </div>
          <div className="text-[10px] text-admin-muted mt-0.5">Siap dikirim ulang via tombol retry</div>
        </div>

        <div className="bg-admin-card border border-admin-border p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase text-admin-muted tracking-wider flex items-center gap-1">
            <Icon name="shield" className="w-3.5 h-3.5 text-rose-500" />
            Percobaan Fraud / Bayar
          </div>
          <div className="text-2xl md:text-3xl font-black text-rose-500 mt-1">
            {stats.fraud_count}
          </div>
          <div className="text-[10px] text-admin-muted mt-0.5">Fake webhook / nominal mismatch</div>
        </div>

        <div className="bg-admin-card border border-admin-border p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase text-admin-muted tracking-wider flex items-center gap-1">
            <Icon name="server" className="w-3.5 h-3.5 text-indigo-500" />
            MikroTik / Isolasi Gagal
          </div>
          <div className="text-2xl md:text-3xl font-black text-indigo-400 mt-1">
            {stats.mikrotik_count}
          </div>
          <div className="text-[10px] text-admin-muted mt-0.5">Router unreachable / user disable</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-admin-card border border-admin-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-admin-base rounded-xl border border-admin-border w-full md:w-auto">
          <button
            onClick={() => setSelectedStatus('unresolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStatus === 'unresolved' ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-muted hover:text-admin-text'
            }`}
          >
            Aktif (Unresolved)
          </button>
          <button
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStatus === 'resolved' ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-muted hover:text-admin-text'
            }`}
          >
            Selesai (Resolved)
          </button>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStatus === 'all' ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-muted hover:text-admin-text'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold rounded-xl border-admin-border bg-admin-base text-admin-text py-2"
          >
            <option value="all">Semua Kategori</option>
            <option value="whatsapp">Khusus WhatsApp Gagal</option>
            <option value="payment_fraud">Khusus Fraud & Pembayaran</option>
            <option value="mikrotik">Khusus MikroTik / Jaringan</option>
            <option value="billing">Khusus Billing / Tempo</option>
            <option value="system">Khusus Error Sistem / Crash</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="search"
              placeholder="Cari nomor HP, Order ID, error..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border-admin-border bg-admin-base text-admin-text pl-8 py-2"
            />
            <Icon name="search" className="w-3.5 h-3.5 text-admin-muted absolute left-2.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-admin-muted text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-admin-muted border-t-transparent rounded-full animate-spin"></div>
            Memuat data insiden...
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center text-admin-muted text-xs space-y-1">
            <div className="text-2xl">🛡️</div>
            <div className="font-bold text-admin-text">Sistem Bersih & Aman</div>
            <div>Tidak ada insiden atau error yang ditemukan pada filter ini.</div>
          </div>
        ) : (
          <div className="divide-y divide-admin-border">
            {incidents.map((inc) => {
              const isExpanded = expandedId === inc.id;
              const hasPayload = inc.payload && Object.keys(inc.payload).length > 0;

              return (
                <div key={inc.id} className="p-4 hover:bg-admin-base/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Indicator & Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getSeverityBadge(inc.severity)}
                        {getCategoryBadge(inc.category)}
                        <span className="text-[10px] text-admin-muted">
                          {new Date(inc.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                        {inc.status === 'resolved' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500">
                            ✓ SELESAI ({inc.resolved_by || 'Admin'})
                          </span>
                        )}
                        {inc.status === 'retried' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400">
                            ✓ SUDAH DI-RETRY
                          </span>
                        )}
                      </div>

                      <div className="font-black text-sm text-admin-text tracking-tight truncate">
                        {inc.title}
                      </div>

                      <p className="text-xs text-admin-muted leading-relaxed line-clamp-2">
                        {inc.message}
                      </p>

                      {/* Context Chips (Phone, Order ID, etc) */}
                      {hasPayload && (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {inc.payload.phone && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-admin-base text-admin-text border border-admin-border">
                              📱 {inc.payload.phone}
                            </span>
                          )}
                          {inc.payload.customer_name && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-admin-base text-admin-text border border-admin-border">
                              👤 {inc.payload.customer_name}
                            </span>
                          )}
                          {inc.payload.order_id && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-admin-base text-admin-text border border-admin-border">
                              🆔 {inc.payload.order_id}
                            </span>
                          )}
                          {inc.payload.gross_amount && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-admin-base text-emerald-500 border border-admin-border">
                              💰 Rp {Number(inc.payload.gross_amount).toLocaleString('id-ID')}
                            </span>
                          )}
                          {inc.payload.ip_address && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-admin-base text-rose-400 border border-admin-border">
                              🌐 IP: {inc.payload.ip_address}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                      {/* Retry Action Button */}
                      {inc.action_type === 'retry_whatsapp' && inc.status === 'unresolved' && (
                        <button
                          onClick={() => handleRetry(inc.id)}
                          disabled={actionLoading === inc.id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        >
                          <Icon name="whatsapp" className="w-3.5 h-3.5" />
                          {actionLoading === inc.id ? 'Mengirim...' : 'Kirim Ulang WA'}
                        </button>
                      )}

                      {inc.action_type === 'manual_isolate' && inc.status === 'unresolved' && (
                        <button
                          onClick={() => handleRetry(inc.id)}
                          disabled={actionLoading === inc.id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        >
                          <Icon name="server" className="w-3.5 h-3.5" />
                          {actionLoading === inc.id ? 'Memproses...' : 'Isolir Ulang'}
                        </button>
                      )}

                      {/* Resolve Button */}
                      {inc.status === 'unresolved' && (
                        <button
                          onClick={() => handleResolve(inc.id)}
                          disabled={actionLoading === inc.id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-admin-base hover:bg-admin-card text-admin-text border border-admin-border transition active:scale-95"
                          title="Tandai masalah ini sudah selesai ditangani"
                        >
                          <Icon name="check" className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Technical Detail Expand Button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          isExpanded ? 'bg-admin-base text-admin-text border-admin-border' : 'text-admin-muted hover:text-admin-text border-transparent'
                        }`}
                        title="Lihat detail teknis / stacktrace"
                      >
                        <Icon name="chevronDown" className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Delete Log Button */}
                      <button
                        onClick={() => handleDelete(inc.id)}
                        className="p-2 text-admin-muted hover:text-rose-500 transition-colors"
                        title="Hapus log"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Technical Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-admin-border space-y-2 text-xs animate-fadeIn">
                      {inc.technical_details && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-admin-muted block mb-1">Detail Teknis / Error Gateway:</span>
                          <pre className="p-3 rounded-xl bg-black/40 text-rose-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                            {inc.technical_details}
                          </pre>
                        </div>
                      )}

                      {hasPayload && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-admin-muted block mb-1">Raw Payload Data:</span>
                          <pre className="p-3 rounded-xl bg-black/40 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                            {JSON.stringify(inc.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-admin-border flex items-center justify-between text-xs text-admin-muted">
            <span>Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => fetchIncidents(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-admin-border disabled:opacity-30 hover:bg-admin-base transition"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchIncidents(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-admin-border disabled:opacity-30 hover:bg-admin-base transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}