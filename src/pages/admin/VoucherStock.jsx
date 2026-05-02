import { useState, useEffect } from 'react'
import Pagination from '../../components/Pagination'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        code: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        device: <path d="M9 3H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2zM19 3h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2zM9 13H5a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2zM19 13h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2z" />,
        x: <path d="M6 18L18 6M6 6l18 18" />,
        plus: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const VoucherDetailModal = ({ voucher, onClose }) => {
    if (!voucher) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Icon name="info" className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Detail Voucher</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Informasi penggunaan & riwayat</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Code Section */}
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 text-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Voucher Code</p>
                        <h2 className="text-4xl font-black text-blue-600 tracking-[0.2em]">{voucher.code}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block border ${voucher.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {voucher.status}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                            <p className="font-black text-slate-900">Rp {voucher.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    {voucher.customer_phone && (
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <Icon name="device" className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nomor Telepon Pembeli</p>
                                <p className="text-sm font-bold text-emerald-700 font-mono">{voucher.customer_phone}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Icon name="clock" className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digunakan Pada</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {voucher.used_at ? new Date(voucher.used_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum Digunakan'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Icon name="calendar" className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kadaluarsa</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {voucher.expires_at ? new Date(voucher.expires_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unlimited'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Icon name="device" className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MAC Address</p>
                                <p className="text-sm font-bold text-slate-700 font-mono">{voucher.mac_address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 pt-0">
                    <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        Tutup Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

const VoucherStock = () => {
    const [vouchers, setVouchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState(null)
    const [stats, setStats] = useState({ total: 0, available: 0, used: 0 })
    const [selectedVoucher, setSelectedVoucher] = useState(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [genSubmitting, setGenSubmitting] = useState(false)
    const [plans, setPlans] = useState([])
    const [genData, setGenData] = useState({
        voucher_plan_id: '',
        quantity: 10,
        type: 'radius' // radius or mikrotik
    })

    useEffect(() => {
        fetchVouchers(1)
        fetchPlans()
    }, [statusFilter])

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/voucher-plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setPlans(data)
        } catch (err) {
            console.error('Failed to fetch plans')
        }
    }

    const fetchVouchers = async (page = 1) => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const queryParams = new URLSearchParams({
                page,
                search,
                status: statusFilter
            })
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
            const data = await response.json()
            setVouchers(data.data || [])
            setStats(data.stats || { total: 0, available: 0, used: 0 })
            setMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                links: data.links,
                total: data.total
            })
        } catch (err) {
            console.error('Failed to fetch vouchers')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async (e) => {
        e.preventDefault()
        if (!genData.voucher_plan_id) return alert('Pilih paket voucher!')
        
        setGenSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers/generate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(genData)
            })
            const data = await response.json()
            if (response.ok) {
                alert(`Berhasil membuat ${data.vouchers.length} voucher!`)
                setShowGenerateModal(false)
                fetchVouchers(1)
            } else {
                alert(data.message || 'Gagal generate voucher')
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi')
        } finally {
            setGenSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus voucher ini? Ini juga akan menghapus user di Mikrotik.')) return
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (response.ok) {
                fetchVouchers(meta.current_page)
            } else {
                const data = await response.json()
                alert(data.message || 'Gagal menghapus voucher')
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi')
        }
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Stok Voucher</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Monitoring inventaris voucher hotspot dan riwayat penggunaan</p>
                </div>
                <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    Buat Voucher Massal
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Voucher</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.total}</h3>
                    </div>
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                        <Icon name="code" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tersedia (Available)</p>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.available}</h3>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Icon name="device" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terpakai (Used)</p>
                        <h3 className="text-3xl font-black text-blue-600 tracking-tighter">{stats.used}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
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
                        onKeyDown={(e) => e.key === 'Enter' && fetchVouchers(1)}
                        placeholder="Cari voucher code atau nomor WA..." 
                        className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button 
                        onClick={() => fetchVouchers(1)}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
                <div className="w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-64 px-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer uppercase tracking-widest appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                        <option value="all">Semua Status</option>
                        <option value="available">Status: Available</option>
                        <option value="used">Status: Used</option>
                    </select>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credentials</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pembeli</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plan Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold italic">Synchronizing inventory...</td>
                                </tr>
                            ) : vouchers.length > 0 ? vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <Icon name="code" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg leading-none uppercase tracking-[0.1em]">{v.code}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase mt-1.5 tracking-widest">Hotspot User</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-800 text-sm">{v.customer_phone || '-'}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{v.customer_phone ? 'WhatsApp' : 'Tanpa Info'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-800 text-sm">{v.plan?.name}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{v.plan?.duration || 'Standard'} Profile</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 text-lg tracking-tighter italic">Rp {v.price.toLocaleString('id-ID')}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2
                                            ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              v.status === 'sold' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                              'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedVoucher(v)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="View Detail"
                                            >
                                                <Icon name="info" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(v.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-24 text-center text-slate-400 font-bold italic">Inventory is empty.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination meta={meta} onPageChange={(page) => fetchVouchers(page)} />

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Icon name="code" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Voucher Massal</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Generate kode voucher fisik</p>
                                </div>
                            </div>
                            <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih Paket</label>
                                <select 
                                    value={genData.voucher_plan_id}
                                    onChange={(e) => setGenData({...genData, voucher_plan_id: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                    required
                                >
                                    <option value="">Pilih Master Voucher...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString('id-ID')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Jumlah Voucher</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={genData.quantity}
                                        onChange={(e) => setGenData({...genData, quantity: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Sistem</label>
                                    <select 
                                        value={genData.type}
                                        onChange={(e) => setGenData({...genData, type: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="radius">RADIUS (Rekomendasi)</option>
                                        <option value="mikrotik">LOCAL (Mikrotik API)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Icon name="info" className="w-3 h-3" /> Info Radius
                                </p>
                                <p className="text-[9px] font-bold text-blue-500 leading-relaxed uppercase tracking-wider">
                                    Voucher Radius disimpan di database pusat dan lebih aman untuk cetak fisik dalam jumlah banyak.
                                </p>
                            </div>

                            <button 
                                type="submit"
                                disabled={genSubmitting}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-3 ${genSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
                            >
                                {genSubmitting ? <i className="fas fa-circle-notch animate-spin"></i> : <><Icon name="plus" className="w-4 h-4" /> Generate Voucher</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedVoucher && (
                <VoucherDetailModal 
                    voucher={selectedVoucher} 
                    onClose={() => setSelectedVoucher(null)} 
                />
            )}
        </div>
    )
}

export default VoucherStock
