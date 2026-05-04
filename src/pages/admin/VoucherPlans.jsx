import { useState, useEffect } from 'react'
import Pagination from '../../components/Pagination'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        timer: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        speed: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
        users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        edit: <path d="M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
        gaming: <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm3 4h2M8 12h2m-2 3h2" />,
        plus: <path d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
        check: <path d="M5 13l4 4L19 7" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const VoucherPlans = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [priceDisplay, setPriceDisplay] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        mikrotik_profile: '',
        is_gaming: false,
        duration_value: '',
        duration_unit: 'h',
        upload_limit: '',
        download_limit: '',
        shared_users: 1,
        price: 0
    })

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/voucher-plans`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            })
            if (!response.ok) throw new Error('API Error')
            const data = await response.json()
            setPlans(data)
        } catch (err) {
            console.error('Failed to fetch plans:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatRupiah = (value) => {
        if (!value) return ''
        const number = value.toString().replace(/[^0-9]/g, '')
        return new Intl.NumberFormat('id-ID').format(number)
    }

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '')
        setPriceDisplay(formatRupiah(rawValue))
        setFormData({ ...formData, price: parseInt(rawValue) || 0 })
    }

    const handleEdit = (plan) => {
        setEditingId(plan.id)
        const durationValue = plan.duration.match(/\d+/)[0]
        const durationUnit = plan.duration.replace(/\d+/, '')
        
        setFormData({
            name: plan.name,
            mikrotik_profile: plan.mikrotik_profile || '',
            is_gaming: plan.is_gaming,
            duration_value: durationValue,
            duration_unit: durationUnit,
            upload_limit: plan.upload_limit,
            download_limit: plan.download_limit,
            shared_users: plan.shared_users,
            price: plan.price
        })
        setPriceDisplay(formatRupiah(plan.price))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ name: '', mikrotik_profile: '', is_gaming: false, duration_value: '', duration_unit: 'h', upload_limit: '', download_limit: '', shared_users: 1, price: 0 })
        setPriceDisplay('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        
        const duration = `${formData.duration_value}${formData.duration_unit}`
        const payload = {
            ...formData,
            duration: duration,
            mikrotik_profile: formData.mikrotik_profile || formData.name.replace(/\s+/g, '-')
        }

        try {
            const url = editingId 
                ? `${import.meta.env.VITE_API_URL}/voucher-plans/${editingId}`
                : `${import.meta.env.VITE_API_URL}/voucher-plans`
                
            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (response.ok) {
                handleCancelEdit()
                fetchPlans()
                alert(data.message || 'Berhasil sinkron ke RouterOS')
            } else {
                alert(data.message || 'Gagal menyimpan plan')
            }
        } catch (err) {
            console.error('Failed to save plan')
            alert('Terjadi kesalahan saat deploy ke Mikrotik')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus master voucher ini? Ini juga akan menghapus profile di Mikrotik.')) return
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/voucher-plans/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            })
            const data = await response.json()
            if (response.ok) {
                fetchPlans()
            } else {
                alert(data.message || 'Gagal menghapus plan')
            }
        } catch (err) {
            console.error('Failed to delete plan')
        }
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Master Voucher</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Kelola paket layanan dan limitasi bandwidth MikroTik</p>
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
                                {editingId ? 'Edit Master Plan' : 'Tambah Paket Baru'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Konfigurasi profile MikroTik secara otomatis</p>
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
                                <Icon name="speed" className="w-3 h-3" /> Basic Information
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Paket (Display)</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="e.g. PREMIUM 1 HARI"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">MikroTik Profile (System)</label>
                                <input 
                                    type="text" 
                                    value={formData.mikrotik_profile}
                                    onChange={(e) => setFormData({...formData, mikrotik_profile: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="e.g. PREMIUM_1H"
                                />
                                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase ml-1">Nama profile yang akan masuk ke MikroTik</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={formData.is_gaming}
                                        onChange={(e) => setFormData({...formData, is_gaming: e.target.checked})}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Gaming Tier Area</span>
                                </label>
                            </div>
                        </div>

                        {/* Group 2 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="timer" className="w-3 h-3" /> Limitasi & Harga
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Masa Aktif</label>
                                    <input 
                                        type="number" 
                                        value={formData.duration_value}
                                        onChange={(e) => setFormData({...formData, duration_value: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="Value"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Satuan</label>
                                    <select 
                                        value={formData.duration_unit}
                                        onChange={(e) => setFormData({...formData, duration_unit: e.target.value})}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="h">Hrs</option>
                                        <option value="d">Days</option>
                                        <option value="m">Mo</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Harga Jual (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">Rp</span>
                                    <input 
                                        type="text" 
                                        value={priceDisplay}
                                        onChange={handlePriceChange}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Group 3 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Icon name="speed" className="w-3 h-3" /> Bandwidth Limit
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Upload (Mbps)</label>
                                    <input 
                                        type="text" 
                                        value={formData.upload_limit}
                                        onChange={(e) => setFormData({...formData, upload_limit: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Download (Mbps)</label>
                                    <input 
                                        type="text" 
                                        value={formData.download_limit}
                                        onChange={(e) => setFormData({...formData, download_limit: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="e.g. 15"
                                    />
                                </div>
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cukup isi angka (misal: 5), sistem otomatis menambah 'M'</p>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-2 transition-all flex items-center justify-center gap-3 ${submitting ? 'bg-slate-100 text-slate-400' : editingId ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
                            >
                                <Icon name="check" className="w-4 h-4" />
                                {submitting ? 'Processing...' : editingId ? 'Update & Sync' : 'Deploy to Router'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List Table Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Paket Layanan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Limitasi</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Tipe Paket</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Harga</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">Loading master data...</td>
                                </tr>
                            ) : plans.length > 0 ? plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md ${plan.is_gaming ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                                <Icon name={plan.is_gaming ? "gaming" : "speed"} className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg leading-none uppercase tracking-tight">{plan.name}</div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Icon name="timer" className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{plan.duration} Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-800 text-sm">{plan.upload_limit} / {plan.download_limit}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Rate Limit Group</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {plan.is_gaming ? (
                                            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-purple-200">Gaming</span>
                                        ) : (
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 text-lg tracking-tighter">Rp {plan.price.toLocaleString('id-ID')}</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(plan)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(plan.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center text-slate-400 font-bold italic">No plans available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default VoucherPlans
