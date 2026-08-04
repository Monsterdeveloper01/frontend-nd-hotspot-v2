import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

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
        <div style={{ minHeight: '100vh', background: '#ffffff', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Navbar */}
                <nav style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '42px', height: '42px',
                            background: '#ffffff', border: `3px solid ${nb.dark}`,
                            borderRadius: '12px', boxShadow: `3px 3px 0px ${nb.dark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <i className="fas fa-arrow-left" style={{ fontSize: '0.85rem', color: nb.dark }} />
                        </div>
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem', color: '#64748b' }}>Kembali</span>
                    </Link>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: '#ffffff', padding: '0.5rem 1rem',
                        border: `2px solid ${nb.dark}`, borderRadius: '8px',
                        boxShadow: `3px 3px 0px ${nb.dark}`,
                    }}>
                        <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} className="animate-pulse" />
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.6rem', color: '#10b981' }}>Servers Online</span>
                    </div>
                </nav>

                {/* Hero */}
                <header style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }} className="text-center lg:text-left">
                    <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: '1.5rem', color: nb.dark, lineHeight: 0.95 }}>
                        Zona <span style={{ color: nb.light }}>Kecepatan</span>
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 700, fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.7 }}>
                        Streaming YouTube tanpa buffering, push rank tanpa lag, dan live streaming tanpa gangguan. Bandwidth prioritas untuk semua aktivitas online Anda.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }} className="justify-center lg:justify-start">
                        {[
                            { icon: 'play-circle', label: 'YouTube', color: '#ef4444' },
                            { icon: 'gamepad', label: 'Gaming', color: '#8b5cf6' },
                            { icon: 'video', label: 'Live Stream', color: nb.light },
                            { icon: 'bolt', label: 'Turbo Speed', color: '#f59e0b' },
                        ].map((tag) => (
                            <div key={tag.label} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.5rem 0.85rem', background: '#fff',
                                border: `2px solid ${nb.dark}`, borderRadius: '8px',
                                boxShadow: `2px 2px 0px ${nb.dark}`,
                            }}>
                                <i className={`fas fa-${tag.icon}`} style={{ color: tag.color, fontSize: '0.75rem' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tag.label}</span>
                            </div>
                        ))}
                    </div>
                </header>

                {/* Plans Grid */}
                <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem 5rem' }}>
                    <div className="flex flex-wrap justify-center gap-8">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '100%', maxWidth: '380px', height: '24rem',
                                    background: '#f1f5f9', border: `3px solid ${nb.dark}`,
                                    borderRadius: '24px', boxShadow: `6px 6px 0px ${nb.dark}`,
                                }} className="animate-pulse" />
                            ))
                        ) : plans.length > 0 ? plans.map((plan) => (
                            <div key={plan.id} style={{
                                width: '100%', maxWidth: '380px',
                                background: '#ffffff',
                                border: `3px solid ${nb.dark}`,
                                borderRadius: '24px',
                                boxShadow: `6px 6px 0px ${nb.dark}`,
                                padding: '2.5rem',
                                transition: 'all 0.2s ease',
                                position: 'relative', overflow: 'hidden',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = `9px 9px 0px ${nb.dark}` }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${nb.dark}` }}
                            >
                                {/* Top bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: `linear-gradient(90deg, ${nb.mid}, ${nb.light})` }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px',
                                        background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                        borderRadius: '16px', border: `2px solid ${nb.dark}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '1.5rem',
                                    }}>
                                        <i className="fas fa-rocket" />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Level Akses</span>
                                        <span style={{ color: nb.light, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Priority</span>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', marginBottom: '0.5rem', color: nb.dark }}>{plan.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: nb.dark }}>Rp {Number(plan.price).toLocaleString()}</span>
                                    <span style={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.1em' }}>/ {plan.duration.endsWith('h') ? plan.duration.replace('h', ' Jam') : plan.duration.endsWith('d') ? plan.duration.replace('d', ' Hari') : plan.duration.replace('m', ' Bulan')} UNLIMITED</span>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: '12px', border: `2px solid ${nb.dark}20`, marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                                            <i className="fas fa-microchip" style={{ color: nb.light }} /> Prioritas
                                        </div>
                                        <span style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', color: nb.dark }}>Sangat Tinggi</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: `2px solid ${nb.dark}20` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.5rem', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
                                                <i className="fas fa-arrow-up" style={{ color: '#10b981' }} /> Upload
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: '0.75rem', color: nb.dark }}>{plan.upload_limit} <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Mbps</span></span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: `2px solid ${nb.dark}20` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.5rem', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
                                                <i className="fas fa-arrow-down" style={{ color: nb.light }} /> Download
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: '0.75rem', color: nb.dark }}>{plan.download_limit} <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Mbps</span></span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/gaming-checkout', { state: { plan } })}
                                    style={{
                                        width: '100%', padding: '1.1rem',
                                        background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                        color: '#fff', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem',
                                        borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                        boxShadow: `4px 4px 0px ${nb.dark}`,
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                    onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}
                                    onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${nb.dark}` }}
                                >
                                    Beli Sekarang
                                </button>
                            </div>
                        )) : (
                            <div style={{
                                width: '100%', padding: '5rem 2rem', textAlign: 'center',
                                border: `3px dashed ${nb.dark}`, borderRadius: '24px',
                                background: '#ffffff',
                            }}>
                                <i className="fas fa-box-open" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }} />
                                <p style={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Belum ada paket tersedia</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', borderTop: `3px solid ${nb.dark}`, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>© 2026 ND-Hotspot • Zona Kecepatan v2.0</p>
                </footer>
            </div>
        </div>
    )
}

export default GamingArea
