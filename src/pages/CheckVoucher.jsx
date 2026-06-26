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
            setError(err.response?.data?.message || 'Voucher tidak ditemukan di sistem maupun router.')
        } finally {
            setLoading(false)
        }
    }

    const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

    return (
        <PublicLayout>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[30px] shadow-xl flex items-center justify-center text-3xl text-admin-text mb-4 mx-auto -rotate-3">
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
                                    className="absolute right-3 top-3 bottom-3 bg-purple-600 text-admin-text px-5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
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
                                <div className={`py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-admin-text ${
                                    voucher.is_online ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}>
                                    {voucher.is_online ? 'Sedang Online' : 'Offline / Standby'}
                                </div>

                                <div className="p-10 text-center">
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {voucher.source === 'mikrotik' ? 'Uptime Router' : 'Sisa Waktu'}
                                        </p>
                                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {voucher.source === 'mikrotik' ? voucher.uptime : (voucher.time_left || 'Ready')}
                                        </div>
                                    </div>

                                    {voucher.source === 'database' ? (
                                        <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-slate-100 pt-8 mt-4">
                                            <div className="text-left">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mulai Pakai</p>
                                                <p className="font-black text-slate-800 text-xs">
                                                    {voucher.used_at || '-'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Berakhir Pada</p>
                                                <p className="font-black text-slate-800 text-xs text-red-500">
                                                    {voucher.expires_at || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-slate-100 pt-8 mt-4">
                                            <div className="text-left">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Limit Waktu</p>
                                                <p className="font-black text-slate-800 text-xs">
                                                    {voucher.limit_uptime || '-'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Router</p>
                                                <p className="font-black text-blue-600 text-xs">
                                                    OK
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket</span>
                                            <span className="font-black text-purple-600 text-[10px] uppercase">{voucher.plan_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</span>
                                            <span className="font-black text-slate-900 text-[10px] uppercase">
                                                {voucher.source === 'database' ? 'Terdaftar di Billing' : 'Hanya di MikroTik'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setVoucher(null); setCode(''); }}
                                className="w-full py-5 bg-slate-900 text-admin-text rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
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
