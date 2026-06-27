import { useState, useEffect } from 'react'
import axios from 'axios'

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    olt: <path d="M2 17h20M2 12h20M2 7h20M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    onu: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    signal: <path d="M12 20v-6M6 20V10M18 20V4" />,
    sync: <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" />,
    plus: <path d="M12 5v14M5 12h14" />,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const NetworkCenter = () => {
  const [olts, setOlts] = useState([])
  const [selectedOlt, setSelectedOlt] = useState(null)
  const [nodes, setNodes] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchOlts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/olt`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setOlts(res.data.data || res.data)
      if ((res.data.data || res.data).length > 0 && !selectedOlt) {
        setSelectedOlt((res.data.data || res.data)[0])
      }
    } catch (err) {
      console.error('Failed to fetch OLTs')
    }
  }

  const fetchNodes = async (oltId) => {
    setLoading(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/olt/${oltId}/onu`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setNodes(res.data.data || [])
      setMeta(res.data.meta || null)
    } catch (err) {
      console.error('Failed to fetch nodes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOlts()
  }, [])

  useEffect(() => {
    if (selectedOlt) {
      fetchNodes(selectedOlt.id)
    }
  }, [selectedOlt])

  const handleSync = async () => {
    if (!selectedOlt) return
    setSyncing(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/olt/${selectedOlt.id}/sync`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchNodes(selectedOlt.id)
    } catch (err) {
      alert('Gagal sinkronisasi OLT')
    } finally {
      setSyncing(false)
    }
  }

  const getSignalColor = (signal) => {
    if (signal === null || signal === undefined) return 'text-slate-500'
    if (signal >= -20) return 'text-emerald-600'
    if (signal >= -25) return 'text-yellow-600'
    return 'text-rose-600'
  }
  
  const getSignalBgColor = (signal) => {
    if (signal === null || signal === undefined) return 'bg-slate-50'
    if (signal >= -20) return 'bg-emerald-50'
    if (signal >= -25) return 'bg-yellow-50'
    return 'bg-rose-50'
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-admin-text tracking-tight uppercase leading-none">Network Monitoring Center</h1>
          <p className="text-admin-muted font-bold text-[10px] uppercase tracking-widest mt-2">Remote management ONU/ONT via GPON OLT Core</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-indigo-600 text-admin-text px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Icon name="sync" className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> 
            {syncing ? 'Processing...' : 'Sync Sekarang'}
          </button>
        </div>
      </div>

      {/* OLT Selector Bar */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {olts.map(olt => (
          <button
            key={olt.id}
            onClick={() => setSelectedOlt(olt)}
            className={`flex items-center gap-4 px-8 py-5 rounded-3xl border-2 transition-all shrink-0 ${selectedOlt?.id === olt.id ? 'bg-indigo-600 border-indigo-600 text-admin-text shadow-xl shadow-indigo-200' : 'bg-admin-card border-admin-border text-admin-muted hover:border-indigo-200'}`}
          >
            <Icon name="olt" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight leading-none">{olt.name}</p>
              <p className={`text-[9px] font-bold mt-1 ${selectedOlt?.id === olt.id ? 'text-indigo-100' : 'text-admin-muted'}`}>{olt.ip_address}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {meta && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-admin-card border border-admin-border p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-admin-muted">Total ONU</p>
            <p className="text-2xl font-black text-admin-text mt-2">{meta.total || 0}</p>
          </div>
          <div className="bg-admin-card border border-emerald-500/20 p-6 rounded-3xl shadow-sm bg-emerald-500/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">ONU Online</p>
            <p className="text-2xl font-black text-emerald-600 mt-2">{meta.online || 0}</p>
          </div>
          <div className="bg-admin-card border border-rose-500/20 p-6 rounded-3xl shadow-sm bg-rose-500/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">ONU Offline</p>
            <p className="text-2xl font-black text-rose-600 mt-2">{meta.offline || 0}</p>
          </div>
          <div className="bg-admin-card border border-admin-border p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-admin-muted">Terakhir Diperbarui</p>
            <p className="text-xs font-bold text-admin-text mt-2">{meta.last_synced_at ? new Date(meta.last_synced_at).toLocaleString() : 'Belum pernah'}</p>
          </div>
        </div>
      )}

      {/* Main Monitoring Table */}
      <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
        <div className="px-10 py-8 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-admin-text rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Icon name="onu" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-admin-text leading-tight uppercase tracking-tight">Daftar Perangkat Pelanggan</h2>
              <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest mt-1">Terhubung ke {selectedOlt?.name || 'OLT'}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-base border-b border-admin-border">
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Serial Number / SN</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Status & Deskripsi</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Sinyal (dBm)</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Kualitas Sinyal</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Last Seen / Pelanggan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center font-bold text-admin-muted">Loading network telemetry...</td></tr>
              ) : nodes.length > 0 ? nodes.map(node => (
                <tr key={node.id} className="hover:bg-admin-base/80 transition-colors">
                  <td className="px-10 py-6">
                    <span className="font-mono font-black text-sm text-admin-text bg-admin-base px-3 py-1.5 rounded-lg border border-admin-border">
                      {node.serial_number}
                    </span>
                    <p className="text-[9px] font-bold text-admin-muted uppercase tracking-widest mt-2">INDEX: {node.onu_index}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500 animate-pulse' : node.status === 'offline' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${node.status === 'online' ? 'text-emerald-600' : node.status === 'offline' ? 'text-rose-600' : 'text-slate-500'}`}>
                        {node.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-admin-text">{node.description || '-'}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className={`text-xl font-black italic tracking-tighter ${getSignalColor(node.last_signal)}`}>
                      {node.last_signal !== null ? node.last_signal : '-'} <span className="text-[10px] text-admin-muted font-bold not-italic tracking-widest uppercase">dBm</span>
                    </p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getSignalBgColor(node.last_signal)} ${getSignalColor(node.last_signal)}`}>
                      {node.signal_quality || 'Tidak Diketahui'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    {node.customer ? (
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="users" className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-black text-admin-text">{node.customer.name}</span>
                        {node.customer.whatsapp && <span className="text-[9px] text-admin-muted font-mono bg-admin-base px-2 py-0.5 rounded-md">{node.customer.whatsapp}</span>}
                      </div>
                    ) : (
                      <p className="text-[9px] font-bold text-admin-muted uppercase tracking-widest mb-2">Unassigned</p>
                    )}
                    <p className="text-[9px] font-bold text-admin-muted uppercase tracking-widest">
                      Seen: {node.last_seen_at ? new Date(node.last_seen_at).toLocaleString() : 'N/A'}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-10 py-32 text-center text-admin-muted font-bold italic uppercase tracking-widest">Belum ada data ONU. Klik "Sync Sekarang" untuk sinkronisasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NetworkCenter
