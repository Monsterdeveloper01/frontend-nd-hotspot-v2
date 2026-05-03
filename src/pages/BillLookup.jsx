import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const formatTanggal = (dateString) => {
    if (!dateString || dateString === '0000-00-00') return '-';
    
    try {
        // Handle ISO strings or YYYY-MM-DD
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        
        // Fallback for numeric only (day)
        if (/^\d{1,2}$/.test(dateString)) {
            const now = new Date();
            const day = dateString.padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            return `${day}-${month}-${year}`;
        }
        
        return dateString;
    } catch (e) {
        console.error('Error formatting date:', e, dateString);
        return dateString || '-';
    }
};

const BillLookup = () => {
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeView, setActiveView] = useState('search') // search, detail, success
    const searchInputRef = useRef(null)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        
        setLoading(true)
        setError('')
        setSearchResults([])
        
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-bill`, {
                params: { query }
            })
            // If only one result, select it automatically
            if (Array.isArray(response.data)) {
                setSearchResults(response.data)
            } else {
                setSearchResults([response.data])
            }
        } catch (err) {
            setError('Data tagihan tidak ditemukan. Pastikan Nama atau No. WA benar.')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer)
        setActiveView('detail')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handlePay = async () => {
        setPaymentLoading(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/customers/${selectedCustomer.id}/snap-token`)
            const { token } = response.data

            window.snap.pay(token, {
                onSuccess: (result) => {
                    setActiveView('success')
                    setPaymentLoading(false)
                },
                onPending: (result) => {
                    alert('Pembayaran Tertunda. Silakan selesaikan pembayaran Anda.')
                    setPaymentLoading(false)
                },
                onError: (result) => {
                    alert('Pembayaran Gagal!')
                    setPaymentLoading(false)
                },
                onClose: () => {
                    setPaymentLoading(false)
                }
            })
        } catch (err) {
            alert('Gagal mengambil token pembayaran')
            setPaymentLoading(false)
        }
    }

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

    return (
        <PublicLayout>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[30px] shadow-xl flex items-center justify-center text-3xl text-white mb-4 mx-auto rotate-3">
                                <FaIcon name="credit-card" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            ND-Hotspot <span className="text-blue-600">Payment</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-2">Portal Pembayaran Tagihan Internet</p>
                    </div>

                    {activeView === 'search' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white rounded-[35px] shadow-2xl border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Cari Tagihan</h2>
                                        <p className="text-slate-400 font-bold text-xs">Masukkan Nama atau Nomor WA</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                                        <FaIcon name="search" />
                                    </div>
                                </div>

                                <form onSubmit={handleSearch} className="relative">
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Nama pelanggan..."
                                        className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-lg outline-none focus:border-blue-500 transition-all"
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <FaIcon name="sync" className="animate-spin" /> : <FaIcon name="arrow-right" />}
                                    </button>
                                </form>

                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                        <FaIcon name="exclamation-circle" className="text-lg" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hasil Pencarian</h3>
                                    {searchResults.map((customer) => (
                                        <div 
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg hover:border-blue-400 transition-all cursor-pointer flex justify-between items-center group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <FaIcon name="user" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-lg uppercase leading-none mb-1">{customer.name}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        {customer.status_bayar === 'paid' ? (
                                                            <span className="text-emerald-500"><FaIcon name="check-circle" /> Lunas</span>
                                                        ) : (
                                                            <span className="text-amber-500"><FaIcon name="clock" /> Belum Bayar</span>
                                                        )}
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        {customer.whatsapp}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                <FaIcon name="wallet" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-center pt-6">
                                <Link to="/" className="text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                                    <FaIcon name="arrow-left" className="mr-2" /> Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeView === 'detail' && selectedCustomer && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white relative">
                                    <button 
                                        onClick={() => setActiveView('search')}
                                        className="absolute left-6 top-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                                    >
                                        <FaIcon name="arrow-left" />
                                    </button>
                                    
                                    <div className="text-center pt-4">
                                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Pembayaran</p>
                                        <h2 className="text-4xl font-black tracking-tighter">
                                            {formatRupiah(selectedCustomer.billing_amount)}
                                        </h2>
                                        <div className={`inline-block mt-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedCustomer.status_bayar === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                            {selectedCustomer.status_bayar === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="space-y-5">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-50 pb-4">Informasi Pelanggan</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-bold text-sm">Nama Akun</span>
                                            <span className="font-black text-slate-900 text-sm uppercase">{selectedCustomer.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-bold text-sm">Paket Layanan</span>
                                            <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border border-blue-100">Hotspot Bulanan</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-bold text-sm">Jatuh Tempo</span>
                                            <span className="font-black text-red-600 text-sm uppercase">{formatTanggal(selectedCustomer.due_date)}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handlePay}
                                        disabled={paymentLoading}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-emerald-200 uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {paymentLoading ? (
                                            <FaIcon name="circle-notch" className="animate-spin text-lg" />
                                        ) : (
                                            <>
                                                <span>Bayar Sekarang</span>
                                                <FaIcon name="arrow-right" />
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                            <FaIcon name="shield-check" className="text-emerald-500 text-sm" /> 
                                            Pembayaran Aman dengan Midtrans
                                        </p>
                                    </div>
                                    
                                    {selectedCustomer.status_bayar === 'paid' && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase text-center rounded-2xl">
                                            <FaIcon name="info-circle" className="mr-2" />
                                            Tagihan sudah lunas, namun pembayaran tetap dibuka.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'success' && (
                        <div className="text-center animate-fadeIn">
                            <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden mb-10">
                                <div className="bg-emerald-500 h-2"></div>
                                <div className="p-12">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-8 text-3xl shadow-lg shadow-emerald-100">
                                        <FaIcon name="check" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Pembayaran Berhasil!</h2>
                                    <p className="text-slate-500 font-bold text-sm mb-10">Layanan internet Anda akan aktif otomatis dalam 1-2 menit.</p>
                                    
                                    <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-100 text-left space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</span>
                                            <span className="font-black text-slate-900 text-sm uppercase">{selectedCustomer?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</span>
                                            <span className="font-black text-slate-900 text-[10px] uppercase">{new Date().toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">LUNAS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setActiveView('search')
                                        setSelectedCustomer(null)
                                        setQuery('')
                                    }}
                                    className="flex-1 py-5 bg-white border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-lg shadow-slate-100"
                                >
                                    Cari Tagihan Lain
                                </button>
                                <Link
                                    to="/"
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    <FaIcon name="home" /> Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Footer Credits */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            © {new Date().getFullYear()} ND-HOTSPOT • Portal Pembayaran
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

export default BillLookup
