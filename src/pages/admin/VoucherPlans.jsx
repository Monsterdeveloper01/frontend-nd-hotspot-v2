import { useState, useEffect } from 'react'

import { VoucherSkeleton } from '../../components/Skeleton'

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    timer: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    speed: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" />,
    delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    edit: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />,
    gaming: <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm3 4h2M8 12h2m-2 3h2" />
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
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
      setFormData({ name: '', is_gaming: false, duration_value: '', duration_unit: 'h', upload_limit: '', download_limit: '', shared_users: 1, price: 0 })
      setPriceDisplay('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const duration = `${formData.duration_value}${formData.duration_unit}`
    const payload = {
        ...formData,
        duration: duration
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
      alert('Terjadi kesalahan saat deploy ke Mikrotik. Cek koneksi router.')
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 sticky top-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                        {editingId ? 'Edit Plan' : 'Register Plan'}
                    </h3>
                    {editingId && (
                        <button 
                            onClick={handleCancelEdit}
                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700"
                        >
                            Cancel
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Plan Name</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. PREMIUM_1D" 
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={formData.is_gaming}
                                onChange={(e) => setFormData({...formData, is_gaming: e.target.checked})}
                                className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Gaming Area Tier</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Uptime Limit</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={formData.duration_value} 
                                onChange={(e) => setFormData({...formData, duration_value: e.target.value})}
                                placeholder="Value" 
                                className="w-2/3 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <select 
                                value={formData.duration_unit}
                                onChange={(e) => setFormData({...formData, duration_unit: e.target.value})}
                                className="w-1/3 px-2 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="h">Hrs</option>
                                <option value="d">Days</option>
                                <option value="m">Mo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                            <input 
                                type="text" 
                                value={priceDisplay} 
                                onChange={handlePriceChange}
                                placeholder="0"
                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Up Limit</label>
                            <input 
                                type="text" 
                                value={formData.upload_limit} 
                                onChange={(e) => setFormData({...formData, upload_limit: e.target.value})}
                                placeholder="e.g. 5M" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Down Limit</label>
                            <input 
                                type="text" 
                                value={formData.download_limit} 
                                onChange={(e) => setFormData({...formData, download_limit: e.target.value})}
                                placeholder="e.g. 15M" 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 transition-all flex items-center justify-center gap-2 ${submitting ? 'bg-slate-100 text-slate-400' : editingId ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-600/20 active:scale-95' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95'}`}
                    >
                        {submitting ? 'Processing...' : editingId ? 'Update & Sync Router' : 'Deploy to MikroTik'}
                    </button>
                </form>
            </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-3">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <VoucherSkeleton />
                    <VoucherSkeleton />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.length > 0 ? plans.map((plan) => (
                        <div key={plan.id} className={`bg-white p-10 rounded-[32px] shadow-sm border ${plan.is_gaming ? 'border-purple-200' : 'border-slate-200'} hover:shadow-xl transition-all group flex flex-col`}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${plan.is_gaming ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-900'} rounded-2xl flex items-center justify-center`}>
                                        <Icon name={plan.is_gaming ? "gaming" : "speed"} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{plan.name}</h3>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${plan.is_gaming ? 'text-purple-500' : 'text-blue-500'}`}>
                                            {plan.is_gaming ? 'Gaming Protocol' : 'Standard Access'}
                                        </p>
                                    </div>
                                </div>
                                {plan.is_gaming && (
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Low Latency</span>
                                )}
                            </div>
                            
                            <div className="mb-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price Structure</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">Rp {plan.price.toLocaleString()}</p>
                            </div>

                            <div className="space-y-3 mb-10">
                                <div className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                                    <span className="text-sm font-black text-slate-900 uppercase">{plan.duration}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Limit</span>
                                    <span className="text-sm font-black text-slate-900 uppercase">{plan.upload_limit}/{plan.download_limit}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100 flex justify-end gap-2">
                                <button 
                                    onClick={() => handleEdit(plan)}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-2"
                                    title="Edit Plan"
                                >
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(plan.id)}
                                    className="text-rose-400 hover:text-rose-600 transition-colors p-2"
                                    title="Delete Plan"
                                >
                                    <Icon name="delete" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest italic">No Master Plans Deployed</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  )
}

export default VoucherPlans
