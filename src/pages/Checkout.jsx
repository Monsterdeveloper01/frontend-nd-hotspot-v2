import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const Checkout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { plan } = location.state || {}
    
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [paymentResult, setPaymentResult] = useState(null)
    const [error, setError] = useState('')
    const [theme, setTheme] = useState(null)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const themes = [
        {
            name: 'blue',
            primary: {
                from: 'from-blue-500',
                to: 'to-cyan-500',
                color: 'text-blue-600',
                border: 'border-blue-500',
                ring: 'ring-blue-500',
                light: 'bg-blue-50',
                dark: 'bg-blue-600',
                gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500'
            },
            accent: {
                color: 'text-amber-500',
                bg: 'bg-amber-50',
            }
        },
        {
            name: 'green',
            primary: {
                from: 'from-emerald-500',
                to: 'to-green-500',
                color: 'text-emerald-600',
                border: 'border-emerald-500',
                ring: 'ring-emerald-500',
                light: 'bg-emerald-50',
                dark: 'bg-emerald-600',
                gradient: 'bg-gradient-to-br from-emerald-500 to-green-500'
            },
            accent: {
                color: 'text-orange-500',
                bg: 'bg-orange-50',
            }
        },
        {
            name: 'purple',
            primary: {
                from: 'from-purple-500',
                to: 'to-indigo-500',
                color: 'text-purple-600',
                border: 'border-purple-500',
                ring: 'ring-purple-500',
                light: 'bg-purple-50',
                dark: 'bg-purple-600',
                gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500'
            },
            accent: {
                color: 'text-pink-500',
                bg: 'bg-pink-50',
            }
        }
    ]

    useEffect(() => {
        if (!plan) {
            navigate('/')
            return
        }
        
        // Random theme selection
        const randomTheme = themes[Math.floor(Math.random() * themes.length)]
        setTheme(randomTheme)
        
        // Auto-focus phone input
        setTimeout(() => {
            document.getElementById('phoneInput')?.focus()
        }, 300)
    }, [plan, navigate])

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID').format(number)
    }

    const validatePhone = (number) => {
        // Valid if it's 9-13 digits (after stripping 0/62)
        return /^[0-9]{9,13}$/.test(number)
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
                phone: '62' + phone
            })

            if (response.data.success) {
                setPaymentResult(response.data.transaction)
                startPaymentPolling(response.data.transaction.id)
            } else {
                setError(response.data.message || 'Terjadi kesalahan saat memproses pembayaran')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghubungi server pembayaran')
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
                    navigate(`/payment-success?order_id=${data.external_id}`)
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

    if (!theme || !plan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Memuat...</p>
                </div>
            </div>
        )
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 py-20">
                <div className="w-full max-w-md animate-fade-in">
                    
                    {/* Modal Konfirmasi */}
                    {showConfirmModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-bounce-in">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-exclamation-circle text-amber-500"></i>
                                        Konfirmasi Nomor WhatsApp
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm mb-4">
                                        Pastikan nomor WhatsApp Anda sudah benar. Voucher akan dikirim ke nomor ini setelah pembayaran berhasil.
                                    </p>
                                    <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Nomor Tujuan</p>
                                        <p className="text-2xl font-bold text-gray-800 tracking-wider">
                                            +62 {phone}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <i className="fas fa-info-circle mt-0.5"></i>
                                        <span>Pastikan nomor aktif. Kesalahan nomor bukan tanggung jawab kami.</span>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 flex gap-3">
                                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">Batal</button>
                                    <button onClick={confirmPayment} className={`flex-1 ${theme.primary.gradient} text-white font-semibold py-3 rounded-xl shadow-lg`}>Konfirmasi</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentResult ? (
                        <div className="bg-white rounded-2xl md:rounded-[30px] shadow-lg border border-gray-200 p-6 md:p-8 text-center relative overflow-hidden">
                            <div className="mb-6">
                                <div className={`w-16 h-16 ${theme.primary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                    <i className="fas fa-qrcode text-white text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-tight">Scan QR Code</h3>
                                <p className="text-gray-600 text-sm font-medium">Scan dengan aplikasi e-wallet atau mobile banking</p>
                            </div>
                            
                            <div className="mb-8">
                                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-gray-100 inline-block shadow-inner relative group">
                                    <img 
                                        src={paymentResult.payment_url} 
                                        className="w-56 h-56 md:w-60 md:h-60 rounded-lg mx-auto" 
                                        alt="QR Code" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            // PRIORITASKAN qr_string untuk QRIS yang valid (IDR), bukan link gambar
                                            const qrData = paymentResult.qr_string || paymentResult.payment_url;
                                            e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData);
                                        }}
                                    />
                                    <div className="mt-4 flex flex-col gap-2">
                                        <a 
                                            href={paymentResult.payment_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 underline uppercase tracking-widest"
                                        >
                                            <i className="fas fa-external-link-alt mr-1"></i> Buka Gambar di Tab Baru
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`bg-gradient-to-r ${theme.primary.light} rounded-2xl p-6 border ${theme.primary.border}/20 mb-6`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600 font-bold text-sm">Total Pembayaran</span>
                                    <span className={`text-2xl font-black ${theme.primary.color}`}>
                                        Rp {formatRupiah(plan.price)}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-500 text-left font-black uppercase tracking-widest mt-2">
                                    Order ID: {paymentResult.external_id}
                                </div>
                            </div>

                            {/* Captive Portal Fix / Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <i className="fas fa-info-circle"></i> QR Tidak Muncul?
                                </p>
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                    Jika Anda menggunakan browser bawaan Wifi (Captive Portal) dan QR tidak muncul, silakan <b>Salin Link</b> lalu buka di <b>Chrome/Safari</b> biasa.
                                </p>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link pembayaran berhasil disalin! Silakan buka Chrome/Safari dan tempel link tersebut.');
                                    }}
                                    className="mt-3 w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Salin Link Pembayaran
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-3 ${theme.primary.color} text-xs font-black uppercase tracking-widest ${theme.primary.light} px-4 py-2 rounded-xl animate-pulse border ${theme.primary.border}/20`}>
                                    <i className="fas fa-sync fa-spin"></i> 
                                    Menunggu pembayaran...
                                </div>
                                <div>
                                    <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest transition">Batalkan & Kembali</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[25px] md:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                            <div className={`${theme.primary.gradient} p-6 md:p-8 text-white relative`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Checkout</h1>
                                        <p className="text-white/80 text-[10px] md:text-xs font-bold mt-1 uppercase tracking-widest">Konfirmasi pembelian voucher</p>
                                    </div>
                                    <div className="text-3xl opacity-50">
                                        <i className="fas fa-shopping-basket"></i>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest">{plan.name}</p>
                                            <div className="flex gap-3 mt-1.5 opacity-80">
                                                <div className="flex items-center gap-1 text-[8px] font-black text-white uppercase">
                                                    <i className="fas fa-arrow-up"></i> {plan.upload_limit} Mbps
                                                </div>
                                                <div className="flex items-center gap-1 text-[8px] font-black text-white uppercase">
                                                    <i className="fas fa-arrow-down"></i> {plan.download_limit} Mbps
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black italic">Rp {formatRupiah(plan.price)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Nomor WhatsApp *</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">+62</div>
                                        <input 
                                            type="tel" 
                                            id="phoneInput"
                                            value={phone}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.startsWith('0')) val = val.substring(1);
                                                if (val.startsWith('62')) val = val.substring(2);
                                                setPhone(val);
                                            }}
                                            required 
                                            placeholder="812xxxxx" 
                                            className="w-full pl-14 md:pl-16 pr-6 py-4 md:py-5 bg-gray-50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-blue-500 outline-none transition font-black text-base md:text-lg placeholder:text-gray-300"
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3 text-[10px] text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-200 font-bold leading-relaxed">
                                        <i className="fas fa-exclamation-triangle mt-0.5"></i>
                                        <span>Pastikan nomor sudah benar. Voucher akan dikirim otomatis ke nomor tersebut.</span>
                                    </div>
                                    {error && <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-2"><i className="fas fa-exclamation-circle"></i>{error}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Metode Pembayaran</label>
                                    <div className={`border-2 ${theme.primary.border} bg-white rounded-2xl p-4 flex items-center justify-between`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${theme.primary.light} rounded-xl flex items-center justify-center`}>
                                                <i className={`fas fa-qrcode ${theme.primary.color} text-xl`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800 text-sm uppercase">QRIS</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">All E-Wallets & Banks</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 ${theme.primary.gradient} rounded-full flex items-center justify-center text-white text-[10px]`}>
                                            <i className="fas fa-check"></i>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading || !phone}
                                    className={`w-full ${theme.primary.gradient} text-white font-black py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs`}
                                >
                                    {loading ? <i className="fas fa-circle-notch animate-spin text-lg"></i> : <><i className="fas fa-bolt"></i> Bayar Sekarang</>}
                                </button>

                                <div className="text-center pt-2">
                                    <Link to="/" className="text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2">
                                        <i className="fas fa-arrow-left"></i> Kembali ke Menu Utama
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default Checkout
