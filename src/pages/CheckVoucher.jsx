import { useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const CheckVoucher = () => {
    const [code, setCode] = useState('')
    const [voucher, setVoucher] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    const handleCheck = async (e) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError('')
        setVoucher(null)

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/check-voucher`, {
                params: { code: code.trim() }
            })
            setVoucher(response.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Voucher tidak ditemukan atau sudah tidak berlaku.')
        } finally {
            setLoading(false)
        }
    }

    const calculateRemainingTime = (expiresAt) => {
        if (!expiresAt) return null
        const now = new Date()
        const end = new Date(expiresAt)
        const diff = end - now

        if (diff <= 0) return 'Habis'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hours > 24) {
            return `${Math.floor(hours / 24)} Hari`
        }
        return `${hours} Jam ${minutes} Menit`
    }

    const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

    return (
        <PublicLayout>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[30px] shadow-xl flex items-center justify-center text-3xl text-white mb-4 mx-auto -rotate-3">
                                <FaIcon name="ticket-alt" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Check <span className="text-purple-600">Voucher</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-2">Cek sisa waktu & status voucher Anda</p>
                    </div>

                    <div className="bg-white rounded-[35px] shadow-2xl border border-slate-100 p-8 mb-8">
                        <form onSubmit={handleCheck} className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Masukkan Kode Voucher</label>
                            <div className="relative">
                                <input 
                                    ref={inputRef}
                                    type="text" 
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="CONTOH: ND1234"
                                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl outline-none focus:border-purple-500 transition-all uppercase placeholder:text-slate-300"
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-3 top-3 bottom-3 bg-purple-600 text-white px-5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <FaIcon name="sync" className="animate-spin" /> : <FaIcon name="search" />}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                <FaIcon name="exclamation-circle" className="text-lg" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {voucher && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 relative">
                                {/* Status Banner */}
                                <div className={`py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white ${
                                    voucher.status === 'used' || voucher.status === 'active' ? 'bg-emerald-500' : 
                                    voucher.status === 'sold' ? 'bg-blue-500' : 'bg-amber-500'
                                }`}>
                                    {voucher.status === 'used' || voucher.status === 'active' ? 'Sedang Digunakan' : 
                                     voucher.status === 'sold' ? 'Belum Digunakan' : 'Voucher Ready'}
                                </div>

                                <div className="p-10 text-center">
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sisa Waktu</p>
                                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {voucher.expires_at ? calculateRemainingTime(voucher.expires_at) : voucher.plan?.duration || '-'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-slate-100 pt-8 mt-4">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mulai Pakai</p>
                                            <p className="font-black text-slate-800 text-xs">
                                                {voucher.used_at ? new Date(voucher.used_at).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Berakhir Pada</p>
                                            <p className="font-black text-slate-800 text-xs text-red-500">
                                                {voucher.expires_at ? new Date(voucher.expires_at).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket</span>
                                            <span className="font-black text-purple-600 text-[10px] uppercase">{voucher.plan?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit Kecepatan</span>
                                            <span className="font-black text-slate-900 text-[10px] uppercase">UP TO {voucher.plan?.speed_limit || 'Full Speed'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setVoucher(null); setCode(''); }}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                Cek Voucher Lain
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link to="/" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">
                            <FaIcon name="arrow-left" className="mr-2" /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

export default CheckVoucher
