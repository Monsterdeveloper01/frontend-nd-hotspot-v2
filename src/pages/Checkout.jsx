import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

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

    if (!plan) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: '48px', height: '48px', border: `4px solid ${nb.dark}`, borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    
                    {/* Confirm Modal */}
                    {showConfirmModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(30,58,138,0.5)' }}>
                            <div style={{ background: '#fff', borderRadius: '20px', border: `3px solid ${nb.dark}`, boxShadow: `8px 8px 0px ${nb.dark}`, width: '100%', maxWidth: '24rem', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: `3px solid ${nb.dark}` }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: nb.dark, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-exclamation-circle" style={{ color: '#f59e0b' }} /> Konfirmasi Nomor WhatsApp
                                    </h3>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Pastikan nomor WhatsApp Anda sudah benar. Voucher akan dikirim ke nomor ini setelah pembayaran berhasil.</p>
                                    <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', textAlign: 'center', border: `3px solid ${nb.dark}` }}>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Nomor Tujuan</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: nb.dark, letterSpacing: '0.1em' }}>+62 {phone}</p>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.7rem', color: '#f59e0b', background: '#fffbeb', padding: '0.75rem', borderRadius: '10px', border: '2px solid #fde68a' }}>
                                        <i className="fas fa-info-circle" style={{ marginTop: '2px' }} />
                                        <span>Pastikan nomor aktif. Kesalahan nomor bukan tanggung jawab kami.</span>
                                    </div>
                                </div>
                                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '0.85rem', background: '#ef4444', color: '#fff', fontWeight: 800, borderRadius: '12px', border: `2px solid ${nb.dark}`, cursor: 'pointer', fontSize: '0.8rem' }}>Batal</button>
                                    <button onClick={confirmPayment} style={{ flex: 1, padding: '0.85rem', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', fontWeight: 800, borderRadius: '12px', border: `2px solid ${nb.dark}`, boxShadow: `3px 3px 0px ${nb.dark}`, cursor: 'pointer', fontSize: '0.8rem' }}>Konfirmasi</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentResult ? (
                        <div style={{ background: '#fff', borderRadius: '20px', border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`, padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: `linear-gradient(90deg, ${nb.mid}, ${nb.light})` }} />
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ width: '56px', height: '56px', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, borderRadius: '16px', border: `2px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontSize: '1.5rem' }}>
                                    <i className="fas fa-qrcode" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Scan QR Code</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Scan dengan aplikasi e-wallet atau mobile banking</p>
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '16px', border: `3px solid ${nb.dark}`, display: 'inline-block' }}>
                                    <img src={paymentResult.payment_url} style={{ width: '14rem', height: '14rem', borderRadius: '10px' }} alt="QR Code"
                                        onError={(e) => { e.target.onerror = null; const qrData = paymentResult.qr_string || paymentResult.payment_url; e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData) }}
                                    />
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <a href={paymentResult.payment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', fontWeight: 800, color: nb.light, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            <i className="fas fa-external-link-alt" style={{ marginRight: '4px' }} /> Buka Gambar di Tab Baru
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#eff6ff', borderRadius: '14px', padding: '1.25rem', border: `2px solid ${nb.light}30`, marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem' }}>Total Pembayaran</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: nb.dark }}>Rp {formatRupiah(plan.price)}</span>
                                </div>
                                <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>Order ID: {paymentResult.external_id}</div>
                            </div>

                            <div style={{ background: '#fffbeb', border: '2px solid #fde68a', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-info-circle" /> QR Tidak Muncul?</p>
                                <p style={{ fontSize: '0.65rem', color: '#a16207', fontWeight: 600, lineHeight: 1.5 }}>Jika browser bawaan Wifi (Captive Portal) dan QR tidak muncul, <b>Salin Link</b> lalu buka di <b>Chrome/Safari</b>.</p>
                                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link pembayaran berhasil disalin!') }} style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#fde68a', color: '#92400e', borderRadius: '8px', border: '2px solid #f59e0b', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>Salin Link Pembayaran</button>
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: nb.light, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${nb.light}30` }} className="animate-pulse">
                                <i className="fas fa-sync fa-spin" /> Menunggu pembayaran...
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>Batalkan & Kembali</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', borderRadius: '20px', border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '1.5rem 2rem', color: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>Checkout</h1>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Konfirmasi pembelian voucher</p>
                                    </div>
                                    <i className="fas fa-shopping-basket" style={{ fontSize: '2rem', opacity: 0.4 }} />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '1rem', border: '2px solid rgba(255,255,255,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.name}</p>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', opacity: 0.8 }}>
                                                <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}><i className="fas fa-arrow-up" /> {plan.upload_limit} Mbps</span>
                                                <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}><i className="fas fa-arrow-down" /> {plan.download_limit} Mbps</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>Rp {formatRupiah(plan.price)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Nomor WhatsApp *</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 800 }}>+62</div>
                                        <input type="tel" id="phoneInput" value={phone}
                                            onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.startsWith('0')) val = val.substring(1); if (val.startsWith('62')) val = val.substring(2); setPhone(val) }}
                                            required placeholder="812xxxxx" inputMode="numeric"
                                            style={{ width: '100%', paddingLeft: '3.5rem', paddingRight: '1.25rem', paddingTop: '1rem', paddingBottom: '1rem', background: '#f8fafc', border: `3px solid ${nb.dark}`, borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', outline: 'none', color: nb.dark, boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.65rem', color: '#f59e0b', background: '#fffbeb', padding: '0.75rem', borderRadius: '10px', border: '2px solid #fde68a', marginTop: '0.75rem', fontWeight: 600 }}>
                                        <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px' }} />
                                        <span>Pastikan nomor sudah benar. Voucher akan dikirim otomatis ke nomor tersebut.</span>
                                    </div>
                                    {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}><i className="fas fa-exclamation-circle" />{error}</p>}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Metode Pembayaran</label>
                                    <div style={{ border: `3px solid ${nb.dark}`, background: '#fff', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fas fa-qrcode" style={{ color: nb.light, fontSize: '1.1rem' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 900, color: nb.dark, fontSize: '0.85rem', textTransform: 'uppercase' }}>QRIS</h4>
                                                <p style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>All E-Wallets & Banks</p>
                                            </div>
                                        </div>
                                        <div style={{ width: '24px', height: '24px', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem' }}>
                                            <i className="fas fa-check" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading || !phone} style={{
                                    width: '100%', padding: '1.1rem',
                                    background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                    color: '#fff', fontWeight: 800, textTransform: 'uppercase',
                                    letterSpacing: '0.12em', fontSize: '0.75rem',
                                    borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                    boxShadow: `4px 4px 0px ${nb.dark}`,
                                    cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
                                    opacity: (loading || !phone) ? 0.5 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                }}>
                                    {loading ? <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.1rem' }} /> : <><i className="fas fa-bolt" /> Bayar Sekarang</>}
                                </button>

                                <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                                    <Link to="/" style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <i className="fas fa-arrow-left" /> Kembali ke Menu Utama
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
