import { useState, useEffect } from 'react'

import Pagination from '../../components/Pagination'

const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`}></div>
)

const Icon = ({ name, className = "w-4 h-4" }) => {
  const icons = {
    code: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    plus: <path d="M12 4v16m8-8H4" />,
    phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>
  );
};

const VoucherStock = () => {
  const [vouchers, setVouchers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(null)
  const [formData, setFormData] = useState({
    voucher_plan_id: '',
    quantity: 1
  })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchData(1)
  }, [])

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      
      const [vRes, pRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/vouchers?page=${page}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/voucher-plans`, { headers })
      ])
      
      const vData = await vRes.json()
      const pData = await pRes.json()
      
      setVouchers(vData.data || [])
      setMeta({
          current_page: vData.current_page,
          last_page: vData.last_page,
          links: vData.links,
          total: vData.total
      })
      setPlans(pData)
    } catch (err) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setFormData({ voucher_plan_id: '', quantity: 1 })
        fetchData(1)
        alert('Voucher Batch berhasil digenerate')
      }
    } catch (err) {
      console.error('Failed to generate vouchers')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus voucher ini? Ini juga akan menghapus user di Mikrotik.')) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      fetchData(meta.current_page)
    } catch (err) {
      console.error('Failed to delete voucher')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Form Section */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight uppercase">Generate Batch</h3>
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Target Service Plan</label>
                        <select 
                            value={formData.voucher_plan_id} 
                            onChange={(e) => setFormData({...formData, voucher_plan_id: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500 appearance-none"
                            required
                        >
                            <option value="">-- Select Master Plan --</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Quantity (Max 100)</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="100"
                            value={formData.quantity} 
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={generating}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 transition-all flex items-center justify-center gap-2 ${generating ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95'}`}
                    >
                        {generating ? 'Processing...' : 'Authorize Generation'}
                    </button>
                </form>
            </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-3">
            {loading ? (
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credentials</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plan Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {vouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                        <Icon name="code" className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-900 font-black tracking-widest text-lg uppercase leading-none block">{v.code}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Hotspot Key</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{v.plan?.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Profile Group</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-slate-900 italic tracking-tighter">Rp {v.price.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2
                                                    ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                      v.status === 'sold' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                      'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(v.id)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 inline-flex items-center"
                                                    title="Remove Voucher"
                                                >
                                                    <Icon name="delete" className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {vouchers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-10 py-24 text-center text-slate-400 font-bold italic">
                                                No credentials found in inventory.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination meta={meta} onPageChange={(page) => fetchData(page)} />
                </div>
            )}
        </div>
    </div>
  )
}

export default VoucherStock
