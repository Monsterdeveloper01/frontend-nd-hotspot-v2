import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const GamingCheckout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { plan } = location.state || {}
    
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [paymentResult, setPaymentResult] = useState(null)
    const [error, setError] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    useEffect(() => {
        if (!plan) { navigate('/gaming-area'); return }
        setTimeout(() => document.getElementById('phoneInput')?.focus(), 300)
    }, [plan, navigate])

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
            else { setError(response.data.message || 'Terjadi kesalahan sistem.') }
        } catch (err) { setError(err.response?.data?.message || 'Gagal menyambung ke server pembayaran.') }
        finally { setLoading(false) }
    }

    const startPaymentPolling = (transactionId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/${transactionId}`)
                const data = response.data
                if (data.status === 'success') { clearInterval(interval); navigate(`/gaming-success?order_id=${data.external_id}`) }
                else if (data.status === 'expire' || data.status === 'cancel') { clearInterval(interval); setError('Sesi pembayaran berakhir atau dibatalkan.'); setPaymentResult(null) }
            } catch (err) { console.error('Polling error:', err) }
        }, 3000)
    }

    if (!plan) return null

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', position: 'relative' }}>
            
            {showConfirmModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(14,70,150,0.5)' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `8px 8px 0px ${nb.dark}`, width: '100%', maxWidth: '24rem', overflow: 'hidden' }}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: `3px solid ${nb.dark}` }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: nb.dark, display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase' }}>
                                <i className="fas fa-satellite-dish" style={{ color: '#10b981' }} /> Konfirmasi Target Transmisi
                            </h3>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 700 }}>Kode akses akan dikirimkan ke nomor WhatsApp ini:</p>
                            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', border: `3px solid ${nb.dark}` }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark, letterSpacing: '0.15em' }}>+62 {phone}</p>
                            </div>
                        </div>
                        <div style={{ padding: '0 2rem 2rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '1rem', background: '#ef4444', color: '#fff', fontWeight: 900, borderRadius: '12px', border: `3px solid ${nb.dark}`, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Batal</button>
                            <button onClick={confirmPayment} style={{ flex: 1, padding: '1rem', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', fontWeight: 900, borderRadius: '12px', border: `3px solid ${nb.dark}`, boxShadow: `3px 3px 0px ${nb.dark}`, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eksekusi</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ padding: '3rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 10 }}>
                    
                    {paymentResult ? (
                        <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`, padding: '2rem', textAlign: 'center', overflow: 'hidden' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, borderRadius: '16px', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontSize: '2rem' }}>
                                    <i className="fas fa-qrcode" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Scan QRIS</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Otorisasi Akses Jaringan</p>
                            </div>
                            
                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '20px', border: `3px solid ${nb.dark}`, display: 'inline-block', marginBottom: '2rem' }}>
                                <img src={paymentResult.payment_url} style={{ width: '16rem', height: '16rem', borderRadius: '12px' }} alt="QR Code"
                                    onError={(e) => { e.target.onerror = null; const qrData = paymentResult.qr_string || paymentResult.payment_url; e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData) }}
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <a href={paymentResult.payment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', fontWeight: 900, color: nb.mid, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                                        <i className="fas fa-external-link-alt" style={{ marginRight: '6px' }} /> Buka QR di Tab Baru
                                    </a>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: `3px solid ${nb.dark}`, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Jumlah Transfer</span>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark }}>Rp {new Intl.NumberFormat('id-ID').format(plan.price)}</span>
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: nb.mid, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', background: '#eff6ff', padding: '0.75rem 1.5rem', borderRadius: '12px', border: `3px solid ${nb.dark}` }} className="animate-pulse">
                                <i className="fas fa-satellite fa-spin" /> Menunggu Otorisasi...
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}><i className="fas fa-times-circle" /> Batalkan Proses</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `8px 8px 0px ${nb.dark}`, overflow: 'hidden' }}>
                            <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '2rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${nb.dark}` }}>
                                <div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1 }}>Setup Koneksi</h1>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.5rem', opacity: 0.9 }}>Zona Kecepatan Prioritas</p>
                                </div>
                                <i className="fas fa-rocket" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: `3px solid ${nb.dark}`, marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: nb.dark }}>{plan.name}</p>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}><i className="fas fa-arrow-up" /> {plan.upload_limit} Mbps</span>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: nb.mid, textTransform: 'uppercase', letterSpacing: '0.1em' }}><i className="fas fa-arrow-down" /> {plan.download_limit} Mbps</span>
                                            </div>
                                        </div>
                                        <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#fff', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: `2px solid ${nb.dark}` }}>
                                            <i className="fas fa-bolt" /> Priority
                                        </div>
                                    </div>
                                    <div style={{ height: '3px', background: `${nb.dark}20`, margin: '1rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Biaya</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: nb.dark }}>Rp {new Intl.NumberFormat('id-ID').format(plan.price)}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}><i className="fab fa-whatsapp" style={{ color: '#25D366', fontSize: '0.8rem' }} /> Target Pengiriman (No. WA)</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: nb.dark, fontWeight: 900, fontSize: '1.1rem' }}>+62</div>
                                            <input type="tel" id="phoneInput" value={phone}
                                                onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.startsWith('0')) val = val.substring(1); if (val.startsWith('62')) val = val.substring(2); setPhone(val) }}
                                                required placeholder="812xxxxx" inputMode="numeric"
                                                style={{ width: '100%', paddingLeft: '4rem', paddingRight: '1.5rem', paddingTop: '1.25rem', paddingBottom: '1.25rem', background: '#fff', border: `3px solid ${nb.dark}`, borderRadius: '16px', fontWeight: 900, fontSize: '1.25rem', outline: 'none', color: nb.dark, boxSizing: 'border-box', boxShadow: `inset 3px 3px 0px ${nb.dark}15` }}
                                            />
                                        </div>
                                        {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem' }}><i className="fas fa-exclamation-circle" />{error}</p>}
                                    </div>

                                    <button type="submit" disabled={loading || !phone} style={{
                                        width: '100%', padding: '1.25rem',
                                        background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                        color: '#fff', fontWeight: 900, textTransform: 'uppercase',
                                        letterSpacing: '0.2em', fontSize: '0.85rem',
                                        borderRadius: '16px', border: `3px solid ${nb.dark}`,
                                        boxShadow: `4px 4px 0px ${nb.dark}`,
                                        cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
                                        opacity: (loading || !phone) ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseDown={(e) => { if(!loading && phone){ e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = `0px 0px 0px ${nb.dark}` } }}
                                    onMouseUp={(e) => { if(!loading && phone){ e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` } }}
                                    >
                                        {loading ? <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.25rem' }} /> : <><i className="fas fa-bolt" /> Lanjutkan ke Pembayaran</>}
                                    </button>

                                    <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
                                        <Link to="/gaming-area" style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <i className="fas fa-arrow-left" /> Kembali ke Daftar Paket
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GamingCheckout
