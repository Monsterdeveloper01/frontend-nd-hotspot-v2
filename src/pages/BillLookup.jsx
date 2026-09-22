import { useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const formatTanggal = (dateString) => {
    if (!dateString || dateString === '0000-00-00') return '-'
    try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
            return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`
        }
        if (/^\d{1,2}$/.test(dateString)) {
            const now = new Date()
            return `${dateString.padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`
        }
        return dateString
    } catch { return dateString || '-' }
}

const BillLookup = () => {
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeView, setActiveView] = useState('search')
    const searchInputRef = useRef(null)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true); setError(''); setSearchResults([])
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-bill`, { params: { query } })
            setSearchResults(Array.isArray(response.data) ? response.data : [response.data])
        } catch { setError('Data tagihan tidak ditemukan. Pastikan Nama atau No. WA benar.') }
        finally { setLoading(false) }
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
            window.snap.pay(response.data.token, {
                onSuccess: () => { setActiveView('success'); setPaymentLoading(false) },
                onPending: () => { alert('Pembayaran Tertunda.'); setPaymentLoading(false) },
                onError: () => { alert('Pembayaran Gagal!'); setPaymentLoading(false) },
                onClose: () => { setPaymentLoading(false) }
            })
        } catch { alert('Gagal mengambil token pembayaran'); setPaymentLoading(false) }
    }

    const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem 5rem' }}>
                <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px', height: '64px',
                            background: '#ecfdf5',
                            borderRadius: '20px',
                            boxShadow: '0 4px 14px rgba(0, 168, 132, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem', color: '#00a884', fontSize: '1.75rem',
                        }}>
                            <i className="fas fa-credit-card" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            ND-Hotspot <span style={{ color: '#00a884' }}>Payment</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.35rem' }}>Portal Pembayaran Tagihan Internet</p>
                    </div>

                    {activeView === 'search' && (
                        <div>
                            {/* Search Card */}
                            <div className="card-nd-elevated" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>Cari Tagihan</h2>
                                        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', marginTop: '2px' }}>Masukkan Nama atau Nomor WA</p>
                                    </div>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                        <i className="fas fa-search" />
                                    </div>
                                </div>
                                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                                    <input 
                                        ref={searchInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nama pelanggan..."
                                        style={{
                                            width: '100%', padding: '0.9rem 3.5rem 0.9rem 1.25rem',
                                            background: '#f8fafc', border: '1px solid #cbd5e1',
                                            borderRadius: '9999px', fontWeight: 700, fontSize: '0.95rem',
                                            outline: 'none', color: '#1e293b', boxSizing: 'border-box',
                                        }} required
                                    />
                                    <button 
                                        type="submit" disabled={loading} 
                                        style={{
                                            position: 'absolute', right: '5px', top: '5px', bottom: '5px',
                                            background: '#00a884', color: '#fff', padding: '0 1.25rem', 
                                            borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                                            boxShadow: '0 2px 8px rgba(0, 168, 132, 0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-arrow-right" />}
                                    </button>
                                </form>
                                {error && (
                                    <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-exclamation-circle" /> {error}
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            {searchResults.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ padding: '0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Hasil Pencarian</h3>
                                    {searchResults.map((customer) => (
                                        <div 
                                            key={customer.id} 
                                            onClick={() => handleSelectCustomer(customer)} 
                                            className="card-nd-elevated"
                                            style={{
                                                padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '44px', height: '44px', background: '#f8fafc', color: '#64748b', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                    <i className="fas fa-user" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{customer.name}</div>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                                        {customer.status_bayar === 'paid' ? (
                                                            <span style={{ color: '#00a884' }}><i className="fas fa-check-circle" /> Lunas</span>
                                                        ) : (
                                                            <span style={{ color: '#f59e0b' }}><i className="fas fa-clock" /> Belum Bayar</span>
                                                        )}
                                                        <span style={{ width: '3px', height: '3px', background: '#cbd5e1', borderRadius: '50%' }} />
                                                        {customer.whatsapp}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ecfdf5', color: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fas fa-chevron-right text-xs" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                                <Link to="/" style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className="fas fa-arrow-left" /> Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeView === 'detail' && selectedCustomer && (
                        <div>
                            <div className="card-nd-elevated" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#f8fafc', padding: '2rem 1.5rem', color: '#1e293b', textAlign: 'center', position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
                                    <button 
                                        onClick={() => setActiveView('search')} 
                                        style={{
                                            position: 'absolute', left: '1rem', top: '1rem',
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#ffffff', border: '1px solid #e2e8f0',
                                            color: '#64748b', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <i className="fas fa-arrow-left" />
                                    </button>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Total Pembayaran</p>
                                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#00a884', letterSpacing: '-0.03em' }}>{formatRupiah(selectedCustomer.billing_amount)}</h2>
                                    <div style={{
                                        display: 'inline-block', marginTop: '0.75rem',
                                        padding: '0.3rem 0.85rem', borderRadius: '9999px',
                                        fontSize: '0.72rem', fontWeight: 800,
                                        background: selectedCustomer.status_bayar === 'paid' ? '#ecfdf5' : '#fef3c7',
                                        color: selectedCustomer.status_bayar === 'paid' ? '#00a884' : '#b45309',
                                    }}>
                                        {selectedCustomer.status_bayar === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                    </div>
                                </div>

                                <div style={{ padding: '1.75rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Informasi Pelanggan</h3>
                                    {[
                                        { label: 'Nama Akun', value: selectedCustomer.name },
                                        { label: 'Paket Layanan', value: 'Hotspot Bulanan', isBadge: true },
                                        { label: 'Jatuh Tempo', value: formatTanggal(selectedCustomer.due_date), isRed: true },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                            <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>{item.label}</span>
                                            {item.isBadge ? (
                                                <span style={{ fontWeight: 700, color: '#00a884', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem' }}>{item.value}</span>
                                            ) : (
                                                <span style={{ fontWeight: 800, color: item.isRed ? '#ef4444' : '#1e293b', fontSize: '0.85rem' }}>{item.value}</span>
                                            )}
                                        </div>
                                    ))}

                                    <button 
                                        onClick={handlePay} 
                                        disabled={paymentLoading} 
                                        className="btn-nd-pill" 
                                        style={{
                                            width: '100%', padding: '1rem',
                                            fontSize: '0.9rem', marginTop: '1.5rem',
                                            opacity: paymentLoading ? 0.6 : 1,
                                            cursor: paymentLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {paymentLoading ? <i className="fas fa-circle-notch fa-spin" /> : <><span>Bayar Sekarang</span> <i className="fas fa-arrow-right" /></>}
                                    </button>

                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-shield-alt" style={{ color: '#00a884' }} /> Pembayaran Aman & Otomatis via Midtrans
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'success' && (
                        <div style={{ textAlign: 'center' }}>
                            <div className="card-nd-elevated" style={{ overflow: 'hidden', marginBottom: '1.5rem', padding: '2.5rem' }}>
                                <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#00a884', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem', boxShadow: '0 4px 14px rgba(0, 168, 132, 0.2)' }}>
                                    <i className="fas fa-check" />
                                </div>
                                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Pembayaran Berhasil!</h2>
                                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.75rem' }}>Layanan internet Anda aktif otomatis dalam 1-2 menit.</p>

                                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                                    {[
                                        { label: 'Pelanggan', value: selectedCustomer?.name },
                                        { label: 'Waktu', value: new Date().toLocaleString('id-ID') },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>{item.label}</span>
                                            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.82rem' }}>{item.value}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Status</span>
                                        <span style={{ padding: '0.2rem 0.6rem', background: '#ecfdf5', color: '#00a884', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800 }}>LUNAS</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => { setActiveView('search'); setSelectedCustomer(null); setQuery('') }} 
                                    style={{
                                        flex: 1, padding: '0.9rem', background: '#ffffff', color: '#475569',
                                        fontWeight: 700, fontSize: '0.82rem', borderRadius: '9999px',
                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                    }}
                                >
                                    Cari Tagihan Lain
                                </button>
                                <Link 
                                    to="/" 
                                    className="btn-nd-pill"
                                    style={{ flex: 1, padding: '0.9rem', fontSize: '0.82rem' }}
                                >
                                    <i className="fas fa-home" /> Beranda
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default BillLookup
