import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

const GamingSuccess = () => {
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
            setError('AKSES DITOLAK: ID Pesanan Tidak Ditemukan.')
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
                    voucher_name: data.voucher?.name || 'Gaming Elite Access',
                    duration: data.voucher?.duration || '-',
                    created_at: data.created_at || new Date().toISOString(),
                })
                setLoading(false)
            } else {
                if (retryCount < 10) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1)
                        fetchVoucherData(oid)
                    }, 3000)
                } else {
                    setError('WAKTU HABIS: Sinkronisasi data gagal.')
                    setLoading(false)
                }
            }
        } catch (err) {
            if (retryCount < 10) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1)
                    fetchVoucherData(oid)
                }, 3000)
            } else {
                setError('KESALAHAN SISTEM: Data gagal dimanifestasikan.')
                setLoading(false)
            }
        }
    }

    const copyVoucherCode = async () => {
        if (!voucherData?.voucher_code) return
        try {
            await navigator.clipboard.writeText(voucherData.voucher_code)
            setCopyStatus(true)
            setTimeout(() => setCopyStatus(false), 2000)
        } catch (err) {
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[45px] p-12 shadow-2xl border border-slate-100 max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-pulse"></div>
                    <div className="flex justify-center mb-10">
                        <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Dekripsi...</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">Menyinkronkan Kunci Akses</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div className="bg-purple-600 h-full transition-all duration-300 animate-pulse" style={{ width: `${Math.min(retryCount * 10 + 10, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[45px] p-12 shadow-2xl border-2 border-rose-100 max-w-md w-full text-center">
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-rose-100 shadow-sm">
                        <FaIcon name="skull" className="text-4xl text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Kesalahan Transmisi</h1>
                    <p className="text-slate-500 font-bold mb-12 uppercase tracking-widest text-[10px] leading-relaxed px-4">{error}</p>
                    <div className="space-y-4">
                        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-[0.2em] text-xs italic"><FaIcon name="sync-alt" className="mr-2" /> Coba Lagi</button>
                        <Link to="/gaming-area" className="block w-full border-2 border-slate-200 text-slate-600 font-black py-5 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xs italic">Kembali ke Base</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 selection:bg-purple-600 selection:text-white">
            {/* Background Effects */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/40 blur-[120px] rounded-full z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/40 blur-[120px] rounded-full z-0"></div>

            <div className="max-w-md mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="relative inline-block mb-8">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-purple-100">
                            <FaIcon name="check-circle" className="text-7xl text-purple-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-4 border-slate-50 animate-bounce">
                            <FaIcon name="trophy" className="text-lg" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Sukses!</h1>
                    <p className="text-purple-600 font-black uppercase tracking-[0.3em] text-[10px]">Akses Diberikan ke Area Gaming</p>
                </div>

                {/* Voucher Card Light Theme */}
                <div className="bg-white rounded-[45px] p-10 mb-10 shadow-2xl relative overflow-hidden group border-2 border-slate-100">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600"></div>
                    
                    <div className="text-center mb-10 relative z-10">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 italic">
                            Kunci Enkripsi (Kode Voucher)
                        </p>
                        <div className="flex flex-col items-center gap-8">
                            <div className="bg-slate-50 border-2 border-purple-50 rounded-[35px] p-8 w-full shadow-inner group-hover:border-purple-200 transition-all">
                                <code className="text-5xl md:text-6xl font-black text-slate-900 tracking-[0.1em] select-all uppercase italic">
                                    {voucherData?.voucher_code || 'XXXXXX'}
                                </code>
                            </div>
                            
                            <button
                                onClick={copyVoucherCode}
                                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 italic ${
                                    copyStatus ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                                }`}
                            >
                                {copyStatus ? <><FaIcon name="check" /> Kunci Disalin</> : <><FaIcon name="copy" /> Salin Kode Voucher</>}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] relative z-10">
                        <FaIcon name="calendar-alt" className="mr-2 text-purple-400" />
                        <span>Diterbitkan pada: {new Date(voucherData?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Specs Card */}
                <div className="bg-white border-2 border-slate-100 rounded-[40px] p-10 mb-10 shadow-xl relative overflow-hidden">
                    <h3 className="text-lg font-black italic text-slate-900 uppercase tracking-widest mb-10 pb-6 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <FaIcon name="server" />
                        </div>
                        Intel Deployment
                    </h3>
                    
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Paket Tier</span>
                            <span className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{voucherData?.voucher_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Cadangan Uptime</span>
                            <span className="font-black text-purple-600 text-sm italic tracking-tighter">{voucherData?.duration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status Tautan</span>
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 bg-opacity-10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Terhubung
                            </span>
                        </div>
                        <div className="pt-8 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Kredit</span>
                                <span className="text-3xl font-black italic text-purple-600 tracking-tighter">
                                    Rp {new Intl.NumberFormat('id-ID').format(voucherData?.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Mission Buttons */}
                <div className="space-y-6">
                    <a href="http://ndnet.login/login" target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white font-black italic py-6 rounded-2xl transition-all shadow-xl text-center active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs">
                        <FaIcon name="sign-in-alt" /> Mulai Koneksi (Login)
                    </a>
                    <Link to="/gaming-area" className="block w-full border-2 border-slate-200 text-slate-500 font-black py-5 rounded-2xl hover:bg-white transition-all active:scale-95 text-center uppercase tracking-[0.2em] text-[10px] italic">
                        <FaIcon name="home" className="mr-2" /> Kembali ke Area Gaming
                    </Link>
                </div>
            </div>

            {/* Success Toast */}
            {copyStatus && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-2xl shadow-2xl z-50 flex items-center gap-4 animate-bounce-in">
                    <FaIcon name="check-circle" className="text-emerald-400 text-xl" />
                    <p className="font-black text-[10px] uppercase tracking-widest">Kode Berhasil Disalin!</p>
                </div>
            )}
        </div>
    )
}

export default GamingSuccess
