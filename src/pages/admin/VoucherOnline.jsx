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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Active Sessions Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Icon name="wifi" className="w-5 h-5" />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Sessions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kode Voucher</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Paket</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sisa Waktu</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Device MAC</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {activeVouchers.length > 0 ? activeVouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                        <Icon name="wifi" className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 text-lg tracking-widest uppercase block leading-none">{v.code}</span>
                                                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                            Connected
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{v.plan?.name}</span>
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
                                                <button
                                                    onClick={() => handleKick(v.code)}
                                                    className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                                                    title="Terminate Session"
                                                >
                                                    <Icon name="kick" className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-24 text-center text-slate-400 font-black italic uppercase tracking-[0.2em]">
                                                {loading ? 'Scanning Router...' : 'No active sessions detected.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200 sticky top-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                <Icon name="history" className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Log Activity</h3>
                        </div>
                        <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                            {logs.length > 0 ? logs.map((log) => (
                                <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2 group">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${new Date(log.expires_at) < new Date() ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-sm tracking-widest uppercase leading-none">{log.code}</span>
                                        <div className="flex items-center justify-between mt-2">
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
                                <div className="text-center py-10">
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
