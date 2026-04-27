import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from '../../components/Pagination'

const VoucherSold = () => {
    const [soldVouchers, setSoldVouchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState(null)

    const fetchSoldVouchers = async (page = 1) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/sold-vouchers?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSoldVouchers(response.data.data)
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                links: response.data.links,
                total: response.data.total
            })
        } catch (err) {
            console.error('Failed to fetch sold vouchers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSoldVouchers(1)
    }, [])

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kode Voucher</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pembeli</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Paket</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Harga</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Digunakan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selesai</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        Loading history records...
                                    </td>
                                </tr>
                            ) : soldVouchers.length > 0 ? soldVouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 text-lg tracking-widest uppercase leading-none">{v.code}</div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Credential Key</span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-blue-600 text-sm">
                                        {v.customer_phone ? (
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-phone text-[10px]"></i>
                                                <span>{v.customer_phone}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-800 text-sm tracking-tight">{v.plan?.name}</td>
                                    <td className="px-8 py-6 font-black text-slate-900 italic tracking-tighter">
                                        Rp {Number(v.price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-900 uppercase">
                                                {v.used_at ? new Date(v.used_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                {v.used_at ? new Date(v.used_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-900 uppercase">
                                                {v.expires_at ? new Date(v.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                {v.expires_at ? new Date(v.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                            Archive
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        No history records available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination meta={meta} onPageChange={(page) => fetchSoldVouchers(page)} />
        </div>
    )
}

export default VoucherSold
