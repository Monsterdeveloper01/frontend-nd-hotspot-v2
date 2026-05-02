import { useState, useEffect } from 'react'
import axios from 'axios'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        wifi: <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.59 16.11a6 6 0 016.82 0M12 20h.01" />,
        clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        history: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        kick: <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
        refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const VoucherOnline = () => {
    const [activeVouchers, setActiveVouchers] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const config = { headers: { Authorization: `Bearer ${token}` } }

            const [activeRes, logsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/active-vouchers`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/voucher-logs`, config)
            ])

            setActiveVouchers(activeRes.data)
            setLogs(logsRes.data)
        } catch (err) {
            console.error('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleKick = async (code) => {
        if (!confirm(`Putuskan koneksi untuk voucher ${code}?`)) return
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${import.meta.env.VITE_API_URL}/vouchers/${code}/kick`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('User berhasil diputuskan koneksinya')
            fetchData()
        } catch (err) {
            alert('Gagal memutuskan koneksi')
        }
    }

    const calculateRemaining = (expiresAt) => {
        if (!expiresAt) return 'Unlimited'
        const diff = new Date(expiresAt) - new Date()
        if (diff <= 0) return 'Expired'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m`
    }

    const filteredVouchers = activeVouchers.filter(v => {
        const matchesSearch = v.code.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : statusFilter === 'online' ? v.is_online : !v.is_online;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: activeVouchers.length,
        online: activeVouchers.filter(v => v.is_online).length,
        offline: activeVouchers.filter(v => !v.is_online).length
    };

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Voucher Online</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Monitoring sesi aktif dan riwayat login hotspot</p>
                </div>
                <button 
                    onClick={fetchData} 
                    className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Active</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.total}</h3>
                    </div>
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                        <Icon name="history" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Online</p>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.online}</h3>
                    </div>
                    <div className="relative w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <Icon name="wifi" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offline (Jeda)</p>
                        <h3 className="text-3xl font-black text-slate-400 tracking-tighter">{stats.offline}</h3>
                    </div>
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <Icon name="clock" className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm">
                <div className="w-full md:w-1/2 relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode voucher..." 
                        className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-slate-200 text-slate-500 rounded-2xl shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-64 px-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer uppercase tracking-widest appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                        <option value="all">Semua Koneksi</option>
                        <option value="online">Status: Online</option>
                        <option value="offline">Status: Offline</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {/* Active Sessions Table */}
                <div className="w-full">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Icon name="wifi" className="w-5 h-5" />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Vouchers</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kode Voucher</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Paket</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Waktu Pemakaian</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sisa Waktu</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Device MAC</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredVouchers.length > 0 ? filteredVouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${v.is_online ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-500 group-hover:text-white'}`}>
                                                        <Icon name="wifi" className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 text-lg tracking-widest uppercase block leading-none">{v.code}</span>
                                                        {v.is_online ? (
                                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                                Connected
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                                                Offline
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{v.plan?.name}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                        <span className="w-12 inline-block text-slate-400">Mulai:</span> 
                                                        {v.used_at ? new Date(v.used_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-2">
                                                        <span className="w-12 inline-block text-slate-400">Habis:</span>
                                                        {v.expires_at ? new Date(v.expires_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unlimited'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black border border-amber-100 uppercase tracking-widest shadow-sm">
                                                    <Icon name="clock" className="w-3.5 h-3.5 animate-pulse" />
                                                    {calculateRemaining(v.expires_at)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 uppercase tracking-widest font-mono border border-slate-200">{v.mac_address || 'Unbound'}</code>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {v.is_online ? (
                                                    <button
                                                        onClick={() => handleKick(v.code)}
                                                        className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                                                        title="Terminate Session"
                                                    >
                                                        <Icon name="kick" className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase text-slate-300">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-24 text-center text-slate-400 font-black italic uppercase tracking-[0.2em]">
                                                {loading ? 'Scanning Router...' : 'No active sessions detected.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="w-full">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                <Icon name="history" className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Log Activity Terakhir</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {logs.length > 0 ? logs.map((log) => (
                                <div key={log.id} className="relative pl-6 border-l-2 border-slate-100 py-2 group">
                                    <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${new Date(log.expires_at) < new Date() ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-sm tracking-widest uppercase leading-none">{log.code}</span>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(log.expires_at) < new Date() ? 'Session Ended' : 'Login Success'}
                                            </span>
                                            <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                                                {new Date(log.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity log.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VoucherOnline
