import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from '../../components/Pagination'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
        calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
        plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
        edit: <path d="M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        check: <path d="M5 13l4 4L19 7" />,
        clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        close: <path d="M6 18L18 6M6 6l12 12" />,
        info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLink, setFilterLink] = useState('all') // all, active, isolated
    const [filterPay, setFilterPay] = useState('all') // all, paid, unpaid
    const [filterOverdue, setFilterOverdue] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        billing_amount: '',
        due_date: ''
    })
    const [submitting, setSubmitting] = useState(false)

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm', 'success', 'error', 'warning'
        title: '',
        message: '',
        onConfirm: null
    })

    const showModal = (type, title, message, onConfirm = null) => {
        setModalConfig({ isOpen: true, type, title, message, onConfirm })
    }

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false })
    }

    const fetchCustomers = async (page = 1, q = searchTerm, link = filterLink, pay = filterPay, overdue = filterOverdue) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            
            let url = `${import.meta.env.VITE_API_URL}/customers?page=${page}&q=${q}`
            if (link !== 'all') url += `&is_isolated=${link === 'isolated' ? 1 : 0}`
            if (pay !== 'all') url += `&status_bayar=${pay}`
            if (overdue) url += `&overdue=1`

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCustomers(response.data.data)
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                links: response.data.links,
                total: response.data.total
            })
        } catch (err) {
            console.error('Failed to fetch customers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers(1, searchTerm, filterLink, filterPay, filterOverdue)
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, filterLink, filterPay, filterOverdue])

    const handleEdit = (customer) => {
        setEditingId(customer.id)
        setFormData({
            name: customer.name,
            whatsapp: customer.whatsapp,
            billing_amount: customer.billing_amount,
            due_date: customer.due_date ? customer.due_date.split('T')[0] : ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ name: '', whatsapp: '', billing_amount: '', due_date: '' })
    }

    const handleToggleStatus = (id) => {
        showModal('confirm', 'Ubah Status', 'Yakin ingin mengubah status router pelanggan ini?', async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/customers/${id}/toggle-status`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                if (response.data.mikrotik_synced) {
                    showModal('success', 'Berhasil', response.data.message)
                } else {
                    showModal('warning', 'Peringatan', response.data.message)
                }
                
                fetchCustomers(meta.current_page)
            } catch (err) {
                showModal('error', 'Gagal', 'Gagal memperbarui status')
            }
        })
    }

    const handleDelete = (id) => {
        showModal('warning', 'Konfirmasi Hapus', 'Yakin hapus data pelanggan ini secara permanen?', async () => {
            try {
                const token = localStorage.getItem('token')
                await axios.delete(`${import.meta.env.VITE_API_URL}/customers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                fetchCustomers(meta.current_page)
                showModal('success', 'Terhapus', 'Pelanggan berhasil dihapus')
            } catch (err) {
                showModal('error', 'Gagal', 'Gagal menghapus data')
            }
        })
    }

    const handlePayManual = (id) => {
        showModal('confirm', 'Bayar Manual', 'Konfirmasi pembayaran lunas secara manual?', async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/customers/${id}/pay-manual`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                if (response.data.mikrotik_synced) {
                    showModal('success', 'Pembayaran Sukses', response.data.message)
                } else {
                    showModal('warning', 'Peringatan Sistem', response.data.message)
                }
                
                fetchCustomers(meta.current_page)
            } catch (err) {
                showModal('error', 'Gagal', 'Gagal memproses pembayaran')
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const url = editingId 
                ? `${import.meta.env.VITE_API_URL}/customers/${editingId}`
                : `${import.meta.env.VITE_API_URL}/customers`
            
            const method = editingId ? 'put' : 'post'
            
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            const isEdit = editingId
            handleCancelEdit()
            fetchCustomers(1)
            showModal('success', isEdit ? 'Data Terupdate' : 'Berhasil', isEdit ? 'Perubahan data berhasil disimpan' : 'Pelanggan baru berhasil ditambahkan')
        } catch (err) {
            showModal('error', 'Terjadi Kesalahan', 'Pastikan semua data yang dimasukkan valid.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-admin-text tracking-tight uppercase leading-none">Data Pelanggan</h1>
                <p className="text-admin-muted font-bold text-[10px] uppercase tracking-widest mt-2">Kelola database pelanggan, tagihan bulanan, dan status isolasi</p>
            </div>

            {/* Form Card */}
            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Icon name="user" className="w-64 h-64" />
                </div>
                
                <div className="px-8 py-6 border-b border-admin-border bg-admin-base/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
                            <Icon name={editingId ? "edit" : "plus"} className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-admin-text leading-tight uppercase tracking-tight">
                                {editingId ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
                            </h2>
                            <p className="text-[10px] font-bold text-admin-muted uppercase tracking-widest mt-1">Lengkapi data identitas dan detail penagihan</p>
                        </div>
                    </div>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="px-4 py-2 bg-admin-base text-admin-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-admin-border">
                            Batal Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Group 1 */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-admin-text uppercase tracking-[0.2em] border-b border-admin-border pb-2 flex items-center gap-2">
                                <Icon name="user" className="w-3 h-3 text-blue-500" /> Identitas Personal
                            </h3>
                            <div>
                                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-admin-base border border-admin-border rounded-xl font-bold text-admin-text text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400" 
                                    placeholder="Username MikroTik"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5 ml-1">Nomor WhatsApp</label>
                                <input 
                                    type="text" 
                                    value={formData.whatsapp}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.startsWith('0')) val = '62' + val.substring(1);
                                        else if (val.length > 0 && !val.startsWith('62')) val = '62' + val;
                                        setFormData({...formData, whatsapp: val});
                                    }}
                                    className="w-full px-4 py-3 bg-admin-base border border-admin-border rounded-xl font-bold text-admin-text text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400" 
                                    placeholder="628..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 2 */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-admin-text uppercase tracking-[0.2em] border-b border-admin-border pb-2 flex items-center gap-2">
                                <Icon name="calendar" className="w-3 h-3 text-blue-500" /> Detail Tagihan
                            </h3>
                            <div>
                                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5 ml-1">Jumlah Tagihan</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-admin-muted text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        value={formData.billing_amount}
                                        onChange={(e) => setFormData({...formData, billing_amount: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-admin-base border border-admin-border rounded-xl font-bold text-admin-text text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400" 
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5 ml-1">Jatuh Tempo</label>
                                <input 
                                    type="date" 
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    className="w-full px-4 py-3 bg-admin-base border border-admin-border rounded-xl font-bold text-admin-text text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:dark]" 
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 3: Button */}
                        <div className="flex items-end pb-1">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 ${submitting ? 'bg-admin-base text-admin-muted' : editingId ? 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600' : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'}`}
                            >
                                <Icon name="check" className="w-4 h-4" />
                                {submitting ? 'Memproses...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List & Filter Card */}
            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
                {/* Filter Header */}
                <div className="p-6 bg-admin-base/30 border-b border-admin-border">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        {/* Search */}
                        <div className="relative w-full xl:w-96 group">
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-admin-card border border-admin-border rounded-xl font-bold text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm placeholder:text-admin-muted" 
                                placeholder="Cari Nama atau WhatsApp..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                                <Icon name="search" className="w-4 h-4 text-admin-muted group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-admin-muted hover:text-rose-500 transition-colors"
                                >
                                    <Icon name="close" className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            <select 
                                value={filterLink}
                                onChange={(e) => setFilterLink(e.target.value)}
                                className="px-4 py-3 bg-admin-card text-admin-text border border-admin-border rounded-xl font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm min-w-[140px]"
                            >
                                <option value="all">SEMUA LINK</option>
                                <option value="active">LINK AKTIF</option>
                                <option value="isolated">TERISOLIR</option>
                            </select>

                            <select 
                                value={filterPay}
                                onChange={(e) => setFilterPay(e.target.value)}
                                className="px-4 py-3 bg-admin-card text-admin-text border border-admin-border rounded-xl font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm min-w-[140px]"
                            >
                                <option value="all">SEMUA BAYAR</option>
                                <option value="paid">LUNAS</option>
                                <option value="unpaid">TEMPO</option>
                            </select>

                            <button 
                                onClick={() => setFilterOverdue(!filterOverdue)}
                                className={`px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap ${filterOverdue ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20' : 'bg-admin-card border border-admin-border text-admin-muted hover:border-rose-500/30 hover:text-rose-400'}`}
                            >
                                <Icon name="clock" className={`w-3 h-3 ${filterOverdue ? 'text-white' : 'text-current'}`} />
                                {filterOverdue ? 'JATUH TEMPO (ON)' : 'CEK TEMPO'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Body */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="p-20 text-center text-admin-muted font-bold italic">Memuat data...</div>
                    ) : customers.length > 0 ? (
                        customers.map((c) => {
                            const isOverdue = new Date(c.due_date) < new Date();
                            const isIsolated = c.is_isolated;
                            return (
                                <div key={c.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 px-6 border-b border-admin-border transition-colors group ${isIsolated ? 'bg-[#d1c6c6] border-[#baa9a9] hover:bg-[#c9bcbc]' : 'bg-admin-card hover:bg-admin-base/50'}`}>
                                    {/* 1. Customer Identity */}
                                    <div className="flex items-center gap-4 w-full md:w-[35%] mb-4 md:mb-0">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0 ${isIsolated ? 'bg-rose-500' : 'bg-blue-600'}`}>
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`font-black text-sm leading-tight uppercase tracking-tight flex items-center gap-2 truncate ${isIsolated ? 'text-slate-900' : 'text-admin-text'}`}>
                                                <span className="truncate">{c.name}</span>
                                                {isIsolated && <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)] flex-shrink-0">ISOLATED</span>}
                                            </div>
                                            <div className={`flex items-center gap-1.5 mt-1 font-bold text-[10px] ${isIsolated ? 'text-slate-600' : 'text-admin-muted'}`}>
                                                <Icon name="phone" className="w-3 h-3" />
                                                {c.whatsapp}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Billing Info */}
                                    <div className="w-full md:w-[25%] mb-4 md:mb-0">
                                        <div className={`font-black text-sm tracking-tight ${isIsolated ? 'text-slate-900' : 'text-admin-text'}`}>
                                            Rp {Number(c.billing_amount).toLocaleString('id-ID')}
                                        </div>
                                        <div className={`flex items-center gap-1.5 mt-1 font-bold text-[9px] uppercase tracking-widest ${isOverdue ? 'text-rose-600' : (isIsolated ? 'text-blue-700' : 'text-blue-500')}`}>
                                            <Icon name="clock" className="w-3 h-3" />
                                            DUE: {new Date(c.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* 3. Status Link */}
                                    <div className="w-full md:w-[15%] mb-4 md:mb-0">
                                        <button onClick={() => handleToggleStatus(c.id)} className="focus:outline-none">
                                            {isIsolated ? (
                                                <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(244,63,94,0.6)] hover:bg-rose-600 transition-colors">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                    TERISOLIR
                                                </span>
                                            ) : c.is_synced ? (
                                                c.mikrotik_enabled ? (
                                                    <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-50 transition-colors">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                                        AKTIF (ROUTER)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-amber-50 transition-colors">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                                        DISABLE (ROUTER)
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-300 transition-colors">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                    NOT FOUND
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* 4. Status Bayar */}
                                    <div className="w-full md:w-[10%] mb-4 md:mb-0">
                                        {c.status_bayar === 'paid' ? (
                                            <span className="inline-block px-3 py-1.5 bg-[#10b981] text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.3)]">LUNAS</span>
                                        ) : (
                                            <span className="inline-block px-3 py-1.5 bg-[#f59e0b] text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.3)]">TEMPO</span>
                                        )}
                                    </div>

                                    {/* 5. Actions */}
                                    <div className="w-full md:w-[15%] flex justify-end gap-2">
                                        <button 
                                            onClick={() => handlePayManual(c.id)}
                                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:scale-105 transition-all shadow-sm border border-slate-200"
                                            title="Bayar Lunas"
                                        >
                                            <Icon name="check" className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(c)}
                                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:scale-105 transition-all shadow-sm border border-slate-200"
                                            title="Edit Pelanggan"
                                        >
                                            <Icon name="edit" className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(c.id)}
                                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-105 transition-all shadow-sm border border-slate-200"
                                            title="Hapus Permanen"
                                        >
                                            <Icon name="delete" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-20 text-center text-admin-muted font-bold italic">Pelanggan tidak ditemukan.</div>
                    )}
                </div>
            </div>
            
            <Pagination meta={meta} onPageChange={(page) => fetchCustomers(page)} />

            {/* Global Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-admin-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-admin-border">
                        <div className={`p-8 text-center ${
                            modalConfig.type === 'error' ? 'bg-gradient-to-b from-rose-50/50 to-white' : 
                            modalConfig.type === 'warning' ? 'bg-gradient-to-b from-amber-50/50 to-white' : 
                            modalConfig.type === 'success' ? 'bg-gradient-to-b from-emerald-50/50 to-white' : 'bg-gradient-to-b from-blue-50/50 to-white'
                        }`}>
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${
                                modalConfig.type === 'error' ? 'bg-rose-500 text-admin-text shadow-rose-200' : 
                                modalConfig.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-200' : 
                                modalConfig.type === 'success' ? 'bg-emerald-500 text-admin-text shadow-emerald-200' : 'bg-admin-accent text-white shadow-blue-200'
                            }`}>
                                <Icon name={
                                    modalConfig.type === 'error' ? 'close' : 
                                    modalConfig.type === 'warning' ? 'info' : 
                                    modalConfig.type === 'success' ? 'check' : 'info'
                                } className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-admin-text tracking-tight leading-none mb-3">{modalConfig.title}</h3>
                            <p className="text-sm font-bold text-admin-muted leading-relaxed px-4">{modalConfig.message}</p>
                        </div>
                        <div className="p-6 bg-admin-card flex gap-3">
                            {(modalConfig.type === 'confirm' || modalConfig.type === 'warning') ? (
                                <>
                                    <button 
                                        onClick={closeModal}
                                        className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-muted bg-admin-base hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={() => {
                                            closeModal();
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                        className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-text shadow-lg transition-all hover:scale-[0.98] ${
                                            modalConfig.type === 'warning' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                        }`}
                                    >
                                        Ya, Lanjutkan
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal}
                                    className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-text shadow-lg transition-all hover:scale-[0.98] bg-slate-800 hover:bg-slate-900 shadow-slate-200"
                                >
                                    Tutup Pesan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerManagement
