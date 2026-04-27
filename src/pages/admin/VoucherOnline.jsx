import { useState, useEffect } from 'react'
import axios from 'axios'


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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="lg:col-span-3">
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kode Voucher</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Paket</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sisa Waktu</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Device MAC</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeVouchers.length > 0 ? activeVouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                                    <i className="fas fa-wifi text-xs"></i>
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 text-lg tracking-widest uppercase block leading-none">{v.code}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Active Session</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-800 text-sm tracking-tight">{v.plan?.name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black border border-amber-100 uppercase tracking-widest">
                                                <i className="fas fa-clock animate-pulse"></i>
                                                {calculateRemaining(v.expires_at)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 uppercase tracking-widest">{v.mac_address || 'Unbound'}</code>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleKick(v.code)}
                                                className="bg-white border border-red-200 text-red-500 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                Terminate
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center text-slate-400 font-black italic uppercase tracking-[0.2em]">
                                            No active sessions detected.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 sticky top-12">
                    <h3 className="text-sm font-black text-slate-900 mb-8 tracking-widest uppercase flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-history text-xs"></i>
                        </div>
                        Recent Activity
                    </h3>
                    <div className="space-y-8">
                        {logs.length > 0 ? logs.map((log) => (
                            <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${new Date(log.expires_at) < new Date() ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-sm tracking-widest uppercase">{log.code}</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(log.expires_at) < new Date() ? 'Session Ended' : 'Session Start'}
                                        </span>
                                        <span className="text-[9px] font-black text-blue-600 uppercase">
                                            {new Date(log.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VoucherOnline
