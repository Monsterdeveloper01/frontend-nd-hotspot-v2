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
        x: <path d="M6 18L18 6M6 6l12 12" />,
        plus: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
        copy: <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
        check: <path d="M5 13l4 4L19 7" />,
        shopping: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
        phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
        ticket: <path d="M15 5v2m-6-2v2M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4M3 10h18M3 10v10a2 2 0 002 2h14a2 2 0 002-2V10M7 14h10" />,
        external: <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const VoucherDetailModal = ({ voucher, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!voucher) return null;

    const handleCopy = () => {
        if (!voucher.code) return;
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const purchaseDate = voucher.transaction?.created_at || (voucher.status !== 'available' ? (voucher.created_at || voucher.updated_at) : null);
    const formattedPurchaseDate = formatDate(purchaseDate);

    const getStatusBadge = (status) => {
        if (status === 'used') {
            return {
                label: 'Sedang Digunakan',
                bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                dot: 'bg-amber-500'
            };
        }
        if (status === 'sold') {
            return {
                label: 'Terjual (Aktif)',
                bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                dot: 'bg-blue-500'
            };
        }
        if (status === 'available') {
            return {
                label: 'Tersedia di Stok',
                bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                dot: 'bg-emerald-500'
            };
        }
        return {
            label: status?.toUpperCase() || 'Expired',
            bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            dot: 'bg-rose-500'
        };
    };

    const statusBadge = getStatusBadge(voucher.status);
    const cleanPhone = voucher.customer_phone ? voucher.customer_phone.replace(/[^0-9]/g, '') : '';
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-admin-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-admin-border animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="px-6 py-4 bg-admin-base border-b border-admin-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Icon name="ticket" className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-admin-text leading-tight">Detail Voucher</h3>
                            <p className="text-[11px] text-admin-muted font-medium">Informasi kode, pembelian & riwayat penggunaan</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-admin-muted hover:text-admin-text hover:bg-admin-card rounded-lg transition-colors"
                        title="Tutup"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    
                    {/* Modern Voucher Ticket Card */}
                    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/15 overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                        {/* Top: Plan Name & Duration */}
                        <div className="flex items-center justify-between gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm">
                                    {voucher.plan?.name || 'Voucher Hotspot'}
                                </span>
                                {voucher.plan?.duration && (
                                    <span className="text-xs text-blue-100 font-medium flex items-center gap-1">
                                        <Icon name="clock" className="w-3.5 h-3.5" />
                                        {voucher.plan.duration}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight">
                                Rp {Math.floor(voucher.price || 0).toLocaleString('id-ID')}
                            </span>
                        </div>

                        {/* Middle: Code & Quick Copy */}
                        <div className="my-4 pt-2 text-center relative z-10">
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">KODE VOUCHER</p>
                            <div className="inline-flex items-center justify-center gap-3 bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
                                <span className="font-mono text-3xl sm:text-4xl font-black tracking-[0.25em] select-all">
                                    {voucher.code}
                                </span>
                                <button 
                                    onClick={handleCopy}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                        copied 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-white text-blue-700 hover:bg-blue-50'
                                    }`}
                                    title="Salin Kode"
                                >
                                    <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
                                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Bottom: Status Pill */}
                        <div className="flex items-center justify-center relative z-10 pt-1">
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white">
                                <span className={`w-2 h-2 rounded-full ${voucher.status === 'used' ? 'bg-amber-300 animate-pulse' : voucher.status === 'available' ? 'bg-emerald-300 animate-pulse' : 'bg-white'}`} />
                                {statusBadge.label}
                            </span>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* WAKTU PEMBELIAN (Requested Feature!) */}
                        <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-start gap-3 col-span-1 sm:col-span-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mt-0.5 shrink-0">
                                <Icon name="shopping" className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider">Dibeli Pada (Waktu Beli)</p>
                                    {voucher.transaction?.external_id && (
                                        <span className="text-[10px] font-mono text-blue-600 font-bold truncate max-w-[150px]">
                                            {voucher.transaction.external_id}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-admin-text mt-0.5">
                                    {formattedPurchaseDate || (voucher.status === 'available' ? 'Belum Terjual (Masih di Stok)' : 'Tidak Ada Data Waktu')}
                                </p>
                                {voucher.transaction?.payment_method && (
                                    <p className="text-[10px] text-admin-muted mt-0.5 uppercase">
                                        Metode Bayar: <span className="font-semibold text-admin-text">{voucher.transaction.payment_method}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* NOMOR TELEPON PEMBELI */}
                        <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-start gap-3 col-span-1 sm:col-span-2">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mt-0.5 shrink-0">
                                <Icon name="phone" className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider">Nomor HP Pembeli</p>
                                    {waUrl && (
                                        <a 
                                            href={waUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                                        >
                                            Chat WA <Icon name="external" className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-admin-text font-mono mt-0.5">
                                    {voucher.customer_phone || <span className="text-admin-muted font-sans font-normal italic">Tidak tercatat</span>}
                                </p>
                            </div>
                        </div>

                        {/* DIGUNAKAN PADA */}
                        <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-0.5 shrink-0">
                                <Icon name="clock" className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider">Digunakan Pada</p>
                                <p className="text-xs font-bold text-admin-text mt-0.5">
                                    {formatDate(voucher.used_at) || <span className="text-admin-muted font-normal italic">Belum Digunakan</span>}
                                </p>
                            </div>
                        </div>

                        {/* KADALUARSA */}
                        <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-0.5 shrink-0">
                                <Icon name="calendar" className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider">Batas Kadaluarsa</p>
                                <p className="text-xs font-bold text-admin-text mt-0.5">
                                    {formatDate(voucher.expires_at) || <span className="text-admin-muted font-normal italic">Belum Digunakan</span>}
                                </p>
                            </div>
                        </div>

                        {/* MAC ADDRESS */}
                        <div className="p-3.5 rounded-xl bg-admin-base border border-admin-border flex items-start gap-3 col-span-1 sm:col-span-2">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-0.5 shrink-0">
                                <Icon name="device" className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-admin-muted uppercase tracking-wider">MAC Address Perangkat</p>
                                <p className="text-xs font-mono font-bold text-admin-text mt-0.5">
                                    {voucher.mac_address || <span className="font-sans text-admin-muted font-normal italic">-</span>}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-admin-base border-t border-admin-border flex items-center justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2 text-xs font-bold text-admin-text bg-admin-card hover:bg-slate-100 border border-admin-border rounded-xl transition-colors"
                    >
                        Tutup
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
                    <h1 className="text-2xl font-black text-admin-text tracking-tight uppercase leading-none">Stok Voucher</h1>
                    <p className="text-admin-muted font-bold text-[10px] uppercase tracking-widest mt-2">Monitoring inventaris voucher hotspot dan riwayat penggunaan</p>
                </div>
                <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="px-6 py-4 bg-admin-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    Buat Voucher Massal
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-admin-card p-6 rounded-[24px] border border-admin-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest">Total Voucher</p>
                        <h3 className="text-3xl font-black text-admin-text tracking-tighter">{stats.total}</h3>
                    </div>
                    <div className="w-14 h-14 bg-slate-900 text-admin-text rounded-2xl flex items-center justify-center shadow-sm shadow-black/10">
                        <Icon name="code" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-admin-card p-6 rounded-[24px] border border-admin-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest">Tersedia (Available)</p>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.available}</h3>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Icon name="device" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-admin-card p-6 rounded-[24px] border border-admin-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest">Terpakai (Used)</p>
                        <h3 className="text-3xl font-black text-blue-600 tracking-tighter">{stats.used}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <Icon name="clock" className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-admin-card p-4 rounded-[24px] border border-admin-border shadow-sm">
                <div className="w-full md:w-1/2 relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchVouchers(1)}
                        placeholder="Cari voucher code atau nomor WA..." 
                        className="w-full pl-6 pr-14 py-4 bg-admin-base border border-admin-border rounded-[20px] text-sm font-bold text-admin-text focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-admin-card transition-all placeholder:text-admin-muted"
                    />
                    <button 
                        onClick={() => fetchVouchers(1)}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-admin-accent text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-sm"
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
                        className="w-full md:w-64 px-6 py-4 bg-admin-base border border-admin-border rounded-[20px] text-sm font-bold text-admin-text focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-admin-card transition-all cursor-pointer uppercase tracking-widest appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                        <option value="all">Semua Status</option>
                        <option value="available">Status: Available</option>
                        <option value="used">Status: Used</option>
                    </select>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-admin-base border-b border-admin-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Credentials</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Pembeli</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Plan Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-admin-muted font-bold italic">Synchronizing inventory...</td>
                                </tr>
                            ) : vouchers.length > 0 ? vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-admin-base flex items-center justify-center text-admin-muted group-hover:bg-blue-600 group-hover:text-admin-text transition-all shadow-sm">
                                                <Icon name="code" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-admin-text text-lg leading-none uppercase tracking-[0.1em]">{v.code}</div>
                                                <div className="text-[10px] font-black text-admin-muted uppercase mt-1.5 tracking-widest">Hotspot User</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-admin-text text-sm font-mono">{v.customer_phone || '-'}</div>
                                        <div className="text-[10px] text-admin-muted mt-0.5 font-medium">
                                            {v.transaction?.created_at || (v.status !== 'available' ? v.created_at : null)
                                                ? `Beli: ${new Date(v.transaction?.created_at || v.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                                                : 'Stok Belum Terjual'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-admin-text text-sm">{v.plan?.name}</div>
                                        <div className="text-[10px] font-black text-admin-muted uppercase mt-1 tracking-widest">{v.plan?.duration || 'Standard'} Profile</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-admin-text text-lg tracking-tighter italic">Rp {v.price.toLocaleString('id-ID')}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2
                                            ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              v.status === 'sold' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                              'bg-admin-base text-admin-muted border-admin-border'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedVoucher(v)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-admin-text transition-all shadow-sm"
                                                title="View Detail"
                                            >
                                                <Icon name="info" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(v.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-admin-text transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-24 text-center text-admin-muted font-bold italic">Inventory is empty.</td>
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
                    <div className="bg-admin-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 bg-admin-base border-b border-admin-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Icon name="code" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-admin-text uppercase tracking-tight leading-none">Voucher Massal</h3>
                                    <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest mt-1">Generate kode voucher fisik</p>
                                </div>
                            </div>
                            <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <svg className="w-6 h-6 text-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Pilih Paket</label>
                                <select 
                                    value={genData.voucher_plan_id}
                                    onChange={(e) => setGenData({...genData, voucher_plan_id: e.target.value})}
                                    className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                                    <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Jumlah Voucher</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={genData.quantity}
                                        onChange={(e) => setGenData({...genData, quantity: e.target.value})}
                                        className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Sistem</label>
                                    <select 
                                        value={genData.type}
                                        onChange={(e) => setGenData({...genData, type: e.target.value})}
                                        className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-3 ${genSubmitting ? 'bg-admin-base text-admin-muted' : 'bg-admin-accent text-white shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
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
