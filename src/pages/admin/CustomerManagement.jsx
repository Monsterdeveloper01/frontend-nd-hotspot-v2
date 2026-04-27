import { useState, useEffect } from 'react'
import axios from 'axios'

import Pagination from '../../components/Pagination'

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        billing_amount: '',
        due_date: ''
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchCustomers = async (page = 1) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/customers?page=${page}`, {
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
    }, [])

    const handlePayManual = async (id) => {
        if (!confirm('Konfirmasi pembayaran manual?')) return
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${import.meta.env.VITE_API_URL}/customers/${id}/pay-manual`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Pembayaran berhasil dan struk dikirim via WA')
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
            await axios.post(`${import.meta.env.VITE_API_URL}/customers`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFormData({ name: '', whatsapp: '', billing_amount: '', due_date: '' })
            fetchCustomers(1)
            alert('Pelanggan berhasil ditambahkan')
        } catch (err) {
            alert('Gagal menambah pelanggan. Pastikan nama unik.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 sticky top-12">
                    <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight uppercase">Register Subscriber</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">MikroTik Username</label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. user_pro_01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">WhatsApp Number</label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                placeholder="628..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Monthly Bill (IDR)</label>
                            <input 
                                type="number" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.billing_amount}
                                onChange={(e) => setFormData({...formData, billing_amount: e.target.value})}
                                placeholder="150000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Due Date</label>
                            <input 
                                type="date" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 transition-all flex items-center justify-center gap-2 ${submitting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {submitting ? 'Registering...' : 'Register Subscriber'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Table Section */}
            <div className="lg:col-span-3">
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer Data</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Billing Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                            Synchronizing customer records...
                                        </td>
                                    </tr>
                                ) : customers.length > 0 ? customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-slate-900 text-lg leading-none mb-1 uppercase tracking-tight">{c.name}</div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-400 font-bold text-[11px]">{c.whatsapp}</span>
                                                {c.is_synced ? (
                                                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg uppercase border border-emerald-100">Linked</span>
                                                ) : (
                                                    <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg uppercase border border-rose-100 animate-pulse">Disconnected</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-blue-600 italic tracking-tighter">Rp {Number(c.billing_amount).toLocaleString('id-ID')}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest flex items-center gap-2">
                                                <i className="fas fa-calendar-alt text-[9px]"></i>
                                                Due: {new Date(c.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.is_isolated ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.is_isolated ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                                {c.is_isolated ? 'Isolated' : 'Operational'}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 mt-2.5 ml-1 uppercase tracking-widest flex items-center gap-2">
                                                <div className={`w-1 h-1 rounded-full ${c.status_bayar === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {c.status_bayar === 'paid' ? 'Subscription Active' : 'Payment Overdue'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handlePayManual(c.id)}
                                                className="bg-white border border-emerald-100 text-emerald-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 shadow-sm"
                                            >
                                                Manual Payment
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-24 text-center text-slate-400 font-bold italic">
                                            No active subscribers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <Pagination meta={meta} onPageChange={(page) => fetchCustomers(page)} />
            </div>
        </div>
    )
}

export default CustomerManagement
