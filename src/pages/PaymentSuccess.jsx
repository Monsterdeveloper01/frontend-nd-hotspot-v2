import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const PaymentSuccess = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get('order_id')
    
    const [voucher, setVoucher] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) { setLoading(false); return }
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher/details?order_id=${orderId}`)
                setVoucher(response.data.voucher)
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
            <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '3rem 1rem' }}>
                <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
                    {loading ? (
                        <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, padding: '4rem 2rem', textAlign: 'center', boxShadow: `8px 8px 0px ${nb.dark}` }}>
                            <div style={{ width: '48px', height: '48px', border: `4px solid ${nb.dark}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem' }} className="animate-spin" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase' }}>Memuat Detail...</h2>
                        </div>
                    ) : voucher ? (
                        <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `8px 8px 0px ${nb.dark}`, overflow: 'hidden' }}>
                            <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '2.5rem 2rem 2rem', textAlign: 'center', color: '#fff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '48px', background: '#10b981', borderRadius: '50%', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#fff', boxShadow: `2px 2px 0px ${nb.dark}` }}>
                                    <i className="fas fa-check" />
                                </div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Pembayaran Sukses</h1>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>Ini Kode Akses Internet Anda</p>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ background: '#f8fafc', borderRadius: '16px', border: `3px dashed ${nb.dark}`, padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Kode Voucher</p>
                                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: nb.dark, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                                        {voucher.code}
                                    </h2>
                                </div>

                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `2px solid ${nb.dark}15` }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}><i className="fas fa-wifi" style={{ color: nb.mid, marginRight: '0.5rem' }} /> Paket</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: nb.dark }}>{voucher.plan_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `2px solid ${nb.dark}15` }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}><i className="fas fa-clock" style={{ color: nb.mid, marginRight: '0.5rem' }} /> Durasi</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: nb.dark }}>{formatDuration(voucher.duration)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}><i className="fas fa-tachometer-alt" style={{ color: nb.mid, marginRight: '0.5rem' }} /> Speed</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: nb.dark }}>{voucher.upload_limit}M / {voucher.download_limit}M</span>
                                    </div>
                                </div>

                                <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', border: `2px solid ${nb.light}30`, marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-info-circle" /> Cara Menggunakan:
                                    </h4>
                                    <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.75rem', color: '#475569', fontWeight: 600, lineHeight: 1.6 }}>
                                        <li>Hubungkan ke WiFi <b>ND-HOTSPOT</b>.</li>
                                        <li>Buka browser, halaman login akan muncul.</li>
                                        <li>Masukkan kode voucher di atas, lalu klik <b>Login</b>.</li>
                                    </ol>
                                </div>

                                <Link to="/" style={{
                                    display: 'block', width: '100%', padding: '1.25rem',
                                    background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                    color: '#fff', fontWeight: 900, textTransform: 'uppercase',
                                    letterSpacing: '0.15em', fontSize: '0.85rem', textAlign: 'center',
                                    borderRadius: '16px', border: `3px solid ${nb.dark}`,
                                    boxShadow: `4px 4px 0px ${nb.dark}`, textDecoration: 'none',
                                }}
                                onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = `0px 0px 0px ${nb.dark}` }}
                                onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                                >
                                    Selesai
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, padding: '4rem 2rem', textAlign: 'center', boxShadow: `8px 8px 0px ${nb.dark}` }}>
                            <div style={{ width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                                <i className="fas fa-exclamation-triangle" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Data Tidak Ditemukan</h2>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}>Voucher tidak dapat ditemukan atau order ID salah.</p>
                            <Link to="/" style={{ padding: '1rem 2rem', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', borderRadius: '12px', border: `3px solid ${nb.dark}`, boxShadow: `3px 3px 0px ${nb.dark}`, textDecoration: 'none', display: 'inline-block' }}>Kembali</Link>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default PaymentSuccess
