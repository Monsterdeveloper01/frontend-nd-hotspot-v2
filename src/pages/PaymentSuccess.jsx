import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const PaymentSuccess = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get('order_id')
    
    const [voucher, setVoucher] = useState(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!orderId) { setLoading(false); return }
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher/details?order_id=${orderId}`)
                setVoucher(response.data)
            } catch (err) {
                console.error('Failed to fetch voucher:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchVoucher()
    }, [orderId])

    const formatDuration = (d) => {
        if (!d) return '-'
        if (d.endsWith('h')) return d.replace('h', ' Jam')
        if (d.endsWith('d')) return d.replace('d', ' Hari')
        if (d.endsWith('m')) return d.replace('m', ' Bulan')
        return d
    }

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem 5rem' }}>
                <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
                    {loading ? (
                        <div className="card-nd-elevated" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', border: '4px solid #00a884', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem' }} className="animate-spin" />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Memuat Detail Voucher...</h2>
                        </div>
                    ) : voucher ? (
                        <div className="card-nd-elevated" style={{ overflow: 'visible', position: 'relative' }}>
                            {/* Floating Green Checkmark Badge */}
                            <div style={{
                                position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)',
                                width: '48px', height: '48px', background: '#00a884', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem', color: '#fff', boxShadow: '0 4px 14px rgba(0, 168, 132, 0.4)'
                            }}>
                                <i className="fas fa-check" />
                            </div>

                            {/* Card Header */}
                            <div style={{ background: '#f8fafc', padding: '2.5rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                    Pembayaran Sukses
                                </h1>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00a884', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Ini Kode Akses Internet Anda
                                </p>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                {/* Dashed Voucher Code Box */}
                                <div style={{
                                    background: '#f8fafc', borderRadius: '18px',
                                    border: '2px dashed #00a884', padding: '1.75rem 1.25rem',
                                    textAlign: 'center', marginBottom: '1.75rem'
                                }}>
                                    <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                                        Kode Voucher
                                    </p>
                                    <h2 style={{ fontSize: '2.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '0.12em', fontFamily: 'monospace', lineHeight: 1.1 }}>
                                        {voucher.voucher_code}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(voucher.voucher_code)
                                            setCopied(true)
                                            setTimeout(() => setCopied(false), 2500)
                                        }}
                                        style={{
                                            marginTop: '0.85rem', padding: '0.35rem 0.95rem',
                                            borderRadius: '9999px', background: copied ? '#ecfdf5' : '#ffffff',
                                            border: copied ? '1px solid #00a884' : '1px solid #e2e8f0',
                                            color: copied ? '#00a884' : '#64748b',
                                            fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <i className={copied ? "fas fa-check" : "far fa-copy"} />
                                        <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                                    </button>
                                </div>

                                {/* Plan Details */}
                                <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                            <i className="fas fa-wifi" style={{ color: '#00a884', marginRight: '0.5rem' }} /> Paket
                                        </span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{voucher.plan_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                            <i className="fas fa-clock" style={{ color: '#00a884', marginRight: '0.5rem' }} /> Durasi
                                        </span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{formatDuration(voucher.plan?.duration)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                            <i className="fas fa-tachometer-alt" style={{ color: '#00a884', marginRight: '0.5rem' }} /> Speed
                                        </span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{voucher.plan?.upload_limit}M / {voucher.plan?.download_limit}M</span>
                                    </div>
                                </div>

                                {/* How to Use Guide */}
                                <div style={{ background: '#ecfdf5', borderRadius: '16px', padding: '1.25rem', border: '1px solid #a7f3d0', marginBottom: '1.75rem' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <i className="fas fa-info-circle text-emerald-600" /> Cara Menggunakan:
                                    </h4>
                                    <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.78rem', color: '#065f46', fontWeight: 600, lineHeight: 1.6 }}>
                                        <li>Hubungkan ke WiFi <b>ND-HOTSPOT</b>.</li>
                                        <li>Buka browser, halaman login akan muncul.</li>
                                        <li>Masukkan kode voucher di atas, lalu klik <b>Login</b>.</li>
                                    </ol>
                                </div>

                                {/* Pill Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link 
                                        to="/" 
                                        style={{
                                            flex: 1, padding: '0.95rem',
                                            background: '#ffffff', color: '#475569',
                                            fontWeight: 700, fontSize: '0.88rem', textAlign: 'center',
                                            borderRadius: '9999px', border: '1px solid #e2e8f0',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)', textDecoration: 'none',
                                            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        Selesai
                                    </Link>
                                    <a 
                                        href="http://ndnet.login" 
                                        className="btn-nd-pill"
                                        style={{
                                            flex: 1, padding: '0.95rem',
                                            fontSize: '0.88rem', textAlign: 'center',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <i className="fas fa-sign-in-alt" /> Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-nd-elevated" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                            <div style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem' }}>
                                <i className="fas fa-exclamation-triangle" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>Data Tidak Ditemukan</h2>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Tidak dapat menemukan informasi transaksi untuk order ini.</p>
                            <Link to="/" className="btn-nd-pill" style={{ padding: '0.85rem 1.75rem', fontSize: '0.85rem' }}>
                                Kembali ke Beranda
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default PaymentSuccess
