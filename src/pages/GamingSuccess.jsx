import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const GamingSuccess = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get('order_id')
    
    const [voucher, setVoucher] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) { setLoading(false); return }
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher-by-order/${orderId}`)
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
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                {loading ? (
                    <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, padding: '5rem 2rem', textAlign: 'center', boxShadow: `8px 8px 0px ${nb.dark}` }}>
                        <div style={{ width: '48px', height: '48px', border: `4px solid ${nb.dark}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem' }} className="animate-spin" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mengesahkan Koneksi...</h2>
                    </div>
                ) : voucher ? (
                    <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `10px 10px 0px ${nb.dark}`, overflow: 'hidden' }}>
                        <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '3rem 2rem 2.5rem', textAlign: 'center', color: '#fff', position: 'relative', borderBottom: `3px solid ${nb.dark}` }}>
                            <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', width: '56px', height: '56px', background: '#10b981', borderRadius: '16px', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', boxShadow: `4px 4px 0px ${nb.dark}` }}>
                                <i className="fas fa-check-double" />
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: '0.5rem', lineHeight: 1 }}>Otorisasi Berhasil</h1>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>Jalur Prioritas Anda Telah Aktif</p>
                        </div>

                        <div style={{ padding: '2.5rem' }}>
                            <div style={{ background: '#0e4696', borderRadius: '20px', padding: '2rem', textAlign: 'center', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <p style={{ color: nb.light, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>Kode Akses</p>
                                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', letterSpacing: '0.15em', fontFamily: 'monospace', textShadow: `4px 4px 0px ${nb.dark}` }}>
                                        {voucher.code}
                                    </h2>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: `3px solid ${nb.dark}`, textAlign: 'center' }}>
                                    <i className="fas fa-rocket" style={{ color: nb.mid, fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profil</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: nb.dark }}>{voucher.plan_name}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: `3px solid ${nb.dark}`, textAlign: 'center' }}>
                                    <i className="fas fa-stopwatch" style={{ color: nb.mid, fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Durasi</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: nb.dark }}>{formatDuration(voucher.duration)}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: `3px solid ${nb.dark}`, textAlign: 'center' }}>
                                    <i className="fas fa-arrow-up" style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Upload</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: nb.dark }}>{voucher.upload_limit} Mbps</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: `3px solid ${nb.dark}`, textAlign: 'center' }}>
                                    <i className="fas fa-arrow-down" style={{ color: nb.mid, fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Download</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: nb.dark }}>{voucher.download_limit} Mbps</p>
                                </div>
                            </div>

                            <Link to="/gaming-area" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                width: '100%', padding: '1.25rem',
                                background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                color: '#fff', fontWeight: 900, textTransform: 'uppercase',
                                letterSpacing: '0.2em', fontSize: '0.85rem', textAlign: 'center',
                                borderRadius: '16px', border: `3px solid ${nb.dark}`,
                                boxShadow: `6px 6px 0px ${nb.dark}`, textDecoration: 'none',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(6px, 6px)'; e.currentTarget.style.boxShadow = `0px 0px 0px ${nb.dark}` }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${nb.dark}` }}
                            >
                                <i className="fas fa-bolt" /> Mulai Koneksi
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, padding: '4rem 2rem', textAlign: 'center', boxShadow: `8px 8px 0px ${nb.dark}` }}>
                        <div style={{ width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                            <i className="fas fa-exclamation-triangle" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Data Tidak Ditemukan</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}>Voucher tidak dapat ditemukan atau sesi salah.</p>
                        <Link to="/gaming-area" style={{ padding: '1rem 2rem', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', borderRadius: '12px', border: `3px solid ${nb.dark}`, boxShadow: `4px 4px 0px ${nb.dark}`, textDecoration: 'none', display: 'inline-block' }}>Kembali</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GamingSuccess
