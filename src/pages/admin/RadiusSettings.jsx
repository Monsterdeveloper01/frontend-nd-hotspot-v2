import { useState, useEffect } from 'react'
import axios from 'axios'


const RadiusSettings = () => {
    const [clients, setClients] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 sticky top-12">
                    <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight uppercase">Register NAS</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Router Identifier</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Kantor_Pusat" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">IP Address</label>
                            <input 
                                type="text" 
                                value={formData.ip_address} 
                                onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                placeholder="192.168.88.1" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Shared Secret</label>
                            <input 
                                type="password" 
                                value={formData.shared_secret} 
                                onChange={(e) => setFormData({...formData, shared_secret: e.target.value})}
                                placeholder="••••••••" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 transition-all active:scale-95">
                            Authorize Router
                        </button>
                    </form>
                </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-3 space-y-10">
                {/* Clients Table */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered NAS Clients</h3>
                        <button onClick={fetchData} className="text-blue-600 hover:text-blue-800 transition-colors">
                            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Router Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network IP</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-slate-900 uppercase text-sm tracking-tight">{client.name}</td>
                                        <td className="px-8 py-6 font-black text-blue-600 italic tracking-tighter text-sm">{client.ip_address}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(client.id)} 
                                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-bold italic uppercase tracking-widest text-[10px]">No routers registered.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="bg-slate-950 rounded-[32px] shadow-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
                    <div className="px-8 py-5 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live RADIUS Protocol Stream</h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sync: 10s</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 font-mono text-[11px] space-y-3 custom-scrollbar">
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-6 border-b border-white/5 pb-3 last:border-0 group">
                                <span className="text-slate-600 shrink-0 font-bold">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>
                                <span className={`font-black shrink-0 w-20 uppercase tracking-widest ${log.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {log.type}
                                </span>
                                <span className="text-blue-500 shrink-0 font-bold">{log.client_ip}</span>
                                <span className="text-slate-300">
                                    {log.username && <span className="text-amber-400 font-black mr-2 uppercase tracking-tight">[{log.username}]</span>}
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-slate-700 italic py-20 text-center uppercase tracking-[0.4em] font-black">Connection Established... Waiting for data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RadiusSettings
