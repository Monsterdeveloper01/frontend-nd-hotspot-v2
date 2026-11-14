import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import PublicLayout from '../components/PublicLayout'

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
                if (data.status === 'success') { clearInterval(interval); navigate(`/gaming-success?order_id=${data.external_id}`) }
                else if (data.status === 'expire' || data.status === 'cancel') { clearInterval(interval); setError('Sesi pembayaran berakhir atau dibatalkan.'); setPaymentResult(null) }
            } catch (err) { console.error('Polling error:', err) }
        }, 3000)
    }

    const openQrisInBrowser = (url) => {
        const targetUrl = url || paymentResult?.payment_url || window.location.href
        if (!targetUrl) return
        const isAndroid = /android/i.test(navigator.userAgent)
        if (isAndroid && targetUrl.startsWith('http')) {
            const noProtocol = targetUrl.replace(/^https?:\/\//, '')
            window.location.href = `intent://${noProtocol}#Intent;scheme=https;action=android.intent.action.VIEW;end;`
        } else {
            window.open(targetUrl, '_blank')
        }
    }

    if (!plan) return null

    return (
        <PublicLayout>
            <div style={{ minHeight: '80vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem 5rem' }}>
                <div style={{ width: '100%', maxWidth: '28rem', position: 'relative' }}>
                    
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
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>Pastikan nomor WhatsApp Anda sudah benar. Kode voucher gaming akan otomatis dikirimkan ke nomor ini.</p>
                                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Nomor Tujuan</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', letterSpacing: '0.05em' }}>+62 {phone}</p>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '0.75rem', borderRadius: '12px' }}>
                                        <i className="fas fa-info-circle" style={{ marginTop: '2px' }} />
                                        <span>Pastikan nomor aktif di WhatsApp. Kesalahan nomor bukan tanggung jawab kami.</span>
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
                                    {/* IMPLEMENTASI BARU: Render QRIS secara lokal (Client-Side SVG) dari qr_string.
                                        Anti-Gagal: Tidak butuh koneksi internet ke Midtrans/QRServer, aman dari Walled Garden & Private DNS */}
                                    {paymentResult.qr_string ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <QRCodeSVG
                                                value={paymentResult.qr_string}
                                                size={224}
                                                level="M"
                                                includeMargin={true}
                                                style={{ borderRadius: '12px', background: '#fff' }}
                                            />
                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 800, color: '#00a884' }}>
                                                <i className="fas fa-check-circle" />
                                                <span>QRIS Siap di-Scan</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={paymentResult.payment_url} style={{ width: '14rem', height: '14rem', borderRadius: '12px' }} alt="QR Code" />
                                    )}

                                    {/* FITUR LAMA (DI-COMMENT): Mengambil gambar QR dari server luar Midtrans / QRServer
                                    <img src={paymentResult.payment_url} style={{ width: '14rem', height: '14rem', borderRadius: '12px' }} alt="QR Code"
                                        onError={(e) => { e.target.onerror = null; const qrData = paymentResult.qr_string || paymentResult.payment_url; e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData) }}
                                    />
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <a href={paymentResult.payment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00a884', textDecoration: 'none' }}>
                                            <i className="fas fa-external-link-alt" style={{ marginRight: '4px' }} /> Buka Gambar di Tab Baru
                                        </a>
                                    </div>
                                    */}
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
                                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <i className="fas fa-info-circle" /> QR Tidak Muncul atau Terputus?
                                </p>
                                <p style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                                    Buka langsung kode QRIS di <b>Chrome/Safari</b> (browser utama) untuk menyelesaikan pembayaran.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => openQrisInBrowser(paymentResult?.payment_url)} 
                                        style={{ 
                                            width: '100%', padding: '0.65rem 1rem', background: '#f59e0b', color: '#fff', 
                                            borderRadius: '9999px', border: 'none', fontWeight: 800, fontSize: '0.75rem', 
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)' 
                                        }}
                                    >
                                        <i className="fas fa-external-link-alt" />
                                        <span>Buka QRIS di Chrome / Browser Utama</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => { 
                                            const targetUrl = paymentResult?.payment_url || window.location.href
                                            navigator.clipboard.writeText(targetUrl)
                                            alert('Link QRIS Midtrans berhasil disalin! Silakan tempel di Google Chrome atau Safari.') 
                                        }} 
                                        style={{ 
                                            width: '100%', padding: '0.55rem', background: '#fef3c7', color: '#92400e', 
                                            borderRadius: '9999px', border: '1px solid #f59e0b', fontWeight: 700, fontSize: '0.72rem', 
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' 
                                        }}
                                    >
                                        <i className="fas fa-copy" />
                                        <span>Salin Link QRIS Midtrans</span>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00a884', fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', padding: '0.5rem 1.25rem', borderRadius: '9999px' }} className="animate-pulse">
                                <i className="fas fa-sync fa-spin" /> Menunggu pembayaran...
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                    Batalkan & Kembali
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card-nd-elevated" style={{ borderRadius: '24px', overflow: 'hidden', padding: 0 }}>
                            {/* Card Header */}
                            <div style={{ background: 'linear-gradient(135deg, #00a884, #008f6f)', padding: '2rem', color: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            <i className="fas fa-bolt" /> Prioritas Jaringan
                                        </div>
                                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                                            Setup Voucher Gaming
                                        </h1>
                                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: '0.25rem' }}>
                                            Konfirmasi paket & nomor WhatsApp penerima
                                        </p>
                                    </div>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                                        <i className="fas fa-rocket" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                {/* Plan Details Box */}
                                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e293b', margin: 0 }}>{plan.name}</p>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00a884' }}>
                                                    <i className="fas fa-arrow-up" /> {plan.upload_limit} Mbps
                                                </span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00a884' }}>
                                                    <i className="fas fa-arrow-down" /> {plan.download_limit} Mbps
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#ecfdf5', color: '#00a884',
                                            padding: '0.25rem 0.65rem', borderRadius: '8px',
                                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                                            border: '1px solid #a7f3d0'
                                        }}>
                                            Prioritas
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0.75rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total Biaya</span>
                                        <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00a884' }}>Rp {formatRupiah(plan.price)}</span>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                            Nomor WhatsApp Penerima
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 800, fontSize: '0.95rem' }}>+62</div>
                                            <input 
                                                type="tel" 
                                                id="phoneInput" 
                                                value={phone}
                                                onChange={(e) => { 
                                                    let val = e.target.value.replace(/\D/g, '')
                                                    if (val.startsWith('0')) val = val.substring(1)
                                                    if (val.startsWith('62')) val = val.substring(2)
                                                    setPhone(val) 
                                                }}
                                                required 
                                                placeholder="81234567890" 
                                                inputMode="numeric"
                                                style={{ 
                                                    width: '100%', 
                                                    paddingLeft: '3.5rem', 
                                                    paddingRight: '1rem', 
                                                    paddingTop: '0.85rem', 
                                                    paddingBottom: '0.85rem', 
                                                    background: '#fff', 
                                                    border: '1px solid #cbd5e1', 
                                                    borderRadius: '14px', 
                                                    fontWeight: 700, 
                                                    fontSize: '1.1rem', 
                                                    outline: 'none', 
                                                    color: '#1e293b', 
                                                    boxSizing: 'border-box',
                                                    transition: 'border-color 0.2s ease',
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#00a884'}
                                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                            />
                                        </div>
                                        {error && (
                                            <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                                                <i className="fas fa-exclamation-circle" /> {error}
                                            </p>
                                        )}
                                        <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: 600 }}>
                                            Kode voucher otomatis dikirimkan via WhatsApp setelah pembayaran selesai.
                                        </p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading || !phone} 
                                        className="btn-nd-pill"
                                        style={{
                                            width: '100%', 
                                            padding: '0.95rem',
                                            fontSize: '0.88rem',
                                            cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
                                            opacity: (loading || !phone) ? 0.6 : 1,
                                        }}
                                    >
                                        {loading ? <i className="fas fa-circle-notch fa-spin" /> : <><i className="fas fa-arrow-right" /> Lanjutkan Pembayaran</>}
                                    </button>

                                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                                        <Link to="/gaming-area" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-arrow-left text-xs" /> Kembali ke Zona Kecepatan
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default GamingCheckout
