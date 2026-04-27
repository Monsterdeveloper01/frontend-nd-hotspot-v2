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
        refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
        const interval = setInterval(fetchData, 10000)
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
            fetchData()
            alert('RADIUS Client berhasil ditambahkan')
        } catch (err) {
            alert('Gagal menambahkan client')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus client RADIUS ini?')) return
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
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">RADIUS Server</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Otorisasi Router (NAS) dan monitoring protokol autentikasi terpusat</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Icon name="plus" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Register NAS Client</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daftarkan Router MikroTik ke database RADIUS</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Group 1 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="router" className="w-3 h-3" /> Router Identity
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Identifier</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="e.g. Mikrotik_Lantai_1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 2 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="ip" className="w-3 h-3" /> Network Access
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">IP Address Router</label>
                                <input 
                                    type="text" 
                                    value={formData.ip_address}
                                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="192.168.88.1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 3 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="secret" className="w-3 h-3" /> Security
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Shared Secret</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="password" 
                                        value={formData.shared_secret}
                                        onChange={(e) => setFormData({...formData, shared_secret: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className={`px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${submitting ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95'}`}
                                    >
                                        <Icon name="check" className="w-4 h-4" />
                                        {submitting ? '...' : 'Authorize'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Registered Clients Card */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                                <Icon name="router" className="w-5 h-5" />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Authorized NAS</h2>
                        </div>
                        <button onClick={fetchData} className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Router Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IP Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clients.length > 0 ? clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-6 font-black text-slate-900 uppercase text-sm tracking-tight">{client.name}</td>
                                        <td className="px-8 py-6 font-black text-indigo-600 italic tracking-tighter text-sm">{client.ip_address}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(client.id)} 
                                                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-bold italic uppercase tracking-widest text-[10px]">No routers registered.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Logs Card */}
                <div className="bg-slate-950 rounded-[40px] shadow-2xl border border-white/5 overflow-hidden flex flex-col h-[500px] group">
                    <div className="px-10 py-6 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <Icon name="terminal" className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">RADIUS Protocol Stream</h2>
                                <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">Live Telemetry Synchronized</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-10 font-mono text-[11px] space-y-4 scrollbar-hide">
                        {logs.length > 0 ? logs.map((log) => (
                            <div key={log.id} className="flex gap-6 border-b border-white/5 pb-3 last:border-0 hover:bg-white/5 transition-colors -mx-4 px-4 rounded-lg">
                                <span className="text-slate-600 shrink-0 font-bold">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>
                                <span className={`font-black shrink-0 w-20 uppercase tracking-widest ${log.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {log.type}
                                </span>
                                <span className="text-indigo-400 shrink-0 font-bold">{log.client_ip}</span>
                                <span className="text-slate-300">
                                    {log.username && <span className="text-amber-400 font-black mr-2 uppercase tracking-tight">[{log.username}]</span>}
                                    {log.message}
                                </span>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                                <div className="text-slate-700 italic text-center uppercase tracking-[0.4em] font-black text-[9px]">Initializing Stream...</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RadiusSettings
