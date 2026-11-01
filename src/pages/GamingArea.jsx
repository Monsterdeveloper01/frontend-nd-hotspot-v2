import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const GamingArea = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher-plans?is_gaming=true`)
                setPlans(response.data)
            } catch (err) {
                console.error('Failed to fetch gaming plans')
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    return (
        <PublicLayout>
            <div style={{ minHeight: '80vh', padding: '2rem 1rem 5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                {/* Breadcrumb / Back button */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1.1rem',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '9999px',
                            color: '#00a884',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <i className="fas fa-arrow-left text-xs" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 3.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        background: '#ecfdf5',
                        color: '#00a884',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        boxShadow: '0 2px 8px rgba(0, 168, 132, 0.12)'
                    }}>
                        <i className="fas fa-bolt" /> PRIORITAS JARINGAN • ZONA KECEPATAN
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
                        fontWeight: 900,
                        color: '#1e293b',
                        lineHeight: 1.15,
                        letterSpacing: '-0.03em',
                        marginBottom: '1rem',
                    }}>
                        Zona <span style={{ color: '#00a884' }}>Kecepatan & Gaming</span>
                    </h1>

                    <p style={{
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        marginBottom: '1.75rem',
                    }}>
                        Streaming video tanpa buffering, push rank tanpa lag, dan live streaming tanpa gangguan dengan alokasi bandwidth prioritas tinggi.
                    </p>

                    {/* Tag Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                        {[
                            { icon: 'play-circle', label: 'YouTube 4K', color: '#ef4444' },
                            { icon: 'gamepad', label: 'Low Latency Gaming', color: '#8b5cf6' },
                            { icon: 'video', label: 'Live Streaming', color: '#0284c7' },
                            { icon: 'bolt', label: 'Turbo Speed', color: '#00a884' },
                        ].map((tag) => (
                            <div key={tag.label} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '9999px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                            }}>
                                <i className={`fas fa-${tag.icon}`} style={{ color: tag.color }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{tag.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="flex flex-wrap justify-center gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="card-nd-elevated w-full max-w-[360px]" style={{ height: '24rem', borderRadius: '24px', background: '#f8fafc' }} />
                        ))
                    ) : plans.length > 0 ? (
                        plans.map((plan) => {
                            const durationLabel = plan.duration.endsWith('h') 
                                ? plan.duration.replace('h', ' Jam') 
                                : plan.duration.endsWith('d') 
                                ? plan.duration.replace('d', ' Hari') 
                                : plan.duration.replace('m', ' Bulan')

                            return (
                                <div
                                    key={plan.id}
                                    className="card-nd-elevated w-full max-w-[360px]"
                                    style={{
                                        borderRadius: '24px',
                                        padding: '2rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                    }}
                                >
                                    {/* Top Row: Icon & Priority Badge */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            background: '#ecfdf5',
                                            color: '#00a884',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.4rem',
                                            boxShadow: '0 4px 12px rgba(0, 168, 132, 0.15)',
                                        }}>
                                            <i className="fas fa-rocket" />
                                        </div>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            background: '#ecfdf5',
                                            color: '#00a884',
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.68rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            border: '1px solid #a7f3d0'
                                        }}>
                                            <i className="fas fa-bolt text-xs" /> Priority High
                                        </div>
                                    </div>

                                    {/* Plan Title */}
                                    <h3 style={{
                                        fontSize: '1.45rem',
                                        fontWeight: 900,
                                        color: '#1e293b',
                                        letterSpacing: '-0.02em',
                                        marginBottom: '0.5rem',
                                    }}>
                                        {plan.name}
                                    </h3>

                                    {/* Price & Duration */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#00a884', letterSpacing: '-0.02em' }}>
                                            Rp {Number(plan.price).toLocaleString('id-ID')}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem' }}>
                                            / {durationLabel} Unlimited
                                        </span>
                                    </div>

                                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 1.5rem' }} />

                                    {/* Speed Specifications */}
                                    <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                <i className="fas fa-arrow-up" style={{ color: '#00a884' }} /> Upload
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e293b' }}>
                                                {plan.upload_limit} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mbps</span>
                                            </span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                <i className="fas fa-arrow-down" style={{ color: '#00a884' }} /> Download
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e293b' }}>
                                                {plan.download_limit} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mbps</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Feature List */}
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                                            <span>Jalur khusus anti-lag</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                                            <span>Masa aktif {durationLabel}</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                                            <span>Akses instan QRIS WhatsApp</span>
                                        </li>
                                    </ul>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => navigate('/gaming-checkout', { state: { plan } })}
                                        className="btn-nd-pill"
                                        style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '0.88rem' }}
                                    >
                                        <i className="fas fa-shopping-cart" /> Beli Sekarang
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <div className="card-nd-elevated text-center" style={{ width: '100%', maxWidth: '480px', padding: '4rem 2rem', borderRadius: '24px' }}>
                            <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#00a884', fontSize: '1.75rem' }}>
                                <i className="fas fa-box-open" />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>Belum Ada Paket Tersedia</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>Paket zona gaming sedang disiapkan oleh admin.</p>
                            <Link to="/" className="btn-nd-pill" style={{ display: 'inline-flex', padding: '0.75rem 1.75rem', fontSize: '0.82rem' }}>
                                Lihat Paket Reguler
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}

export default GamingArea
