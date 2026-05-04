import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from '../../components/Pagination'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
        calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
        plus: <path d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
        edit: <path d="M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        check: <path d="M5 13l4 4L19 7" />,
        clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        fetchCustomers(1)
    }, [filterLink, filterPay, filterOverdue])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchCustomers(1, searchTerm)
    }

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

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/customers/${id}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (response.data.mikrotik_synced) {
                alert(response.data.message)
            } else {
                alert('⚠️ PERINGATAN: ' + response.data.message)
            }
            
            fetchCustomers(meta.current_page)
        } catch (err) {
            alert('Gagal memperbarui status')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus data pelanggan ini?')) return
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${import.meta.env.VITE_API_URL}/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchCustomers(meta.current_page)
        } catch (err) {
            alert('Gagal menghapus data')
        }
    }

    const handlePayManual = async (id) => {
        if (!confirm('Konfirmasi pembayaran manual?')) return
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/customers/${id}/pay-manual`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (response.data.mikrotik_synced) {
                alert(response.data.message)
            } else {
                alert('⚠️ PERINGATAN: ' + response.data.message)
            }
            
            fetchCustomers(meta.current_page)
        } catch (err) {
            alert('Gagal memproses pembayaran')
        }
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
            
            handleCancelEdit()
            fetchCustomers(1)
            alert(editingId ? 'Data berhasil diupdate' : 'Pelanggan berhasil ditambahkan')
        } catch (err) {
            alert('Terjadi kesalahan sistem')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Data Pelanggan</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Kelola database pelanggan, tagihan bulanan, dan status isolasi</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-blue-600 text-white shadow-blue-200'}`}>
                            <Icon name={editingId ? "edit" : "plus"} className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                                {editingId ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lengkapi data identitas dan detail penagihan</p>
                        </div>
                    </div>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Batal Edit</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Group 1 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="user" className="w-3 h-3" /> Identitas Personal
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="Username MikroTik"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nomor WhatsApp</label>
                                <input 
                                    type="text" 
                                    value={formData.whatsapp}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.startsWith('0')) val = '62' + val.substring(1);
                                        else if (val.length > 0 && !val.startsWith('62')) val = '62' + val;
                                        setFormData({...formData, whatsapp: val});
                                    }}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="628..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 2 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="calendar" className="w-3 h-3" /> Detail Tagihan
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Jumlah Tagihan (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">Rp</span>
                                    <input 
                                        type="number" 
                                        value={formData.billing_amount}
                                        onChange={(e) => setFormData({...formData, billing_amount: e.target.value})}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Tanggal Jatuh Tempo</label>
                                <input 
                                    type="date" 
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    required
                                />
                            </div>
                        </div>

                        {/* Group 3: Button */}
                        <div className="flex items-end pb-1">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${submitting ? 'bg-slate-100 text-slate-400' : editingId ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
                            >
                                <Icon name="check" className="w-4 h-4" />
                                {submitting ? 'Processing...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List & Filter Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-300" 
                                placeholder="Cari Nama / WhatsApp..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Icon name="search" className="w-5 h-5 text-slate-400" />
                            </div>
                            <button type="submit" className="hidden">Search</button>
                        </form>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select 
                                value={filterLink}
                                onChange={(e) => setFilterLink(e.target.value)}
                                className="px-4 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            >
                                <option value="all">SEMUA LINK</option>
                                <option value="active">LINK AKTIF</option>
                                <option value="isolated">TERISOLIR</option>
                            </select>

                            <select 
                                value={filterPay}
                                onChange={(e) => setFilterPay(e.target.value)}
                                className="px-4 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            >
                                <option value="all">SEMUA BAYAR</option>
                                <option value="paid">LUNAS</option>
                                <option value="unpaid">TEMPO</option>
                            </select>

                            <button 
                                onClick={() => setFilterOverdue(!filterOverdue)}
                                className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center gap-2 whitespace-nowrap ${filterOverdue ? 'bg-rose-500 text-white border-rose-500 shadow-rose-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300'}`}
                            >
                                <Icon name="clock" className={`w-3 h-3 ${filterOverdue ? 'text-white' : 'text-rose-500'}`} />
                                {filterOverdue ? 'JATUH TEMPO ON' : 'CEK JATUH TEMPO'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-inner">
                        Total: {meta?.total || 0} Records
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pelanggan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Info Tagihan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status Link</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status Bayar</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">Loading records...</td>
                                </tr>
                            ) : customers.length > 0 ? customers.map((c) => (
                                <tr key={c.id} className={`hover:bg-blue-50/30 transition-colors group ${c.is_isolated ? 'bg-rose-50/70' : ''}`}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ${c.is_isolated ? 'bg-rose-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg leading-none uppercase tracking-tight">
                                                    {c.name}
                                                    {c.is_isolated && <span className="ml-2 text-[8px] bg-rose-600 text-white px-2 py-0.5 rounded-full align-middle">ISOLATED</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Icon name="phone" className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-400 font-bold text-[11px]">{c.whatsapp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-800 text-sm">Rp {Number(c.billing_amount).toLocaleString('id-ID')}</div>
                                        <div className={`text-[10px] font-black uppercase mt-1 tracking-widest flex items-center gap-2 ${c.is_isolated ? 'text-rose-600' : 'text-blue-500'}`}>
                                            <Icon name="clock" className="w-3 h-3" />
                                            Due: {new Date(c.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(c.id)}
                                            className="focus:outline-none"
                                        >
                                            {c.is_isolated ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-700 shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                    Terisolir
                                                </span>
                                            ) : c.is_synced ? (
                                                c.mikrotik_enabled ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></span>
                                                        Aktif (Router)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                                        Disable (Router)
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                    Not Found
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {c.status_bayar === 'paid' ? (
                                            <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Lunas</span>
                                        ) : (
                                            <span className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Tempo</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handlePayManual(c.id)}
                                                className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Bayar Manual"
                                            >
                                                <Icon name="check" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(c)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit"
                                            >
                                                <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(c.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Hapus"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center text-slate-400 font-bold italic">No subscribers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Pagination meta={meta} onPageChange={(page) => fetchCustomers(page)} />
        </div>
    )
}

export default CustomerManagement
