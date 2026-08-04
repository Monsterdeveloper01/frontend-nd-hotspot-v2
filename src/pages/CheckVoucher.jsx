import { useState, useRef, useEffect } from 'react'
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
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setVoucher(null)
        setShowResult(false)
        setCode('')
        setError('')
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

    const getStatusConfig = (status) => {
        switch (status) {
            case 'available':
                return { label: 'Tersedia', icon: 'check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' }
            case 'used':
                return { label: 'Sedang Aktif', icon: 'bolt', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' }
            case 'sold':
                return { label: 'Terjual', icon: 'shopping-cart', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' }
            case 'expired':
                return { label: 'Kedaluwarsa', icon: 'clock', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' }
            default:
                return { label: status, icon: 'question-circle', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' }
        }
    }

    const formatPrice = (price) => {
        if (!price) return '-'
        return 'Rp ' + Number(price).toLocaleString('id-ID')
    }

    const statusConfig = voucher ? getStatusConfig(voucher.status) : null

    return (
        <PublicLayout>
            <style>{`
                @keyframes cvSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes cvPulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.15); }
                    50% { box-shadow: 0 0 40px rgba(124,58,237,0.3); }
                }
                @keyframes cvShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes cvFadeScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes cvProgressFill {
                    from { width: 0%; }
                    to { width: var(--target-width); }
                }
                @keyframes cvFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                .cv-slide-up { animation: cvSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
                .cv-slide-up-delay1 { animation: cvSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
                .cv-slide-up-delay2 { animation: cvSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
                .cv-slide-up-delay3 { animation: cvSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
                .cv-fade-scale { animation: cvFadeScale 0.5s cubic-bezier(0.16,1,0.3,1) both; }
                .cv-glow { animation: cvPulseGlow 3s ease-in-out infinite; }
                .cv-float { animation: cvFloat 3s ease-in-out infinite; }
                .cv-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: cvShimmer 2s linear infinite;
                }
                .cv-glass {
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .cv-input-focus:focus {
                    border-color: #7c3aed;
                    box-shadow: 0 0 0 4px rgba(124,58,237,0.1), 0 4px 20px rgba(124,58,237,0.15);
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f0fb 50%, #ede9fe 100%)',
                paddingTop: '2rem',
                paddingBottom: '4rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
            }}>
                {/* Decorative background elements */}
                <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* Header */}
                    <div className="cv-slide-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="cv-float" style={{
                            display: 'inline-flex',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
                            borderRadius: '28px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#fff',
                            marginBottom: '1.25rem',
                            boxShadow: '0 20px 40px rgba(124,58,237,0.25)',
                            transform: 'rotate(-6deg)',
                        }}>
                            <FaIcon name="ticket-alt" />
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: '#0f172a',
                            letterSpacing: '-0.04em',
                            margin: '0 0 0.5rem 0',
                            lineHeight: 1.1,
                        }}>
                            Cek <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Voucher</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                            Masukkan kode voucher untuk melihat detail & sisa waktu
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="cv-slide-up-delay1 cv-glass cv-glow" style={{
                        borderRadius: '28px',
                        border: '1px solid rgba(255,255,255,0.8)',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
                    }}>
                        <form onSubmit={handleCheck}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                marginBottom: '0.75rem',
                                marginLeft: '0.25rem',
                            }}>
                                <FaIcon name="keyboard" className="" /> Masukkan Kode Voucher
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="CONTOH: ND1234"
                                    className="cv-input-focus"
                                    style={{
                                        width: '100%',
                                        padding: '1.1rem 4rem 1.1rem 1.25rem',
                                        background: 'rgba(248,250,252,0.8)',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        fontWeight: 800,
                                        fontSize: '1.15rem',
                                        letterSpacing: '0.08em',
                                        color: '#0f172a',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        boxSizing: 'border-box',
                                    }}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '8px',
                                        bottom: '8px',
                                        width: '48px',
                                        background: loading ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: loading ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                                    }}
                                >
                                    {loading ? <FaIcon name="circle-notch" className="fa-spin" /> : <FaIcon name="search" />}
                                </button>
                            </div>
                        </form>

                        {/* Error message */}
                        {error && (
                            <div className="cv-fade-scale" style={{
                                marginTop: '1rem',
                                padding: '1rem 1.25rem',
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.15)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '12px',
                                    background: 'rgba(239,68,68,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    color: '#ef4444',
                                    fontSize: '1rem',
                                }}>
                                    <FaIcon name="exclamation-triangle" />
                                </div>
                                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700 }}>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Result Card */}
                    {voucher && showResult && (
                        <div className="cv-slide-up-delay2" style={{ marginBottom: '1.5rem' }}>
                            {/* Main Result Card */}
                            <div className="cv-glass" style={{
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.8)',
                                overflow: 'hidden',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
                            }}>
                                {/* Status Banner */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${statusConfig.color}, ${statusConfig.color}dd)`,
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    <div className="cv-shimmer" style={{ position: 'absolute', inset: 0 }} />
                                    <FaIcon name={statusConfig.icon} className="" style={{ color: '#fff', fontSize: '0.8rem' }} />
                                    <span style={{
                                        color: '#fff',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.25em',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}>
                                        {statusConfig.label}
                                    </span>
                                    {voucher.is_gaming && (
                                        <span style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            color: '#fff',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '99px',
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            position: 'relative',
                                            zIndex: 1,
                                        }}>
                                            <FaIcon name="gamepad" /> GAMING
                                        </span>
                                    )}
                                </div>

                                {/* Voucher Code Display */}
                                <div style={{ padding: '2rem 2rem 0', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                                        Kode Voucher
                                    </p>
                                    <div style={{
                                        display: 'inline-block',
                                        background: 'rgba(248,250,252,0.8)',
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: '16px',
                                        padding: '0.75rem 2rem',
                                        marginBottom: '1.5rem',
                                    }}>
                                        <span style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 900,
                                            color: '#0f172a',
                                            letterSpacing: '0.15em',
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        }}>
                                            {voucher.code}
                                        </span>
                                    </div>
                                </div>

                                {/* Time Left Section (for active vouchers) */}
                                {voucher.status === 'used' && voucher.time_left && (
                                    <div style={{ padding: '0 2rem 1.5rem' }}>
                                        <div style={{
                                            background: voucher.time_left === 'Expired'
                                                ? 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.1))'
                                                : 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(124,58,237,0.08))',
                                            borderRadius: '20px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            border: voucher.time_left === 'Expired'
                                                ? '1px solid rgba(239,68,68,0.15)'
                                                : '1px solid rgba(124,58,237,0.1)',
                                        }}>
                                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                                                {voucher.time_left === 'Expired' ? 'Waktu Habis' : 'Sisa Waktu'}
                                            </p>
                                            <div style={{
                                                fontSize: voucher.time_left === 'Expired' ? '1.5rem' : '1.75rem',
                                                fontWeight: 900,
                                                color: voucher.time_left === 'Expired' ? '#ef4444' : '#0f172a',
                                                letterSpacing: '-0.02em',
                                                marginBottom: '1rem',
                                            }}>
                                                {voucher.time_left === 'Expired' ? (
                                                    <span><FaIcon name="times-circle" style={{ marginRight: '0.5rem' }} />Expired</span>
                                                ) : (
                                                    voucher.time_left
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            {voucher.time_percentage !== null && (
                                                <div>
                                                    <div style={{
                                                        height: '8px',
                                                        background: '#e2e8f0',
                                                        borderRadius: '99px',
                                                        overflow: 'hidden',
                                                        marginBottom: '0.5rem',
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${Math.min(voucher.time_percentage, 100)}%`,
                                                            background: voucher.time_percentage >= 90
                                                                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                                                : voucher.time_percentage >= 70
                                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                                : 'linear-gradient(90deg, #3b82f6, #818cf8, #a855f7)',
                                                            borderRadius: '99px',
                                                            transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)',
                                                        }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8' }}>
                                                        <span>Terpakai</span>
                                                        <span>{Math.min(Math.round(voucher.time_percentage), 100)}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Detail Info Grid */}
                                <div style={{ padding: '0 2rem 1.5rem' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '0.75rem',
                                    }}>
                                        {/* Paket */}
                                        <InfoTile
                                            icon="layer-group"
                                            label="Paket"
                                            value={voucher.plan_name}
                                            color="#7c3aed"
                                        />
                                        {/* Harga */}
                                        <InfoTile
                                            icon="tag"
                                            label="Harga"
                                            value={formatPrice(voucher.price)}
                                            color="#10b981"
                                        />
                                        {/* Durasi */}
                                        <InfoTile
                                            icon="hourglass-half"
                                            label="Durasi Paket"
                                            value={voucher.duration || '-'}
                                            color="#3b82f6"
                                        />
                                        {/* Speed */}
                                        <InfoTile
                                            icon="tachometer-alt"
                                            label="Speed"
                                            value={voucher.speed_limit || '-'}
                                            color="#f59e0b"
                                        />
                                        {/* Upload */}
                                        <InfoTile
                                            icon="arrow-up"
                                            label="Upload"
                                            value={voucher.upload_limit || '-'}
                                            color="#06b6d4"
                                        />
                                        {/* Download */}
                                        <InfoTile
                                            icon="arrow-down"
                                            label="Download"
                                            value={voucher.download_limit || '-'}
                                            color="#8b5cf6"
                                        />
                                        {/* Shared Users */}
                                        {voucher.shared_users && (
                                            <InfoTile
                                                icon="users"
                                                label="Shared Users"
                                                value={`${voucher.shared_users} Perangkat`}
                                                color="#ec4899"
                                            />
                                        )}
                                        {/* MAC Address */}
                                        {voucher.mac_address && (
                                            <InfoTile
                                                icon="network-wired"
                                                label="MAC Address"
                                                value={voucher.mac_address}
                                                color="#64748b"
                                                small
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Timeline: Mulai - Berakhir */}
                                {(voucher.used_at || voucher.expires_at) && (
                                    <div style={{ padding: '0 2rem 2rem' }}>
                                        <div style={{
                                            background: '#f8fafc',
                                            borderRadius: '20px',
                                            padding: '1.25rem',
                                            border: '1px solid #f1f5f9',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'stretch', gap: '1rem' }}>
                                                {/* Timeline line */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: '0.15rem' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid #d1fae5', flexShrink: 0 }} />
                                                    <div style={{ width: '2px', flex: 1, background: 'linear-gradient(180deg, #10b981, #e2e8f0, #ef4444)', borderRadius: '99px' }} />
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: voucher.time_left === 'Expired' ? '#ef4444' : '#e2e8f0', border: `2px solid ${voucher.time_left === 'Expired' ? '#fecaca' : '#f1f5f9'}`, flexShrink: 0 }} />
                                                </div>
                                                {/* Content */}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                                                    <div>
                                                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.15rem' }}>Mulai Digunakan</p>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{voucher.used_at || 'Belum digunakan'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.15rem' }}>Berakhir Pada</p>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: voucher.time_left === 'Expired' ? '#ef4444' : '#0f172a' }}>
                                                            {voucher.expires_at || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Created at */}
                                {voucher.created_at && voucher.status === 'available' && (
                                    <div style={{ padding: '0 2rem 2rem', textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>
                                            <FaIcon name="calendar-plus" style={{ marginRight: '0.35rem' }} />
                                            Dibuat pada {voucher.created_at}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={resetForm}
                                className="cv-slide-up-delay3"
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    background: '#0f172a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '18px',
                                    fontWeight: 900,
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    cursor: 'pointer',
                                    marginTop: '1rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)' }}
                            >
                                <FaIcon name="redo-alt" /> Cek Voucher Lain
                            </button>
                        </div>
                    )}

                    {/* Back Link */}
                    <div className="cv-slide-up-delay3" style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link
                            to="/"
                            style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                textDecoration: 'none',
                                transition: 'color 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                            <FaIcon name="arrow-left" /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

/* Reusable Info Tile Component */
const InfoTile = ({ icon, label, value, color, small = false }) => (
    <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid #f1f5f9',
        transition: 'all 0.3s ease',
    }}
    onMouseOver={(e) => { e.currentTarget.style.borderColor = color + '30'; e.currentTarget.style.background = color + '08' }}
    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc' }}
    >
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.5rem',
        }}>
            <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '7px',
                background: color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontSize: '0.6rem',
                flexShrink: 0,
            }}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {label}
            </span>
        </div>
        <p style={{
            fontSize: small ? '0.7rem' : '0.85rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: 0,
            wordBreak: 'break-all',
        }}>
            {value}
        </p>
    </div>
)

export default CheckVoucher
