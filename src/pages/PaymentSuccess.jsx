import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const PaymentSuccess = () => {
    const [voucherData, setVoucherData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [copyStatus, setCopyStatus] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const orderId = query.get('order_id')

    useEffect(() => {
        if (!orderId) {
            setError('Order ID tidak ditemukan di URL.')
            setLoading(false)
            return
        }
        
        fetchVoucherData(orderId)
    }, [orderId])

    const fetchVoucherData = async (oid) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher/details?order_id=${oid}`)
            
            if (response.data.success) {
                const data = response.data.data
                setVoucherData({
                    voucher_code: data.voucher_code,
                    buyer_phone: data.buyer_phone,
                    amount: data.amount,
                    payment_status: data.payment_status,
                    voucher_name: data.voucher?.name || 'Voucher Hotspot',
                    duration: data.voucher?.duration || '-',
                    created_at: data.created_at || new Date().toISOString(),
                })
                setLoading(false)
            } else {
                // Handle retry for processing status
                if (retryCount < 10) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1)
                        fetchVoucherData(oid)
                    }, 3000)
                } else {
                    setError('Voucher masih diproses. Silakan refresh halaman ini dalam beberapa saat.')
                    setLoading(false)
                }
            }
        } catch (err) {
            console.error('Fetch voucher error:', err)
            if (err.response?.status === 404) {
                // Maybe the callback hasn't arrived yet, retry
                if (retryCount < 10) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1)
                        fetchVoucherData(oid)
                    }, 3000)
                } else {
                    setError('Data voucher belum ditemukan. Pastikan pembayaran sudah selesai atau hubungi admin.')
                    setLoading(false)
                }
            } else {
                setError(err.response?.data?.message || 'Gagal mengambil data voucher.')
                setLoading(false)
            }
        }
    }

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID').format(number)
    }

    const copyVoucherCode = async () => {
        if (!voucherData?.voucher_code) return
        try {
            await navigator.clipboard.writeText(voucherData.voucher_code)
            setCopyStatus(true)
            setTimeout(() => setCopyStatus(false), 2000)
        } catch (err) {
            // Fallback
            const textArea = document.createElement('textarea')
            textArea.value = voucherData.voucher_code
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopyStatus(true)
            setTimeout(() => setCopyStatus(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-50">
                <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-sm w-full text-center border border-slate-100">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Syncing Voucher</h3>
                    <p className="text-sm text-slate-500 font-bold mb-6">
                        {retryCount > 0 ? `Retrying data sync (${retryCount}/10)...` : 'Wait a moment, finalizing your access...'}
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="bg-blue-600 h-full transition-all duration-300 animate-pulse" style={{ width: `${Math.min(retryCount * 10 + 10, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-slate-50">
                <div className="bg-white rounded-[40px] p-10 shadow-2xl max-w-md w-full text-center border border-rose-100">
                    <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <i className="fas fa-exclamation-triangle text-4xl text-rose-500"></i>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">System Alert</h1>
                    <p className="text-slate-600 font-bold mb-10 leading-relaxed px-4">{error}</p>
                    <div className="space-y-4">
                        <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"><i className="fas fa-sync-alt mr-2"></i> Refresh Halaman</button>
                        <Link to="/" className="block w-full bg-slate-100 text-slate-700 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">Kembali ke Beranda</Link>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Support Line:</p>
                        <p className="text-blue-600 font-black text-lg mt-1 tracking-tight">0812-8984-8787</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 px-4">
                <div className="max-w-md mx-auto">
                    
                    {/* Success Header */}
                    <div className="text-center mb-10 animate-bounce-in">
                        <div className="relative inline-block mb-6">
                            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white">
                                <i className="fas fa-check-circle text-6xl text-emerald-500"></i>
                            </div>
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                <i className="fas fa-star text-lg"></i>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Success!</h1>
                        <p className="text-slate-500 font-bold text-lg">Voucher Anda sudah aktif.</p>
                    </div>

                    {/* Voucher Card */}
                    <div className="bg-slate-900 rounded-[40px] p-8 mb-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600"></div>
                        
                        <div className="text-center mb-8 relative z-10">
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                                Kode Voucher Hotspot
                            </p>
                            <div className="flex flex-col items-center gap-6">
                                <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 w-full shadow-inner">
                                    <code className="text-4xl md:text-5xl font-black text-white tracking-[0.2em] select-all uppercase">
                                        {voucherData?.voucher_code || 'XXXXXX'}
                                    </code>
                                </div>
                                
                                <button
                                    onClick={copyVoucherCode}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
                                        copyStatus ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-emerald-50'
                                    }`}
                                >
                                    {copyStatus ? <><i className="fas fa-check"></i> Kode Disalin!</> : <><i className="fas fa-copy"></i> Salin Kode Voucher</>}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10">
                            <i className="fas fa-clock mr-2 text-blue-500"></i>
                            <span>Diterbitkan: {new Date(voucherData?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        
                        {/* Decorative background orbs */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 -left-10 w-24 h-24 bg-purple-600/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-[35px] p-8 mb-10 shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-receipt"></i>
                            </div>
                            Detail Pembelian
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket Internet</span>
                                <span className="font-black text-slate-900 text-sm uppercase">{voucherData?.voucher_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masa Aktif</span>
                                <span className="font-black text-blue-600 text-sm">{voucherData?.duration}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Aktif
                                </span>
                            </div>
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter italic">
                                        Rp {formatRupiah(voucherData?.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <a href="http://ndnet.login/login" target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl text-center active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                            <i className="fas fa-sign-in-alt"></i> Login ke Hotspot
                        </a>
                        <Link to="/" className="block w-full bg-white border-2 border-slate-200 text-slate-700 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 text-center uppercase tracking-widest text-xs">
                            <i className="fas fa-home mr-2"></i> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>

            {/* Toast Success */}
            {copyStatus && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 animate-bounce-in border border-white/10">
                    <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
                    <p className="font-black text-xs uppercase tracking-widest">Kode Voucher Disalin!</p>
                </div>
            )}
        </PublicLayout>
    )
}

export default PaymentSuccess
