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
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    useEffect(() => {
        if (!plan) { navigate('/'); return }
        setTimeout(() => document.getElementById('phoneInput')?.focus(), 300)
    }, [plan, navigate])

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID').format(number)

    const validatePhone = (number) => /^[0-9]{9,13}$/.test(number)

    const handleSubmit = (e) => {
        e.preventDefault(); setError('')
        if (!validatePhone(phone)) { setError('Nomor WhatsApp harus 8-15 digit angka'); return }
        setShowConfirmModal(true)
    }

    const confirmPayment = async () => {
        setShowConfirmModal(false); setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/checkout`, { voucher_plan_id: plan.id, phone: '62' + phone })
            if (response.data.success) { setPaymentResult(response.data.transaction); startPaymentPolling(response.data.transaction.id) }
            else { setError(response.data.message || 'Terjadi kesalahan saat memproses pembayaran') }
        } catch (err) { setError(err.response?.data?.message || 'Gagal menghubungi server pembayaran') }
        finally { setLoading(false) }
    }

    const startPaymentPolling = (transactionId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/${transactionId}`)
                const data = response.data
                if (data.status === 'success') { clearInterval(interval); navigate(`/payment-success?order_id=${data.external_id}`) }
                else if (data.status === 'expire' || data.status === 'cancel') { clearInterval(interval); setError('Pembayaran kadaluarsa atau dibatalkan'); setPaymentResult(null) }
            } catch (err) { console.error('Polling error:', err) }
        }, 3000)
    }

    if (!plan) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #00a884', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
        </div>
    )

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', paddingTop: '4rem', paddingBottom: '5rem' }}>
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    
                    {/* Confirm Modal */}
                    {showConfirmModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
                            <div className="card-nd-elevated" style={{ width: '100%', maxWidth: '24rem', overflow: 'hidden', padding: 0 }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-exclamation-circle" style={{ color: '#00a884' }} /> Konfirmasi Nomor WhatsApp
                                    </h3>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>Pastikan nomor WhatsApp Anda sudah benar. Kode voucher akan otomatis dikirimkan ke nomor ini.</p>
                                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Nomor Tujuan</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', letterSpacing: '0.05em' }}>+62 {phone}</p>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '0.75rem', borderRadius: '12px' }}>
                                        <i className="fas fa-info-circle" style={{ marginTop: '2px' }} />
                                        <span>Pastikan nomor aktif di WhatsApp.</span>
                                    </div>
                                </div>
                                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                                    <button 
                                        onClick={() => setShowConfirmModal(false)} 
                                        style={{ 
                                            flex: 1, padding: '0.85rem', background: '#f1f5f9', color: '#64748b', 
                                            fontWeight: 700, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' 
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={confirmPayment} 
                                        className="btn-nd-pill" 
                                        style={{ flex: 1, padding: '0.85rem', fontSize: '0.85rem' }}
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentResult ? (
                        <div className="card-nd-elevated" style={{ padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '18px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', 
                                    color: '#00a884', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0, 168, 132, 0.15)' 
                                }}>
                                    <i className="fas fa-qrcode" />
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>Scan QR Code</h3>
                                <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Scan dengan aplikasi e-wallet atau mobile banking</p>
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ background: '#fff', padding: '0.85rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', display: 'inline-block' }}>
                                    <img src={paymentResult.payment_url} style={{ width: '14rem', height: '14rem', borderRadius: '12px' }} alt="QR Code"
                                        onError={(e) => { e.target.onerror = null; const qrData = paymentResult.qr_string || paymentResult.payment_url; e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData) }}
                                    />
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <a href={paymentResult.payment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00a884', textDecoration: 'none' }}>
                                            <i className="fas fa-external-link-alt" style={{ marginRight: '4px' }} /> Buka Gambar di Tab Baru
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Total Pembayaran</span>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00a884' }}>Rp {formatRupiah(plan.price)}</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textAlign: 'left' }}>Order ID: {paymentResult.external_id}</div>
                            </div>

                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <i className="fas fa-info-circle" /> QR Tidak Muncul?
                                </p>
                                <p style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 600, lineHeight: 1.5 }}>Jika menggunakan browser login Wifi, <b>Salin Link</b> lalu buka di <b>Chrome/Safari</b>.</p>
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link pembayaran berhasil disalin!') }} 
                                    style={{ marginTop: '0.6rem', width: '100%', padding: '0.55rem', background: '#fef3c7', color: '#92400e', borderRadius: '9999px', border: '1px solid #f59e0b', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                                >
                                    Salin Link Pembayaran
                                </button>
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00a884', fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', padding: '0.5rem 1.25rem', borderRadius: '9999px' }} className="animate-pulse">
                                <i className="fas fa-sync fa-spin" /> Menunggu pembayaran...
                            </div>

                            <div style={{ marginTop: '1.25rem' }}>
                                <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                    Batalkan & Kembali
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card-nd-elevated" style={{ overflow: 'hidden' }}>
                            {/* Card Header with Plan Summary */}
                            <div style={{ background: '#f8fafc', padding: '1.75rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#00a884', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Konfirmasi Order</span>
                                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginTop: '2px' }}>Checkout</h1>
                                    </div>
                                    <div style={{ width: '44px', height: '44px', background: '#ecfdf5', color: '#00a884', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        <i className="fas fa-shopping-basket" />
                                    </div>
                                </div>

                                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{plan.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Unlimited Kuota</p>
                                        </div>
                                        <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00a884' }}>Rp {formatRupiah(plan.price)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem 2rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Nomor WhatsApp *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 800 }}>+62</div>
                                        <input 
                                            type="tel" id="phoneInput" value={phone}
                                            onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.startsWith('0')) val = val.substring(1); if (val.startsWith('62')) val = val.substring(2); setPhone(val) }}
                                            required placeholder="8123456789" inputMode="numeric"
                                            style={{ 
                                                width: '100%', paddingLeft: '3.75rem', paddingRight: '1.25rem', paddingTop: '0.9rem', paddingBottom: '0.9rem', 
                                                background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', 
                                                fontWeight: 800, fontSize: '1.05rem', outline: 'none', color: '#1e293b', boxSizing: 'border-box' 
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem', fontWeight: 600 }}>
                                        <i className="fas fa-info-circle text-xs text-slate-400" />
                                        <span>Kode voucher otomatis dikirimkan ke WhatsApp Anda.</span>
                                    </div>
                                    {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}><i className="fas fa-exclamation-circle" />{error}</p>}
                                </div>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Metode Pembayaran
                                    </label>
                                    <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '16px', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#ecfdf5', color: '#00a884', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fas fa-qrcode" style={{ fontSize: '1.1rem' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>QRIS Nasional</h4>
                                                <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Dana, OVO, GoPay, ShopeePay, M-Banking</p>
                                            </div>
                                        </div>
                                        <div style={{ width: '22px', height: '22px', background: '#00a884', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem' }}>
                                            <i className="fas fa-check" />
                                        </div>
                                    </div>
                                </div>

                                {/* Pill Button */}
                                <button 
                                    type="submit" 
                                    disabled={loading || !phone} 
                                    className="btn-nd-pill" 
                                    style={{
                                        width: '100%', padding: '1rem',
                                        fontSize: '0.9rem',
                                        opacity: (loading || !phone) ? 0.6 : 1,
                                        cursor: (loading || !phone) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? (
                                        <><i className="fas fa-circle-notch fa-spin" /> Memproses...</>
                                    ) : (
                                        <><i className="fas fa-bolt" /> Bayar Sekarang</>
                                    )}
                                </button>

                                <div style={{ textAlign: 'center', paddingTop: '1.25rem' }}>
                                    <Link to="/" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <i className="fas fa-arrow-left" /> Kembali ke Pilih Paket
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
