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
    const [serverStatus, setServerStatus] = useState('Checking...')
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
            
            const [clientsRes, logsRes, statusRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/radius-clients`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/radius-logs`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/radius-status`, config).catch(() => ({ data: { status: 'Offline' } }))
            ])
            
            setClients(clientsRes.data)
            setLogs(logsRes.data)
            setServerStatus(statusRes.data.status)
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
        <div className="space-y-10 animate-fadeIn pb-20">
            {/* Header Section Premium */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[40px] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 -ml-32 -mb-32"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white shadow-xl">
                                <Icon name="shield" className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Radius Operations</h1>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className={`backdrop-blur-md border px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg transition-colors ${
                            serverStatus === 'Online' 
                                ? 'bg-emerald-500/10 border-emerald-500/20' 
                                : serverStatus === 'Checking...'
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-rose-500/10 border-rose-500/20'
                        }`}>
                            <div className="relative flex items-center justify-center w-3 h-3">
                                {serverStatus === 'Online' ? (
                                    <>
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </>
                                ) : serverStatus === 'Checking...' ? (
                                    <>
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-pulse"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </>
                                ) : (
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${
                                    serverStatus === 'Online' ? 'text-emerald-400' : serverStatus === 'Checking...' ? 'text-amber-400' : 'text-rose-400'
                                }`}>Port 1812 / 1813</span>
                                <span className="text-xs font-bold text-slate-300">
                                    {serverStatus === 'Online' ? 'Service Active' : serverStatus === 'Checking...' ? 'Checking Status...' : 'Service Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Registration Form & Stats */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Icon name="plus" className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">NAS Registration</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add Router Client</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                                        <Icon name="router" className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 text-sm" 
                                        placeholder="Main Router LT 1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">IP Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                                        <Icon name="ip" className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.ip_address}
                                        onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 text-sm font-mono" 
                                        placeholder="192.168.x.x"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Shared Secret</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                                        <Icon name="secret" className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="password" 
                                        value={formData.shared_secret}
                                        onChange={(e) => setFormData({...formData, shared_secret: e.target.value})}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 text-sm font-mono tracking-widest" 
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? <Icon name="refresh" className="animate-spin w-5 h-5" /> : <><Icon name="check" className="w-5 h-5" /> Authorize NAS</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Clients Table & Logs */}
                <div className="xl:col-span-8 space-y-10">
                    {/* Authorized Table */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                                    <Icon name="router" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Network Access Servers</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized to communicate</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{clients.length}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Active Nodes</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity & IP</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clients.length > 0 ? clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                        <Icon name="router" className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{client.name}</span>
                                                        <span className="font-mono text-[11px] font-bold text-slate-500 mt-1">{client.ip_address}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Permitted
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button onClick={() => handleDelete(client.id)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" title="Revoke Access">
                                                    <Icon name="delete" className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-10 py-20 text-center text-slate-400 font-black italic uppercase tracking-[0.2em]">No NAS Registered.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protocol Logs - Full Width Section */}
            <div className="bg-[#0b1120] rounded-[32px] border border-slate-800 shadow-2xl shadow-indigo-900/10 overflow-hidden flex flex-col h-[600px] relative mt-10">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                <div className="px-8 py-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Icon name="terminal" className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Protocol Telemetry</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Live AAA Event Stream</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                        <div className="relative w-2.5 h-2.5">
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-emerald-400 rounded-full w-2.5 h-2.5"></div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Monitoring</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 font-mono text-[11px] space-y-4 scrollbar-hide relative z-10">
                    {logs.length > 0 ? logs.map((log) => (
                        <div key={log.id} className="flex gap-4 items-start group hover:bg-white/[0.02] p-2 rounded-lg transition-colors" >
                            <div className="flex flex-col mt-0.5">
                                <span className="text-slate-600 font-bold whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleTimeString('en-US', {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                        {log.type}
                                    </span>
                                    <span className="text-indigo-400/80 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                        {log.client_ip}
                                    </span>
                                </div>
                                <p className="text-slate-300 mt-1 leading-relaxed">
                                    {log.username && <span className="text-amber-400 font-bold mr-2">[{log.username}]</span>}
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <div className="w-16 h-16 border border-slate-700 rounded-2xl flex items-center justify-center mb-6">
                                <Icon name="terminal" className="w-8 h-8 text-slate-500" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Awaiting Auth Requests</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RadiusSettings
