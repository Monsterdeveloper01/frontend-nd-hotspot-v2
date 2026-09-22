import { useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

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
            active: { label: 'Aktif', color: '#00a884', bg: '#ecfdf5', icon: 'check-circle' },
            used: { label: 'Sedang Digunakan', color: '#f59e0b', bg: '#fffbeb', icon: 'user-clock' },
            expired: { label: 'Kadaluarsa', color: '#ef4444', bg: '#fef2f2', icon: 'times-circle' },
            unused: { label: 'Belum Digunakan', color: '#0ea5e9', bg: '#f0f9ff', icon: 'clock' },
        }
        return map[status] || { label: status, color: '#64748b', bg: '#f1f5f9', icon: 'info-circle' }
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
                            <i className="fas fa-search" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            Cek <span style={{ color: '#00a884' }}>Voucher</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.35rem' }}>
                            Masukkan kode voucher untuk melihat status dan masa aktifnya
                        </p>
                    </div>

                    {/* Elevated Search Card */}
                    <div className="card-nd-elevated" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                        <form onSubmit={handleCheck}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    Kode Voucher
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="Contoh: ABC123"
                                    style={{
                                        width: '100%', padding: '0.9rem 1.25rem',
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '14px',
                                        fontWeight: 900, fontSize: '1.25rem',
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        outline: 'none', textAlign: 'center',
                                        color: '#1e293b',
                                        boxSizing: 'border-box',
                                    }}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="btn-nd-pill" 
                                style={{
                                    width: '100%', padding: '0.95rem',
                                    fontSize: '0.9rem',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin" /> Memeriksa...</>
                                ) : (
                                    <><i className="fas fa-search" /> Cek Voucher</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Error */}
                    {showResult && error && (
                        <div className="card-nd-elevated" style={{
                            padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            border: '1px solid #fecaca', background: '#fef2f2'
                        }}>
                            <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.2rem', flexShrink: 0 }}>
                                <i className="fas fa-times-circle" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {showResult && voucher && (() => {
                        const si = getStatusInfo(voucher.status)
                        return (
                            <div className="card-nd-elevated" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                                {/* Status Banner */}
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '1.75rem', textAlign: 'center',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        background: si.bg, color: si.color, padding: '0.35rem 0.9rem',
                                        borderRadius: '9999px',
                                        marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.75rem'
                                    }}>
                                        <i className={`fas fa-${si.icon}`} />
                                        <span>{si.label}</span>
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '0.15em', color: '#1e293b' }}>
                                        {voucher.code}
                                    </div>
                                </div>

                                {/* Details List */}
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
                                            borderBottom: i < 7 ? '1px solid #f1f5f9' : 'none',
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                                <i className={`fas fa-${item.icon}`} style={{ color: '#00a884', width: '16px' }} /> {item.label}
                                            </span>
                                            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })()}

                    {/* Reset Button */}
                    {showResult && (
                        <button 
                            onClick={handleReset} 
                            style={{
                                width: '100%', padding: '0.85rem',
                                background: '#ffffff', color: '#475569',
                                fontWeight: 700, fontSize: '0.85rem',
                                borderRadius: '9999px', border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <i className="fas fa-redo" /> Cek Voucher Lain
                        </button>
                    )}

                    {/* Back */}
                    <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                        <Link to="/" style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-arrow-left" /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

export default CheckVoucher
