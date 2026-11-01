import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from '../../components/Pagination'

const VoucherSold = () => {
    const [soldVouchers, setSoldVouchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState(null)
    const [search, setSearch] = useState('')
    const [cleaning, setCleaning] = useState(false)

    const handleCleanupAbandoned = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus dari MikroTik semua voucher QRIS yang dibeli lebih dari 2 bulan lalu dan tidak pernah dipakai sama sekali?')) {
            return
        }

        try {
            setCleaning(true)
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/vouchers/cleanup-abandoned`, { days: 60 }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert(response.data.message || 'Pembersihan voucher hangus selesai.')
            fetchSoldVouchers(1, search)
        } catch (err) {
            console.error('Failed to cleanup abandoned vouchers', err)
            alert('Gagal membersihkan voucher hangus: ' + (err.response?.data?.message || err.message))
        } finally {
            setCleaning(false)
        }
    }

    const fetchSoldVouchers = async (page = 1, searchQuery = search) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/sold-vouchers?page=${page}&search=${searchQuery}`, {
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
        const delayDebounceFn = setTimeout(() => {
            fetchSoldVouchers(1, search)
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [search])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-admin-text">Riwayat Voucher Terjual</h2>
                    <p className="text-xs text-admin-muted font-bold mt-1">Daftar transaksi dan voucher hotspot yang telah diterbitkan</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCleanupAbandoned}
                        disabled={cleaning}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        title="Hapus voucher QRIS yang dibeli >2 bulan lalu dan tidak pernah dipakai sama sekali"
                    >
                        <i className={`fas fa-trash-alt ${cleaning ? 'animate-spin' : ''}`}></i>
                        <span>{cleaning ? 'Membersihkan...' : 'Bersihkan Hangus (>2 Bln)'}</span>
                    </button>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Cari kode atau no WA..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-admin-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
                        />
                        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-muted"></i>
                    </div>
                </div>
            </div>

            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-admin-base border-b border-admin-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Kode Voucher</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Pembeli</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Paket</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Harga</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Digunakan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Selesai</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-admin-muted font-bold italic">
                                        Loading history records...
                                    </td>
                                </tr>
                            ) : soldVouchers.length > 0 ? soldVouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-admin-base/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-admin-text text-lg tracking-widest uppercase leading-none">{v.code}</div>
                                        <span className="text-[10px] text-admin-muted font-bold uppercase tracking-widest mt-1 block">Credential Key</span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-blue-600 text-sm">
                                        {v.customer_phone ? (
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-phone text-[10px]"></i>
                                                <span>{v.customer_phone}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-8 py-6 font-black text-admin-text text-sm tracking-tight">{v.plan?.name}</td>
                                    <td className="px-8 py-6 font-black text-admin-text italic tracking-tighter">
                                        Rp {Number(v.price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-admin-text uppercase">
                                                {v.used_at ? new Date(v.used_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                            </span>
                                            <span className="text-[10px] text-admin-muted font-bold">
                                                {v.used_at ? new Date(v.used_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-admin-text uppercase">
                                                {v.expires_at ? new Date(v.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                            </span>
                                            <span className="text-[10px] text-admin-muted font-bold">
                                                {v.expires_at ? new Date(v.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 bg-admin-base text-admin-muted rounded-xl text-[9px] font-black uppercase tracking-widest border border-admin-border">
                                            Archive
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-admin-muted font-bold italic">
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
