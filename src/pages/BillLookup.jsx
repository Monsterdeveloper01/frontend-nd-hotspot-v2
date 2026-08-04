import { useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

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
            <div style={{ minHeight: '100vh', background: '#ffffff', padding: '3rem 1rem' }}>
                <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '72px', height: '72px',
                            background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                            borderRadius: '20px', border: `3px solid ${nb.dark}`,
                            boxShadow: `5px 5px 0px ${nb.dark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem', color: '#fff', fontSize: '2rem',
                        }}>
                            <i className="fas fa-credit-card" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                            ND-Hotspot <span style={{ color: nb.light }}>Payment</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem' }}>Portal Pembayaran Tagihan Internet</p>
                    </div>

                    {activeView === 'search' && (
                        <div>
                            {/* Search Card */}
                            <div style={{
                                background: '#fff', borderRadius: '20px',
                                border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                                padding: '2rem', marginBottom: '1.5rem',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase' }}>Cari Tagihan</h2>
                                        <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem' }}>Masukkan Nama atau Nomor WA</p>
                                    </div>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: nb.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                        <i className="fas fa-search" />
                                    </div>
                                </div>
                                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                                    <input ref={searchInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nama pelanggan..."
                                        style={{
                                            width: '100%', padding: '1rem 3.5rem 1rem 1.25rem',
                                            background: '#f8fafc', border: `3px solid ${nb.dark}`,
                                            borderRadius: '12px', fontWeight: 800, fontSize: '1rem',
                                            outline: 'none', color: nb.dark, boxSizing: 'border-box',
                                        }} required
                                    />
                                    <button type="submit" disabled={loading} style={{
                                        position: 'absolute', right: '6px', top: '6px', bottom: '6px',
                                        background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                        color: '#fff', padding: '0 1.25rem', borderRadius: '8px',
                                        border: 'none', cursor: 'pointer', fontSize: '1rem',
                                    }}>
                                        {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-arrow-right" />}
                                    </button>
                                </form>
                                {error && (
                                    <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#fef2f2', border: '2px solid #fecaca', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-exclamation-circle" /> {error}
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            {searchResults.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ padding: '0 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>Hasil Pencarian</h3>
                                    {searchResults.map((customer) => (
                                        <div key={customer.id} onClick={() => handleSelectCustomer(customer)} style={{
                                            background: '#fff', padding: '1.25rem', borderRadius: '16px',
                                            border: `3px solid ${nb.dark}`, boxShadow: `4px 4px 0px ${nb.dark}`,
                                            marginBottom: '0.75rem', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${nb.dark}` }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '48px', height: '48px', background: '#f1f5f9', color: '#64748b', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${nb.dark}20` }}>
                                                    <i className="fas fa-user" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 900, color: nb.dark, fontSize: '1.05rem', textTransform: 'uppercase' }}>{customer.name}</div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                                        {customer.status_bayar === 'paid' ? (
                                                            <span style={{ color: '#10b981' }}><i className="fas fa-check-circle" /> Lunas</span>
                                                        ) : (
                                                            <span style={{ color: '#f59e0b' }}><i className="fas fa-clock" /> Belum Bayar</span>
                                                        )}
                                                        <span style={{ width: '3px', height: '3px', background: '#cbd5e1', borderRadius: '50%' }} />
                                                        {customer.whatsapp}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fas fa-wallet" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                                <Link to="/" style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className="fas fa-arrow-left" /> Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeView === 'detail' && selectedCustomer && (
                        <div>
                            <div style={{
                                background: '#fff', borderRadius: '20px',
                                border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                                overflow: 'hidden', marginBottom: '1.5rem',
                            }}>
                                <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '2rem', color: '#fff', textAlign: 'center', position: 'relative' }}>
                                    <button onClick={() => setActiveView('search')} style={{
                                        position: 'absolute', left: '1rem', top: '1rem',
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
                                        color: '#fff', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <i className="fas fa-arrow-left" />
                                    </button>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8, marginBottom: '0.5rem' }}>Total Pembayaran</p>
                                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{formatRupiah(selectedCustomer.billing_amount)}</h2>
                                    <div style={{
                                        display: 'inline-block', marginTop: '1rem',
                                        padding: '0.3rem 0.85rem', borderRadius: '8px',
                                        fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                                        background: selectedCustomer.status_bayar === 'paid' ? '#10b981' : '#f59e0b',
                                    }}>
                                        {selectedCustomer.status_bayar === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                    </div>
                                </div>

                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `2px solid ${nb.dark}10` }}>Informasi Pelanggan</h3>
                                    {[
                                        { label: 'Nama Akun', value: selectedCustomer.name },
                                        { label: 'Paket Layanan', value: 'Hotspot Bulanan', isBadge: true },
                                        { label: 'Jatuh Tempo', value: formatTanggal(selectedCustomer.due_date), isRed: true },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>{item.label}</span>
                                            {item.isBadge ? (
                                                <span style={{ fontWeight: 800, color: nb.light, background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: `1px solid ${nb.light}30` }}>{item.value}</span>
                                            ) : (
                                                <span style={{ fontWeight: 900, color: item.isRed ? '#ef4444' : nb.dark, fontSize: '0.85rem', textTransform: 'uppercase' }}>{item.value}</span>
                                            )}
                                        </div>
                                    ))}

                                    <button onClick={handlePay} disabled={paymentLoading} style={{
                                        width: '100%', padding: '1.1rem',
                                        background: '#10b981', color: '#fff',
                                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem',
                                        borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                        boxShadow: `4px 4px 0px ${nb.dark}`,
                                        cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                        opacity: paymentLoading ? 0.6 : 1, marginTop: '1.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    }}>
                                        {paymentLoading ? <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.1rem' }} /> : <><span>Bayar Sekarang</span> <i className="fas fa-arrow-right" /></>}
                                    </button>

                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-shield-alt" style={{ color: '#10b981' }} /> Pembayaran Aman dengan Midtrans
                                        </p>
                                    </div>

                                    {selectedCustomer.status_bayar === 'paid' && (
                                        <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#f0fdf4', border: '2px solid #bbf7d0', color: '#15803d', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', borderRadius: '10px' }}>
                                            <i className="fas fa-info-circle" style={{ marginRight: '0.4rem' }} />
                                            Tagihan sudah lunas, namun pembayaran tetap dibuka.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'success' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                background: '#fff', borderRadius: '20px',
                                border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                                overflow: 'hidden', marginBottom: '1.5rem',
                            }}>
                                <div style={{ height: '6px', background: '#10b981' }} />
                                <div style={{ padding: '2.5rem' }}>
                                    <div style={{ width: '72px', height: '72px', background: '#f0fdf4', color: '#10b981', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', border: `3px solid ${nb.dark}` }}>
                                        <i className="fas fa-check" />
                                    </div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Pembayaran Berhasil!</h2>
                                    <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>Layanan internet Anda akan aktif otomatis dalam 1-2 menit.</p>

                                    <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.5rem', border: `2px solid ${nb.dark}15`, textAlign: 'left' }}>
                                        {[
                                            { label: 'Pelanggan', value: selectedCustomer?.name },
                                            { label: 'Waktu', value: new Date().toLocaleString('id-ID') },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                                                <span style={{ fontWeight: 900, color: nb.dark, fontSize: '0.8rem', textTransform: 'uppercase' }}>{item.value}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${nb.dark}15`, paddingTop: '0.75rem' }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</span>
                                            <span style={{ padding: '0.25rem 0.6rem', background: '#10b981', color: '#fff', borderRadius: '6px', fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>LUNAS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => { setActiveView('search'); setSelectedCustomer(null); setQuery('') }} style={{
                                    flex: 1, padding: '1rem', background: '#fff', color: nb.dark,
                                    fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                                    borderRadius: '12px', border: `3px solid ${nb.dark}`, boxShadow: `3px 3px 0px ${nb.dark}`,
                                    cursor: 'pointer',
                                }}>Cari Tagihan Lain</button>
                                <Link to="/" style={{
                                    flex: 1, padding: '1rem',
                                    background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                    color: '#fff', fontWeight: 800, fontSize: '0.65rem',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    borderRadius: '12px', border: `3px solid ${nb.dark}`,
                                    boxShadow: `3px 3px 0px ${nb.dark}`,
                                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                }}>
                                    <i className="fas fa-home" /> Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            © {new Date().getFullYear()} ND-HOTSPOT • Portal Pembayaran
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

export default BillLookup
