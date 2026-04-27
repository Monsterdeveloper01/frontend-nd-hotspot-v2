import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const GamingCheckout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { plan } = location.state || {}
    
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [paymentResult, setPaymentResult] = useState(null)
    const [error, setError] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    useEffect(() => {
        if (!plan) {
            navigate('/gaming-area')
            return
        }
    }, [plan, navigate])

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID').format(number)
    }

    const validatePhone = (number) => {
        return /^[0-9]{8,15}$/.test(number)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        if (!validatePhone(phone)) {
            setError('Nomor WhatsApp harus 8-15 digit angka')
            return
        }
        setShowConfirmModal(true)
    }

    const confirmPayment = async () => {
        setShowConfirmModal(false)
        setLoading(true)

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/checkout`, {
                voucher_plan_id: plan.id,
                phone: phone
            })

            if (response.data.success) {
                setPaymentResult(response.data.transaction)
                startPaymentPolling(response.data.transaction.id)
            } else {
                setError(response.data.message || 'Error processing payment')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error')
        } finally {
            setLoading(false)
        }
    }

    const startPaymentPolling = (transactionId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/${transactionId}`)
                const data = response.data
                if (data.status === 'success') {
                    clearInterval(interval)
                    navigate(`/gaming-success?order_id=${data.external_id}`)
                } else if (data.status === 'expire' || data.status === 'cancel') {
                    clearInterval(interval)
                    setError('Payment expired or cancelled')
                    setPaymentResult(null)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }, 3000)
    }

    if (!plan) return null

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4 selection:bg-purple-500">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#1e1e26 1px, transparent 1px), linear-gradient(90deg, #1e1e26 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full z-0"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Modal Konfirmasi Gaming Style */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-[#121217] border border-purple-500/30 rounded-[35px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-bounce-in">
                            <div className="bg-white/5 px-8 py-6 border-b border-white/5">
                                <h3 className="text-lg font-black italic uppercase tracking-widest text-purple-400 flex items-center gap-3">
                                    <i className="fas fa-shield-alt"></i> Verify Target
                                </h3>
                            </div>
                            <div className="p-8 text-center">
                                <p className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest leading-relaxed">
                                    Voucher will be deployed to this WhatsApp destination:
                                </p>
                                <div className="bg-purple-600/10 rounded-2xl p-6 border border-purple-500/20 mb-6">
                                    <p className="text-3xl font-black italic tracking-[0.1em] text-white">
                                        +62 {phone}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">Abort</button>
                                    <button onClick={confirmPayment} className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-600/30">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {paymentResult ? (
                    <div className="bg-[#121217] border border-white/5 rounded-[45px] p-10 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        <div className="mb-10">
                            <div className="w-20 h-20 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <i className="fas fa-qrcode text-3xl"></i>
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Scan & Unlock</h2>
                            <p className="text-slate-500 font-bold text-sm">Deploying high-priority gaming access...</p>
                        </div>

                        <div className="bg-white p-4 rounded-[40px] border-4 border-purple-600/20 inline-block mb-10 shadow-2xl shadow-purple-600/10">
                            <img src={paymentResult.payment_url} className="w-64 h-64 rounded-[30px]" alt="Gaming QRIS" />
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-10 text-left relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Cost</span>
                                <span className="text-2xl font-black italic text-purple-400 tracking-tighter">Rp {formatRupiah(plan.price)}</span>
                            </div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">ID: {paymentResult.external_id}</div>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] bg-purple-600/10 px-6 py-3 rounded-full border border-purple-500/20 animate-pulse">
                                <i className="fas fa-circle-notch fa-spin"></i> Awaiting Deployment...
                            </div>
                            <button onClick={() => window.location.reload()} className="block mx-auto text-slate-600 hover:text-slate-400 text-[9px] font-black uppercase tracking-widest transition">Cancel Mission</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#121217] border border-white/5 rounded-[45px] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-10 bg-gradient-to-br from-[#1a1a24] to-[#121217] border-b border-white/5 relative">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Finalize <span className="text-purple-500">Access</span></h1>
                                    <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">Gaming Area Deployment</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                                    <i className="fas fa-bolt"></i>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Tier Plan</p>
                                        <p className="text-xl font-black italic uppercase tracking-tighter">{plan.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black italic text-white tracking-tighter">Rp {formatRupiah(plan.price)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Destination Number</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 font-black italic">+62</div>
                                    <input 
                                        type="tel" 
                                        id="phoneInput"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                        placeholder="812xxxxx" 
                                        className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500 outline-none transition font-black italic text-xl placeholder:text-slate-700"
                                        inputMode="numeric"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                <div className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20 flex gap-4 items-start">
                                    <i className="fas fa-exclamation-triangle text-purple-500 mt-1"></i>
                                    <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest leading-relaxed">Ensure number accuracy. Encrypted access code will be pushed via WhatsApp immediately.</p>
                                </div>
                                {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {error}</p>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !phone}
                                className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-black italic uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-purple-600/20 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : <><i className="fas fa-rocket"></i> Launch Payment</>}
                            </button>

                            <div className="text-center pt-4">
                                <Link to="/gaming-area" className="text-slate-600 hover:text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center justify-center gap-3">
                                    <i className="fas fa-arrow-left"></i> Re-select Plan
                                </Link>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GamingCheckout
