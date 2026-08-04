import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const CheckVoucher = () => {
    const [code, setCode] = useState('')
    const [voucher, setVoucher] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showResult, setShowResult] = useState(false)
    const inputRef = useRef(null)

    const handleCheck = async (e) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError('')
        setVoucher(null)
        setShowResult(false)

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/check-voucher`, {
                params: { code: code.trim() }
            })
            setVoucher(response.data)
            setTimeout(() => setShowResult(true), 50)
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat memeriksa voucher.')
            setTimeout(() => setShowResult(true), 50)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setCode('')
        setVoucher(null)
        setError('')
        setShowResult(false)
        inputRef.current?.focus()
    }

    const getStatusInfo = (status) => {
        const map = {
            active: { label: 'Aktif', color: '#10b981', icon: 'check-circle' },
            used: { label: 'Sedang Digunakan', color: '#f59e0b', icon: 'user-clock' },
            expired: { label: 'Kadaluarsa', color: '#ef4444', icon: 'times-circle' },
            unused: { label: 'Belum Digunakan', color: nb.light, icon: 'clock' },
        }
        return map[status] || { label: status, color: '#64748b', icon: 'info-circle' }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        try {
            return new Date(dateStr).toLocaleString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        } catch { return dateStr }
    }

    const formatDuration = (d) => {
        if (!d) return '-'
        if (d.endsWith('h')) return d.replace('h', ' Jam')
        if (d.endsWith('d')) return d.replace('d', ' Hari')
        if (d.endsWith('m')) return d.replace('m', ' Bulan')
        return d
    }

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
                            <i className="fas fa-search" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                            Cek <span style={{ color: nb.light }}>Voucher</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem' }}>Masukkan kode voucher untuk melihat statusnya</p>
                    </div>

                    {/* Search Card */}
                    <div style={{
                        background: '#ffffff', borderRadius: '20px',
                        border: `3px solid ${nb.dark}`,
                        boxShadow: `6px 6px 0px ${nb.dark}`,
                        padding: '2rem', marginBottom: '1.5rem',
                    }}>
                        <form onSubmit={handleCheck}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Kode Voucher</label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="Contoh: ABC123"
                                    style={{
                                        width: '100%', padding: '1rem 1.25rem',
                                        background: '#f8fafc',
                                        border: `3px solid ${nb.dark}`,
                                        borderRadius: '12px',
                                        fontWeight: 800, fontSize: '1.25rem',
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        outline: 'none', textAlign: 'center',
                                        color: nb.dark,
                                        boxSizing: 'border-box',
                                    }}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '1rem',
                                background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                borderRadius: '12px', border: `3px solid ${nb.dark}`,
                                boxShadow: `4px 4px 0px ${nb.dark}`,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                            onMouseDown={(e) => { if (!loading) { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                            >
                                {loading ? <><i className="fas fa-spinner fa-spin" /> Memeriksa...</> : <><i className="fas fa-search" /> Cek Voucher</>}
                            </button>
                        </form>
                    </div>

                    {/* Error */}
                    {showResult && error && (
                        <div style={{
                            background: '#fff', borderRadius: '16px',
                            border: '3px solid #ef4444', boxShadow: '4px 4px 0px #ef4444',
                            padding: '1.5rem', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                        }}>
                            <div style={{ width: '44px', height: '44px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.25rem', flexShrink: 0 }}>
                                <i className="fas fa-times-circle" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {showResult && voucher && (() => {
                        const si = getStatusInfo(voucher.status)
                        return (
                            <div style={{
                                background: '#ffffff', borderRadius: '20px',
                                border: `3px solid ${nb.dark}`,
                                boxShadow: `6px 6px 0px ${nb.dark}`,
                                overflow: 'hidden', marginBottom: '1.5rem',
                            }}>
                                {/* Status Banner */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                    padding: '1.5rem', textAlign: 'center', color: '#fff',
                                }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem',
                                        borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)',
                                        marginBottom: '0.75rem',
                                    }}>
                                        <i className={`fas fa-${si.icon}`} />
                                        <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{si.label}</span>
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                        {voucher.code}
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ padding: '1.5rem' }}>
                                    {[
                                        { label: 'Paket', value: voucher.plan_name || '-', icon: 'wifi' },
                                        { label: 'Durasi', value: formatDuration(voucher.duration), icon: 'clock' },
                                        { label: 'Upload', value: voucher.upload_limit ? `${voucher.upload_limit} Mbps` : '-', icon: 'arrow-up' },
                                        { label: 'Download', value: voucher.download_limit ? `${voucher.download_limit} Mbps` : '-', icon: 'arrow-down' },
                                        { label: 'Harga', value: voucher.price ? `Rp ${Number(voucher.price).toLocaleString('id-ID')}` : '-', icon: 'tag' },
                                        { label: 'Dibuat', value: formatDate(voucher.created_at), icon: 'calendar' },
                                        ...(voucher.used_at ? [{ label: 'Digunakan', value: formatDate(voucher.used_at), icon: 'sign-in-alt' }] : []),
                                        ...(voucher.expires_at ? [{ label: 'Kadaluarsa', value: formatDate(voucher.expires_at), icon: 'hourglass-end' }] : []),
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.85rem 0',
                                            borderBottom: i < 7 ? `2px solid ${nb.dark}15` : 'none',
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                <i className={`fas fa-${item.icon}`} style={{ color: nb.light, width: '16px' }} /> {item.label}
                                            </span>
                                            <span style={{ fontWeight: 900, color: nb.dark, fontSize: '0.8rem' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })()}

                    {/* Reset Button */}
                    {showResult && (
                        <button onClick={handleReset} style={{
                            width: '100%', padding: '0.9rem',
                            background: '#ffffff', color: nb.dark,
                            fontWeight: 800, fontSize: '0.75rem',
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            borderRadius: '12px', border: `3px solid ${nb.dark}`,
                            boxShadow: `4px 4px 0px ${nb.dark}`,
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            marginBottom: '1.5rem',
                        }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                        >
                            <i className="fas fa-redo" /> Cek Voucher Lain
                        </button>
                    )}

                    {/* Back */}
                    <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                        <Link to="/" style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-arrow-left" /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

export default CheckVoucher
