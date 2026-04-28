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
                setError(response.data.message || 'Gagal memproses pembayaran')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kesalahan server')
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
                    setError('Pembayaran kadaluarsa atau dibatalkan')
                    setPaymentResult(null)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }, 3000)
    }

    if (!plan) return null

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-purple-600 selection:text-white">
            {/* Soft Grid Background */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 blur-[120px] rounded-full z-0"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Modal Konfirmasi Light Theme */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white border-2 border-purple-100 rounded-[35px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-bounce-in">
                            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                                <h3 className="text-lg font-black italic uppercase tracking-widest text-purple-600 flex items-center gap-3">
                                    <i className="fas fa-shield-alt"></i> Verifikasi Target
                                </h3>
                            </div>
                            <div className="p-8 text-center">
                                <p className="text-slate-500 text-xs font-bold mb-6 uppercase tracking-widest leading-relaxed">
                                    Voucher akan dikirimkan ke tujuan WhatsApp berikut:
                                </p>
                                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 mb-6">
                                    <p className="text-3xl font-black italic tracking-[0.1em] text-purple-700">
                                        +62 {phone}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-50 transition-all">Batal</button>
                                    <button onClick={confirmPayment} className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-200">Konfirmasi</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {paymentResult ? (
                    <div className="bg-white border-2 border-slate-100 rounded-[45px] p-10 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        <div className="mb-10">
                            <div className="w-20 h-20 bg-purple-50 text-purple-600 border border-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <i className="fas fa-qrcode text-3xl"></i>
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Scan & Bayar</h2>
                            <p className="text-slate-500 font-bold text-sm">Menyiapkan akses prioritas gaming...</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-[40px] border-4 border-purple-50 inline-block mb-10 shadow-inner">
                            <img src={paymentResult.payment_url} className="w-64 h-64 rounded-[30px]" alt="Gaming QRIS" />
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 text-left relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biaya Protokol</span>
                                <span className="text-2xl font-black italic text-purple-600 tracking-tighter">Rp {formatRupiah(plan.price)}</span>
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">ID Transaksi: {paymentResult.external_id}</div>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] bg-purple-50 px-6 py-3 rounded-full border border-purple-100 animate-pulse">
                                <i className="fas fa-circle-notch fa-spin"></i> Menunggu Pembayaran...
                            </div>
                            <button onClick={() => window.location.reload()} className="block mx-auto text-slate-400 hover:text-slate-600 text-[9px] font-black uppercase tracking-widest transition">Batalkan Misi</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-slate-100 rounded-[45px] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-10 bg-slate-50 border-b border-slate-100 relative">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Finalisasi <span className="text-purple-600">Akses</span></h1>
                                    <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">Deployment Area Gaming</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                                    <i className="fas fa-bolt"></i>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Paket Tier</p>
                                        <p className="text-xl font-black italic uppercase tracking-tighter text-slate-700">{plan.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black italic text-slate-900 tracking-tighter">Rp {formatRupiah(plan.price)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Nomor Tujuan (WhatsApp)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-600 font-black italic text-lg">+62</div>
                                    <input 
                                        type="tel" 
                                        id="phoneInput"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                        placeholder="812xxxxx" 
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-400 focus:bg-white outline-none transition font-black italic text-xl text-slate-800 placeholder:text-slate-300"
                                        inputMode="numeric"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start">
                                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">Pastikan nomor akurat. Kode akses terenkripsi akan dikirim via WhatsApp segera setelah bayar.</p>
                                </div>
                                {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-1"><i className="fas fa-exclamation-circle"></i> {error}</p>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !phone}
                                className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-black italic uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : <><i className="fas fa-rocket"></i> Luncurkan Pembayaran</>}
                            </button>

                            <div className="text-center pt-4">
                                <Link to="/gaming-area" className="text-slate-400 hover:text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center justify-center gap-3">
                                    <i className="fas fa-arrow-left"></i> Pilih Ulang Paket
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
