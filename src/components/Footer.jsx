import { Link } from 'react-router-dom'
import { useState } from 'react'

const Footer = () => {
    const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }
    const [showLog, setShowLog] = useState(false)

    const updates = [
        {
            version: 'ND-2.9',
            date: '22 Sep 2026',
            changes: [
                'Perbaikan stabilitas sistem notifikasi WhatsApp',
                'Optimasi kecepatan pengiriman pesan otomatis',
                'Peningkatan keamanan sistem pembayaran',
                'Perbaikan format tampilan informasi voucher',
            ]
        }
    ]

    return (
        <footer style={{ background: '#ffffff', borderTop: `3px solid ${nb.dark}`, padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                        © 2026 ND-NETWORK • POWERED BY <span style={{ color: nb.dark, fontWeight: 500 }}>CODEBYFAREL SOFTWARE</span>
                    </p>

                    <p 
                        onClick={() => setShowLog(!showLog)}
                        style={{ 
                            fontSize: '0.55rem', fontWeight: 800, color: nb.mid, 
                            textTransform: 'uppercase', letterSpacing: '0.15em', 
                            marginBottom: '1rem', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                        }}
                    >
                        <i className={`fas fa-chevron-${showLog ? 'up' : 'down'}`} style={{ fontSize: '0.45rem' }} />
                        Sistem v2.9 — Lihat Pembaruan
                    </p>

                    {showLog && (
                        <div style={{ 
                            textAlign: 'left', maxWidth: '480px', margin: '0 auto 1.5rem',
                            background: '#f8fafc', borderRadius: '12px',
                            border: `2px solid ${nb.dark}`, boxShadow: `3px 3px 0px ${nb.dark}`,
                            padding: '1rem 1.25rem', fontSize: '0.75rem'
                        }}>
                            {updates.map((u, i) => (
                                <div key={u.version} style={{ marginBottom: i < updates.length - 1 ? '1rem' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                        <span style={{ 
                                            background: i === 0 ? nb.mid : '#94a3b8', color: '#fff',
                                            fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem',
                                            borderRadius: '6px', textTransform: 'uppercase'
                                        }}>{u.version}</span>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{u.date}</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#475569', lineHeight: 1.8 }}>
                                        {u.changes.map((c, j) => (
                                            <li key={j} style={{ fontSize: '0.7rem' }}>{c}</li>
                                        ))}
                                    </ul>
                                    {i < updates.length - 1 && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginTop: '0.75rem' }} />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Kebijakan Privasi</Link>
                        <span>•</span>
                        <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Syarat & Ketentuan</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
