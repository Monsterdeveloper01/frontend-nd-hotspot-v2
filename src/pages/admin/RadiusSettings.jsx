import { useState, useEffect } from 'react'
import axios from 'axios'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        router: <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v4m0 4h.01M5 12h14" />,
        ip: <path d="M9 3H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2zM19 3h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2zM9 13H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2zM19 13h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2z" />,
        secret: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-11V7a4 4 0 00-8 0v4h8z" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        plus: <path d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
        check: <path d="M5 13l4 4L19 7" />,
        terminal: <path d="M8 9l3 3-3 3m5 0h3" />,
        refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const RadiusSettings = () => {
    const [clients, setClients] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        shared_secret: ''
    })

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const config = { headers: { Authorization: `Bearer ${token}` } }
            
            const [clientsRes, logsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/radius-clients`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/radius-logs`, config)
            ])
            
            setClients(clientsRes.data)
            setLogs(logsRes.data)
        } catch (err) {
            console.error('Failed to fetch RADIUS data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 5000) // Poll every 5s for logs
        return () => clearInterval(interval)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${import.meta.env.VITE_API_URL}/radius-clients`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFormData({ name: '', ip_address: '', shared_secret: '' })
            await fetchData()
            alert('NAS Client berhasil didaftarkan!')
        } catch (err) {
            alert('Gagal mendaftarkan client. Pastikan input valid.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus otoritas NAS ini? Router tidak akan bisa login lagi.')) return
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${import.meta.env.VITE_API_URL}/radius-clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchData()
        } catch (err) {
            alert('Gagal menghapus client')
        }
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Section Premium */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-60 -mr-32 -mt-32"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <Icon name="shield" className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">RADIUS CENTER</h1>
                        </div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Advanced Centralized Authentication Protocol</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Server Port 1812 Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Registration Form */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <Icon name="plus" className="text-indigo-600" /> Daftarkan NAS Baru
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-sm" 
                                    placeholder="Mikrotik OLT 1"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Router IP Address</label>
                                <input 
                                    type="text" 
                                    value={formData.ip_address}
                                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-sm" 
                                    placeholder="192.168.1.1"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shared Secret</label>
                                <input 
                                    type="password" 
                                    value={formData.shared_secret}
                                    onChange={(e) => setFormData({...formData, shared_secret: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-sm" 
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Icon name="refresh" className="animate-spin w-4 h-4" /> : <><Icon name="check" className="w-4 h-4" /> Otorisasi NAS</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Clients Table & Logs */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Authorized Table */}
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <Icon name="router" className="text-slate-400" /> Authorized Clients
                            </h2>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full">{clients.length} NAS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Router Identity</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-indigo-50/20 transition-colors">
                                            <td className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-tight">{client.name}</td>
                                            <td className="px-8 py-5">
                                                <code className="bg-slate-100 text-indigo-600 px-3 py-1 rounded-lg font-black text-[11px]">{client.ip_address}</code>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => handleDelete(client.id)} className="p-2.5 text-slate-400 hover:text-rose-600 transition-colors">
                                                    <Icon name="delete" className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Protocol Logs */}
                    <div className="bg-slate-950 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[500px]">
                        <div className="px-8 py-6 bg-black/30 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Icon name="terminal" className="text-emerald-500" /> Protocol Stream
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest">Real-time Telemetry</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 font-mono text-[10px] space-y-3 scrollbar-hide">
                            {logs.length > 0 ? logs.map((log) => (
                                <div key={log.id} className="flex gap-4 border-l-2 pl-4 py-1 hover:bg-white/5 transition-colors group" 
                                     style={{ borderColor: log.status === 'Success' ? '#10b981' : '#f43f5e' }}>
                                    <span className="text-slate-600 shrink-0 font-bold">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                                    <span className={`font-black shrink-0 w-16 uppercase tracking-widest ${log.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {log.type}
                                    </span>
                                    <span className="text-indigo-400 shrink-0 font-bold">{log.client_ip}</span>
                                    <span className="text-slate-300">
                                        {log.username && <span className="text-amber-400 font-black mr-2 uppercase tracking-tight">[{log.username}]</span>}
                                        {log.message}
                                    </span>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <Icon name="terminal" className="w-12 h-12 text-slate-600 mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">No telemetry detected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RadiusSettings
