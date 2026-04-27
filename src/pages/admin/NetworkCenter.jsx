import { useState, useEffect } from 'react'
import axios from 'axios'

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    olt: <path d="M2 17h20M2 12h20M2 7h20M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    onu: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    signal: <path d="M12 20v-6M6 20V10M18 20V4" />,
    temp: <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />,
    reboot: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />,
    edit: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
    sync: <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" />,
    plus: <path d="M12 5v14M5 12h14" />
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
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showAddOlt, setShowAddOlt] = useState(false)
  const [newOlt, setNewOlt] = useState({ name: '', ip_address: '', username: '', password: '', type: 'global' })

  const fetchOlts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/network/olts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setOlts(res.data)
      if (res.data.length > 0 && !selectedOlt) {
        setSelectedOlt(res.data[0])
      }
    } catch (err) {
      console.error('Failed to fetch OLTs')
    }
  }

  const fetchNodes = async (oltId) => {
    setLoading(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/network/olts/${oltId}/nodes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setNodes(res.data)
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
      await axios.post(`${import.meta.env.VITE_API_URL}/network/olts/${selectedOlt.id}/sync`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchNodes(selectedOlt.id)
    } catch (err) {
      alert('Gagal sinkronisasi OLT')
    } finally {
      setSyncing(false)
    }
  }

  const handleReboot = async (nodeId) => {
    if (!confirm('Reboot perangkat ini? Koneksi pelanggan akan terputus sementara.')) return
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/network/nodes/${nodeId}/reboot`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.data.success) alert('Perintah reboot berhasil dikirim')
    } catch (err) {
      alert('Gagal mengirim perintah reboot')
    }
  }

  const handleRename = async (nodeId, oldAlias) => {
    const newAlias = prompt('Ganti nama/alias perangkat:', oldAlias || '')
    if (newAlias === null) return
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/network/nodes/${nodeId}`, { alias: newAlias }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchNodes(selectedOlt.id)
    } catch (err) {
      alert('Gagal update nama')
    }
  }

  const handleAddOlt = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/network/olts`, newOlt, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setShowAddOlt(false)
      fetchOlts()
    } catch (err) {
      alert('Gagal menambah OLT')
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Network Monitoring Center</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Remote management ONU/ONT via GPON OLT Core</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddOlt(true)}
            className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Icon name="plus" className="w-4 h-4" /> Tambah OLT
          </button>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Icon name="sync" className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Scan ONU Baru
          </button>
        </div>
      </div>

      {/* OLT Selector Bar */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {olts.map(olt => (
          <button
            key={olt.id}
            onClick={() => setSelectedOlt(olt)}
            className={`flex items-center gap-4 px-8 py-5 rounded-3xl border-2 transition-all shrink-0 ${selectedOlt?.id === olt.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
          >
            <Icon name="olt" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight leading-none">{olt.name}</p>
              <p className={`text-[9px] font-bold mt-1 ${selectedOlt?.id === olt.id ? 'text-indigo-100' : 'text-slate-400'}`}>{olt.ip_address}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Monitoring Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Icon name="onu" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Daftar Perangkat Pelanggan</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total ONU: {nodes.length} | Terhubung ke {selectedOlt?.name}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas / Alias</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Index OLT</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kesehatan (Sinyal/Suhu)</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status & Client</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi Remote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center font-bold text-slate-400">Loading network telemetry...</td></tr>
              ) : nodes.length > 0 ? nodes.map(node => (
                <tr key={node.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${node.status === 'online' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {node.alias ? node.alias.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{node.alias || 'Tanpa Nama'}</p>
                          <button onClick={() => handleRename(node.id, node.alias)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-all">
                            <Icon name="edit" className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">SN: {node.serial_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-mono font-black border border-slate-200">
                      {node.onu_index}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase">
                          <Icon name="signal" className="w-3 h-3 text-indigo-500" /> Sinyal
                        </div>
                        <p className={`text-sm font-black italic tracking-tighter ${node.last_signal < -27 ? 'text-rose-500' : 'text-slate-900'}`}>
                          {node.last_signal} <span className="text-[9px]">dBm</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase">
                          <Icon name="temp" className="w-3 h-3 text-rose-500" /> Suhu
                        </div>
                        <p className="text-sm font-black italic tracking-tighter text-slate-900">
                          {node.last_temp} <span className="text-[9px]">°C</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${node.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {node.status === 'online' ? 'Connected' : 'Dying Gasp / LOS'}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {node.client_count} Perangkat Terhubung
                    </p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {node.ip_address && (
                        <a 
                          href={`http://${node.ip_address}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                        >
                          <Icon name="onu" className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleReboot(node.id)}
                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                      >
                        <Icon name="reboot" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-10 py-32 text-center text-slate-400 font-bold italic uppercase tracking-widest">Belum ada data ONU. Klik "Scan ONU Baru" untuk sinkronisasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add OLT Modal */}
      {showAddOlt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-10 text-white">
              <h2 className="text-2xl font-black uppercase tracking-tight">Registrasi OLT Baru</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Konfigurasi akses SNMP & Telnet OLT</p>
            </div>
            <form onSubmit={handleAddOlt} className="p-10 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nama / Lokasi OLT</label>
                  <input type="text" value={newOlt.name} onChange={e => setNewOlt({...newOlt, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="OLT Pusat - Rack 1" required />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">IP Management Address</label>
                  <input type="text" value={newOlt.ip_address} onChange={e => setNewOlt({...newOlt, ip_address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none font-mono" placeholder="10.10.10.1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Username OLT</label>
                    <input type="text" value={newOlt.username} onChange={e => setNewOlt({...newOlt, username: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Password</label>
                    <input type="password" value={newOlt.password} onChange={e => setNewOlt({...newOlt, password: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tipe / Seri OLT</label>
                  <select value={newOlt.type} onChange={e => setNewOlt({...newOlt, type: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none">
                    <option value="global">Global GPON (GL-Series)</option>
                    <option value="ad">AD-Series OLT</option>
                    <option value="vsol">V-SOL (OEM)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddOlt(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-200">Simpan OLT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkCenter
